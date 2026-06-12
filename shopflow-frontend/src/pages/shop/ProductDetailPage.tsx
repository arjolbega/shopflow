import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronLeft, ChevronRight, Star, Package, Shield, Minus, Plus } from "lucide-react";
import { productApi } from "../../api/product.api";
import { cartApi } from "../../api/cart.api";
import type { Product, Review } from "../../types";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useToast } from "../../hooks/useToast";
import { formatPrice, formatDiscount } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { cn } from "../../utils/cn";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import axios from "axios";
import type { ApiError } from "../../types";
import { WRAPPER_STYLES } from "../../utils/constants";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { isAuthenticated } = useAuthStore();
  const { setCart, openCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);

    productApi
      .getBySlug(slug)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        if (!cancelled) navigate("/products");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to add items to cart");
      navigate("/login");
      return;
    }
    if (!product) return;

    setIsAdding(true);
    try {
      const cart = await cartApi.add(product.id, quantity);
      setCart(cart);
      openCart();
      toast.success(`${quantity} × ${product.name} added to cart`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ApiError;
        toast.error(data?.error?.message || "Failed to add to cart");
      } else {
        toast.error("Failed to add to cart");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const images = product?.images?.length ? product.images : product?.primary_image ? [{ id: 0, url: product.primary_image, alt: product.name, is_primary: true, sort_order: 0 }] : [];

  const isOnSale = product?.compare_price && parseFloat(product.compare_price.toString()) > parseFloat(product.price.toString());

  const discount = isOnSale ? formatDiscount(parseFloat(product!.compare_price!.toString()), parseFloat(product!.price.toString())) : 0;

  const isOutOfStock = product?.stock === 0;
  const maxQuantity = Math.min(product?.stock ?? 1, 10);

  if (isLoading) {
    return (
      <div className={`${WRAPPER_STYLES} py-10`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 pt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-32 mt-4" />
            <Skeleton className="h-12 w-full mt-4 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className={`${WRAPPER_STYLES} py-10`}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
        <Link to="/" className="hover:text-text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-text-primary transition-colors">
          Products
        </Link>
        {product.category_name && (
          <>
            <span>/</span>
            <Link to={`/products?category=${product.category_slug}`} className="hover:text-text-primary transition-colors">
              {product.category_name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-text-secondary truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-bg-elevated rounded-2xl overflow-hidden border border-border group">
            {images.length > 0 ? (
              <img src={images[selectedImage]?.url} alt={images[selectedImage]?.alt || product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl opacity-20">📦</span>
              </div>
            )}

            {isOnSale && (
              <div className="absolute top-4 left-4">
                <Badge variant="error">-{discount}%</Badge>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button onClick={() => setSelectedImage((p) => (p - 1 + images.length) % images.length)} className={cn("absolute left-3 top-1/2 -translate-y-1/2", "w-9 h-9 bg-bg-elevated/90 backdrop-blur-sm rounded-full", "flex items-center justify-center border border-border", "text-text-secondary hover:text-text-primary", "transition-all opacity-0 group-hover:opacity-100 cursor-pointer")}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setSelectedImage((p) => (p + 1) % images.length)} className={cn("absolute right-3 top-1/2 -translate-y-1/2", "w-9 h-9 bg-bg-elevated/90 backdrop-blur-sm rounded-full", "flex items-center justify-center border border-border", "text-text-secondary hover:text-text-primary", "transition-all opacity-0 group-hover:opacity-100 cursor-pointer")}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setSelectedImage(i)} className={cn("flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer", i === selectedImage ? "border-accent shadow-[0_0_12px_rgba(245,158,11,0.3)]" : "border-border hover:border-border-hover")}>
                  <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link to={`/products?category=${product.category_slug}`} className="text-xs font-semibold tracking-widest uppercase text-accent hover:text-accent-hover transition-colors">
              {product.category_name}
            </Link>
            <span className="text-xs text-text-muted font-mono">SKU: {product.sku}</span>
          </div>

          <h1 className="text-4xl font-bold text-text-primary leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            {product.name}
          </h1>

          {(product.review_count ?? 0) > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < Math.round(product.avg_rating ?? 0) ? "text-accent fill-accent" : "text-text-muted"} />
                ))}
              </div>
              <span className="text-sm text-text-secondary">
                {product.avg_rating?.toFixed(1)} ({product.review_count} reviews)
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-text-primary" style={{ fontFamily: "var(--font-mono)" }}>
              {formatPrice(product.price)}
            </span>
            {isOnSale && (
              <>
                <span className="text-xl text-text-muted line-through" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatPrice(product.compare_price!)}
                </span>
                <Badge variant="error">Save {discount}%</Badge>
              </>
            )}
          </div>

          <p className="text-text-secondary leading-relaxed">{product.description}</p>

          <div className="border-t border-border" />

          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isOutOfStock ? "bg-error" : product.stock <= 5 ? "bg-warning" : "bg-success")} />
            <span className="text-sm text-text-secondary">{isOutOfStock ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left in stock` : "In stock"}</span>
          </div>

          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-3 text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors cursor-pointer">
                  <Minus size={16} />
                </button>
                <span className="px-4 py-3 text-sm font-medium text-text-primary min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))} className="px-3 py-3 text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors cursor-pointer">
                  <Plus size={16} />
                </button>
              </div>

              <Button variant="accent" size="lg" isLoading={isAdding} onClick={handleAddToCart} leftIcon={<ShoppingCart size={18} />} className="flex-1">
                Add to Cart
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Shield size={15} />, text: "Secure checkout" },
              { icon: <Package size={15} />, text: "Free shipping over $50" }
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2.5 px-4 py-3 bg-bg-elevated border border-border rounded-xl">
                <span className="text-accent">{item.icon}</span>
                <span className="text-xs text-text-secondary">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {(product.reviews?.length ?? 0) > 0 && (
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-text-primary mb-8" style={{ fontFamily: "var(--font-display)" }}>
            Customer Reviews ({product.review_count})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews!.map((review: Review) => (
              <div key={review.id} className="p-5 bg-bg-surface border border-border rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-muted border border-border-accent flex items-center justify-center text-accent text-xs font-bold">{review.first_name?.[0]?.toUpperCase()}</div>
                    <span className="text-sm font-medium text-text-primary">
                      {review.first_name} {review.last_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < review.rating ? "text-accent fill-accent" : "text-text-muted"} />
                    ))}
                  </div>
                </div>
                {review.title && <p className="text-sm font-semibold text-text-primary">{review.title}</p>}
                {review.body && <p className="text-sm text-text-secondary leading-relaxed">{review.body}</p>}
                <p className="text-xs text-text-muted">{formatDate(review.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
