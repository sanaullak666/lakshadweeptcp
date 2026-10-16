import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import pool from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../services/auditService';
import { replacePlaceholders } from '../services/templateService';

function getClientIp(req: Request): string | undefined {
  const ip = req.ip || req.socket.remoteAddress;
  return Array.isArray(ip) ? ip[0] : ip;
}

export async function adminLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    const [admins]: any = await pool.query(
      'SELECT * FROM admins WHERE (username = ? OR email = ?) AND is_active = TRUE',
      [username, username]
    );

    if (admins.length === 0) {
      await logAudit({
        action: 'FAILED_LOGIN',
        details: `Failed login attempt for username/email: ${username}`,
        ipAddress: getClientIp(req)
      });
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      await logAudit({
        action: 'FAILED_LOGIN',
        adminUsername: admin.username,
        details: 'Incorrect password entered',
        ipAddress: getClientIp(req)
      });
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const secret = process.env.JWT_SECRET || 'lakshadweep_town_country_planning_secure_jwt_secret_2026_super_key';
    const token = jwt.sign(
      { id: admin.id, username: admin.username, email: admin.email, role: admin.role },
      secret,
      { expiresIn: '24h' }
    );

    await logAudit({
      action: 'LOGIN',
      adminUsername: admin.username,
      details: 'Admin logged in successfully',
      ipAddress: getClientIp(req)
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role
      }
    });

  } catch (err: any) {
    console.error('[adminLogin Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
}

export async function adminLogout(req: AuthenticatedRequest, res: Response) {
  if (req.admin) {
    await logAudit({
      action: 'LOGOUT',
      adminUsername: req.admin.username,
      details: 'Admin logged out',
      ipAddress: getClientIp(req)
    });
  }
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    // 1. Total Submissions
    const [[{ total }]]: any = await pool.query('SELECT COUNT(*) AS total FROM submissions');

    // 2. Today's Submissions
    const [[{ today }]]: any = await pool.query(
      'SELECT COUNT(*) AS today FROM submissions WHERE DATE(created_at) = CURDATE()'
    );

    // 3. This Week's Submissions
    const [[{ thisWeek }]]: any = await pool.query(
      'SELECT COUNT(*) AS thisWeek FROM submissions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );

    // 4. This Month's Submissions
    const [[{ thisMonth }]]: any = await pool.query(
      'SELECT COUNT(*) AS thisMonth FROM submissions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    // 5. Counts by Status
    const [statusCounts]: any = await pool.query(`
      SELECT status, COUNT(*) AS count 
      FROM submissions 
      GROUP BY status
    `);

    // 6. Submissions by Island
    const [islandCounts]: any = await pool.query(`
      SELECT island, COUNT(*) AS count 
      FROM submissions 
      GROUP BY island 
      ORDER BY count DESC
    `);

    // 7. Recent Submissions Trend (Last 14 days)
    const [timeline]: any = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM submissions 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) 
      GROUP BY DATE(created_at) 
      ORDER BY date ASC
    `);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        today,
        thisWeek,
        thisMonth,
        statusCounts: statusCounts.reduce((acc: any, cur: any) => {
          acc[cur.status] = cur.count;
          return acc;
        }, { Submitted: 0, 'Under Review': 0, Reviewed: 0, Forwarded: 0, Rejected: 0 }),
        islandCounts,
        timeline
      }
    });

  } catch (err: any) {
    console.error('[getDashboardStats Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard statistics' });
  }
}

export async function getSubmissions(req: AuthenticatedRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '15', 10);
    const offset = (page - 1) * limit;

    const search = (req.query.search as string || '').trim();
    const island = req.query.island as string;
    const status = req.query.status as string;
    const dateRange = req.query.dateRange as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;

    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(submission_id LIKE ? OR original_submission_id LIKE ? OR full_name LIKE ? OR house_name LIKE ? OR phone LIKE ? OR email LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term, term, term);
    }

    if (island && island !== 'All') {
      conditions.push('island = ?');
      params.push(island);
    }

    if (status && status !== 'All') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (dateRange === 'today') {
      conditions.push('DATE(created_at) = CURDATE()');
    } else if (dateRange === 'yesterday') {
      conditions.push('DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)');
    } else if (dateRange === '7days') {
      conditions.push('created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
    } else if (dateRange === '30days') {
      conditions.push('created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    } else if (dateRange === 'custom' && dateFrom && dateTo) {
      conditions.push('DATE(created_at) BETWEEN ? AND ?');
      params.push(dateFrom, dateTo);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total matching count
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) AS total FROM submissions ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Paginated results
    const [rows]: any = await pool.query(
      `SELECT id, submission_id, full_name, relationship, parent_spouse_name, 
              house_name, island, pin_code, email, phone, place, submission_date, 
              status, created_at, access_token 
       FROM submissions 
       ${whereClause} 
       ORDER BY id DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      success: true,
      submissions: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err: any) {
    console.error('[getSubmissions Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve submissions' });
  }
}

