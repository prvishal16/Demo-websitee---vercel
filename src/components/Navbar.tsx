import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, LogOut, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useListMenuItems, useListOffers } from "@/lib/api-client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Pre-Order" },
  { href: "/offers", label: "Offers" },
  { href: "/catering", label: "Catering" },
  { href: "/feedback", label: "Reviews" },
];

interface SearchResult {
  type: "menu" | "offer" | "page";
  title: string;
  description?: string;
  href: string;
  price?: number;
}

const pageLinks: SearchResult[] = [
  { type: "page", title: "Home", href: "/" },
  { type: "page", title: "Menu", href: "/menu" },
  { type: "page", title: "Pre-Order", href: "/order" },
  { type: "page", title: "Offers", href: "/offers" },
  { type: "page", title: "Catering", href: "/catering" },
  { type: "page", title: "Reviews", href: "/feedback" },
  { type: "page", title: "Sign In", href: "/login" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();
  const { totalItems } = useCart();
  const { isLoggedIn, user, logout } = useUserAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: menuItems } = useListMenuItems({ available: true });
  const { data: offers } = useListOffers({ active: true });

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery("");
    }
  }, [searchOpen]);

  const q = searchQuery.toLowerCase().trim();

  const menuResults: SearchResult[] = q
    ? (menuItems ?? [])
        .filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            (item.description ?? "").toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        )
        .map((item) => ({
          type: "menu" as const,
          title: item.name,
          description: item.category + (item.price ? ` · ₹${item.price}` : ""),
          href: "/menu",
          price: item.price,
        }))
    : [];

  const offerResults: SearchResult[] = q
    ? (offers ?? [])
        .filter(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            o.description.toLowerCase().includes(q)
        )
        .map((o) => ({
          type: "offer" as const,
          title: o.title,
          description: o.description,
          href: "/offers",
        }))
    : [];

  const pageResults: SearchResult[] = q
    ? pageLinks.filter((p) => p.title.toLowerCase().includes(q))
    : [];

  const allResults = [...menuResults, ...offerResults, ...pageResults];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/">
            <span className="font-display text-xl font-semibold text-amber tracking-widest cursor-pointer" data-testid="nav-logo">
              BHOOMI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}>
                <span
                  data-testid={`nav-link-${l.label.toLowerCase()}`}
                  className={`text-sm tracking-wider uppercase cursor-pointer transition-colors ${
                    location === l.href ? "text-amber" : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {l.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(true)}
              data-testid="nav-search"
              className="p-2 text-foreground/70 hover:text-amber transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link href="/order">
              <button
                data-testid="nav-cart"
                className="relative p-2 text-foreground/70 hover:text-amber transition-colors"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>

            {isLoggedIn ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber/30 text-amber/80 hover:text-amber hover:border-amber/60 transition-all text-sm"
                >
                  <User size={14} />
                  <span className="max-w-[100px] truncate">{user?.name.split(" ")[0]}</span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl py-2 w-48 shadow-2xl z-50"
                    >
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-white/40 text-xs truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-white/60 hover:text-amber hover:border-amber/40 transition-all text-sm">
                  <User size={14} />
                  Sign In
                </button>
              </Link>
            )}

            <button
              data-testid="nav-menu-toggle"
              className="md:hidden p-2 text-foreground/70 hover:text-amber"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black border-t border-white/5 overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href}>
                    <span
                      onClick={() => setOpen(false)}
                      className={`block text-sm tracking-wider uppercase cursor-pointer transition-colors ${
                        location === l.href ? "text-amber" : "text-foreground/60"
                      }`}
                    >
                      {l.label}
                    </span>
                  </Link>
                ))}
                <div className="pt-2 border-t border-white/10">
                  {isLoggedIn ? (
                    <div className="space-y-3">
                      <p className="text-white/50 text-xs">Signed in as <span className="text-amber">{user?.name}</span></p>
                      <button
                        onClick={() => { logout(); setOpen(false); }}
                        className="flex items-center gap-2 text-sm text-white/60 hover:text-red-400 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <Link href="/login">
                      <span onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm text-amber">
                        <User size={14} />
                        Sign In / Create Account
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                <Search size={18} className="text-amber flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search menu, offers, pages..."
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
                  data-testid="search-input"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-white/40 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {q.length === 0 ? (
                  <div className="px-5 py-8 text-center text-white/30 text-sm">
                    Type to search menu items, offers, and pages...
                  </div>
                ) : allResults.length === 0 ? (
                  <div className="px-5 py-8 text-center text-white/30 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="py-2">
                    {menuResults.length > 0 && (
                      <div>
                        <div className="px-5 py-1.5 text-xs text-white/30 uppercase tracking-wider">Menu Items</div>
                        {menuResults.map((r, i) => (
                          <Link key={`menu-${i}`} href={r.href}>
                            <span
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between px-5 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              <div>
                                <div className="text-white text-sm">{r.title}</div>
                                <div className="text-white/40 text-xs">{r.description}</div>
                              </div>
                              {r.price != null && (
                                <span className="text-amber text-sm font-medium">₹{r.price}</span>
                              )}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {offerResults.length > 0 && (
                      <div>
                        <div className="px-5 py-1.5 text-xs text-white/30 uppercase tracking-wider">Offers</div>
                        {offerResults.map((r, i) => (
                          <Link key={`offer-${i}`} href={r.href}>
                            <span
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between px-5 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              <div>
                                <div className="text-white text-sm">{r.title}</div>
                                <div className="text-white/40 text-xs">{r.description}</div>
                              </div>
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {pageResults.length > 0 && (
                      <div>
                        <div className="px-5 py-1.5 text-xs text-white/30 uppercase tracking-wider">Pages</div>
                        {pageResults.map((r, i) => (
                          <Link key={`page-${i}`} href={r.href}>
                            <span
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center px-5 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              <div className="text-white text-sm">{r.title}</div>
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
