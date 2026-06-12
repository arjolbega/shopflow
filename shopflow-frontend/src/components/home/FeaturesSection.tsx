import { WRAPPER_STYLES } from "../../utils/constants";
import { Zap, Shield, RefreshCw, Star } from "lucide-react";

const features = [
  {
    icon: <Zap size={20} className="text-accent" />,
    title: "Fast Delivery",
    desc: "Orders dispatched within 24 hours"
  },
  {
    icon: <Shield size={20} className="text-accent" />,
    title: "Secure Payments",
    desc: "Protected by Stripe encryption"
  },
  {
    icon: <RefreshCw size={20} className="text-accent" />,
    title: "Easy Returns",
    desc: "30-day hassle-free returns"
  },
  {
    icon: <Star size={20} className="text-accent" />,
    title: "Quality Assured",
    desc: "Every product hand-curated"
  }
];

const FeaturesSection = () => (
  <section className={`${WRAPPER_STYLES}`}>
    <div className={`${WRAPPER_STYLES} py-8 border-y border-border bg-bg-surface`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <div key={f.title} className="flex items-start gap-4">
            <div className="w-10 h-10 bg-accent-muted border border-border-accent rounded-xl flex items-center justify-center flex-shrink-0">{f.icon}</div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{f.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
