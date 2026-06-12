import { useCartStore } from "../../store/cartStore";
import { SHIPPING_THRESHOLD } from "../../utils/constants";
import { formatPrice } from "../../utils/formatPrice";

const FreeShippingProgress = () => {
  const { cart } = useCartStore();

  const freeShippingProgress = cart ? Math.min((cart.subtotal / SHIPPING_THRESHOLD) * 100, 100) : 0;
  const amountToFreeShipping = Math.max(0, SHIPPING_THRESHOLD - (cart?.subtotal ?? 0));

  return (
    <div className="px-6 py-3 bg-bg-surface border-b border-border">
      {amountToFreeShipping > 0 ? (
        <p className="text-xs text-text-secondary mb-2">
          Add <span className="text-accent font-semibold">{formatPrice(amountToFreeShipping)}</span> more for free shipping
        </p>
      ) : (
        <p className="text-xs text-success font-medium mb-2">🎉 You've unlocked free shipping!</p>
      )}
      <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${freeShippingProgress}%` }} />
      </div>
    </div>
  );
};

export default FreeShippingProgress;
