import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { adminApi } from "../../api/admin.api";
import type { AdminAnalytics } from "../../api/admin.api";
import Header from "../../components/admin/dashboard/Header";
import LoadingStats from "../../components/admin/dashboard/LoadingStats";
import Stats from "../../components/admin/dashboard/Stats";
import RevenueLastYear from "../../components/admin/dashboard/RevenueLastYear";
import OrderStatus from "../../components/admin/dashboard/OrderStatus";
import TopProducts from "../../components/admin/dashboard/TopProducts";
import RecentOrders from "../../components/admin/dashboard/RecentOrders";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getAnalytics()
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <Header />

      {/* Stat Cards */}
      {isLoading ? <LoadingStats /> : <Stats analytics={analytics} />}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <RevenueLastYear isLoading={isLoading} analytics={analytics} />

        {/* Order Status Breakdown */}
        <OrderStatus isLoading={isLoading} analytics={analytics} />

        {/* Top Products */}
        <TopProducts isLoading={isLoading} analytics={analytics} />

        {/* Recent Orders */}
        <RecentOrders isLoading={isLoading} analytics={analytics} />

        {/* Alerts */}
        {!isLoading && analytics && (analytics.products.low_stock > 0 || analytics.products.out_of_stock > 0) && (
          <div className="xl:col-span-3 bg-warning/5 border border-warning/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-text-primary mb-1">Inventory Alerts</p>
                <div className="flex flex-wrap gap-3">
                  {analytics.products.out_of_stock > 0 && (
                    <Link to="/admin/products" className="text-sm text-error hover:underline">
                      {analytics.products.out_of_stock} product{analytics.products.out_of_stock > 1 ? "s" : ""} out of stock
                    </Link>
                  )}
                  {analytics.products.low_stock > 0 && (
                    <Link to="/admin/products" className="text-sm text-warning hover:underline">
                      {analytics.products.low_stock} product{analytics.products.low_stock > 1 ? "s" : ""} low on stock (≤5)
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
