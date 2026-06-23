import { useState, useEffect, useRef } from "react";
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { User, Settings, ShoppingCart, Home, Grid, Sparkles, MapPin } from "lucide-react";

import { AppTab, CartItem, UserProfile, Product } from "./types";
import { INITIAL_USER, STORES } from "./data";
import { INITIAL_SOCCER_TEAMS, SoccerTeamState } from "./utils/pricing";

import LoadingScreen from "./components/LoadingScreen";
import LoginRegister from "./components/LoginRegister";
import HeaderNav from "./components/HeaderNav";
import HomeDashboard from "./components/HomeDashboard";
import GroceriesListing from "./components/GroceriesListing";
import VegetablesListing from "./components/VegetablesListing";
import SabariBrands from "./components/SabariBrands";
import CartView from "./components/CartView";
import AccountProfile from "./components/AccountProfile";
import SettingsTab from "./components/SettingsTab";
import AISmartSaver from "./components/AISmartSaver";
import { useLiveProducts, useLiveOffers, useLiveNotifications } from "./hooks/useFirebaseData";
import { auth, db } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("supplyco_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [soccerTeams, setSoccerTeams] = useState<SoccerTeamState[]>(INITIAL_SOCCER_TEAMS);
  const { products, loading: productsLoading } = useLiveProducts();
  const { offers, loading: offersLoading } = useLiveOffers();
  const { notifications } = useLiveNotifications();
  const seenNotificationIds = useRef<Set<string>>(new Set());

  // Ask for native notification permissions on first app load
  useEffect(() => {
    const requestNativePermissions = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const permStatus = await LocalNotifications.checkPermissions();
          if (permStatus.display !== 'granted') {
            await LocalNotifications.requestPermissions();
          }
        } catch (e) {
          console.error("Failed to request native permissions on load", e);
        }
      }
    };
    requestNativePermissions();
  }, []);

  // Web Push Notification Permissions are now requested when toggled in Settings

  // Trigger Web Push when new notifications arrive
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    
    // On the first load, we don't want to blast the user with historical notifications,
    // so we just record the current ones.
    if (seenNotificationIds.current.size === 0) {
      notifications.forEach(n => seenNotificationIds.current.add(n.id));
      return;
    }

    // Check for any completely new notifications
    notifications.forEach((n) => {
      if (!seenNotificationIds.current.has(n.id)) {
        seenNotificationIds.current.add(n.id);
        
        if (user?.notificationsEnabled) {
          if (Capacitor.isNativePlatform()) {
            // Trigger Native Push
            LocalNotifications.schedule({
              notifications: [
                {
                  title: n.title,
                  body: n.message,
                  id: Math.floor(Math.random() * 2000000000), // Android requires valid 32-bit integer
                  sound: null,
                  attachments: null,
                  actionTypeId: "",
                  extra: null
                }
              ]
            }).catch(e => console.error("Failed to schedule native notification", e));
          } else if ("Notification" in window && Notification.permission === "granted") {
            // Trigger Web Push
            new Notification(n.title, {
              body: n.message,
              icon: "/favicon.ico"
            });
          }
        }
      }
    });
  }, [notifications, user?.notificationsEnabled]);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem("supplyco_cart", JSON.stringify(cart));
  }, [cart]);

  // Firebase Auth persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
            setActiveTab((prev) => (prev === "login" ? "home" : prev));
          } else {
            setUser(null);
            setActiveTab((prev) => (prev !== "loading" ? "login" : prev));
          }
        } catch (e) {
          console.error("Error fetching user profile", e);
          setUser(null);
        }
      } else {
        setUser(null);
        setActiveTab((prev) => (prev !== "loading" ? "login" : prev));
      }
    });
    return () => unsubscribe();
  }, []);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Cart Management
  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("login");
  };

  // Safe handler to transition tabs instantly
  const renderActiveTab = () => {
    if (!user) {
      return <LoginRegister onAuthenticated={(usr) => { setUser(usr); setActiveTab("home"); }} />;
    }

    switch (activeTab) {
      case "home":
        return (
          <HomeDashboard
            user={user}
            onTabChange={setActiveTab}
            cart={cart}
            addToCart={handleAddToCart}
            updateCartQty={handleUpdateCartQty}
            soccerTeams={soccerTeams}
            products={products}
            offers={offers}
          />
        );
      case "groceries":
        return (
          <GroceriesListing
            user={user}
            onTabChange={setActiveTab}
            cart={cart}
            addToCart={handleAddToCart}
            updateCartQty={handleUpdateCartQty}
            soccerTeams={soccerTeams}
            products={products}
            offers={offers}
          />
        );
      case "vegetables":
        return (
          <VegetablesListing
            user={user}
            onTabChange={setActiveTab}
            cart={cart}
            addToCart={handleAddToCart}
            updateCartQty={handleUpdateCartQty}
            soccerTeams={soccerTeams}
            products={products}
            offers={offers}
          />
        );
      case "sabari":
        return (
          <SabariBrands
            user={user}
            onTabChange={setActiveTab}
            cart={cart}
            addToCart={handleAddToCart}
            updateCartQty={handleUpdateCartQty}
            soccerTeams={soccerTeams}
            onUpdateSoccerTeams={setSoccerTeams}
            products={products}
            offers={offers}
          />
        );
      case "cart":
        return (
          <CartView
            user={user}
            onTabChange={setActiveTab}
            cart={cart}
            updateCartQty={handleUpdateCartQty}
            removeFromCart={handleRemoveFromCart}
            clearCart={clearCart}
            soccerTeams={soccerTeams}
          />
        );
      case "profile":
        return <AccountProfile user={user} onUpdateUser={setUser} />;
      case "settings":
        return <SettingsTab user={user} onUpdateUser={setUser} onLogout={handleLogout} />;
      case "ai-saver":
        return <AISmartSaver user={user} cart={cart} />;
      default:
        return (
          <HomeDashboard
            user={user}
            onTabChange={setActiveTab}
            cart={cart}
            addToCart={handleAddToCart}
            updateCartQty={handleUpdateCartQty}
            soccerTeams={soccerTeams}
            products={products}
            offers={offers}
          />
        );
    }
  };

  const activeStore = STORES.find((s) => s.id === user?.activeStoreId) || STORES[0];

  const themeClass = 
    user?.theme === "dark" 
      ? "dark-theme-wrapper text-slate-100" 
      : user?.theme === "vintage" 
        ? "vintage-theme-wrapper text-amber-950" 
        : "light-theme-wrapper text-slate-800";

  return (
    <div className={`font-sans min-h-screen pb-24 md:pb-8 transition-colors duration-300 ${themeClass}`}>
      {/* Loading Splash page */}
      {activeTab === "loading" && (
        <LoadingScreen onFinished={() => setActiveTab(user ? "home" : "login")} />
      )}

      {/* Auth page routing */}
      {activeTab === "login" && !user && (
        <LoginRegister
          onAuthenticated={(usr) => {
            setUser(usr);
            setActiveTab("home");
          }}
        />
      )}

      {/* Main Core Layout */}
      {user && activeTab !== "loading" && activeTab !== "login" && (
        <>
          {/* Top header navigation */}
          <HeaderNav
            user={user}
            currentTab={activeTab}
            onTabChange={setActiveTab}
            cartCount={totalCartItems}
            onLogout={handleLogout}
            onEditProfile={() => setActiveTab("profile")}
          />

          <main className="max-w-7xl mx-auto px-4 py-6 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Desktop Side Nav Menu (Hidden on viewport < 768px) */}
              <aside className="hidden md:flex md:col-span-3 flex-col gap-2 bg-[#fdfbf7] border border-[#c3c6d1] rounded-2xl p-4 h-fit sticky top-20 shadow-sm">
                <div className="flex items-center gap-3 pb-4 mb-2 border-b border-slate-100">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCESFr7dzPNBqU449PdjF-XH0pTeUl5-0LnTL3I-YwEKy_CP6vVEu0msa3yBgNnH5xGuQA9L4Sj7SnIZrTs3ZdepJ99DrZXdo_QzujEFD3YB_E51bEynzxGJbZI8k-ZdcFd2F99a-hAaBGHxwgSoczPutSC7R8fLPPnG4fVQ83s_lqGncoPMkSldI43F7FrEIgaSA8aB9sYZnkcAIWYEYVoYGNx6abmmJBSH96YkhXXcRxcR-CBoRkvIhA0kRRzBb0Q6_1usMAHBZc"
                    alt="Quick summary head"
                    className="w-10 h-10 rounded-full border border-emerald-800 object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">{user.fullName}</h3>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                      Active: {activeStore.location}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("home")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "home" ? "bg-emerald-800 text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home Dashboard / ഹോം</span>
                </button>

                <button
                  onClick={() => setActiveTab("groceries")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "groceries" ? "bg-emerald-800 text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Groceries Listing / പലചരക്ക്</span>
                </button>

                <button
                  onClick={() => setActiveTab("vegetables")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "vegetables" ? "bg-emerald-800 text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Vegetable Listing / പച്ചക്കറികൾ</span>
                </button>

                <button
                  onClick={() => setActiveTab("sabari")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "sabari" ? "bg-emerald-800 text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Sabari Brands / ശബരി</span>
                </button>

                <button
                  onClick={() => setActiveTab("ai-saver")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "ai-saver" ? "bg-emerald-800 text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>AI Smart Saver / സ്മാർട്ട് സേവർ</span>
                </button>

                <button
                  onClick={() => setActiveTab("cart")}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "cart" ? "bg-emerald-800 text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4" />
                    <span>My Cart / കാർട്ട്</span>
                  </div>
                  {totalCartItems > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === "cart" ? "bg-white text-emerald-800" : "bg-emerald-800 text-white"}`}>
                      {totalCartItems}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "profile" ? "bg-emerald-800 text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Account Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "settings" ? "bg-emerald-800 text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings / ക്രമീകരണങ്ങൾ</span>
                </button>
              </aside>

              {/* Central components switcher */}
              <div className="md:col-span-9 space-y-6">
                {renderActiveTab()}
              </div>
            </div>
          </main>

          {/* Sticky Mobile Navigation Bar (Visible on viewport < 768px) */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-[0_-4px_12px_rgba(0,35,78,0.05)] bg-[#fdfbf7]/90 backdrop-blur-md border-t border-amber-900/10 flex justify-around items-center px-4 pb-4 pt-2">
            
            {/* Home Tab */}
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "home" ? "text-emerald-800 font-bold scale-105" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Home</span>
            </button>

            {/* Categories tab router linking to groceries */}
            <button
              onClick={() => setActiveTab("groceries")}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "groceries" || activeTab === "vegetables" || activeTab === "sabari"
                  ? "bg-slate-200 text-emerald-800 font-bold rounded-2xl"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Grid className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Listings</span>
            </button>

            {/* AI Assistant access button */}
            <button
              onClick={() => setActiveTab("ai-saver")}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "ai-saver" ? "text-emerald-800 font-bold scale-105" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="w-5 h-5 mb-0.5 text-emerald-700 animate-pulse animate-duration-1000" />
              <span className="text-[10px] tracking-tight">AI Saver</span>
            </button>

            {/* Account Tab */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "profile" ? "text-emerald-800 font-bold scale-105" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Account</span>
            </button>

            {/* Settings Tab */}
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "settings" ? "text-emerald-800 font-bold scale-105" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Settings className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Settings</span>
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
