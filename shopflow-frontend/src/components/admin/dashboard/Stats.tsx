import { formatPrice } from "../../../utils/formatPrice";
import { TrendingUp, ShoppingBag, Users, Package } from "lucide-react";
import StatCard from "../StatCard";
import type { AdminAnalytics } from "../../../api/admin.api";

interface StatsProps {
  analytics: AdminAnalytics | null;
}

const Stats = ({ analytics }: StatsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
    <StatCard title="Total Revenue" value={formatPrice(analytics?.revenue.total_revenue ?? 0)} subtitle={`${formatPrice(analytics?.revenue.revenue_last_30_days ?? 0)} this month`} icon={<TrendingUp size={20} />} accent />
    <StatCard title="Total Orders" value={analytics?.orders.total_orders ?? 0} subtitle={`${analytics?.orders.pending ?? 0} pending`} icon={<ShoppingBag size={20} />} />
    <StatCard title="Customers" value={analytics?.users.total_users ?? 0} subtitle={`+${analytics?.users.new_last_30_days ?? 0} this month`} icon={<Users size={20} />} />
    <StatCard title="Products" value={analytics?.products.active_products ?? 0} subtitle={`${analytics?.products.out_of_stock ?? 0} out of stock`} icon={<Package size={20} />} />
  </div>
);

export default Stats;
