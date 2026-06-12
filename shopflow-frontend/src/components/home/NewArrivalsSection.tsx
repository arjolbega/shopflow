import { Link } from "react-router-dom";
import { WRAPPER_STYLES } from "../../utils/constants";
import { ArrowRight } from "lucide-react";
import ProductGrid from "../products/ProductGrid";
import type { Product } from "../../types";

interface NewArrivalsProps {
  newArrivals: Product[];
  isLoading: boolean;
}

const NewArrivalsSection = ({ newArrivals, isLoading }: NewArrivalsProps) => (
  <section className={`${WRAPPER_STYLES}`}>
    <div className={`${WRAPPER_STYLES} bg-bg-surface border-t border-border py-16`}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2">Just dropped</p>
          <h2 className="text-3xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            New Arrivals
          </h2>
        </div>
        <Link to="/products" className="text-sm text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
          Shop all <ArrowRight size={14} />
        </Link>
      </div>

      <ProductGrid products={newArrivals} isLoading={isLoading} skeletonCount={8} />
    </div>
  </section>
);

export default NewArrivalsSection;
