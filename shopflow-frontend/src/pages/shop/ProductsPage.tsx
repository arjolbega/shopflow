import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { productApi } from "../../api/product.api";
import type { Product, ProductFilters, PaginationMeta, SortBy, SortDirection } from "../../types";
import { useDebounce } from "../../hooks/useDebounce";
import ProductGrid from "../../components/products/ProductGrid";
import ProductFiltersComponent from "../../components/products/ProductFilters";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { DEFAULT_FILTERS, VALID_ORDERS, VALID_SORT_BY, WRAPPER_STYLES } from "../../utils/constants";
import ProductHeader from "../../components/products/ProductHeader";

function isSortBy(value: string): value is SortBy {
  return VALID_SORT_BY.includes(value as SortBy);
}

function isSortDirection(value: string): value is SortDirection {
  return VALID_ORDERS.includes(value as SortDirection);
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const debouncedSearch = useDebounce(searchInput, 500);

  const rawSortBy = searchParams.get("sortBy") || "";
  const rawOrder = searchParams.get("order") || "";

  const [filters, setFilters] = useState<ProductFilters>({
    ...DEFAULT_FILTERS,
    page: parseInt(searchParams.get("page") || "1"),
    category: searchParams.get("category") || undefined,
    search: searchParams.get("search") || undefined,
    featured: searchParams.get("featured") === "true" ? true : undefined,
    sortBy: isSortBy(rawSortBy) ? rawSortBy : DEFAULT_FILTERS.sortBy,
    order: isSortDirection(rawOrder) ? rawOrder : DEFAULT_FILTERS.order
  });
  console.log("---products page");
  console.log("searchParams", searchParams);
  console.log("searchInput", searchInput);
  console.log("debouncedSearch", debouncedSearch);
  console.log("filters", filters);
  console.log("\n");

  // Sync filters → URL
  useEffect(() => {
    console.log("params changed!!", Math.random());
    console.log("\n");

    const params: Record<string, string> = {};
    if (filters.page > 1) params.page = String(filters.page);
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    if (filters.featured) params.featured = "true";
    if (filters.sortBy !== DEFAULT_FILTERS.sortBy) params.sortBy = filters.sortBy;
    if (filters.order !== DEFAULT_FILTERS.order) params.order = filters.order;
    if (filters.minPrice) params.minPrice = String(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = String(filters.maxPrice);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch when filters or debounced search changes
  useEffect(() => {
    console.log("filters or search changed!!", Math.random());
    console.log("\n");

    let cancelled = false;
    setIsLoading(true);

    const activeFilters = {
      ...filters,
      search: debouncedSearch || undefined
    };

    productApi
      .getAll(activeFilters)
      .then((result) => {
        if (!cancelled) {
          setProducts(result.data);
          setPagination(result.pagination);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, debouncedSearch]);

  // Update search filter when debounced value changes
  useEffect(() => {
    console.log("serach changed!!", Math.random());
    console.log("\n");

    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch || undefined,
      page: 1
    }));
  }, [debouncedSearch]);

  const handleFilterChange = useCallback((updates: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => {
    setSearchInput("");
    setFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <div className={`${WRAPPER_STYLES} py-10`}>
      <ProductHeader filters={filters} pagination={pagination} />

      <div className="mb-6">
        <Input placeholder="Search products..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} leftIcon={<Search size={16} />} className="max-w-md" />
      </div>

      <div className="mb-8">
        <ProductFiltersComponent filters={filters} onChange={handleFilterChange} onReset={handleReset} totalResults={pagination?.total ?? 0} />
      </div>

      <ProductGrid products={products} isLoading={isLoading} />

      {pagination && pagination.totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <p className="text-sm text-text-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={!pagination.hasPrevPage} onClick={() => handleFilterChange({ page: filters.page - 1 })} leftIcon={<ChevronLeft size={16} />}>
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button key={page} onClick={() => handleFilterChange({ page })} className={cn("w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer", page === pagination.page ? "bg-accent text-bg-base" : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary")}>
                    {page}
                  </button>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" disabled={!pagination.hasNextPage} onClick={() => handleFilterChange({ page: filters.page + 1 })} rightIcon={<ChevronRight size={16} />}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
