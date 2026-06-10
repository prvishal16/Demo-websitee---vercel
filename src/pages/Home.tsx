import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, MapPin, Clock, Phone, Mail, Star, ChevronRight, SkipForward } from "lucide-react";
import { useListOffers, useListFeedback } from "@/lib/api-client";
import FloatingButtons from "@/components/FloatingButtons";
import Navbar from "@/components/Navbar";

const heroImages = [
  "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1920&q=90",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=90",
  "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=1920&q=90",
];

const heroLabels = ["Masala Dosa", "Filter Coffee", "Idly Sambar"];

// Static menu data from the physical menu
const STATIC_SPECIALS = [
  {
    id: 101,
    name: "Ghee Masala Dosa",
    description: "Crispy dosa with spiced potato filling, served with sambar & chutneys",
    price: 79,
    category: "Tiffins",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    isSpecial: true,
    isVeg: true,
    rating: 4.9,
    prepTime: "8 min",
    bestseller: true,
  },
  {
    id: 102,
    name: "Pongal",
    description: "Soft, peppery rice and lentil dish cooked with ghee and cumin",
    price: 79,
    category: "Tiffins",
    imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=80",
    isSpecial: true,
    isVeg: true,
    rating: 4.8,
    prepTime: "5 min",
    bestseller: true,
  },
  {
    id: 103,
    name: "Ghee Karam Uthappam",
    description: "Thick rice pancake with spicy ghee karam topping, perfectly golden",
    price: 89,
    category: "Tiffins",
    imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80",
    isSpecial: true,
    isVeg: true,
    rating: 4.8,
    prepTime: "10 min",
    bestseller: false,
  },
  {
    id: 104,
    name: "South Indian Meals",
    description: "Complete meals: sambaar rice, curd rice, flavoured rice with papad & pickle",
    price: 149,
    category: "Rice Dishes",
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
    isSpecial: true,
    isVeg: true,
    rating: 4.9,
    prepTime: "5 min",
    bestseller: true,
  },
  {
    id: 105,
    name: "Strawberry Milkshake",
    description: "Thick, creamy milkshake made with fresh strawberries",
    price: 79,
    category: "Milkshakes",
    imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&q=80",
    isSpecial: true,
    isVeg: true,
    rating: 4.7,
    prepTime: "3 min",
    bestseller: false,
    containsMilk: true,
  },
  {
    id: 106,
    name: "Breakfast Combo",
    description: "Idly (1pc) + Vada (1pc) + Bonda (1pc) + Set Dosa (1pc) + Upma + Tea",
    price: 99,
    category: "Combos",
    imageUrl: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&q=80",
    isSpecial: true,
    isVeg: true,
    rating: 4.8,
    prepTime: "10 min",
    bestseller: true,
  },
];

const STATIC_REVIEWS = [
  {
    id: 1,
    customerName: "Priya Sharma",
    rating: 5,
    comment: "Absolutely love Bhoomi! The Ghee Masala Dosa is the best I've had outside my grandmother's kitchen. The filter coffee is divine — frothy, strong and perfectly balanced. Will be back every weekend!",
    status: "approved",
    featured: true,
  },
  {
    id: 2,
    customerName: "Rajesh Kumar",
    rating: 5,
    comment: "Pre-ordered for my office team's breakfast meeting. 15 people, everything was ready on time, piping hot and absolutely delicious. The mini idlies were a huge hit. Bhoomi is now our go-to for team breakfast!",
    status: "approved",
    featured: true,
  },
  {
    id: 3,
    customerName: "Ananya Krishnamurthy",
    rating: 4,
    comment: "The Pongal here is exactly how my paati used to make it — soft, peppery and fragrant with ghee. The sambar has that perfect tangy-spicy balance. Portion sizes are generous too.",
    status: "approved",
    featured: true,
  },
];

