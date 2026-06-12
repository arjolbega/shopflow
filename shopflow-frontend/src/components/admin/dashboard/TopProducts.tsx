import { Link } from "react-router-dom";
import { formatPrice } from "../../../utils/formatPrice";
import { Skeleton } from "../../ui/Skeleton";
import type { AdminAnalytics } from "../../../api/admin.api";

interface TopProductsProps {
  isLoading: boolean;
  analytics: AdminAnalytics | null;
}

const TopProducts = ({ isLoading, analytics }: TopProductsProps) => (
  <div className="xl:col-span-2 bg-bg-surface border border-border rounded-2xl p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
        Top Products
      </h2>
      <Link to="/admin/products" className="text-xs text-accent hover:text-accent-hover transition-colors">
        View all →
      </Link>
    </div>

    {isLoading ? (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    ) : !analytics?.topProducts?.length ? (
      <p className="text-sm text-text-muted text-center py-8">No sales data yet</p>
    ) : (
      <div className="flex flex-col divide-y divide-border">
        {analytics.topProducts.map((product, i) => (
          <div key={product.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <span className="text-lg font-bold text-text-muted w-6 text-center flex-shrink-0">{i + 1}</span>
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-bg-elevated border border-border flex-shrink-0">{product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm opacity-30">📦</div>}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{product.name}</p>
              <p className="text-xs text-text-muted">{product.units_sold} sold</p>
            </div>
            <span className="text-sm font-bold text-accent flex-shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
              {formatPrice(product.revenue)}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default TopProducts;
