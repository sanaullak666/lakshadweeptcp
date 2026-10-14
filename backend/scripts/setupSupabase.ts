import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import { OBJECTION_1_TEMPLATE, OBJECTION_2_TEMPLATE, OBJECTION_3_TEMPLATE } from '../src/templates/defaultTemplates';

const connectionString = 'postgresql://postgres.ktbltkagspmzwxaoyaha:5mcHBvnk3qG7BVnG@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

async function setupSupabase() {
  console.log('[Supabase Setup] Connecting to Supabase PostgreSQL...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('[Supabase Setup] Connected successfully!');

  try {
    console.log('[Supabase Setup] Creating tables...');

    // 1. Admins table
    await client.query(`
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
    `);

    // 2. Submissions table
    await client.query(`
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
        email VARCHAR(255) NOT NULL,
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
    `);

    // 3. Signatures table
    await client.query(`
      CREATE TABLE IF NOT EXISTS signatures (
        id SERIAL PRIMARY KEY,
        submission_id VARCHAR(50) NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
        signature_type VARCHAR(20) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_sig_submission ON signatures(submission_id);
    `);

    // 4. Letter templates table
    await client.query(`
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
    `);

    // 5. Objection letters table (Immutable generated letters)
    await client.query(`
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
    `);

    // 6. Submission status history
    await client.query(`
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
    `);

    // 7. Admin notes
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_notes (
        id SERIAL PRIMARY KEY,
        submission_id VARCHAR(50) NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
        admin_name VARCHAR(100) NOT NULL,
        note TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_note_submission ON admin_notes(submission_id);
    `);

    // 8. Audit logs
    await client.query(`
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
    `);

    // 9. App settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        description VARCHAR(255) NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('[Supabase Setup] All 9 tables created successfully!');

    // Seed default settings
    await client.query(`
      INSERT INTO app_settings (setting_key, setting_value, description)
      VALUES 
        ('allow_manual_date_edit', 'true', 'Allow users to manually adjust the objection date'),
        ('default_date_format', 'DD.MM.YYYY', 'Default date display format'),
        ('maintenance_mode', 'false', 'Disable public submissions')
      ON CONFLICT (setting_key) DO NOTHING;
    `);

    // Seed default admin
    const adminCheck = await client.query('SELECT id FROM admins WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      const passwordHash = await bcrypt.hash('Admin@2026!', 10);
      await client.query(`
        INSERT INTO admins (username, email, password_hash, full_name, role)
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin', 'admin@lakshadweep.gov.in', passwordHash, 'System Administrator', 'superadmin']);
      console.log('[Supabase Setup] Default admin created (username: admin, password: Admin@2026!)');
    }

    // Seed Letter 1 Template
    const tmpl1Check = await client.query('SELECT id FROM letter_templates WHERE letter_number = 1 AND is_active = TRUE');
    if (tmpl1Check.rows.length === 0) {
      await client.query(`
        INSERT INTO letter_templates (letter_number, title, version, subject, reference, copy_to, content_html, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
      `, [
        OBJECTION_1_TEMPLATE.letterNumber,
        OBJECTION_1_TEMPLATE.title,
        OBJECTION_1_TEMPLATE.version,
        OBJECTION_1_TEMPLATE.subject,
        OBJECTION_1_TEMPLATE.reference,
        JSON.stringify(OBJECTION_1_TEMPLATE.copyTo),
        OBJECTION_1_TEMPLATE.contentHtml
      ]);
      console.log('[Supabase Setup] Letter 1 Template seeded');
    }

    // Seed Letter 2 Template
    const tmpl2Check = await client.query('SELECT id FROM letter_templates WHERE letter_number = 2 AND is_active = TRUE');
    if (tmpl2Check.rows.length === 0) {
      await client.query(`
        INSERT INTO letter_templates (letter_number, title, version, subject, reference, copy_to, content_html, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
      `, [
        OBJECTION_2_TEMPLATE.letterNumber,
        OBJECTION_2_TEMPLATE.title,
        OBJECTION_2_TEMPLATE.version,
        OBJECTION_2_TEMPLATE.subject,
        OBJECTION_2_TEMPLATE.reference,
        JSON.stringify(OBJECTION_2_TEMPLATE.copyTo),
        OBJECTION_2_TEMPLATE.contentHtml
      ]);
      console.log('[Supabase Setup] Letter 2 Template seeded');
    }

    // Seed Letter 3 Template
    const tmpl3Check = await client.query('SELECT id FROM letter_templates WHERE letter_number = 3 AND is_active = TRUE');
    if (tmpl3Check.rows.length === 0) {
      await client.query(`
        INSERT INTO letter_templates (letter_number, title, version, subject, reference, copy_to, content_html, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
      `, [
        OBJECTION_3_TEMPLATE.letterNumber,
        OBJECTION_3_TEMPLATE.title,
        OBJECTION_3_TEMPLATE.version,
        OBJECTION_3_TEMPLATE.subject,
        OBJECTION_3_TEMPLATE.reference,
        JSON.stringify(OBJECTION_3_TEMPLATE.copyTo),
        OBJECTION_3_TEMPLATE.contentHtml
      ]);
      console.log('[Supabase Setup] Letter 3 Template seeded');
    }

    console.log('[Supabase Setup] Setup & Seeding successfully completed!');
  } finally {
    await client.end();
  }
}

setupSupabase().catch(err => {
  console.error('[Supabase Setup] Fatal error:', err);
  process.exit(1);
});
