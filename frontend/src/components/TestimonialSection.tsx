import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Priya S.", text: "The Kanchipuram saree I ordered was absolutely stunning. The quality exceeded my expectations!", rating: 5, location: "Chennai" },
  { name: "Meena R.", text: "Amazing collection and super fast delivery. Praiso Mart is now my go-to for ethnic wear.", rating: 5, location: "Bangalore" },
  { name: "Lakshmi D.", text: "Beautiful designs at great prices. The customer service is very helpful and responsive.", rating: 4, location: "Mumbai" },
];

const TestimonialSection = () => {
  return (
    <section className="py-24 px-4 bg-warm-bg overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-gold mb-3">Testimonials</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground">
            What Our Customers Say
          </h2>
          <motion.div
            className="h-1 w-16 bg-gold mx-auto mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-card rounded-3xl p-8 relative border border-border/50 group hover:border-gold/30 transition-colors duration-500"
              style={{ boxShadow: "var(--shadow-card)" }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -8, boxShadow: "var(--shadow-hover)" }}
            >
              {/* Quote icon with glow */}
              <motion.div
                className="absolute top-6 right-6"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
              >
                <Quote size={32} className="text-gold/15 group-hover:text-gold/30 transition-colors duration-500" />
              </motion.div>

              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + j * 0.05 }}
                  >
                    <Star size={14} className={j < t.rating ? "fill-gold text-gold" : "text-muted"} />
                  </motion.div>
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-display font-bold text-primary text-sm">{t.name[0]}</span>
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
