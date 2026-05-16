import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, MapPin, Edit3, Shield, Package, Save, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile Data
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  
  // Edit States
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "", city: "", state: "", zipCode: "", country: "India", isDefault: false
  });

  useEffect(() => {
    if (!token) {
      navigate("/signin");
      return;
    }
    fetchProfileData();
  }, [token]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const [profileData, addressesData] = await Promise.all([
        apiFetch("/profile"),
        apiFetch("/address")
      ]);
      setProfile(profileData);
      setEditPhone(profileData.phone || "");
      setAddresses(addressesData);
    } catch (error: any) {
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePhone = async () => {
    try {
      await apiFetch("/profile/phone", {
        method: "PUT",
        body: JSON.stringify({ phone: editPhone })
      });
      toast.success("Phone number updated");
      setIsEditingPhone(false);
      setProfile({ ...profile, phone: editPhone });
    } catch (error: any) {
      toast.error(error.message || "Failed to update phone");
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/address", {
        method: "POST",
        body: JSON.stringify(newAddress)
      });
      toast.success("Address added successfully");
      setIsAddingAddress(false);
      setNewAddress({ street: "", city: "", state: "", zipCode: "", country: "India", isDefault: false });
      fetchProfileData(); // Refresh addresses
    } catch (error: any) {
      toast.error(error.message || "Failed to add address");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Header */}
      <section className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-lg">
              {profile?.name?.charAt(0) || user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">{profile?.name || user?.name || "Your Profile"}</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Shield size={14} className="text-primary" /> Verified Customer
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 flex-1 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-card border rounded-3xl p-4 sticky top-24 space-y-2">
            {[
              { id: "details", label: "My Details", icon: User },
              { id: "addresses", label: "Addresses", icon: MapPin },
              { id: "orders", label: "Order History", icon: Package },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-secondary text-muted-foreground'}`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl">
          
          {/* Details Tab */}
          {activeTab === "details" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-card border rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <User className="text-primary" /> Personal Information
                </h2>
                
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                    <div className="mt-1 flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-2xl">
                      <User size={18} className="text-muted-foreground" />
                      <span className="font-medium">{profile?.name || user?.name}</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <div className="mt-1 flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-2xl">
                      <Mail size={18} className="text-muted-foreground" />
                      <span className="font-medium">{profile?.email || user?.email}</span>
                      <span className="ml-auto flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                    {isEditingPhone ? (
                      <div className="mt-1 flex gap-3">
                        <div className="relative flex-1">
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input 
                            type="tel"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="+91 00000 00000"
                          />
                        </div>
                        <button onClick={handleUpdatePhone} className="bg-primary text-primary-foreground px-6 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2">
                          <Save size={16} /> Save
                        </button>
                        <button onClick={() => setIsEditingPhone(false)} className="px-6 rounded-2xl font-bold hover:bg-secondary transition-all">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-between px-4 py-3 bg-secondary/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Phone size={18} className="text-muted-foreground" />
                          <span className="font-medium">{profile?.phone || "Not provided"}</span>
                        </div>
                        <button onClick={() => setIsEditingPhone(true)} className="text-primary hover:underline flex items-center gap-1 text-sm font-bold">
                          <Edit3 size={14} /> Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="text-primary" /> Saved Addresses
                </h2>
                {!isAddingAddress && (
                  <button 
                    onClick={() => setIsAddingAddress(true)}
                    className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    <Plus size={16} /> Add New
                  </button>
                )}
              </div>

              {isAddingAddress && (
                <div className="bg-card border-2 border-primary/20 rounded-3xl p-6 shadow-lg shadow-primary/5">
                  <h3 className="font-bold mb-4">Add New Address</h3>
                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Street Address</label>
                      <input required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border bg-background text-sm" placeholder="123 Main St, Apt 4B" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">City</label>
                        <input required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border bg-background text-sm" placeholder="Chennai" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">State</label>
                        <input required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border bg-background text-sm" placeholder="Tamil Nadu" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">PIN Code</label>
                        <input required value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border bg-background text-sm" placeholder="600001" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Country</label>
                        <input required value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border bg-background text-sm" placeholder="India" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                      <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-4 h-4 text-primary rounded" />
                      <span className="text-sm font-medium">Set as default address</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold">Save Address</button>
                      <button type="button" onClick={() => setIsAddingAddress(false)} className="flex-1 bg-secondary text-foreground py-3 rounded-xl font-bold">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {addresses.length === 0 && !isAddingAddress ? (
                <div className="text-center py-12 bg-secondary/30 rounded-3xl border border-dashed">
                  <MapPin size={32} className="mx-auto text-muted-foreground mb-3" />
                  <p className="font-bold">No saved addresses</p>
                  <p className="text-sm text-muted-foreground mb-4">Add an address for faster checkout</p>
                  <button onClick={() => setIsAddingAddress(true)} className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-bold shadow-md">Add Address</button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="relative bg-card border rounded-2xl p-5 hover:border-primary/50 transition-all group">
                      {address.isDefault && (
                        <span className="absolute top-5 right-5 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md">DEFAULT</span>
                      )}
                      <p className="font-bold text-foreground mb-1">{address.street}</p>
                      <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.zipCode}</p>
                      <p className="text-sm text-muted-foreground">{address.country}</p>
                      
                      <div className="mt-4 flex items-center gap-4">
                        <button className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                          <Edit3 size={12} /> Edit
                        </button>
                        <button className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Orders Tab Placeholder */}
          {activeTab === "orders" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed">
              <Package size={48} className="mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Looks like you haven't made any purchases yet. Explore our collection to find something beautiful.</p>
              <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:bg-primary/90 transition-all">
                Start Shopping
              </Link>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
