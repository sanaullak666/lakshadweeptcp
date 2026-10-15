const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

async function setupTiDB() {
  console.log('[TiDB Setup] Connecting to TiDB Cloud Serverless...');
  const tidbConn = await mysql.createConnection({
    host: process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: parseInt(process.env.TIDB_PORT || '4000', 10),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE || 'lakshadweep_db',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  console.log('[TiDB Setup] Connected successfully to lakshadweep_db on TiDB!');

  // Connect to Supabase to fetch current max ID and template/admin data
  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('[TiDB Setup] Creating schema tables...');

    await tidbConn.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await tidbConn.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id VARCHAR(50) NOT NULL UNIQUE,
        access_token VARCHAR(64) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        relationship VARCHAR(50) NOT NULL,
        parent_spouse_name VARCHAR(255) NOT NULL,
        house_name VARCHAR(255) NOT NULL,
        island VARCHAR(100) NOT NULL,
        pin_code VARCHAR(20) NOT NULL,
        email VARCHAR(255) NULL,
        phone VARCHAR(30) NOT NULL,
        place VARCHAR(100) NOT NULL,
        submission_date VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Submitted',
        idempotency_key VARCHAR(100) UNIQUE NULL,
        ip_address VARCHAR(50) NULL,
        user_agent TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_submission_id (submission_id),
        INDEX idx_island (island),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_phone (phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await tidbConn.query(`
      CREATE TABLE IF NOT EXISTS signatures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id VARCHAR(50) NOT NULL,
        signature_type VARCHAR(50) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
        INDEX idx_sig_submission (submission_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await tidbConn.query(`
      CREATE TABLE IF NOT EXISTS letter_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        letter_number INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        version VARCHAR(20) NOT NULL,
        subject TEXT NOT NULL,
        reference TEXT NOT NULL,
        copy_to TEXT NOT NULL,
        content_html LONGTEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_by VARCHAR(100) DEFAULT 'system',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_letter_active (letter_number, is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await tidbConn.query(`
      CREATE TABLE IF NOT EXISTS objection_letters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id VARCHAR(50) NOT NULL,
        letter_number INT NOT NULL,
        template_version VARCHAR(20) NOT NULL,
        letter_title VARCHAR(255) NOT NULL,
        final_html LONGTEXT NOT NULL,
        pdf_path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
        INDEX idx_obj_submission (submission_id),
        INDEX idx_obj_letter (submission_id, letter_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await tidbConn.query(`
      CREATE TABLE IF NOT EXISTS submission_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id VARCHAR(50) NOT NULL,
        old_status VARCHAR(50) NOT NULL,
        new_status VARCHAR(50) NOT NULL,
        changed_by VARCHAR(100) NOT NULL,
        remarks TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
        INDEX idx_hist_submission (submission_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await tidbConn.query(`
      CREATE TABLE IF NOT EXISTS admin_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id VARCHAR(50) NOT NULL,
        admin_name VARCHAR(100) NOT NULL,
        note TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
        INDEX idx_note_submission (submission_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await tidbConn.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_username VARCHAR(100) NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NULL,
        target_id VARCHAR(100) NULL,
        details TEXT NULL,
        ip_address VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_created (created_at),
        INDEX idx_audit_action (action)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await tidbConn.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        description VARCHAR(255) NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('[TiDB Setup] All tables created successfully in TiDB!');

    // Fetch highest submission ID from Supabase
    let nextAutoInc = 1000;
    try {
      const maxRes = await pgPool.query('SELECT MAX(id) as max_id FROM submissions');
      const maxId = maxRes.rows[0]?.max_id || 0;
      if (maxId > 0) {
        nextAutoInc = maxId + 100;
      }
      console.log(`[TiDB Setup] Current Supabase max submission ID is ${maxId}. Setting TiDB AUTO_INCREMENT to ${nextAutoInc}`);
      await tidbConn.query(`ALTER TABLE submissions AUTO_INCREMENT = ${nextAutoInc}`);
    } catch (e) {
      console.warn('[TiDB Setup] Could not query Supabase max submission ID:', e.message);
    }

    // Sync admins from Supabase to TiDB
    try {
      const adminsRes = await pgPool.query('SELECT username, email, password_hash, full_name, role, is_active FROM admins');
      for (const a of adminsRes.rows) {
        await tidbConn.query(`
          INSERT INTO admins (username, email, password_hash, full_name, role, is_active)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name)
        `, [a.username, a.email, a.password_hash, a.full_name, a.role, a.is_active]);
      }
      console.log(`[TiDB Setup] Synced ${adminsRes.rows.length} admin accounts to TiDB.`);
    } catch (e) {
      console.warn('[TiDB Setup] Admin sync warning:', e.message);
    }

    // Sync letter_templates from Supabase to TiDB
    try {
      const tmplRes = await pgPool.query('SELECT letter_number, title, version, subject, reference, copy_to, content_html, is_active FROM letter_templates');
      for (const t of tmplRes.rows) {
        const [existing] = await tidbConn.query('SELECT id FROM letter_templates WHERE letter_number = ? AND version = ?', [t.letter_number, t.version]);
        if (existing.length === 0) {
          await tidbConn.query(`
            INSERT INTO letter_templates (letter_number, title, version, subject, reference, copy_to, content_html, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [t.letter_number, t.title, t.version, t.subject, t.reference, typeof t.copy_to === 'string' ? t.copy_to : JSON.stringify(t.copy_to), t.content_html, t.is_active]);
        }
      }
      console.log(`[TiDB Setup] Synced ${tmplRes.rows.length} letter templates to TiDB.`);
    } catch (e) {
      console.warn('[TiDB Setup] Template sync warning:', e.message);
    }

    // Sync app_settings from Supabase to TiDB
    try {
      const setRes = await pgPool.query('SELECT setting_key, setting_value, description FROM app_settings');
      for (const s of setRes.rows) {
        await tidbConn.query(`
          INSERT INTO app_settings (setting_key, setting_value, description)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `, [s.setting_key, s.setting_value, s.description]);
      }
      console.log(`[TiDB Setup] Synced ${setRes.rows.length} app settings to TiDB.`);
    } catch (e) {
      console.warn('[TiDB Setup] Settings sync warning:', e.message);
    }

    console.log('[TiDB Setup] Complete! TiDB is fully prepared and synced as secondary database.');
  } finally {
    await tidbConn.end();
    await pgPool.end();
  }
}

setupTiDB().catch(err => {
  console.error('[TiDB Setup] Fatal error:', err);
  process.exit(1);
});
