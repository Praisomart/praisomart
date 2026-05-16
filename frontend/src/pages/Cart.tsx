import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Cart = () => {
  const { data: cartData, isLoading, updateQuantity, removeFromCart } = useCart();

  const handleCheckout = async () => {
    if (!cartData || cartData.items.length === 0) return;

    try {
      // 1. Create order on backend
      const amountInRupees = cartData.totalAmount;
      const orderData = await apiFetch("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({
          amount: amountInRupees,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`
        })
      });

      const options = {
        key: "rzp_live_SkSGovDRFxRBQt", // Live key provided by user
        amount: Math.round(amountInRupees * 100), // Razorpay expects paise here
        currency: "INR",
        name: "Praisomart",
        description: "Purchase from Praisomart",
        order_id: orderData.id,
        handler: function (response: any) {
          toast.success("Payment Successful! Order ID: " + response.razorpay_order_id);
          // Here you would typically call another backend endpoint to verify payment and clear cart
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#0B3D2E"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center font-display text-xl">Loading your cart...</div>
        <Footer />
      </div>
    );
  }

  const items = cartData?.items || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto py-12 px-4">
        <h1 className="text-4xl font-display font-bold mb-10">Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-4">Your Cart is Empty</h2>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
              Looks like you haven't added anything to your cart yet. Discover our latest collections and find something you'll love.
            </p>
            <Link to="/" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {items.map((item: any) => (
                  <motion.div 
                    key={item.cartItemId}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-6 bg-card p-6 rounded-3xl border shadow-sm group"
                  >
                    <div className="w-24 h-32 md:w-32 md:h-40 bg-secondary/20 rounded-2xl overflow-hidden shrink-0 border">
                      <img 
                        src={item.productImage || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80"} 
                        alt={item.productName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Link to={`/product/${item.productId}`} className="hover:text-primary transition-colors">
                            <h3 className="font-display text-xl font-bold">{item.productName}</h3>
                          </Link>
                          <button 
                            onClick={() => removeFromCart.mutate(item.cartItemId)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Color: {item.color || 'N/A'} | Size: {item.size || 'N/A'}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center border rounded-full overflow-hidden bg-background">
                          <button 
                            className="p-2 hover:bg-secondary transition-colors"
                            onClick={() => updateQuantity.mutate({ cartItemId: item.cartItemId, quantity: Math.max(1, item.quantity - 1) })}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 font-medium text-sm">{item.quantity}</span>
                          <button 
                            className="p-2 hover:bg-secondary transition-colors"
                            onClick={() => updateQuantity.mutate({ cartItemId: item.cartItemId, quantity: item.quantity + 1 })}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card p-8 rounded-3xl border shadow-lg sticky top-24">
                <h2 className="font-display text-2xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{cartData.totalAmount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-emerald font-medium">Free</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{cartData.totalAmount?.toLocaleString() || 0}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/20"
                >
                  <CreditCard size={20} />
                  Proceed to Checkout
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-4 opacity-40">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
