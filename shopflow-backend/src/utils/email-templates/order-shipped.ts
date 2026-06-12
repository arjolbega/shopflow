interface orderShippedTemplateData {
  orderId: number;
  order: {
    first_name: string;
  };
}

export function orderShippedTemplate(data: orderShippedTemplateData): { subject: string; html: string } {
  const { orderId, order } = data;

  return {
    subject: `Your order #${orderId} has shipped!`,
    html: `
          <div style="font-family: DM Sans, Arial, sans-serif; background: #1a1612; color: #f5f0e8; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: #242018; border-radius: 16px; padding: 40px; border: 1px solid #2e2820;">
              <h1 style="font-size: 22px; margin-bottom: 12px;">
                Your order is on its way! 🚚
              </h1>
              <p style="color: #a09880; line-height: 1.6; margin-bottom: 24px;">
                Hi ${order.first_name}, order #${orderId} has been shipped and is on its way to you.
              </p>
              <a href="${process.env.FRONTEND_URL}/orders/${orderId}"
                 style="display: inline-block; background: #f59e0b; color: #1a1612;
                        padding: 14px 32px; border-radius: 9999px; text-decoration: none;
                        font-weight: 600;">
                Track Order
              </a>
            </div>
          </div>
        `
  };
}
