import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { adminApi } from "../../api/admin.api";
import type { Order, OrderStatus, PaginationMeta, Column } from "../../types";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { OrderStatusBadge } from "../../components/ui/Badge";
import DataTable from "../../components/admin/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../hooks/useToast";
import { cn } from "../../utils/cn";

type AdminOrder = Order & {
  email: string;
  first_name: string;
  last_name: string;
  item_count: number;
};

const STATUS_OPTIONS: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [isUpdating, setIsUpdating] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentStatus = searchParams.get("status") as OrderStatus | "";
  const currentSearch = searchParams.get("search") || "";

  const fetchOrders = useCallback(() => {
    setIsLoading(true);
    adminApi
      .getOrders({
        page: currentPage,
        limit: 15,
        status: currentStatus || undefined,
        search: currentSearch || undefined
      })
      .then((result) => {
        setOrders(result.data as AdminOrder[]);
        setPagination(result.pagination);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [currentPage, currentStatus, currentSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      await adminApi.updateOrderStatus(selectedOrder.id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o)));
      toast.success("Order status updated");
      setSelectedOrder(null);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: Column<AdminOrder>[] = [
    {
      key: "id",
      header: "Order",
      render: (row) => <span className="text-sm font-semibold text-text-primary">#{row.id}</span>
    },
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <div>
          <p className="text-sm text-text-primary">
            {row.first_name} {row.last_name}
          </p>
          <p className="text-xs text-text-muted truncate max-w-[180px]">{row.email}</p>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <OrderStatusBadge status={row.status} />
    },
    {
      key: "items",
      header: "Items",
      render: (row) => <span className="text-sm text-text-secondary">{row.item_count}</span>
    },
    {
      key: "total",
      header: "Total",
      render: (row) => (
        <span className="text-sm font-semibold text-text-primary" style={{ fontFamily: "var(--font-mono)" }}>
          {formatPrice(row.total)}
        </span>
      )
    },
    {
      key: "date",
      header: "Date",
      render: (row) => <span className="text-xs text-text-muted">{formatDate(row.created_at)}</span>
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <button
          onClick={() => {
            setSelectedOrder(row);
            setNewStatus(row.status);
          }}
          className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors cursor-pointer border border-border"
        >
          Update Status
        </button>
      )
    }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Orders
        </h1>
        {pagination && <p className="text-sm text-text-muted mt-0.5">{pagination.total} total</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Input
          placeholder="Search by email or order ID..."
          leftIcon={<Search size={16} />}
          className="max-w-xs"
          defaultValue={currentSearch}
          onChange={(e) => {
            const params: Record<string, string> = {};
            if (e.target.value) params.search = e.target.value;
            if (currentStatus) params.status = currentStatus;
            setSearchParams(params, { replace: true });
          }}
        />

        <div className="flex items-center gap-2 flex-wrap">
          {(["", ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                const params: Record<string, string> = {};
                if (s) params.status = s;
                setSearchParams(params, { replace: true });
              }}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer", currentStatus === s ? "bg-accent text-bg-base" : "bg-bg-surface border border-border text-text-secondary hover:text-text-primary")}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={(page) => {
          const params: Record<string, string> = { page: String(page) };
          if (currentStatus) params.status = currentStatus;
          setSearchParams(params, { replace: true });
        }}
        rowKey={(row) => row.id}
        emptyMessage="No orders found"
      />

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Update Order #${selectedOrder?.id}`} size="sm">
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-semibold tracking-widest uppercase text-text-secondary block mb-2">New Status</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as OrderStatus)} className="w-full bg-bg-subtle border border-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setSelectedOrder(null)}>
              Cancel
            </Button>
            <Button variant="accent" fullWidth isLoading={isUpdating} onClick={handleUpdateStatus}>
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
