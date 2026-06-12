import { Link } from "react-router-dom";
import { WRAPPER_STYLES } from "../../utils/constants";
import { ArrowRight } from "lucide-react";
import ProductGrid from "../products/ProductGrid";
import type { Product } from "../../types";
import React from "react";

interface FeaturedProductsProps {
  featuredProducts: Product[];
  isLoading: boolean;
}

const FeaturedProductsSection = React.memo(({ featuredProducts, isLoading }: FeaturedProductsProps) => (
  <section className={`${WRAPPER_STYLES} pb-16`}>
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2">Hand-picked</p>
        <h2 className="text-3xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Featured Products
        </h2>
      </div>
      <Link to="/products?featured=true" className="text-sm text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
        See all <ArrowRight size={14} />
      </Link>
    </div>

    <ProductGrid products={featuredProducts} isLoading={isLoading} skeletonCount={4} />
  </section>
));

export default FeaturedProductsSection;
