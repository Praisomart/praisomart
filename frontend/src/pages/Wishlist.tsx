import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { motion, AnimatePresence } from "framer-motion";

const Wishlist = () => {
  const { data: wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center font-display text-xl">Loading your wishlist...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto py-12 px-4">
        <h1 className="text-4xl font-display font-bold mb-10">My Wishlist</h1>
        
        {(!wishlistItems || wishlistItems.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-6">
              <Heart size={40} className="text-accent" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-4">Your Wishlist is Empty</h2>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
              Save your favorite items here to review them later or purchase them when you're ready.
            </p>
            <Link to="/" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence>
              {wishlistItems.map((item: any) => (
                <motion.div 
                  key={item.wishlistId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card-product group relative"
                >
                  <button 
                    onClick={() => removeFromWishlist.mutate(item.productId)}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-destructive hover:bg-destructive hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  <Link to={`/product/${item.productId}`} className="block aspect-[3/4] overflow-hidden">
                    <img 
                      src={item.imageUrl || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80"} 
                      alt={item.productName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold mb-2 truncate">{item.productName}</h3>
                    <p className="text-primary font-bold mb-4">₹{item.price.toLocaleString()}</p>
                    
                    <button 
                      onClick={() => addToCart.mutate({ productVariantId: item.defaultVariantId || item.productId, quantity: 1 })}
                      className="w-full btn-emerald flex items-center justify-center gap-2 text-sm"
                    >
                      <ShoppingBag size={16} /> Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
