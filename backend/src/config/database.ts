import dotenv from 'dotenv';
import path from 'path';
import { Pool as PgPool, PoolClient } from 'pg';
import mysql, { Pool as MysqlPool } from 'mysql2/promise';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_SUPABASE_URL =
  'postgresql://postgres.ktbltkagspmzwxaoyaha:5mcHBvnk3qG7BVnG@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

function translatePgQuery(sql: string, params: any[] = []): { sql: string; params: any[]; isInsert: boolean } {
  let paramIdx = 1;
  let translatedSql = sql.replace(/\?/g, () => `$${paramIdx++}`);

  // Replace MySQL CURDATE() -> Postgres CURRENT_DATE
  translatedSql = translatedSql.replace(/\bCURDATE\(\)/gi, 'CURRENT_DATE');

  // Replace MySQL DATE_SUB(date, INTERVAL N DAY) -> (date - INTERVAL 'N days')
  translatedSql = translatedSql.replace(/DATE_SUB\s*\(\s*([^,]+?)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "($1 - INTERVAL '$2 days')");

  // Replace remaining MySQL INTERVAL N DAY -> Postgres INTERVAL 'N days'
  translatedSql = translatedSql.replace(/INTERVAL\s+(\d+)\s+DAY/gi, "INTERVAL '$1 days'");

  const isInsert = /^\s*INSERT\s+INTO\s+/i.test(translatedSql);
  if (isInsert && !/RETURNING\s+/i.test(translatedSql)) {
    translatedSql += ' RETURNING id';
  }

  return { sql: translatedSql, params, isInsert };
}

function normalizeCountFields(rows: any[]): any[] {
  if (!Array.isArray(rows)) return rows;
  return rows.map((row: any) => {
    if (!row || typeof row !== 'object') return row;
    const copy = { ...row };
    for (const key of Object.keys(copy)) {
      if (
        (key === 'total' || key === 'today' || key === 'this_week' || key === 'this_month' || key === 'count' || key === 'thisWeek' || key === 'thisMonth') &&
        typeof copy[key] === 'string' &&
        /^\d+$/.test(copy[key])
      ) {
        copy[key] = parseInt(copy[key], 10);
      }
    }
    return copy;
  });
}

function formatPgResult(res: any, isInsert: boolean) {
  if (Array.isArray(res)) {
    res = res[res.length - 1] || {};
  }
  if (!res) return [[], []];

  if (isInsert) {
    const insertId = res.rows && res.rows[0] && res.rows[0].id ? res.rows[0].id : 0;
    const resultObj = {
      insertId,
      affectedRows: res.rowCount || 0,
      rows: res.rows || []
    };
    return [resultObj, []];
  }

  const rawRows = Array.isArray(res.rows) ? res.rows : [];
  return [normalizeCountFields(rawRows), res.fields || []];
}

function formatMysqlResult(res: any, isInsert: boolean) {
  if (!res) return [[], []];
  if (isInsert && res[0]) {
    const header = res[0] || {};
    const resultObj = {
      insertId: header.insertId || 0,
      affectedRows: header.affectedRows || 0,
      rows: []
    };
    return [resultObj, res[1] || []];
  }
  if (Array.isArray(res[0])) {
    return [normalizeCountFields(res[0]), res[1] || []];
  }
  return res;
}

export interface UniversalConnection {
  query(sql: string, params?: any[]): Promise<any>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

export interface UniversalPool {
  query(sql: string, params?: any[]): Promise<any>;
  getConnection(): Promise<UniversalConnection>;
  end(): Promise<void>;
  getActiveTarget(): string;
  setTarget(target: 'supabase' | 'tidb'): void;
}

function isFailoverError(err: any): boolean {
  if (!err) return false;
  const code = String(err.code || '');
  const msg = String(err.message || '').toLowerCase();

  const failoverCodes = [
    '57P01', '57P02', '57P03', '53100', '53200', '53300', '53400',
    '25006', '08000', '08003', '08006', '08001', 'ECONNREFUSED',
    'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'
  ];
  if (failoverCodes.includes(code)) return true;

  return (
    msg.includes('quota') ||
    msg.includes('limit') ||
    msg.includes('read-only') ||
    msg.includes('read only') ||
    msg.includes('disk full') ||
    msg.includes('storage') ||
    msg.includes('paused') ||
    msg.includes('too many connections') ||
    msg.includes('connection terminated') ||
    msg.includes('timeout')
  );
}

// 1. Setup Supabase Primary PostgreSQL Pool
const connectionString =
  process.env.DATABASE_URL ||
  (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'postgres'}`
    : DEFAULT_SUPABASE_URL);

const pgPool = new PgPool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: parseInt(process.env.DB_CONNECTION_LIMIT || '15', 10),
  idleTimeoutMillis: 30000
});

// 2. Setup TiDB Cloud Secondary MySQL Pool (if configured)
let tidbPool: MysqlPool | null = null;
if (process.env.TIDB_HOST) {
  try {
    tidbPool = mysql.createPool({
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT || '4000', 10),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE || 'lakshadweep_db',
      waitForConnections: true,
      connectionLimit: parseInt(process.env.TIDB_CONNECTION_LIMIT || '15', 10),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      charset: 'utf8mb4',
      ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
    });
    console.log('[Database] TiDB Cloud secondary pool initialized successfully.');
  } catch (err: any) {
    console.error('[Database] Failed to initialize TiDB secondary pool:', err.message);
  }
}

// Active write target: starts on 'supabase' (or 'tidb' if explicitly forced via ACTIVE_DB)
let activeWriteTarget: 'supabase' | 'tidb' =
  process.env.ACTIVE_DB === 'tidb' ? 'tidb' : 'supabase';

console.log(`[Database] Dual-Database Router active. Primary write target: ${activeWriteTarget.toUpperCase()}`);

function triggerFailoverToTiDB(reason: string) {
  if (activeWriteTarget !== 'tidb' && tidbPool) {
    console.warn(`\n======================================================`);
    console.warn(`[Dual-DB FAILOVER] Primary database failure/limit encountered: ${reason}`);
    console.warn(`[Dual-DB FAILOVER] Seamlessly rolling over active writes to TiDB Cloud Serverless!`);
    console.warn(`======================================================\n`);
    activeWriteTarget = 'tidb';
  }
}

async function queryPg(sql: string, params: any[] = []): Promise<any> {
  const { sql: finalSql, params: finalParams, isInsert } = translatePgQuery(sql, params);
  const res = await pgPool.query(finalSql, finalParams);
  return formatPgResult(res, isInsert);
}

async function queryTiDB(sql: string, params: any[] = []): Promise<any> {
  if (!tidbPool) {
    throw new Error('TiDB secondary pool is not initialized');
  }
  const isInsert = /^\s*INSERT\s+INTO\s+/i.test(sql);
  const res = await (tidbPool as any).query(sql, params);
  return formatMysqlResult(res, isInsert);
}

export const pool: UniversalPool = {
  getActiveTarget() {
    return activeWriteTarget;
  },

  setTarget(target: 'supabase' | 'tidb') {
    activeWriteTarget = target;
  },

  async query(sql: string, params: any[] = []): Promise<any> {
    const isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/i.test(sql);

    // WRITE OPERATIONS: execute on active target with automatic failover
    if (isWrite) {
      if (activeWriteTarget === 'supabase') {
        try {
          return await queryPg(sql, params);
        } catch (err: any) {
          if (isFailoverError(err) && tidbPool) {
            triggerFailoverToTiDB(err.message);
            return await queryTiDB(sql, params);
          }
          throw err;
        }
      } else {
        return await queryTiDB(sql, params);
      }
    }

    // READ OPERATIONS (SELECT)

    // Special Case 1: Sequential ID Generator scan (`ORDER BY id DESC LIMIT 1`)
    if (/ORDER\s+BY\s+id\s+DESC\s+LIMIT\s+1/i.test(sql) && /FROM\s+submissions/i.test(sql)) {
      let pgResult: any = null;
      let tidbResult: any = null;

      try {
        const [rows] = await queryPg(sql, params);
        if (rows && rows.length > 0) pgResult = rows[0];
      } catch (e) { /* ignore */ }

      if (tidbPool) {
        try {
          const [rows] = await queryTiDB(sql, params);
          if (rows && rows.length > 0) tidbResult = rows[0];
        } catch (e) { /* ignore */ }
      }

      if (pgResult && !tidbResult) return [[pgResult], []];
      if (!pgResult && tidbResult) return [[tidbResult], []];
      if (pgResult && tidbResult) {
        // Compare sequence numbers from submission_id (e.g. LDR-2026-000758)
        const getSeq = (item: any) => {
          const parts = String(item?.submission_id || '').split('-');
          return parts.length === 3 ? parseInt(parts[2], 10) || 0 : 0;
        };
        const winner = getSeq(tidbResult) > getSeq(pgResult) ? tidbResult : pgResult;
        return [[winner], []];
      }
      return [[], []];
    }

    // Special Case 2: Aggregate Count Query on submissions (with or without GROUP BY)
    if (
      /COUNT\s*\(/i.test(sql) &&
      /FROM\s+submissions/i.test(sql) &&
      tidbPool
    ) {
      const hasGroupBy = /GROUP\s+BY/i.test(sql);

      if (!hasGroupBy) {
        // Non-grouped count query (e.g. Total, Today, This Week, This Month)
        try {
          let pgRow: any = null;
          let tidbRow: any = null;

          try {
            const [pgRes] = await queryPg(sql, params);
            if (pgRes && pgRes.length > 0) pgRow = pgRes[0];
          } catch (e) { /* ignore */ }

          try {
            const [tidbRes] = await queryTiDB(sql, params);
            if (tidbRes && tidbRes.length > 0) tidbRow = tidbRes[0];
          } catch (e) { /* ignore */ }

          if (pgRow || tidbRow) {
            const base = pgRow || tidbRow;
            const combined: any = { ...base };
            for (const k of Object.keys(combined)) {
              const val1 = pgRow ? Number(pgRow[k]) || 0 : 0;
              const val2 = tidbRow ? Number(tidbRow[k]) || 0 : 0;
              combined[k] = val1 + val2;
            }
            return [[combined], []];
          }
        } catch (err: any) {
          // If aggregation fails, fall back to default execution below
        }
      } else {
        // Grouped count query (e.g. Submissions by Island, Status distribution, Submission Trend)
        try {
          let pgRows: any[] = [];
          let tidbRows: any[] = [];

          try {
            const [pgRes] = await queryPg(sql, params);
            if (Array.isArray(pgRes)) pgRows = pgRes;
          } catch (e) { /* ignore */ }

          try {
            const [tidbRes] = await queryTiDB(sql, params);
            if (Array.isArray(tidbRes)) tidbRows = tidbRes;
          } catch (e) { /* ignore */ }

          if (pgRows.length > 0 || tidbRows.length > 0) {
            const sample = pgRows[0] || tidbRows[0] || {};
            const keys = Object.keys(sample).filter(k => k.toLowerCase() !== 'count');
            const groupKey = keys[0] || 'group';

            const map = new Map<string, { rawKey: any; count: number }>();

            const addRow = (row: any) => {
              if (!row) return;
              const rawVal = row[groupKey];
              let normKey: string;
              let displayVal = rawVal;

              if (rawVal instanceof Date) {
                normKey = rawVal.toISOString().split('T')[0];
                displayVal = normKey;
              } else if (typeof rawVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(rawVal)) {
                normKey = rawVal.substring(0, 10);
                displayVal = normKey;
              } else {
                normKey = String(rawVal || '').trim().toLowerCase();
              }

              const existing = map.get(normKey);
              const countVal = Number(row.count) || 0;
              if (existing) {
                existing.count += countVal;
              } else {
                map.set(normKey, { rawKey: displayVal, count: countVal });
              }
            };

            pgRows.forEach(addRow);
            tidbRows.forEach(addRow);

            let combinedRows = Array.from(map.values()).map(item => ({
              [groupKey]: item.rawKey,
              count: item.count
            }));

            // Preserve query sorting
            if (/ORDER\s+BY\s+count\s+DESC/i.test(sql)) {
              combinedRows.sort((a, b) => b.count - a.count);
            } else if (/ORDER\s+BY\s+date\s+ASC/i.test(sql) || /ORDER\s+BY\s+.*ASC/i.test(sql)) {
              combinedRows.sort((a, b) => String(a[groupKey]).localeCompare(String(b[groupKey])));
            }

            return [combinedRows, []];
          }
        } catch (err: any) {
          // If aggregation fails, fall back to default execution below
        }
      }
    }

    // Special Case 3: Submission / Unique Detail Lookup by ID, Token, Phone, Email
    const isSingleLookup =
      /WHERE.*(submission_id|access_token|LOWER\(TRIM\(email\)\)|phone|idempotency_key)\s*=/i.test(sql);

    if (isSingleLookup && tidbPool) {
      // Check active target first
      const primaryQuery = activeWriteTarget === 'supabase' ? queryPg : queryTiDB;
      const secondaryQuery = activeWriteTarget === 'supabase' ? queryTiDB : queryPg;

      try {
        const [rows, fields] = await primaryQuery(sql, params);
        if (rows && rows.length > 0) {
          return [rows, fields];
        }
      } catch (e) { /* ignore and check secondary */ }

      // If not found in primary, check secondary
      try {
        const [secondaryRows, fields] = await secondaryQuery(sql, params);
        if (secondaryRows && secondaryRows.length > 0) {
          return [secondaryRows, fields];
        }
      } catch (e) { /* ignore */ }

      return [[], []];
    }

    // Default Read: Query active target, with fallback to secondary if primary fails
    if (activeWriteTarget === 'supabase') {
      try {
        return await queryPg(sql, params);
      } catch (err: any) {
        if (tidbPool && isFailoverError(err)) {
          triggerFailoverToTiDB(err.message);
          return await queryTiDB(sql, params);
        }
        throw err;
      }
    } else {
      return await queryTiDB(sql, params);
    }
  },

  async getConnection(): Promise<UniversalConnection> {
    if (activeWriteTarget === 'supabase') {
      try {
        const client: PoolClient = await pgPool.connect();
        return {
          async query(sql: string, params: any[] = []) {
            const { sql: finalSql, params: finalParams, isInsert } = translatePgQuery(sql, params);
            const res = await client.query(finalSql, finalParams);
            return formatPgResult(res, isInsert);
          },
          async beginTransaction() {
            await client.query('BEGIN');
          },
          async commit() {
            await client.query('COMMIT');
          },
          async rollback() {
            await client.query('ROLLBACK');
          },
          release() {
            client.release();
          }
        };
      } catch (err: any) {
        if (isFailoverError(err) && tidbPool) {
          triggerFailoverToTiDB(err.message);
        } else {
          throw err;
        }
      }
    }

    // TiDB Connection
    if (!tidbPool) {
      throw new Error('TiDB pool is not available for connection');
    }
    const conn = await tidbPool.getConnection();
    return {
      async query(sql: string, params: any[] = []) {
        const isInsert = /^\s*INSERT\s+INTO\s+/i.test(sql);
        const res = await conn.query(sql, params);
        return formatMysqlResult(res, isInsert);
      },
      async beginTransaction() {
        await conn.beginTransaction();
      },
      async commit() {
        await conn.commit();
      },
      async rollback() {
        await conn.rollback();
      },
      release() {
        conn.release();
      }
    };
  },

  async end(): Promise<void> {
    await pgPool.end();
    if (tidbPool) {
      await tidbPool.end();
    }
  }
};

export default pool;
