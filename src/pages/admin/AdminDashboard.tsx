import { motion } from "framer-motion";
import { ShoppingBag, TrendingUp, Clock, CheckCircle, UtensilsCrossed, Star, Award, Activity } from "lucide-react";
import { Link } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { useGetDashboardStats, useGetTopSellingItems, useGetAvgRating } from "@/lib/api-client";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  testId: string;
}

function StatCard({ label, value, icon: Icon, color, iconBg, testId }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${color} rounded-2xl p-5 flex items-start justify-between shadow-lg`}
      data-testid={testId}
    >
      <div>
        <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className={`${iconBg} rounded-xl p-2.5`}>
        <Icon size={22} className="text-white opacity-90" />
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: topItems, isLoading: topLoading } = useGetTopSellingItems();
  const { data: avgRating } = useGetAvgRating();

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl text-foreground mb-1">Dashboard</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Activity size={14} className="text-green-400" />
              Welcome back. Here's what's happening today.
            </p>
          </div>
          <Link href="/admin/manage-orders">
            <span className="flex items-center gap-2 bg-amber text-black text-sm px-4 py-2 rounded-xl font-medium hover:bg-amber/90 transition-all cursor-pointer">
              <ShoppingBag size={15} /> Manage Orders
            </span>
          </Link>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse h-28" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Total Orders"
              value={stats.totalOrders}
              icon={ShoppingBag}
              color="bg-blue-600 text-white"
              iconBg="bg-blue-500/40"
              testId="stat-total-orders"
            />
            <StatCard
              label="Total Revenue"
              value={`₹${stats.revenue.toFixed(0)}`}
              icon={TrendingUp}
              color="bg-green-600 text-white"
              iconBg="bg-green-500/40"
              testId="stat-revenue"
            />
            <StatCard
              label="Pending Orders"
              value={stats.pendingOrders}
              icon={Clock}
              color="bg-yellow-500 text-white"
              iconBg="bg-yellow-400/40"
              testId="stat-pending"
            />
            <StatCard
              label="Today's Revenue"
              value={`₹${stats.todayRevenue.toFixed(0)}`}
              icon={TrendingUp}
              color="bg-orange-500 text-white"
              iconBg="bg-orange-400/40"
              testId="stat-today-revenue"
            />
            <StatCard
              label="Today's Orders"
              value={stats.todayOrders}
              icon={ShoppingBag}
              color="bg-purple-600 text-white"
              iconBg="bg-purple-500/40"
              testId="stat-today-orders"
            />
            <StatCard
              label="Avg Rating"
              value={`${avgRating ?? 0} ★`}
              icon={Star}
              color="bg-pink-600 text-white"
              iconBg="bg-pink-500/40"
              testId="stat-avg-rating"
            />
          </div>
        ) : null}

        {/* Secondary stats row */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Completed Orders", value: stats.completedOrders, icon: CheckCircle },
              { label: "Menu Items", value: stats.totalMenuItems, icon: UtensilsCrossed },
              { label: "Total Reviews", value: stats.totalFeedback, icon: Star },
              { label: "Live Status", value: "Active", icon: Activity },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center">
                      <Icon size={16} className="text-amber" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-muted-foreground text-xs mt-1">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Top Items */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award size={20} className="text-amber" />
            <h2 className="font-display text-xl text-foreground">Top Selling Items</h2>
          </div>
          {topLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !topItems?.length ? (
            <p className="text-muted-foreground text-sm">No order data yet. Place some orders to see top items.</p>
          ) : (
            <div className="space-y-3">
              {topItems.slice(0, 8).map((item, i) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  data-testid={`top-item-${item.menuItemId}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0
                        ? "bg-amber text-black"
                        : i === 1
                        ? "bg-muted-foreground/30 text-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.totalOrdered} ordered</div>
                  </div>
                  <div className="text-amber font-semibold text-sm">₹{(item.revenue ?? 0).toFixed(0)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
