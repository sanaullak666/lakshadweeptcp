import pool from '../config/database';

export interface AuditLogData {
  adminUsername?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
}

export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    await pool.query(`
      INSERT INTO audit_logs (admin_username, action, target_type, target_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      data.adminUsername || null,
      data.action,
      data.targetType || null,
      data.targetId || null,
      data.details || null,
      data.ipAddress || null
    ]);
  } catch (err) {
    console.error('[AuditService] Failed to record audit log:', err);
  }
}
