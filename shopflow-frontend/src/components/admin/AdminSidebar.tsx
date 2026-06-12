import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/auth.api";
import { useToast } from "../../hooks/useToast";
import { cn } from "../../utils/cn";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Products", href: "/admin/products", icon: <Package size={18} /> },
  { label: "Orders", href: "/admin/orders", icon: <ShoppingBag size={18} /> },
  { label: "Users", href: "/admin/users", icon: <Users size={18} /> }
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const toast = useToast();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      navigate("/");
      toast.success("Logged out");
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-bg-surface border-r border-border flex flex-col min-h-[calc(100vh-64px)] sticky top-16">
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.href} to={item.href} end={item.href === "/admin"} className={({ isActive }) => cn("flex items-center justify-between px-3 py-2.5 rounded-xl", "text-sm font-medium transition-all duration-150 group", isActive ? "bg-accent-muted text-accent border border-border-accent" : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated")}>
            <div className="flex items-center gap-3">
              {item.icon}
              {item.label}
            </div>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-accent-muted border border-border-accent flex items-center justify-center text-accent text-sm font-bold">{user?.first_name?.[0]?.toUpperCase()}</div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-text-muted">Administrator</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-error hover:bg-error/10 transition-colors cursor-pointer">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
