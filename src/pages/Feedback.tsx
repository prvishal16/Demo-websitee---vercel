import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import FloatingButtons from "@/components/FloatingButtons";
import { useListFeedback, useSubmitFeedback, getListFeedbackQueryKey } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

export default function Feedback() {
  const [form, setForm] = useState({ customerName: "", rating: 5, comment: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const queryClient = useQueryClient();
  const { data: reviews, isLoading } = useListFeedback({}, { query: { queryKey: getListFeedbackQueryKey({}) } });
  const submitFeedback = useSubmitFeedback();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.customerName.trim()) errs["customerName"] = "Name is required";
    if (!form.comment.trim() || form.comment.length < 10) errs["comment"] = "Please write at least 10 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    submitFeedback.mutate(
      { data: form },
      {
        onSuccess: () => {
          setSubmitted(true);
          queryClient.invalidateQueries({ queryKey: getListFeedbackQueryKey({}) });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-24 max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="text-amber text-xs tracking-[0.3em] uppercase mb-2">Guest Reviews</div>
          <h1 className="font-display text-4xl md:text-5xl">Share your <em>experience</em></h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Submit Form */}
          <div>
            {submitted ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-green-500/20 rounded-2xl p-8 text-center">
                <Star size={48} className="text-amber mx-auto mb-4 fill-amber" />
                <h3 className="font-display text-xl mb-2">Thank you!</h3>
                <p className="text-muted-foreground text-sm">Your review has been submitted and will appear after approval.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <h2 className="font-display text-xl text-foreground">Leave a Review</h2>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, rating: star }))}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        data-testid={`btn-star-${star}`}
                        className="transition-transform hover:scale-125"
                      >
                        <Star
                          size={28}
                          className={`transition-colors ${star <= (hoverRating || form.rating) ? "fill-amber text-amber" : "text-border"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Your Name *</label>
                  <input value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} placeholder="Your name" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors" data-testid="input-reviewer-name" />
                  {errors["customerName"] && <p className="text-destructive text-xs mt-1">{errors["customerName"]}</p>}
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Your Review *</label>
                  <textarea value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} placeholder="Tell us about your experience..." rows={4} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors resize-none" data-testid="input-review-comment" />
                  {errors["comment"] && <p className="text-destructive text-xs mt-1">{errors["comment"]}</p>}
                </div>

                <button type="submit" disabled={submitFeedback.isPending} className="w-full bg-amber text-black py-3 rounded-xl font-medium hover:bg-amber/90 transition-all disabled:opacity-50" data-testid="btn-submit-review">
                  {submitFeedback.isPending ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            <h2 className="font-display text-xl text-foreground">What others say</h2>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse h-28" />)}
              </div>
            ) : !reviews?.length ? (
              <div className="text-muted-foreground text-sm py-8">No reviews yet. Be the first!</div>
            ) : (
              reviews.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="bg-card border border-border rounded-xl p-5" data-testid={`card-review-${r.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-foreground text-sm">{r.customerName}</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={12} className={j < r.rating ? "fill-amber text-amber" : "text-border"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed italic">"{r.comment}"</p>
                  {r.featured && <span className="text-xs text-amber mt-2 inline-block">Featured Review</span>}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
      <FloatingButtons />
    </div>
  );
}
