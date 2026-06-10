// ─── Mock API Service ──────────────────────────────────────────────────────
// Replaces backend API calls with localStorage-based mock.
// Hardcoded credentials for testing:
//   Admin:  admin@bhoomi.com / Admin@1234
//   User:   user@bhoomi.com  / User@1234  (pre-seeded)
// Users can also register new accounts; they are stored in localStorage.

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
}

interface StoredUser {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  passwordHash: string; // we store plain text for demo purposes
  role: "user" | "admin";
}

const USERS_KEY = "bhoomi_mock_users";
const ORDERS_KEY = "bhoomi_mock_orders";
const MENU_KEY = "bhoomi_mock_menu";
const FEEDBACK_KEY = "bhoomi_mock_feedback";
const OFFERS_KEY = "bhoomi_mock_offers";
const CATERING_KEY = "bhoomi_mock_catering";

// ── Seed default users ──────────────────────────────────────────────────────
function seedUsers(): StoredUser[] {
  const defaults: StoredUser[] = [
    {
      id: 1,
      email: "admin@bhoomi.com",
      name: "Bhoomi Admin",
      phone: "+91 98765 43210",
      passwordHash: "Admin@1234",
      role: "admin",
    },
    {
      id: 2,
      email: "user@bhoomi.com",
      name: "Test User",
      phone: "+91 98765 00000",
      passwordHash: "User@1234",
      role: "user",
    },
  ];
  return defaults;
}

function getUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
      const defaults = seedUsers();
      localStorage.setItem(USERS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed: StoredUser[] = JSON.parse(stored);
    // always ensure admin & default user exist
    const defaultAdmin = { id: 1, email: "admin@bhoomi.com", name: "Bhoomi Admin", phone: "+91 98765 43210", passwordHash: "Admin@1234", role: "admin" as const };
    const defaultUser = { id: 2, email: "user@bhoomi.com", name: "Test User", phone: "+91 98765 00000", passwordHash: "User@1234", role: "user" as const };
    const hasAdmin = parsed.some((u) => u.email === "admin@bhoomi.com");
    const hasUser = parsed.some((u) => u.email === "user@bhoomi.com");
    const merged = [...parsed];
    if (!hasAdmin) merged.unshift(defaultAdmin);
    if (!hasUser) merged.splice(1, 0, defaultUser);
    return merged;
  } catch {
    return seedUsers();
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function makeToken(userId: number, role: string): string {
  return btoa(JSON.stringify({ userId, role, ts: Date.now() }));
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export function mockUserLogin(email: string, password: string): { token: string; user: UserProfile } {
  const users = getUsers();
  const found = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
  );
  if (!found) throw new Error("Invalid email or password. Please check your credentials.");
  const token = makeToken(found.id, found.role);
  return {
    token,
    user: { id: found.id, email: found.email, name: found.name, phone: found.phone },
  };
}

export function mockUserRegister(
  name: string,
  email: string,
  password: string,
  phone?: string
): { token: string; user: UserProfile } {
  const users = getUsers();
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("An account with this email already exists.");
  const newUser: StoredUser = {
    id: Date.now(),
    email: email.toLowerCase().trim(),
    name: name.trim(),
    phone: phone || null,
    passwordHash: password,
    role: "user",
  };
  users.push(newUser);
  saveUsers(users);
  const token = makeToken(newUser.id, "user");
  return {
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, phone: newUser.phone },
  };
}

export function mockAdminLogin(email: string, password: string): { token: string } {
  const users = getUsers();
  const found = users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.passwordHash === password &&
      u.role === "admin"
  );
  if (!found) throw new Error("Invalid admin credentials.");
  return { token: makeToken(found.id, "admin") };
}

// ── Menu Items ────────────────────────────────────────────────────────────────

