import { ChevronLeft, ShoppingCart, Plus, Sparkles } from "lucide-react";
import { Product, AppTab, CartItem, UserProfile, Offer } from "../types";
import { t } from "../utils/lang";
import { calculateProductPrice, SoccerTeamState } from "../utils/pricing";
import CountdownTimer from "./CountdownTimer";

interface SabariBrandsProps {
  user: UserProfile;
  onTabChange: (tab: AppTab) => void;
  cart: CartItem[];
  addToCart: (product: Product, qty: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  soccerTeams: SoccerTeamState[];
  onUpdateSoccerTeams: (teams: SoccerTeamState[]) => void;
  products: Product[];
  offers: Offer[];
}

export default function SabariBrands({
  user,
  onTabChange,
  cart,
  addToCart,
  updateCartQty,
  soccerTeams,
  onUpdateSoccerTeams,
  products,
  offers
}: SabariBrandsProps) {
  const getProductCartQty = (productId: string): number => {
    const item = cart.find((c) => hCheckId(c.product.id) === hCheckId(productId));
    return item ? item.quantity : 0;
  };

  // Safe case helper for consistent matches
  const hCheckId = (s: string) => s.trim().toLowerCase();

  const sabariProducts = products.filter((p) => p.category === "sabari");

  // Define featured tea
  const featuredTea = sabariProducts.find((p) => p.id === "sab_tea") || sabariProducts[0];
  const standardSpices = sabariProducts.filter((p) => p.id !== featuredTea?.id);

  const featuredPriceInfo = calculateProductPrice(featuredTea, offers, soccerTeams);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Top Header */}
      <header className="flex justify-between items-center w-full">
        <button
          onClick={() => onTabChange("home")}
          className="p-2 -ml-2 text-[#00234e] hover:opacity-85 transition-opacity rounded-full focus:outline-none hover:bg-slate-100 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center flex-1">
          <h1 className="font-bold text-lg text-slate-800">
            {t("Sabari Brands", "ശബരി ബ്രാൻഡുകൾ", user.language)}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t("Official High-Quality Essentials by Supplyco", "സപ്ലൈകോയുടെ ഔദ്യോഗിക ഗുണമേന്മയുള്ള ഉൽപ്പന്നങ്ങൾ", user.language)}
          </p>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </header>
      {/* Asymmetric Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
        
        {/* Featured Card (Spans 8 columns on desktop) */}
        {featuredTea && (
          <div className="md:col-span-8 bg-white rounded-2xl border border-[#eae2de] shadow-sm overflow-hidden group flex flex-col sm:flex-row h-full relative">
            
            {/* Image Area */}
            <div className="sm:w-1/2 p-4 bg-[#efeeea] flex flex-col justify-center items-center relative">
              <span className="absolute top-4 left-4 bg-emerald-800 text-white font-bold text-[10px] px-3 py-1 rounded-full flex items-center gap-1 z-10 select-none shadow-sm uppercase tracking-wide">
                Premium Choice
              </span>
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-white shadow-inner p-4 flex items-center justify-center">
                <img
                  src={featuredTea.image}
                  alt={featuredTea.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="sm:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block mb-1">
                  {featuredTea.subCategory || "Beverages"}
                </span>
                <div className="flex flex-col gap-1 mb-3">
                  <h3 className="font-extrabold text-lg text-slate-800 leading-snug">
                    {user.language === "malayalam" ? featuredTea.nameMl : featuredTea.name}
                  </h3>
                  <h4 className="text-xs font-semibold text-emerald-850 leading-none">{t("", featuredTea.nameMl, user.language)}</h4>
                </div>

                {/* Countdown Timer - Clean Integrated position below title */}
                {featuredPriceInfo.isOfferActive && featuredPriceInfo.offerExpiresAt && (
                  <div className="mb-3 scale-[0.95] origin-left">
                    <CountdownTimer expiresAt={featuredPriceInfo.offerExpiresAt} language={user.language} />
                  </div>
                )}

                <p className="text-xs text-slate-500 leading-relaxed">
                  {featuredTea.description ||
                    "Finest quality tea dust sourced from premium estates, ensuring a strong and refreshing cup."}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="bg-slate-100 text-slate-600 font-bold text-[10px] border border-slate-200 px-3 py-1 rounded-full">
                    {featuredTea.unit}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-100 px-3 py-1 rounded-full">
                    Premium Tea
                  </span>
                </div>
              </div>

              {/* Price Row and Cart Modifier */}
              <div className="border-t border-slate-100 pt-4 mt-6 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Tier 1: Real MRP */}
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="font-bold uppercase text-[9px]">Real MRP:</span>
                    <span className="line-through font-bold">₹{featuredPriceInfo.realMrp.toFixed(2)}</span>
                  </div>

                  {/* Tier 2: Supplyco MRP */}
                  <div className="flex items-center gap-1.5 text-slate-650">
                    <span className="font-bold uppercase text-[9px]">Supplyco:</span>
                    <span className={`font-bold ${featuredPriceInfo.isOfferActive ? "line-through text-slate-400" : "text-[#00234e]"}`}>
                      ₹{featuredPriceInfo.supplycoMrp.toFixed(2)}
                    </span>
                  </div>

                  {/* Tier 3: Offer Price */}
                  {featuredPriceInfo.isOfferActive && (
                    <div className="col-span-2 flex items-center gap-2 text-[#E31E24] pt-0.5">
                      <span className="font-bold uppercase text-[9px]">Promo Offer Price:</span>
                      <span className="font-black text-sm animate-pulse text-[#E31E24]">
                        ₹{featuredPriceInfo.offerPrice?.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Soccer Eleven active extra discounts display */}
                  {featuredPriceInfo.soccerDiscountPct > 0 && (
                    <div className="col-span-2 text-[10px] font-bold text-center bg-emerald-900/10 text-emerald-800 rounded px-2 py-0.5 border border-emerald-100 uppercase tracking-widest leading-none pt-1">
                      🔥 Soccer Eleven: -{featuredPriceInfo.soccerDiscountPct}% Extra Cash Off! (Saved ₹{featuredPriceInfo.soccerDiscountAmt.toFixed(2)})
                    </div>
                  )}
                </div>

                {/* Total Money Saved label positioned exactly ABOVE the Add to Cart button */}
                {featuredPriceInfo.savings > 0 && (
                  <div className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-100 text-center uppercase tracking-wider w-full flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-650 shrink-0" />
                    <span>Save ₹{featuredPriceInfo.savings.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-1 mt-1">
                  <div className="flex flex-col text-slate-850">
                    <span className="text-[8px] uppercase tracking-wide font-bold text-slate-400 leading-none">Net Cost</span>
                    <span className="text-lg font-black text-[#E31E24] leading-tight">
                      ₹{featuredPriceInfo.finalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Cart modifier */}
                  {getProductCartQty(featuredTea.id) > 0 ? (
                    <div className="flex items-center bg-slate-100 border border-[#c3c6d1] rounded-xl overflow-hidden w-28 h-9 shadow-sm shrink-0 ml-auto">
                      <button
                        onClick={() => updateCartQty(featuredTea.id, getProductCartQty(featuredTea.id) - 1)}
                        className="w-9 h-full flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-bold text-[#00234e] text-xs">
                        {getProductCartQty(featuredTea.id)}
                      </span>
                      <button
                        onClick={() => updateCartQty(featuredTea.id, getProductCartQty(featuredTea.id) + 1)}
                        className="w-9 h-full flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const dynamicProduct = { ...featuredTea, price: featuredPriceInfo.finalPrice };
                        addToCart(dynamicProduct, 1);
                      }}
                      className="bg-[#ffdea2] hover:bg-[#f1bf54] text-[#261900] font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto"
                    >
                      <ShoppingCart className="w-4 h-4 text-[#261900]" />
                      <span>{t("Add", "ചേർക്കുക", user.language)}</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Standard Bento grid columns (Spans 4 columns each on desktop) */}
        {standardSpices.map((p) => {
          const qtyInCart = getProductCartQty(p.id);
          const priceInfo = calculateProductPrice(p, offers, soccerTeams);

          return (
            <div
              key={p.id}
              className="md:col-span-4 bg-white rounded-2xl border border-[#eae2de] p-4 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Optional New Pack badge */}
              {p.id === "sab_coriander" && (
                <span className="absolute top-2 left-2 z-10 bg-[#E31E24]/10 text-[#E31E24] font-bold text-[9px] px-2.5 py-0.5 rounded-full border border-[#E31E24]/20 backdrop-blur-sm select-none">
                  New Pack
                </span>
              )}

              {/* Photo Area */}
              <div className="bg-[#efeeea] rounded-xl aspect-[4/3] mb-4 flex items-center justify-center p-4 relative">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm hover:scale-105 duration-300 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Info details */}
              <div className="flex flex-col gap-1 flex-1">
                <h3 className="font-extrabold text-[#00234e] text-sm leading-tight line-clamp-1">
                  {user.language === "malayalam" ? p.nameMl : p.name}
                </h3>
                <h4 className="text-xs text-slate-500 font-semibold leading-tight line-clamp-1">{t("", p.nameMl, user.language)}</h4>

                {/* Countdown Timer - Clean Integrated position below title */}
                {priceInfo.isOfferActive && priceInfo.offerExpiresAt && (
                  <div className="my-1 scale-[0.95] origin-left">
                    <CountdownTimer expiresAt={priceInfo.offerExpiresAt} language={user.language} />
                  </div>
                )}

                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {p.unit}
                </p>
              </div>

              {/* Price and Add row */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="space-y-0.5 text-[11px]">
                  {/* Tier 1: Real MRP */}
                  <div className="flex items-center gap-1 text-slate-400 leading-none">
                    <span className="font-bold uppercase text-[7px] tracking-wider">Real MRP:</span>
                    <span className="line-through font-semibold">₹{priceInfo.realMrp.toFixed(2)}</span>
                  </div>

                  {/* Tier 2: Supplyco MRP */}
                  <div className="flex items-center gap-1 text-slate-650 leading-none">
                    <span className="font-bold uppercase text-[7px] tracking-wider">Supplyco MRP:</span>
                    <span className={`font-semibold ${priceInfo.isOfferActive ? "line-through text-slate-400" : "text-[#00234e] font-extrabold"}`}>
                      ₹{priceInfo.supplycoMrp.toFixed(2)}
                    </span>
                  </div>

                  {/* Tier 3: Offer Price (Scenario A vs B) */}
                  {priceInfo.isOfferActive && (
                    <div className="flex items-center gap-1 text-[#E31E24] leading-none pt-0.5">
                      <span className="font-bold uppercase text-[7px] tracking-wider">Offer Price:</span>
                      <span className="font-black text-[#E31E24] animate-pulse">
                        ₹{priceInfo.offerPrice?.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Soccer Eleven active extra discounts display */}
                  {priceInfo.soccerDiscountPct > 0 && (
                    <div className="text-[8px] font-bold bg-emerald-50 text-emerald-800 rounded px-1.5 py-0.5 border border-emerald-100 uppercase tracking-wide leading-none select-none block mt-1 w-fit">
                      Soccer Eleven: -{priceInfo.soccerDiscountPct}% Extra Off! (Saved ₹{priceInfo.soccerDiscountAmt.toFixed(2)})
                    </div>
                  )}
                </div>

                {/* Total Money Saved label positioned exactly ABOVE the Add to Cart button */}
                {priceInfo.savings > 0 && (
                  <div className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50/70 px-2 py-1 rounded border border-emerald-100 text-center uppercase tracking-wider w-full flex items-center justify-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-650 shrink-0" />
                    <span>Save ₹{priceInfo.savings.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-100">
                  <div className="flex flex-col text-slate-800">
                    <span className="text-[8px] uppercase font-bold text-slate-400 leading-none">Final Net</span>
                    <span className="text-base font-black text-[#E31E24] mt-0.5">
                      ₹{priceInfo.finalPrice.toFixed(2)}
                    </span>
                  </div>

                  {qtyInCart > 0 ? (
                    <div className="flex items-center bg-slate-50 border border-[#c3c6d1] rounded-xl overflow-hidden w-24 h-9 shadow-sm shrink-0 ml-auto">
                      <button
                        onClick={() => updateCartQty(p.id, qtyInCart - 1)}
                        className="w-7 h-full flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 cursor-pointer text-xs"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-extrabold text-[#00234e] text-xs">
                        {qtyInCart}
                      </span>
                      <button
                        onClick={() => updateCartQty(p.id, qtyInCart + 1)}
                        className="w-7 h-full flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 cursor-pointer text-xs"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const dynamicProduct = { ...p, price: priceInfo.finalPrice };
                        addToCart(dynamicProduct, 1);
                      }}
                      className="bg-[#ffdea2] hover:bg-[#f1bf54] text-[#261900] font-black text-[11px] px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 transition-all ml-auto shrink-0"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{t("Add", "ചേർക്കുക", user.language)}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
