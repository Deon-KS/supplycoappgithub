import React, { useState } from "react";
import { User, MapPin, Settings2, ShieldCheck, Mail, Phone, Calendar, Save, CheckCircle } from "lucide-react";
import { UserProfile, StoreLocation } from "../types";
import { STORES } from "../data";

interface AccountProfileProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

export default function AccountProfile({ user, onUpdateUser }: AccountProfileProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [dob, setDob] = useState(user.dob);

  const [addressLine1, setAddressLine1] = useState(user.addressLine1);
  const [city, setCity] = useState(user.city);
  const [district, setDistrict] = useState(user.district);
  const [pincode, setPincode] = useState(user.pincode);

  const [activeStoreId, setActiveStoreId] = useState(user.activeStoreId);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.notificationsEnabled);
  const [appTheme, setAppTheme] = useState(user.theme);

  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      fullName,
      email,
      phone,
      dob,
      addressLine1,
      city,
      district,
      activeStoreId,
      notificationsEnabled,
      theme: appTheme,
    };
    onUpdateUser(updated);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Page Title */}
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Account Profile</h2>
        <p className="text-xs text-slate-500 font-semibold leading-none">
          Manage your personal details and app settings / നിങ്ങളുടെ വിവരങ്ങൾ
        </p>
      </header>

      {showSavedToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-bold flex items-center gap-2 shadow-sm animate-bounce w-full max-w-sm mx-auto">
          <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>Profile configuration updated successfully! / മാറ്റങ്ങൾ സേവ് ചെയ്തു.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column summary card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-amber-900/10 text-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-20 bg-emerald-800/10"></div>
            <div className="relative z-10 pt-4 flex flex-col items-center">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCESFr7dzPNBqU449PdjF-XH0pTeUl5-0LnTL3I-YwEKy_CP6vVEu0msa3yBgNnH5xGuQA9L4Sj7SnIZrTs3ZdepJ99DrZXdo_QzujEFD3YB_E51bEynzxGJbZI8k-ZdcFd2F99a-hAaBGHxwgSoczPutSC7R8fLPPnG4fVQ83s_lqGncoPMkSldI43F7FrEIgaSA8aB9sYZnkcAIWYEYVoYGNx6abmmJBSH96YkhXXcRxcR-CBoRkvIhA0kRRzBb0Q6_1usMAHBZc"
                alt="Account Headshot"
                className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover mb-3"
              />
              <h3 className="font-extrabold text-slate-800 text-base">{fullName}</h3>
              <p className="text-xs text-slate-500 font-semibold mb-3">{email}</p>
              <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified Active Ration Card
              </span>
            </div>
          </div>

          {/* Quick Settings widgets Card */}
          <div className="bg-white rounded-2xl p-5 border border-amber-900/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings2 className="w-4 h-4 text-[#00234e]" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 leading-none">
                Local App Preferences
              </h4>
            </div>

            {/* Notification Switch */}
            <div className="flex items-center justify-between font-sans">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700">Stock Notifications</span>
                <span className="text-[10px] text-slate-400">Immediate mobile alerts</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-800"></div>
              </label>
            </div>

            {/* Change Active Store (Bilingual) */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                Active Outlet / സജീവ സ്റ്റോർ
              </span>
              <div className="relative">
                <select
                  value={activeStoreId}
                  onChange={(e) => setActiveStoreId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {STORES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right column detailed forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Personal details */}
          <div className="bg-white rounded-2xl p-6 border border-amber-900/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Personal Details</h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">വ്യക്തിഗത വിവരങ്ങൾ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                  Full Name / പൂർണ്ണ നാമം
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                  Email Address / ഇമെയിൽ
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                  Phone Number / ഫോൺ നമ്പർ
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                  Date of Birth / ജനനത്തീയതി
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Logistics Address setup */}
          <div className="bg-white rounded-2xl p-6 border border-amber-900/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Regional Logistics</h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">വിലാസ വിവരങ്ങൾ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                  Address Line 1 / വിലാസം 1
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                  City/Place / സ്ഥലം
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                  District / ജില്ല
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                  State / സംസ്ഥാനം
                </label>
                <input
                  type="text"
                  value={user.state}
                  disabled
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                  Pincode / പിൻകോഡ്
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="w-full flex justify-end">
            <button
              type="submit"
              className="bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Config</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
