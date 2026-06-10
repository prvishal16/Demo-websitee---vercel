import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, ChefHat, Package, ShoppingBag } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

const statuses = ["All", "Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"];

const nextStatusMap: Record<string, string> = {
  Pending: "Confirmed",
  Confirmed: "Preparing",
  Preparing: "Ready",
  Ready: "Completed",
};

const nextStatusLabel: Record<string, string> = {
  Pending: "Accept Order",
  Confirmed: "Mark Preparing",
  Preparing: "Mark Ready",
  Ready: "Mark Completed",
};

const statusIcon: Record<string, React.ElementType> = {
  Pending: Clock,
  Confirmed: CheckCircle,
  Preparing: ChefHat,
  Ready: Package,
  Completed: CheckCircle,
  Cancelled: XCircle,
};

const statusColor: Record<string, string> = {
  Pending: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/30",
  Confirmed: "text-blue-400 bg-blue-400/10 border border-blue-400/30",
  Preparing: "text-purple-400 bg-purple-400/10 border border-purple-400/30",
  Ready: "text-green-400 bg-green-400/10 border border-green-400/30",
  Completed: "text-muted-foreground bg-muted",
  Cancelled: "text-destructive bg-destructive/10 border border-destructive/30",
};

export default function AdminOrders() {
  const [filterStatus, setFilterStatus] = useState("All");
  const queryClient = useQueryClient();

  const params = filterStatus === "All" ? {} : { status: filterStatus };
  const { data: orders, isLoading } = useListOrders(params, {
    query: { queryKey: getListOrdersQueryKey(params), refetchInterval: 30000 },
  });
  const updateStatus = useUpdateOrderStatus();

  const { data: allOrders } = useListOrders({}, { query: { queryKey: getListOrdersQueryKey({}) } });
  const statusCounts = (allOrders ?? []).reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate(
      { id, data: { status } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(params) }) }
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-foreground mb-1">Pre-Orders</h1>
          <p className="text-muted-foreground text-sm">Accept, prepare, and manage customer pre-orders.</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total", val: allOrders?.length ?? 0, c: "bg-card border border-border" },
            { label: "Pending", val: statusCounts["Pending"] ?? 0, c: "bg-yellow-500/10 border border-yellow-500/20" },
            { label: "Preparing", val: statusCounts["Preparing"] ?? 0, c: "bg-purple-500/10 border border-purple-500/20" },
            { label: "Ready", val: statusCounts["Ready"] ?? 0, c: "bg-green-500/10 border border-green-500/20" },
            { label: "Completed", val: statusCounts["Completed"] ?? 0, c: "bg-muted border border-border" },
          ].map((s) => (
            <div key={s.label} className={`${s.c} rounded-xl p-3 text-center`}>
              <div className="text-2xl font-bold text-foreground">{s.val}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              data-testid={`filter-${s.toLowerCase()}`}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                filterStatus === s ? "bg-amber text-black font-medium" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
              {s !== "All" && statusCounts[s] ? (
                <span className="bg-black/20 text-xs px-1 rounded-full">{statusCounts[s]}</span>
              ) : null}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse h-36" />
            ))}
          </div>
        ) : !orders?.length ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4 opacity-30" />
            <p className="text-muted-foreground">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const Icon = statusIcon[order.status] ?? Clock;
              const canAdvance = !!nextStatusMap[order.status];
              const canCancel = order.status !== "Cancelled" && order.status !== "Completed";

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-6"
                  data-testid={`order-card-${order.id}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-semibold text-foreground">Order #{String(order.id).slice(-6)}</span>
                        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[order.status] ?? ""}`}>
                          <Icon size={12} /> {order.status}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-sm">{order.customerName} · {order.customerPhone}</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        Pickup: {order.pickupDate} at {order.pickupTime}
                      </div>
                    </div>
                    <div className="text-amber font-bold text-lg flex-shrink-0">₹{order.totalAmount.toFixed(0)}</div>
                  </div>

                  <div className="border-t border-border pt-4 mb-4">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, j) => (
                        <span key={j} className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                    {order.notes && (
                      <div className="text-amber/70 text-xs mt-2 italic">Note: {order.notes}</div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {canAdvance && (
                      <button
                        onClick={() => handleStatusChange(order.id, nextStatusMap[order.status]!)}
                        disabled={updateStatus.isPending}
                        className="flex items-center gap-1.5 bg-amber text-black text-sm px-4 py-1.5 rounded-xl font-medium hover:bg-amber/90 transition-all disabled:opacity-50"
                        data-testid={`btn-advance-${order.id}`}
                      >
                        <CheckCircle size={13} /> {nextStatusLabel[order.status]}
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => handleStatusChange(order.id, "Cancelled")}
                        disabled={updateStatus.isPending}
                        className="flex items-center gap-1.5 border border-destructive/30 text-destructive text-sm px-4 py-1.5 rounded-xl hover:bg-destructive/10 transition-all disabled:opacity-50"
                        data-testid={`btn-cancel-${order.id}`}
                      >
                        <XCircle size={13} /> Reject / Cancel
                      </button>
                    )}
                    {!canAdvance && !canCancel && (
                      <span className="text-xs text-muted-foreground italic py-1.5">Order finalized.</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
