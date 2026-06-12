interface OrderItem {
  product_name: string;
  quantity: string;
  price: string;
  subtotal: string;
}

interface OrderConfirmationData {
  firstName: string;
  orderId: number;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: {
    full_name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export function orderConfirmationTemplate(data: OrderConfirmationData): { subject: string; html: string } {
  const { firstName, orderId, items, subtotal, shippingCost, tax, total, shippingAddress } = data;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #2e2820; color: #f5f0e8;">
        ${item.product_name} × ${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #2e2820; color: #f5f0e8; text-align: right;">
        $${parseFloat(item.subtotal).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  return {
    subject: `Order Confirmed — ShopFlow #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: 'DM Sans', Arial, sans-serif; background: #1a1612; color: #f5f0e8; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: #242018; border-radius: 16px; padding: 40px; border: 1px solid #2e2820;">

            <h1 style="font-size: 24px; margin-bottom: 4px;">Order Confirmed! 🎉</h1>
            <p style="color: #a09880; margin-bottom: 32px;">
              Hi ${firstName}, thanks for your order. We'll let you know when it ships.
            </p>

            <div style="background: #1a1612; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #a09880; font-size: 13px; margin-bottom: 4px;">ORDER NUMBER</p>
              <p style="font-size: 18px; font-weight: 600; color: #f59e0b;">#${orderId}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              ${itemsHtml}
              <tr>
                <td style="padding: 8px 0; color: #a09880;">Subtotal</td>
                <td style="padding: 8px 0; color: #a09880; text-align: right;">$${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #a09880;">Shipping</td>
                <td style="padding: 8px 0; color: #a09880; text-align: right;">
                  ${shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #a09880;">Tax</td>
                <td style="padding: 8px 0; color: #a09880; text-align: right;">$${tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0 0; font-weight: 700; font-size: 18px;">Total</td>
                <td style="padding: 12px 0 0; font-weight: 700; font-size: 18px; text-align: right; color: #f59e0b;">
                  $${total.toFixed(2)}
                </td>
              </tr>
            </table>

            <div style="background: #1a1612; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #a09880; font-size: 13px; margin-bottom: 8px;">SHIPPING TO</p>
              <p style="margin: 0; line-height: 1.6;">
                ${shippingAddress.full_name}<br/>
                ${shippingAddress.line1}
                ${shippingAddress.line2 ? `<br/>${shippingAddress.line2}` : ""}
                <br/>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}
                <br/>${shippingAddress.country}
              </p>
            </div>

            <a href="${process.env.FRONTEND_URL}/orders/${orderId}"
               style="display: inline-block; background: #f59e0b; color: #1a1612;
                      padding: 14px 32px; border-radius: 9999px; text-decoration: none;
                      font-weight: 600; font-size: 15px;">
              View Order
            </a>

          </div>
        </body>
      </html>
    `
  };
}