export async function getSubmissionDetail(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const [subs]: any = await pool.query(
      'SELECT * FROM submissions WHERE submission_id = ? OR original_submission_id = ? ORDER BY id DESC',
      [id, id]
    );
    if (subs.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    const sub = subs[0];
    const actualSubId = sub.submission_id;

    // Fetch signature
    const [sigs]: any = await pool.query('SELECT * FROM signatures WHERE submission_id = ? LIMIT 1', [actualSubId]);
    let signatureUrl = '';
    if (sigs.length > 0) {
      const sig = sigs[0];
      const relPath = path.relative(path.resolve(__dirname, '../../uploads'), sig.file_path).replace(/\\/g, '/');
      signatureUrl = `/uploads/${relPath}`;
    }

    // Fetch objection letters (Both Letter 1 and Letter 2)
    const [letters]: any = await pool.query(
      'SELECT id, letter_number, template_version, letter_title, final_html, created_at FROM objection_letters WHERE submission_id = ? ORDER BY letter_number ASC',
      [actualSubId]
    );

    // Fetch status history
    const [history]: any = await pool.query(
      'SELECT * FROM submission_status_history WHERE submission_id = ? ORDER BY id ASC',
      [actualSubId]
    );

    // Fetch internal admin notes
    const [notes]: any = await pool.query(
      'SELECT * FROM admin_notes WHERE submission_id = ? ORDER BY id DESC',
      [actualSubId]
    );

    await logAudit({
      adminUsername: req.admin?.username,
      action: 'VIEW_SUBMISSION',
      targetType: 'Submission',
      targetId: String(id),
      details: `Viewed details for submission ${id}`,
      ipAddress: getClientIp(req)
    });

    return res.status(200).json({
      success: true,
      submission: {
        id: sub.id,
        submissionId: sub.submission_id,
        fullName: sub.full_name,
        relationship: sub.relationship,
        parentSpouseName: sub.parent_spouse_name,
        houseName: sub.house_name,
        island: sub.island,
        pinCode: sub.pin_code,
        email: sub.email,
        phone: sub.phone,
        place: sub.place,
        submissionDate: sub.submission_date,
        status: sub.status,
        submittedAt: sub.created_at,
        accessToken: sub.access_token,
        signatureUrl,
        signatureType: sigs.length > 0 ? sigs[0].signature_type : null
      },
      letters: letters.map((l: any) => ({
        letterNumber: l.letter_number,
        title: l.letter_title,
        templateVersion: l.template_version,
        finalHtml: l.final_html,
        createdAt: l.created_at,
        viewUrl: `/api/submissions/${id}/letters/${l.letter_number}/view?token=${sub.access_token}`,
        downloadUrl: `/api/submissions/${id}/letters/${l.letter_number}/download?token=${sub.access_token}`
      })),
      zipDownloadUrl: `/api/submissions/${id}/download-both?token=${sub.access_token}`,
      statusHistory: history,
      notes
    });

  } catch (err: any) {
    console.error('[getSubmissionDetail Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving submission detail' });
  }
}

export async function updateSubmissionStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ['Submitted', 'Under Review', 'Reviewed', 'Forwarded', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const [subs]: any = await pool.query('SELECT status FROM submissions WHERE submission_id = ?', [id]);
    if (subs.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const oldStatus = subs[0].status;

    await pool.query('UPDATE submissions SET status = ? WHERE submission_id = ?', [status, id]);

    await pool.query(`
      INSERT INTO submission_status_history (submission_id, old_status, new_status, changed_by, remarks)
      VALUES (?, ?, ?, ?, ?)
    `, [id, oldStatus, status, req.admin?.username || 'Admin', remarks || null]);

    await logAudit({
      adminUsername: req.admin?.username,
      action: 'UPDATE_STATUS',
      targetType: 'Submission',
      targetId: String(id),
      details: `Status changed from ${oldStatus} to ${status}. Remarks: ${remarks || 'None'}`,
      ipAddress: getClientIp(req)
    });

    return res.status(200).json({
      success: true,
      message: `Status updated successfully to ${status}`,
      oldStatus,
      newStatus: status
    });

  } catch (err: any) {
    console.error('[updateSubmissionStatus Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
}

export async function addAdminNote(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Note content cannot be empty' });
    }

    await pool.query(`
      INSERT INTO admin_notes (submission_id, admin_name, note)
      VALUES (?, ?, ?)
    `, [id, req.admin?.username || 'Admin', note.trim()]);

    await logAudit({
      adminUsername: req.admin?.username,
      action: 'ADD_NOTE',
      targetType: 'Submission',
      targetId: String(id),
      details: `Added private note to submission ${id}`,
      ipAddress: getClientIp(req)
    });

    return res.status(201).json({
      success: true,
      message: 'Note added successfully'
    });

  } catch (err: any) {
    console.error('[addAdminNote Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to save admin note' });
  }
}

