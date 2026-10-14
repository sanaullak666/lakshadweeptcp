import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import pool from '../config/database';
import { generateSubmissionId, generateAccessToken, sanitizeFilename } from '../utils/idGenerator';
import jwt from 'jsonwebtoken';
import { replacePlaceholders } from '../services/templateService';
import { generatePdf } from '../services/pdfService';
import { createZipArchive } from '../services/zipService';
import { sendConfirmationEmail } from '../services/emailService';

export async function createSubmission(req: Request, res: Response) {
  const connection = await pool.getConnection();

  try {
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
      date,
      signatureType,
      signatureData,
      idempotencyKey
    } = req.body;

    // Check idempotency if key provided
    if (idempotencyKey) {
      const [existing]: any = await pool.query(
        'SELECT submission_id, access_token FROM submissions WHERE idempotency_key = ?',
        [idempotencyKey]
      );
      if (existing.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'Submission already processed (idempotent request)',
          submissionId: existing[0].submission_id,
          accessToken: existing[0].access_token
        });
      }
    }

    // Process signature
    let signatureFilePath = '';
    let signatureMime = 'image/png';
    let signatureHtml = '';

    const isServerlessReq = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
    const uploadsBase = isServerlessReq
      ? path.join(os.tmpdir(), 'uploads', 'signatures')
      : path.resolve(__dirname, '../../uploads/signatures');
    if (!fs.existsSync(uploadsBase)) {
      fs.mkdirSync(uploadsBase, { recursive: true });
    }

    if (signatureType === 'drawn' && signatureData) {
      // Decode data URL
      const matches = signatureData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ success: false, message: 'Invalid signature canvas image data' });
      }
      signatureMime = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `sig-drawn-${Date.now()}-${Math.round(Math.random() * 1e6)}.png`;
      signatureFilePath = path.join(uploadsBase, filename);
      fs.writeFileSync(signatureFilePath, buffer);
      signatureHtml = `<img src="${signatureData}" alt="" style="max-height: 55px; max-width: 180px; object-fit: contain; vertical-align: middle;" />`;
    } else if (req.file) {
      signatureFilePath = req.file.path;
      signatureMime = req.file.mimetype;
      const fileBuffer = fs.readFileSync(signatureFilePath);
      const base64Data = `data:${signatureMime};base64,${fileBuffer.toString('base64')}`;
      signatureHtml = `<img src="${base64Data}" alt="" style="max-height: 55px; max-width: 180px; object-fit: contain; vertical-align: middle;" />`;
    } else {
      return res.status(400).json({ success: false, message: 'Applicant signature is required' });
    }

    // Begin Transaction
    await connection.beginTransaction();

    // 1. Generate Submission ID and Access Token
    const submissionId = await generateSubmissionId();
    const accessToken = generateAccessToken();

    // 2. Fetch ACTIVE Letter 1, Letter 2, and Letter 3 templates
    const [templates1]: any = await connection.query(
      'SELECT * FROM letter_templates WHERE letter_number = 1 AND is_active = TRUE LIMIT 1'
    );
    const [templates2]: any = await connection.query(
      'SELECT * FROM letter_templates WHERE letter_number = 2 AND is_active = TRUE LIMIT 1'
    );
    const [templates3]: any = await connection.query(
      'SELECT * FROM letter_templates WHERE letter_number = 3 AND is_active = TRUE LIMIT 1'
    );

    if (templates1.length === 0 || templates2.length === 0 || templates3.length === 0) {
      await connection.rollback();
      return res.status(500).json({
        success: false,
        message: 'Active objection letter templates not found. Please contact administrator.'
      });
    }

    const tmpl1 = templates1[0];
    const tmpl2 = templates2[0];
    const tmpl3 = templates3[0];

    // 3. Prepare replacement data
    const replacementData = {
      fullName,
      relationship,
      parentSpouseName,
      houseName,
      island,
      pinCode,
      email,
      phone,
      place,
      date,
      signatureHtml
    };

    // 4. Generate final HTML for all three letters
    const finalHtml1 = replacePlaceholders(tmpl1.content_html, replacementData);
    const finalHtml2 = replacePlaceholders(tmpl2.content_html, replacementData);
    const finalHtml3 = replacePlaceholders(tmpl3.content_html, replacementData);

    // 5. Generate PDFs for all three letters
    const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
    const baseStorage = isServerless ? path.join(os.tmpdir(), 'pdfs') : path.resolve(__dirname, '../../storage/pdfs');
    const pdfDir = path.join(baseStorage, submissionId);
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const sanitizedName = fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const pdfName1 = `Objection_Letter_1_${submissionId}_${sanitizedName}.pdf`;
    const pdfPath1 = path.join(pdfDir, pdfName1);

    const pdfName2 = `Objection_Letter_2_${submissionId}_${sanitizedName}.pdf`;
    const pdfPath2 = path.join(pdfDir, pdfName2);

    const pdfName3 = `Objection_Letter_3_${submissionId}_${sanitizedName}.pdf`;
    const pdfPath3 = path.join(pdfDir, pdfName3);

    // Generate Letter 1 PDF
    await generatePdf({
      contentHtml: finalHtml1,
      outputPath: pdfPath1,
      title: tmpl1.title,
      submissionId
    });

    // Generate Letter 2 PDF
    await generatePdf({
      contentHtml: finalHtml2,
      outputPath: pdfPath2,
      title: tmpl2.title,
      submissionId
    });

    // Generate Letter 3 PDF
    await generatePdf({
      contentHtml: finalHtml3,
      outputPath: pdfPath3,
      title: tmpl3.title,
      submissionId
    });

    // 6. Generate ZIP bundling all three letters
    const zipName = `${submissionId}_Objection_Letters.zip`;
    const zipPath = path.join(pdfDir, zipName);
    await createZipArchive([
      { filePath: pdfPath1, entryName: pdfName1 },
      { filePath: pdfPath2, entryName: pdfName2 },
      { filePath: pdfPath3, entryName: pdfName3 }
    ], zipPath);

    // 7. Save Submission record
    const clientIp = req.ip || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    await connection.query(`
      INSERT INTO submissions (
        submission_id, access_token, full_name, relationship, parent_spouse_name,
        house_name, island, pin_code, email, phone, place, submission_date,
        status, idempotency_key, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', ?, ?, ?)
    `, [
      submissionId, accessToken, fullName, relationship, parentSpouseName,
      houseName, island, pinCode, email, phone, place, date,
      idempotencyKey || null, clientIp, userAgent
    ]);

    // 8. Save Signature record
    await connection.query(`
      INSERT INTO signatures (submission_id, signature_type, file_path, mime_type)
      VALUES (?, ?, ?, ?)
    `, [submissionId, signatureType, signatureFilePath, signatureMime]);

    // 9. Save Letter 1 in objection_letters (IMMUTABLE)
    await connection.query(`
      INSERT INTO objection_letters (
        submission_id, letter_number, template_version, letter_title, final_html, pdf_path
      ) VALUES (?, 1, ?, ?, ?, ?)
    `, [submissionId, tmpl1.version, tmpl1.title, finalHtml1, pdfPath1]);

    // 10. Save Letter 2 in objection_letters (IMMUTABLE)
    await connection.query(`
      INSERT INTO objection_letters (
        submission_id, letter_number, template_version, letter_title, final_html, pdf_path
      ) VALUES (?, 2, ?, ?, ?, ?)
    `, [submissionId, tmpl2.version, tmpl2.title, finalHtml2, pdfPath2]);

    // 11. Save Letter 3 in objection_letters (IMMUTABLE)
    await connection.query(`
      INSERT INTO objection_letters (
        submission_id, letter_number, template_version, letter_title, final_html, pdf_path
      ) VALUES (?, 3, ?, ?, ?, ?)
    `, [submissionId, tmpl3.version, tmpl3.title, finalHtml3, pdfPath3]);

    // 12. Record initial status history
    await connection.query(`
      INSERT INTO submission_status_history (submission_id, old_status, new_status, changed_by, remarks)
      VALUES (?, 'None', 'Submitted', 'Applicant', 'Initial submission received and verified')
    `, [submissionId]);

    // Commit Transaction
    await connection.commit();

    // Trigger async email confirmation (non-blocking)
    sendConfirmationEmail({
      toEmail: email,
      applicantName: fullName,
      submissionId,
      submissionDate: date,
      pdfPaths: [pdfPath1, pdfPath2, pdfPath3]
    }).catch(err => console.error('[Submission] Email error:', err));

    return res.status(201).json({
      success: true,
      message: 'Your objections have been submitted successfully. Three distinct objection letters have been generated.',
      submissionId,
      accessToken,
      submissionDate: date,
      applicant: {
        fullName,
        relationship,
        parentSpouseName,
        houseName,
        island,
        pinCode,
        email,
        phone,
        place
      },
      letters: [
        {
          letterNumber: 1,
          title: tmpl1.title,
          downloadUrl: `/api/submissions/${submissionId}/letters/1/download?token=${accessToken}`,
          viewUrl: `/api/submissions/${submissionId}/letters/1/view?token=${accessToken}`
        },
        {
          letterNumber: 2,
          title: tmpl2.title,
          downloadUrl: `/api/submissions/${submissionId}/letters/2/download?token=${accessToken}`,
          viewUrl: `/api/submissions/${submissionId}/letters/2/view?token=${accessToken}`
        },
        {
          letterNumber: 3,
          title: tmpl3.title,
          downloadUrl: `/api/submissions/${submissionId}/letters/3/download?token=${accessToken}`,
          viewUrl: `/api/submissions/${submissionId}/letters/3/view?token=${accessToken}`
        }
      ],
      zipDownloadUrl: `/api/submissions/${submissionId}/download-both?token=${accessToken}`
    });

  } catch (error: any) {
    await connection.rollback();
    console.error('[createSubmission Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process objection submission. Transaction rolled back safely.',
      error: error.message
    });
  } finally {
    connection.release();
  }
}

