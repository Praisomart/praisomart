import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative bg */}
      <motion.div
        className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold/5"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-3xl font-bold mb-2">Praiso Mart</h3>
            <div className="h-0.5 w-10 bg-gold mb-4 rounded-full" />
            <p className="text-sm text-primary-foreground/60 mb-6 leading-relaxed">
              Where Elegance Meets Tradition. Curating the finest Indian ethnic wear since 2020.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full border border-primary-foreground/15 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-gold-foreground transition-all duration-300"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-display text-lg font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {["Home", "Sarees", "Leggings", "Tops", "New Arrivals"].map((link) => (
                <li key={link}>
                  <Link to="/" className="group flex items-center gap-1 text-sm text-primary-foreground/60 hover:text-gold transition-colors">
                    {link}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Customer Service */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-display text-lg font-semibold mb-5">Customer Service</h4>
            <ul className="space-y-3">
              {[
                { name: "FAQ", href: "/" },
                { name: "Privacy Policy", href: "/" },
                { name: "Return Policy", href: "/return-policy" },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="group flex items-center gap-1 text-sm text-primary-foreground/60 hover:text-gold transition-colors">
                    {link.name}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-display text-lg font-semibold mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/60">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
                Praiso Mart, Tamil Nadu, India
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/60">
                <Phone size={16} className="shrink-0 text-gold" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/60">
                <Mail size={16} className="shrink-0 text-gold" />
                support@praisomart.in
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="border-t border-primary-foreground/10 mt-16 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-primary-foreground/40">
            © 2025 Praiso Mart. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
