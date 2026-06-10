import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { mockUserLogin, mockUserRegister } from "@/lib/mockApi";

type Tab = "login" | "register";

// ─── Validation helpers ──────────────────────────────────────────────────────
function validateEmail(email: string) {
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
  return "";
}
function validatePassword(pwd: string) {
  if (!pwd) return "Password is required";
  if (pwd.length < 6) return "Password must be at least 6 characters";
  return "";
}
function validateName(name: string) {
  if (!name.trim()) return "Full name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  return "";
}
function validatePhone(phone: string) {
  if (!phone) return ""; // optional
  if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) return "Enter a valid 10-digit Indian mobile number";
  return "";
}
function validateConfirm(pwd: string, confirm: string) {
  if (!confirm) return "Please confirm your password";
  if (pwd !== confirm) return "Passwords do not match";
  return "";
}

// ─── Inline field error / success indicator ──────────────────────────────────
function FieldMessage({ error, touched }: { error: string; touched: boolean }) {
  if (!touched) return null;
  if (error) {
    return (
      <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs animate-in fade-in slide-in-from-top-1">
        <XCircle size={13} className="flex-shrink-0" />
        {error}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-green-400 text-xs animate-in fade-in slide-in-from-top-1">
      <CheckCircle size={13} className="flex-shrink-0" />
      Looks good!
    </div>
  );
}

// ─── Password strength bar ───────────────────────────────────────────────────
function PasswordStrength({ pwd }: { pwd: string }) {
  if (!pwd) return null;
  let strength = 0;
  if (pwd.length >= 6) strength++;
  if (pwd.length >= 10) strength++;
  if (/[A-Z]/.test(pwd)) strength++;
  if (/[0-9]/.test(pwd)) strength++;
  if (/[^A-Za-z0-9]/.test(pwd)) strength++;

  const labels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? colors[strength] : "bg-white/10"}`}
          />
        ))}
      </div>
      <span className="text-xs text-white/40">{labels[strength]}</span>
    </div>
  );
}

export default function Login() {
  const [tab, setTab] = useState<Tab>("login");
  const [, setLocation] = useLocation();
  const { login } = useUserAuth();
  const { toast } = useToast();

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || "/";

  // ── Login form state ──────────────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginTouched, setLoginTouched] = useState({ email: false, password: false });
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // ── Register form state ───────────────────────────────────────────────────
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [regTouched, setRegTouched] = useState({ name: false, email: false, phone: false, password: false, confirm: false });
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [loading, setLoading] = useState(false);

  // ── Computed errors ───────────────────────────────────────────────────────
  const loginErrors = {
    email: validateEmail(loginForm.email),
    password: validatePassword(loginForm.password),
  };
  const regErrors = {
    name: validateName(registerForm.name),
    email: validateEmail(registerForm.email),
    phone: validatePhone(registerForm.phone),
    password: validatePassword(registerForm.password),
    confirm: validateConfirm(registerForm.password, registerForm.confirm),
  };

  const loginValid = !loginErrors.email && !loginErrors.password;
  const regValid = !regErrors.name && !regErrors.email && !regErrors.phone && !regErrors.password && !regErrors.confirm;

  // Reset touched state when switching tabs
  useEffect(() => {
    setLoginTouched({ email: false, password: false });
    setRegTouched({ name: false, email: false, phone: false, password: false, confirm: false });
  }, [tab]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Touch all fields to show errors
    setLoginTouched({ email: true, password: true });
    if (!loginValid) return;

    setLoading(true);
    try {
      const data = mockUserLogin(loginForm.email, loginForm.password);
      login(data.token, data.user);
      toast({ title: `Welcome back, ${data.user.name}!` });
      setLocation(redirect);
    } catch (err: unknown) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegTouched({ name: true, email: true, phone: true, password: true, confirm: true });
    if (!regValid) return;

    setLoading(true);
    try {
      const data = mockUserRegister(
        registerForm.name.trim(),
        registerForm.email.trim(),
        registerForm.password,
        registerForm.phone || undefined
      );
      login(data.token, data.user);
      toast({ title: `Welcome to Bhoomi, ${data.user.name}!` });
      setLocation(redirect);
    } catch (err: unknown) {
      toast({
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-10 text-center block">
        <div className="font-serif text-3xl font-bold tracking-widest text-[#d4a853] uppercase">Bhoomi</div>
        <div className="text-xs text-white/40 tracking-widest uppercase mt-1">Tiffins & Snacks</div>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
          {/* Tab switcher */}
          <div className="flex">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-medium tracking-wider uppercase transition-all duration-200 ${
                  tab === t
                    ? "bg-[#d4a853] text-black"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* ── Sign In ── */}
              {tab === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="space-y-5"
                  noValidate
                >
                  <p className="text-white/60 text-sm mb-4 leading-relaxed">
                    Sign in to place pre-orders, request catering, and submit reviews.
                  </p>

                  {/* Email */}
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      onBlur={() => setLoginTouched({ ...loginTouched, email: true })}
                      className={`mt-1.5 w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                        loginTouched.email
                          ? loginErrors.email
                            ? "border-red-500/60 focus:border-red-500"
                            : "border-green-500/50 focus:border-green-500"
                          : "border-white/10 focus:border-[#d4a853]/50"
                      }`}
                      placeholder="your@email.com"
                    />
                    <FieldMessage error={loginErrors.email} touched={loginTouched.email} />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Password</label>
                    <div className="relative mt-1.5">
                      <input
                        type={showLoginPwd ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        onBlur={() => setLoginTouched({ ...loginTouched, password: true })}
                        className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 pr-10 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                          loginTouched.password
                            ? loginErrors.password
                              ? "border-red-500/60 focus:border-red-500"
                              : "border-green-500/50 focus:border-green-500"
                            : "border-white/10 focus:border-[#d4a853]/50"
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowLoginPwd(!showLoginPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showLoginPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <FieldMessage error={loginErrors.password} touched={loginTouched.password} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#d4a853] hover:bg-[#c49843] text-black font-semibold py-3 rounded-lg transition-colors mt-2 disabled:opacity-60"
                  >
                    {loading ? "Signing in…" : "Sign In"}
                  </button>

                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/30 text-xs uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      toast({ title: "Google Sign-In", description: "Google authentication is not configured in this demo. Use email/password login." });
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                  <p className="text-center text-white/40 text-sm pt-2">
                    New here?{" "}
                    <button type="button" onClick={() => setTab("register")} className="text-[#d4a853] hover:underline">
                      Create an account
                    </button>
                  </p>
                </motion.form>
              ) : (
                /* ── Create Account ── */
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                  noValidate
                >
                  <p className="text-white/60 text-sm mb-4 leading-relaxed">
                    Create a free account to start ordering from Bhoomi.
                  </p>

                  {/* Full Name */}
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      onBlur={() => setRegTouched({ ...regTouched, name: true })}
                      className={`mt-1.5 w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                        regTouched.name
                          ? regErrors.name
                            ? "border-red-500/60 focus:border-red-500"
                            : "border-green-500/50 focus:border-green-500"
                          : "border-white/10 focus:border-[#d4a853]/50"
                      }`}
                      placeholder="Your full name"
                    />
                    <FieldMessage error={regErrors.name} touched={regTouched.name} />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Email *</label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      onBlur={() => setRegTouched({ ...regTouched, email: true })}
                      className={`mt-1.5 w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                        regTouched.email
                          ? regErrors.email
                            ? "border-red-500/60 focus:border-red-500"
                            : "border-green-500/50 focus:border-green-500"
                          : "border-white/10 focus:border-[#d4a853]/50"
                      }`}
                      placeholder="your@email.com"
                    />
                    <FieldMessage error={regErrors.email} touched={regTouched.email} />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Phone <span className="text-white/30 lowercase normal-case">(optional)</span></label>
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      onBlur={() => setRegTouched({ ...regTouched, phone: true })}
                      className={`mt-1.5 w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                        regTouched.phone && registerForm.phone
                          ? regErrors.phone
                            ? "border-red-500/60 focus:border-red-500"
                            : "border-green-500/50 focus:border-green-500"
                          : "border-white/10 focus:border-[#d4a853]/50"
                      }`}
                      placeholder="+91 99999 99999"
                    />
                    {regTouched.phone && registerForm.phone && (
                      <FieldMessage error={regErrors.phone} touched={regTouched.phone} />
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Password *</label>
                    <div className="relative mt-1.5">
                      <input
                        type={showRegPwd ? "text" : "password"}
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        onBlur={() => setRegTouched({ ...regTouched, password: true })}
                        className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 pr-10 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                          regTouched.password
                            ? regErrors.password
                              ? "border-red-500/60 focus:border-red-500"
                              : "border-green-500/50 focus:border-green-500"
                            : "border-white/10 focus:border-[#d4a853]/50"
                        }`}
                        placeholder="Min 6 characters"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowRegPwd(!showRegPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showRegPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {registerForm.password && <PasswordStrength pwd={registerForm.password} />}
                    <FieldMessage error={regErrors.password} touched={regTouched.password} />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Confirm Password *</label>
                    <div className="relative mt-1.5">
                      <input
                        type={showConfirmPwd ? "text" : "password"}
                        value={registerForm.confirm}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                        onBlur={() => setRegTouched({ ...regTouched, confirm: true })}
                        className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 pr-10 text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                          regTouched.confirm
                            ? regErrors.confirm
                              ? "border-red-500/60 focus:border-red-500"
                              : "border-green-500/50 focus:border-green-500"
                            : "border-white/10 focus:border-[#d4a853]/50"
                        }`}
                        placeholder="Repeat password"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <FieldMessage error={regErrors.confirm} touched={regTouched.confirm} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#d4a853] hover:bg-[#c49843] text-black font-semibold py-3 rounded-lg transition-colors mt-1 disabled:opacity-60"
                  >
                    {loading ? "Creating account…" : "Create Account"}
                  </button>

                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/30 text-xs uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      toast({ title: "Google Sign-In", description: "Google authentication is not configured in this demo. Use email/password login." });
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign up with Google
                  </button>

                  <p className="text-center text-white/40 text-sm pt-1">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-[#d4a853] hover:underline">
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-white/30 text-sm hover:text-white/60 transition-colors">
            ← Back to website
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
