import { transporter } from './mailer'

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"Feelify EMS" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Feelify EMS login code',
      html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;border:1px solid #E5E7EB;border-radius:12px;padding:24px">
        <h2 style="font-size:18px;font-weight:600;color:#111827;margin:0 0 8px">Feelify EMS</h2>
        <p style="color:#6B7280;font-size:14px;margin:0 0 24px">Your one-time login code:</p>
        <div style="background:#EEF2FF;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#4F46E5;font-family:monospace">${otp}</span>
        </div>
        <p style="color:#6B7280;font-size:13px;margin:0">
          This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
    `,
    })
  } catch (error) {
    console.error('Nodemailer failed to send OTP email:', error)
    throw error
  }
}
