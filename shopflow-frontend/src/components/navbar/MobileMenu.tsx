import { Link } from "react-router-dom";
import { navLinks } from "../../utils/constants";
import { cn } from "../../utils/cn";

interface MobileMenuProps {
  isAuthenticated: boolean;
}

const MobileMenu = ({ isAuthenticated }: MobileMenuProps) => {
  return (
    <div className={cn("md:hidden border-t border-border", "bg-bg-base/98 backdrop-blur-md", "animate-in slide-in-from-top-2 duration-200")}>
      <div className="px-4 py-4 flex flex-col gap-1">
        {navLinks.map((link) => (
          <Link key={link.href} to={link.href} className={cn("px-4 py-3 rounded-xl text-sm font-medium", "transition-colors duration-150", location.pathname === link.href.split("?")[0] ? "text-text-primary bg-bg-subtle" : "text-text-secondary hover:text-text-primary hover:bg-bg-subtle")}>
            {link.label}
          </Link>
        ))}

        {!isAuthenticated && (
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
            <Link to="/login" className="px-4 py-3 rounded-xl text-sm font-medium text-center text-text-secondary hover:bg-bg-subtle transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="px-4 py-3 rounded-xl text-sm font-semibold text-center bg-accent text-bg-base hover:bg-accent-hover transition-colors">
              Get started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
