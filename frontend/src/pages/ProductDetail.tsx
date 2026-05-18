import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/use-products";
import { useProduct } from "@/hooks/use-product";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Heart, ShoppingBag, Star, Truck, ShieldCheck, ArrowLeft, Eye, Camera, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/hooks/use-reviews";
import { useSuggestions } from "@/hooks/use-suggestions";
import { apiFetch } from "@/lib/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: productData, isLoading, error } = useProduct(id);
  
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { user } = useAuth();
  const { reviews, canReview, addReview } = useReviews(id);
  const { data: suggestions } = useSuggestions(id);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);
  const [replyingToReviewId, setReplyingToReviewId] = useState<number | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminReplySubmit = async (reviewId: number) => {
    if (!adminReplyText.trim()) {
      toast.error("Reply text cannot be empty");
      return;
    }
    try {
      await apiFetch(`/reviews/${reviewId}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply: adminReplyText })
      });
      toast.success("Admin reply posted successfully!");
      setReplyingToReviewId(null);
      setAdminReplyText("");
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || "Failed to post reply");
    }
  };

  // Set initial color when data loads
  useState(() => {
    if (productData && !selectedColor) {
      const initialColor = productData.variants?.find((v: any) => v.stock > 0)?.color || productData.color || productData.variants?.[0]?.color;
      setSelectedColor(initialColor);
    }
  });

  const colorMap: Record<string, string> = {
    "orange": "#D35400", // Burnt Orange
    "maroon": "#7B1113", // Ruby Wine
    "green": "#2D5A27",  // Forest Green
    "grey": "#4A4A4A",   // Charcoal Grey
    "yellow": "#B8860B", // Antique Gold
    "brown": "#5D4037",  // Coffee Brown
    "blue": "#1B2631",   // Midnight Blue
    "multi": "linear-gradient(135deg, #FF6B6B, #4ECDC4, #FFE66D)"
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
    ? productData.variants?.find((v: any) => v.color?.toLowerCase().trim() === selectedColor.toLowerCase().trim())
    : productData.variants?.[0];

  const currentImage = selectedColor
    ? productData.images?.find((img: any) => img.color?.toLowerCase().trim() === selectedColor.toLowerCase().trim())?.imageUrl || productData.images?.[0]?.imageUrl
    : productData.images?.[0]?.imageUrl;

  const handleAddToWishlist = () => {
    if (user?.role === "ADMIN") {
      toast.error("Administrators cannot add items to their wishlist");
      return;
    }
    addToWishlist.mutate(productData.id);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to leave a review");
      navigate("/signin");
      return;
    }
    addReview.mutate({ 
      rating: newRating, 
      comment: newComment, 
      imageUrl: reviewPhoto || undefined 
    });
    setNewComment("");
    setReviewPhoto(null);
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
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                  user?.role === 'ADMIN' 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                  : 'text-foreground hover:bg-accent/10 hover:text-accent hover:border-accent'
                }`}
                title={user?.role === 'ADMIN' ? 'Wishlist restricted for Admins' : 'Add to Wishlist'}
              >
                <Heart size={20} className={user?.role === 'ADMIN' ? 'opacity-50' : ''} />
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

        {/* Reviews Section */}
        <div className="mt-24">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-display font-bold">Customer Reviews</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-1">
              {!user ? (
                <div className="bg-secondary/10 p-8 rounded-3xl border text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                    <Star size={24} className="fill-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Write a Review</h3>
                  <p className="text-xs text-muted-foreground">Please sign in to leave a review. Reviews are exclusive to verified purchasers.</p>
                  <Link to="/signin" className="block w-full bg-primary text-primary-foreground py-2.5 rounded-full font-semibold hover:bg-primary/90 transition-all text-sm">
                    Sign In to Review
                  </Link>
                </div>
              ) : !canReview ? (
                <div className="bg-secondary/5 p-8 rounded-3xl border border-dashed text-center space-y-4">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Verified Purchase Required</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Only customers who have actually purchased **{productData.name}** can leave a review on this product.
                  </p>
                  <p className="text-[10px] bg-secondary px-3 py-1.5 rounded-xl text-muted-foreground max-w-xs mx-auto">
                    If you bought this item, please make sure your order has been placed or is in transit.
                  </p>
                </div>
              ) : (
                <div className="bg-secondary/10 p-8 rounded-3xl border">
                  <h3 className="text-xl font-bold mb-4">Write a Review</h3>
                  <p className="text-sm text-muted-foreground mb-6">Share your experience with this product. Reviews are only allowed for verified purchasers.</p>
                  
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className={`transition-colors ${star <= newRating ? 'text-gold' : 'text-muted'}`}
                          >
                            <Star size={24} className={star <= newRating ? 'fill-gold' : ''} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Comment</label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="What did you think of the quality, fit, and color?"
                        className="w-full h-32 p-4 rounded-2xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Attach Photo or Snap Picture</label>
                      <div className="flex flex-col gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          id="review-photo"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                        {reviewPhoto ? (
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border bg-secondary/10 group">
                            <img
                              src={reviewPhoto}
                              alt="Attachment preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setReviewPhoto(null)}
                              className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground p-1.5 rounded-full hover:bg-destructive shadow-md hover:scale-105 transition-all flex items-center justify-center"
                              title="Remove photo"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="review-photo"
                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl hover:bg-secondary/10 border-muted hover:border-primary cursor-pointer transition-all gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <Camera size={28} className="text-muted-foreground hover:text-primary transition-colors" />
                            <span className="text-xs font-semibold">Click to upload photo or take a picture</span>
                          </label>
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={addReview.isPending}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {addReview.isPending ? "Posting..." : "Submit Review"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              {reviews.length > 0 ? (
                <div className="space-y-8">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-8 last:border-0">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">{review.userName}</h4>
                          <div className="flex text-gold mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? "fill-gold text-gold" : "text-muted"} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground italic">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>

                      {/* Display attached photo */}
                      {review.imageUrl && (
                        <div className="mt-4 max-w-sm rounded-2xl overflow-hidden border bg-secondary/10 shadow-sm cursor-pointer hover:opacity-95 transition-opacity group">
                          <img
                            src={review.imageUrl}
                            alt="Attached review media"
                            className="w-full max-h-60 object-cover"
                            onClick={() => window.open(review.imageUrl, '_blank')}
                          />
                        </div>
                      )}

                      {/* Display admin reply */}
                      {review.adminReply && (
                        <div className="mt-4 ml-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 relative">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold px-2.5 py-0.5 bg-primary text-primary-foreground rounded-full">
                              Admin Reply
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 font-medium italic">
                            "{review.adminReply}"
                          </p>
                        </div>
                      )}

                      {/* Admin reply button/form */}
                      {user?.role === 'ADMIN' && (
                        <div className="mt-4">
                          {replyingToReviewId === review.id ? (
                            <div className="space-y-2 max-w-lg mt-2">
                              <textarea
                                value={adminReplyText}
                                onChange={(e) => setAdminReplyText(e.target.value)}
                                placeholder="Type your administrator reply..."
                                className="w-full p-3 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-20"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAdminReplySubmit(review.id)}
                                  className="bg-primary text-primary-foreground text-xs px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-all"
                                >
                                  Post Reply
                                </button>
                                <button
                                  onClick={() => { setReplyingToReviewId(null); setAdminReplyText(""); }}
                                  className="border text-xs px-4 py-2 rounded-lg font-semibold hover:bg-secondary transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setReplyingToReviewId(review.id); setAdminReplyText(review.adminReply || ""); }}
                              className="text-xs font-bold text-primary hover:underline mt-2 flex items-center gap-1"
                            >
                              {review.adminReply ? "Edit Reply" : "Reply to Review"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-secondary/5 rounded-3xl border border-dashed text-muted-foreground">
                  <Star size={40} className="mb-4 opacity-20" />
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggested Products Section */}
        {suggestions?.content?.length > 0 && (
          <div className="mt-32">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-display font-bold">Suggested for You</h2>
              <Link to="/products" className="text-primary font-medium hover:underline">View All</Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {suggestions.content.map((suggested: any) => (
                <Link 
                  key={suggested.id} 
                  to={`/product/${suggested.id}`}
                  className="group block"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border bg-secondary/10 mb-4">
                    <img 
                      src={suggested.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80"} 
                      alt={suggested.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h4 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{suggested.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary">₹{suggested.price?.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">in {suggested.categoryName}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
