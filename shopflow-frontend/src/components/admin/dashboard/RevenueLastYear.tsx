import type { AdminAnalytics } from "../../../api/admin.api";
import { formatPrice } from "../../../utils/formatPrice";
import { Skeleton } from "../../ui/Skeleton";

interface RevenueLastYearProps {
  isLoading: boolean;
  analytics: AdminAnalytics | null;
}

const RevenueLastYear = ({ isLoading, analytics }: RevenueLastYearProps) => {
  const maxRevenue = analytics?.revenueChart?.length ? Math.max(...analytics.revenueChart.map((d) => parseFloat(d.revenue))) : 1;

  return (
    <div className="xl:col-span-2 bg-bg-surface border border-border rounded-2xl p-6">
      <h2 className="text-lg font-bold text-text-primary mb-6" style={{ fontFamily: "var(--font-display)" }}>
        Revenue — Last 12 Months
      </h2>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : !analytics?.revenueChart?.length ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm text-text-muted">No revenue data yet</p>
        </div>
      ) : (
        <div className="flex items-end gap-2 h-48">
          {analytics.revenueChart.map((point) => {
            const height = maxRevenue > 0 ? (parseFloat(point.revenue) / maxRevenue) * 100 : 0;
            return (
              <div key={point.month} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-bg-elevated border border-border rounded-lg px-2 py-1 text-xs text-text-primary whitespace-nowrap pointer-events-none">{formatPrice(point.revenue)}</div>
                <div className="w-full bg-accent/20 rounded-t-lg hover:bg-accent/40 relative min-h-[4px]" style={{ height: `${Math.max(height, 2)}%` }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-accent rounded-t-lg" style={{ height: "40%" }} />
                </div>
                <span className="text-xs text-text-muted">{point.month.slice(5)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RevenueLastYear;
