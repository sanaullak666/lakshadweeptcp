import mysql from 'mysql2/promise';
import { OBJECTION_1_TEMPLATE, OBJECTION_2_TEMPLATE } from '../src/templates/defaultTemplates';

async function sync() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123456789',
    database: 'lakshadweep_objections_db'
  });

  console.log('Connected to MySQL database.');

  // Clean up any test versions
  await connection.query('DELETE FROM letter_templates WHERE id = 3 OR version = "2.0"');

  // Update Template 1
  await connection.query(
    `UPDATE letter_templates 
     SET title = ?, version = ?, subject = ?, reference = ?, copy_to = ?, content_html = ?, is_active = TRUE, updated_at = NOW()
     WHERE id = 1 AND letter_number = 1`,
    [
      OBJECTION_1_TEMPLATE.title,
      OBJECTION_1_TEMPLATE.version,
      OBJECTION_1_TEMPLATE.subject,
      OBJECTION_1_TEMPLATE.reference,
      JSON.stringify(OBJECTION_1_TEMPLATE.copyTo),
      OBJECTION_1_TEMPLATE.contentHtml
    ]
  );
  console.log('Template 1 synced & set active.');

  // Update Template 2
  await connection.query(
    `UPDATE letter_templates 
     SET title = ?, version = ?, subject = ?, reference = ?, copy_to = ?, content_html = ?, is_active = TRUE, updated_at = NOW()
     WHERE id = 2 AND letter_number = 2`,
    [
      OBJECTION_2_TEMPLATE.title,
      OBJECTION_2_TEMPLATE.version,
      OBJECTION_2_TEMPLATE.subject,
      OBJECTION_2_TEMPLATE.reference,
      JSON.stringify(OBJECTION_2_TEMPLATE.copyTo),
      OBJECTION_2_TEMPLATE.contentHtml
    ]
  );
  console.log('Template 2 synced & set active.');

  const [rows] = await connection.query('SELECT id, letter_number, title, version, is_active FROM letter_templates');
  console.log('Current templates in database:', rows);

  await connection.end();
}

sync().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