function HeroIntro({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  const skip = useCallback(() => {
    onDone();
  }, [onDone]);

  useEffect(() => {
    if (step < heroImages.length) {
      const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 400 : 1500);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <AnimatePresence mode="wait">
        {step < heroImages.length && (
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={heroImages[step]}
              alt={heroLabels[step]}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center"
            >
              <div className="text-amber font-display text-3xl italic">{heroLabels[step]}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        onClick={skip}
        className="absolute bottom-8 right-8 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white/80 hover:text-white text-sm px-4 py-2 rounded-full transition-all"
      >
        Skip <SkipForward size={14} />
      </motion.button>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {heroImages.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-500 ${
              i < step ? "bg-amber w-6 h-1.5" : i === step ? "bg-amber/60 w-4 h-1.5" : "bg-white/30 w-1.5 h-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);
  const [currentHero, setCurrentHero] = useState(0);
  const [hoursOpen, setHoursOpen] = useState(false);

  const { data: offers } = useListOffers({ active: true });
  const { data: apiReviews } = useListFeedback({});

  useEffect(() => {
    if (!introComplete) return;
    const t = setInterval(() => setCurrentHero((s) => (s + 1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, [introComplete]);

  const approvedApiReviews = apiReviews?.filter((r) => r.featured || r.status === "approved").slice(0, 3) ?? [];
  const reviewsToShow = approvedApiReviews.length > 0 ? approvedApiReviews : STATIC_REVIEWS;

  return (
    <>
      <AnimatePresence>{!introComplete && <HeroIntro onDone={() => setIntroComplete(true)} />}</AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen"
      >
        <Navbar />

        {/* Hero */}
        <section className="relative h-screen overflow-hidden" data-testid="section-hero">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentHero}
              src={heroImages[currentHero]}
              alt="hero"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 40 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="text-amber text-sm tracking-[0.3em] uppercase mb-4">Authentic South Indian</div>
              <h1 className="font-display text-6xl md:text-8xl font-semibold text-white leading-none mb-6">
                Bhoomi<br />
                <span className="italic text-amber">Tiffins</span>
              </h1>
              <p className="text-foreground/70 text-lg max-w-md mb-10 leading-relaxed">
                Where every bite tells the story of South India. Fresh, authentic, and made with love — served daily from 7 AM.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/menu">
                  <button data-testid="btn-view-menu" className="bg-amber text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wider hover:bg-amber/90 transition-all hover:scale-105 active:scale-95">
                    Explore Menu
                  </button>
                </Link>
                <Link href="/order">
                  <button data-testid="btn-preorder" className="border border-white/30 text-white px-8 py-3.5 rounded-full font-medium text-sm tracking-wider hover:bg-white/10 transition-all">
                    Pre-Order Now
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentHero(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentHero ? "bg-amber w-6" : "bg-white/30"}`}
              />
            ))}
          </div>
        </section>

        {/* Offers Strip */}
        {offers && offers.length > 0 && (
          <section className="bg-amber/10 border-y border-amber/20 py-4 overflow-hidden" data-testid="section-offers-strip">
            <div className="flex gap-12 animate-[marquee_30s_linear_infinite]" style={{ width: "max-content" }}>
              {[...offers, ...offers].map((offer, i) => (
                <div key={i} className="flex items-center gap-3 whitespace-nowrap">
                  <span className="text-amber text-xs">★</span>
                  <span className="text-sm font-medium text-foreground">{offer.title}</span>
                  {offer.discountPercent && (
                    <span className="text-amber text-sm font-semibold">{offer.discountPercent}% OFF</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Today's Specials */}
        <section className="py-24 max-w-7xl mx-auto px-6" data-testid="section-specials">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="text-amber text-xs tracking-[0.3em] uppercase mb-3">House Favourites</div>
            <h2 className="font-display text-4xl md:text-5xl text-foreground">Today's <em>Specials</em></h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STATIC_SPECIALS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-amber/50 transition-all"
                data-testid={`card-special-${item.id}`}
              >
                <div className="h-52 overflow-hidden bg-muted relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {item.bestseller && (
                      <span className="bg-amber text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        🔥 Bestseller
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.isVeg ? "bg-green-600/90 text-white" : "bg-red-600/90 text-white"}`}>
                      {item.isVeg ? "🌱 Veg" : "🍖 Non-Veg"}
                    </span>
                    {item.containsMilk && (
                      <span className="bg-blue-500/80 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        🥛 Contains Milk
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-amber text-sm font-semibold px-3 py-1 rounded-full">
                    ₹{item.price}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-display text-lg text-foreground">{item.name}</h3>
                  </div>
                  <div className="text-amber/70 text-xs tracking-wider mb-2">{item.category}</div>
                  {/* Rating & Prep Time */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-amber text-amber" />
                      <span className="text-xs text-amber font-medium">{item.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={12} />
                      <span className="text-xs">{item.prepTime}</span>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{item.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/menu">
              <button className="inline-flex items-center gap-2 text-amber hover:gap-3 transition-all text-sm tracking-wider" data-testid="btn-full-menu">
                View Full Menu <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </section>

        {/* Gallery / Brand Statement */}
        <section className="py-24 bg-card" data-testid="section-brand">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="text-amber text-xs tracking-[0.3em] uppercase mb-4">Our Story</div>
                <h2 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
                  Crafted with<br /><em className="text-amber">Grandmother's</em> recipes
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Every dish at Bhoomi is a tribute to the rich culinary heritage of South India. Our recipes have been passed down through generations, each carrying the warmth of family kitchens and the authenticity of traditional cooking.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  We use only the freshest ingredients, ground fresh each morning, cooked in pure oils, and served with our signature sambar and chutneys.
                </p>
                <Link href="/catering">
                  <button className="inline-flex items-center gap-2 border border-amber/50 text-amber px-6 py-3 rounded-full text-sm hover:bg-amber hover:text-black transition-all">
                    Catering Services <ChevronRight size={16} />
                  </button>
                </Link>
              </motion.div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
                  "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
                  "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=600&q=80",
                  "https://images.unsplash.com/photo-1590577976322-3d2d6e2130d5?w=600&q=80",
                ].map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className={`rounded-2xl overflow-hidden ${i === 1 ? "mt-6" : i === 3 ? "mt-6" : ""}`}
                  >
                    <img src={src} alt="food" className="w-full h-40 object-cover hover:scale-105 transition-transform duration-700" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Reviews — always shown (static fallback) */}
        <section className="py-24 max-w-7xl mx-auto px-6" data-testid="section-reviews">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="text-amber text-xs tracking-[0.3em] uppercase mb-3">Guest Reviews</div>
            <h2 className="font-display text-4xl md:text-5xl">What people <em>say</em></h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviewsToShow.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
                data-testid={`card-review-${r.id}`}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className={j < r.rating ? "fill-amber text-amber" : "text-border"} />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 italic">"{r.comment}"</p>
                <div className="text-sm font-medium text-foreground">— {r.customerName}</div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/feedback">
              <button className="text-amber text-sm hover:gap-3 gap-2 inline-flex items-center transition-all tracking-wider">
                Leave a Review <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </section>

        {/* Location */}
        <section className="py-24 bg-card" data-testid="section-location">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-amber text-xs tracking-[0.3em] uppercase mb-3">Find Us</div>
                <h2 className="font-display text-4xl mb-8">Visit <em>Bhoomi</em></h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin size={18} className="text-amber" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground mb-1">Address</div>
                      <div className="text-muted-foreground text-sm">S.yn.87, Doolapally Rd, near St. Martin's Engineering College, Kompally, Hyderabad, Telangana 500100</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock size={18} className="text-amber" />
                    </div>
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => setHoursOpen((v) => !v)}
                        className="flex items-center gap-2 font-medium text-foreground hover:text-amber transition-colors group"
                        aria-expanded={hoursOpen}
                      >
                        Hours
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`transition-transform duration-300 text-amber ${hoursOpen ? "rotate-180" : ""}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      <div className="text-muted-foreground text-sm mt-0.5">Open Daily · 7:00 AM – 10:00 PM</div>
                      {hoursOpen && (
                        <div className="mt-3 bg-muted/40 border border-border rounded-xl overflow-hidden text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="px-3 py-1.5 bg-amber/10 border-b border-border">
                            <span className="text-amber text-xs font-semibold tracking-wider uppercase">Bhoomi Kitchens</span>
                          </div>
                          {[
                            { day: "Monday", time: "7 am – 10 pm", today: new Date().getDay() === 1 },
                            { day: "Tuesday", time: "7 am – 10 pm", today: new Date().getDay() === 2 },
                            { day: "Wednesday", time: "7 am – 10 pm", today: new Date().getDay() === 3 },
                            { day: "Thursday", time: "7 am – 10 pm", today: new Date().getDay() === 4 },
                            { day: "Friday", time: "7 am – 10 pm", today: new Date().getDay() === 5 },
                            { day: "Saturday", time: "7 am – 10 pm", today: new Date().getDay() === 6 },
                            { day: "Sunday", time: "7 am – 10 pm", today: new Date().getDay() === 0 },
                          ].map(({ day, time, today }) => (
                            <div
                              key={day}
                              className={`flex justify-between px-3 py-2 ${today ? "bg-amber/5" : ""} border-b border-border/50 last:border-0`}
                            >
                              <span className={today ? "text-amber font-semibold" : "text-muted-foreground"}>{day}</span>
                              <span className={today ? "text-amber font-semibold" : "text-foreground"}>{time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Phone size={18} className="text-amber" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground mb-1">Contact</div>
                      <div className="text-muted-foreground text-sm">+91 98765 43210</div>
                    </div>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/?q=S.yn.87+Doolapally+Rd+near+St+Martins+Engineering+College+Kompally+Hyderabad+Telangana+500100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 bg-amber text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-amber/90 transition-all hover:scale-105"
                  data-testid="btn-open-maps"
                >
                  Open in Maps <ArrowRight size={16} />
                </a>
              </div>
              <div className="rounded-2xl overflow-hidden h-80 border border-border">
                <iframe
                  src="https://maps.google.com/maps?q=S.yn.87+Doolapally+Rd+near+St+Martins+Engineering+College+Kompally+Hyderabad+Telangana+500100&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Bhoomi Location"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0d0d0d] border-t border-white/5 pt-16 pb-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              <div>
                <h3 className="font-display text-lg text-white mb-5">Quick Links</h3>
                <ul className="space-y-3">
                  {[
                    { href: "/menu", label: "Menu" },
                    { href: "/order", label: "Pre-Order" },
                    { href: "/offers", label: "Offers" },
                    { href: "/catering", label: "Catering" },
                    { href: "/feedback", label: "Reviews" },
                    { href: "/", label: "About Us" },
                  ].map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href}>
                        <span className="text-white/50 hover:text-amber text-sm cursor-pointer transition-colors">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display text-lg text-white mb-5">Contact Us</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <MapPin size={16} className="text-amber mt-0.5 flex-shrink-0" />
                    <span className="text-white/50 text-sm leading-relaxed">123, Main Road, Hyderabad, Telangana 500001</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={16} className="text-amber flex-shrink-0" />
                    <span className="text-white/50 text-sm">+91 98765 43210</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail size={16} className="text-amber flex-shrink-0" />
                    <span className="text-white/50 text-sm">info@bhoomitiffins.com</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock size={16} className="text-amber mt-0.5 flex-shrink-0" />
                    <div className="text-white/50 text-sm">
                      <div>Mon - Sun, 7:00 AM - 10:00 PM</div>
                      <div className="mt-1.5 space-y-0.5 text-white/30 text-xs">
                        <div>Breakfast: 7 AM - 12 PM</div>
                        <div>Lunch: 12 PM - 4 PM</div>
                        <div>Snacks: 4 PM - 7 PM</div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-display text-lg text-white mb-5">Stay Updated</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-5">
                  Get exclusive offers and updates delivered to your inbox.
                </p>
                <div className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber/50 transition-colors"
                  />
                  <button className="w-full bg-amber/90 hover:bg-amber text-black font-medium text-sm py-3 rounded-lg transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white/30 text-xs">© 2024 Bhoomi Tiffins & Snacks. All rights reserved.</div>
              <div className="text-white/30 text-xs flex items-center gap-1">Made with <span className="text-red-500">❤</span> in Hyderabad</div>
            </div>
          </div>
        </footer>

        <FloatingButtons />
      </motion.div>
    </>
  );
}
