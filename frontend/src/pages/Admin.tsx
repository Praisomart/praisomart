import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, PackagePlus, List, LogOut, ChevronRight, Sparkles, 
  Upload, LayoutGrid, BarChart3, Tag, ArrowLeft, Users, ShoppingCart, 
  Search, X, Plus, Image as ImageIcon, CreditCard, Clock, CheckCircle2,
  ChevronLeft, Images 
} from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Trash2, Edit, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const ImageInputSelector = ({
  value,
  onChange,
  label,
  placeholder = "https://images.unsplash.com/... or /images/..."
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  placeholder?: string;
}) => {
  const [mode, setMode] = useState<"url" | "upload">(value.startsWith("/uploads/") ? "upload" : "url");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers,
        body: formData
      });

      if (!res.ok) {
        let msg = "Failed to upload image";
        try {
          const err = await res.json();
          msg = err.message || msg;
        } catch (_) {}
        throw new Error(msg);
      }

      const data = await res.json();
      onChange(data.url);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <div className="flex bg-secondary/50 p-0.5 rounded-lg border text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-1 rounded-md transition-all ${mode === "url" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
          >
            Manual URL
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-2 py-1 rounded-md transition-all ${mode === "upload" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
          >
            Upload from PC
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <div className="space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-sm font-sans"
          />
          {value && (
            <div className="mt-2 relative h-20 w-36 rounded-xl overflow-hidden border bg-secondary/20 shadow-inner group">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-secondary/10 hover:border-primary/50 relative overflow-hidden bg-background ${isUploading ? "pointer-events-none opacity-80" : ""}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground font-semibold animate-pulse">Uploading image...</span>
              </div>
            ) : value ? (
              <div className="flex items-center gap-4 px-4 w-full justify-center">
                <div className="h-12 w-20 rounded-lg overflow-hidden border bg-secondary/10 shrink-0 shadow-sm">
                  <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-emerald-600">Successfully Uploaded!</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 truncate max-w-[200px] font-mono">{value.split("/").pop()}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(""); }}
                  className="p-1 rounded-full hover:bg-secondary text-destructive transition-colors ml-auto"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-1.5 p-3">
                <Upload className="text-muted-foreground" size={24} />
                <span className="text-xs font-semibold text-primary">Click to select image file from PC</span>
                <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP, GIF up to 5MB</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Admin = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: productsData, refetch: refetchProducts } = useProducts();
  const { data: categoriesData, refetch: refetchCategories } = useCategories();
  
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    color: "",
    categoryId: 1,
    variants: [{ attribute: "Standard", price: 0, stock: 10, color: "" }],
    coverImage: "",
    galleryImages: [] as { url: string, color: string }[]
  });
  const galleryScrollRef = useRef<HTMLDivElement>(null);

  const [categoryData, setCategoryData] = useState({
    name: "",
    description: "",
    imageUrl: ""
  });

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    activeOrders: 0,
    totalCustomers: 0
  });
  const [realOrders, setRealOrders] = useState<any[]>([]);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [trackingForm, setTrackingForm] = useState({
    trackingNumber: "",
    courierService: "",
    status: ""
  });

  // Customer Management States
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Marketing Campaign States
  const [coupons, setCoupons] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  
  // Coupon Form Modal States
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [couponForm, setCouponForm] = useState({
    id: undefined as number | undefined,
    code: "",
    discountPercentage: 20,
    expiryDate: "",
    active: true
  });

  // Pop Offer Form Modal States
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [offerForm, setOfferForm] = useState({
    id: undefined as number | undefined,
    title: "",
    description: "",
    imageUrl: "",
    couponCode: "",
    expiryDate: "",
    active: true
  });

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchStats();
      fetchRecentOrders();
    } else if (activeTab === "orders") {
      fetchRecentOrders();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "marketing") {
      fetchCoupons();
      fetchOffers();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const data = await apiFetch("/admin/dashboard/stats");
      setStats(data);
    } catch (e) {}
  };

  const fetchRecentOrders = async () => {
    try {
      const data = await apiFetch("/admin/dashboard/recent-orders");
      setRealOrders(data);
    } catch (e) {}
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await apiFetch("/admin/dashboard/users");
      setUsers(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load users list");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleToggleUserVerify = async (userId: number) => {
    try {
      await apiFetch(`/admin/dashboard/users/${userId}/toggle-verify`, {
        method: "PUT"
      });
      toast.success("User verification status updated!");
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to update user verification");
    }
  };

  const handleChangeUserRole = async (userId: number, newRole: string) => {
    try {
      await apiFetch(`/admin/dashboard/users/${userId}/change-role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole })
      });
      toast.success(`User role successfully changed to ${newRole}!`);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to update user role");
    }
  };

  const fetchCoupons = async () => {
    try {
      const data = await apiFetch("/admin/marketing/coupons");
      setCoupons(data);
    } catch (e) {}
  };

  const fetchOffers = async () => {
    try {
      const data = await apiFetch("/admin/marketing/offers");
      setOffers(data);
    } catch (e) {}
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let formattedExpiry = couponForm.expiryDate;
      if (formattedExpiry && !formattedExpiry.includes("T")) {
        formattedExpiry = `${formattedExpiry}T23:59:59`;
      }
      
      await apiFetch("/admin/marketing/coupons", {
        method: "POST",
        body: JSON.stringify({
          id: couponForm.id,
          code: couponForm.code,
          discountPercentage: Number(couponForm.discountPercentage),
          expiryDate: formattedExpiry ? formattedExpiry : null,
          active: couponForm.active
        })
      });
      toast.success(couponForm.id ? "Coupon updated successfully!" : "Coupon created successfully!");
      setShowCouponModal(false);
      fetchCoupons();
    } catch (e: any) {
      toast.error(e.message || "Failed to save coupon");
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await apiFetch(`/admin/marketing/coupons/${id}`, {
        method: "DELETE"
      });
      toast.success("Coupon deleted successfully!");
      fetchCoupons();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete coupon");
    }
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let formattedExpiry = offerForm.expiryDate;
      if (formattedExpiry && !formattedExpiry.includes("T")) {
        formattedExpiry = `${formattedExpiry}T23:59:59`;
      }

      await apiFetch("/admin/marketing/offers", {
        method: "POST",
        body: JSON.stringify({
          id: offerForm.id,
          title: offerForm.title,
          description: offerForm.description,
          imageUrl: offerForm.imageUrl,
          couponCode: offerForm.couponCode,
          expiryDate: formattedExpiry ? formattedExpiry : null,
          active: offerForm.active
        })
      });
      toast.success(offerForm.id ? "Pop Offer updated successfully!" : "Pop Offer created successfully!");
      // Clear the popup session cache so it shows fresh on the homepage after any edit
      sessionStorage.removeItem("hasSeenOffer");
      setShowOfferModal(false);
      fetchOffers();
    } catch (e: any) {
      toast.error(e.message || "Failed to save offer");
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      await apiFetch(`/admin/marketing/offers/${id}`, {
        method: "DELETE"
      });
      toast.success("Pop Offer deleted successfully!");
      fetchOffers();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete offer");
    }
  };

  const handleSaveTracking = async (orderId: number) => {
    try {
      await apiFetch(`/admin/dashboard/orders/${orderId}/tracking`, {
        method: "PUT",
        body: JSON.stringify(trackingForm)
      });
      toast.success("Order tracking details updated!");
      setEditingOrder(null);
      fetchRecentOrders();
    } catch (e: any) {
      toast.error(e.message || "Failed to update tracking");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingProduct) {
        await apiFetch(`/admin/products/${editingProduct.id}`, {
          method: "PUT",
          body: JSON.stringify({
          ...productData,
          images: [
            { imageUrl: productData.coverImage, isPrimary: true, color: productData.variants[0]?.color },
            ...productData.galleryImages.map(img => ({ imageUrl: img.url, isPrimary: false, color: img.color }))
          ]
        }),
        });
        toast.success("Product updated successfully!");
        setEditingProduct(null);
        setActiveTab("manage-products");
      } else {
        await apiFetch("/admin/products", {
          method: "POST",
          body: JSON.stringify({
            ...productData,
            images: [
              { imageUrl: productData.coverImage, isPrimary: true, color: productData.variants[0]?.color },
              ...productData.galleryImages.map(img => ({ imageUrl: img.url, isPrimary: false, color: img.color }))
            ]
          }),
        });
        toast.success("Product created successfully!");
      }
      
      setProductData({
        name: "",
        description: "",
        color: "",
        categoryId: 1,
        variants: [{ attribute: "Standard", price: 0, stock: 10, color: "" }],
        coverImage: "",
        galleryImages: []
      });
      refetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (product: any) => {
    const fullProduct = async () => {
      try {
        const data = await apiFetch(`/admin/products/${product.id}`);
        setEditingProduct(data);
        const primary = data.images?.find((i: any) => i.isPrimary);
        const gallery = data.images?.filter((i: any) => !i.isPrimary) || [];
        setProductData({
          name: data.name,
          description: data.description || "",
          color: data.color || "",
          categoryId: data.categoryId || 1,
          variants: data.variants.map((v: any) => ({ attribute: v.attribute, price: v.price, stock: v.stock, color: v.color || "" })),
          coverImage: primary?.imageUrl || data.images?.[0]?.imageUrl || "",
          galleryImages: gallery.map((i: any) => ({ url: i.imageUrl, color: i.color || "" }))
        });
        setActiveTab("add-product");
      } catch (e: any) {
        toast.error("Failed to load product details");
      }
    };
    fullProduct();
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...productData.variants];
    (newVariants[index] as any)[field] = value;
    setProductData({ ...productData, variants: newVariants });
  };

  const handleCoverImageDrop = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setProductData(prev => ({ ...prev, coverImage: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleBulkGalleryUpload = (files: FileList) => {
    const promises = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(promises).then(urls => {
      setProductData(prev => ({ 
        ...prev, 
        galleryImages: [...prev.galleryImages, ...urls.map(url => ({ url, color: "" }))] 
      }));
    });
  };

  const removeGalleryImage = (index: number) => {
    setProductData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryScrollRef.current) {
      const amount = 220;
      galleryScrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  const colorMap: Record<string, string> = {
    "orange": "#D35400",
    "maroon": "#7B1113",
    "green": "#2D5A27",
    "grey": "#4A4A4A",
    "yellow": "#B8860B",
    "brown": "#5D4037",
    "blue": "#1B2631",
  };

  const ColorPicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
    <div className="flex flex-wrap gap-2 items-center">
      {Object.keys(colorMap).map(colorName => (
        <button
          key={colorName}
          type="button"
          onClick={() => onChange(colorName)}
          className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${value.toLowerCase() === colorName ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent'}`}
          style={{ backgroundColor: colorMap[colorName] }}
          title={colorName}
        />
      ))}
      <input 
        placeholder="Custom"
        className="w-24 px-2 py-1 text-[10px] rounded border bg-background"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );

  const filteredProducts = productsData?.content?.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toString().includes(searchQuery) ||
    p.availableColors?.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 container mx-auto py-12 px-4 flex gap-8">
        {/* Sidebar */}
        <div className="w-72 hidden lg:block space-y-2">
          <div className="p-6 mb-4">
            <h2 className="text-2xl font-display font-bold text-primary flex items-center gap-3">
              <Sparkles className="text-accent" /> Praiso Admin
            </h2>
            <p className="text-xs text-muted-foreground mt-1 px-1">Management Portal v2.1</p>
          </div>
          
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-4 mb-2">Main Menu</p>
            <button 
              onClick={() => { setActiveTab("dashboard"); setEditingProduct(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === "dashboard" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-secondary text-muted-foreground"}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab("manage-products"); setEditingProduct(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === "manage-products" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-secondary text-muted-foreground"}`}
            >
              <List size={18} /> Inventory
            </button>
            <button 
              onClick={() => { setActiveTab("manage-categories"); setEditingProduct(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === "manage-categories" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-secondary text-muted-foreground"}`}
            >
              <LayoutGrid size={18} /> Categories
            </button>
          </div>

          <div className="px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-4 mb-2">Operations</p>
            <button 
              onClick={() => { 
                setActiveTab("add-product"); 
                setEditingProduct(null);
                setProductData({
                  name: "",
                  description: "",
                  color: "",
                  categoryId: 1,
                  variants: [{ attribute: "Standard", price: 0, stock: 10, color: "" }],
                  coverImage: "",
                  galleryImages: []
                });
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === "add-product" && !editingProduct ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-secondary text-muted-foreground"}`}
            >
              <PackagePlus size={18} /> Add Product
            </button>
            <button 
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === "orders" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-secondary text-muted-foreground"}`}
            >
              <ShoppingCart size={18} /> Orders
              <span className="ml-auto bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded-full">3 New</span>
            </button>
            <button 
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === "users" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-secondary text-muted-foreground"}`}
            >
              <Users size={18} /> Customers
            </button>
            <button 
              onClick={() => setActiveTab("marketing")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === "marketing" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-secondary text-muted-foreground"}`}
            >
              <Tag size={18} /> Marketing & Offers
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab + (editingProduct?.id || "")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card border rounded-[2rem] p-8 shadow-sm min-h-[600px]"
            >
              {activeTab === "dashboard" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-display font-bold">Admin Insights</h3>
                    <div className="flex gap-2">
                      <div className="bg-secondary px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2">
                        <Clock size={14} /> Last updated: Just now
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 relative overflow-hidden group">
                      <div className="absolute -right-4 -bottom-4 text-primary/10 group-hover:scale-110 transition-transform">
                        <Tag size={80} />
                      </div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Total Products</h4>
                      <p className="text-4xl font-display font-bold text-primary">{stats.totalProducts}</p>
                    </div>
                    <div className="p-6 bg-accent/5 rounded-[2rem] border border-accent/10 relative overflow-hidden group">
                      <div className="absolute -right-4 -bottom-4 text-accent/10 group-hover:scale-110 transition-transform">
                        <CreditCard size={80} />
                      </div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Total Revenue</h4>
                      <p className="text-4xl font-display font-bold text-accent">₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-secondary/5 rounded-[2rem] border border-secondary/10 relative overflow-hidden group">
                      <div className="absolute -right-4 -bottom-4 text-secondary-foreground/10 group-hover:scale-110 transition-transform">
                        <ShoppingCart size={80} />
                      </div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Active Orders</h4>
                      <p className="text-4xl font-display font-bold text-foreground">{stats.activeOrders}</p>
                    </div>
                    <div className="p-6 bg-green-500/5 rounded-[2rem] border border-green-500/10 relative overflow-hidden group">
                      <div className="absolute -right-4 -bottom-4 text-green-500/10 group-hover:scale-110 transition-transform">
                        <Users size={80} />
                      </div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Customers</h4>
                      <p className="text-4xl font-display font-bold text-green-600">{stats.totalCustomers}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    <div className="space-y-4">
                      <h4 className="font-bold flex items-center gap-2">
                        <Clock size={18} className="text-accent" /> Recent Activity
                      </h4>
                      <div className="bg-background border rounded-3xl overflow-hidden">
                        {realOrders.length > 0 ? realOrders.map((order, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-secondary/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-xs">
                                {order.user?.name?.[0] || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{order.user?.name || 'Anonymous'}</p>
                                <p className="text-[10px] text-muted-foreground">#ORD-{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">₹{order.totalAmount.toLocaleString()}</p>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        )) : (
                          <div className="p-8 text-center text-sm text-muted-foreground">
                            No real orders recorded yet.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-primary/5 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center border border-primary/10">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <BarChart3 size={40} />
                      </div>
                      <h4 className="font-bold text-lg mb-2">Revenue Growth</h4>
                      <p className="text-sm text-muted-foreground mb-6">Your sales are up by 12% compared to last week. Keep it up!</p>
                      <button className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
                        View Full Reports
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "add-product" && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-display font-bold">
                      {editingProduct ? "Refine Product" : "New Collection Item"}
                    </h3>
                    {editingProduct && (
                      <button 
                        onClick={() => { setEditingProduct(null); setActiveTab("manage-products"); }}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-bold"
                      >
                        <ArrowLeft size={18} /> BACK TO INVENTORY
                      </button>
                    )}
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Name</label>
                        <input 
                          required
                          placeholder="e.g. Royal Silk Saree"
                          className="w-full px-5 py-4 rounded-2xl border bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          value={productData.name}
                          onChange={e => setProductData({...productData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Color Variant</label>
                        <div className="px-5 py-3 rounded-2xl border bg-background flex items-center min-h-[60px]">
                          <ColorPicker 
                            value={productData.color}
                            onChange={val => setProductData({...productData, color: val})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category Assignment</label>
                        <select 
                          required
                          className="w-full px-5 py-4 rounded-2xl border bg-background appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none"
                          value={productData.categoryId}
                          onChange={e => setProductData({...productData, categoryId: Number(e.target.value)})}
                        >
                          {categoriesData?.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Base Description</label>
                        <textarea
                          rows={5}
                          placeholder="Describe this product in detail..."
                          className="w-full px-5 py-4 rounded-2xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm leading-relaxed"
                          value={productData.description}
                          onChange={e => setProductData({...productData, description: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Inventory Variants</label>
                      <div className="bg-secondary/20 p-6 rounded-[2rem] space-y-4">
                        {productData.variants.map((v, i) => (
                          <div key={i} className="grid grid-cols-4 gap-4 items-end">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-muted-foreground ml-2">SIZE/TYPE</span>
                              <input 
                                placeholder="Size"
                                className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                                value={v.attribute}
                                onChange={e => handleVariantChange(i, "attribute", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-muted-foreground ml-2">COLOR</span>
                              <div className="px-4 py-2 rounded-xl border bg-background min-h-[48px] flex items-center">
                                <ColorPicker 
                                  value={v.color}
                                  onChange={val => handleVariantChange(i, "color", val)}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-muted-foreground ml-2">PRICE (₹)</span>
                              <input 
                                type="number"
                                placeholder="Price"
                                className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                                value={v.price}
                                onChange={e => handleVariantChange(i, "price", Number(e.target.value))}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-muted-foreground ml-2">STOCK LEVEL</span>
                              <div className="flex gap-2">
                                <input 
                                  type="number"
                                  placeholder="Stock"
                                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                                  value={v.stock}
                                  onChange={e => handleVariantChange(i, "stock", Number(e.target.value))}
                                />
                                {i > 0 && (
                                  <button 
                                    type="button"
                                    onClick={() => setProductData(prev => ({ ...prev, variants: prev.variants.filter((_, idx) => idx !== i) }))}
                                    className="p-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                                {i === productData.variants.length - 1 && (
                                  <button 
                                    type="button"
                                    onClick={() => setProductData(prev => ({ ...prev, variants: [...prev.variants, { attribute: "Standard", price: 0, stock: 10, color: "" }] }))}
                                    className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                                  >
                                    <Plus size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ─── COVER IMAGE (Separate Section) ─── */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ImageIcon size={16} /> Cover Image
                      </label>
                      <p className="text-[11px] text-muted-foreground -mt-2">
                        This is the main hero image shown on cards & listings. Only one cover image per product.
                      </p>
                      <div className="flex gap-6 items-start">
                        <div 
                          className={`w-56 aspect-[3/4] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all cursor-pointer group ${productData.coverImage ? 'border-solid border-primary' : 'border-muted hover:border-primary/50 bg-secondary/10'}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file) handleCoverImageDrop(file);
                          }}
                          onClick={() => document.getElementById('cover-upload')?.click()}
                        >
                          {productData.coverImage ? (
                            <>
                              <img src={productData.coverImage} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload size={24} className="text-white" />
                                <span className="text-white text-xs font-bold ml-2">Replace</span>
                              </div>
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setProductData(prev => ({ ...prev, coverImage: "" })); }}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                              >
                                <X size={12} />
                              </button>
                              <div className="absolute bottom-2 left-2 px-3 py-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full shadow-lg tracking-wider">
                                COVER
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-3 p-6 text-center">
                              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Upload size={24} />
                              </div>
                              <p className="text-[11px] font-bold text-muted-foreground leading-tight">Drag & drop<br/>or click to upload</p>
                              <p className="text-[9px] text-muted-foreground">PNG, JPG, WebP</p>
                            </div>
                          )}
                          <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCoverImageDrop(file);
                          }} />
                        </div>
                        <div className="flex-1 space-y-3">
                          <input 
                            placeholder="Or paste cover image URL here..."
                            className="w-full px-5 py-4 rounded-2xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            value={productData.coverImage}
                            onChange={e => setProductData(prev => ({ ...prev, coverImage: e.target.value }))}
                          />
                          <p className="text-[10px] font-bold text-muted-foreground">QUICK PRESETS:</p>
                          <div className="flex gap-3">
                            {[
                              { name: "Kanchipuram", path: "/images/products/kanchi.png" },
                              { name: "Banarasi", path: "/images/products/banarasi.png" },
                            ].map(preset => (
                              <button
                                key={preset.path}
                                type="button"
                                onClick={() => setProductData(prev => ({ ...prev, coverImage: preset.path }))}
                                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${productData.coverImage === preset.path ? 'border-primary shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                              >
                                <img src={preset.path} className="w-full h-full object-cover" alt={preset.name} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ─── PRODUCT GALLERY (Multiple Images with Scroll) ─── */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Images size={16} /> Product Gallery
                          {productData.galleryImages.length > 0 && (
                            <span className="ml-2 bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">{productData.galleryImages.length} images</span>
                          )}
                        </label>
                        <button 
                          type="button"
                          onClick={() => document.getElementById('bulk-gallery-upload')?.click()}
                          className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline bg-primary/5 px-4 py-2 rounded-xl transition-all hover:bg-primary/10"
                        >
                          <Plus size={14} /> Upload Multiple
                        </button>
                        <input 
                          id="bulk-gallery-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          multiple 
                          onChange={(e) => {
                            if (e.target.files) handleBulkGalleryUpload(e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground -mt-2">
                        Add 2 or more angles, close-ups, or styling shots. Customers can scroll through these on the product page.
                      </p>

                      {/* Gallery Drag Zone + Scroll Carousel */}
                      <div 
                        className="relative bg-secondary/10 rounded-[2rem] p-6 border-2 border-dashed border-muted hover:border-primary/30 transition-all"
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary/50', 'bg-primary/5'); }}
                        onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary/50', 'bg-primary/5'); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-primary/50', 'bg-primary/5');
                          if (e.dataTransfer.files.length > 0) handleBulkGalleryUpload(e.dataTransfer.files);
                        }}
                      >
                        {productData.galleryImages.length > 0 ? (
                          <div className="relative">
                            {/* Scroll Arrows */}
                            {productData.galleryImages.length > 3 && (
                              <>
                                <button type="button" onClick={() => scrollGallery('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-card border shadow-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                                  <ChevronLeft size={18} />
                                </button>
                                <button type="button" onClick={() => scrollGallery('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-card border shadow-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                                  <ChevronRight size={18} />
                                </button>
                              </>
                            )}

                            {/* Scrollable Image Strip */}
                            <div 
                              ref={galleryScrollRef}
                              className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
                              style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--primary) transparent' }}
                            >
                              {productData.galleryImages.map((img, i) => (
                                <div key={i} className="flex-shrink-0 w-48 group">
                                  <div className="aspect-square rounded-2xl overflow-hidden relative border shadow-sm">
                                    <img src={img.url} className="w-full h-full object-cover" />
                                    <button 
                                      type="button"
                                      onClick={() => removeGalleryImage(i)}
                                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                    >
                                      <X size={12} />
                                    </button>
                                    <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                                      <div className="w-full bg-black/60 p-1.5 rounded backdrop-blur-md">
                                        <ColorPicker 
                                          value={img.color}
                                          onChange={val => {
                                            const newGallery = [...productData.galleryImages];
                                            newGallery[i].color = val;
                                            setProductData({ ...productData, galleryImages: newGallery });
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Add More Slot */}
                              <div 
                                className="flex-shrink-0 w-48 aspect-square rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                                onClick={() => document.getElementById('bulk-gallery-upload')?.click()}
                              >
                                <Plus size={24} className="text-muted-foreground" />
                                <p className="text-[10px] font-bold text-muted-foreground">ADD MORE</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="flex flex-col items-center justify-center py-12 cursor-pointer"
                            onClick={() => document.getElementById('bulk-gallery-upload')?.click()}
                          >
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                              <Images size={28} />
                            </div>
                            <p className="font-bold text-sm mb-1">Drag multiple images here</p>
                            <p className="text-[11px] text-muted-foreground">or click to select files from your device</p>
                            <p className="text-[9px] text-muted-foreground mt-2">Supports bulk upload — select 2+ images at once</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex pt-6">
                      <button 
                        disabled={isLoading}
                        className="w-full md:w-auto bg-primary text-primary-foreground px-12 py-5 rounded-[2rem] font-bold text-lg hover:shadow-[0_15px_50px_-10px_rgba(11,61,46,0.3)] transition-all disabled:opacity-50 hover:-translate-y-1 active:scale-95"
                      >
                        {isLoading ? "Saving to Cloud..." : editingProduct ? "Commit Changes" : "Publish to Store"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "manage-products" && (
                <div>
                  <div className="flex items-center justify-between mb-12">
                    <h3 className="text-3xl font-display font-bold">Product Inventory</h3>
                    <div className="relative w-72">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input 
                        placeholder="Search by name or ID..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-secondary/10 focus:bg-background transition-all outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredProducts?.map((product: any) => (
                      <motion.div 
                        layout
                        key={product.id} 
                        className="group flex items-center justify-between p-5 border rounded-3xl bg-background hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-muted rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500">
                            <img 
                              src={product.image || '/placeholder.svg'} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-lg">{product.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground uppercase">ID: {product.id}</span>
                              <span className="text-xs font-medium text-primary">₹{product.price}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {product.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                              </span>
                              {/* Color Variants Visibility */}
                              <div className="flex gap-1 ml-2 border-l pl-3 border-muted">
                                {product.availableColors?.map((c: string, idx: number) => (
                                  <div 
                                    key={idx} 
                                    className="w-3 h-3 rounded-full border border-black/10 shadow-sm" 
                                    style={{ backgroundColor: colorMap[c.toLowerCase().trim()] || c }}
                                    title={c}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-all"
                            onClick={() => handleEditClick(product)}
                            title="Edit Product"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            disabled={currentUser?.role === 'MINOR_ADMIN'}
                            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-destructive/10 disabled:hover:text-destructive"
                            onClick={async () => {
                              if (confirm(`Archive product ${product.name}?`)) {
                                try {
                                  await apiFetch(`/admin/products/${product.id}`, { method: "DELETE" });
                                  toast.success("Product archived");
                                  refetchProducts();
                                } catch (e: any) {
                                  toast.error(e.message || "Failed to archive");
                                }
                              }
                            }}
                            title={currentUser?.role === 'MINOR_ADMIN' ? "Super Admin privileges required to archive products" : "Archive Product"}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    {filteredProducts?.length === 0 && (
                      <div className="text-center py-20 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4">
                          <Search size={32} />
                        </div>
                        <p className="text-lg font-bold">No results found</p>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search query.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "manage-categories" && (
                <div>
                  <h3 className="text-3xl font-display font-bold mb-10">Department Management</h3>
                  
                  {/* Add Category Form */}
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setIsLoading(true);
                      try {
                        await apiFetch("/admin/categories", {
                          method: "POST",
                          body: JSON.stringify(categoryData),
                        });
                        toast.success("Category created!");
                        setCategoryData({ name: "", description: "", imageUrl: "" });
                        refetchCategories();
                      } catch (e: any) {
                        toast.error(e.message || "Failed to create category");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="mb-12 p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground ml-1">NAME</label>
                        <input 
                          placeholder="e.g. Designer Wear"
                          className="w-full px-5 py-4 rounded-2xl border bg-background"
                          value={categoryData.name}
                          onChange={e => setCategoryData({...categoryData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <ImageInputSelector
                          label="Category Banner Image"
                          value={categoryData.imageUrl}
                          onChange={url => setCategoryData({...categoryData, imageUrl: url})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground ml-1">SCOPE / DESCRIPTION</label>
                      <textarea 
                        placeholder="Describe what items go in this category..."
                        className="w-full px-5 py-4 rounded-2xl border bg-background min-h-[100px] outline-none"
                        value={categoryData.description}
                        onChange={e => setCategoryData({...categoryData, description: e.target.value})}
                      />
                    </div>
                    <button 
                      disabled={isLoading}
                      className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isLoading ? "Creating..." : "Establish Category"}
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoriesData?.map((cat: any) => (
                      <div key={cat.id} className="flex items-center justify-between p-5 border rounded-[2rem] bg-background hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500 bg-muted flex items-center justify-center">
                            <img 
                              src={cat.imageUrl || '/placeholder.svg'} 
                              alt={cat.name} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-lg">{cat.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{cat.description || 'No description available'}</p>
                          </div>
                        </div>
                        <button 
                          disabled={currentUser?.role === 'MINOR_ADMIN'}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          title={currentUser?.role === 'MINOR_ADMIN' ? "Super Admin privileges required to delete departments" : "Remove Category"}
                          onClick={async () => {
                            if (confirm(`Remove category ${cat.name}?`)) {
                              try {
                                await apiFetch(`/admin/categories/${cat.id}`, { method: "DELETE" });
                                toast.success("Category removed");
                                refetchCategories();
                              } catch (e: any) {
                                toast.error(e.message || "Failed to remove");
                              }
                            }
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="bg-card border p-8 rounded-[2.5rem] shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <h3 className="font-display text-2xl font-bold">Order Fulfilment</h3>
                      <p className="text-sm text-muted-foreground">Manage shipping courier, tracking details, and delivery statuses</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          <th className="py-4 px-2">Order ID</th>
                          <th className="py-4 px-2">Customer</th>
                          <th className="py-4 px-2">Date</th>
                          <th className="py-4 px-2">Amount</th>
                          <th className="py-4 px-2">Payment</th>
                          <th className="py-4 px-2">Status</th>
                          <th className="py-4 px-2">Courier / Tracking</th>
                          <th className="py-4 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-sm">
                        {realOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="py-4 px-2 font-mono font-bold text-primary">#{order.id}</td>
                            <td className="py-4 px-2">
                              <p className="font-bold">{order.user?.name || "Guest"}</p>
                              <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                            </td>
                            <td className="py-4 px-2">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td className="py-4 px-2 font-bold">₹{order.totalAmount?.toLocaleString()}</td>
                            <td className="py-4 px-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${order.paymentMode === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                {order.paymentMode || 'ONLINE'}
                              </span>
                            </td>
                            <td className="py-4 px-2">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                                order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                                order.status === 'SHIPPED' || order.status === 'IN_TRANSIT' ? 'bg-sky-100 text-sky-800' :
                                order.status === 'CANCELLED' ? 'bg-destructive/10 text-destructive' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-xs">
                              {order.courierService ? (
                                <div>
                                  <p className="font-semibold text-foreground">{order.courierService}</p>
                                  <p className="text-muted-foreground font-mono">{order.trackingNumber}</p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">Not Shipped</span>
                              )}
                            </td>
                            <td className="py-4 px-2 text-right">
                              <button
                                onClick={() => {
                                  setEditingOrder(order);
                                  setTrackingForm({
                                    trackingNumber: order.trackingNumber || "",
                                    courierService: order.courierService || "",
                                    status: order.status || "PENDING"
                                  });
                                }}
                                className="px-4 py-2 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground font-bold rounded-xl text-xs transition-all"
                              >
                                Edit Tracking
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tracking Edit Modal */}
                  <AnimatePresence>
                    {editingOrder && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-card max-w-md w-full border rounded-[2rem] p-6 shadow-2xl space-y-6 text-foreground"
                        >
                          <div className="flex justify-between items-center border-b pb-4">
                            <h4 className="font-display font-bold text-xl">Ship Order #{editingOrder.id}</h4>
                            <button onClick={() => setEditingOrder(null)} className="p-1 hover:bg-secondary rounded-full">
                              <X size={18} />
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-muted-foreground uppercase">Courier Service</label>
                              <input
                                placeholder="e.g. BlueDart, Delhivery"
                                className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                                value={trackingForm.courierService}
                                onChange={e => setTrackingForm({...trackingForm, courierService: e.target.value})}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-muted-foreground uppercase">Tracking Number</label>
                              <input
                                placeholder="e.g. 1234567890"
                                className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                                value={trackingForm.trackingNumber}
                                onChange={e => setTrackingForm({...trackingForm, trackingNumber: e.target.value})}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-muted-foreground uppercase">Fulfilment Status</label>
                              <select
                                className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                                value={trackingForm.status}
                                onChange={e => setTrackingForm({...trackingForm, status: e.target.value})}
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="PAID">PAID</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="IN_TRANSIT">IN TRANSIT</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => handleSaveTracking(editingOrder.id)}
                              className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm"
                            >
                              Save Details
                            </button>
                            <button
                              onClick={() => setEditingOrder(null)}
                              className="px-5 border font-semibold py-3 rounded-xl text-sm hover:bg-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {activeTab === "users" && (
                <div className="bg-card border p-8 rounded-[2.5rem] shadow-sm space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-2xl font-bold">Customer Directory</h3>
                        {currentUser?.role === 'MINOR_ADMIN' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/25">
                            Minor Admin View Only
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {currentUser?.role === 'MINOR_ADMIN' 
                          ? "Browse active shopper profiles and verification statuses (Super Admin required for changes)" 
                          : "Manage active shopper profiles, account verifications, and administrator privileges"
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <input
                          type="text"
                          placeholder="Search customers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64 bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  {usersLoading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading customer directory...</div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-secondary/50 border-b text-xs font-bold text-muted-foreground uppercase">
                            <th className="p-4">Customer</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Registered On</th>
                            <th className="p-4 text-right">Moderation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                          {users
                            .filter(u => 
                              u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (u.phoneNumber && u.phoneNumber.includes(searchQuery))
                            )
                            .map((userItem) => (
                              <tr key={userItem.id} className="hover:bg-secondary/20 transition-colors">
                                <td className="p-4 font-semibold">{userItem.name}</td>
                                <td className="p-4 text-muted-foreground">
                                  <div>{userItem.email}</div>
                                  <div className="text-xs">{userItem.phoneNumber || "N/A"}</div>
                                </td>
                                <td className="p-4">
                                  <select
                                    value={userItem.role}
                                    onChange={(e) => handleChangeUserRole(userItem.id, e.target.value)}
                                    disabled={currentUser?.role === 'MINOR_ADMIN' || userItem.email === currentUser?.email}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold bg-background border focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-75 disabled:cursor-not-allowed ${
                                      userItem.role === 'ADMIN' 
                                        ? 'text-primary border-primary/20 bg-primary/5 hover:bg-primary/10' 
                                        : userItem.role === 'MINOR_ADMIN'
                                          ? 'text-amber-600 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10'
                                          : 'text-muted-foreground border-border bg-secondary/30 hover:bg-secondary/50'
                                    }`}
                                  >
                                    <option value="USER">USER</option>
                                    <option value="MINOR_ADMIN">MINOR ADMIN</option>
                                    <option value="ADMIN">ADMIN</option>
                                  </select>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${userItem.isVerified ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${userItem.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {userItem.isVerified ? 'Verified' : 'Blocked / Unverified'}
                                  </span>
                                </td>
                                <td className="p-4 text-muted-foreground">
                                  {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                                </td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => handleToggleUserVerify(userItem.id)}
                                    disabled={currentUser?.role === 'MINOR_ADMIN' || userItem.email === currentUser?.email}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                                      userItem.isVerified 
                                        ? 'hover:bg-destructive/10 text-destructive border-destructive/20 hover:border-destructive/30' 
                                        : 'hover:bg-primary/10 text-primary border-primary/20 hover:border-primary/30'
                                    }`}
                                  >
                                    {userItem.isVerified ? 'Block Account' : 'Verify Account'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "marketing" && (
                <div className="space-y-10">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card border p-6 rounded-[2rem] shadow-sm animate-fade-in">
                    <div>
                      <h3 className="font-display text-3xl font-bold flex items-center gap-2">
                        <Tag className="text-primary" /> Marketing Campaign Hub
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Design exclusive store discount codes and pop-up announcement offers</p>
                    </div>
                  </div>

                  {/* Coupons Section */}
                  <div className="bg-card border p-8 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-display text-xl font-bold">Dynamic Promo Coupons</h4>
                        <p className="text-sm text-muted-foreground">Control and manage promotional coupon codes and their active expiry dates</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingCoupon(null);
                          setCouponForm({ id: undefined, code: "", discountPercentage: 20, expiryDate: "", active: true });
                          setShowCouponModal(true);
                        }}
                        className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:opacity-90 shadow-md transition-all active:scale-95"
                      >
                        <Plus size={16} /> Add Promo Code
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {coupons.map((coupon) => {
                        const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                        return (
                          <div key={coupon.id} className="relative bg-secondary/20 border rounded-[2rem] p-6 space-y-4 hover:shadow-md transition-all hover:bg-secondary/30">
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-lg font-bold bg-primary text-primary-foreground px-3 py-1 rounded-xl tracking-wider uppercase">
                                {coupon.code}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingCoupon(coupon);
                                    setCouponForm({
                                      id: coupon.id,
                                      code: coupon.code,
                                      discountPercentage: coupon.discountPercentage,
                                      expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
                                      active: coupon.active
                                    });
                                    setShowCouponModal(true);
                                  }}
                                  className="p-2 text-muted-foreground hover:bg-background rounded-full transition-colors"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  disabled={currentUser?.role === 'MINOR_ADMIN'}
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  className="p-2 text-destructive hover:bg-background rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                  title={currentUser?.role === 'MINOR_ADMIN' ? "Super Admin privileges required to delete coupons" : "Delete Coupon"}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <div>
                              <div className="text-3xl font-extrabold text-primary font-display">
                                {coupon.discountPercentage}% OFF
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Flat storewide discount on checkout</p>
                            </div>
                            <div className="border-t pt-3 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-medium text-muted-foreground">Validity:</span>{" "}
                                <span className={`font-semibold ${isExpired ? 'text-destructive' : 'text-foreground'}`}>
                                  {coupon.expiryDate 
                                    ? new Date(coupon.expiryDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })
                                    : "Lifetime"}
                                </span>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${coupon.active && !isExpired ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${coupon.active && !isExpired ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                {isExpired ? 'Expired' : coupon.active ? 'Active' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {coupons.length === 0 && (
                        <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-[2rem]">
                          No coupon codes found. Click "Add Promo Code" to get started!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pop Offers Section */}
                  <div className="bg-card border p-8 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-display text-xl font-bold">Pop-Up Storefront Offers</h4>
                        <p className="text-sm text-muted-foreground">Manage pop-up banner campaigns loaded on the storefront home page</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingOffer(null);
                          setOfferForm({ id: undefined, title: "", description: "", imageUrl: "", couponCode: "", expiryDate: "", active: true });
                          setShowOfferModal(true);
                        }}
                        className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:opacity-90 shadow-md transition-all active:scale-95"
                      >
                        <Plus size={16} /> Add Pop Banner
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {offers.map((offer) => {
                        const isExpired = offer.expiryDate && new Date(offer.expiryDate) < new Date();
                        return (
                          <div key={offer.id} className="bg-secondary/20 border rounded-[2.5rem] overflow-hidden flex flex-col hover:shadow-md transition-all hover:bg-secondary/30">
                            {offer.imageUrl && (
                              <div className="h-44 w-full relative bg-muted overflow-hidden">
                                <img
                                  src={offer.imageUrl}
                                  alt={offer.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 flex gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingOffer(offer);
                                      setOfferForm({
                                        id: offer.id,
                                        title: offer.title,
                                        description: offer.description,
                                        imageUrl: offer.imageUrl || "",
                                        couponCode: offer.couponCode || "",
                                        expiryDate: offer.expiryDate ? offer.expiryDate.split("T")[0] : "",
                                        active: offer.active
                                      });
                                      setShowOfferModal(true);
                                    }}
                                    className="p-2 bg-background/95 hover:bg-background rounded-full shadow-sm text-muted-foreground transition-colors"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    disabled={currentUser?.role === 'MINOR_ADMIN'}
                                    onClick={() => handleDeleteOffer(offer.id)}
                                    className="p-2 bg-background/95 hover:bg-background rounded-full shadow-sm text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background/95"
                                    title={currentUser?.role === 'MINOR_ADMIN' ? "Super Admin privileges required to delete offers" : "Delete Offer"}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                  <h5 className="font-display font-bold text-lg text-primary">{offer.title}</h5>
                                  {!offer.imageUrl && (
                                    <div className="flex gap-1 shrink-0">
                                      <button
                                        onClick={() => {
                                          setEditingOffer(offer);
                                          setOfferForm({
                                            id: offer.id,
                                            title: offer.title,
                                            description: offer.description,
                                            imageUrl: offer.imageUrl || "",
                                            couponCode: offer.couponCode || "",
                                            expiryDate: offer.expiryDate ? offer.expiryDate.split("T")[0] : "",
                                            active: offer.active
                                          });
                                          setShowOfferModal(true);
                                        }}
                                        className="p-1.5 text-muted-foreground hover:bg-background rounded-full transition-colors"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        disabled={currentUser?.role === 'MINOR_ADMIN'}
                                        onClick={() => handleDeleteOffer(offer.id)}
                                        className="p-1.5 text-destructive hover:bg-background rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                        title={currentUser?.role === 'MINOR_ADMIN' ? "Super Admin privileges required to delete offers" : "Delete Offer"}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">{offer.description}</p>
                              </div>

                              <div className="space-y-3 pt-3 border-t">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-muted-foreground font-medium">Associated Coupon:</span>
                                  <span className="font-mono bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-lg">
                                    {offer.couponCode || "None"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-muted-foreground font-medium">Campaign Expiry:</span>
                                  <span className={`font-semibold ${isExpired ? 'text-destructive' : 'text-foreground'}`}>
                                    {offer.expiryDate
                                      ? new Date(offer.expiryDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })
                                      : "Ongoing"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-muted-foreground font-medium">Banner Status:</span>
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${offer.active && !isExpired ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${offer.active && !isExpired ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    {isExpired ? 'Expired' : offer.active ? 'Active' : 'Disabled'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {offers.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-[2.5rem]">
                          No storefront pop-up banner offers created. Click "Add Pop Banner" to design one!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ================= COUPON MODAL ================= */}
                  <AnimatePresence>
                    {showCouponModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-card border rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative"
                        >
                          <button
                            onClick={() => setShowCouponModal(false)}
                            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X size={20} />
                          </button>

                          <h4 className="font-display text-2xl font-bold mb-6">
                            {editingCoupon ? "Edit Coupon Details" : "Create New Coupon"}
                          </h4>

                          <form onSubmit={handleSaveCoupon} className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Coupon Code
                              </label>
                              <input
                                type="text"
                                required
                                value={couponForm.code}
                                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                                placeholder="e.g. SILK20"
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background font-mono font-bold tracking-widest text-lg text-primary uppercase"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Discount Percentage (%)
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                max="100"
                                value={couponForm.discountPercentage}
                                onChange={(e) => setCouponForm({ ...couponForm, discountPercentage: Number(e.target.value) })}
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background font-bold text-lg"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Validity Expiry Date (Optional)
                              </label>
                              <input
                                type="date"
                                value={couponForm.expiryDate}
                                onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-sm"
                              />
                            </div>

                            <div className="flex items-center gap-3 py-2">
                              <input
                                type="checkbox"
                                id="couponActive"
                                checked={couponForm.active}
                                onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor="couponActive" className="text-sm font-semibold select-none cursor-pointer">
                                Active & Available on Checkout
                              </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <button
                                type="submit"
                                className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm shadow-md transition-all active:scale-95"
                              >
                                Save Coupon
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowCouponModal(false)}
                                className="px-5 border font-semibold py-3 rounded-xl text-sm hover:bg-secondary transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* ================= POP OFFER MODAL ================= */}
                  <AnimatePresence>
                    {showOfferModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-card border rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative overflow-y-auto max-h-[90vh]"
                        >
                          <button
                            onClick={() => setShowOfferModal(false)}
                            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X size={20} />
                          </button>

                          <h4 className="font-display text-2xl font-bold mb-6">
                            {editingOffer ? "Edit Pop Offer Campaign" : "Design New Storefront Pop Banner"}
                          </h4>

                          <form onSubmit={handleSaveOffer} className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Offer Title
                              </label>
                              <input
                                type="text"
                                required
                                value={offerForm.title}
                                onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                                placeholder="e.g. Midnight Luxury Silk Sale"
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Offer Description / Terms
                              </label>
                              <textarea
                                required
                                rows={5}
                                value={offerForm.description}
                                onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                                placeholder="Details about this limited campaign..."
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-sm resize-y"
                              />
                            </div>

                            <div>
                              <ImageInputSelector
                                label="Banner Image"
                                value={offerForm.imageUrl}
                                onChange={url => setOfferForm({ ...offerForm, imageUrl: url })}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                  Associated Coupon Code (Optional)
                                </label>
                                <select
                                  value={offerForm.couponCode}
                                  onChange={(e) => setOfferForm({ ...offerForm, couponCode: e.target.value })}
                                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-sm"
                                >
                                  <option value="">None / Informational only</option>
                                  {coupons.map(c => (
                                    <option key={c.id} value={c.code}>{c.code} ({c.discountPercentage}%)</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                  Expiry Validity (Optional)
                                </label>
                                <input
                                  type="date"
                                  value={offerForm.expiryDate}
                                  onChange={(e) => setOfferForm({ ...offerForm, expiryDate: e.target.value })}
                                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-background text-sm"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 py-2">
                              <input
                                type="checkbox"
                                id="offerActive"
                                checked={offerForm.active}
                                onChange={(e) => setOfferForm({ ...offerForm, active: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor="offerActive" className="text-sm font-semibold select-none cursor-pointer">
                                Active & Visible to Shoppers on home screen pop-up
                              </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <button
                                type="submit"
                                className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm shadow-md transition-all active:scale-95"
                              >
                                Save Pop Campaign
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowOfferModal(false)}
                                className="px-5 border font-semibold py-3 rounded-xl text-sm hover:bg-secondary transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