export async function exportSubmissionsCsv(req: AuthenticatedRequest, res: Response) {
  try {
    const island = req.query.island as string;
    const status = req.query.status as string;

    const conditions: string[] = [];
    const params: any[] = [];

    if (island && island !== 'All') {
      conditions.push('island = ?');
      params.push(island);
    }
    if (status && status !== 'All') {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows]: any = await pool.query(`
      SELECT submission_id, full_name, relationship, parent_spouse_name, house_name,
             island, pin_code, email, phone, place, submission_date, status, created_at
      FROM submissions
      ${whereClause}
      ORDER BY id ASC
    `, params);

    // CSV header
    const headers = [
      'Submission ID',
      'Full Name',
      'Relationship',
      'Parent/Spouse Name',
      'House Name',
      'Island',
      'PIN Code',
      'Email',
      'Phone',
      'Place',
      'Submission Date',
      'Submission Time',
      'Status'
    ];

    const csvLines = [headers.map(h => `"${h}"`).join(',')];

    for (const r of rows) {
      const createdDate = new Date(r.created_at);
      const timeStr = createdDate.toTimeString().split(' ')[0];
      const values = [
        r.submission_id,
        r.full_name,
        r.relationship,
        r.parent_spouse_name,
        r.house_name,
        r.island,
        r.pin_code,
        r.email,
        r.phone,
        r.place,
        r.submission_date,
        timeStr,
        r.status
      ];
      csvLines.push(values.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
    }

    const csvContent = csvLines.join('\r\n');

    await logAudit({
      adminUsername: req.admin?.username,
      action: 'EXPORT_CSV',
      details: `Exported ${rows.length} submissions to CSV`,
      ipAddress: getClientIp(req)
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Lakshadweep_Objections_Export_${Date.now()}.csv"`);
    return res.send(csvContent);

  } catch (err: any) {
    console.error('[exportSubmissionsCsv Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate CSV export' });
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '30', 10);
    const offset = (page - 1) * limit;

    const [[{ total }]]: any = await pool.query('SELECT COUNT(*) AS total FROM audit_logs');
    const [logs]: any = await pool.query(
      'SELECT * FROM audit_logs ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs' });
  }
}

export async function updateAppSetting(req: AuthenticatedRequest, res: Response) {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ success: false, message: 'Setting key is required' });
    }

    await pool.query(
      'INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [key, String(value), String(value)]
    );

    await logAudit({
      adminUsername: req.admin?.username,
      action: 'UPDATE_SETTING',
      details: `Updated setting ${key} = ${value}`,
      ipAddress: getClientIp(req)
    });

    return res.status(200).json({ success: true, message: `Setting ${key} updated successfully` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update setting' });
  }
}