const DEFAULT_MENU = [
  { id: 1, name: "Idli Sambar", description: "Soft steamed idlis with fresh sambar & chutneys", price: 60, category: "Tiffins", imageUrl: null, available: true, isSpecial: true },
  { id: 2, name: "Masala Dosa", description: "Crispy dosa with spiced potato filling", price: 80, category: "Tiffins", imageUrl: null, available: true, isSpecial: true },
  { id: 3, name: "Upma", description: "Rava upma with vegetables and curry leaves", price: 50, category: "Tiffins", imageUrl: null, available: true, isSpecial: false },
  { id: 4, name: "Poha", description: "Flattened rice with onions, peanuts and spices", price: 45, category: "Tiffins", imageUrl: null, available: true, isSpecial: false },
  { id: 5, name: "Vada Sambar", description: "Crispy medu vadas with sambar and coconut chutney", price: 70, category: "Tiffins", imageUrl: null, available: true, isSpecial: true },
  { id: 6, name: "Pesarattu", description: "Green moong dal dosa with ginger chutney", price: 75, category: "Tiffins", imageUrl: null, available: true, isSpecial: false },
  { id: 7, name: "Mirchi Bajji", description: "Deep-fried stuffed chilli fritters", price: 40, category: "Snacks", imageUrl: null, available: true, isSpecial: true },
  { id: 8, name: "Punugulu", description: "Crispy idli batter bites with chutneys", price: 45, category: "Snacks", imageUrl: null, available: true, isSpecial: false },
  { id: 9, name: "Bonda", description: "Spicy potato filled fritters", price: 40, category: "Snacks", imageUrl: null, available: true, isSpecial: false },
  { id: 10, name: "Filter Coffee", description: "Traditional South Indian filter coffee", price: 30, category: "Beverages", imageUrl: null, available: true, isSpecial: false },
  { id: 11, name: "Masala Chai", description: "Aromatic spiced tea", price: 25, category: "Beverages", imageUrl: null, available: true, isSpecial: false },
];

export function getMockMenuItems(available?: boolean) {
  try {
    const stored = localStorage.getItem(MENU_KEY);
    const items = stored ? JSON.parse(stored) : DEFAULT_MENU;
    if (!stored) localStorage.setItem(MENU_KEY, JSON.stringify(DEFAULT_MENU));
    if (available !== undefined) return items.filter((i: { available: boolean }) => i.available === available);
    return items;
  } catch { return DEFAULT_MENU; }
}

export function getMockCategories(): string[] {
  const items = getMockMenuItems();
  return [...new Set(items.map((i: { category: string }) => i.category))] as string[];
}

export function saveMockMenuItem(item: { id?: number; name: string; description: string | null; price: number; category: string; imageUrl: string | null; available: boolean; isSpecial: boolean }) {
  const items = getMockMenuItems();
  if (item.id) {
    const idx = items.findIndex((i: { id: number }) => i.id === item.id);
    if (idx >= 0) items[idx] = item;
  } else {
    items.push({ ...item, id: Date.now() });
  }
  localStorage.setItem(MENU_KEY, JSON.stringify(items));
}

export function deleteMockMenuItem(id: number) {
  const items = getMockMenuItems().filter((i: { id: number }) => i.id !== id);
  localStorage.setItem(MENU_KEY, JSON.stringify(items));
}

// ── Orders ────────────────────────────────────────────────────────────────────

const DEFAULT_ORDERS = [
  {
    id: 1001,
    customerName: "Ravi Kumar",
    customerPhone: "9876543210",
    pickupDate: "2026-06-08",
    pickupTime: "09:00 AM",
    notes: "Less spicy please",
    totalAmount: 215,
    status: "Pending",
    items: [
      { menuItemId: 1, name: "Idli Sambar", quantity: 2, price: 60 },
      { menuItemId: 7, name: "Mirchi Bajji", quantity: 1, price: 40 },
      { menuItemId: 10, name: "Filter Coffee", quantity: 2, price: 30 },
    ],
  },
  {
    id: 1002,
    customerName: "Priya Sharma",
    customerPhone: "9123456780",
    pickupDate: "2026-06-08",
    pickupTime: "10:30 AM",
    notes: null,
    totalAmount: 185,
    status: "Preparing",
    items: [
      { menuItemId: 2, name: "Masala Dosa", quantity: 2, price: 80 },
      { menuItemId: 11, name: "Masala Chai", quantity: 1, price: 25 },
    ],
  },
  {
    id: 1003,
    customerName: "Suresh Reddy",
    customerPhone: "9988776655",
    pickupDate: "2026-06-07",
    pickupTime: "08:00 AM",
    notes: "Extra chutney",
    totalAmount: 160,
    status: "Completed",
    items: [
      { menuItemId: 5, name: "Vada Sambar", quantity: 2, price: 70 },
      { menuItemId: 11, name: "Masala Chai", quantity: 1, price: 25 },
    ],
  },
];

