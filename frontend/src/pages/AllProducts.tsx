import { useState, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye, SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList, Search, ArrowUpDown } from "lucide-react";
import categorySarees from "@/assets/category-sarees.jpg";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low → High" },
  { value: "price_high", label: "Price: High → Low" },
  { value: "name_az", label: "Name: A → Z" },
  { value: "name_za", label: "Name: Z → A" },
];

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹1,000", min: 0, max: 1000 },
  { label: "₹1,000 – ₹3,000", min: 1000, max: 3000 },
  { label: "₹3,000 – ₹5,000", min: 3000, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "Above ₹10,000", min: 10000, max: Infinity },
];

const AllProducts = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const { data: apiProducts, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState("newest");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [gridCols, setGridCols] = useState(4);
  const [inStockOnly, setInStockOnly] = useState(false);

  const products = useMemo(() => {
    return apiProducts?.content?.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.discountPrice || Math.round(p.price * 1.3),
      image: p.image || p.mainImage || categorySarees,
      rating: p.rating || 4.5,
      color: p.color || "",
      categoryName: p.categoryName || "",
      inStock: p.inStock !== false,
      tag: p.tag || (p.id % 2 === 0 ? "New" : "Bestseller"),
      defaultVariantId: p.defaultVariantId,
    })) || [];
  }, [apiProducts]);

  // Extract unique colors from products
  const availableColors = useMemo(() => {
    const colors = [...new Set(products.map((p: any) => p.color).filter(Boolean))];
    return colors;
  }, [products]);

  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  // Apply all filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory) {
      result = result.filter((p: any) => 
        p.categoryName?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p: any) => 
        p.name.toLowerCase().includes(q) || p.color.toLowerCase().includes(q)
      );
    }

    // Price range filter
    const range = PRICE_RANGES[selectedPriceRange];
    if (range) {
      result = result.filter((p: any) => p.price >= range.min && p.price <= range.max);
    }

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter((p: any) => 
        selectedColors.some(c => p.color.toLowerCase().includes(c.toLowerCase()))
      );
    }

    // In-stock filter
    if (inStockOnly) {
      result = result.filter((p: any) => p.inStock);
    }

    // Sort
    switch (selectedSort) {
      case "price_low":
        result.sort((a: any, b: any) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a: any, b: any) => b.price - a.price);
        break;
      case "name_az":
        result.sort((a: any, b: any) => a.name.localeCompare(b.name));
        break;
      case "name_za":
        result.sort((a: any, b: any) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, selectedPriceRange, selectedColors, inStockOnly, selectedSort]);

  const activeFilterCount = [
    selectedCategory,
    searchQuery.trim(),
    selectedPriceRange > 0,
    selectedColors.length > 0,
    inStockOnly,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setSelectedPriceRange(0);
    setSelectedColors([]);
    setInStockOnly(false);
    setSelectedSort("newest");
    setSearchParams({});
  };

  const tagColors: Record<string, string> = {
    "New": "bg-emerald-600 text-white",
    "Bestseller": "bg-amber-500 text-white",
    "Sale": "bg-rose-500 text-white",
    "Limited": "bg-violet-600 text-white",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Banner */}
      <section className="relative py-16 bg-gradient-to-b from-primary/8 to-background border-b overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="container mx-auto px-4 text-center relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-widest"
          >
            <Star size={12} className="fill-primary" /> {products.length} Items Available
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl font-display font-bold mb-4"
          >
            Explore Our Collection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Discover our entire range of premium ethnic wear, from elegant sarees to comfortable leggings and stylish tops.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto py-8 px-4">
        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Left: Filter toggle + search */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-bold text-sm transition-all ${showFilters ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-background hover:bg-secondary'}`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-accent text-accent-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                placeholder="Search products..."
                className="pl-11 pr-4 py-3 rounded-2xl border bg-background w-64 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Sort + Grid toggle + Results count */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium hidden md:block">
              {filteredProducts.length} result{filteredProducts.length !== 1 && 's'}
            </span>
            <div className="relative">
              <select 
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none pl-10 pr-8 py-3 rounded-2xl border bg-background text-sm font-medium cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ArrowUpDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <div className="hidden md:flex border rounded-2xl overflow-hidden">
              {[3, 4].map(cols => (
                <button 
                  key={cols}
                  onClick={() => setGridCols(cols)}
                  className={`p-3 transition-colors ${gridCols === cols ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary text-muted-foreground'}`}
                >
                  {cols === 3 ? <LayoutList size={16} /> : <Grid3X3 size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                {selectedCategory}
                <button onClick={() => { setSelectedCategory(""); setSearchParams({}); }}><X size={12} /></button>
              </span>
            )}
            {selectedPriceRange > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                {PRICE_RANGES[selectedPriceRange].label}
                <button onClick={() => setSelectedPriceRange(0)}><X size={12} /></button>
              </span>
            )}
            {selectedColors.map(c => (
              <span key={c} className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                {c}
                <button onClick={() => toggleColor(c)}><X size={12} /></button>
              </span>
            ))}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                In Stock Only
                <button onClick={() => setInStockOnly(false)}><X size={12} /></button>
              </span>
            )}
            <button 
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-destructive font-bold px-3 py-1.5 underline"
            >
              Clear All
            </button>
          </motion.div>
        )}

        {/* Main Content: Sidebar + Grid */}
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:block flex-shrink-0 overflow-hidden"
              >
                <div className="w-[280px] space-y-8 sticky top-24">
                  {/* Categories */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" /> Categories
                    </h4>
                    <div className="space-y-1">
                      <button 
                        onClick={() => { setSelectedCategory(""); setSearchParams({}); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${!selectedCategory ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-secondary text-muted-foreground'}`}
                      >
                        All Categories
                      </button>
                      {categories?.map((cat: any) => (
                        <button 
                          key={cat.id}
                          onClick={() => { setSelectedCategory(cat.name); setSearchParams({ category: cat.name }); }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${selectedCategory === cat.name ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-secondary text-muted-foreground'}`}
                        >
                          {cat.name}
                          <span className="text-[10px] opacity-70">
                            {products.filter((p: any) => p.categoryName === cat.name).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent" /> Price Range
                    </h4>
                    <div className="space-y-1">
                      {PRICE_RANGES.map((range, i) => (
                        <button 
                          key={i}
                          onClick={() => setSelectedPriceRange(i)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedPriceRange === i ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-secondary text-muted-foreground'}`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  {availableColors.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400" /> Colors
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map((color: string) => (
                          <button 
                            key={color}
                            onClick={() => toggleColor(color)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedColors.includes(color) ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-background hover:bg-secondary border-transparent text-muted-foreground'}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" /> Availability
                    </h4>
                    <button
                      onClick={() => setInStockOnly(!inStockOnly)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${inStockOnly ? 'bg-green-50 text-green-700 border border-green-200' : 'hover:bg-secondary text-muted-foreground'}`}
                    >
                      <div className={`w-10 h-6 rounded-full transition-all relative ${inStockOnly ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${inStockOnly ? 'left-[18px]' : 'left-0.5'}`} />
                      </div>
                      In Stock Only
                    </button>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1 min-h-[60vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Loading our collection...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed"
              >
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mx-auto mb-4">
                  <Search size={32} />
                </div>
                <p className="text-xl font-bold mb-2">No products match your filters</p>
                <p className="text-sm text-muted-foreground mb-6">Try adjusting your search or filter criteria.</p>
                <button 
                  onClick={clearAllFilters}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm hover:-translate-y-1 transition-all shadow-lg shadow-primary/20"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <div className={`grid gap-6 ${gridCols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
                {filteredProducts.map((product: any, i: number) => (
                  <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="card-product group"
                    whileHover={{ y: -8 }}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Link to={`/product/${product.id}`} className="block w-full h-full">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          onError={(e) => { (e.target as HTMLImageElement).src = categorySarees; }}
                        />
                      </Link>
                      <div className="absolute inset-0 bg-foreground/0 pointer-events-none group-hover:bg-foreground/10 transition-all duration-500" />
                      
                      {/* Tag */}
                      {product.tag && (
                        <span className={`absolute top-3 left-3 px-3 py-1 text-[10px] font-bold rounded-full ${tagColors[product.tag] || "bg-primary text-primary-foreground"}`}>
                          {product.tag}
                        </span>
                      )}

                      {/* Category badge */}
                      {product.categoryName && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold rounded-md bg-black/40 backdrop-blur-sm text-white">
                          {product.categoryName}
                        </span>
                      )}
                      
                      {/* Quick actions */}
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <button
                          className="w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-md text-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
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
                        </button>
                        <Link to={`/product/${product.id}`}>
                          <button className="w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-md text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0" style={{ transitionDelay: '50ms' }}>
                            <Eye size={15} />
                          </button>
                        </Link>
                        <button
                          className="w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-md text-foreground hover:text-primary-foreground hover:bg-primary transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                          style={{ transitionDelay: '100ms' }}
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
                        </button>
                      </div>

                      {/* Out of stock overlay */}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-foreground text-background px-4 py-2 rounded-full text-xs font-bold tracking-wider">SOLD OUT</span>
                        </div>
                      )}
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
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md ml-auto">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllProducts;
