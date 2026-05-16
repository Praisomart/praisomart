import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/use-products";
import { useProduct } from "@/hooks/use-product";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Heart, ShoppingBag, Star, Truck, ShieldCheck, ArrowLeft, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: productData, isLoading, error } = useProduct(id);
  
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Set initial color when data loads
  useState(() => {
    if (productData && !selectedColor) {
      const initialColor = productData.variants?.find((v: any) => v.stock > 0)?.color || productData.color || productData.variants?.[0]?.color;
      setSelectedColor(initialColor);
    }
  });

  const colorMap: Record<string, string> = {
    "orange": "#FF8C00",
    "maroon": "#800000",
    "green": "#228B22",
    "grey": "#808080",
    "yellow": "#FFD700",
    "brown": "#8B4513",
    "blue": "#0000FF",
    "multi": "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)"
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center font-display text-xl animate-pulse">Loading product details...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-6 p-4 text-center">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-destructive">Connection Error</h1>
            <p className="text-muted-foreground max-w-sm">
              {error instanceof Error ? error.message : "We're having trouble connecting to our servers. Please ensure the backend is running and try again."}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-all"
          >
            Retry Connection
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-6 p-4 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
            <Eye size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold">Product Not Found</h1>
            <p className="text-muted-foreground max-w-sm">We couldn't find the product you're looking for. It might have been removed or the ID is incorrect.</p>
          </div>
          <Link to="/" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-all">Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in to add items to your cart");
      navigate("/signin");
      return;
    }
    const variant = selectedColor 
      ? productData.variants?.find((v: any) => v.color === selectedColor)
      : productData.variants?.[0];

    const variantId = variant?.id;
    if (!variantId) {
      toast.error("This color variant is currently unavailable");
      return;
    }
    addToCart.mutate({ productVariantId: variantId, quantity });
  };

  const currentVariant = selectedColor 
    ? productData.variants?.find((v: any) => v.color === selectedColor)
    : productData.variants?.[0];

  const currentImage = selectedColor
    ? productData.images?.find((img: any) => img.color === selectedColor)?.imageUrl || productData.images?.[0]
    : productData.images?.[0];

  const handleAddToWishlist = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in to add items to your wishlist");
      navigate("/signin");
      return;
    }
    addToWishlist.mutate(productData.id);
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto py-12 px-4">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to shopping
        </Link>
        
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          <div className="rounded-3xl overflow-hidden aspect-[3/4] bg-secondary/20 border group relative">
            <img 
              src={currentImage || productData.image || productData.mainImage || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80"} 
              alt={productData.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80";
              }}
            />
            {productData.images?.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {productData.images.map((_: any, i: number) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="mb-2">
              <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                {productData.categoryName || "Premium Collection"}
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-display font-bold mt-4 mb-2 leading-tight">{productData.name}</h1>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < (productData.rating || 4.5) ? "fill-gold text-gold" : "text-muted"} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({productData.rating || 4.8} Reviews)</span>
            </div>
            
            <div className="flex items-end gap-4 mb-8">
              <span className="text-4xl font-bold text-foreground">₹{productData.price?.toLocaleString()}</span>
              {productData.discountPrice && (
                <span className="text-xl text-muted-foreground line-through mb-1">₹{productData.discountPrice.toLocaleString()}</span>
              )}
            </div>
            
            <div className="prose prose-sm mb-8">
              <p className="text-muted-foreground leading-relaxed text-lg italic">
                {productData.description || "Experience the elegance of this meticulously crafted piece. Designed for comfort without compromising on style, perfect for every special occasion."}
              </p>
            </div>

            {productData.availableColors?.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 
                  Select Color: <span className="text-foreground capitalize">{selectedColor}</span>
                </h4>
                <div className="flex flex-wrap gap-3">
                  {productData.availableColors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center p-0.5 ${selectedColor === color ? 'border-primary scale-110 shadow-lg' : 'border-transparent hover:border-muted hover:scale-105'}`}
                      title={color}
                    >
                      <div 
                        className="w-full h-full rounded-full shadow-inner" 
                        style={{ background: colorMap[color.toLowerCase()] || color }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8 p-4 bg-secondary/10 rounded-2xl border border-dashed">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-muted-foreground font-medium">Selected Variant:</span>
                 <span className="font-bold">{currentVariant?.size || currentVariant?.attribute || "Standard"}</span>
               </div>
               <div className="flex justify-between items-center text-sm mt-1">
                 <span className="text-muted-foreground font-medium">Availability:</span>
                 <span className={currentVariant?.stock > 0 ? "text-green-600 font-bold" : "text-destructive font-bold"}>
                   {currentVariant?.stock > 0 ? `${currentVariant.stock} in stock` : "Out of Stock"}
                 </span>
               </div>
            </div>
            <div className="flex items-center gap-4 mb-8 border-y py-6">
              <div className="flex items-center border rounded-full overflow-hidden">
                <button 
                  className="px-4 py-2 hover:bg-secondary transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >-</button>
                <span className="px-4 font-medium">{quantity}</span>
                <button 
                  className="px-4 py-2 hover:bg-secondary transition-colors"
                  onClick={() => setQuantity(quantity + 1)}
                >+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
              
              <button 
                onClick={handleAddToWishlist}
                className="w-12 h-12 rounded-full border flex items-center justify-center text-foreground hover:bg-accent/10 hover:text-accent hover:border-accent transition-colors shrink-0"
              >
                <Heart size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck size={18} className="text-foreground" />
                <span>Free delivery on orders above ₹1000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck size={18} className="text-foreground" />
                <span>100% Genuine Quality Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