export function getMockOrders(status?: string) {
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    const orders = stored ? JSON.parse(stored) : DEFAULT_ORDERS;
    if (!stored) localStorage.setItem(ORDERS_KEY, JSON.stringify(DEFAULT_ORDERS));
    if (status) return orders.filter((o: { status: string }) => o.status.toLowerCase() === status.toLowerCase());
    return orders;
  } catch { return DEFAULT_ORDERS; }
}

export function saveMockOrder(order: {
  customerName: string; customerPhone: string; pickupDate: string;
  pickupTime: string; notes?: string; items: { menuItemId: number; name: string; quantity: number; price: number }[];
}) {
  const orders = getMockOrders();
  const totalAmount = order.items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);
  const newOrder = { ...order, id: Date.now(), totalAmount, status: "Pending", notes: order.notes || null };
  orders.push(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return newOrder;
}

export function updateMockOrderStatus(id: number, status: string) {
  const orders = getMockOrders();
  const idx = orders.findIndex((o: { id: number }) => o.id === id);
  if (idx >= 0) orders[idx].status = status;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return orders[idx];
}

// ── Feedback ──────────────────────────────────────────────────────────────────

const DEFAULT_FEEDBACK = [
  { id: 1, customerName: "Anitha R", rating: 5, comment: "Best tiffins in Kompally! The idli sambar is absolutely divine.", status: "approved", featured: true, createdAt: "2026-06-01T08:00:00Z" },
  { id: 2, customerName: "Manoj P", rating: 4, comment: "Great taste, quick service. Masala dosa is a must try!", status: "approved", featured: false, createdAt: "2026-06-03T10:30:00Z" },
  { id: 3, customerName: "Sravya K", rating: 5, comment: "Feels like home cooking. Will definitely order again.", status: "approved", featured: true, createdAt: "2026-06-05T09:15:00Z" },
];

export function getMockFeedback(all?: boolean) {
  try {
    const stored = localStorage.getItem(FEEDBACK_KEY);
    const feedback = stored ? JSON.parse(stored) : DEFAULT_FEEDBACK;
    if (!stored) localStorage.setItem(FEEDBACK_KEY, JSON.stringify(DEFAULT_FEEDBACK));
    if (!all) return feedback.filter((f: { status: string }) => f.status === "approved");
    return feedback;
  } catch { return DEFAULT_FEEDBACK; }
}

export function saveMockFeedback(data: { customerName: string; rating: number; comment: string }) {
  const feedback = getMockFeedback(true);
  const newEntry = { ...data, id: Date.now(), status: "pending", featured: false, createdAt: new Date().toISOString() };
  feedback.push(newEntry);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
  return newEntry;
}

export function updateMockFeedback(id: number, data: { status?: string; featured?: boolean }) {
  const feedback = getMockFeedback(true);
  const idx = feedback.findIndex((f: { id: number }) => f.id === id);
  if (idx >= 0) feedback[idx] = { ...feedback[idx], ...data };
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
  return feedback[idx];
}

export function deleteMockFeedback(id: number) {
  const feedback = getMockFeedback(true).filter((f: { id: number }) => f.id !== id);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
}

// ── Offers ────────────────────────────────────────────────────────────────────

const DEFAULT_OFFERS = [
  { id: 1, title: "Morning Special", description: "Get 20% off on all tiffins before 9 AM!", discountPercent: 20, validFrom: "2026-06-01", validUntil: "2026-07-31", active: true },
  { id: 2, title: "Weekend Combo", description: "Order any 2 tiffins and get a free filter coffee.", discountPercent: null, validFrom: "2026-06-07", validUntil: "2026-06-30", active: true },
];

export function getMockOffers(active?: boolean) {
  try {
    const stored = localStorage.getItem(OFFERS_KEY);
    const offers = stored ? JSON.parse(stored) : DEFAULT_OFFERS;
    if (!stored) localStorage.setItem(OFFERS_KEY, JSON.stringify(DEFAULT_OFFERS));
    if (active !== undefined) return offers.filter((o: { active: boolean }) => o.active === active);
    return offers;
  } catch { return DEFAULT_OFFERS; }
}

