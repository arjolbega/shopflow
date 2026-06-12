interface orderCancelTemplateData {
  orderId: number;
  input: {
    status: string;
  };
  order: {
    first_name: string;
  };
}

export function orderCancelTemplate(data: orderCancelTemplateData): { subject: string; html: string } {
  const { orderId, input, order } = data;

  return {
    subject: `Order #${orderId} ${input.status}`,
    html: `
          <div style="font-family: DM Sans, Arial, sans-serif; background: #1a1612; color: #f5f0e8; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: #242018; border-radius: 16px; padding: 40px; border: 1px solid #2e2820;">
              <h1 style="font-size: 22px; margin-bottom: 12px;">
                Order #${orderId} has been ${input.status}
              </h1>
              <p style="color: #a09880; line-height: 1.6; margin-bottom: 24px;">
                Hi ${order.first_name}, your order has been ${input.status} by our team.
                ${input.status === "cancelled" || input.status === "refunded" ? "If a payment was made, a refund will be issued to your original payment method within 5-10 business days." : ""}
              </p>
              <p style="color: #6b6456; font-size: 13px;">
                If you have any questions please contact our support team.
              </p>
            </div>
          </div>
        `
  };
}
