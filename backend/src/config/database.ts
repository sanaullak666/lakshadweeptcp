import dotenv from 'dotenv';
import path from 'path';
import { Pool as PgPool, PoolClient } from 'pg';
import mysql from 'mysql2/promise';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isPostgres =
  Boolean(process.env.DATABASE_URL) ||
  process.env.DB_TYPE === 'postgres' ||
  process.env.DB_PORT === '5432' ||
  (process.env.DB_HOST && process.env.DB_HOST.includes('supabase'));

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

function formatPgResult(res: any, isInsert: boolean) {
  if (Array.isArray(res)) {
    // Multi-statement query (e.g. batch CREATE TABLE)
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
  // Normalize COUNT(*) fields to numbers if present
  const rows = rawRows.map((row: any) => {
    if (!row || typeof row !== 'object') return row;
    const copy = { ...row };
    for (const key of Object.keys(copy)) {
      if (
        (key === 'total' || key === 'today' || key === 'this_week' || key === 'this_month' || key === 'count') &&
        typeof copy[key] === 'string' &&
        /^\d+$/.test(copy[key])
      ) {
        copy[key] = parseInt(copy[key], 10);
      }
    }
    return copy;
  });

  return [rows, res.fields || []];
}

interface UniversalConnection {
  query(sql: string, params?: any[]): Promise<any>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

interface UniversalPool {
  query(sql: string, params?: any[]): Promise<any>;
  getConnection(): Promise<UniversalConnection>;
  end(): Promise<void>;
}

let poolInstance: UniversalPool;

if (isPostgres) {
  console.log('[Database] Operating in PostgreSQL (Supabase) mode');

  const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'postgres'}`;

  const pgPool = new PgPool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: parseInt(process.env.DB_CONNECTION_LIMIT || '15', 10),
    idleTimeoutMillis: 30000
  });

  poolInstance = {
    async query(sql: string, params: any[] = []) {
      const { sql: finalSql, params: finalParams, isInsert } = translatePgQuery(sql, params);
      const res = await pgPool.query(finalSql, finalParams);
      return formatPgResult(res, isInsert);
    },
    async getConnection(): Promise<UniversalConnection> {
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
    },
    async end() {
      await pgPool.end();
    }
  };
} else {
  console.log('[Database] Operating in MySQL mode');
  const mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456789',
    database: process.env.DB_NAME || 'lakshadweep_objections_db',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '15', 10),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    charset: 'utf8mb4'
  });

  poolInstance = {
    async query(sql: string, params: any[] = []) {
      return (mysqlPool as any).query(sql, params);
    },
    async getConnection() {
      const conn = await mysqlPool.getConnection();
      return {
        async query(sql: string, params: any[] = []) {
          return conn.query(sql, params);
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
    async end() {
      await mysqlPool.end();
    }
  };
}

export const pool = poolInstance;
export default pool;
