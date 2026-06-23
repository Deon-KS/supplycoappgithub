import { useState } from "react";
import { Menu, X, Home, ShoppingCart, User, Settings, Sparkles, MapPin, LogOut, Bell, Compass } from "lucide-react";
import { UserProfile, AppTab } from "../types";
import { STORES } from "../data";
import { t } from "../utils/lang";
import { useLiveNotifications } from "../hooks/useFirebaseData";

interface HeaderNavProps {
  user: UserProfile;
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  cartCount: number;
  onLogout: () => void;
  onEditProfile: () => void;
}

export default function HeaderNav({
  user,
  currentTab,
  onTabChange,
  cartCount,
  onLogout,
  onEditProfile,
}: HeaderNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { notifications } = useLiveNotifications();
  const unreadCount = notifications.length; // Simplified for now

  const activeStore = STORES.find((s) => s.id === user.activeStoreId) || STORES[0];

  const menuItems = [
    { id: "home", label: "Home", labelMl: "ഹോം", icon: Home },
    { id: "groceries", label: "Groceries", labelMl: "പലചരക്ക്", icon: Compass },
    { id: "vegetables", label: "Vegetables", labelMl: "പച്ചക്കറികൾ", icon: Compass },
    { id: "sabari", label: "Sabari Brands", labelMl: "ശബരി ബ്രാൻഡുകൾ", icon: Sparkles },
    { id: "ai-saver", label: "AI Smart Saver", labelMl: "ശബരി സ്മാർട്ട് സേവർ", icon: Sparkles },
    { id: "cart", label: "Review Cart", labelMl: "കാർട്ട്", icon: ShoppingCart, badge: cartCount },
    { id: "profile", label: "My Profile", labelMl: "പ്രൊഫൈൽ", icon: User },
    { id: "settings", label: "Settings", labelMl: "ക്രമീകരണങ്ങൾ", icon: Settings },
  ];

  return (
    <>
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fbf9f5] border-b border-amber-900/10 shadow-[0_4px_12px_rgba(0,35,78,0.03)] h-16">
        <div className="flex items-center justify-between px-4 h-full max-w-7xl mx-auto">
          {/* Menu & Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 -ml-2 text-[#00234e] hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col cursor-pointer" onClick={() => onTabChange("home")}>
              <h1 className="font-bold text-[#00234e] text-base leading-tight">
                Supplyco Kerala
              </h1>
              <span className="text-[10px] text-slate-500 font-semibold leading-none">
                സപ്ലൈകോ കേരളം
              </span>
            </div>
          </div>

          {/* Active Store Indicator (Desktop only) */}
          <button
            onClick={onEditProfile}
            className="hidden md:flex items-center gap-2 bg-[#efeeea] border border-amber-900/10 hover:bg-slate-200/60 rounded-full px-4 py-1.5 transition-all text-xs font-semibold text-slate-700 shadow-sm cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-800" />
            <span>{activeStore.name}</span>
          </button>

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            {/* AI Assistant access button */}
            <button
              onClick={() => onTabChange("ai-saver")}
              className={`p-2 rounded-full cursor-pointer relative hover:bg-emerald-50 text-emerald-800 transition-colors ${
                currentTab === "ai-saver" ? "bg-emerald-100" : ""
              }`}
              title="AI Smart Saver Assistant"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
            </button>

            {/* Notifications Trigger */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-[#00234e] hover:bg-slate-200/50 rounded-full transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#E31E24] rounded-full animate-ping"></span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => onTabChange("cart")}
              className="p-2 text-[#00234e] hover:bg-slate-200/50 rounded-full transition-colors relative cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E31E24] text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#fbf9f5] shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => onTabChange("profile")}
              className="ml-2 w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-800 flex items-center justify-center shadow-sm cursor-pointer hover:opacity-85 transition-opacity"
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCESFr7dzPNBqU449PdjF-XH0pTeUl5-0LnTL3I-YwEKy_CP6vVEu0msa3yBgNnH5xGuQA9L4Sj7SnIZrTs3ZdepJ99DrZXdo_QzujEFD3YB_E51bEynzxGJbZI8k-ZdcFd2F99a-hAaBGHxwgSoczPutSC7R8fLPPnG4fVQ83s_lqGncoPMkSldI43F7FrEIgaSA8aB9sYZnkcAIWYEYVoYGNx6abmmJBSH96YkhXXcRxcR-CBoRkvIhA0kRRzBb0Q6_1usMAHBZc"
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Spacing height offset */}
      <div className="h-16"></div>

      {/* Navigation Drawer Slider */}
      <div
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      >
        <aside
          className={`fixed left-0 top-0 bottom-0 h-full w-80 bg-[#fdfbf7] border-r border-[#c3c6d1] shadow-2xl flex flex-col py-6 transform transition-transform duration-300 ease-in-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* User Profile Header in Drawer */}
          <div className="px-6 pb-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCESFr7dzPNBqU449PdjF-XH0pTeUl5-0LnTL3I-YwEKy_CP6vVEu0msa3yBgNnH5xGuQA9L4Sj7SnIZrTs3ZdepJ99DrZXdo_QzujEFD3YB_E51bEynzxGJbZI8k-ZdcFd2F99a-hAaBGHxwgSoczPutSC7R8fLPPnG4fVQ83s_lqGncoPMkSldI43F7FrEIgaSA8aB9sYZnkcAIWYEYVoYGNx6abmmJBSH96YkhXXcRxcR-CBoRkvIhA0kRRzBb0Q6_1usMAHBZc"
                  alt="Anandhu K."
                  className="w-14 h-14 rounded-full border-2 border-emerald-800 object-cover shadow-sm"
                />
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">{user.fullName}</h2>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Active Store Indicator Inside Drawer */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                Connected Store:
              </span>
              <p className="text-xs font-bold text-[#00234e] leading-snug">{activeStore.name}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{activeStore.nameMl}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id as AppTab);
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-200 text-[#00234e] font-bold border-l-4 border-emerald-800 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? "text-[#00234e]" : "text-slate-400"}`} />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold leading-tight">
                        {t(item.label, item.labelMl, user.language)}
                      </span>
                    </div>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-[#E31E24] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout Action footer */}
          <div className="px-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                onLogout();
                setDrawerOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors cursor-pointer text-left font-semibold text-sm"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              <span>Log Out / പുറത്തുകടക്കുക</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Notifications Drawer Modal Slider */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-[1px] transition-opacity duration-300 ${
          notificationsOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setNotificationsOpen(false)}
      >
        <div
          className={`fixed right-0 top-0 bottom-0 h-full w-80 sm:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col py-6 transform transition-transform duration-300 ease-in-out ${
            notificationsOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-[#00234e] text-base">
              Latest Alerts • അറിയിപ്പുകൾ
            </h3>
            <button
              onClick={() => setNotificationsOpen(false)}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No new alerts</p>
              </div>
            ) : (
              notifications.map((n) => {
                let bgClass = "bg-slate-50 border-slate-200";
                let textClass = "text-slate-800";
                let badgeClass = "";
                
                if (n.type === "alert") {
                  bgClass = "bg-red-50 border-red-100";
                  textClass = "text-[#E31E24]";
                  badgeClass = "bg-[#E31E24]";
                } else if (n.type === "offer") {
                  bgClass = "bg-amber-50 border-amber-100";
                  textClass = "text-amber-800";
                }
                
                return (
                  <div key={n.id} className={`p-3 border rounded-xl relative ${bgClass}`}>
                    {n.type === "alert" && (
                      <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${badgeClass}`}></span>
                    )}
                    <p className={`font-bold text-xs ${textClass}`}>{n.title}</p>
                    <p className="text-xs text-slate-700 mt-1 font-semibold">
                      {n.message}
                    </p>
                    {n.createdAt && (
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
