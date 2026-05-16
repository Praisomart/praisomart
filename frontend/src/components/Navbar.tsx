import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, Sparkles, LogOut } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/contexts/AuthContext";


const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop All", href: "/products" },
  { name: "Categories", href: "#", hasDropdown: true },
  { name: "Contact", href: "/contact" },
  { name: "Wishlist", href: "/wishlist" },
  { name: "Cart", href: "/cart" },
];

const Navbar = () => {
  const { data: dbCategories } = useCategories();
  
  const categories = dbCategories?.map((c: any) => ({
    name: c.name,
    href: `/category/${c.id}`,
    emoji: c.name.toLowerCase().includes("saree") ? "🪷" : c.name.toLowerCase().includes("legging") ? "✨" : "🌸",
  })) || [
    { name: "Sarees", href: "/category/1", emoji: "🪷" },
    { name: "Leggings", href: "/category/2", emoji: "✨" },
    { name: "Tops", href: "/category/3", emoji: "🌸" },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const { user, logout } = useAuth();

  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 100], [0, 1]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      {/* Marquee announcement bar */}
      <motion.div
        className="bg-primary overflow-hidden"
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="animate-marquee whitespace-nowrap py-2 text-sm font-medium text-primary-foreground">
          <span className="mx-8">🎉 Free Delivery above ₹1000</span>
          <span className="mx-8">✨ New Arrivals Every Week</span>
          <span className="mx-8">🎁 Flat ₹100 Off on First Order</span>
          <span className="mx-8">🎉 Free Delivery above ₹1000</span>
          <span className="mx-8">✨ New Arrivals Every Week</span>
          <span className="mx-8">🎁 Flat ₹100 Off on First Order</span>
        </div>
      </motion.div>

      <motion.nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled ? "glass-nav shadow-lg" : "bg-background/95 backdrop-blur-md"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* LEFT — Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <motion.div
              className="relative w-11 h-11 rounded-full border-2 border-gold flex items-center justify-center bg-primary overflow-hidden"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--gradient-gold)" }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.3 }}
              />
              <span className="text-primary-foreground font-display text-base font-bold leading-none z-10">
                PM
              </span>
            </motion.div>
            <div className="flex flex-col">
              <motion.span
                className="font-display text-lg font-bold tracking-wide text-foreground group-hover:text-primary transition-colors leading-tight"
                layoutId="brand-name"
              >
                Praiso Mart
              </motion.span>
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold leading-tight">
                Elegance • Tradition
              </span>
            </div>
          </Link>

          {/* CENTER — Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-secondary/50 rounded-full px-2 py-1.5 border border-border/50">
            {navLinks.map((link) => (
              <div key={link.name} className="relative">
                {link.hasDropdown ? (
                  <div
                    onMouseEnter={() => setCatOpen(true)}
                    onMouseLeave={() => setCatOpen(false)}
                  >
                    <motion.button
                      className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-300 ${
                        catOpen
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:text-primary"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.name}
                      <motion.span
                        animate={{ rotate: catOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={13} />
                      </motion.span>
                    </motion.button>

                    <AnimatePresence>
                      {catOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.95 }}
                          animate={{ opacity: 1, y: 4, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.95 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 rounded-2xl bg-card shadow-xl border border-border overflow-hidden backdrop-blur-xl"
                        >
                          {categories.map((cat, idx) => (
                            <motion.div
                              key={cat.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.06 }}
                            >
                              <Link
                                to={cat.href}
                                className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-foreground hover:bg-secondary hover:text-primary transition-all duration-200 group/cat"
                              >
                                <span className="text-lg group-hover/cat:scale-125 transition-transform">{cat.emoji}</span>
                                <span>{cat.name}</span>
                                <motion.span
                                  className="ml-auto text-muted-foreground opacity-0 group-hover/cat:opacity-100 transition-opacity"
                                  initial={{ x: -5 }}
                                  whileHover={{ x: 0 }}
                                >
                                  →
                                </motion.span>
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : link.name === "Wishlist" ? (
                  <Link to={link.href}>
                    <motion.span
                      className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium tracking-wide rounded-full text-foreground hover:text-accent transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Heart size={14} />
                      {link.name}
                    </motion.span>
                  </Link>
                ) : link.name === "Cart" ? (
                  <Link to={link.href}>
                    <motion.span
                      className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium tracking-wide rounded-full text-foreground hover:text-primary transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ShoppingBag size={14} />
                      {link.name}
                    </motion.span>
                  </Link>
                ) : (
                  <Link to={link.href}>
                    <motion.span
                      className={`relative block px-4 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-300 ${
                        activeLink === link.name
                          ? "text-primary-foreground bg-primary"
                          : "text-foreground hover:text-primary hover:bg-primary/5"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveLink(link.name)}
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT — Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-secondary/60 text-foreground hover:text-primary hover:bg-secondary transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Search size={16} />
            </motion.button>

            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "ADMIN" ? (
                  <Link to="/admin">
                    <motion.div
                      className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Sparkles size={14} className="text-gold" />
                      <span>Admin</span>
                    </motion.div>
                  </Link>
                ) : (
                  <Link to="/profile">
                    <motion.div
                      className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <User size={14} />
                      <span className="max-w-[100px] truncate">{user.name || user.email || "Account"}</span>
                    </motion.div>
                  </Link>
                )}
                <motion.button
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </motion.button>
              </div>
            ) : (
              <Link to="/signin">
                <motion.div
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User size={15} />
                  <span>Sign In</span>
                </motion.div>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <motion.button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full bg-secondary/60 text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X size={18} />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Menu size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="px-4 py-5 space-y-1">
                {navLinks.map((link, i) =>
                  link.hasDropdown ? (
                    <div key={link.name}>
                      <motion.p
                        className="text-xs font-semibold tracking-[0.2em] uppercase text-gold py-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        Categories
                      </motion.p>
                      {categories.map((cat, j) => (
                        <motion.div
                          key={cat.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (i + j) * 0.06 }}
                        >
                          <Link
                            to={cat.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 text-sm font-medium text-muted-foreground py-2.5 pl-4 hover:text-primary transition-colors"
                          >
                            <span>{cat.emoji}</span>
                            {cat.name}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm font-medium text-foreground py-2.5 hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  )
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to="/signin"
                    onClick={() => setMobileOpen(false)}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                  >
                    <User size={15} />
                    Sign In
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
