import React, { useState } from "react";
import { Mail, Lock, User, Calendar, MapPin, Map, Store, ShieldAlert, ShoppingBag, ShieldCheck } from "lucide-react";
import { UserProfile, StoreLocation } from "../types";
import { STORES, INITIAL_USER } from "../data";
import { auth, db } from "../utils/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface LoginRegisterProps {
  onAuthenticated: (user: UserProfile) => void;
}

export default function LoginRegister({ onAuthenticated }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [place, setPlace] = useState("");
  const [stateValue, setStateValue] = useState("KL");
  const [zone, setZone] = useState("");
  const [selectedStore, setSelectedStore] = useState("tvm_eastfort");
  const [phone, setPhone] = useState("");
  const [rationCardNumber, setRationCardNumber] = useState("");
  const [rationCardType, setRationCardType] = useState<"AAY" | "PHH" | "NPS" | "NPNS">("PHH");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all credentials. / ദയവായി വിവരങ്ങൾ പൂരിപ്പിക്കുക.");
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists()) {
        onAuthenticated(userDoc.data() as UserProfile);
      } else {
        // Fallback for missing profile
        const fallbackUser: UserProfile = {
          ...INITIAL_USER,
          email,
          fullName: email.split("@")[0]
        };
        onAuthenticated(fallbackUser);
      }
    } catch (err: any) {
      setError("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !selectedStore || !password) {
      setError("All highlighted fields are required. / പ്രധാനപ്പെട്ട വിവരങ്ങൾ നൽകുക.");
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const newUser: UserProfile = {
        fullName,
        email,
        phone,
        dob,
        addressLine1: "",
        city: place,
        district: "",
        state: stateValue === "KL" ? "Kerala" : "Other State",
        pincode: "",
        isVerified: true,
        activeStoreId: selectedStore,
        notificationsEnabled: true,
        theme: "vintage",
        language: "bilingual",
        rationCardNumber: rationCardNumber || undefined,
        rationCardType: rationCardNumber ? rationCardType : undefined
      };
      
      // Save profile to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), newUser);
      
      onAuthenticated(newUser);
    } catch (err: any) {
      setError("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center justify-center relative font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>

      <div className="w-full max-w-xl bg-white rounded-3xl border border-amber-900/10 shadow-[0_8px_30px_rgb(0,35,78,0.04)] relative z-10 p-8 sm:p-10 flex flex-col items-center">
        {/* Toggle Switch */}
        <div className="absolute top-6 right-6 flex bg-slate-100 rounded-full p-1 border border-slate-200">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
              isLogin ? "bg-emerald-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
              !isLogin ? "bg-emerald-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Register
          </button>
        </div>

        {/* Brand Seal Header */}
        <div className="w-full flex justify-center mb-6 mt-4">
          <img
            alt="Supplyco Kerala Logo"
            className="h-28 w-auto object-contain drop-shadow-sm filter contrast-125 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR1MiUKL8177TfurirFvVZ3gHpMYoRq0ugOeFjbGoatCWvQbd3YZGBq5QVJA3BT_GneoS99zPsbAzBIr8NpShFjLIABfW0dZzvh35YJ9FGPBM4qICB_PDv1SuwAUkBc0rVGGCi4PxpY59xzG-arvrZOtIvUZ1ShEZOFu6HH0NeUdxTlqJKjaEPDhl99sF961RRLHAfIDbcB6u4mshfFywsvUhpgvmqQCiPqEmB1wZGDjlX-EGLNJcMhky8D1NMfM-9LGFg5TkjYaw"
          />
        </div>

        <div className="text-center w-full mb-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <h3 className="text-lg font-semibold text-emerald-800">
            {isLogin ? "തിരികെ സ്വാഗതം" : "അക്കൗണ്ട് സൃഷ്ടിക്കുക"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin
              ? "Securely sign in to optimize your family rations and track prices."
              : "Register your family digital ratio profile to enjoy local government subsidy discounts."}
          </p>
        </div>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2 items-center">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="email-login">
                <span>Email Address / ഇമെയിൽ വിലാസം</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email-login"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="pw-login">
                <span>Password / പാസ്‌വേഡ്</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="pw-login"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => alert("Simulated password reset email sent to your address.")}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Forgot Password? / പാസ്‌വേഡ് മറന്നോ?
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Login</span>
              <span className="w-1 h-1 rounded-full bg-white opacity-60"></span>
              <span>ലോഗിൻ</span>
            </button>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegister} className="w-full space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                <span>Full Name / പൂർണ്ണ നാമം</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 focus:bg-white outline-none"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                <span>Email Address / ഇമെയിൽ</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 focus:bg-white outline-none"
                  placeholder="e.g. name@example.com"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                <span>Phone / ഫോൺ നമ്പർ</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-sans">+91</span>
                <input
                  type="tel"
                  value={phone.replace("+91 ", "")}
                  onChange={(e) => setPhone("+91 " + e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl pl-12 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 focus:bg-white outline-none"
                  placeholder="98765 43210"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* DOB */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  <span>DOB / ജനനത്തീയതി</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 focus:bg-white outline-none"
                    required
                  />
                </div>
              </div>

              {/* Place */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  <span>Place / സ്ഥലം</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 focus:bg-white outline-none"
                    placeholder="e.g. Trivandrum"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Regional State Selection */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                <span>State & Zone / ജില്ല</span>
              </label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={stateValue}
                    onChange={(e) => setStateValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-800 outline-none appearance-none"
                  >
                    <option value="KL">Kerala</option>
                    <option value="TN">Tamil Nadu</option>
                    <option value="KA">Karnataka</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-800 focus:bg-white outline-none"
                  placeholder="Location Zone"
                />
              </div>
            </div>

            {/* Store Dropdown Grid */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                <span>Select Nearest Buying Store / സ്റ്റോർ</span>
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-800" />
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold rounded-xl pl-10 pr-8 py-3 focus:ring-2 focus:ring-emerald-800 outline-none cursor-pointer appearance-none"
                  required
                >
                  {STORES.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name} ({store.location})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ration Card Number & Type */}
            <div className="bg-emerald-50/20 p-4 rounded-xl border border-dashed border-emerald-800/20 space-y-3">
              <span className="text-xs font-bold text-emerald-850 uppercase tracking-wider block">Union Ration Card Details (Optional / ഓപ്ഷണൽ)</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    <span>Card Number / റേഷൻ കാർഡ് നമ്പർ</span>
                  </label>
                  <input
                    type="text"
                    value={rationCardNumber}
                    onChange={(e) => setRationCardNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-800 outline-none"
                    placeholder="e.g. 1609124850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    <span>Card Color / കാർഡ് വിഭാഗം</span>
                  </label>
                  <select
                    value={rationCardType}
                    onChange={(e) => setRationCardType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-800 outline-none appearance-none"
                  >
                    <option value="PHH">Pink (Priority Household / PHH)</option>
                    <option value="AAY">Yellow (Antyodaya Anna Yojana / AAY)</option>
                    <option value="NPS">Blue (Non-Priority Subsidized / NPS)</option>
                    <option value="NPNS">White (Non-Priority Non-Subsidized)</option>
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-normal">
                Linking your card computes actual subsidized item limits and monthly foodgrains ceilings.
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                <span>Create Password / പാസ്‌വേഡ്</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 focus:bg-white outline-none"
                  placeholder="Min. 8 characters"
                  required
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1 cursor-pointer pt-3"
            >
              <span className="text-sm font-bold flex items-center gap-1">
                Complete Registration
              </span>
              <span className="text-xs opacity-80">രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക</span>
            </button>
          </form>
        )}

        <div className="w-full mt-6 text-center border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">
            {isLogin ? "New to Supplyco? / ആദ്യമായാണോ?" : "Already active shopper? / അക്കൗണ്ട് ഉണ്ടോ?"}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-xs font-bold text-emerald-800 hover:underline mt-1 underline cursor-pointer"
          >
            {isLogin ? "Register Now / ഇപ്പോൾ രജിസ്റ്റർ ചെയ്യുക" : "Sign In here / ലോഗിൻ ചെയ്യുക"}
          </button>
        </div>
      </div>

      <footer className="mt-6 text-center text-[11px] text-slate-400 max-w-sm">
        © 2026 Kerala State Civil Supplies Corporation Ltd. All government subsidy ceilings apply under Food Safety standards.
      </footer>
    </div>
  );
}
