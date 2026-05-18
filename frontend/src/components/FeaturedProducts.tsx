import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import categorySarees from "@/assets/category-sarees.jpg";
import categoryTops from "@/assets/category-tops.jpg";

import { useProducts } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

const mockProducts = [
  { id: 1, name: "Kanchipuram Silk Saree", price: 4999, originalPrice: 6999, image: categorySarees, rating: 4.8, tag: "Bestseller" },
  { id: 2, name: "Banarasi Wedding Saree", price: 7499, originalPrice: 9999, image: categorySarees, rating: 4.9, tag: "New" },
  { id: 3, name: "Designer Ethnic Top", price: 1299, originalPrice: 1999, image: categoryTops, rating: 4.5, tag: "Trending" },
  { id: 4, name: "Mysore Crepe Saree", price: 3499, originalPrice: 4999, image: categorySarees, rating: 4.7, tag: "Sale" },
];

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { data: apiProducts, isLoading } = useProducts();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const products = apiProducts?.content?.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.discountPrice || p.price * 1.3, // Mock original price if not provided
    image: p.image || categorySarees,
    rating: p.rating || 4.5,
    tag: p.tag || (p.id % 2 === 0 ? "New" : "Bestseller"),
    defaultVariantId: p.defaultVariantId, // Set in the DTO
  })) || mockProducts;

  const tagColors: Record<string, string> = {
    Bestseller: "bg-primary text-primary-foreground",
    New: "bg-gold text-gold-foreground",
    Trending: "bg-accent text-accent-foreground",
    Sale: "bg-destructive text-destructive-foreground",
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };
  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-gold mb-3">Handpicked</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground">
            Featured Products
          </h2>
          <motion.div
            className="h-1 w-16 bg-gold mx-auto mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="card-product group"
              variants={cardVariants}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Link to={`/product/${product.id}`} className="block w-full h-full">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6 }}
                  />
                </Link>
                {/* Tag */}
                <motion.span
                  className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full ${tagColors[product.tag] || "bg-primary text-primary-foreground"}`}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  {product.tag}
                </motion.span>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-foreground/0 pointer-events-none group-hover:bg-foreground/10 transition-all duration-500" />

                {/* Quick actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <motion.button
                    className="w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-md text-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    initial={{ x: 20, opacity: 0 }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ transitionDelay: '0ms' }}
                    onClick={(e) => {
                      e.preventDefault();
                      const tok = localStorage.getItem("token");
                      if (!tok) {
                        toast.error("Please sign in to add items to your wishlist");
                        navigate("/signin");
                        return;
                      }
                      addToWishlist.mutate(product.id);
                    }}
                  >
                    <Heart size={15} />
                  </motion.button>
                  
                  <Link to={`/product/${product.id}`}>
                    <motion.button
                      className="w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-md text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      initial={{ x: 20, opacity: 0 }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ transitionDelay: '60ms' }}
                    >
                      <Eye size={15} />
                    </motion.button>
                  </Link>
                  
                  <motion.button
                    className="w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-md text-foreground hover:text-primary-foreground hover:bg-primary transition-all duration-300 opacity-0 group-hover:opacity-100"
                    initial={{ x: 20, opacity: 0 }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ transitionDelay: '120ms' }}
                    onClick={(e) => {
                      e.preventDefault();
                      const tok = localStorage.getItem("token");
                      if (!tok) {
                        toast.error("Please sign in to add items to your cart");
                        navigate("/signin");
                        return;
                      }
                      const variantId = product.defaultVariantId || product.id;
                      addToCart.mutate({ productVariantId: variantId, quantity: 1 });
                    }}
                  >
                    <ShoppingBag size={15} />
                  </motion.button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      size={12}
                      className={j < Math.floor(product.rating) ? "fill-gold text-gold" : "text-muted"}
                    />
                  ))}
                  <span className="text-xs font-medium text-muted-foreground ml-1">{product.rating}</span>
                </div>
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-display text-base font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Explore All Button */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link 
            to="/products"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:shadow-[0_10px_40px_-10px_rgba(11,61,46,0.5)] transition-all group"
          >
            <span>Explore All Products</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-xl"
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
