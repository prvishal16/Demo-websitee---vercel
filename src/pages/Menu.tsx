import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingBag, Plus, Minus, Star, Clock, Flame, Leaf } from "lucide-react";
import Navbar from "@/components/Navbar";
import FloatingButtons from "@/components/FloatingButtons";
import { useCart } from "@/contexts/CartContext";
import { Link } from "wouter";

// ─── Full Static Menu ────────────────────────────────────────────────────────
// Sourced directly from the physical menu boards

interface StaticMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  isSpecial: boolean;
  isVeg: boolean;
  containsMilk?: boolean;
  bestseller?: boolean;
  rating: number;
  prepTime: string;
  timeNote?: string;
}

const MENU_ITEMS: StaticMenuItem[] = [
  // ── TIFFINS ──────────────────────────────────────────────────────────────
  { id: 1,  name: "Plain Idly (2 pcs)",          description: "Soft, fluffy steamed rice cakes served with sambar & chutney", price: 29, category: "Tiffins", imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80", isSpecial: false, isVeg: true, rating: 4.5, prepTime: "5 min" },
  { id: 2,  name: "Ghee Podi Idly",              description: "Steamed idly tossed in aromatic ghee and gunpowder podi spice", price: 49, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.7, prepTime: "5 min", bestseller: true },
  { id: 3,  name: "Sambaar Idly",                description: "Soft idlies dunked in rich, tangy sambar — a classic comfort dish", price: 39, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.6, prepTime: "5 min" },
  { id: 4,  name: "Millet Idly (2 pcs)",         description: "Healthy, nutritious idly made with millet for a wholesome start", price: 39, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.5, prepTime: "5 min" },
  { id: 5,  name: "Vada (2 pcs)",                description: "Crispy golden lentil fritters, best paired with sambar & chutney", price: 39, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.6, prepTime: "6 min", timeNote: "07:00–12:00 AM" },
  { id: 6,  name: "Sambaar Vada",                description: "Crunchy vada soaked in flavourful sambar — a Hyderabadi favourite", price: 45, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.7, prepTime: "6 min" },
  { id: 7,  name: "Prerugu Vada",                description: "Vada soaked in thin, tangy curd mixture with mustard seasoning", price: 49, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.5, prepTime: "5 min" },
  { id: 8,  name: "Onion Bonda (2 pcs)",         description: "Deep-fried crispy snack with spiced onion filling inside a batter shell", price: 29, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.5, prepTime: "5 min", timeNote: "07:00–12:00 AM" },
  { id: 9,  name: "Mysore Bonda (2 pcs)",        description: "Soft, fluffy bondas made with maida, ginger & pepper — melt-in-mouth", price: 29, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.4, prepTime: "5 min", timeNote: "07:00–12:00 AM" },
  { id: 10, name: "Poori (3 pcs)",               description: "Light, puffed whole wheat poori served with spiced potato curry", price: 49, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.6, prepTime: "7 min" },
  { id: 11, name: "Poori Chole (1 pc)",          description: "Golden puffed poori served with hearty chickpea masala gravy", price: 59, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.6, prepTime: "7 min" },
  { id: 12, name: "Upma",                        description: "Fluffy semolina upma tempered with mustard, curry leaves & vegetables", price: 49, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.4, prepTime: "8 min" },
  { id: 13, name: "Pongal",                      description: "Soft, peppery rice and lentil dish cooked with ghee, cashews & cumin", price: 79, category: "Tiffins", imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80", isSpecial: true, isVeg: true, rating: 4.9, prepTime: "5 min", bestseller: true },
  { id: 14, name: "Plain Dosa",                  description: "Thin, crispy fermented rice batter crepe served with chutneys", price: 39, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.5, prepTime: "6 min" },
  { id: 15, name: "Masala Dosa",                 description: "Classic crispy dosa stuffed with spiced potato & onion masala", price: 49, category: "Tiffins", imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80", isSpecial: false, isVeg: true, rating: 4.7, prepTime: "8 min", bestseller: true },
  { id: 16, name: "Onion Dosa",                  description: "Crispy dosa topped with fresh sautéed onions and green chillies", price: 59, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.6, prepTime: "7 min" },
  { id: 17, name: "Ghee Karam Dosa",             description: "Dosa smeared with fiery ghee karam podi — bold, spicy, indulgent", price: 79, category: "Tiffins", imageUrl: null, isSpecial: true, isVeg: true, rating: 4.8, prepTime: "7 min", bestseller: true },
  { id: 18, name: "Ghee Podi Dosa",              description: "Crispy dosa coated with aromatic gunpowder podi and melted ghee", price: 79, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.7, prepTime: "7 min" },
  { id: 19, name: "Ghee Karam Onion Dosa",       description: "Spicy ghee karam dosa topped with fresh caramelised onions", price: 89, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.8, prepTime: "8 min" },
  { id: 20, name: "Uthappam",                    description: "Thick, spongy rice pancake topped with onion, tomato & coriander", price: 79, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.6, prepTime: "8 min" },
  { id: 21, name: "Ghee Karam Uthappam",         description: "Thick uthappam with ghee karam spice mix — hearty and flavourful", price: 89, category: "Tiffins", imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80", isSpecial: true, isVeg: true, rating: 4.8, prepTime: "9 min", bestseller: true },
  { id: 22, name: "Millet Dosa",                 description: "Healthy, iron-rich millet dosa — light, crispy, and nutritious", price: 89, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.5, prepTime: "7 min" },
  { id: 23, name: "Set Dosa",                    description: "Set of 3 soft, spongy small dosas served with chutneys & sambar", price: 79, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.6, prepTime: "8 min" },
  { id: 24, name: "Plain Pesarattu",             description: "Wholesome green moong dosa — protein-rich and delicately flavoured", price: 49, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.5, prepTime: "7 min" },
  { id: 25, name: "Onion Pesarattu",             description: "Green moong crepe topped with fresh raw onions for a crunch", price: 59, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.5, prepTime: "7 min" },
  { id: 26, name: "Upma Pesarattu",              description: "Pesarattu stuffed with fluffy semolina upma — popular Andhra combo", price: 69, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.6, prepTime: "9 min" },
  { id: 27, name: "Ghee Pesarattu",              description: "Moong dosa generously drizzled with pure ghee for rich flavour", price: 79, category: "Tiffins", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.7, prepTime: "8 min" },

  // ── SNACKS ───────────────────────────────────────────────────────────────
  { id: 40, name: "Mirchi Bajji",                description: "Long green chilli dipped in spiced gram flour batter and deep-fried", price: 40, category: "Snacks", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.6, prepTime: "5 min", timeNote: "04:00–07:00 PM" },
  { id: 41, name: "Masala Mirchi Bajji",         description: "Stuffed chilli bajji with a spicy masala filling — extra fiery", price: 50, category: "Snacks", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.7, prepTime: "6 min", timeNote: "04:00–07:00 PM" },
  { id: 42, name: "Punugulu",                    description: "Crispy batter pearls made from idly/dosa batter — perfect snack", price: 40, category: "Snacks", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.5, prepTime: "5 min", timeNote: "04:00–07:00 PM" },
  { id: 43, name: "Masala Vada",                 description: "Spiced chana dal fritters with onions, chilli & curry leaves", price: 40, category: "Snacks", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.6, prepTime: "5 min", timeNote: "04:00–07:00 PM" },
  { id: 44, name: "Makka Vada",                  description: "Corn vada — crunchy golden fritters made with fresh corn kernels", price: 50, category: "Snacks", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.5, prepTime: "6 min", timeNote: "04:00–07:00 PM" },
  { id: 45, name: "Sweets",                      description: "Seasonal South Indian sweets — ask our team for today's selection", price: 50, category: "Snacks", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.4, prepTime: "Ready", timeNote: "04:00–07:00 PM" },

  // ── BEVERAGES ────────────────────────────────────────────────────────────
  { id: 50, name: "Chai",                        description: "Classic Indian tea brewed to perfection with aromatic spices", price: 20, category: "Beverages", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.7, prepTime: "3 min", bestseller: true },
  { id: 51, name: "Ginger Chai",                 description: "Hot, soothing tea with fresh crushed ginger — warm and invigorating", price: 25, category: "Beverages", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.7, prepTime: "3 min" },
  { id: 52, name: "Masala Chai",                 description: "Spiced tea blend with cardamom, cinnamon, ginger & black pepper", price: 30, category: "Beverages", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.8, prepTime: "4 min" },
  { id: 53, name: "Coffee",                      description: "Strong, aromatic filter coffee brewed in traditional South Indian style", price: 30, category: "Beverages", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.8, prepTime: "3 min", bestseller: true },
  { id: 54, name: "Lemon Chai",                  description: "Refreshing lemon-infused tea — light, citrusy and soothing", price: 25, category: "Beverages", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.5, prepTime: "3 min" },
  { id: 55, name: "Boost | Horlicks | Bournavita", description: "Your choice of health drink prepared with full-cream milk", price: 30, category: "Beverages", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.4, prepTime: "3 min" },
  { id: 56, name: "Buttermilk | Majjiga",        description: "Chilled, seasoned buttermilk with curry leaves and ginger — refreshing", price: 50, category: "Beverages", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.6, prepTime: "2 min" },
  { id: 57, name: "Sweet Lassi",                 description: "Thick, creamy yoghurt-based sweet drink — a classic summer cooler", price: 60, category: "Beverages", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.7, prepTime: "3 min" },

  // ── MILKSHAKES ───────────────────────────────────────────────────────────
  { id: 70, name: "Vanilla Milkshake",           description: "Classic creamy vanilla shake blended with full-cream milk", price: 59, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.5, prepTime: "4 min" },
  { id: 71, name: "Coffee Milkshake",            description: "Bold filter coffee blended into a rich, chilled milkshake", price: 79, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.7, prepTime: "4 min" },
  { id: 72, name: "Strawberry Milkshake",        description: "Thick, fruity milkshake made with fresh strawberry pulp", price: 79, category: "Milkshakes", imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80", isSpecial: true, isVeg: true, containsMilk: true, rating: 4.6, prepTime: "4 min" },
  { id: 73, name: "Pista Milkshake",             description: "Indulgent pistachio milkshake with a gorgeous pale-green hue", price: 79, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.6, prepTime: "4 min" },
  { id: 74, name: "Alphonso Mangi Milkshake",    description: "Seasonal Alphonso mango blended into a luscious, tropical shake", price: 79, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.8, prepTime: "4 min", bestseller: true },
  { id: 75, name: "Butterscotch Milkshake",      description: "Caramel-butterscotch swirl shake — sweet, creamy and indulgent", price: 79, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.6, prepTime: "4 min" },
  { id: 76, name: "Chocolate Milkshake",         description: "Rich dark chocolate blended shake for all chocoholic lovers", price: 79, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.7, prepTime: "4 min" },
  { id: 77, name: "Spanish Delight Milkshake",   description: "A unique spiced chocolate milkshake with a mysterious blend", price: 79, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.5, prepTime: "4 min" },
  { id: 78, name: "Kesari Badaam Pista Milkshake", description: "Saffron, almond, and pistachio royal milkshake — festive and rich", price: 79, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.7, prepTime: "5 min" },
  { id: 79, name: "Orange Milkshake",            description: "Refreshing citrus orange blended with milk for a sweet-tangy treat", price: 79, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.5, prepTime: "4 min" },
  { id: 80, name: "Kulfi Milkshake",             description: "Traditional kulfi flavour turned into a thick, chilled milkshake", price: 79, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.6, prepTime: "4 min" },
  { id: 81, name: "Pineapple Milkshake",         description: "Tropical pineapple blended with creamy milk — tangy and sweet", price: 79, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.4, prepTime: "4 min" },
  { id: 82, name: "Black Current Milkshake",     description: "Deep, rich blackcurrant milkshake — bold colour, bold taste", price: 149, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.6, prepTime: "4 min" },
  { id: 83, name: "Chickoo Milkshake",           description: "Sweet sapota (chiku) blended into a luscious, earthy milkshake", price: 149, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.7, prepTime: "4 min" },
  { id: 84, name: "Fig & Honey Milkshake",       description: "Dried figs and honey blended into a naturally sweet, healthy shake", price: 149, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.6, prepTime: "4 min" },
  { id: 85, name: "Jackfruit Milkshake",         description: "Seasonal jackfruit blended into a tropical, fragrant milkshake", price: 149, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.7, prepTime: "4 min" },
  { id: 86, name: "Kiwi Milkshake",             description: "Tangy green kiwi blended smooth with chilled milk — vibrant & fresh", price: 149, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.5, prepTime: "4 min" },
  { id: 87, name: "Tender Coconut Milkshake",    description: "Fresh tender coconut water and meat blended into a cool, creamy shake", price: 149, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.8, prepTime: "5 min", bestseller: true },
  { id: 88, name: "Peach Milkshake",             description: "Juicy, fresh peaches blended with chilled milk — summer in a glass", price: 149, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.5, prepTime: "4 min" },
  { id: 89, name: "Guava Milkshake",             description: "Tropical pink guava blended into a thick, refreshing milkshake", price: 149, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.5, prepTime: "4 min" },
  { id: 90, name: "Lichi Milkshake",             description: "Sweet, floral lychee fruit blended into a delicate, creamy shake", price: 149, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.6, prepTime: "4 min" },
  { id: 91, name: "Passion Fruit Milkshake",     description: "Exotic, tangy-sweet passion fruit blended with creamy milk", price: 199, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.7, prepTime: "5 min" },
  { id: 92, name: "Sitaphal Milkshake",          description: "Seasonal custard apple blended into a naturally sweet milkshake", price: 199, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.8, prepTime: "5 min", bestseller: true },
  { id: 93, name: "Strawberry Cheese Cake Milkshake", description: "Decadent cheesecake-flavoured shake with real strawberry — indulgent!", price: 199, category: "Milkshakes", imageUrl: null, isSpecial: true, isVeg: true, containsMilk: true, rating: 4.9, prepTime: "5 min", bestseller: true },
  { id: 94, name: "Blueberry Milkshake",         description: "Fresh blueberries blended smooth with milk — antioxidant rich", price: 199, category: "Milkshakes", imageUrl: null, isSpecial: false, isVeg: true, containsMilk: true, rating: 4.7, prepTime: "4 min" },

  // ── COMBOS ───────────────────────────────────────────────────────────────
  { id: 60, name: "Breakfast Combo",             description: "Idly (1pc) + Vada (1pc) + Bonda (1pc) + Set Dosa (1pc) + Upma + Tea", price: 99, category: "Combos", imageUrl: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&q=80", isSpecial: true, isVeg: true, rating: 4.8, prepTime: "10 min", bestseller: true, timeNote: "07:00–12:00 AM" },
  { id: 61, name: "Rice Combo",                  description: "Flavoured Rice + Sambaar Rice + Curd Rice — complete lunch combo", price: 99, category: "Combos", imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80", isSpecial: false, isVeg: true, rating: 4.7, prepTime: "5 min", timeNote: "12:00–04:00 PM" },
  { id: 62, name: "Snack Combo",                 description: "Masala Mirchi Bajji (2pc) + Punugulu (5pc) + Tea — perfect evening snack", price: 49, category: "Combos", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.6, prepTime: "8 min", timeNote: "04:00–07:00 PM" },

  // ── RICE DISHES ──────────────────────────────────────────────────────────
  { id: 63, name: "Sambaar Rice",                description: "Steaming hot rice cooked in tangy sambar — simple, satisfying meal", price: 89, category: "Rice Dishes", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.6, prepTime: "5 min", timeNote: "12:00–04:00 PM" },
  { id: 64, name: "Curd Rice",                   description: "Cooling tempered curd rice with mustard, curry leaves & pomegranate", price: 89, category: "Rice Dishes", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.7, prepTime: "5 min", timeNote: "12:00–04:00 PM" },
  { id: 65, name: "Flavoured Rice",              description: "Chef's special rice — lemon, coconut, tamarind, or pulihora based on day", price: 89, category: "Rice Dishes", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.5, prepTime: "5 min", timeNote: "12:00–04:00 PM" },
  { id: 66, name: "South Indian Meals",          description: "Full traditional meals: sambaar rice, curd rice, flavoured rice with papad & pickle", price: 149, category: "Rice Dishes", imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80", isSpecial: true, isVeg: true, rating: 4.9, prepTime: "5 min", bestseller: true, timeNote: "12:00–04:00 PM" },

  // ── INDIAN BREAD ─────────────────────────────────────────────────────────
  { id: 67, name: "Plain Chapathi (2 pcs) + Curry + Pappu", description: "Soft whole-wheat chapathis served with vegetable curry and dal", price: 59, category: "Indian Bread", imageUrl: null, isSpecial: false, isVeg: true, rating: 4.5, prepTime: "8 min", timeNote: "07:00–11:00 PM" },
];

const CATEGORIES = ["All", "Tiffins", "Snacks", "Beverages", "Milkshakes", "Combos", "Rice Dishes", "Indian Bread"];

// Category color map
const CATEGORY_COLORS: Record<string, string> = {
  Tiffins: "bg-orange-500/20 text-orange-300",
  Snacks: "bg-yellow-500/20 text-yellow-300",
  Beverages: "bg-blue-500/20 text-blue-300",
  Milkshakes: "bg-pink-500/20 text-pink-300",
  Combos: "bg-purple-500/20 text-purple-300",
  "Rice Dishes": "bg-green-500/20 text-green-300",
  "Indian Bread": "bg-amber-500/20 text-amber-300",
};

export default function Menu() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { addItem, items: cartItems, updateQuantity } = useCart();

  const filtered = MENU_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCartQuantity = (id: number) => cartItems.find((i) => i.menuItemId === id)?.quantity ?? 0;

  const categoryGroups = selectedCategory === "All"
    ? CATEGORIES.slice(1).filter(cat => filtered.some(i => i.category === cat))
    : [selectedCategory];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-8 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-amber text-xs tracking-[0.3em] uppercase mb-2">Our Menu</div>
          <h1 className="font-display text-4xl md:text-5xl mb-8">
            Crafted with <em>Tradition</em>
          </h1>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, categories..."
              className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors"
              data-testid="input-search-menu"
            />
          </div>
          <Link href="/order">
            <button className="flex items-center gap-2 bg-amber text-black px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-amber/90 transition-all" data-testid="btn-go-order">
              <ShoppingBag size={16} /> View Order
            </button>
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              data-testid={`btn-category-${cat.toLowerCase()}`}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-amber text-black font-medium"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items — grouped by category when "All" is selected */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">No items found for "{search}"</div>
        ) : (
          <div className="space-y-16">
            {categoryGroups.map((cat) => {
              const catItems = filtered.filter((i) => i.category === cat);
              if (catItems.length === 0) return null;

              // Find time note for this category
              const timeNote = catItems.find(i => i.timeNote)?.timeNote;

              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div>
                      <h2 className="font-display text-2xl md:text-3xl text-foreground">{cat}</h2>
                      {timeNote && (
                        <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1.5">
                          <Clock size={12} /> Available: {timeNote}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 h-px bg-border" />
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[cat] ?? "bg-muted text-muted-foreground"}`}>
                      {catItems.length} items
                    </span>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {catItems.map((item, i) => {
                      const qty = getCartQuantity(item.id);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.04, duration: 0.4 }}
                          className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-amber/50 hover:shadow-lg hover:shadow-amber/5 transition-all duration-300"
                          data-testid={`card-menu-${item.id}`}
                        >
                          {/* Image or placeholder */}
                          <div className="h-44 overflow-hidden bg-muted relative">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-muted">
                                <span className="text-4xl opacity-40">🍽️</span>
                              </div>
                            )}

                            {/* Top-left badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                              {item.bestseller && (
                                <span className="bg-amber text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                                  <Flame size={9} /> Bestseller
                                </span>
                              )}
                              {item.isSpecial && !item.bestseller && (
                                <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                                  ⭐ Special
                                </span>
                              )}
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shadow ${item.isVeg ? "bg-green-600/90 text-white" : "bg-red-600/90 text-white"}`}>
                                {item.isVeg ? <><Leaf size={8} className="inline mr-0.5" />Veg</> : "Non-Veg"}
                              </span>
                              {item.containsMilk && (
                                <span className="bg-blue-500/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow">
                                  🥛 Milk
                                </span>
                              )}
                            </div>

                            {/* Price badge */}
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-amber text-sm font-bold px-3 py-1 rounded-full shadow">
                              ₹{item.price}
                            </div>
                          </div>

                          {/* Card body */}
                          <div className="p-4">
                            <h3 className="font-display text-base text-foreground leading-snug mb-0.5">{item.name}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category] ?? "bg-muted text-muted-foreground"}`}>
                              {item.category}
                            </span>

                            {/* Rating + Prep Time */}
                            <div className="flex items-center gap-3 mt-2 mb-2">
                              <div className="flex items-center gap-1">
                                <Star size={11} className="fill-amber text-amber" />
                                <span className="text-xs text-amber font-semibold">{item.rating}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock size={11} />
                                <span className="text-xs">{item.prepTime}</span>
                              </div>
                              {item.timeNote && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <span className="text-[10px] italic">{item.timeNote}</span>
                                </div>
                              )}
                            </div>

                            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-3">{item.description}</p>

                            {/* Add to cart */}
                            <div className="flex items-center justify-between mt-auto">
                              {qty === 0 ? (
                                <button
                                  onClick={() => addItem({ menuItemId: item.id, name: item.name, price: item.price })}
                                  data-testid={`btn-add-${item.id}`}
                                  className="flex items-center gap-1.5 bg-amber text-black px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-amber/90 transition-all active:scale-95"
                                >
                                  <Plus size={12} /> Add to Order
                                </button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateQuantity(item.id, qty - 1)}
                                    data-testid={`btn-dec-${item.id}`}
                                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-amber hover:text-amber transition-colors"
                                  >
                                    <Minus size={11} />
                                  </button>
                                  <span className="text-foreground font-bold text-sm w-4 text-center" data-testid={`qty-${item.id}`}>{qty}</span>
                                  <button
                                    onClick={() => addItem({ menuItemId: item.id, name: item.name, price: item.price })}
                                    data-testid={`btn-inc-${item.id}`}
                                    className="w-7 h-7 rounded-full bg-amber text-black flex items-center justify-center hover:bg-amber/90 transition-colors"
                                  >
                                    <Plus size={11} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <FloatingButtons />
    </div>
  );
}
