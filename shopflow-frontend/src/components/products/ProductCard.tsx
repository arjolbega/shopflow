import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../types";
import { formatPrice } from "../../utils/formatPrice";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useToast } from "../../hooks/useToast";
import { cartApi } from "../../api/cart.api";
import { cn } from "../../utils/cn";
import { priceToString } from "../../utils/helpers";
import ProductImage from "./ProductImage";
import ProductBadges from "./ProductBadges";
import ProductQuickActions from "./ProductQuickActions";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product: { id, name, is_featured, category_name, price, compare_price, stock, slug, primary_image } }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { setCart, openCart } = useCartStore();
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const isOnSale = compare_price && parseFloat(priceToString(compare_price)) > parseFloat(priceToString(price));

  const isOutOfStock = stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // don't navigate to product page
    if (!isAuthenticated) {
      toast.info("Please sign in to add items to cart");
      return;
    }
    if (isOutOfStock) return;

    setIsAdding(true);
    try {
      const cart = await cartApi.add(id, 1);
      setCart(cart);
      openCart();
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link to={`/products/${slug}`} className={cn("group relative flex flex-col", "bg-bg-surface border border-border", "rounded-2xl overflow-hidden", "hover:border-border-hover", "transition-all duration-300", "hover:shadow-xl hover:shadow-black/30", "hover:-translate-y-0.5")}>
      <div className="relative aspect-square overflow-hidden bg-bg-elevated">
        <ProductImage name={name} primary_image={primary_image} />

        <ProductBadges isOnSale={isOnSale} is_featured={is_featured} isOutOfStock={isOutOfStock} price={price} compare_price={compare_price} />

        <ProductQuickActions handleAddToCart={handleAddToCart} isOutOfStock={isOutOfStock} isAdding={isAdding} />
      </div>

      {/* ── Info ── */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-xs text-text-muted font-medium tracking-wide uppercase">{category_name}</p>

        <h3 className="text-sm font-medium text-text-primary leading-snug line-clamp-2">{name}</h3>

        {/* Stock indicator */}
        {stock > 0 && stock <= 5 && <p className="text-xs text-warning">Only {stock} left</p>}

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="text-base font-semibold text-text-primary" style={{ fontFamily: "var(--font-mono)" }}>
            {formatPrice(price)}
          </span>
          {isOnSale && (
            <span className="text-sm text-text-muted line-through" style={{ fontFamily: "var(--font-mono)" }}>
              {formatPrice(compare_price!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
