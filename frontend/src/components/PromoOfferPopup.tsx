import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Timer, Tag, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

const PromoOfferPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchActiveOffer = async () => {
      try {
        const offers = await apiFetch("/marketing/offers/active");
        if (offers && offers.length > 0) {
          const offer = offers[0];

          // Build a content fingerprint from every editable field of the offer.
          // Any change to title, description, coupon, image or expiry date will produce
          // a different key — so the popup automatically reappears after each admin edit.
          const contentFingerprint = [
            offer.id,
            offer.title,
            offer.description,
            offer.couponCode ?? "",
            offer.imageUrl ?? "",
            offer.expiryDate ?? "",
          ].join("|");

          // Simple djb2-style hash — keeps the sessionStorage key short & stable
          let hash = 0;
          for (let i = 0; i < contentFingerprint.length; i++) {
            hash = (hash * 31 + contentFingerprint.charCodeAt(i)) >>> 0;
          }
          const seenKey = `hasSeenOffer_v${hash}`;

          if (sessionStorage.getItem(seenKey)) return;

          setActiveOffer(offer);

          if (offer.expiryDate) {
            const exp = new Date(offer.expiryDate).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((exp - now) / 1000);
            if (diff > 0) setTimeLeft(diff);
          }

          // Delay display by 2.5 s for a smooth page-load experience
          const timer = setTimeout(() => {
            setIsOpen(true);
            sessionStorage.setItem(seenKey, "true");
          }, 2500);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        // Silent — don't break the shop page on API errors
      }
    };

    fetchActiveOffer();
  }, []);

  useEffect(() => {
    if (!isOpen || timeLeft === null) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev !== null && prev > 0) {
          return prev - 1;
        }
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timeLeft]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hrs.toString().padStart(2, "0"),
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  const handleCopyCode = () => {
    if (!activeOffer?.couponCode) return;
    navigator.clipboard.writeText(activeOffer.couponCode);
    setCopied(true);
    toast.success(`Coupon code '${activeOffer.couponCode}' copied to clipboard!`);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!activeOffer) return null;

  const time = timeLeft !== null ? formatTime(timeLeft) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-[#0B3D2E] text-white rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/10 -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-500/10 -ml-20 -mb-20 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 flex items-center justify-center transition-all hover:scale-105"
            >
              <X size={18} className="text-white/80" />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center">
              {activeOffer.imageUrl && (
                <div className="w-full h-48 bg-muted relative">
                  <img
                    src={activeOffer.imageUrl}
                    alt={activeOffer.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D2E] to-transparent opacity-80" />
                </div>
              )}

              <div className="p-8 sm:p-10 flex flex-col items-center text-center w-full">
                {/* Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6"
                >
                  <Sparkles size={12} />
                  <span>Exclusive Offer</span>
                </motion.div>

                {/* Title */}
                <h3 className="font-display text-3xl font-bold tracking-tight mb-3">
                  {activeOffer.title}
                </h3>
                <p className="text-sm text-white/70 max-w-sm mb-6">
                  {activeOffer.description}
                </p>

                {/* Dynamic Expiry Countdown Timer */}
                {time && (
                  <div className="flex items-center gap-2 sm:gap-3 mb-6 bg-black/20 px-6 py-3.5 rounded-3xl border border-white/5">
                    <Timer size={16} className="text-amber-400 animate-pulse" />
                    <span className="text-xs uppercase font-semibold text-white/50 tracking-wider mr-2">Ends In</span>
                    
                    <div className="flex gap-1.5 items-center">
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-lg font-bold bg-white/10 px-2.5 py-1 rounded-lg min-w-[34px]">{time.hours}</span>
                        <span className="text-[9px] uppercase tracking-wider text-white/40 mt-1">Hrs</span>
                      </div>
                      <span className="font-bold text-amber-400">:</span>
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-lg font-bold bg-white/10 px-2.5 py-1 rounded-lg min-w-[34px]">{time.minutes}</span>
                        <span className="text-[9px] uppercase tracking-wider text-white/40 mt-1">Min</span>
                      </div>
                      <span className="font-bold text-amber-400">:</span>
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-lg font-bold bg-white/10 px-2.5 py-1 rounded-lg min-w-[34px]">{time.seconds}</span>
                        <span className="text-[9px] uppercase tracking-wider text-white/40 mt-1">Sec</span>
                      </div>
                    </div>
                  </div>
                )}



                {/* Action Buttons */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 rounded-[2rem] bg-white text-[#0B3D2E] font-bold text-base hover:bg-white/95 transition-all shadow-xl hover:-translate-y-0.5 active:scale-98"
                >
                  Shop Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PromoOfferPopup;
