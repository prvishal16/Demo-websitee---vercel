import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Star, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import {
  useListMenuItems, useCreateMenuItem, useUpdateMenuItem,
  useDeleteMenuItem, getListMenuItemsQueryKey,
  type MenuItem
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

interface MenuItemForm {
  name: string; description: string; price: string; category: string;
  imageUrl: string; available: boolean; isSpecial: boolean;
}
const emptyForm: MenuItemForm = { name: "", description: "", price: "", category: "", imageUrl: "", available: true, isSpecial: false };

export default function AdminMenu() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MenuItemForm>(emptyForm);
  const [filterCategory, setFilterCategory] = useState("All");

  const queryClient = useQueryClient();
  const ALL_KEY = getListMenuItemsQueryKey({});
  const { data: menuItems, isLoading } = useListMenuItems({}, { query: { queryKey: ALL_KEY } });
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const categories = ["All", ...new Set((menuItems ?? []).map((m) => m.category))];
  const filtered = filterCategory === "All" ? (menuItems ?? []) : (menuItems ?? []).filter((m) => m.category === filterCategory);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ALL_KEY });

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (item: MenuItem) => {
    setForm({
      name: item.name, description: item.description ?? "", price: String(item.price),
      category: item.category, imageUrl: item.imageUrl ?? "", available: item.available, isSpecial: item.isSpecial,
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price) };
    if (editingId) {
      updateItem.mutate({ id: editingId, data }, { onSuccess: () => { setShowModal(false); invalidate(); } });
    } else {
      createItem.mutate({ data }, { onSuccess: () => { setShowModal(false); invalidate(); } });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this item?")) return;
    deleteItem.mutate({ id }, { onSuccess: invalidate });
  };

  const toggleAvailable = (item: MenuItem) => {
    updateItem.mutate({ id: item.id, data: { available: !item.available } }, { onSuccess: invalidate });
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-foreground mb-1">Menu Management</h1>
            <p className="text-muted-foreground text-sm">Add, edit, and manage your menu items.</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-amber text-black px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-amber/90 transition-all" data-testid="btn-add-menu-item">
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${filterCategory === cat ? "bg-amber text-black font-medium" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-card border border-border rounded-2xl h-48 animate-pulse" />)}
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-20 text-muted-foreground">No items. Add your first menu item!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-card border border-border rounded-2xl overflow-hidden" data-testid={`admin-menu-card-${item.id}`}>
                <div className="h-36 bg-muted relative">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {item.isSpecial && <span className="bg-amber text-black text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Star size={10} className="fill-black" /> Special</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.available ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>{item.available ? "Available" : "Hidden"}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-foreground text-sm">{item.name}</h3>
                    <span className="text-amber font-semibold text-sm">₹{item.price}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">{item.category}</div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 bg-muted hover:bg-amber/10 hover:text-amber text-muted-foreground text-xs py-1.5 rounded-lg transition-colors" data-testid={`btn-edit-${item.id}`}>
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => toggleAvailable(item)} className="flex-1 text-xs py-1.5 rounded-lg transition-colors bg-muted hover:bg-muted/80 text-muted-foreground" data-testid={`btn-toggle-${item.id}`}>
                      {item.available ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors" data-testid={`btn-delete-${item.id}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-display text-xl text-foreground">{editingId ? "Edit Item" : "Add Menu Item"}</h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Name *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber transition-colors" data-testid="input-item-name" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber transition-colors resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Price (₹) *</label>
                    <input type="number" min="0" step="0.5" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber transition-colors" data-testid="input-item-price" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Category *</label>
                    <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required placeholder="e.g. Dosas" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors" data-testid="input-item-category" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Image URL</label>
                  <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors" />
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} className="accent-amber" data-testid="checkbox-available" />
                    <span className="text-sm text-foreground">Available</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isSpecial} onChange={(e) => setForm((f) => ({ ...f, isSpecial: e.target.checked }))} className="accent-amber" data-testid="checkbox-special" />
                    <span className="text-sm text-foreground">Mark as Special</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-muted text-foreground py-2.5 rounded-xl text-sm hover:bg-muted/80 transition-colors">Cancel</button>
                  <button type="submit" disabled={createItem.isPending || updateItem.isPending} className="flex-1 bg-amber text-black py-2.5 rounded-xl text-sm font-medium hover:bg-amber/90 transition-all disabled:opacity-50" data-testid="btn-save-item">
                    {createItem.isPending || updateItem.isPending ? "Saving..." : "Save Item"}
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
