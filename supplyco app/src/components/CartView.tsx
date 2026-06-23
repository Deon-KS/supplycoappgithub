import { useState } from "react";
import { Trash2, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft, ShoppingBag } from "lucide-react";
import { Product, AppTab, CartItem, UserProfile } from "../types";
import { t } from "../utils/lang";
import { SoccerTeamState } from "../utils/pricing";

interface CartViewProps {
  user: UserProfile;
  onTabChange: (tab: AppTab) => void;
  cart: CartItem[];
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  soccerTeams?: SoccerTeamState[];
}

export default function CartView({
  user,
  onTabChange,
  cart,
  updateCartQty,
  removeFromCart,
  clearCart,
  soccerTeams,
}: CartViewProps) {
  const [checkoutStep, setCheckoutStep] = useState<"review" | "success">("review");
  const [rationCardNo, setRationCardNo] = useState(user.rationCardNumber || "1612059384");
  const [rationType, setRationType] = useState(
    user.rationCardType === "AAY"
      ? "Yellow (AAY)"
      : user.rationCardType === "PHH"
      ? "Pink (PHH)"
      : user.rationCardType === "NPS"
      ? "Blue (NPS)"
      : "White (Non-Priority)"
  );

  const cartTotalMrp = cart.reduce((acc, item) => acc + item.product.mrp * item.quantity, 0);
  const cartTotalSelling = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const subsidySavings = cartTotalMrp - cartTotalSelling;

  const estimatedTax = cartTotalSelling * 0.05;
  const handlingFee = cart.length > 0 ? 10.0 : 0.0;
  const totalPayable = cartTotalSelling + estimatedTax + handlingFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutStep("success");
  };

  const handleFinishCheckout = () => {
    clearCart();
    setCheckoutStep("review");
    onTabChange("home");
  };

  if (checkoutStep === "success") {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 space-y-6 text-center animate-[fadeIn_0.4s_ease-out] shadow-md relative overflow-hidden text-slate-800">
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 bg-[#E31E24] text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-sm">
          {t("Audit Passed", "പരിശോധിച്ചു", user.language)}
        </div>

        <div className="flex flex-col items-center space-y-3 pt-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-scale-up text-emerald-800" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 leading-tight">
            {t("Checkout Verified!", "ചെക്ക്ഔട്ട് പൂർത്തിയായി!", user.language)}
          </h2>
          <h3 className="text-sm font-semibold text-emerald-800 leading-none">സിവിൽ സപ്ലൈസ് അംഗീകാരം</h3>
        </div>

        {/* Receipt Slip widget */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left font-sans space-y-3 relative shadow-inner text-slate-700">
          <p className="text-center font-bold text-[10px] text-slate-400 uppercase tracking-widest border-b border-dashed border-slate-300 pb-2">
            {t("Kerala Ration Slip Summary", "കേരള റേഷൻ വിവരങ്ങൾ", user.language)}
          </p>

          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-semibold">{t("Ration Card No:", "റേഷൻ കാർഡ് നമ്പർ:", user.language)}</span>
            <span className="font-bold text-slate-800 font-mono">KL-{rationCardNo}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-semibold">{t("Card Category:", "വിഭാഗം:", user.language)}</span>
            <span className="font-bold text-slate-800">{rationType}</span>
          </div>
          <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-semibold">{t("Outlet Allocated:", "സ്റ്റോർ വിലാസം:", user.language)}</span>
            <span className="font-bold text-[#00234e]">East Fort Maveli (TVM)</span>
          </div>

          {/* Items breakdown in receipt */}
          <div className="space-y-1 pt-1">
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between text-xs font-semibold text-slate-600">
                <span>
                  {user.language === "malayalam" ? item.product.nameMl : item.product.name} (x{item.quantity})
                </span>
                <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-300 pt-3 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>{t("Standard Market Cost:", "സാധാരണ വിപണി വില:", user.language)}</span>
              <span>₹{cartTotalMrp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-extrabold text-[#E31E24]">
              <span>{t("Government Discount:", "സർക്കാർ സബ്സിഡി ഇളവ്:", user.language)}</span>
              <span>- ₹{subsidySavings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-800 border-t border-slate-200 pt-2">
              <span className="text-base text-emerald-800">{t("Ration Total:", "അടക്കേണ്ടത് (റേഷൻ നിരക്ക്):", user.language)}</span>
              <span className="text-base font-black text-emerald-800">₹{totalPayable.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 font-semibold flex gap-2 items-center text-left">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-800" />
          <span>
            {t(
              "Present this digital ration slip at the counter of East Fort Maveli Supermarket to secure your items immediately.",
              "ഈ ഡിജിറ്റൽ റേഷൻ സ്ലിപ്പ് ഈസ്റ്റ് ഫോർട്ട് മാവേലി സൂപ്പർമാർക്കറ്റ് കൗണ്ടറിൽ കാണിച്ച് നിങ്ങളുടെ സാധനങ്ങൾ വാങ്ങുക.",
              user.language
            )}
          </span>
        </div>

        <button
          onClick={handleFinishCheckout}
          className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{t("Finish & Back Home", "പൂർത്തിയാക്കി ഹോമിലേക്ക് പോകുക", user.language)}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onTabChange("home")}
          className="text-[#00234e] hover:opacity-85 transition-opacity p-2 -ml-2 rounded-full cursor-pointer hover:bg-slate-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="font-extrabold text-lg text-[#00234e] text-center flex-1 max-w-[70%]">
          {t("Review Cart", "കാർട്ട് പരിശോധിക്കുക", user.language)}
        </h2>
        <div className="w-10"></div>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl flex flex-col items-center space-y-4 border border-slate-100">
          <div className="p-4 bg-slate-100 rounded-full text-slate-400 shadow-inner">
            <ShoppingBag className="w-10 h-10 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-850 text-sm">{t("Your Cart is Empty", "കാർട്ട് ശൂന്യമാണ്", user.language)}</h3>
            <p className="text-xs text-slate-500">{t("No items found inside your digital purchase wallet.", "നിങ്ങളുടെ കാർട്ടിൽ സാധനങ്ങൾ ഒന്നും തന്നെയില്ല.", user.language)}</p>
          </div>
          <button
            onClick={() => onTabChange("home")}
            className="bg-[#00234e] text-white hover:opacity-95 px-6 py-2.5 rounded-full text-xs font-bold leading-none cursor-pointer shadow-sm"
          >
            {t("Start Shopping", "വാങ്ങാൻ തുടങ്ങുക", user.language)}
          </button>
        </div>
      ) : (
        <>
          {/* Metadata banner headers */}
          <section className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-amber-900/10 shadow-[0_4px_12px_rgba(0,35,78,0.03)] text-center divide-x divide-slate-100 select-none text-slate-705">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                {t("Items", "ഇനങ്ങൾ", user.language)}
              </span>
              <span className="text-sm font-black text-slate-800">{cart.length} {t("Types", "ഇനങ്ങൾ", user.language)}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-[#E31E24] font-bold uppercase tracking-wider mb-1">
                {t("Savings", "ലാഭം", user.language)}
              </span>
              <span className="text-sm font-black text-[#E31E24]">₹{subsidySavings.toFixed(0)}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Market MRP
              </span>
              <span className="text-sm font-bold text-slate-500 line-through">₹{cartTotalMrp.toFixed(0)}</span>
            </div>
          </section>

          {/* List items block */}
          <section className="space-y-3">
            {cart.map((item) => {
              const itemTotalMrp = item.product.mrp * item.quantity;
              const itemTotalSelling = item.product.price * item.quantity;
              const isSubsidy = item.product.isSubsidy;

              return (
                <article
                  key={item.product.id}
                  className="flex gap-4 bg-white p-4 rounded-2xl border border-amber-900/10 shadow-sm relative overflow-hidden text-slate-800"
                >
                  {/* Category left decorative divider strip */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
                      isSubsidy ? "bg-[#E31E24]" : "bg-emerald-800"
                    }`}
                  ></div>

                  {/* Photo area container */}
                  <div className="w-20 h-20 shrink-0 bg-[#F2EEE6] rounded-xl overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="object-contain w-full h-full mix-blend-multiply opacity-95"
                    />
                  </div>

                  {/* Right side info block */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <h3 className="font-extrabold text-slate-800 text-sm leading-tight">
                            {user.language === "malayalam" ? item.product.nameMl : item.product.name}
                          </h3>
                          <span className="text-xs text-slate-400 font-semibold">
                            {t("", item.product.nameMl, user.language)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-[#E31E24] cursor-pointer transition-colors p-1 -mr-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-slate-800">
                          ₹{item.product.price.toFixed(2)}
                          <span className="text-[10px] text-slate-400 font-normal">/{item.product.unit}</span>
                        </span>
                        {isSubsidy && (
                          <span className="bg-[#E31E24]/10 text-[#E31E24] px-1.5 py-0.5 rounded text-[9px] font-bold border border-[#E31E24]/20 uppercase">
                            {t("Subsidy", "സബ്സിഡി", user.language)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity modifiers in cart row */}
                    <div className="flex justify-between items-end mt-4 pt-2 border-t border-slate-100">
                      <div className="flex items-center bg-slate-50 border border-[#c3c6d1] rounded-lg overflow-hidden h-8 w-24">
                        <button
                          onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                          className="w-7 h-full flex items-center justify-center text-slate-600 font-bold hover:bg-slate-200 cursor-pointer text-xs"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center font-bold text-slate-705 text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                          className="w-7 h-full flex items-center justify-center text-slate-600 font-bold hover:bg-slate-200 cursor-pointer text-xs"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase leading-none">
                          {t("Subtotal", "ആകെ തുക", user.language)}
                        </span>
                        <span className="font-extrabold text-slate-800 text-sm">
                          ₹{itemTotalSelling.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Ration card settings widget */}
          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-sans shadow-inner text-slate-800">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest leading-none">
              {t("Family Electronic Ration Card Setup", "റേഷൻ കാർഡ് വിവരങ്ങൾ", user.language)}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">KL {t("Ration Card Number", "റേഷൻ കാർഡ് നമ്പർ", user.language)}</span>
                <input
                  type="text"
                  value={rationCardNo}
                  onChange={(e) => setRationCardNo(e.target.value)}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold font-mono text-slate-850 uppercase focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{t("Card Category Type", "കാർഡ് വിഭാഗം", user.language)}</span>
                <select
                  value={rationType}
                  onChange={(e) => setRationType(e.target.value)}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-750 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="Yellow (AAY)">Yellow (Antyodaya Anna Yojana - AAY / മഞ്ഞ)</option>
                  <option value="Pink (PHH)">Pink (Priority Household - PHH / പിങ്ക്)</option>
                  <option value="Blue (NPS)">Blue (Non-Priority Subsidized - NPS / നീല)</option>
                  <option value="White (Non-Priority)">White (Non-Priority Non-Subsidized / വെള്ള)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Bottom Billing Sheet block */}
          <section className="bg-[#efeeea]/60 p-5 rounded-2xl border border-amber-900/10 text-slate-800">
            <h3 className="font-extrabold text-[#00234e] text-sm mb-4 border-b border-[#c3c6d1] pb-2 flex justify-between tracking-wide">
              <span>{t("Bill Summary", "ബിൽ സംഗ്രഹം", user.language)}</span>
            </h3>

            <div className="flex flex-col gap-2 border-b border-dashed border-[#c3c6d1] pb-4">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>{t("Standard Market Cost", "വിപണി വില", user.language)}</span>
                <span>₹{cartTotalMrp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-extrabold text-[#E31E24]">
                <span>{t("Subsidy Welfare Discount", "സബ്സിഡി കിഴിവ്", user.language)}</span>
                <span>- ₹{subsidySavings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>{t("Estimated Civil Tax (5%)", "നികുതി (5%)", user.language)}</span>
                <span>₹{estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>{t("Store Handling Fee", "സ്റ്റോർ ഹാൻഡ്‌ലിങ് നിരക്ക്", user.language)}</span>
                <span>₹{handlingFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-[#00234e]">{t("Total Payable", "ആകെ അടക്കേണ്ട തുക", user.language)}</span>
              </div>
              <span className="text-2xl font-black text-[#00234e]">₹{totalPayable.toFixed(2)}</span>
            </div>

            {/* Simulated secure Checkout action */}
            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-emerald-800 hover:bg-emerald-950 text-white py-4 rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>{t("Proceed to Verify Checkout", "വാങ്ങാനായി മുന്നോട്ട് പോകുക", user.language)}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </section>
        </>
      )}
    </div>
  );
}
