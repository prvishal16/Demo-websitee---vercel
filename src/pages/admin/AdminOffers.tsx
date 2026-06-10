import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Tag } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import {
  useListOffers, useCreateOffer, useUpdateOffer, useDeleteOffer,
  getListOffersQueryKey, type Offer
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

interface OfferForm {
  title: string; description: string; discountPercent: string;
  validFrom: string; validUntil: string; active: boolean;
}
const emptyForm: OfferForm = { title: "", description: "", discountPercent: "", validFrom: "", validUntil: "", active: true };
const ALL_KEY = getListOffersQueryKey({});

export default function AdminOffers() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<OfferForm>(emptyForm);

  const queryClient = useQueryClient();
  const { data: offers, isLoading } = useListOffers({}, { query: { queryKey: ALL_KEY } });
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ALL_KEY });

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (offer: Offer) => {
    setForm({
      title: offer.title, description: offer.description,
      discountPercent: offer.discountPercent != null ? String(offer.discountPercent) : "",
      validFrom: offer.validFrom ?? "", validUntil: offer.validUntil ?? "", active: offer.active,
    });
    setEditingId(offer.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: form.title, description: form.description, active: form.active,
      discountPercent: form.discountPercent ? Number(form.discountPercent) : null,
      validFrom: form.validFrom || null, validUntil: form.validUntil || null,
    };
    if (editingId) {
      updateOffer.mutate({ id: editingId, data }, { onSuccess: () => { setShowModal(false); invalidate(); } });
    } else {
      createOffer.mutate({ data }, { onSuccess: () => { setShowModal(false); invalidate(); } });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this offer?")) return;
    deleteOffer.mutate({ id }, { onSuccess: invalidate });
  };

  const toggleActive = (offer: Offer) => {
    updateOffer.mutate({ id: offer.id, data: { active: !offer.active } }, { onSuccess: invalidate });
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-foreground mb-1">Offers</h1>
            <p className="text-muted-foreground text-sm">Manage promotions and special deals.</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-amber text-black px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-amber/90 transition-all" data-testid="btn-add-offer">
            <Plus size={16} /> Add Offer
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse h-32" />)}</div>
        ) : !offers?.length ? (
          <div className="text-center py-20"><Tag size={40} className="mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No offers yet.</p></div>
        ) : (
          <div className="grid gap-4">
            {offers.map((offer, i) => (
              <motion.div key={offer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4" data-testid={`offer-card-${offer.id}`}>
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-amber/10 flex flex-col items-center justify-center text-center">
                  {offer.discountPercent ? <><span className="text-amber font-bold text-base leading-none">{offer.discountPercent}%</span><span className="text-amber text-xs">OFF</span></> : <Tag size={20} className="text-amber" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{offer.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${offer.active ? "text-green-400 bg-green-400/10" : "text-muted-foreground bg-muted"}`}>{offer.active ? "Active" : "Inactive"}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{offer.description}</p>
                  {(offer.validFrom || offer.validUntil) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {offer.validFrom && `From: ${offer.validFrom}`}{offer.validFrom && offer.validUntil && " · "}{offer.validUntil && `Until: ${offer.validUntil}`}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(offer)} className="p-2 rounded-xl bg-muted hover:bg-amber/10 hover:text-amber text-muted-foreground transition-colors" data-testid={`btn-edit-offer-${offer.id}`}><Pencil size={15} /></button>
                  <button onClick={() => toggleActive(offer)} className={`text-xs px-3 py-1.5 rounded-xl transition-colors ${offer.active ? "bg-muted text-muted-foreground hover:text-foreground" : "bg-green-500/10 text-green-400 hover:bg-green-500/20"}`} data-testid={`btn-toggle-offer-${offer.id}`}>{offer.active ? "Deactivate" : "Activate"}</button>
                  <button onClick={() => handleDelete(offer.id)} className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" data-testid={`btn-delete-offer-${offer.id}`}><Trash2 size={15} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card border border-border rounded-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-display text-xl text-foreground">{editingId ? "Edit Offer" : "Add Offer"}</h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Title *</label>
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber" data-testid="input-offer-title" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required rows={2} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Discount %</label>
                  <input type="number" min="0" max="100" value={form.discountPercent} onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))} placeholder="e.g. 20" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber" data-testid="input-offer-discount" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Valid From</label>
                    <input type="date" value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Valid Until</label>
                    <input type="date" value={form.validUntil} onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="accent-amber" data-testid="checkbox-offer-active" />
                  <span className="text-sm text-foreground">Active</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-muted text-foreground py-2.5 rounded-xl text-sm hover:bg-muted/80 transition-colors">Cancel</button>
                  <button type="submit" disabled={createOffer.isPending || updateOffer.isPending} className="flex-1 bg-amber text-black py-2.5 rounded-xl text-sm font-medium hover:bg-amber/90 transition-all disabled:opacity-50" data-testid="btn-save-offer">
                    {createOffer.isPending || updateOffer.isPending ? "Saving..." : "Save Offer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
