import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { formatPrice } from "../../utils/formatPrice";
import CartItem from "./CartItem";
import Button from "../ui/Button";
import { cn } from "../../utils/cn";
import { restOverflow } from "../../utils/helpers";
import CartHeader from "./CartHeader";
import FreeShippingProgress from "./FreeShippingProgress";
import { SHIPPING_THRESHOLD } from "../../utils/constants";
import EmptyCart from "./EmptyCart";

export default function CartDrawer() {
  const navigate = useNavigate();

  const { cart, isOpen, closeCart } = useCartStore();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      restOverflow();
    }
    return () => {
      restOverflow();
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeCart]);

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  const isEmpty = !cart || cart.items.length === 0;

  const shippingCost = cart && cart.subtotal >= SHIPPING_THRESHOLD ? 0 : 5.99;

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeCart} />}

      {/* Drawer */}
      <div className={cn("fixed top-0 right-0 bottom-0 z-50", "w-full max-w-md", "bg-bg-base border-l border-border", "flex flex-col", "transform transition-transform duration-300 ease-out", isOpen ? "translate-x-0" : "translate-x-full")}>
        <CartHeader isEmpty={isEmpty} cart={cart} />

        {!isEmpty && <FreeShippingProgress />}

        <div className="flex-1 overflow-y-auto px-6">
          {isEmpty ? (
            <EmptyCart />
          ) : (
            <div className="py-2">
              {cart!.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t border-border px-6 py-5 flex flex-col gap-4 bg-bg-surface">
            {/* Totals */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary font-medium" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatPrice(cart!.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Shipping</span>
                <span className={cn("font-medium", shippingCost === 0 ? "text-success" : "text-text-primary")} style={{ fontFamily: "var(--font-mono)" }}>
                  {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-base font-semibold text-text-primary">Estimated total</span>
                <span className="text-base font-bold text-accent" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatPrice(cart!.subtotal + shippingCost)}
                </span>
              </div>
            </div>

            <Button variant="accent" fullWidth size="lg" onClick={handleCheckout} rightIcon={<ArrowRight size={18} />}>
              Checkout
            </Button>

            <button onClick={closeCart} className="text-sm text-text-muted hover:text-text-primary transition-colors text-center cursor-pointer">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
