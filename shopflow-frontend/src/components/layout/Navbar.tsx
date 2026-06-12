import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Search, Menu, X, ShoppingCart } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { cartApi } from "../../api/cart.api";
import { cn } from "../../utils/cn";
import { WRAPPER_STYLES } from "../../utils/constants";
import Logo from "../navbar/Logo";
import DesktopNav from "../navbar/DesktopNav";
import UserMenu from "../navbar/UserMenu";
import MobileMenu from "../navbar/MobileMenu";
import SearchOverlay from "../navbar/SearchOverlay";

export default function Navbar() {
  const location = useLocation();

  const { isAuthenticated } = useAuthStore();
  const { cart, setCart, openCart } = useCartStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch cart on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      cartApi
        .get()
        .then(setCart)
        .catch(() => {});
    }
  }, [isAuthenticated, setCart]);

  // Scroll detection
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const itemCount = cart?.itemCount ?? 0;

  return (
    <>
      <header className={cn("fixed top-0 left-0 right-0 z-40", "transition-all duration-300", isScrolled ? "bg-bg-base/95 backdrop-blur-md border-b border-border shadow-lg" : "bg-transparent")}>
        <div className={`${WRAPPER_STYLES}`}>
          <div className="flex items-center justify-between h-16">
            <Logo />

            <DesktopNav />

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button onClick={() => setIsSearchOpen(true)} className={cn("p-2 rounded-lg cursor-pointer", "text-text-secondary hover:text-text-primary", "hover:bg-bg-subtle transition-colors duration-150")}>
                <Search size={18} />
              </button>

              {/* Cart */}
              {isAuthenticated && (
                <button onClick={openCart} className={cn("relative p-2 rounded-lg cursor-pointer", "text-text-secondary hover:text-text-primary", "hover:bg-bg-subtle transition-colors duration-150")}>
                  <ShoppingCart size={18} />
                  {itemCount > 0 && <span className={cn("absolute -top-0.5 -right-0.5", "w-4 h-4 rounded-full", "bg-accent text-bg-base", "text-[10px] font-bold", "flex items-center justify-center")}>{itemCount > 9 ? "9+" : itemCount}</span>}
                </button>
              )}

              <UserMenu isAuthenticated={isAuthenticated} userMenuRef={userMenuRef} setIsUserMenuOpen={setIsUserMenuOpen} isUserMenuOpen={isUserMenuOpen} />

              {/* Mobile menu toggle */}
              <button onClick={() => setIsMobileOpen((prev) => !prev)} className={cn("md:hidden p-2 rounded-lg cursor-pointer", "text-text-secondary hover:text-text-primary", "hover:bg-bg-subtle transition-colors duration-150")}>
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileOpen && <MobileMenu isAuthenticated={isAuthenticated} />}
      </header>

      {isSearchOpen && <SearchOverlay setIsSearchOpen={setIsSearchOpen} searchRef={searchRef} />}
    </>
  );
}
