export function resetPasswordEmailTemplate(firstName: string, resetUrl: string): { subject: string; html: string } {
  return {
    subject: "Reset your ShopFlow password",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: 'DM Sans', Arial, sans-serif; background: #1a1612; color: #f5f0e8; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: #242018; border-radius: 16px; padding: 40px; border: 1px solid #2e2820;">
            <h1 style="font-size: 24px; margin-bottom: 8px; color: #f5f0e8;">
              Reset your password
            </h1>
            <p style="color: #a09880; margin-bottom: 8px; line-height: 1.6;">
              Hi ${firstName}, we received a request to reset your password.
            </p>
            <p style="color: #a09880; margin-bottom: 32px; line-height: 1.6;">
              This link expires in 30 minutes. If you didn't request this,
              your account is safe and you can ignore this email.
            </p>
            <a href="${resetUrl}"
               style="display: inline-block; background: #f59e0b; color: #1a1612;
                      padding: 14px 32px; border-radius: 9999px; text-decoration: none;
                      font-weight: 600; font-size: 15px;">
              Reset Password
            </a>
            <p style="color: #6b6456; font-size: 13px; margin-top: 32px;">
              This link will expire in 30 minutes for security reasons.
            </p>
          </div>
        </body>
      </html>
    `
  };
}
