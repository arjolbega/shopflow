import { Link } from "react-router-dom";
import { WRAPPER_STYLES } from "../../utils/constants";
import { ArrowRight } from "lucide-react";
import { cn } from "../../utils/cn";
import type { Category } from "../../types";

interface CategoryProps {
  categories: Category[];
}

const CategorySection = ({ categories }: CategoryProps) => {
  return (
    <section className={`${WRAPPER_STYLES} py-16`}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2">Browse by</p>
          <h2 className="text-3xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Categories
          </h2>
        </div>
        <Link to="/products" className="text-sm text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link key={cat.id} to={`/products?category=${cat.slug}`} className={cn("group flex flex-col items-center gap-3 p-4", "bg-bg-surface border border-border rounded-2xl", "hover:border-border-accent hover:bg-accent-muted", "transition-all duration-200 text-center")}>
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-bg-elevated flex items-center justify-center">{cat.image_url ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <span className="text-2xl">🏷️</span>}</div>
            <div>
              <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{cat.name}</p>
              {cat.product_count !== undefined && <p className="text-xs text-text-muted mt-0.5">{cat.product_count} items</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
