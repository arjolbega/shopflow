import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Package, ChevronRight, ChevronLeft } from "lucide-react";
import { orderApi } from "../../api/order.api";
import type { Order, OrderStatus, PaginationMeta } from "../../types";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { OrderStatusBadge } from "../../components/ui/Badge";
import { OrderRowSkeleton } from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import { cn } from "../../utils/cn";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All Orders", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" }
];

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentStatus = searchParams.get("status") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    setIsLoading(true);
    orderApi
      .getAll({
        page: currentPage,
        limit: 10,
        status: currentStatus || undefined
      })
      .then((result) => {
        setOrders(result.data);
        setPagination(result.pagination);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [currentStatus, currentPage]);

  const handleStatusFilter = (status: string) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    setSearchParams(params, { replace: true });
  };

  const handlePageChange = (page: number) => {
    const params: Record<string, string> = { page: String(page) };
    if (currentStatus) params.status = currentStatus;
    setSearchParams(params, { replace: true });
  };
  console.log(orders);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-1" style={{ fontFamily: "var(--font-display)" }}>
          My Orders
        </h1>
        {pagination && (
          <p className="text-sm text-text-muted">
            {pagination.total} {pagination.total === 1 ? "order" : "orders"} total
          </p>
        )}
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => (
          <button key={filter.value} onClick={() => handleStatusFilter(filter.value)} className={cn("px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap", "transition-all duration-150 cursor-pointer flex-shrink-0", currentStatus === filter.value ? "bg-accent text-bg-base" : "bg-bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-hover")}>
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} />)
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-bg-elevated rounded-2xl flex items-center justify-center mb-4">
              <Package size={28} className="text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No orders yet</h3>
            <p className="text-sm text-text-muted mb-6 max-w-xs">{currentStatus ? `No ${currentStatus} orders found.` : "You haven't placed any orders yet. Start shopping!"}</p>
            <Link to="/products">
              <Button variant="accent">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className={cn("flex items-center gap-4 p-5", "bg-bg-surface border border-border rounded-2xl", "hover:border-border-hover hover:bg-bg-elevated", "transition-all duration-200 group")}>
              {/* Order icon */}
              <div className="w-12 h-12 bg-bg-elevated border border-border rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-accent/30 transition-colors">
                <Package size={20} className="text-text-muted group-hover:text-accent transition-colors" />
              </div>

              {/* Order info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-semibold text-text-primary">Order #{order.id}</span>
                  <OrderStatusBadge status={order.status as OrderStatus} />
                  {order.status === "pending" && order.stripe_payment_id && <span className="text-xs text-warning font-medium">Payment incomplete</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>{formatDate(order.created_at)}</span>
                  <span>·</span>
                  <span>
                    {order.item_count} {order.item_count === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>

              {/* Total + arrow */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-base font-bold text-text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatPrice(order.total)}
                </span>
                <ChevronRight size={18} className="text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <p className="text-sm text-text-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={!pagination.hasPrevPage} onClick={() => handlePageChange(currentPage - 1)} leftIcon={<ChevronLeft size={16} />}>
              Previous
            </Button>
            <Button variant="ghost" size="sm" disabled={!pagination.hasNextPage} onClick={() => handlePageChange(currentPage + 1)} rightIcon={<ChevronRight size={16} />}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
