import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={ref} className="relative h-[90vh] min-h-[650px] overflow-hidden">
      {/* Parallax background image */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <motion.img
          src={heroBanner}
          alt="Praiso Mart - Elegant Indian Sarees Collection"
          className="w-full h-full object-cover"
          initial={{ scale: 1.2, filter: "blur(8px)" }}
          animate={{ scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 overlay-gradient" />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/30 via-transparent to-foreground/20" />

      {/* Animated particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gold/40"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
        style={{ opacity }}
      >
        {/* Animated badge */}
        <motion.div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/30 backdrop-blur-sm mb-8"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Sparkles size={14} className="text-gold" />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-light">Premium Ethnic Wear</span>
        </motion.div>

        <motion.h1
          className="font-display text-5xl md:text-7xl lg:text-9xl font-bold text-primary-foreground mb-2 tracking-tight"
          initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          PRAISO MART
        </motion.h1>

        {/* Animated gold divider */}
        <motion.div
          className="relative h-px w-40 mx-auto my-6 overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.9 }}
        >
          <div className="absolute inset-0 bg-gold/40" />
          <motion.div
            className="absolute inset-0 h-full w-1/3 bg-gold"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.p
          className="font-display text-xl md:text-3xl italic text-gold-light mb-12 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Where Elegance Meets Tradition
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex gap-4 flex-wrap justify-center"
        >
          <Link to="/category/1">
            <motion.span
              className="btn-gold group inline-flex"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              Shop Collection
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.span>
          </Link>
          <Link to="/category/1">
            <motion.span
              className="inline-flex items-center justify-center rounded-full px-7 py-3 font-medium border-2 border-gold-light/40 text-primary-foreground hover:bg-gold/20 backdrop-blur-sm transition-all duration-300"
              whileHover={{ scale: 1.05, y: -3, borderColor: "hsl(43 60% 75%)" }}
              whileTap={{ scale: 0.97 }}
            >
              New Arrivals
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Decorative corner elements */}
      <motion.div
        className="absolute bottom-10 left-10 w-24 h-24 rounded-full border border-gold/20"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-20 right-16 w-16 h-16 rounded-full border border-gold/15"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-32 right-24 w-8 h-8 rounded-full bg-gold/10"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </section>
  );
};

export default HeroSection;
