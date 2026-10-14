import crypto from 'crypto';
import pool from '../config/database';

export async function generateSubmissionId(conn?: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `LDR-${currentYear}-`;
  const executor = conn || pool;

  // Try PostgreSQL atomic sequence first for 100% collision-free concurrent IDs
  try {
    const [seqRows]: any = await executor.query("SELECT nextval('submission_code_seq') as seq");
    if (seqRows && seqRows.length > 0 && seqRows[0].seq) {
      const num = parseInt(seqRows[0].seq, 10);
      const paddedNum = String(num).padStart(6, '0');
      return `${prefix}${paddedNum}`;
    }
  } catch {
    // If sequence is not initialized or running in MySQL, fallback to table scan
  }

  const [rows]: any = await executor.query(
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
