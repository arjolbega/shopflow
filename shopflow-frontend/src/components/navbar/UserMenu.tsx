import { ChevronDown, LayoutDashboard, LogOut, Package } from "lucide-react";
import { cn } from "../../utils/cn";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import React, { useState } from "react";
import { authApi } from "../../api/auth.api";
import { useToast } from "../../hooks/useToast";

interface UserMenuProps {
  isAuthenticated: boolean;
  userMenuRef: React.RefObject<HTMLDivElement | null>;
  setIsUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUserMenuOpen: boolean;
}

const UserMenu = React.memo(({ isAuthenticated, userMenuRef, setIsUserMenuOpen, isUserMenuOpen }: UserMenuProps) => {
  const { user, logout } = useAuthStore();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toast = useToast();

  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } finally {
      logout();
      navigate("/");
      toast.success("Logged out successfully");
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <div className="relative" ref={userMenuRef}>
          <button onClick={() => setIsUserMenuOpen((prev) => !prev)} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer", "text-text-secondary hover:text-text-primary", "hover:bg-bg-subtle transition-colors duration-150")}>
            <div className={cn("w-7 h-7 rounded-full", "bg-accent-muted border border-border-accent", "flex items-center justify-center", "text-accent text-xs font-bold")}>{user?.first_name?.[0]?.toUpperCase()}</div>
            <ChevronDown size={14} className={cn("transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
          </button>

          {/* Dropdown */}
          {isUserMenuOpen && (
            <div className={cn("absolute right-0 top-full mt-2", "w-56 bg-bg-elevated", "border border-border rounded-xl", "shadow-xl shadow-black/40", "py-1 z-50", "animate-in fade-in slide-in-from-top-2 duration-150")}>
              {/* User info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-text-primary">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-text-muted mt-0.5 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors">
                  <Package size={15} />
                  My Orders
                </Link>

                {user?.role === "admin" && (
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-accent-muted transition-colors">
                    <LayoutDashboard size={15} />
                    Admin Panel
                  </Link>
                )}
              </div>

              <div className="border-t border-border py-1">
                <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors cursor-pointer disabled:opacity-50">
                  <LogOut size={15} />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-2 ml-2">
          <Link to="/login" className={cn("px-4 py-2 rounded-lg text-sm font-medium", "text-text-secondary hover:text-text-primary", "hover:bg-bg-subtle transition-colors duration-150")}>
            Sign in
          </Link>
          <Link to="/register" className={cn("px-4 py-2 rounded-xl text-sm font-semibold", "bg-accent text-bg-base", "hover:bg-accent-hover transition-colors duration-150")}>
            Get started
          </Link>
        </div>
      )}
    </>
  );
});

export default UserMenu;
