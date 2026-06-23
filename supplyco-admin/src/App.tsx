import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "./firebase";
import { Package, Plus, Trash2, Image as ImageIcon, AlignLeft, MapPin, MonitorPlay, Tag, Percent, Bell, Lock, Mail, LogOut, ShieldAlert } from "lucide-react";

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  
  const [activeTab, setActiveTab] = useState("products");
  const [productFilter, setProductFilter] = useState("all");
  const [selectedStore, setSelectedStore] = useState("all");

  // Offer Creation State
  const [offerCampaignName, setOfferCampaignName] = useState("");
  const [offerPercentage, setOfferPercentage] = useState<number | "">("");
  const [offerStore, setOfferStore] = useState("all");
  const [offerStartsAt, setOfferStartsAt] = useState("");
  const [offerExpiresAt, setOfferExpiresAt] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsAuthChecking(false);
    });

    if (!isAuthenticated) return unsubAuth;

    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubOffers = onSnapshot(collection(db, "offers"), (snapshot) => {
      setOffers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubBanners = onSnapshot(collection(db, "banners"), (snapshot) => {
      setBanners(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubNotifications = onSnapshot(collection(db, "notifications"), (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubProducts(); unsubOffers(); unsubBanners(); unsubNotifications(); unsubAuth(); };
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleAddProduct = async () => {
    await addDoc(collection(db, "products"), {
      name: "New Item", 
      nameMl: "പേര്", 
      price: 0, 
      mrp: 0, 
      isSubsidy: false, 
      inStock: true, 
      category: productFilter === "all" ? "groceries" : productFilter,
      image: "",
      description: "",
      storeId: selectedStore === "all" ? "global" : selectedStore
    });
  };

  const handleAddBanner = async () => {
    await addDoc(collection(db, "banners"), {
      tag: "NEW BANNER",
      title: "Banner Title",
      desc: "Banner description...",
      img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
      tab: "sabari"
    });
  };

  const handleAddNotification = async () => {
    await addDoc(collection(db, "notifications"), {
      title: "New Notification",
      message: "Notification message goes here...",
      type: "info",
      isPublished: false,
      createdAt: new Date().toISOString()
    });
  };

  // Filter products by store and category for the Products Tab
  let displayedProducts = products;
  if (selectedStore !== "all") {
    displayedProducts = displayedProducts.filter(p => !p.storeId || p.storeId === "global" || p.storeId === selectedStore);
  }
  if (productFilter !== "all") {
    displayedProducts = displayedProducts.filter(p => p.category === productFilter);
  }

  // Filter products for Offer Selection Grid
  const offerProducts = useMemo(() => {
    let list = products;
    if (offerStore !== "all") {
      list = list.filter(p => !p.storeId || p.storeId === "global" || p.storeId === offerStore);
    }
    return list;
  }, [products, offerStore]);

  const sabariProducts = offerProducts.filter(p => p.category === "sabari");
  const subsidyProducts = offerProducts.filter(p => p.isSubsidy);
  const regularProducts = offerProducts.filter(p => p.category !== "sabari" && !p.isSubsidy);

  const toggleProductSelection = (id: string) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProductIds(next);
  };

  const toggleSelectAll = (list: any[]) => {
    const next = new Set(selectedProductIds);
    const allSelected = list.length > 0 && list.every(p => next.has(p.id));
    if (allSelected) {
      list.forEach(p => next.delete(p.id));
    } else {
      list.forEach(p => next.add(p.id));
    }
    setSelectedProductIds(next);
  };

  const handleCreateBulkOffers = async () => {
    if (!offerCampaignName) return alert("Please enter a campaign name.");
    if (offerPercentage === "" || Number(offerPercentage) <= 0) return alert("Please enter a valid discount percentage.");
    if (selectedProductIds.size === 0) return alert("Please select at least one product.");

    const percentage = Number(offerPercentage) / 100;

    for (const productId of selectedProductIds) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;

      // Pricing logic requested: Use supplyco mrp. If missing, use actual mrp.
      const basePrice = (product.price && product.price > 0) ? product.price : (product.mrp || 0);
      const newPrice = basePrice * (1 - percentage);

      await addDoc(collection(db, "offers"), {
        campaignName: offerCampaignName,
        isActive: true,
        offerPrice: newPrice,
        productId: productId,
        storeId: offerStore === "all" ? "global" : offerStore,
        startsAt: offerStartsAt ? new Date(offerStartsAt).toISOString() : null,
        expiresAt: offerExpiresAt ? new Date(offerExpiresAt).toISOString() : null,
      });
    }

    alert(`Successfully created ${selectedProductIds.size} offers!`);
    setOfferCampaignName("");
    setOfferPercentage("");
    setOfferStartsAt("");
    setOfferExpiresAt("");
    setSelectedProductIds(new Set());
  };

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center font-bold text-emerald-800">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-emerald-800 p-6 text-center">
            <Package className="w-12 h-12 text-white mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-white tracking-wide">Supplyco Admin</h1>
            <p className="text-emerald-100 text-sm mt-1">Secure Management Portal</p>
          </div>
          
          <div className="p-6 md:p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <p>{loginError}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                    placeholder="admin@supplyco.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm mt-6"
              >
                Secure Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-slate-800 pb-20">
      <nav className="bg-emerald-800 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-xl font-bold tracking-wide flex items-center gap-2">
            <Package className="w-6 h-6" /> Supplyco Admin
            <button onClick={handleLogout} className="ml-4 flex items-center gap-1 text-xs bg-emerald-700 hover:bg-emerald-600 px-2 py-1 rounded transition-colors">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </h1>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex gap-2 md:gap-4 font-semibold text-sm overflow-x-auto pb-2 md:pb-0">
              <button onClick={() => setActiveTab("products")} className={`px-4 py-2 whitespace-nowrap rounded-lg transition-colors ${activeTab === "products" ? "bg-white text-emerald-800" : "hover:bg-emerald-700"}`}>Products</button>
              <button onClick={() => setActiveTab("offers")} className={`px-4 py-2 whitespace-nowrap rounded-lg transition-colors ${activeTab === "offers" ? "bg-white text-emerald-800" : "hover:bg-emerald-700"}`}>Offers</button>
              <button onClick={() => setActiveTab("banners")} className={`px-4 py-2 whitespace-nowrap rounded-lg transition-colors ${activeTab === "banners" ? "bg-white text-emerald-800" : "hover:bg-emerald-700"}`}>Banners</button>
              <button onClick={() => setActiveTab("notifications")} className={`px-4 py-2 whitespace-nowrap rounded-lg transition-colors ${activeTab === "notifications" ? "bg-white text-emerald-800" : "hover:bg-emerald-700"}`}>Notifications</button>
            </div>

            {activeTab === "products" && (
              <div className="flex items-center gap-2 bg-emerald-900/50 px-3 py-1.5 rounded-lg border border-emerald-700 shrink-0">
                <MapPin className="w-4 h-4 text-emerald-300" />
                <select 
                  className="bg-transparent outline-none text-sm font-bold text-white cursor-pointer"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                >
                  <option value="all" className="text-slate-800">All Stores (Global)</option>
                  <option value="tvm_eastfort" className="text-slate-800">Trivandrum East Fort</option>
                  <option value="ekm_mgroad" className="text-slate-800">Ernakulam MG Road</option>
                  <option value="kzk_palayam" className="text-slate-800">Kozhikode Palayam</option>
                  <option value="tsr_round" className="text-slate-800">Thrissur Swaraj Round</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-6 mt-4">
        {activeTab === "products" && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 overflow-x-auto w-full md:w-auto">
                <button onClick={() => setProductFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${productFilter === "all" ? "bg-emerald-100 text-emerald-800" : "text-slate-500 hover:bg-slate-50"}`}>All</button>
                <button onClick={() => setProductFilter("groceries")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${productFilter === "groceries" ? "bg-emerald-100 text-emerald-800" : "text-slate-500 hover:bg-slate-50"}`}>Groceries</button>
                <button onClick={() => setProductFilter("vegetables")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${productFilter === "vegetables" ? "bg-emerald-100 text-emerald-800" : "text-slate-500 hover:bg-slate-50"}`}>Vegetables</button>
                <button onClick={() => setProductFilter("sabari")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${productFilter === "sabari" ? "bg-emerald-100 text-emerald-800" : "text-slate-500 hover:bg-slate-50"}`}>Sabari</button>
              </div>

              <button onClick={handleAddProduct} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm font-bold text-sm shrink-0">
                <Plus className="w-4 h-4" /> Add {productFilter !== "all" ? productFilter.charAt(0).toUpperCase() + productFilter.slice(1) : "Product"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProducts.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3 relative hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <input className="font-bold text-lg outline-none w-full border-b border-transparent focus:border-emerald-300 transition-colors" placeholder="Product Name" value={p.name} onChange={(e) => updateDoc(doc(db, "products", p.id), { name: e.target.value })} />
                      <input className="text-xs text-slate-500 outline-none w-full border-b border-transparent focus:border-emerald-300 transition-colors" placeholder="Malayalam Name (Optional)" value={p.nameMl} onChange={(e) => updateDoc(doc(db, "products", p.id), { nameMl: e.target.value })} />
                    </div>
                    <button onClick={() => { if(confirm("Delete this product?")) deleteDoc(doc(db, "products", p.id)) }} className="text-red-400 hover:text-red-600 shrink-0 ml-2"><Trash2 className="w-4 h-4"/></button>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <input className="text-xs text-slate-600 bg-transparent outline-none w-full" placeholder="Image URL (e.g. https://...)" value={p.image || ""} onChange={(e) => updateDoc(doc(db, "products", p.id), { image: e.target.value })} />
                    {p.image && <img src={p.image} className="w-6 h-6 object-cover rounded-md shrink-0" alt="thumb" />}
                  </div>

                  <div className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <AlignLeft className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <textarea className="text-xs text-slate-600 bg-transparent outline-none w-full resize-none h-12" placeholder="Brief Description..." value={p.description || ""} onChange={(e) => updateDoc(doc(db, "products", p.id), { description: e.target.value })} />
                  </div>

                  <div className="flex gap-4 mt-1">
                    <div className="flex flex-col w-1/2">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Supplyco Price (₹)</label>
                      <input type="number" className="font-mono bg-slate-50 p-2 rounded-lg border outline-none focus:ring-2 ring-emerald-200" value={p.price} onChange={(e) => updateDoc(doc(db, "products", p.id), { price: Number(e.target.value) })} />
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Actual MRP (₹)</label>
                      <input type="number" className="font-mono bg-slate-50 p-2 rounded-lg border outline-none focus:ring-2 ring-emerald-200" value={p.mrp} onChange={(e) => updateDoc(doc(db, "products", p.id), { mrp: Number(e.target.value) })} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <select 
                      className="text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-400 bg-slate-50 font-semibold"
                      value={p.category}
                      onChange={(e) => updateDoc(doc(db, "products", p.id), { category: e.target.value })}
                    >
                      <option value="groceries">Category: Groceries</option>
                      <option value="vegetables">Category: Vegetables</option>
                      <option value="sabari">Category: Sabari Brands</option>
                    </select>

                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input type="checkbox" checked={p.isSubsidy} onChange={(e) => updateDoc(doc(db, "products", p.id), { isSubsidy: e.target.checked })} className="w-4 h-4 accent-emerald-600 rounded" />
                      Government Subsidy
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input type="checkbox" checked={p.inStock} onChange={(e) => updateDoc(doc(db, "products", p.id), { inStock: e.target.checked })} className="w-4 h-4 accent-emerald-600 rounded" />
                      In Stock
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "offers" && (
          <div className="animate-fade-in flex flex-col gap-8">
            {/* Offer Creation Builder */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Tag className="w-8 h-8 text-amber-500" />
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Campaign</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Campaign Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Onam Special 2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    value={offerCampaignName}
                    onChange={e => setOfferCampaignName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Discount Percentage</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="e.g. 15"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                      value={offerPercentage}
                      onChange={e => setOfferPercentage(e.target.value ? Number(e.target.value) : "")}
                    />
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Target Store</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all appearance-none cursor-pointer"
                    value={offerStore}
                    onChange={(e) => setOfferStore(e.target.value)}
                  >
                    <option value="all">Global (All Stores)</option>
                    <option value="tvm_eastfort">Trivandrum East Fort</option>
                    <option value="ekm_mgroad">Ernakulam MG Road</option>
                    <option value="kzk_palayam">Kozhikode Palayam</option>
                    <option value="tsr_round">Thrissur Swaraj Round</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Starts At (Optional)</label>
                  <input 
                    type="datetime-local" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    value={offerStartsAt}
                    onChange={e => setOfferStartsAt(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Expires At (Optional)</label>
                  <input 
                    type="datetime-local" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    value={offerExpiresAt}
                    onChange={e => setOfferExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleCreateBulkOffers}
                  className="bg-amber-500 hover:bg-amber-600 text-white w-full py-4 rounded-xl font-black tracking-wide text-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Apply Discount to Selected Products
                </button>
              </div>
            </div>

            {/* Product Selection Matrix */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-slate-800">Select Products to Apply Discount</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Subsidy Group */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex justify-between items-center">
                    <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Subsidy Items
                    </h4>
                    <button onClick={() => toggleSelectAll(subsidyProducts)} className="text-xs font-bold text-emerald-600 hover:text-emerald-800">
                      {subsidyProducts.length > 0 && subsidyProducts.every(p => selectedProductIds.has(p.id)) ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="p-2 flex-1 overflow-y-auto max-h-[400px]">
                    {subsidyProducts.map(p => (
                      <label key={p.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border-b border-slate-50 last:border-0">
                        <input 
                          type="checkbox" 
                          checked={selectedProductIds.has(p.id)}
                          onChange={() => toggleProductSelection(p.id)}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">₹{(p.price > 0 ? p.price : p.mrp).toFixed(2)}</span>
                        </div>
                      </label>
                    ))}
                    {subsidyProducts.length === 0 && <div className="p-4 text-xs text-center text-slate-400">No items</div>}
                  </div>
                </div>

                {/* Non-Subsidy Group */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
                    <h4 className="font-bold text-blue-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Non-Subsidy Items
                    </h4>
                    <button onClick={() => toggleSelectAll(regularProducts)} className="text-xs font-bold text-blue-600 hover:text-blue-800">
                      {regularProducts.length > 0 && regularProducts.every(p => selectedProductIds.has(p.id)) ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="p-2 flex-1 overflow-y-auto max-h-[400px]">
                    {regularProducts.map(p => (
                      <label key={p.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border-b border-slate-50 last:border-0">
                        <input 
                          type="checkbox" 
                          checked={selectedProductIds.has(p.id)}
                          onChange={() => toggleProductSelection(p.id)}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">₹{(p.price > 0 ? p.price : p.mrp).toFixed(2)}</span>
                        </div>
                      </label>
                    ))}
                    {regularProducts.length === 0 && <div className="p-4 text-xs text-center text-slate-400">No items</div>}
                  </div>
                </div>

                {/* Sabari Group */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                    <h4 className="font-bold text-red-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Sabari Brands
                    </h4>
                    <button onClick={() => toggleSelectAll(sabariProducts)} className="text-xs font-bold text-red-600 hover:text-red-800">
                      {sabariProducts.length > 0 && sabariProducts.every(p => selectedProductIds.has(p.id)) ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="p-2 flex-1 overflow-y-auto max-h-[400px]">
                    {sabariProducts.map(p => (
                      <label key={p.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border-b border-slate-50 last:border-0">
                        <input 
                          type="checkbox" 
                          checked={selectedProductIds.has(p.id)}
                          onChange={() => toggleProductSelection(p.id)}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">₹{(p.price > 0 ? p.price : p.mrp).toFixed(2)}</span>
                        </div>
                      </label>
                    ))}
                    {sabariProducts.length === 0 && <div className="p-4 text-xs text-center text-slate-400">No items</div>}
                  </div>
                </div>

              </div>
            </div>

            {/* Existing Active Offers Management */}
            <div className="pt-8 border-t border-slate-200 mt-4">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Manage Active Offers</h3>
              <div className="flex flex-col gap-4">
                {offers.map(o => {
                  const p = products.find(prod => prod.id === o.productId);
                  return (
                    <div key={o.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-amber-500 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex flex-col gap-2 flex-grow">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Campaign</label>
                        <input className="font-bold text-lg outline-none w-full border-b border-transparent focus:border-amber-300 transition-colors" value={o.campaignName} onChange={(e) => updateDoc(doc(db, "offers", o.id), { campaignName: e.target.value })} />
                      </div>
                      
                      <div className="flex flex-col gap-1 w-48 shrink-0">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Target Product</label>
                        <span className="text-sm font-bold text-slate-700 truncate">{p ? p.name : "Unknown Product"}</span>
                        {o.storeId && o.storeId !== "global" && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded w-fit">{o.storeId}</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 w-32 shrink-0">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Final Price (₹)</label>
                        <input type="number" className="font-mono bg-amber-50 text-amber-900 p-2 rounded-lg border outline-none font-bold" value={o.offerPrice} onChange={(e) => updateDoc(doc(db, "offers", o.id), { offerPrice: Number(e.target.value) })} />
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Starts At</label>
                        <input type="datetime-local" className="text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-amber-400 bg-slate-50" value={o.startsAt ? o.startsAt.slice(0, 16) : ""} onChange={(e) => updateDoc(doc(db, "offers", o.id), { startsAt: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Expires At</label>
                        <input type="datetime-local" className="text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-amber-400 bg-slate-50" value={o.expiresAt ? o.expiresAt.slice(0, 16) : ""} onChange={(e) => updateDoc(doc(db, "offers", o.id), { expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                      </div>

                      <div className="flex items-center justify-between md:justify-start gap-4 md:ml-4 shrink-0 mt-2 md:mt-0">
                        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                          <input type="checkbox" checked={o.isActive} onChange={(e) => updateDoc(doc(db, "offers", o.id), { isActive: e.target.checked })} className="w-5 h-5 accent-amber-600 rounded" />
                          Active
                        </label>
                        
                        <button onClick={() => { if(confirm("End campaign for this product?")) deleteDoc(doc(db, "offers", o.id)) }} className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg"><Trash2 className="w-5 h-5"/></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "banners" && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Dynamic Banners</h2>
              <button onClick={handleAddBanner} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm font-bold text-sm">
                <Plus className="w-4 h-4" /> Add Banner
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {banners.map(b => (
                <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
                  
                  <div className="relative h-40 bg-slate-100 rounded-xl overflow-hidden group">
                    <img src={b.img} alt="banner" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <MonitorPlay className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Banner Title</label>
                        <input className="font-bold text-lg outline-none w-full border-b border-transparent focus:border-blue-300 transition-colors" value={b.title} onChange={(e) => updateDoc(doc(db, "banners", b.id), { title: e.target.value })} />
                      </div>
                      <button onClick={() => { if(confirm("Delete banner?")) deleteDoc(doc(db, "banners", b.id)) }} className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg shrink-0"><Trash2 className="w-4 h-4"/></button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Subtitle / Description</label>
                      <input className="text-sm text-slate-600 outline-none w-full border-b border-transparent focus:border-blue-300 transition-colors" value={b.desc} onChange={(e) => updateDoc(doc(db, "banners", b.id), { desc: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Image URL</label>
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <ImageIcon className="w-3 h-3 text-slate-400 shrink-0" />
                        <input className="text-xs text-slate-600 bg-transparent outline-none w-full" value={b.img} onChange={(e) => updateDoc(doc(db, "banners", b.id), { img: e.target.value })} />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-1/2 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Highlight Tag</label>
                        <input className="text-xs bg-red-50 text-red-700 font-bold p-2 rounded-lg outline-none w-full border border-red-100" value={b.tag} onChange={(e) => updateDoc(doc(db, "banners", b.id), { tag: e.target.value })} />
                      </div>
                      <div className="w-1/2 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Click Action (Tab)</label>
                        <select 
                          className="text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-400 w-full"
                          value={b.tab}
                          onChange={(e) => updateDoc(doc(db, "banners", b.id), { tab: e.target.value })}
                        >
                          <option value="sabari">Sabari Brands</option>
                          <option value="groceries">Groceries</option>
                          <option value="vegetables">Vegetables</option>
                          <option value="profile">Profile / Settings</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="w-6 h-6 text-slate-800" /> Web Push Notifications
              </h2>
              <button onClick={handleAddNotification} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm font-bold text-sm">
                <Plus className="w-4 h-4" /> New Draft
              </button>
            </div>

            <div className="space-y-4">
              {notifications.sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0)).map(n => {
                let bgClass = "bg-white border-slate-200";
                if (n.type === "alert") bgClass = "bg-red-50 border-red-200";
                if (n.type === "offer") bgClass = "bg-amber-50 border-amber-200";
                
                return (
                  <div key={n.id} className={`p-5 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-4 items-start md:items-center ${bgClass}`}>
                  
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="w-full md:w-1/3 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Title</label>
                        <input className="font-bold text-base outline-none w-full border-b border-transparent focus:border-emerald-300 transition-colors" value={n.title} onChange={(e) => updateDoc(doc(db, "notifications", n.id), { title: e.target.value })} />
                      </div>
                      
                      <div className="w-full md:w-1/2 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Message body</label>
                        <input className="text-sm text-slate-600 outline-none w-full border-b border-transparent focus:border-emerald-300 transition-colors" value={n.message} onChange={(e) => updateDoc(doc(db, "notifications", n.id), { message: e.target.value })} />
                      </div>

                      <div className="w-full md:w-1/6 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Type</label>
                        <select 
                          className="text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-400 w-full bg-slate-50"
                          value={n.type}
                          onChange={(e) => updateDoc(doc(db, "notifications", n.id), { type: e.target.value })}
                        >
                          <option value="alert">Alert (Red)</option>
                          <option value="offer">Offer (Yellow)</option>
                          <option value="info">Info (Default)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto">
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(n.createdAt).toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      {n.isPublished ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">PUBLISHED</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">DRAFT</span>
                      )}
                      {!n.isPublished && (
                        <button onClick={() => { 
                          updateDoc(doc(db, "notifications", n.id), { isPublished: true, createdAt: new Date().toISOString() });
                          alert("Published to devices!");
                        }} className="text-white hover:bg-emerald-700 bg-emerald-600 p-2 px-3 rounded-lg text-xs font-bold shadow-sm transition-colors">Send Push</button>
                      )}
                      <button onClick={() => { if(confirm("Delete notification?")) deleteDoc(doc(db, "notifications", n.id)) }} className="text-red-400 hover:text-red-600 p-2 bg-red-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                </div>
              )})}
              
              {notifications.length === 0 && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
                  <Bell className="w-12 h-12 mb-4 opacity-50 text-slate-300" />
                  <p className="text-sm">No active notifications. Click "Send Notification" to alert users.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
