import { Link } from "react-router-dom";
import { STATS, WRAPPER_STYLES } from "../../utils/constants";
import Button from "../ui/Button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => (
  <section className={`relative overflow-hidden ${WRAPPER_STYLES} py-20`}>
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-muted border border-border-accent rounded-full mb-8">
      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
      <span className="text-sm text-accent font-medium">New arrivals every week</span>
    </div>

    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
      Discover
      <span className="text-accent italic"> something </span>
      you'll love
    </h1>

    <p className="text-lg text-text-secondary leading-relaxed mb-10 max-w-lg">A curated marketplace with quality products from trusted sellers. Free shipping on orders over $50.</p>

    <div className="flex items-center gap-4">
      <Link to="/products">
        <Button variant="accent" size="lg" rightIcon={<ArrowRight size={18} />}>
          Shop Now
        </Button>
      </Link>
      <Link to="/products?featured=true">
        <Button variant="ghost" size="lg">
          View Featured
        </Button>
      </Link>
    </div>

    {/* Stats */}
    <div className="flex items-center gap-8 mt-12 pt-12 border-t border-border">
      {STATS.map((stat) => (
        <div key={stat.label}>
          <p className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            {stat.value}
          </p>
          <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HeroSection;