export function saveMockOffer(offer: { id?: number; title: string; description: string; discountPercent: number | null; validFrom: string | null; validUntil: string | null; active: boolean }) {
  const offers = getMockOffers();
  if (offer.id) {
    const idx = offers.findIndex((o: { id: number }) => o.id === offer.id);
    if (idx >= 0) offers[idx] = offer;
  } else {
    offers.push({ ...offer, id: Date.now() });
  }
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}

export function deleteMockOffer(id: number) {
  const offers = getMockOffers().filter((o: { id: number }) => o.id !== id);
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}

// ── Catering ──────────────────────────────────────────────────────────────────

const DEFAULT_CATERING: {
  id: number; name: string; phone: string; email: string | null;
  eventDate: string; guestCount: number; eventType: string;
  notes: string | null; status: string; createdAt: string;
}[] = [
  {
    id: 1, name: "Venkat Family", phone: "9876501234", email: "venkat@gmail.com",
    eventDate: "2026-06-20", guestCount: 50, eventType: "Wedding",
    notes: "Need South Indian breakfast items", status: "new", createdAt: "2026-06-05T11:00:00Z",
  },
];

export function getMockCatering() {
  try {
    const stored = localStorage.getItem(CATERING_KEY);
    const data = stored ? JSON.parse(stored) : DEFAULT_CATERING;
    if (!stored) localStorage.setItem(CATERING_KEY, JSON.stringify(DEFAULT_CATERING));
    return data;
  } catch { return DEFAULT_CATERING; }
}

export function saveMockCateringInquiry(data: {
  name: string; phone: string; email?: string; eventDate: string;
  guestCount: number; eventType: string; notes?: string;
}) {
  const catering = getMockCatering();
  const newEntry = {
    ...data, id: Date.now(), email: data.email || null, notes: data.notes || null,
    status: "new", createdAt: new Date().toISOString(),
  };
  catering.push(newEntry);
  localStorage.setItem(CATERING_KEY, JSON.stringify(catering));
  return newEntry;
}

// ── Dashboard Stats ────────────────────────────────────────────────────────────

export function getMockDashboardStats() {
  const orders = getMockOrders();
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o: { pickupDate: string }) => o.pickupDate === today);
  return {
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    revenue: orders.reduce((s: number, o: { totalAmount: number }) => s + o.totalAmount, 0),
    todayRevenue: todayOrders.reduce((s: number, o: { totalAmount: number }) => s + o.totalAmount, 0),
    pendingOrders: orders.filter((o: { status: string }) => o.status === "Pending").length,
    completedOrders: orders.filter((o: { status: string }) => o.status === "Completed").length,
    totalMenuItems: getMockMenuItems().length,
    totalFeedback: getMockFeedback(true).length,
  };
}

export function getMockTopSelling() {
  const orders = getMockOrders();
  const map: Record<number, { menuItemId: number; name: string; totalOrdered: number; revenue: number }> = {};
  for (const order of orders) {
    for (const item of order.items) {
      if (!map[item.menuItemId]) map[item.menuItemId] = { menuItemId: item.menuItemId, name: item.name, totalOrdered: 0, revenue: 0 };
      map[item.menuItemId].totalOrdered += item.quantity;
      map[item.menuItemId].revenue += item.price * item.quantity;
    }
  }
  return Object.values(map).sort((a, b) => b.totalOrdered - a.totalOrdered);
}

// ── Update Catering Status ─────────────────────────────────────────────────
export function updateMockCateringStatus(id: number, status: string) {
  const catering = getMockCatering();
  const idx = catering.findIndex((c: { id: number }) => c.id === id);
  if (idx >= 0) catering[idx].status = status;
  localStorage.setItem(CATERING_KEY, JSON.stringify(catering));
  return catering[idx];
}

// ── Avg Rating ────────────────────────────────────────────────────────────
export function getMockAvgRating(): number {
  const feedback = getMockFeedback(false); // only approved
  if (!feedback.length) return 0;
  const sum = feedback.reduce((s: number, f: { rating: number }) => s + f.rating, 0);
  return parseFloat((sum / feedback.length).toFixed(1));
}
