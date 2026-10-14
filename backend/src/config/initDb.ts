import bcrypt from 'bcryptjs';
import pool from './database';
import { OBJECTION_1_TEMPLATE, OBJECTION_2_TEMPLATE, OBJECTION_3_TEMPLATE } from '../templates/defaultTemplates';

export async function initializeDatabase() {
  const isPostgres =
    Boolean(process.env.DATABASE_URL) ||
    process.env.DB_TYPE === 'postgres' ||
    process.env.DB_PORT === '5432' ||
    (process.env.DB_HOST && process.env.DB_HOST.includes('supabase'));

  const connection = await pool.getConnection();
  try {
    console.log(`[Database] Initializing schema (${isPostgres ? 'PostgreSQL/Supabase' : 'MySQL'})...`);

    if (isPostgres) {
      // PostgreSQL / Supabase Schema
      await connection.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS submissions (
          id SERIAL PRIMARY KEY,
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
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_submission_id ON submissions(submission_id);
        CREATE INDEX IF NOT EXISTS idx_island ON submissions(island);
        CREATE INDEX IF NOT EXISTS idx_status ON submissions(status);
        CREATE INDEX IF NOT EXISTS idx_created_at ON submissions(created_at);
        CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(LOWER(TRIM(email)));
        CREATE INDEX IF NOT EXISTS idx_submissions_phone ON submissions(phone);
        CREATE SEQUENCE IF NOT EXISTS submission_code_seq;

        CREATE TABLE IF NOT EXISTS signatures (
          id SERIAL PRIMARY KEY,
          submission_id VARCHAR(50) NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
          signature_type VARCHAR(20) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_sig_submission ON signatures(submission_id);

        CREATE TABLE IF NOT EXISTS letter_templates (
          id SERIAL PRIMARY KEY,
          letter_number INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          version VARCHAR(20) NOT NULL,
          subject TEXT NOT NULL,
          reference TEXT NOT NULL,
          copy_to TEXT NOT NULL,
          content_html TEXT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_by VARCHAR(100) DEFAULT 'system',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_letter_active ON letter_templates(letter_number, is_active);

        CREATE TABLE IF NOT EXISTS objection_letters (
          id SERIAL PRIMARY KEY,
          submission_id VARCHAR(50) NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
          letter_number INT NOT NULL,
          template_version VARCHAR(20) NOT NULL,
          letter_title VARCHAR(255) NOT NULL,
          final_html TEXT NOT NULL,
          pdf_path VARCHAR(500) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_obj_submission ON objection_letters(submission_id);
        CREATE INDEX IF NOT EXISTS idx_obj_letter ON objection_letters(submission_id, letter_number);

        CREATE TABLE IF NOT EXISTS submission_status_history (
          id SERIAL PRIMARY KEY,
          submission_id VARCHAR(50) NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
          old_status VARCHAR(50) NOT NULL,
          new_status VARCHAR(50) NOT NULL,
          changed_by VARCHAR(100) NOT NULL,
          remarks TEXT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_hist_submission ON submission_status_history(submission_id);

        CREATE TABLE IF NOT EXISTS admin_notes (
          id SERIAL PRIMARY KEY,
          submission_id VARCHAR(50) NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
          admin_name VARCHAR(100) NOT NULL,
          note TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_note_submission ON admin_notes(submission_id);

        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          admin_username VARCHAR(100) NULL,
          action VARCHAR(100) NOT NULL,
          target_type VARCHAR(50) NULL,
          target_id VARCHAR(100) NULL,
          details TEXT NULL,
          ip_address VARCHAR(50) NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

        CREATE TABLE IF NOT EXISTS app_settings (
          setting_key VARCHAR(100) PRIMARY KEY,
          setting_value TEXT NOT NULL,
          description VARCHAR(255) NULL,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      // MySQL Schema
      await connection.query(`
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

      await connection.query(`
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
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(30) NOT NULL,
          place VARCHAR(100) NOT NULL,
          submission_date VARCHAR(50) NOT NULL,
          status ENUM('Submitted', 'Under Review', 'Reviewed', 'Forwarded', 'Rejected') DEFAULT 'Submitted',
          idempotency_key VARCHAR(100) UNIQUE NULL,
          ip_address VARCHAR(50) NULL,
          user_agent TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_submission_id (submission_id),
          INDEX idx_island (island),
          INDEX idx_status (status),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS signatures (
          id INT AUTO_INCREMENT PRIMARY KEY,
          submission_id VARCHAR(50) NOT NULL,
          signature_type ENUM('drawn', 'uploaded') NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
          INDEX idx_sig_submission (submission_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
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

      await connection.query(`
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

      await connection.query(`
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

      await connection.query(`
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

      await connection.query(`
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

      await connection.query(`
        CREATE TABLE IF NOT EXISTS app_settings (
          setting_key VARCHAR(100) PRIMARY KEY,
          setting_value TEXT NOT NULL,
          description VARCHAR(255) NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    }

    // Seed default settings
    const [existingSettings]: any = await connection.query('SELECT setting_key FROM app_settings WHERE setting_key = ?', ['allow_manual_date_edit']);
    if (!existingSettings || existingSettings.length === 0) {
      await connection.query(`
        INSERT INTO app_settings (setting_key, setting_value, description)
        VALUES (?, ?, ?)
      `, ['allow_manual_date_edit', 'true', 'Allow users to manually adjust the objection date']);
      await connection.query(`
        INSERT INTO app_settings (setting_key, setting_value, description)
        VALUES (?, ?, ?)
      `, ['default_date_format', 'DD.MM.YYYY', 'Default date display format']);
      await connection.query(`
        INSERT INTO app_settings (setting_key, setting_value, description)
        VALUES (?, ?, ?)
      `, ['maintenance_mode', 'false', 'Disable public submissions']);
    }

    // Seed default admin if not exists
    const [existingAdmins]: any = await connection.query('SELECT id FROM admins WHERE username = ?', ['admin']);
    if (!existingAdmins || existingAdmins.length === 0) {
      const passwordHash = await bcrypt.hash('Admin@2026!', 10);
      await connection.query(`
        INSERT INTO admins (username, email, password_hash, full_name, role)
        VALUES (?, ?, ?, ?, ?)
      `, ['admin', 'admin@lakshadweep.gov.in', passwordHash, 'System Administrator', 'superadmin']);
      console.log('[Database] Default admin created (username: admin, email: admin@lakshadweep.gov.in)');
    }

    // Seed Letter 1 Template if not exists
    const [tmpl1]: any = await connection.query('SELECT id FROM letter_templates WHERE letter_number = 1 AND is_active = TRUE');
    if (!tmpl1 || tmpl1.length === 0) {
      await connection.query(`
        INSERT INTO letter_templates (letter_number, title, version, subject, reference, copy_to, content_html, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [
        OBJECTION_1_TEMPLATE.letterNumber,
        OBJECTION_1_TEMPLATE.title,
        OBJECTION_1_TEMPLATE.version,
        OBJECTION_1_TEMPLATE.subject,
        OBJECTION_1_TEMPLATE.reference,
        JSON.stringify(OBJECTION_1_TEMPLATE.copyTo),
        OBJECTION_1_TEMPLATE.contentHtml
      ]);
      console.log('[Database] Letter 1 Template seeded');
    }

    // Seed Letter 2 Template if not exists
    const [tmpl2]: any = await connection.query('SELECT id FROM letter_templates WHERE letter_number = 2 AND is_active = TRUE');
    if (!tmpl2 || tmpl2.length === 0) {
      await connection.query(`
        INSERT INTO letter_templates (letter_number, title, version, subject, reference, copy_to, content_html, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [
        OBJECTION_2_TEMPLATE.letterNumber,
        OBJECTION_2_TEMPLATE.title,
        OBJECTION_2_TEMPLATE.version,
        OBJECTION_2_TEMPLATE.subject,
        OBJECTION_2_TEMPLATE.reference,
        JSON.stringify(OBJECTION_2_TEMPLATE.copyTo),
        OBJECTION_2_TEMPLATE.contentHtml
      ]);
      console.log('[Database] Letter 2 Template seeded');
    }

    // Seed Letter 3 Template if not exists
    const [tmpl3]: any = await connection.query('SELECT id FROM letter_templates WHERE letter_number = 3 AND is_active = TRUE');
    if (!tmpl3 || tmpl3.length === 0) {
      await connection.query(`
        INSERT INTO letter_templates (letter_number, title, version, subject, reference, copy_to, content_html, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [
        OBJECTION_3_TEMPLATE.letterNumber,
        OBJECTION_3_TEMPLATE.title,
        OBJECTION_3_TEMPLATE.version,
        OBJECTION_3_TEMPLATE.subject,
        OBJECTION_3_TEMPLATE.reference,
        JSON.stringify(OBJECTION_3_TEMPLATE.copyTo),
        OBJECTION_3_TEMPLATE.contentHtml
      ]);
      console.log('[Database] Letter 3 Template seeded');
    }

    console.log('[Database] Schema initialization and seeding complete.');
  } finally {
    connection.release();
  }
}
