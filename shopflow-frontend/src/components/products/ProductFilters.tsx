import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category, ProductFilters as Filters, SortBy, SortDirection } from "../../types";
import { categoryApi } from "../../api/category.api";
import { cn } from "../../utils/cn";
import { stockOptions, VALID_ORDERS, VALID_SORT_BY } from "../../utils/constants";

function isSortBy(value: string): value is SortBy {
  return VALID_SORT_BY.includes(value as SortBy);
}

function isSortDirection(value: string): value is SortDirection {
  return VALID_ORDERS.includes(value as SortDirection);
}

interface ProductFiltersProps {
  filters: Filters;
  onChange: (filters: Partial<Filters>) => void;
  onReset: () => void;
  totalResults: number;
}

export default function ProductFilters({ filters, onChange, onReset, totalResults }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [localMin, setLocalMin] = useState(filters.minPrice?.toString() || "");
  const [localMax, setLocalMax] = useState(filters.maxPrice?.toString() || "");

  useEffect(() => {
    categoryApi
      .getAll()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const hasActiveFilters = !!(filters.category || filters.minPrice || filters.maxPrice || filters.inStock !== undefined || filters.featured);

  const handlePriceApply = () => {
    onChange({
      minPrice: localMin ? parseFloat(localMin) : undefined,
      maxPrice: localMax ? parseFloat(localMax) : undefined,
      page: 1
    });
  };

  const handleSortChange = (value: string) => {
    const parts = value.split("-");
    const rawSortBy = parts[0];
    const rawOrder = parts[1];
    if (isSortBy(rawSortBy) && isSortDirection(rawOrder)) {
      onChange({ sortBy: rawSortBy, order: rawOrder, page: 1 });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsOpen((p) => !p)} className={cn("flex items-center gap-2 px-4 py-2.5", "border rounded-xl text-sm font-medium", "transition-colors duration-150 cursor-pointer", isOpen || hasActiveFilters ? "border-accent text-accent bg-accent-muted" : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary")}>
            <SlidersHorizontal size={15} />
            Filters
            {hasActiveFilters && <span className="w-5 h-5 rounded-full bg-accent text-bg-base text-xs font-bold flex items-center justify-center">!</span>}
          </button>

          <select value={`${filters.sortBy}-${filters.order}`} onChange={(e) => handleSortChange(e.target.value)} className={cn("px-4 py-2.5 rounded-xl text-sm", "bg-bg-subtle border border-border", "text-text-secondary", "outline-none cursor-pointer", "hover:border-border-hover transition-colors")}>
            <option value="created_at-desc">Newest first</option>
            <option value="created_at-asc">Oldest first</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A–Z</option>
            <option value="name-desc">Name: Z–A</option>
          </select>
        </div>

        <p className="text-sm text-text-muted hidden sm:block">
          {totalResults} {totalResults === 1 ? "product" : "products"}
        </p>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", "p-5 bg-bg-surface border border-border rounded-2xl", "animate-in fade-in slide-in-from-top-2 duration-200")}>
          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-widest uppercase text-text-secondary">Category</label>
            <select value={filters.category || ""} onChange={(e) => onChange({ category: e.target.value || undefined, page: 1 })} className="px-3 py-2.5 rounded-xl text-sm bg-bg-subtle border border-border text-text-primary outline-none cursor-pointer">
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-widest uppercase text-text-secondary">Price Range</label>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" value={localMin} onChange={(e) => setLocalMin(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-bg-subtle border border-border text-text-primary placeholder:text-text-muted outline-none focus:border-accent" />
              <span className="text-text-muted">–</span>
              <input type="number" placeholder="Max" value={localMax} onChange={(e) => setLocalMax(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-bg-subtle border border-border text-text-primary placeholder:text-text-muted outline-none focus:border-accent" />
            </div>
            <button onClick={handlePriceApply} className="text-xs text-accent hover:text-accent-hover transition-colors text-left cursor-pointer">
              Apply price filter →
            </button>
          </div>

          {/* Stock */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-widest uppercase text-text-secondary">Availability</label>
            <div className="flex flex-col gap-2">
              {stockOptions.map((opt) => (
                <label key={String(opt.value)} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="radio" name="stock" checked={filters.inStock === opt.value} onChange={() => onChange({ inStock: opt.value, page: 1 })} className="accent-amber-500" />
                  <span className="text-sm text-text-secondary">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Featured + Reset */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold tracking-widest uppercase text-text-secondary">Other</label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={!!filters.featured} onChange={(e) => onChange({ featured: e.target.checked || undefined, page: 1 })} className="accent-amber-500" />
              <span className="text-sm text-text-secondary">Featured only</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setLocalMin("");
                  setLocalMax("");
                  onReset();
                }}
                className="flex items-center gap-1.5 text-sm text-error hover:text-error/80 transition-colors cursor-pointer mt-auto"
              >
                <X size={14} />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
