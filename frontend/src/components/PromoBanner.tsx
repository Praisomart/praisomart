import { motion } from "framer-motion";
import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹1000" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected" },
  { icon: RefreshCw, title: "Easy Returns", desc: "7-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Dedicated help" },
];

const PromoBanner = () => {
  return (
    <section className="py-20 px-4 bg-primary relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold/5"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gold/5"
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 group-hover:bg-gold/20 transition-colors duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <f.icon size={28} className="text-gold" />
              </motion.div>
              <h4 className="font-display text-lg font-semibold text-primary-foreground mb-1">{f.title}</h4>
              <p className="text-sm text-primary-foreground/60">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
