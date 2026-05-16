import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/use-products";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import categorySarees from "@/assets/category-sarees.jpg";

const Category = () => {
  const { id } = useParams();
  const { data: apiProducts, isLoading } = useProducts(id);

  const products = apiProducts?.content?.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.discountPrice || p.price * 1.3,
    image: p.mainImage || categorySarees,
    rating: p.rating || 4.5,
    tag: p.tag || (p.id % 2 === 0 ? "New" : "Bestseller"),
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-24 px-4 min-h-[60vh]">
        <h1 className="text-4xl font-display font-bold mb-12">Category Products</h1>
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground">No products found in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <motion.div key={product.id} className="card-product group" whileHover={{ y: -10 }}>
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Link to={`/product/${product.id}`} className="block w-full h-full">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <div className="absolute inset-0 bg-foreground/0 pointer-events-none group-hover:bg-foreground/10 transition-all duration-500" />
                  
                  {/* Quick actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      className="w-9 h-9 rounded-full bg-card/90 flex items-center justify-center shadow-md text-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      style={{ transitionDelay: '0ms' }}
                      onClick={(e) => {
                        e.preventDefault();
                        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
                        if (!wishlist.some((w: any) => w.id === product.id)) {
                          wishlist.push(product);
                          localStorage.setItem("wishlist", JSON.stringify(wishlist));
                          import("sonner").then(m => m.toast.success(`${product.name} added to wishlist!`));
                        } else {
                          import("sonner").then(m => m.toast.info(`${product.name} is already in wishlist.`));
                        }
                      }}
                    >
                      <Heart size={15} />
                    </button>
                    
                    <Link to={`/product/${product.id}`}>
                      <button
                        className="w-9 h-9 rounded-full bg-card/90 flex items-center justify-center shadow-md text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                        style={{ transitionDelay: '60ms' }}
                      >
                        <Eye size={15} />
                      </button>
                    </Link>
                    
                    <button
                      className="w-9 h-9 rounded-full bg-card/90 flex items-center justify-center shadow-md text-foreground hover:text-primary-foreground hover:bg-primary transition-all duration-300 opacity-0 group-hover:opacity-100"
                      style={{ transitionDelay: '120ms' }}
                      onClick={(e) => {
                        e.preventDefault();
                        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                        cart.push({ ...product, quantity: 1 });
                        localStorage.setItem("cart", JSON.stringify(cart));
                        import("sonner").then(m => m.toast.success(`${product.name} added to cart!`));
                      }}
                    >
                      <ShoppingBag size={15} />
                    </button>
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
                    <h3 className="font-display text-base font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Category;
