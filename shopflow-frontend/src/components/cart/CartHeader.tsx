import { Trash2, X } from "lucide-react";
import type { Cart } from "../../types";
import { cartApi } from "../../api/cart.api";
import { useToast } from "../../hooks/useToast";
import { useCartStore } from "../../store/cartStore";

interface CartHeaderProps {
  isEmpty: boolean;
  cart: Cart | null;
}

const CartHeader = ({ isEmpty, cart }: CartHeaderProps) => {
  const { closeCart, clearCart } = useCartStore();
  const toast = useToast();

  const handleClear = async () => {
    try {
      await cartApi.clear();
      clearCart();
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Cart
        </h2>
        {!isEmpty && <span className="px-2 py-0.5 bg-accent text-bg-base text-xs font-bold rounded-full">{cart!.itemCount}</span>}
      </div>
      <div className="flex items-center gap-2">
        {!isEmpty && (
          <button onClick={handleClear} className="p-2 text-text-muted hover:text-error transition-colors rounded-lg hover:bg-error/10 cursor-pointer" title="Clear cart">
            <Trash2 size={16} />
          </button>
        )}
        <button onClick={closeCart} className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-bg-subtle cursor-pointer">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default CartHeader;
