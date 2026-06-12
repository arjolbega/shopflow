import { ShoppingBag } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const Logo = React.memo(() => (
  <Link to="/" className="flex items-center gap-2 flex-shrink-0">
    <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
      <ShoppingBag size={16} className="text-bg-base" />
    </div>
    <span className="text-xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
      ShopFlow
    </span>
  </Link>
));

export default Logo;
