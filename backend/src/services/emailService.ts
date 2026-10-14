import nodemailer from 'nodemailer';

export interface ConfirmationEmailData {
  toEmail: string;
  applicantName: string;
  submissionId: string;
  submissionDate: string;
  pdfPaths?: string[];
}

export async function sendConfirmationEmail(data: ConfirmationEmailData): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[EmailService] SMTP not configured. Simulating confirmation email to ${data.toEmail} for submission ${data.submissionId}`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const publicUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    await transporter.sendMail({
      from: `"Lakshadweep Objections Portal" <${smtpUser}>`,
      to: data.toEmail,
      subject: `Objection Submission Confirmation – ${data.submissionId}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
          <h2 style="color: #0B3B60; border-bottom: 2px solid #0B3B60; padding-bottom: 8px;">Union Territory of Lakshadweep</h2>
          <h3 style="color: #1e293b;">Objection Submission Confirmation</h3>
          <p>Dear <strong>${data.applicantName}</strong>,</p>
          <p>Your objections to the <strong>Draft Lakshadweep Town and Country Planning and Development Rules, 2026</strong> have been successfully registered.</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Submission ID:</strong> <span style="font-size: 16px; color: #0284c7; font-weight: bold;">${data.submissionId}</span></p>
            <p style="margin: 4px 0;"><strong>Submission Date:</strong> ${data.submissionDate}</p>
            <p style="margin: 4px 0;"><strong>Letters Generated:</strong> 2 Separate Formal Objection Letters</p>
          </div>

          <p>As per statutory requirements, two distinct formal objection letters have been prepared:</p>
          <ol style="margin-left: 20px;">
            <li><strong>Objection Letter 1:</strong> Draft Planning and Development Board Rules, 2026</li>
            <li><strong>Objection Letter 2:</strong> Draft Chief Town Planner Qualifications Rules, 2026</li>
          </ol>

          <p>You can track your submission and download your signed letters at any time via the link below:</p>
          <p style="margin: 25px 0;">
            <a href="${publicUrl}/track?id=${data.submissionId}" style="background-color: #0B3B60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Your Submission</a>
          </p>

          <p style="font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            This is an automated acknowledgment from the Lakshadweep Public Objections Portal. Please retain your Submission ID for all future correspondence.
          </p>
        </div>
      `
    });

    console.log(`[EmailService] Confirmation email sent to ${data.toEmail}`);
    return true;
  } catch (err) {
    console.error('[EmailService] Failed to send email:', err);
    return false;
  }
}