export async function getSubmissionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const token = req.query.token as string;

    const [subs]: any = await pool.query(
      'SELECT * FROM submissions WHERE submission_id = ?',
      [id]
    );

    if (subs.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const sub = subs[0];

    // For public tracking, if token is not provided or mismatched, return safe non-sensitive summary
    const isAuthorized = token && token === sub.access_token;

    const [letters]: any = await pool.query(
      'SELECT letter_number, template_version, letter_title, created_at FROM objection_letters WHERE submission_id = ? ORDER BY letter_number ASC',
      [id]
    );

    if (!isAuthorized) {
      return res.status(200).json({
        success: true,
        submissionId: sub.submission_id,
        submissionDate: sub.submission_date,
        island: sub.island,
        status: sub.status,
        letterCount: letters.length,
        submittedAt: sub.created_at,
        authorized: false
      });
    }

    return res.status(200).json({
      success: true,
      authorized: true,
      submission: {
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
        submittedAt: sub.created_at
      },
      letters: letters.map((l: any) => ({
        letterNumber: l.letter_number,
        title: l.letter_title,
        templateVersion: l.template_version,
        createdAt: l.created_at,
        viewUrl: `/api/submissions/${id}/letters/${l.letter_number}/view?token=${sub.access_token}`,
        downloadUrl: `/api/submissions/${id}/letters/${l.letter_number}/download?token=${sub.access_token}`
      })),
      zipDownloadUrl: `/api/submissions/${id}/download-both?token=${sub.access_token}`
    });

  } catch (err: any) {
    console.error('[getSubmissionById Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving submission' });
  }
}

