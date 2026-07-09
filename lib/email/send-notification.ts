import { transporter } from './mailer'

export async function sendNotificationEmail(
  to: string,
  subject: string,
  title: string,
  message: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"AttendEase" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:420px;margin:0 auto;padding:32px">
          <h2 style="font-size:16px;font-weight:600;color:#111827;margin:0 0 8px">${title}</h2>
          <p style="color:#374151;font-size:14px;margin:0 0 20px;line-height:1.6">${message}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/notifications"
             style="display:inline-block;background:#4F46E5;color:white;padding:10px 20px;
                    border-radius:8px;text-decoration:none;font-size:13px;font-weight:500">
            View in AttendEase
          </a>
        </div>
      `,
    })
  } catch (err) {
    console.error('[send-notification-email]', err)
    throw err
  }
}
