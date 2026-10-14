import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../services/auditService';
import { replacePlaceholders } from '../services/templateService';

export async function getTemplates(req: Request, res: Response) {
  try {
    const [templates]: any = await pool.query(
      'SELECT id, letter_number, title, version, subject, reference, is_active, created_by, created_at, updated_at FROM letter_templates ORDER BY letter_number ASC, id DESC'
    );
    return res.status(200).json({ success: true, templates });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve templates' });
  }
}

export async function getTemplateById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const [templates]: any = await pool.query('SELECT * FROM letter_templates WHERE id = ?', [id]);
    if (templates.length === 0) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.status(200).json({ success: true, template: templates[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving template' });
  }
}

export async function previewTemplate(req: Request, res: Response) {
  try {
    const { contentHtml, sampleData } = req.body;
    if (!contentHtml) {
      return res.status(400).json({ success: false, message: 'Template HTML content is required' });
    }

    const defaultSample = {
      fullName: 'Mohammed Kasim',
      relationship: 'S/o',
      parentSpouseName: 'Cheriyakoya P',
      houseName: 'Beach Road House',
      island: 'Kavaratti',
      pinCode: '682555',
      email: 'applicant@example.com',
      phone: '9876543210',
      place: 'Kavaratti',
      date: '14.10.2026',
      signatureHtml: '<div style="font-family: cursive; font-size: 20px; color: #0f172a; border-bottom: 1px solid #94a3b8; display: inline-block; padding: 0 10px;">M. Kasim</div>'
    };

    const previewHtml = replacePlaceholders(contentHtml, sampleData || defaultSample);
    return res.status(200).json({ success: true, previewHtml });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to preview template' });
  }
}

export async function createTemplateVersion(req: AuthenticatedRequest, res: Response) {
  try {
    const { letterNumber, title, version, subject, reference, copyTo, contentHtml, activateImmediately } = req.body;

    if (!letterNumber || !title || !version || !contentHtml) {
      return res.status(400).json({ success: false, message: 'Required template fields are missing' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (activateImmediately) {
        // Deactivate previous active template for this letter number
        await connection.query(
          'UPDATE letter_templates SET is_active = FALSE WHERE letter_number = ?',
          [letterNumber]
        );
      }

      const [result]: any = await connection.query(`
        INSERT INTO letter_templates (
          letter_number, title, version, subject, reference, copy_to, content_html, is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        letterNumber,
        title,
        version,
        subject || '',
        reference || '',
        typeof copyTo === 'string' ? copyTo : JSON.stringify(copyTo || []),
        contentHtml,
        activateImmediately ? 1 : 0,
        req.admin?.username || 'Admin'
      ]);

      await connection.commit();

      await logAudit({
        adminUsername: req.admin?.username,
        action: 'CREATE_TEMPLATE_VERSION',
        targetType: 'Template',
        targetId: String(result.insertId),
        details: `Created new template version ${version} for Letter ${letterNumber} (Active: ${activateImmediately})`,
        ipAddress: req.ip
      });

      return res.status(201).json({
        success: true,
        message: `Template version ${version} created successfully. Note: Existing submitted letters remain immutable.`,
        templateId: result.insertId
      });

    } catch (e: any) {
      await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }

  } catch (err: any) {
    console.error('[createTemplateVersion Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to create template version' });
  }
}

export async function activateTemplateVersion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const [templates]: any = await pool.query('SELECT letter_number, version FROM letter_templates WHERE id = ?', [id]);
    if (templates.length === 0) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const { letter_number, version } = templates[0];

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Deactivate all versions for this letter
      await connection.query(
        'UPDATE letter_templates SET is_active = FALSE WHERE letter_number = ?',
        [letter_number]
      );

      // Activate this specific version
      await connection.query(
        'UPDATE letter_templates SET is_active = TRUE WHERE id = ?',
        [id]
      );

      await connection.commit();

      await logAudit({
        adminUsername: req.admin?.username,
        action: 'ACTIVATE_TEMPLATE_VERSION',
        targetType: 'Template',
        targetId: String(id),
        details: `Activated version ${version} for Letter ${letter_number}. Will apply to future submissions only.`,
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: `Template version ${version} is now ACTIVE for future submissions. Existing submissions remain frozen and unchanged.`
      });

    } catch (e) {
      await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }

  } catch (err: any) {
    console.error('[activateTemplateVersion Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to activate template version' });
  }
}
