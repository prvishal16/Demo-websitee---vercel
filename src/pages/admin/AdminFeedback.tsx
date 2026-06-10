import { motion } from "framer-motion";
import { Star, Eye, EyeOff, Trash2, Award } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import {
  useListFeedback, useUpdateFeedback, useDeleteFeedback,
  getListFeedbackQueryKey
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const statusColor: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  approved: "text-green-400 bg-green-400/10",
  hidden: "text-muted-foreground bg-muted",
};

const PARAMS = { all: true };

export default function AdminFeedback() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();
  const { data: reviews, isLoading } = useListFeedback(PARAMS, {
    query: { queryKey: getListFeedbackQueryKey(PARAMS) },
  });
  const updateFeedback = useUpdateFeedback();
  const deleteFeedback = useDeleteFeedback();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListFeedbackQueryKey(PARAMS) });

  const handleApprove = (id: number) =>
    updateFeedback.mutate({ id, data: { status: "approved" } }, { onSuccess: invalidate });
  const handleHide = (id: number) =>
    updateFeedback.mutate({ id, data: { status: "hidden" } }, { onSuccess: invalidate });
  const handleFeature = (id: number, featured: boolean) =>
    updateFeedback.mutate({ id, data: { featured } }, { onSuccess: invalidate });
  const handleDelete = (id: number) => {
    if (!confirm("Delete this review?")) return;
    deleteFeedback.mutate({ id }, { onSuccess: invalidate });
  };

  const filtered = (reviews ?? []).filter((r) => filter === "all" ? true : r.status === filter);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-foreground mb-1">Reviews</h1>
          <p className="text-muted-foreground text-sm">Moderate customer feedback and feature top reviews.</p>
        </div>

        <div className="flex gap-2 mb-6">
          {["all", "pending", "approved", "hidden"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-sm capitalize transition-all ${filter === s ? "bg-amber text-black font-medium" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse h-32" />)}</div>
        ) : !filtered.length ? (
          <div className="text-center py-20 text-muted-foreground">No reviews found.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((review, i) => (
              <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-2xl p-6" data-testid={`feedback-card-${review.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-foreground text-sm">{review.customerName}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${statusColor[review.status] ?? ""}`}>{review.status}</span>
                      {review.featured && <span className="text-xs text-amber flex items-center gap-1"><Award size={10} /> Featured</span>}
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={12} className={j < review.rating ? "fill-amber text-amber" : "text-border"} />)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed italic mb-4">"{review.comment}"</p>
                <div className="flex flex-wrap gap-2">
                  {review.status !== "approved" && (
                    <button onClick={() => handleApprove(review.id)} className="flex items-center gap-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs px-3 py-1.5 rounded-lg transition-colors" data-testid={`btn-approve-${review.id}`}>
                      <Eye size={12} /> Approve
                    </button>
                  )}
                  {review.status !== "hidden" && (
                    <button onClick={() => handleHide(review.id)} className="flex items-center gap-1.5 bg-muted text-muted-foreground hover:text-foreground text-xs px-3 py-1.5 rounded-lg transition-colors" data-testid={`btn-hide-${review.id}`}>
                      <EyeOff size={12} /> Hide
                    </button>
                  )}
                  <button onClick={() => handleFeature(review.id, !review.featured)} className="flex items-center gap-1.5 bg-amber/10 text-amber hover:bg-amber/20 text-xs px-3 py-1.5 rounded-lg transition-colors" data-testid={`btn-feature-${review.id}`}>
                    <Award size={12} /> {review.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button onClick={() => handleDelete(review.id)} className="flex items-center gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs px-3 py-1.5 rounded-lg transition-colors" data-testid={`btn-delete-review-${review.id}`}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
