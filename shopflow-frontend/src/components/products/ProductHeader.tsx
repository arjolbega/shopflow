import type { PaginationMeta, ProductFilters } from "../../types";

interface ProductHeadersProps {
  filters: ProductFilters;
  pagination: PaginationMeta | null;
}

const ProductHeader = ({ filters, pagination }: ProductHeadersProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
        {filters.category ? filters.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : filters.featured ? "Featured Products" : "All Products"}
      </h1>
      {pagination && (
        <p className="text-text-muted text-sm">
          {pagination.total} {pagination.total === 1 ? "product" : "products"} found
        </p>
      )}
    </div>
  );
};

export default ProductHeader;
