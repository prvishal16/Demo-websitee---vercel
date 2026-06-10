import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, ShoppingBag, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import FloatingButtons from "@/components/FloatingButtons";
import { useCart } from "@/contexts/CartContext";
import { useCreateOrder } from "@/lib/api-client";
import { Link } from "wouter";

const timeSlots = ["7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM"];

export default function Order() {
  const { items, updateQuantity, removeItem, totalAmount, clearCart } = useCart();
  const [form, setForm] = useState({ customerName: "", customerPhone: "", notes: "", pickupDate: "", pickupTime: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<number | null>(null);

  const createOrder = useCreateOrder();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.customerName.trim()) errs["customerName"] = "Name is required";
    if (!form.customerPhone.match(/^\+?[0-9]{10,13}$/)) errs["customerPhone"] = "Enter a valid phone number";
    if (!form.pickupDate) errs["pickupDate"] = "Pickup date is required";
    if (!form.pickupTime) errs["pickupTime"] = "Pickup time is required";
    if (items.length === 0) errs["items"] = "Add at least one item";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createOrder.mutate(
      {
        data: {
          ...form,
          items: items.map((i) => ({ menuItemId: i.menuItemId, name: i.name, quantity: i.quantity, price: i.price })),
        },
      },
      {
        onSuccess: (order) => {
          setSubmitted(order.id);
          clearCart();
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md px-6"
        >
          <CheckCircle size={64} className="text-green-400 mx-auto mb-6" />
          <h2 className="font-display text-3xl mb-4 text-foreground">Order Placed!</h2>
          <p className="text-muted-foreground mb-2">Your order <span className="text-amber font-semibold">#{submitted}</span> is confirmed.</p>
          <p className="text-muted-foreground text-sm mb-8">We'll have it ready at your selected pickup time. You'll receive a confirmation on WhatsApp.</p>
          <Link href="/">
            <button className="bg-amber text-black px-8 py-3 rounded-full font-medium hover:bg-amber/90 transition-all">
              Back to Home
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-24 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-amber text-xs tracking-[0.3em] uppercase mb-2">Pre-Order</div>
          <h1 className="font-display text-4xl mb-10">Your <em>Order</em></h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Cart */}
          <div>
            <h2 className="font-medium text-foreground mb-4 text-sm tracking-wider uppercase">Order Items</h2>
            {items.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <ShoppingBag size={40} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Link href="/menu">
                  <button className="bg-amber text-black px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-amber/90 transition-all" data-testid="btn-browse-menu">
                    Browse Menu
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {errors["items"] && <p className="text-destructive text-sm">{errors["items"]}</p>}
                {items.map((item) => (
                  <div key={item.menuItemId} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4" data-testid={`cart-item-${item.menuItemId}`}>
                    <div className="flex-1">
                      <div className="font-medium text-foreground text-sm">{item.name}</div>
                      <div className="text-amber text-sm">₹{item.price} each</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground/70 hover:border-amber hover:text-amber text-sm transition-colors" data-testid={`btn-dec-cart-${item.menuItemId}`}>−</button>
                      <span className="text-foreground font-semibold text-sm w-5 text-center" data-testid={`qty-cart-${item.menuItemId}`}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-7 h-7 rounded-full bg-amber text-black flex items-center justify-center text-sm hover:bg-amber/90 transition-colors" data-testid={`btn-inc-cart-${item.menuItemId}`}>+</button>
                    </div>
                    <div className="text-foreground font-semibold text-sm w-16 text-right">₹{(item.price * item.quantity).toFixed(0)}</div>
                    <button onClick={() => removeItem(item.menuItemId)} className="text-destructive/60 hover:text-destructive transition-colors" data-testid={`btn-remove-${item.menuItemId}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="bg-amber/10 border border-amber/30 rounded-xl p-4 flex justify-between items-center">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="text-amber font-bold text-lg">₹{totalAmount.toFixed(0)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="font-medium text-foreground text-sm tracking-wider uppercase">Pickup Details</h2>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Full Name *</label>
              <input
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                placeholder="Your name"
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors"
                data-testid="input-name"
              />
              {errors["customerName"] && <p className="text-destructive text-xs mt-1">{errors["customerName"]}</p>}
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Phone Number *</label>
              <input
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                placeholder="+91 99999 99999"
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors"
                data-testid="input-phone"
              />
              {errors["customerPhone"] && <p className="text-destructive text-xs mt-1">{errors["customerPhone"]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Pickup Date *</label>
                <input
                  type="date"
                  value={form.pickupDate}
                  min={today}
                  onChange={(e) => setForm((f) => ({ ...f, pickupDate: e.target.value }))}
                  className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber transition-colors"
                  data-testid="input-pickup-date"
                />
                {errors["pickupDate"] && <p className="text-destructive text-xs mt-1">{errors["pickupDate"]}</p>}
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Pickup Time *</label>
                <select
                  value={form.pickupTime}
                  onChange={(e) => setForm((f) => ({ ...f, pickupTime: e.target.value }))}
                  className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber transition-colors"
                  data-testid="select-pickup-time"
                >
                  <option value="">Select time</option>
                  {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors["pickupTime"] && <p className="text-destructive text-xs mt-1">{errors["pickupTime"]}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Special Instructions</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any dietary preferences or special requests..."
                rows={3}
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors resize-none"
                data-testid="input-notes"
              />
            </div>

            <button
              type="submit"
              disabled={createOrder.isPending || items.length === 0}
              className="w-full bg-amber text-black py-3.5 rounded-xl font-medium hover:bg-amber/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="btn-submit-order"
            >
              {createOrder.isPending ? "Placing Order..." : `Place Order · ₹${totalAmount.toFixed(0)}`}
            </button>
          </form>
        </div>
      </div>
      <FloatingButtons />
    </div>
  );
}
