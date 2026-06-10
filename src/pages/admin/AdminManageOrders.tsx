import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, TrendingUp, Clock, CheckCircle, XCircle,
  ChefHat, Package, Star, DollarSign, Users, Activity,
  Filter, RefreshCw
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import {
  useListOrders, useUpdateOrderStatus, getListOrdersQueryKey,
  useGetDashboardStats, useGetAvgRating
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

// ── Status config ──────────────────────────────────────────────────────────
const ALL_STATUSES = ["All", "Pending", "Preparing", "Ready", "Completed", "Cancelled"];

const nextStatusMap: Record<string, string> = {
  Pending: "Confirmed",
  Confirmed: "Preparing",
  Preparing: "Ready",
  Ready: "Completed",
};

const nextStatusLabel: Record<string, string> = {
  Pending: "Accept / Confirm",
  Confirmed: "Mark Preparing",
  Preparing: "Mark Ready",
  Ready: "Mark Completed",
};

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
  Confirmed: "bg-blue-400/15 text-blue-400 border-blue-400/30",
  Preparing: "bg-purple-400/15 text-purple-400 border-purple-400/30",
  Ready: "bg-green-400/15 text-green-400 border-green-400/30",
  Completed: "bg-muted text-muted-foreground border-border",
  Cancelled: "bg-red-400/15 text-red-400 border-red-400/30",
};

const statusDotColors: Record<string, string> = {
  Pending: "bg-yellow-400",
  Confirmed: "bg-blue-400",
  Preparing: "bg-purple-400",
  Ready: "bg-green-400",
  Completed: "bg-gray-400",
  Cancelled: "bg-red-400",
};

const statusIcons: Record<string, React.ElementType> = {
  Pending: Clock,
  Confirmed: CheckCircle,
  Preparing: ChefHat,
  Ready: Package,
  Completed: CheckCircle,
  Cancelled: XCircle,
};

