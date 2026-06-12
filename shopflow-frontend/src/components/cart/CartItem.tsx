import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import type { CartItem as CartItemType, ApiError } from "../../types";
import { cartApi } from "../../api/cart.api";
import { useCartStore } from "../../store/cartStore";
import { useToast } from "../../hooks/useToast";
import { formatPrice } from "../../utils/formatPrice";
import { cn } from "../../utils/cn";
import axios from "axios";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { setCart } = useCartStore();
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantity = async (newQty: number) => {
    if (newQty < 1 || newQty > item.stock) return;
    setIsUpdating(true);
    try {
      const cart = await cartApi.update(item.product_id, newQty);
      setCart(cart);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ApiError;
        toast.error(data?.error?.message || "Failed to update");
      } else {
        toast.error("Failed to update");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const cart = await cartApi.remove(item.product_id);
      setCart(cart);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className={cn("flex gap-4 py-4", "border-b border-border last:border-0", "transition-opacity duration-200", isRemoving && "opacity-50 pointer-events-none")}>
      <Link to={`/products/${item.slug}`} className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-bg-elevated border border-border">
        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">📦</div>}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${item.slug}`} className="text-sm font-medium text-text-primary hover:text-accent transition-colors leading-snug line-clamp-2">
            {item.name}
          </Link>
          <button onClick={handleRemove} className="flex-shrink-0 p-1 text-text-muted hover:text-error transition-colors cursor-pointer rounded-lg hover:bg-error/10">
            <X size={14} />
          </button>
        </div>

        <p className="text-sm font-semibold text-accent" style={{ fontFamily: "var(--font-mono)" }}>
          {formatPrice(item.price)}
        </p>

        <div className="flex items-center gap-2 mt-auto">
          <div className={cn("flex items-center border border-border rounded-lg overflow-hidden", isUpdating && "opacity-60")}>
            <button onClick={() => handleQuantity(item.quantity - 1)} disabled={isUpdating || item.quantity <= 1} className="px-2.5 py-1.5 text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
              <Minus size={12} />
            </button>
            <span className="px-3 py-1.5 text-sm font-medium text-text-primary min-w-[2.5rem] text-center">{item.quantity}</span>
            <button onClick={() => handleQuantity(item.quantity + 1)} disabled={isUpdating || item.quantity >= item.stock} className="px-2.5 py-1.5 text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
              <Plus size={12} />
            </button>
          </div>

          <span className="text-xs text-text-muted ml-auto" style={{ fontFamily: "var(--font-mono)" }}>
            = {formatPrice(parseFloat(item.price) * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
