import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { mockAdminLogin } from "@/lib/mockApi";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "admin@bhoomi.com", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = mockAdminLogin(form.email, form.password);
      login(data.token);
      setLocation("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="font-display text-3xl text-amber tracking-widest mb-2">BHOOMI</div>
          <div className="text-muted-foreground text-sm">Admin Console</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="font-display text-xl text-foreground mb-2">Admin Sign In</h2>
          <p className="text-muted-foreground text-xs mb-6">
            Use <span className="text-amber font-medium">admin@bhoomi.com</span> / <span className="text-amber font-medium">Admin@1234</span>
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber transition-colors"
                data-testid="input-admin-email"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Enter password"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors"
                data-testid="input-admin-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber text-black py-3 rounded-xl font-medium hover:bg-amber/90 transition-all disabled:opacity-50 mt-2"
              data-testid="btn-admin-login"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-muted-foreground text-sm hover:text-amber transition-colors">
            Back to website
          </a>
        </div>
      </motion.div>
    </div>
  );
}