function isAuthorizedForSubmission(req: Request, submissionAccessToken: string): boolean {
  const token = req.query.token as string;
  if (token && token === submissionAccessToken) {
    return true;
  }
  if ((req as any).admin) {
    return true;
  }
  const authHeader = req.headers.authorization;
  const adminTokenParam = (req.query.admin_token || req.query.adminToken) as string;
  const jwtCandidate = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null) || adminTokenParam;
  if (jwtCandidate) {
    try {
      const secret = process.env.JWT_SECRET || 'lakshadweep_town_country_planning_secure_jwt_secret_2026_super_key';
      const decoded = jwt.verify(jwtCandidate, secret) as any;
      if (decoded && decoded.id) {
        return true;
      }
    } catch {
      // not a valid admin JWT
    }
  }
  return false;
}

export async function getLetterHtml(req: Request, res: Response) {
  try {
    const { id, letterNumber } = req.params;

    const [subs]: any = await pool.query('SELECT access_token FROM submissions WHERE submission_id = ?', [id]);
    if (subs.length === 0) {
      return res.status(404).send('Submission not found');
    }

    // Require token or admin authorization
    if (!isAuthorizedForSubmission(req, subs[0].access_token)) {
      return res.status(403).send('Unauthorized to view this objection letter');
    }

    const [letters]: any = await pool.query(
      'SELECT final_html, letter_title FROM objection_letters WHERE submission_id = ? AND letter_number = ?',
      [id, parseInt(String(letterNumber), 10)]
    );

    if (letters.length === 0) {
      return res.status(404).send('Objection letter not found');
    }

    const letter = letters[0];

    // Return standalone HTML page for viewing or printing
    const responseHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${letter.letter_title} - ${id}</title>
        <style>
          @page {
            size: A4;
            margin: 25.4mm 25.4mm 25.4mm 25.4mm;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }
          body {
            font-family: 'Times New Roman', Times, Georgia, serif;
            font-size: 12pt;
            line-height: 1.35;
            color: #000;
            margin: 0;
            padding: 24px;
            background: #f1f5f9;
          }
          .container {
            max-width: 820px;
            margin: 0 auto;
            background: #fff;
            padding: 25.4mm;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            border: 1px solid #cbd5e1;
          }
          .action-bar {
            max-width: 820px;
            margin: 0 auto 16px auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .btn {
            background: #0B3B60;
            color: #fff;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            font-family: sans-serif;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .btn:hover {
            opacity: 0.9;
          }
          p {
            margin: 0 0 8pt 0;
          }
          ul, ol {
            margin: 0 0 10pt 0;
            padding-left: 20pt;
          }
          li {
            margin-bottom: 6pt;
          }
          table {
            border-collapse: collapse;
          }
          table.content-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin: 14pt 0;
            font-size: 10pt;
            line-height: 1.25;
          }
          table.content-table th, table.content-table td {
            border: 1px solid #000;
            padding: 5pt 6pt;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
          }
          table.content-table th {
            font-weight: bold;
            background-color: #fff;
          }
          .signature-container {
            height: 55px;
            max-width: 200px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            margin: 4pt 0;
          }
          .signature-container img {
            max-height: 55px;
            max-width: 180px;
            object-fit: contain;
            vertical-align: middle;
          }
          @media print {
            body {
              background: #fff;
              padding: 0;
            }
            .container {
              box-shadow: none;
              border: none;
              padding: 0;
              max-width: 100%;
            }
            .action-bar {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="action-bar">
          <span style="font-family: sans-serif; font-size: 13px; color: #64748b;">Submission ID: <strong>${id}</strong></span>
          <div>
            <button onclick="window.print()" class="btn">🖨️ Print Letter</button>
            <a href="/api/submissions/${id}/letters/${letterNumber}/download?token=${subs[0].access_token || ''}" class="btn" style="background: #0284c7;">📥 Download PDF</a>
          </div>
        </div>
        <div class="container">
          ${letter.final_html}
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(responseHtml);

  } catch (err: any) {
    console.error('[getLetterHtml Error]:', err);
    return res.status(500).send('Server error retrieving objection letter');
  }
}

export async function downloadLetterPdf(req: Request, res: Response) {
  try {
    const { id, letterNumber } = req.params;

    const [subs]: any = await pool.query('SELECT access_token FROM submissions WHERE submission_id = ?', [id]);
    if (subs.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (!isAuthorizedForSubmission(req, subs[0].access_token)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to download this objection letter' });
    }

    const [letters]: any = await pool.query(
      'SELECT pdf_path, letter_number FROM objection_letters WHERE submission_id = ? AND letter_number = ?',
      [id, parseInt(String(letterNumber), 10)]
    );

    if (letters.length === 0 || !fs.existsSync(letters[0].pdf_path)) {
      return res.status(404).json({ success: false, message: 'PDF file not found on server' });
    }

    const lNum = parseInt(String(letterNumber), 10);
    const subRows: any = await pool.query('SELECT full_name FROM submissions WHERE submission_id = ?', [id]);
    const safeName = (subRows[0][0]?.full_name || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const defaultFilename = `Objection_Letter_${lNum}_${id}_${safeName}.pdf`;
    const filename = letters[0].pdf_path && fs.existsSync(letters[0].pdf_path)
      ? path.basename(letters[0].pdf_path)
      : defaultFilename;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return fs.createReadStream(letters[0].pdf_path).pipe(res);

  } catch (err: any) {
    console.error('[downloadLetterPdf Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error downloading PDF' });
  }
}

export async function downloadBothLettersZip(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const [subs]: any = await pool.query('SELECT access_token FROM submissions WHERE submission_id = ?', [id]);
    if (subs.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (!isAuthorizedForSubmission(req, subs[0].access_token)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to download objection archive' });
    }

    const isServerlessReq = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
    const pdfDir = isServerlessReq
      ? path.join(os.tmpdir(), 'pdfs', id)
      : path.resolve(__dirname, `../../storage/pdfs/${id}`);
    const zipPath = path.join(pdfDir, `${id}_Objection_Letters.zip`);

    const [letters]: any = await pool.query(
      'SELECT pdf_path, letter_number FROM objection_letters WHERE submission_id = ? ORDER BY letter_number ASC',
      [id]
    );

    if (letters.length === 0) {
      return res.status(404).json({ success: false, message: 'Objection letters not found' });
    }

    const zipEntries = letters
      .filter((l: any) => fs.existsSync(l.pdf_path))
      .map((l: any) => ({
        filePath: l.pdf_path,
        entryName: path.basename(l.pdf_path)
      }));

    if (zipEntries.length > 0 && (!fs.existsSync(zipPath) || zipEntries.length >= 3)) {
      await createZipArchive(zipEntries, zipPath);
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${id}_Objection_Letters.zip"`);
    return fs.createReadStream(zipPath).pipe(res);

  } catch (err: any) {
    console.error('[downloadBothLettersZip Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error downloading ZIP archive' });
  }
}

export async function getPublicSettings(_req: Request, res: Response) {
  try {
    const [rows]: any = await pool.query('SELECT setting_key, setting_value FROM app_settings');
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }
    return res.status(200).json({ success: true, settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
}
