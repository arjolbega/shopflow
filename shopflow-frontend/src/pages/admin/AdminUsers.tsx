import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Shield, ShieldOff } from "lucide-react";
import { adminApi } from "../../api/admin.api";
import type { AdminUser } from "../../api/admin.api";
import type { PaginationMeta } from "../../types";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { useToast } from "../../hooks/useToast";
import { useAuthStore } from "../../store/authStore";
import DataTable from "../../components/admin/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { cn } from "../../utils/cn";
import axios from "axios";
import type { ApiError, Column } from "../../types";

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { user: currentAdmin } = useAuthStore();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSearch = searchParams.get("search") || "";
  const currentRole = (searchParams.get("role") || "") as "customer" | "admin" | "";

  const fetchUsers = useCallback(() => {
    setIsLoading(true);
    adminApi
      .getUsers({
        page: currentPage,
        limit: 15,
        search: currentSearch || undefined,
        role: currentRole || undefined
      })
      .then((result) => {
        setUsers(result.data);
        setPagination(result.pagination);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [currentPage, currentSearch, currentRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleToggle = (user: AdminUser) => {
    if (user.id === currentAdmin?.id) {
      toast.error("You can't change your own role");
      return;
    }
    setSelectedUser(user);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    const newRole: "customer" | "admin" = selectedUser.role === "admin" ? "customer" : "admin";

    try {
      await adminApi.updateUserRole(selectedUser.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u)));
      toast.success(`${selectedUser.first_name} is now a ${newRole}`);
      setSelectedUser(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ApiError;
        toast.error(data?.error?.message || "Failed to update role");
      } else {
        toast.error("Failed to update role");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: "User",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent-muted border border-border-accent flex items-center justify-center text-accent text-sm font-bold flex-shrink-0">{row.first_name?.[0]?.toUpperCase()}</div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">
              {row.first_name} {row.last_name}
            </p>
            <p className="text-xs text-text-muted truncate max-w-[180px]">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: "role",
      header: "Role",
      render: (row) => <Badge variant={row.role === "admin" ? "accent" : "default"}>{row.role}</Badge>
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge variant={row.is_verified ? "success" : "warning"} dot>
            {row.is_verified ? "Verified" : "Unverified"}
          </Badge>
          {row.two_fa_enabled && <Badge variant="info">2FA</Badge>}
        </div>
      )
    },
    {
      key: "orders",
      header: "Orders",
      render: (row) => <span className="text-sm text-text-secondary">{row.order_count}</span>
    },
    {
      key: "spent",
      header: "Total Spent",
      render: (row) => (
        <span className="text-sm font-medium text-text-primary" style={{ fontFamily: "var(--font-mono)" }}>
          {formatPrice(row.total_spent)}
        </span>
      )
    },
    {
      key: "joined",
      header: "Joined",
      render: (row) => <span className="text-xs text-text-muted">{formatDate(row.created_at)}</span>
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <button onClick={() => handleRoleToggle(row)} disabled={row.id === currentAdmin?.id} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium", "border transition-colors cursor-pointer", "disabled:opacity-30 disabled:cursor-not-allowed", row.role === "admin" ? "border-error/30 text-error hover:bg-error/10" : "border-accent/30 text-accent hover:bg-accent-muted")}>
          {row.role === "admin" ? (
            <>
              <ShieldOff size={13} /> Revoke Admin
            </>
          ) : (
            <>
              <Shield size={13} /> Make Admin
            </>
          )}
        </button>
      )
    }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Users
        </h1>
        {pagination && <p className="text-sm text-text-muted mt-0.5">{pagination.total} total</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Input
          placeholder="Search by name or email..."
          leftIcon={<Search size={16} />}
          className="max-w-xs"
          defaultValue={currentSearch}
          onChange={(e) => {
            const params: Record<string, string> = {};
            if (e.target.value) params.search = e.target.value;
            if (currentRole) params.role = currentRole;
            setSearchParams(params, { replace: true });
          }}
        />

        {(["", "customer", "admin"] as const).map((r) => (
          <button
            key={r}
            onClick={() => {
              const params: Record<string, string> = {};
              if (r) params.role = r;
              setSearchParams(params, { replace: true });
            }}
            className={cn("px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer", currentRole === r ? "bg-accent text-bg-base" : "bg-bg-surface border border-border text-text-secondary hover:text-text-primary")}
          >
            {r ? r.charAt(0).toUpperCase() + r.slice(1) + "s" : "All Users"}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={(page) => {
          const params: Record<string, string> = { page: String(page) };
          if (currentRole) params.role = currentRole;
          setSearchParams(params, { replace: true });
        }}
        rowKey={(row) => row.id}
        emptyMessage="No users found"
      />

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Change User Role" size="sm">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-text-secondary leading-relaxed">
            Are you sure you want to{" "}
            {selectedUser?.role === "admin" ? (
              <span>
                revoke admin access from <span className="text-text-primary font-medium">{selectedUser.first_name}</span>?
              </span>
            ) : (
              <span>
                make <span className="text-text-primary font-medium">{selectedUser?.first_name}</span> an admin?
              </span>
            )}
          </p>
          {selectedUser?.role !== "admin" && <div className="px-4 py-3 bg-warning/5 border border-warning/20 rounded-xl text-sm text-warning">Admins have full access to manage products, orders, and users.</div>}
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button variant={selectedUser?.role === "admin" ? "danger" : "accent"} fullWidth isLoading={isUpdating} onClick={confirmRoleChange}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
