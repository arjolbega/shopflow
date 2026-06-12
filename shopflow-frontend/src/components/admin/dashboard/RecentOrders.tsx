import { Link } from "react-router-dom";
import { Skeleton } from "../../ui/Skeleton";
import { Clock } from "lucide-react";
import { OrderStatusBadge } from "../../ui/Badge";
import { formatDate } from "../../../utils/formatDate";
import { formatPrice } from "../../../utils/formatPrice";
import type { AdminAnalytics } from "../../../api/admin.api";

interface RecentOrdersProps {
  isLoading: boolean;
  analytics: AdminAnalytics | null;
}

const RecentOrders = ({ isLoading, analytics }: RecentOrdersProps) => (
  <div className="bg-bg-surface border border-border rounded-2xl p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
        Recent Orders
      </h2>
      <Link to="/admin/orders" className="text-xs text-accent hover:text-accent-hover transition-colors">
        View all →
      </Link>
    </div>

    {isLoading ? (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    ) : !analytics?.recentOrders?.length ? (
      <p className="text-sm text-text-muted text-center py-8">No orders yet</p>
    ) : (
      <div className="flex flex-col divide-y divide-border">
        {analytics.recentOrders.map((order) => (
          <Link key={order.id} to="/admin/orders" className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 group">
            <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock size={14} className="text-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                #{order.id} — {order.first_name} {order.last_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <OrderStatusBadge status={order.status} />
                <span className="text-xs text-text-muted">{formatDate(order.created_at)}</span>
              </div>
            </div>
            <span className="text-sm font-semibold text-text-primary flex-shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
              {formatPrice(order.total)}
            </span>
          </Link>
        ))}
      </div>
    )}
  </div>
);

export default RecentOrders;