// ── Stat Card ──────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  iconColor: string;
  testId?: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor, iconColor, testId }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${color} rounded-2xl p-5 flex items-start justify-between shadow-lg`}
      data-testid={testId}
    >
      <div>
        <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className={`${bgColor} rounded-xl p-2.5`}>
        <Icon size={22} className={iconColor} />
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminManageOrders() {
  const [filterStatus, setFilterStatus] = useState("All");
  const queryClient = useQueryClient();

  const params = filterStatus === "All" ? {} : { status: filterStatus };
  const { data: orders, isLoading, refetch } = useListOrders(params, {
    query: {
      queryKey: getListOrdersQueryKey(params),
      refetchInterval: 15000,
    },
  });
  const { data: stats } = useGetDashboardStats();
  const { data: avgRating } = useGetAvgRating();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(params) });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        },
      }
    );
  };

  // Count by status for badge counts
  const { data: allOrders } = useListOrders({}, {
    query: { queryKey: getListOrdersQueryKey({}), refetchInterval: 15000 },
  });
  const statusCounts = (allOrders ?? []).reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-foreground mb-1">Manage Orders</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Activity size={14} className="text-green-400" />
              Live dashboard · Auto-refreshes every 15s
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-card border border-border text-muted-foreground hover:text-foreground text-sm px-4 py-2 rounded-xl transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="Total Orders"
            value={stats?.totalOrders ?? 0}
            icon={ShoppingBag}
            color="bg-blue-600 text-white"
            bgColor="bg-blue-500/30"
            iconColor="text-white"
            testId="stat-total"
          />
          <StatCard
            label="Total Revenue"
            value={`₹${(stats?.revenue ?? 0).toFixed(0)}`}
            icon={TrendingUp}
            color="bg-green-600 text-white"
            bgColor="bg-green-500/30"
            iconColor="text-white"
            testId="stat-revenue"
          />
          <StatCard
            label="Pending Now"
            value={stats?.pendingOrders ?? 0}
            icon={Clock}
            color="bg-yellow-500 text-white"
            bgColor="bg-yellow-400/30"
            iconColor="text-white"
            testId="stat-pending"
          />
          <StatCard
            label="Today's Revenue"
            value={`₹${(stats?.todayRevenue ?? 0).toFixed(0)}`}
            icon={DollarSign}
            color="bg-orange-500 text-white"
            bgColor="bg-orange-400/30"
            iconColor="text-white"
            testId="stat-today-revenue"
          />
          <StatCard
            label="Today's Orders"
            value={stats?.todayOrders ?? 0}
            icon={Users}
            color="bg-purple-600 text-white"
            bgColor="bg-purple-400/30"
            iconColor="text-white"
            testId="stat-today-orders"
          />
          <StatCard
            label="Avg Rating"
            value={`${avgRating ?? 0} ★`}
            icon={Star}
            color="bg-pink-600 text-white"
            bgColor="bg-pink-400/30"
            iconColor="text-white"
            testId="stat-avg-rating"
          />
        </div>

        {/* Incoming Orders Section */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-amber" />
              <h2 className="font-display text-xl text-foreground">Incoming Orders</h2>
            </div>
            {/* Status filter dropdown-style pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    filterStatus === s
                      ? "bg-amber text-black"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s !== "All" && (
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[s] ?? "bg-gray-400"}`} />
                  )}
                  {s}
                  {s !== "All" && statusCounts[s] ? (
                    <span className="bg-black/20 rounded-full px-1 text-xs">{statusCounts[s]}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-border text-xs text-muted-foreground uppercase tracking-wider bg-muted/30">
            <span>Order</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Status</span>
            <span>Total</span>
            <span>Actions</span>
          </div>

          {/* Orders list */}
          {isLoading ? (
            <div className="space-y-1 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !orders?.length ? (
            <div className="text-center py-24">
              <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4 opacity-30" />
              <p className="text-muted-foreground">No orders found{filterStatus !== "All" ? ` with status "${filterStatus}"` : ""}.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.map((order, i) => {
                const StatusIcon = statusIcons[order.status] ?? Clock;
                const canAdvance = !!nextStatusMap[order.status];
                const canCancel = order.status !== "Cancelled" && order.status !== "Completed";

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="px-6 py-4"
                    data-testid={`order-row-${order.id}`}
                  >
                    {/* Desktop layout */}
                    <div className="hidden md:grid grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr] gap-4 items-center">
                      {/* Order ID */}
                      <div>
                        <div className="text-sm font-semibold text-foreground">#{String(order.id).slice(-6)}</div>
                        <div className="text-xs text-muted-foreground">{order.pickupDate}</div>
                        <div className="text-xs text-muted-foreground">{order.pickupTime}</div>
                      </div>

                      {/* Customer */}
                      <div>
                        <div className="text-sm text-foreground">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                      </div>

                      {/* Items */}
                      <div className="flex flex-wrap gap-1">
                        {order.items.map((item, j) => (
                          <span
                            key={j}
                            className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                          >
                            {item.quantity}× {item.name}
                          </span>
                        ))}
                        {order.notes && (
                          <span className="text-xs text-amber/70 italic block w-full mt-0.5">
                            Note: {order.notes}
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[order.status] ?? ""}`}
                        >
                          <StatusIcon size={11} />
                          {order.status}
                        </span>
                      </div>

                      {/* Total */}
                      <div className="text-amber font-bold">₹{order.totalAmount.toFixed(0)}</div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5">
                        {canAdvance && (
                          <button
                            onClick={() => handleStatusChange(order.id, nextStatusMap[order.status]!)}
                            disabled={updateStatus.isPending}
                            className="text-xs bg-amber text-black px-3 py-1.5 rounded-lg font-medium hover:bg-amber/90 transition-all disabled:opacity-50 whitespace-nowrap"
                            data-testid={`btn-advance-${order.id}`}
                          >
                            {nextStatusLabel[order.status]}
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => handleStatusChange(order.id, "Cancelled")}
                            disabled={updateStatus.isPending}
                            className="text-xs border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50"
                            data-testid={`btn-cancel-${order.id}`}
                          >
                            ✕ Reject / Cancel
                          </button>
                        )}
                        {!canAdvance && !canCancel && (
                          <span className="text-xs text-muted-foreground italic">Finalized</span>
                        )}
                      </div>
                    </div>

                    {/* Mobile layout */}
                    <div className="md:hidden space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-semibold text-foreground">#{String(order.id).slice(-6)}</div>
                          <div className="text-xs text-muted-foreground">{order.customerName} · {order.customerPhone}</div>
                          <div className="text-xs text-muted-foreground">Pickup: {order.pickupDate} {order.pickupTime}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[order.status] ?? ""}`}>
                            <StatusIcon size={10} /> {order.status}
                          </span>
                          <span className="text-amber font-bold text-sm">₹{order.totalAmount.toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {order.items.map((item, j) => (
                          <span key={j} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                            {item.quantity}× {item.name}
                          </span>
                        ))}
                      </div>
                      {order.notes && (
                        <p className="text-xs text-amber/70 italic">Note: {order.notes}</p>
                      )}
                      <div className="flex gap-2">
                        {canAdvance && (
                          <button
                            onClick={() => handleStatusChange(order.id, nextStatusMap[order.status]!)}
                            disabled={updateStatus.isPending}
                            className="flex-1 text-xs bg-amber text-black py-2 rounded-xl font-medium hover:bg-amber/90 transition-all disabled:opacity-50"
                          >
                            {nextStatusLabel[order.status]}
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => handleStatusChange(order.id, "Cancelled")}
                            disabled={updateStatus.isPending}
                            className="flex-1 text-xs border border-red-500/30 text-red-400 py-2 rounded-xl hover:bg-red-500/10 transition-all disabled:opacity-50"
                          >
                            ✕ Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {(orders?.length ?? 0) > 0 && (
            <div className="px-6 py-3 border-t border-border text-center text-xs text-muted-foreground">
              Auto-refreshes every 15s · Showing {orders?.length} order{(orders?.length ?? 0) !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
