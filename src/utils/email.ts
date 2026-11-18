import nodemailer from 'nodemailer';
import { config } from '../config/index.js';


/**
 * Build a reusable nodemailer transporter.
 *
 * In development (no SMTP credentials configured) it falls back to the
 * Ethereal fake SMTP service and prints the preview URL to the console,
 * so you can inspect the email without a real mail server.
 */
const createTransporter = async () => {
  if (config.smtpUser && config.smtpPass) {
    return nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  // Development fallback — Ethereal fake SMTP
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log('[email] No SMTP credentials found — using Ethereal test account');
  console.log(`[email] Ethereal user: ${testAccount.user}`);
  return transporter;
};

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ to, subject, html }: SendMailOptions): Promise<void> => {
  const transporter = await createTransporter();

  const info = await transporter.sendMail({
    from: `"My Budget App" <${config.emailFrom}>`,
    to,
    subject,
    html,
  });

  if (config.nodeEnv !== 'production') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[email] Preview URL: ${previewUrl}`);
    }
  }
};

/**
 * Send the password-reset email.
 * `resetUrl` is the full deep-link (e.g. mybudget://auth/reset-password?token=xxx)
 * that the mobile app will open to complete the reset.
 */
export const sendPasswordResetEmail = async (
  to: string,
  firstName: string | null,
  resetUrl: string,
  expiryMinutes: number,
): Promise<void> => {
  const name = firstName ?? 'there';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset your password</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                 background: #f8f8f8; margin: 0; padding: 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0"
                   style="background: #ffffff; border-radius: 12px;
                          box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 40px;">
              <tr>
                <td>
                  <h2 style="margin: 0 0 8px; font-size: 22px; color: #111;">
                    Reset your password
                  </h2>
                  <p style="margin: 0 0 24px; color: #555; font-size: 15px;">
                    Hi ${name}, we received a request to reset your My Budget password.
                    Tap the button below to choose a new password.
                    The link expires in <strong>${expiryMinutes} minutes</strong>.
                  </p>

                  <a href="${resetUrl}"
                     style="display: inline-block; background: #111; color: #fff;
                            text-decoration: none; padding: 14px 32px;
                            border-radius: 8px; font-size: 15px; font-weight: 600;">
                    Reset Password
                  </a>

                  <p style="margin: 24px 0 0; color: #888; font-size: 13px;">
                    If you didn&apos;t request this, you can safely ignore this email.
                    Your password will not change.
                  </p>

                  <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;" />
                  <p style="margin: 0; color: #bbb; font-size: 12px;">
                    My Budget App · This is an automated message, please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendMail({ to, subject: 'Reset your My Budget password', html });
};