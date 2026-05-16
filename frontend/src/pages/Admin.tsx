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
import { Trash2, Edit } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Admin = () => {
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

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchStats();
      fetchRecentOrders();
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
                        <input 
                          className="w-full px-5 py-4 rounded-2xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
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
                            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all"
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
                            title="Archive Product"
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
                        <label className="text-[10px] font-bold text-muted-foreground ml-1">IMAGE URL</label>
                        <input 
                          placeholder="Image URL"
                          className="w-full px-5 py-4 rounded-2xl border bg-background"
                          value={categoryData.imageUrl}
                          onChange={e => setCategoryData({...categoryData, imageUrl: e.target.value})}
                          required
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
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
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
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-primary mb-6 animate-pulse">
                    <ShoppingCart size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Order Management</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">This module is currently being finalized. You will soon be able to track, ship, and manage customer returns here.</p>
                </div>
              )}

              {activeTab === "users" && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-primary mb-6 animate-pulse">
                    <Users size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Customer CRM</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">Customer relationship management features are coming soon. You'll be able to view user history, award loyalty points, and more.</p>
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
