const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.ktbltkagspmzwxaoyaha:5mcHBvnk3qG7BVnG@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

async function cleanDatabaseAndFiles() {
  console.log('====================================================');
  console.log('STARTING DATABASE & STORAGE CLEANUP FOR LIVE LAUNCH');
  console.log('====================================================');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('[1/4] Connected to Supabase PostgreSQL database.');

    // Step 1: Truncate transactional tables
    console.log('[2/4] Purging all test submission data and audit records...');
    await client.query(`
      TRUNCATE TABLE 
        objection_letters, 
        signatures, 
        submission_status_history, 
        admin_notes, 
        submissions, 
        audit_logs 
      RESTART IDENTITY CASCADE;
    `);
    console.log(' -> Truncated: objection_letters, signatures, submission_status_history, admin_notes, submissions, audit_logs');

    // Step 2: Insert fresh initial audit log
    await client.query(`
      INSERT INTO audit_logs (admin_username, action, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5);
    `, [
      'system',
      'SYSTEM_INITIALIZED',
      'SYSTEM',
      'PRODUCTION_READY',
      'System database cleaned and prepared for public live launch notice.'
    ]);
    console.log(' -> Logged initial system launch entry in audit_logs.');

    // Step 3: Verify all table counts
    console.log('\n[3/4] Current Database Status Post-Cleanup:');
    const tables = [
      'submissions',
      'signatures',
      'objection_letters',
      'submission_status_history',
      'admin_notes',
      'audit_logs',
      'admins',
      'letter_templates',
      'app_settings'
    ];

    for (const tbl of tables) {
      const res = await client.query(`SELECT COUNT(*) as count FROM "${tbl}";`);
      console.log(`   - ${tbl.padEnd(26)}: ${res.rows[0].count} rows`);
    }

    // Step 4: Clean storage and upload directories
    console.log('\n[4/4] Cleaning local storage and upload directories...');

    const pdfsDir = path.resolve(__dirname, 'storage/pdfs');
    if (fs.existsSync(pdfsDir)) {
      const entries = fs.readdirSync(pdfsDir);
      let removedPdfs = 0;
      for (const entry of entries) {
        if (entry === '.gitkeep') continue;
        const fullPath = path.join(pdfsDir, entry);
        fs.rmSync(fullPath, { recursive: true, force: true });
        removedPdfs++;
      }
      console.log(` -> Cleared ${removedPdfs} test directories/files from ${pdfsDir}`);
    }

    const sigsDir = path.resolve(__dirname, 'uploads/signatures');
    if (fs.existsSync(sigsDir)) {
      const entries = fs.readdirSync(sigsDir);
      let removedSigs = 0;
      for (const entry of entries) {
        if (entry === '.gitkeep') continue;
        const fullPath = path.join(sigsDir, entry);
        fs.rmSync(fullPath, { recursive: true, force: true });
        removedSigs++;
      }
      console.log(` -> Cleared ${removedSigs} test signature files from ${sigsDir}`);
    }

    console.log('\n====================================================');
    console.log('CLEANUP COMPLETED SUCCESSFULLY - READY FOR LIVE LAUNCH');
    console.log('====================================================');
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanDatabaseAndFiles();
