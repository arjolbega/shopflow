import { Link } from "react-router-dom";
import { navLinks } from "../../utils/constants";
import { cn } from "../../utils/cn";
import React from "react";

const DesktopNav = React.memo(() => (
  <nav className="hidden md:flex items-center gap-1">
    {navLinks.map((link) => (
      <Link key={link.href} to={link.href} className={cn("px-4 py-2 rounded-lg text-sm font-medium", "transition-colors duration-150", location.pathname === link.href.split("?")[0] ? "text-text-primary bg-bg-subtle" : "text-text-secondary hover:text-text-primary hover:bg-bg-subtle")}>
        {link.label}
      </Link>
    ))}
  </nav>
));

export default DesktopNav;
