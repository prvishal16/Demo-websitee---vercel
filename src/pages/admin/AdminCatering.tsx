import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, Phone, Mail, ChefHat, CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useListCateringInquiries, useUpdateCateringStatus } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

const statusColor: Record<string, string> = {
  new: "bg-blue-400/15 text-blue-400 border-blue-400/30",
  contacted: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
  confirmed: "bg-green-400/15 text-green-400 border-green-400/30",
  rejected: "bg-red-400/15 text-red-400 border-red-400/30",
  cancelled: "bg-red-400/15 text-red-400 border-red-400/30",
};

const statusIcons: Record<string, React.ElementType> = {
  new: Clock,
  contacted: MessageSquare,
  confirmed: CheckCircle,
  rejected: XCircle,
  cancelled: XCircle,
};

const ALL_STATUSES = ["All", "new", "contacted", "confirmed", "rejected", "cancelled"];
const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default function AdminCatering() {
  const [filterStatus, setFilterStatus] = useState("All");
  const queryClient = useQueryClient();

  const { data: inquiries, isLoading } = useListCateringInquiries();
  const updateStatus = useUpdateCateringStatus();

  const filtered = filterStatus === "All"
    ? (inquiries ?? [])
    : (inquiries ?? []).filter((i) => i.status === filterStatus);

  const handleStatus = (id: number, status: string) => {
    updateStatus.mutate(
      { id, status },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catering-inquiries"] }) }
    );
  };

  // Count per status
  const counts = (inquiries ?? []).reduce((acc: Record<string, number>, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-foreground mb-1">Catering Inquiries</h1>
          <p className="text-muted-foreground text-sm">Review, accept, or reject catering requests from customers.</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: inquiries?.length ?? 0, color: "bg-blue-600 text-white" },
            { label: "New", value: counts["new"] ?? 0, color: "bg-yellow-500 text-white" },
            { label: "Confirmed", value: counts["confirmed"] ?? 0, color: "bg-green-600 text-white" },
            { label: "Rejected", value: (counts["rejected"] ?? 0) + (counts["cancelled"] ?? 0), color: "bg-red-600 text-white" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all capitalize ${
                filterStatus === s
                  ? "bg-amber text-black font-medium"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "All" ? "All" : STATUS_LABELS[s] ?? s}
              {s !== "All" && counts[s] ? (
                <span className="ml-1.5 bg-black/20 text-xs px-1.5 py-0.5 rounded-full">{counts[s]}</span>
              ) : null}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse h-44" />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-24">
            <ChefHat size={48} className="mx-auto text-muted-foreground mb-4 opacity-30" />
            <p className="text-muted-foreground">No catering inquiries found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((inquiry, i) => {
              const StatusIcon = statusIcons[inquiry.status] ?? Clock;
              const isActive = inquiry.status !== "rejected" && inquiry.status !== "cancelled";

              return (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-2xl p-6"
                  data-testid={`catering-card-${inquiry.id}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                    <div>
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-semibold text-foreground text-lg">{inquiry.name}</span>
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${statusColor[inquiry.status] ?? ""}`}>
                          <StatusIcon size={11} />
                          {STATUS_LABELS[inquiry.status] ?? inquiry.status}
                        </span>
                      </div>
                      <div className="text-amber font-medium">{inquiry.eventType}</div>
                    </div>
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      Submitted {new Date(inquiry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Calendar size={15} className="text-amber flex-shrink-0" />
                      <span>Event Date: <span className="text-foreground font-medium">{inquiry.eventDate}</span></span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Users size={15} className="text-amber flex-shrink-0" />
                      <span>Guests: <span className="text-foreground font-medium">{inquiry.guestCount}</span></span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Phone size={15} className="text-amber flex-shrink-0" />
                      <span>{inquiry.phone}</span>
                    </div>
                    {inquiry.email && (
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Mail size={15} className="text-amber flex-shrink-0" />
                        <span>{inquiry.email}</span>
                      </div>
                    )}
                  </div>

                  {inquiry.notes && (
                    <div className="mb-5 p-3 bg-muted rounded-xl text-sm text-muted-foreground italic">
                      "{inquiry.notes}"
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {/* Status progression */}
                    {inquiry.status === "new" && (
                      <>
                        <button
                          onClick={() => handleStatus(inquiry.id, "confirmed")}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-1.5 bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/30 text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={14} /> Accept / Confirm
                        </button>
                        <button
                          onClick={() => handleStatus(inquiry.id, "contacted")}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 border border-yellow-400/30 text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <MessageSquare size={14} /> Mark Contacted
                        </button>
                        <button
                          onClick={() => handleStatus(inquiry.id, "rejected")}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}
                    {inquiry.status === "contacted" && (
                      <>
                        <button
                          onClick={() => handleStatus(inquiry.id, "confirmed")}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-1.5 bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/30 text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={14} /> Confirm Booking
                        </button>
                        <button
                          onClick={() => handleStatus(inquiry.id, "rejected")}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}
                    {inquiry.status === "confirmed" && (
                      <button
                        onClick={() => handleStatus(inquiry.id, "cancelled")}
                        disabled={updateStatus.isPending}
                        className="flex items-center gap-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        <XCircle size={14} /> Cancel Booking
                      </button>
                    )}

                    {/* Contact shortcuts */}
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="flex items-center gap-1.5 bg-amber/10 text-amber hover:bg-amber/20 text-sm px-4 py-2 rounded-xl transition-colors ml-auto"
                    >
                      <Phone size={13} /> Call
                    </a>
                    {inquiry.email && (
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="flex items-center gap-1.5 bg-muted text-muted-foreground hover:text-foreground text-sm px-4 py-2 rounded-xl transition-colors"
                      >
                        <Mail size={13} /> Email
                      </a>
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