export async function updateSubmission(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const {
      fullName,
      relationship,
      parentSpouseName,
      houseName,
      island,
      pinCode,
      email,
      phone,
      place,
      submissionDate,
      status
    } = req.body;

    const [subs]: any = await pool.query('SELECT * FROM submissions WHERE submission_id = ?', [id]);
    if (subs.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    const current = subs[0];

    const updatedFullName = fullName !== undefined ? String(fullName).trim() : current.full_name;
    const updatedRelationship = relationship !== undefined ? String(relationship).trim() : current.relationship;
    const updatedParentSpouse = parentSpouseName !== undefined ? String(parentSpouseName).trim() : current.parent_spouse_name;
    const updatedHouseName = houseName !== undefined ? String(houseName).trim() : current.house_name;
    const updatedIsland = island !== undefined ? String(island).trim() : current.island;
    const updatedPinCode = pinCode !== undefined ? String(pinCode).trim() : current.pin_code;
    const updatedEmail = email !== undefined ? (String(email).trim().toLowerCase() || null) : current.email;
    const updatedPhone = phone !== undefined ? String(phone).replace(/\D/g, '').trim() : current.phone;
    const updatedPlace = place !== undefined ? String(place).trim() : current.place;
    const updatedDate = submissionDate !== undefined ? String(submissionDate).trim() : current.submission_date;
    const updatedStatus = status !== undefined ? String(status).trim() : current.status;

    await pool.query(`
      UPDATE submissions SET
        full_name = ?,
        relationship = ?,
        parent_spouse_name = ?,
        house_name = ?,
        island = ?,
        pin_code = ?,
        email = ?,
        phone = ?,
        place = ?,
        submission_date = ?,
        status = ?,
        updated_at = NOW()
      WHERE submission_id = ?
    `, [
      updatedFullName,
      updatedRelationship,
      updatedParentSpouse,
      updatedHouseName,
      updatedIsland,
      updatedPinCode,
      updatedEmail,
      updatedPhone,
      updatedPlace,
      updatedDate,
      updatedStatus,
      id
    ]);

    // Re-render objection letters final_html if text changed
    try {
      const [templates]: any = await pool.query('SELECT * FROM letter_templates WHERE is_active = TRUE ORDER BY letter_number ASC');
      const [signatures]: any = await pool.query('SELECT * FROM signatures WHERE submission_id = ? LIMIT 1', [id]);
      let sigHtml = '';
      if (signatures.length > 0 && signatures[0].file_path && fs.existsSync(signatures[0].file_path)) {
        const sigBuf = fs.readFileSync(signatures[0].file_path);
        const base64Data = `data:${signatures[0].mime_type};base64,${sigBuf.toString('base64')}`;
        sigHtml = `<img src="${base64Data}" alt="" style="max-height: 55px; max-width: 180px; object-fit: contain; vertical-align: middle;" />`;
      }

      const replacementData = {
        fullName: updatedFullName,
        relationship: updatedRelationship,
        parentSpouseName: updatedParentSpouse,
        houseName: updatedHouseName,
        island: updatedIsland,
        pinCode: updatedPinCode,
        email: updatedEmail || 'Nil',
        phone: updatedPhone,
        place: updatedPlace,
        date: updatedDate,
        signatureHtml: sigHtml
      };

      for (const tmpl of templates) {
        const finalHtml = replacePlaceholders(tmpl.content_html, replacementData);
        await pool.query(
          'UPDATE objection_letters SET final_html = ? WHERE submission_id = ? AND letter_number = ?',
          [finalHtml, id, tmpl.letter_number]
        );
      }
    } catch (tmplErr) {
      console.warn('[updateSubmission] Re-render warning:', tmplErr);
    }

    await logAudit({
      adminUsername: req.admin?.username,
      action: 'UPDATE_SUBMISSION',
      targetType: 'Submission',
      targetId: String(id),
      details: `Submission ${id} details updated by ${req.admin?.username}`,
      ipAddress: getClientIp(req)
    });

    return res.status(200).json({
      success: true,
      message: `Submission ${id} updated successfully`
    });

  } catch (err: any) {
    console.error('[updateSubmission Error]:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update submission' });
  }
}

export async function deleteSubmission(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const [subs]: any = await pool.query('SELECT * FROM submissions WHERE submission_id = ?', [id]);
    if (subs.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    const sub = subs[0];

    // Delete signature file from disk if present
    try {
      const [sigs]: any = await pool.query('SELECT file_path FROM signatures WHERE submission_id = ?', [id]);
      for (const sig of sigs) {
        if (sig.file_path && fs.existsSync(sig.file_path)) {
          fs.unlinkSync(sig.file_path);
        }
      }
    } catch (fErr) {
      console.warn('[deleteSubmission] File cleanup warning:', fErr);
    }

    // Explicitly delete from all related child tables
    await pool.query('DELETE FROM signatures WHERE submission_id = ?', [id]);
    await pool.query('DELETE FROM objection_letters WHERE submission_id = ?', [id]);
    await pool.query('DELETE FROM submission_status_history WHERE submission_id = ?', [id]);
    await pool.query('DELETE FROM admin_notes WHERE submission_id = ?', [id]);
    await pool.query('DELETE FROM submissions WHERE submission_id = ?', [id]);

    await logAudit({
      adminUsername: req.admin?.username,
      action: 'DELETE_SUBMISSION',
      targetType: 'Submission',
      targetId: String(id),
      details: `Submission ${id} (${sub.full_name}, ${sub.phone}) was deleted by admin ${req.admin?.username}`,
      ipAddress: getClientIp(req)
    });

    return res.status(200).json({
      success: true,
      message: `Submission ${id} has been permanently deleted from database.`
    });

  } catch (err: any) {
    console.error('[deleteSubmission Error]:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete submission' });
  }
}
