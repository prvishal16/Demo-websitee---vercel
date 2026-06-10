import { motion } from "framer-motion";
import { Tag, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import FloatingButtons from "@/components/FloatingButtons";
import { useListOffers } from "@/lib/api-client";

export default function Offers() {
  const { data: offers, isLoading } = useListOffers({ active: true });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-24 max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="text-amber text-xs tracking-[0.3em] uppercase mb-2">Promotions</div>
          <h1 className="font-display text-4xl md:text-5xl">Current <em>Offers</em></h1>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse h-32" />
            ))}
          </div>
        ) : !offers?.length ? (
          <div className="text-center py-24">
            <Tag size={40} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active offers right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {offers.map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-amber/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6 hover:border-amber/50 transition-all"
                data-testid={`card-offer-${offer.id}`}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-amber/10 flex flex-col items-center justify-center text-center">
                  {offer.discountPercent ? (
                    <>
                      <span className="text-amber font-bold text-lg leading-none">{offer.discountPercent}%</span>
                      <span className="text-amber text-xs">OFF</span>
                    </>
                  ) : (
                    <Tag size={24} className="text-amber" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-foreground mb-1">{offer.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{offer.description}</p>
                  {(offer.validFrom || offer.validUntil) && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Clock size={12} />
                      {offer.validFrom && <span>From {offer.validFrom}</span>}
                      {offer.validFrom && offer.validUntil && <span>·</span>}
                      {offer.validUntil && <span>Until {offer.validUntil}</span>}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className="bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full font-medium">Active</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <FloatingButtons />
    </div>
  );
}
