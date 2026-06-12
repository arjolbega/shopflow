// src/pages/shop/CategoryPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { categoryApi } from "../../api/category.api";
import { productApi } from "../../api/product.api";
import type { Category, Product, PaginationMeta } from "../../types";
import ProductGrid from "../../components/products/ProductGrid";
import Button from "../../components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    setIsLoading(true);

    Promise.all([categoryApi.getBySlug(slug), productApi.getAll({ category: slug, page, limit: 12 })])
      .then(([cat, prods]) => {
        if (!cancelled) {
          setCategory(cat);
          setProducts(prods.data);
          setPagination(prods.pagination);
        }
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
  }, [slug, page, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
        <Link to="/" className="hover:text-text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-text-primary transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-text-secondary">{category?.name}</span>
      </div>

      {/* Category Header */}
      {category && (
        <div className="flex items-center gap-6 mb-10">
          {category.image_url && (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border flex-shrink-0">
              <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {category.name}
            </h1>
            {category.description && <p className="text-text-secondary max-w-xl">{category.description}</p>}
            {pagination && (
              <p className="text-sm text-text-muted mt-1">
                {pagination.total} {pagination.total === 1 ? "product" : "products"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Products */}
      <ProductGrid products={products} isLoading={isLoading} />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <p className="text-sm text-text-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => p - 1)} leftIcon={<ChevronLeft size={16} />}>
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setPage(p)} className={cn("w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer", p === pagination.page ? "bg-accent text-bg-base" : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary")}>
                    {p}
                  </button>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)} rightIcon={<ChevronRight size={16} />}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
