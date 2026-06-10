import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Mail, Phone, Shield, User, Trash2, Search } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface StoredUser {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  passwordHash: string;
  role: "user" | "admin";
}

const USERS_KEY = "bhoomi_mock_users";

const DEFAULT_USERS: StoredUser[] = [
  { id: 1, email: "admin@bhoomi.com", name: "Bhoomi Admin", phone: "+91 98765 43210", passwordHash: "Admin@1234", role: "admin" },
  { id: 2, email: "user@bhoomi.com", name: "Test User", phone: "+91 98765 00000", passwordHash: "User@1234", role: "user" },
];

function getUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_USERS;
  } catch { return DEFAULT_USERS; }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export default function AdminUsers() {
  const [users, setUsers] = useState<StoredUser[]>(getUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");

  const reload = () => setUsers(getUsers());

  const handleDelete = (id: number) => {
    if (id === 1) return; // protect admin account
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const updated = getUsers().filter((u) => u.id !== id);
    saveUsers(updated);
    reload();
  };

  const handleToggleRole = (id: number) => {
    if (id === 1) return; // protect admin account
    const all = getUsers();
    const idx = all.findIndex((u) => u.id === id);
    if (idx >= 0) {
      all[idx].role = all[idx].role === "admin" ? "user" : "admin";
      saveUsers(all);
      reload();
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-foreground mb-1">Users</h1>
          <p className="text-muted-foreground text-sm">View and manage all registered customer accounts.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-3xl font-bold text-foreground mb-1">{users.length}</div>
            <div className="text-muted-foreground text-sm">Total Users</div>
          </div>
          <div className="bg-card border border-amber/30 rounded-2xl p-5">
            <div className="text-3xl font-bold text-amber mb-1">{users.filter((u) => u.role === "user").length}</div>
            <div className="text-muted-foreground text-sm">Customers</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-3xl font-bold text-foreground mb-1">{users.filter((u) => u.role === "admin").length}</div>
            <div className="text-muted-foreground text-sm">Admins</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "user", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 rounded-full text-sm transition-all capitalize ${
                  roleFilter === r ? "bg-amber text-black font-medium" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "all" ? "All" : r === "admin" ? "Admins" : "Customers"}
              </button>
            ))}
          </div>
        </div>

        {/* Credentials info box */}
        <div className="bg-amber/5 border border-amber/20 rounded-2xl p-4 mb-6">
          <p className="text-amber text-sm font-medium mb-2">🔑 Test Login Credentials</p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-card rounded-xl p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-amber" />
                <span className="font-medium text-foreground">Admin</span>
              </div>
              <div className="text-muted-foreground text-xs">Email: <span className="text-foreground">admin@bhoomi.com</span></div>
              <div className="text-muted-foreground text-xs">Password: <span className="text-foreground">Admin@1234</span></div>
              <div className="text-muted-foreground text-xs mt-1">URL: <span className="text-amber">/admin/login</span></div>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-amber" />
                <span className="font-medium text-foreground">Customer</span>
              </div>
              <div className="text-muted-foreground text-xs">Email: <span className="text-foreground">user@bhoomi.com</span></div>
              <div className="text-muted-foreground text-xs">Password: <span className="text-foreground">User@1234</span></div>
              <div className="text-muted-foreground text-xs mt-1">URL: <span className="text-amber">/login</span></div>
            </div>
          </div>
        </div>

        {/* Users list */}
        {!filtered.length ? (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No users found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${user.role === "admin" ? "bg-amber text-black" : "bg-muted text-foreground"}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{user.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === "admin" ? "bg-amber/20 text-amber" : "bg-muted text-muted-foreground"}`}>
                        {user.role === "admin" ? "Admin" : "Customer"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Mail size={11} /> {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Phone size={11} /> {user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {user.id !== 1 && (
                    <>
                      <button
                        onClick={() => handleToggleRole(user.id)}
                        title={user.role === "admin" ? "Demote to Customer" : "Promote to Admin"}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
                      >
                        <Shield size={13} />
                        {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        title="Delete user"
                        className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                  {user.id === 1 && (
                    <span className="text-xs text-muted-foreground italic">Protected</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
