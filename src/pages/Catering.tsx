import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Users, Calendar, ChefHat } from "lucide-react";
import Navbar from "@/components/Navbar";
import FloatingButtons from "@/components/FloatingButtons";
import { useSubmitCateringInquiry } from "@/lib/api-client";

const eventTypes = ["Wedding", "Corporate Event", "Birthday Party", "Pooja/Religious Function", "Anniversary", "Baby Shower", "Other"];

export default function Catering() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", eventDate: "", guestCount: "", eventType: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const submit = useSubmitCateringInquiry();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs["name"] = "Name is required";
    if (!form.phone.match(/^\+?[0-9]{10,13}$/)) errs["phone"] = "Valid phone required";
    if (!form.eventDate) errs["eventDate"] = "Event date is required";
    if (!form.guestCount || Number(form.guestCount) < 1) errs["guestCount"] = "Guest count required";
    if (!form.eventType) errs["eventType"] = "Event type is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    submit.mutate(
      { data: { ...form, guestCount: Number(form.guestCount) } },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 h-72 bg-gradient-to-b from-amber/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-amber text-xs tracking-[0.3em] uppercase mb-2">Catering Services</div>
            <h1 className="font-display text-4xl md:text-5xl mb-4">We bring <em>Bhoomi</em> to you</h1>
            <p className="text-muted-foreground text-lg max-w-xl">From intimate family gatherings to grand weddings — authentic South Indian cuisine for any occasion.</p>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: Users, label: "Any Scale", desc: "From 20 to 2000+ guests" },
            { icon: ChefHat, label: "Our Chefs", desc: "Authentic home-style cooking" },
            { icon: Calendar, label: "Plan Ahead", desc: "Book weeks in advance" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-6 text-center">
              <Icon size={28} className="text-amber mx-auto mb-3" />
              <div className="font-medium text-foreground text-sm mb-1">{label}</div>
              <div className="text-muted-foreground text-xs">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 pb-24">
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-green-500/20 rounded-2xl p-12 text-center">
            <CheckCircle size={56} className="text-green-400 mx-auto mb-6" />
            <h2 className="font-display text-2xl mb-3 text-foreground">Inquiry Received!</h2>
            <p className="text-muted-foreground">We'll contact you within 24 hours to discuss your event details and menu preferences.</p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-8 space-y-5"
          >
            <h2 className="font-display text-2xl text-foreground mb-6">Request Catering</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Full Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors" data-testid="input-catering-name" />
                {errors["name"] && <p className="text-destructive text-xs mt-1">{errors["name"]}</p>}
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Phone *</label>
                <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 99999 99999" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors" data-testid="input-catering-phone" />
                {errors["phone"] && <p className="text-destructive text-xs mt-1">{errors["phone"]}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
              <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="your@email.com" type="email" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors" data-testid="input-catering-email" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Event Date *</label>
                <input type="date" value={form.eventDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber transition-colors" data-testid="input-event-date" />
                {errors["eventDate"] && <p className="text-destructive text-xs mt-1">{errors["eventDate"]}</p>}
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Guest Count *</label>
                <input type="number" min="1" value={form.guestCount} onChange={(e) => setForm((f) => ({ ...f, guestCount: e.target.value }))} placeholder="100" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors" data-testid="input-guest-count" />
                {errors["guestCount"] && <p className="text-destructive text-xs mt-1">{errors["guestCount"]}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Event Type *</label>
              <select value={form.eventType} onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber transition-colors" data-testid="select-event-type">
                <option value="">Select event type</option>
                {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors["eventType"] && <p className="text-destructive text-xs mt-1">{errors["eventType"]}</p>}
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Additional Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Dietary requirements, preferred dishes, venue details..." rows={4} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors resize-none" data-testid="input-catering-notes" />
            </div>

            <button type="submit" disabled={submit.isPending} className="w-full bg-amber text-black py-3.5 rounded-xl font-medium hover:bg-amber/90 transition-all active:scale-95 disabled:opacity-50" data-testid="btn-submit-catering">
              {submit.isPending ? "Sending..." : "Submit Inquiry"}
            </button>
          </motion.form>
        )}
      </div>
      <FloatingButtons />
    </div>
  );
}
