import { useState } from "react";
import { Search, ChevronLeft, Plus, Sparkles } from "lucide-react";
import { Product, AppTab, CartItem, UserProfile, Offer } from "../types";
import { t } from "../utils/lang";
import { calculateProductPrice, SoccerTeamState } from "../utils/pricing";
import CountdownTimer from "./CountdownTimer";

interface VegetablesListingProps {
  user: UserProfile;
  onTabChange: (tab: AppTab) => void;
  cart: CartItem[];
  addToCart: (product: Product, qty: number) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  soccerTeams: SoccerTeamState[];
  products: Product[];
  offers: Offer[];
}

export default function VegetablesListing({
  user,
  onTabChange,
  cart,
  addToCart,
  updateCartQty,
  soccerTeams,
  products,
  offers
}: VegetablesListingProps) {
  const [search, setSearch] = useState("");
  const [activeChip, setActiveChip] = useState("All Items");

  const subFilters = ["All Items", "Subsidy Eligible", "Organic", "Leafy Greens"];

  const getProductCartQty = (productId: string): number => {
    const item = cart.find((c) => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  const vegProducts = products.filter((p) => p.category === "vegetables");

  const filteredProducts = vegProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) || p.nameMl.includes(search);

    if (!matchesSearch) return false;

    if (activeChip === "Subsidy Eligible") {
      return p.isSubsidy;
    }
    if (activeChip === "Organic") {
      return p.name === "Carrot" || p.name === "Tomato";
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onTabChange("home")}
          className="text-[#00234e] hover:opacity-80 transition-opacity p-2 -ml-2 rounded-full cursor-pointer hover:bg-slate-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="font-extrabold text-lg text-[#00234e] text-center flex-1 max-w-[70%]">
          {t("Vegetable Listing", "പച്ചക്കറികൾ", user.language)}
        </h2>
        <div className="w-10"></div> {/* Spacer balance */}
      </div>

      {/* Internal Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("Search vegetables...", "പച്ചക്കറികൾ തിരയുക...", user.language)}
          className="w-full bg-white border border-[#c3c6d1] rounded-full pl-11 pr-4 py-3 placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
        />
      </div>

      {/* Horizontal Subcategory scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4">
        {subFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveChip(filter)}
            className={`flex-shrink-0 snap-start px-4 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
              activeChip === filter
                ? "bg-[#00234e] text-white border-[#00234e]"
                : "bg-white text-slate-600 border-[#c3c6d1] hover:bg-slate-50"
            }`}
          >
            {filter === "All Items" ? t("All Items", "എല്ലാം", user.language) :
             filter === "Subsidy Eligible" ? t("Subsidy Eligible", "സബ്സിഡി ഉള്ളത്", user.language) :
             filter === "Organic" ? t("Organic", "ജൈവം", user.language) : filter}
          </button>
        ))}
      </div>

      {/* Grid listing */}
      {filteredProducts.length === 0 ? (
        <div className="text-center p-8 bg-white border border-dashed border-[#c3c6d1] rounded-2xl text-slate-400 text-sm font-semibold">
          {t("No vegetables matched active query filters.", "പച്ചക്കറികൾ ഒന്നും കണ്ടെത്താനായില്ല.", user.language)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const qtyInCart = getProductCartQty(p.id);
            const priceInfo = calculateProductPrice(p, offers, soccerTeams);

            return (
              <article
                key={p.id}
                className="bg-white rounded-xl border border-[#eae2de] shadow-[0_4px_12px_rgba(0,35,78,0.02)] overflow-hidden flex flex-col h-full relative"
              >
                {/* Special subsidy indicator on top */}
                {p.isSubsidy && (
                  <div className="absolute top-2 left-2 z-10 bg-[#E31E24]/10 text-[#E31E24] px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-[#E31E24]/20 backdrop-blur-sm">
                    {t("Subsidy", "സബ്സിഡി", user.language)}
                  </div>
                )}

                {/* Photo container */}
                <div className="bg-[#F2EEE6] aspect-square p-4 flex items-center justify-center relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain mix-blend-multiply hover:scale-105 duration-300 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Title & Cart actions */}
                <div className="p-3 flex flex-col flex-1 bg-white">
                  <h3 className="font-extrabold text-sm leading-tight text-[#00234e] line-clamp-1">
                    {user.language === "malayalam" ? p.nameMl : p.name}
                  </h3>
                  <h4 className="text-xs text-slate-500 font-semibold mb-2 h-7">{t("", p.nameMl, user.language)}</h4>

                  {/* Countdown Timer - Clean Integrated position below title details */}
                  {priceInfo.isOfferActive && priceInfo.offerExpiresAt && (
                    <div className="mb-2 scale-[0.95] origin-left">
                      <CountdownTimer expiresAt={priceInfo.offerExpiresAt} language={user.language} />
                    </div>
                  )}

                  <div className="mt-auto space-y-2">
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        / {p.unit}
                      </span>
                      
                      {/* Price points 3-tier visual hierarchy layout */}
                      <div className="space-y-0.5 pt-1">
                        {/* Tier 1: Real MRP */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 leading-none">
                          <span className="font-bold tracking-wider uppercase text-[8px]">Real MRP:</span>
                          <span className="line-through font-semibold">₹{priceInfo.realMrp.toFixed(2)}</span>
                        </div>

                        {/* Tier 2: Supplyco MRP */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-650 leading-none">
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
                    </div>

                    {/* Total Money Saved label positioned exactly ABOVE the Add to Cart button */}
                    {priceInfo.savings > 0 && (
                      <div className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 text-center uppercase tracking-wider w-full flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-650 shrink-0" />
                        <span>Save ₹{priceInfo.savings.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Quantity modifier controls */}
                    {p.inStock && (
                      <div className="flex items-center gap-1">
                        {qtyInCart > 0 ? (
                          <div className="flex items-center bg-slate-100 border border-[#c3c6d1] rounded-lg overflow-hidden w-full h-9">
                            <button
                              onClick={() => updateCartQty(p.id, qtyInCart - 1)}
                              className="w-8 h-full flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center font-bold text-[#00234e] text-xs">
                              {qtyInCart}
                            </span>
                            <button
                              onClick={() => updateCartQty(p.id, qtyInCart + 1)}
                              className="w-8 h-full flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200 cursor-pointer"
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
                            className="bg-[#00234e] hover:opacity-90 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 w-full cursor-pointer transition-opacity"
                          >
                            <Plus className="w-3.5 h-3.5" />
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
    </div>
  );
}
