import { Pool as PgPool } from 'pg';

const connectionString = 'postgresql://postgres.ktbltkagspmzwxaoyaha:5mcHBvnk3qG7BVnG@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

const pgPool = new PgPool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

function translateQuery(sql: string, params: any[] = []): { sql: string; params: any[] } {
  let paramIdx = 1;
  let translatedSql = sql.replace(/\?/g, () => `$${paramIdx++}`);
  // Replace MySQL INTERVAL N DAY -> Postgres INTERVAL 'N days'
  translatedSql = translatedSql.replace(/INTERVAL\s+(\d+)\s+DAY/gi, "INTERVAL '$1 days'");
  return { sql: translatedSql, params };
}

async function run() {
  console.log('[Test] Connecting to Supabase via PgPool...');
  const { sql, params } = translateQuery('SELECT id, username, email FROM admins WHERE username = ?', ['admin']);
  console.log('[Test] Translated SQL:', sql);
  const res = await pgPool.query(sql, params);
  console.log('[Test] Admin query success:', res.rows);

  const { sql: countSql } = translateQuery('SELECT COUNT(*) AS total FROM letter_templates');
  const countRes = await pgPool.query(countSql);
  console.log('[Test] Letter templates count:', countRes.rows[0].total);

  // Test Transaction
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    const { sql: insSql, params: insParams } = translateQuery(
      'INSERT INTO audit_logs (admin_username, action, details) VALUES (?, ?, ?)',
      ['test_admin', 'TEST_TRANSACTION', 'verifying tx rollback']
    );
    const insRes = await client.query(insSql + ' RETURNING id', insParams);
    console.log('[Test] Inserted audit log id:', insRes.rows[0].id);
    await client.query('ROLLBACK');
    console.log('[Test] Transaction rolled back cleanly!');
  } finally {
    client.release();
  }

  await pgPool.end();
}

run().catch(err => {
  console.error('[Test] Error:', err);
  process.exit(1);
});
