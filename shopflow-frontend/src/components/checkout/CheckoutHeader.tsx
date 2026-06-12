import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { CHECKOUT_STEPS } from "../../utils/constants";

interface CheckoutHeaderProps {
  step: string;
}

const CheckoutHeader = ({ step }: CheckoutHeaderProps) => (
  <div className="flex items-center gap-4 mb-10">
    <Link to="/products" className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors">
      <ArrowLeft size={20} />
    </Link>
    <div>
      <h1 className="text-3xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
        Checkout
      </h1>

      {/* Steps */}
      <div className="flex items-center gap-3 mt-2">
        {CHECKOUT_STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-border" />}
            <div className="flex items-center gap-1.5">
              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold", step === s || (s === "address" && step === "payment") ? "bg-accent text-bg-base" : "bg-bg-elevated text-text-muted border border-border")}>{s === "address" && step === "payment" ? "✓" : i + 1}</div>
              <span className={cn("text-xs font-medium capitalize", step === s ? "text-text-primary" : "text-text-muted")}>{s === "address" ? "Shipping" : "Payment"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CheckoutHeader;
