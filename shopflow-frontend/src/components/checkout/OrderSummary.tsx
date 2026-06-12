import { useCartStore } from "../../store/cartStore";
import { formatPrice } from "../../utils/formatPrice";
import OrderSummaryHeader from "./OrderSummaryHeader";

interface OrderSummaryProps {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

const OrderSummary = ({ subtotal, shippingCost, tax, total }: OrderSummaryProps) => {
  const { cart } = useCartStore();

  return (
    <div className="sticky top-24">
      <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden">
        <OrderSummaryHeader />

        {/* Items */}
        <div className="px-6 py-4 flex flex-col gap-3 max-h-64 overflow-y-auto">
          {cart?.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg-elevated flex-shrink-0 border border-border">{item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg opacity-30">📦</div>}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium truncate">{item.name}</p>
                <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-medium text-text-primary flex-shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
                {formatPrice(parseFloat(item.price) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-6 py-4 border-t border-border flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Subtotal</span>
            <span className="text-text-primary" style={{ fontFamily: "var(--font-mono)" }}>
              {formatPrice(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Shipping</span>
            <span className={shippingCost === 0 ? "text-success text-sm" : "text-text-primary text-sm"} style={{ fontFamily: "var(--font-mono)" }}>
              {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Tax (8%)</span>
            <span className="text-text-primary" style={{ fontFamily: "var(--font-mono)" }}>
              {formatPrice(tax)}
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t border-border">
            <span className="font-bold text-text-primary">Total</span>
            <span className="font-bold text-xl text-accent" style={{ fontFamily: "var(--font-mono)" }}>
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
