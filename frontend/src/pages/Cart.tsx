import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingBag, Trash2, Plus, Minus, CreditCard, X, MapPin, 
  Phone, Truck, ShieldCheck, Sparkles, Check, Tag
} from "lucide-react";
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
  const { data: cartData, isLoading, updateQuantity, removeFromCart, refetch } = useCart();
  const navigate = useNavigate();

  // Checkout flow states
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"ONLINE" | "COD">("ONLINE");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // Coupon states
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    try {
      const res = await apiFetch(`/orders/validate-coupon?code=${couponInput.trim()}`);
      setAppliedCoupon(res);
      setCouponError("");
      toast.success(res.message || "Coupon applied successfully!");
    } catch (e: any) {
      setCouponError(e.message || "Invalid coupon code");
      setAppliedCoupon(null);
    }
  };
  
  // Address creation form states
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phoneNumber: "",
    pincode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    isDefault: false
  });

  // Load addresses when checkout starts
  useEffect(() => {
    if (showCheckout && cartData?.cartId) {
      fetchAddresses();
    }
  }, [showCheckout, cartData]);

  const fetchAddresses = async () => {
    try {
      const res = await apiFetch("/address");
      setAddresses(res || []);
      if (res && res.length > 0) {
        const defaultAddr = res.find((a: any) => a.isDefault) || res[0];
        setSelectedAddressId(defaultAddr.id);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (e: any) {
      console.error("Failed to load addresses", e);
    }
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!/^[6-9]\d{9}$/.test(newAddress.phoneNumber)) {
      toast.error("Please enter a valid 10-digit Indian phone number starting with 6-9");
      return;
    }
    if (!/^\d{6}$/.test(newAddress.pincode)) {
      toast.error("Please enter a valid 6-digit pin code");
      return;
    }

    try {
      const savedAddress = await apiFetch("/address", {
        method: "POST",
        body: JSON.stringify(newAddress)
      });
      toast.success("Shipping address saved successfully!");
      
      // Reset form and reload addresses
      setShowNewAddressForm(false);
      setNewAddress({
        fullName: "",
        phoneNumber: "",
        pincode: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        isDefault: false
      });
      
      await fetchAddresses();
      setSelectedAddressId(savedAddress.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to add address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!cartData || cartData.items.length === 0) return;
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const subtotal = cartData.totalAmount || 0;
      const discount = appliedCoupon ? (subtotal * appliedCoupon.discountPercentage) / 100 : 0;
      const amountInRupees = subtotal - discount;

      if (paymentMode === "COD") {
        // 🔹 Place COD Order directly
        await apiFetch("/orders/place", {
          method: "POST",
          body: JSON.stringify({
            paymentMode: "COD",
            couponCode: appliedCoupon?.code || undefined
          })
        });

        toast.success("Order Placed Successfully via Cash on Delivery!");
        setShowCheckout(false);
        setAppliedCoupon(null);
        setCouponInput("");
        refetch(); // Reload cart (will be empty)
        navigate("/profile"); // Redirect to profile to see order history
      } else {
        // 🔹 Online Payment via Razorpay
        // 1. Create Razorpay order on backend
        const orderData = await apiFetch("/payment/create-order", {
          method: "POST",
          body: JSON.stringify({
            amount: amountInRupees,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
          })
        });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Live key provided
          amount: Math.round(amountInRupees * 100), // Razorpay expects paise here
          currency: "INR",
          name: "Praisomart",
          description: "Purchase from Praisomart",
          order_id: orderData.id,
          handler: async function (response: any) {
            try {
              // 2. Persist ONLINE order on backend
              await apiFetch("/orders/place", {
                method: "POST",
                body: JSON.stringify({
                  paymentMode: "ONLINE",
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  couponCode: appliedCoupon?.code || undefined
                })
              });

              toast.success("Payment Successful! Order Placed Successfully.");
              setShowCheckout(false);
              setAppliedCoupon(null);
              setCouponInput("");
              refetch(); // Reload cart
              navigate("/profile");
            } catch (err: any) {
              toast.error("Payment succeeded, but failed to record order: " + err.message);
            }
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
      }
    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
    } finally {
      setIsPlacingOrder(false);
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
    <div className="min-h-screen bg-background flex flex-col font-sans">
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
                        <p className="text-sm text-muted-foreground mb-4">
                          Size/Variant: {item.size || item.attribute || 'Standard'}
                        </p>
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
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{(cartData.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald font-semibold">
                      <span className="flex items-center gap-1"><Tag size={12}/> Coupon ({appliedCoupon.code})</span>
                      <span>-₹{((cartData.totalAmount * appliedCoupon.discountPercentage) / 100).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-emerald font-medium">Free</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{(cartData.totalAmount - (appliedCoupon ? (cartData.totalAmount * appliedCoupon.discountPercentage) / 100 : 0)).toLocaleString()}</span>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <div className="border-t pt-6 mt-6 mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Tag size={14} className="text-primary" /> Promo / Coupon Code
                  </h3>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SILK20"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      disabled={!!appliedCoupon}
                      className="flex-1 px-4 py-2.5 rounded-xl border bg-background text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
                    />
                    {appliedCoupon ? (
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponInput("");
                        }}
                        className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-2 rounded-xl text-xs font-bold hover:bg-destructive/20 transition-all"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {couponError && (
                    <p className="text-xs text-destructive mt-1.5 font-medium">{couponError}</p>
                  )}
                  {appliedCoupon && (
                    <p className="text-xs text-emerald mt-1.5 font-semibold flex items-center gap-1">
                      <Check size={12} /> {appliedCoupon.message}
                    </p>
                  )}
                </div>
                
                <button 
                  onClick={() => setShowCheckout(true)}
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

      {/* ─── SLIDING CHECKOUT PANEL ─── */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            {/* Modal Overlay Dismissal */}
            <div className="absolute inset-0" onClick={() => setShowCheckout(false)} />

            {/* Sliding Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="relative w-full max-w-lg bg-card border-l h-full flex flex-col shadow-2xl z-10 overflow-y-auto"
            >
              {/* Checkout Header */}
              <div className="p-6 border-b flex items-center justify-between bg-primary text-primary-foreground">
                <div>
                  <h3 className="font-display text-2xl font-bold">Checkout</h3>
                  <p className="text-xs text-primary-foreground/70">Complete your shipment & payment details</p>
                </div>
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Form Sections */}
              <div className="flex-1 p-6 space-y-8 overflow-y-auto pb-24">
                {/* 1. SHIPPING ADDRESS SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-lg flex items-center gap-2">
                      <MapPin size={18} className="text-primary" /> 1. Shipping Address
                    </h4>
                    {!showNewAddressForm && addresses.length > 0 && (
                      <button 
                        onClick={() => setShowNewAddressForm(true)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        + Add New
                      </button>
                    )}
                  </div>

                  {showNewAddressForm ? (
                    /* Create New Address Form */
                    <form onSubmit={handleAddNewAddress} className="space-y-4 bg-secondary/10 p-5 rounded-3xl border border-border">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Shipping Details</p>
                      
                      <input 
                        required
                        placeholder="Full Name"
                        className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                        value={newAddress.fullName}
                        onChange={e => setNewAddress({...newAddress, fullName: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          required
                          placeholder="Phone Number"
                          className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                          value={newAddress.phoneNumber}
                          onChange={e => setNewAddress({...newAddress, phoneNumber: e.target.value})}
                        />
                        <input 
                          required
                          placeholder="Pincode (6 digits)"
                          className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                          value={newAddress.pincode}
                          onChange={e => setNewAddress({...newAddress, pincode: e.target.value})}
                        />
                      </div>
                      <input 
                        required
                        placeholder="Address Line 1"
                        className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                        value={newAddress.addressLine1}
                        onChange={e => setNewAddress({...newAddress, addressLine1: e.target.value})}
                      />
                      <input 
                        placeholder="Address Line 2 (Optional)"
                        className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                        value={newAddress.addressLine2}
                        onChange={e => setNewAddress({...newAddress, addressLine2: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          required
                          placeholder="City"
                          className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                          value={newAddress.city}
                          onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                        />
                        <input 
                          required
                          placeholder="State"
                          className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                          value={newAddress.state}
                          onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <button 
                          type="submit"
                          className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm"
                        >
                          Save Address
                        </button>
                        {addresses.length > 0 && (
                          <button 
                            type="button"
                            onClick={() => setShowNewAddressForm(false)}
                            className="px-5 border font-semibold py-3 rounded-xl text-sm hover:bg-secondary"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    /* Address List Selection */
                    <div className="space-y-3">
                      {addresses.map((addr: any) => (
                        <label 
                          key={addr.id}
                          className={`flex items-start gap-4 p-4 rounded-3xl border cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-secondary/40'}`}
                          onClick={() => setSelectedAddressId(addr.id)}
                        >
                          <input 
                            type="radio" 
                            name="checkout-address" 
                            className="mt-1 accent-primary" 
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                          />
                          <div className="text-sm">
                            <p className="font-bold flex items-center gap-2">
                              {addr.fullName}
                              {addr.isDefault && <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold">DEFAULT</span>}
                            </p>
                            <p className="text-muted-foreground text-xs mt-1">{addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1.5"><Phone size={12}/> {addr.phoneNumber}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. PAYMENT MODE SECTION */}
                <div className="space-y-4">
                  <h4 className="font-display font-bold text-lg flex items-center gap-2">
                    <CreditCard size={18} className="text-primary" /> 2. Payment Method
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* ONLINE Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMode("ONLINE")}
                      className={`flex flex-col items-center gap-3 p-5 rounded-3xl border text-center transition-all ${paymentMode === "ONLINE" ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-secondary/40'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMode === "ONLINE" ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Online Payment</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">UPI, Cards, NetBanking</p>
                      </div>
                      {paymentMode === "ONLINE" && (
                        <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px]">
                          <Check size={10} />
                        </div>
                      )}
                    </button>

                    {/* COD Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMode("COD")}
                      className={`flex flex-col items-center gap-3 p-5 rounded-3xl border text-center transition-all ${paymentMode === "COD" ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-secondary/40'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMode === "COD" ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                        <Truck size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Cash on Delivery</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Pay upon package arrival</p>
                      </div>
                      {paymentMode === "COD" && (
                        <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px]">
                          <Check size={10} />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. ORDER SUMMARY REVIEW */}
                <div className="bg-secondary/10 p-5 rounded-3xl space-y-3 text-sm">
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground">Order Subtotal:</span>
                    <span>₹{(cartData.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between font-medium text-emerald">
                      <span className="flex items-center gap-1"><Tag size={12}/> Coupon Discount ({appliedCoupon.code}):</span>
                      <span>-₹{((cartData.totalAmount * appliedCoupon.discountPercentage) / 100).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="text-emerald font-semibold">FREE</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base text-primary">
                    <span>Total Amount:</span>
                    <span>₹{(cartData.totalAmount - (appliedCoupon ? (cartData.totalAmount * appliedCoupon.discountPercentage) / 100 : 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-card border-t flex gap-4">
                <button
                  disabled={isPlacingOrder || showNewAddressForm}
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-primary/95 transition-all shadow-xl hover:shadow-primary/10 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isPlacingOrder ? (
                    "Processing Order..."
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      {paymentMode === "COD" ? "Place COD Order" : "Proceed to Pay"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default Cart;
