import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { WRAPPER_STYLES } from "../../utils/constants";
import Button from "../ui/Button";
import { ArrowRight } from "lucide-react";

const CtaBannerSection = () => (
  <section className={`${WRAPPER_STYLES} py-16`}>
    <div className={cn("relative overflow-hidden", "bg-bg-surface border border-border-accent", "rounded-3xl px-8 py-12 text-center", "shadow-[0_0_60px_rgba(245,158,11,0.08)]")}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-accent/3 to-transparent pointer-events-none" />

      <div className="relative">
        <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-4">Limited time</p>
        <h2 className="text-4xl font-bold text-text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Free shipping on orders over $50
        </h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">Stock up and save. No code needed — discount applied automatically at checkout.</p>
        <Link to="/products">
          <Button variant="accent" size="lg" rightIcon={<ArrowRight size={18} />}>
            Start Shopping
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default CtaBannerSection;
