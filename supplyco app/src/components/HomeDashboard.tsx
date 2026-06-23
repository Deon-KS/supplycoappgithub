import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { 
  Search, 
  MapPin, 
  Edit3, 
  ShoppingCart, 
  Info, 
  TrendingDown, 
  ArrowRight, 
  Sparkles,
  ShoppingBag,
  Leaf,
  Award,
  Layers,
  Plus
} from "lucide-react";
import { Product, UserProfile, AppTab, CartItem, Offer } from "../types";
import { STORES } from "../data";
import { t } from "../utils/lang";
import { calculateProductPrice, SoccerTeamState } from "../utils/pricing";
import { useLiveBanners } from "../hooks/useFirebaseData";
import CountdownTimer from "./CountdownTimer";

interface HomeDashboardProps {
  user: UserProfile;
  onTabChange: (tab: AppTab) => void;
  cart: CartItem[];
  addToCart: (product: Product, qty: number) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  soccerTeams: SoccerTeamState[];
  products: Product[];
  offers: Offer[];
}

export default function HomeDashboard({
  user,
  onTabChange,
  cart,
  addToCart,
  updateCartQty,
  soccerTeams,
  products,
  offers
}: HomeDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "subsidy" | "regular">("subsidy");

  const { banners: ads } = useLiveBanners();

  const [activeAdIndex, setActiveAdIndex] = useState(0);

  useEffect(() => {
    if (!ads || ads.length === 0) return;
    const interval = setInterval(() => {
      setActiveAdIndex((prev) => (prev + 1) % ads.length);
    }, 6000); // 6 seconds slow pace cycle
    return () => clearInterval(interval);
  }, [ads]);

  const activeStore = STORES.find((s) => s.id === user.activeStoreId) || STORES[0];

  // Helper to get cart quantity for inline modifiers
  const getProductCartQty = (productId: string): number => {
    const item = cart.find((c) => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Filtered products list shown in feed
  const feedProducts = products.filter((product) => {
    // Search query match (bilingual)
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameMl.includes(searchQuery);

    if (!matchesSearch) return false;

    // Subsidy filter
    if (filterType === "subsidy") return product.isSubsidy;
    if (filterType === "regular") return !product.isSubsidy;

    return true;
  });

  return (
    <div className="w-full space-y-8 animate-[fadeIn_0.4s_ease-out]">
      {/* Mobile Top equivalent Search Bar */}
      <div className="bg-[#fbf9f5] border border-amber-900/10 p-4 rounded-2xl shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00234e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Search items / products...", "സാധനങ്ങൾ തിരയുക...", user.language)}
            className="w-full bg-white border border-[#c3c6d1] rounded-xl pl-10 pr-4 py-3 placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm font-sans"
          />
        </div>

        {/* Location pill */}
        <div
          onClick={() => onTabChange("profile")}
          className="flex items-center gap-2 bg-[#eae8e4] text-[#00234e] hover:bg-slate-200 duration-150 rounded-full px-3 py-1.5 text-xs font-semibold w-fit cursor-pointer shadow-sm"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-800" />
          <span>{activeStore.name.replace("Supplyco Supermarket, ", "")} {t("Store", "സ്റ്റോർ", user.language)}</span>
          <Edit3 className="w-3 h-3 text-slate-500" />
        </div>
      </div>

      {/* Ad Monsoon Banners - Custom Looping Modern Slideshow */}
      {ads && ads.length > 0 && ads[activeAdIndex] && (
        <section 
          onClick={() => onTabChange(ads[activeAdIndex].tab as AppTab)}
          className="relative rounded-2xl overflow-hidden shadow-lg h-[210px] xs:h-[230px] sm:h-[250px] md:h-[280px] lg:h-[300px] bg-slate-950 flex items-center group cursor-pointer border border-emerald-950/20"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAdIndex}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full flex items-center"
            >
              {/* Soft Protective Overlay for beautiful contrast and legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent z-10 pointer-events-none"></div>
              <img
                alt={ads[activeAdIndex].title}
                className="w-full h-full object-cover absolute inset-0 transform scale-102 group-hover:scale-105 transition-transform duration-[6000ms] pointer-events-none"
                src={ads[activeAdIndex].img}
              />

              <div className="relative z-20 px-5 sm:px-12 md:px-16 max-w-[92%] sm:max-w-[75%] text-white select-none py-3 sm:py-6">
                <span className="bg-[#E31E24] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider py-1 px-3 rounded-full mb-1.5 sm:mb-3 inline-block animate-pulse">
                  {ads[activeAdIndex].tag}
                </span>
                <h2 className="text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow font-sans text-white leading-tight">
                  {ads[activeAdIndex].title}
                </h2>
                <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-slate-200 font-medium leading-relaxed mt-1 sm:mt-2 max-w-xl">
                  {ads[activeAdIndex].desc}
                </p>
                
                <div className="mt-2 sm:mt-4 flex items-center gap-1.5 text-[10px] sm:text-xs text-[#ffd166] font-bold group/btn">
                  <span>{user.language === "malayalam" ? "ഷോപ്പ് ചെയ്യൂ" : "Explore Offers"}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots Indicator Overlay */}
          <div className="absolute bottom-4 right-6 sm:right-12 z-20 flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-full backdrop-blur-sm">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAdIndex(i);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeAdIndex === i ? "bg-[#ffd166] w-6" : "bg-white/40 hover:bg-white/70 w-2"
                }`}
                title={`Offer ${i + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categories quick triggers (groceries, vegetables, sabari brands) */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center justify-between">
          <span>{t("Categories", "വിഭാഗങ്ങൾ", user.language)}</span>
          <span className="text-xs font-semibold text-slate-400">{t("Click to explore listings", "സാധനങ്ങൾ കാണാൻ തിരഞ്ഞെടുക്കുക", user.language)}</span>
        </h3>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Groceries Category */}
          <button
            onClick={() => onTabChange("groceries")}
            className="flex flex-col items-center gap-2 px-1.5 py-4 sm:p-5 bg-white border border-amber-900/10 hover:border-emerald-800 rounded-2xl shadow-sm text-center cursor-pointer group hover:bg-slate-50 transition-all font-sans w-full min-w-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200 shrink-0">
              <ShoppingBag className="w-5 h-5 text-emerald-850" />
            </div>
            <div className="w-full min-w-0 flex flex-col items-center justify-center">
              <span className="text-[10px] sm:text-xs font-extrabold text-[#00234e] leading-tight text-center break-words line-clamp-2 px-0.5 w-full block">
                {t("Groceries", "പലവ്യഞ്ജനങ്ങൾ", user.language)}
              </span>
            </div>
          </button>

          {/* Vegetables Category */}
          <button
            onClick={() => onTabChange("vegetables")}
            className="flex flex-col items-center gap-2 px-1.5 py-4 sm:p-5 bg-white border border-amber-900/10 hover:border-emerald-800 rounded-2xl shadow-sm text-center cursor-pointer group hover:bg-slate-50 transition-all font-sans w-full min-w-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-50 text-orange-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Leaf className="w-5 h-5 text-orange-700" />
            </div>
            <div className="w-full min-w-0 flex flex-col items-center justify-center">
              <span className="text-[10px] sm:text-xs font-extrabold text-[#00234e] leading-tight text-center break-words line-clamp-2 px-0.5 w-full block">
                {t("Vegetables", "പച്ചക്കറികൾ", user.language)}
              </span>
            </div>
          </button>

          {/* Sabari Brands Category */}
          <button
            onClick={() => onTabChange("sabari")}
            className="flex flex-col items-center gap-2 px-1.5 py-4 sm:p-5 bg-white border border-amber-900/10 hover:border-emerald-800 rounded-2xl shadow-sm text-center cursor-pointer group hover:bg-slate-50 transition-all font-sans w-full min-w-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50 text-[#E31E24] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Award className="w-5 h-5 text-[#E31E24]" />
            </div>
            <div className="w-full min-w-0 flex flex-col items-center justify-center">
              <span className="text-[10px] sm:text-xs font-extrabold text-[#00234e] leading-tight text-center break-words line-clamp-2 px-0.5 w-full block">
                {t("Sabari Brands", "ശബരി ഉൽപ്പന്നങ്ങൾ", user.language)}
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Feed Filters */}
      <section className="flex flex-col space-y-4">
        <div className="bg-[#efeeea] rounded-full p-1 flex w-full max-w-sm mx-auto shadow-inner">
          <button
            onClick={() => setFilterType("subsidy")}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer ${
              filterType === "subsidy"
                ? "bg-white text-emerald-800 shadow-sm border border-amber-900/10"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Subsidy / സബ്സിഡി
          </button>
          <button
            onClick={() => setFilterType("regular")}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer ${
              filterType === "regular"
                ? "bg-white text-emerald-800 shadow-sm border border-amber-900/10"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Regular / തനത് വില
          </button>
        </div>

        {/* Dynamic products list based on filters/search */}
        {feedProducts.length === 0 ? (
          <div className="text-center p-8 bg-white border border-dashed border-[#c3c6d1] rounded-2xl text-slate-400 text-sm font-semibold">
            No items matching active filter criteria. Seek on other pages above!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedProducts.map((p) => {
              const qtyInCart = getProductCartQty(p.id);
              const priceInfo = calculateProductPrice(p, offers, soccerTeams);

              return (
                <article
                  key={p.id}
                  className="bg-white rounded-xl border border-amber-900/10 shadow-[0_4px_12px_rgba(0,35,78,0.02)] hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden relative"
                >
                  {/* Photo area */}
                  <div className="relative aspect-square bg-[#F2EEE6] p-4 flex items-center justify-center">
                    {p.isSubsidy && (
                      <div className="absolute top-3 left-3 bg-[#E31E24]/10 text-[#E31E24] px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#E31E24]/20 backdrop-blur-sm z-10">
                        Subsidy Item
                      </div>
                    )}
                    <img
                      src={p.image}
                      alt={p.name}
                      className="object-contain w-full h-full mix-blend-multiply opacity-95 hover:scale-105 duration-300 transition-transform"
                    />
                    {!p.inStock && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-13">
                        <span className="bg-red-100 border border-red-200 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold leading-none shadow-sm">
                          Out of Stock / തീർന്നുപോയി
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Stats */}
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#00234e] leading-snug">
                          {user.language === "malayalam" ? p.nameMl : p.name}
                        </h4>
                        <span className="text-xs text-slate-500 font-semibold">{t("", p.nameMl, user.language)}</span>
                      </div>
                      <span className="text-[9px] bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded px-1.5 py-0.5 shrink-0 uppercase tracking-wide">
                        {p.unit}
                      </span>
                    </div>

                    {/* Countdown Timer - Clean Integrated position below title */}
                    {priceInfo.isOfferActive && priceInfo.offerExpiresAt && (
                      <div className="my-1 scale-[0.95] origin-left">
                        <CountdownTimer expiresAt={priceInfo.offerExpiresAt} language={user.language} />
                      </div>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-2 h-8 leading-relaxed">
                      {p.description || "Fresh and healthy essential sourced securely for standard consumers."}
                    </p>

                    {/* Aisle location */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{p.aisle}</span>
                    </div>

                    {/* Price and Cart controls */}
                    <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
                      {/* Price points 3-tier visual hierarchy layout */}
                      <div className="space-y-0.5">
                        {/* Tier 1: Real MRP */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 leading-none">
                          <span className="font-bold tracking-wider uppercase text-[8px]">Real MRP:</span>
                          <span className="line-through font-semibold">₹{priceInfo.realMrp.toFixed(2)}</span>
                        </div>

                        {/* Tier 2: Supplyco MRP */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 leading-none">
                          <span className="font-bold tracking-wider uppercase text-[8px]">Supplyco MRP:</span>
                          <span className={`font-semibold ${priceInfo.isOfferActive ? "line-through text-slate-400" : "text-[#00234e] text-xs font-extrabold"}`}>
                            ₹{priceInfo.supplycoMrp.toFixed(2)}
                          </span>
                        </div>

                        {/* Tier 3: Offer Price (Scenario A vs B) */}
                        {priceInfo.isOfferActive && (
                          <div className="flex items-center gap-1.5 text-[#E31E24] leading-none pt-0.5">
                            <span className="font-bold tracking-wider uppercase text-[8px]">Offer Price:</span>
                            <span className="font-black text-sm text-[#E31E24] animate-pulse">
                              ₹{priceInfo.offerPrice?.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Total Money Saved label positioned exactly ABOVE the Add to Cart button */}
                      {priceInfo.savings > 0 && (
                        <div className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 text-center uppercase tracking-wider w-full flex items-center justify-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-650 shrink-0" />
                          <span>Save ₹{priceInfo.savings.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Quantity Modifier Row */}
                      {p.inStock && (
                        <div className="flex items-center gap-2">
                          {qtyInCart > 0 ? (
                            <div className="flex items-center bg-slate-100 border border-[#c3c6d1] rounded-xl overflow-hidden w-28 shrink-0 h-10">
                              <button
                                onClick={() => updateCartQty(p.id, qtyInCart - 1)}
                                className="w-9 h-full flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="flex-1 text-center font-bold text-[#00234e] text-sm">
                                {qtyInCart}
                              </span>
                              <button
                                onClick={() => updateCartQty(p.id, qtyInCart + 1)}
                                className="w-9 h-full flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                // Bind dynamic final purchasing price when adding to cart
                                const dynamicProduct = { ...p, price: priceInfo.finalPrice };
                                addToCart(dynamicProduct, 1);
                              }}
                              className="w-full h-10 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>{t("Add", "ചേർക്കുക", user.language)}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Direct AI Assistance Box banner */}
      <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans max-w-3xl mx-auto shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-white rounded-2xl text-emerald-800 shadow-sm border border-emerald-100">
            <Sparkles className="w-6 h-6 text-emerald-850" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-emerald-950 text-base leading-tight">
              {t("Kerala's First AI Smart Saver Assistant", "കേരളത്തിലെ ആദ്യത്തെ AI സ്മാർട്ട് സേവർ അസിസ്റ്റന്റ്", user.language)}
            </h4>
            <p className="text-xs text-emerald-800 font-semibold leading-relaxed max-w-md">
              {t("Ask our Smart AI bot to draft Malayalam budget recipes using your actual cart items or discover high-yield subsidy secrets!", "നിങ്ങളുടെ കാർട്ടിലെ സാധനങ്ങൾ ഉപയോഗിച്ച് ബജറ്റ് പാചകക്കുറിപ്പുകൾ തയാറാക്കാനോ സബ്സിഡി വിവരങ്ങൾ കണ്ടെത്താനോ ഞങ്ങളുടെ സ്മാർട്ട് AI ബോട്ടിനോട് ചോദിക്കൂ!", user.language)}
            </p>
          </div>
        </div>
        <button
          onClick={() => onTabChange("ai-saver")}
          className="bg-emerald-800 text-white hover:bg-emerald-950 px-5 py-3 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
        >
          <span>{t("Ask Savior", "ചോദിക്കുക", user.language)}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>
    </div>
  );
}
