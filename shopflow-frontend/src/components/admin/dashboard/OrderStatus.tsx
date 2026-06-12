import type { AdminAnalytics } from "../../../api/admin.api";
import { cn } from "../../../utils/cn";
import { ORDER_STATUSES } from "../../../utils/constants";
import { Skeleton } from "../../ui/Skeleton";

interface OrderStatusProps {
  isLoading: boolean;
  analytics: AdminAnalytics | null;
}

const OrderStatus = ({ isLoading, analytics }: OrderStatusProps) => (
  <div className="bg-bg-surface border border-border rounded-2xl p-6">
    <h2 className="text-lg font-bold text-text-primary mb-6" style={{ fontFamily: "var(--font-display)" }}>
      Order Status
    </h2>

    {isLoading ? (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        {ORDER_STATUSES.map((s) => {
          const count = (analytics?.orders[s.key as keyof typeof analytics.orders] as number) ?? 0;
          const total = analytics?.orders.total_orders ?? 1;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={s.key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary">{s.label}</span>
                <span className="text-text-primary font-medium">{count}</span>
              </div>
              <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-700", s.color)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default OrderStatus;
