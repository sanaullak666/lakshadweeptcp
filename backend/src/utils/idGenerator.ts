import crypto from 'crypto';
import pool from '../config/database';

export async function generateSubmissionId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `LDR-${currentYear}-`;

  const [rows]: any = await pool.query(
    'SELECT submission_id FROM submissions WHERE submission_id LIKE ? ORDER BY id DESC LIMIT 1',
    [`${prefix}%`]
  );

  let nextSequence = 1;
  if (rows && rows.length > 0) {
    const lastId = rows[0].submission_id;
    const parts = lastId.split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num)) {
        nextSequence = num + 1;
      }
    }
  }

  const paddedNum = String(nextSequence).padStart(6, '0');
  return `${prefix}${paddedNum}`;
}

export function generateAccessToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
}
