import { useState } from "react";
import { Palette, Languages, BellRing, Info, LogOut, Moon, Sun, Heart, ChevronRight } from "lucide-react";
import { UserProfile } from "../types";
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

interface SettingsTabProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
}

export default function SettingsTab({ user, onUpdateUser, onLogout }: SettingsTabProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "vintage">(user.theme);
  const [lang, setLang] = useState<"english" | "malayalam" | "bilingual">(user.language);

  const handlePushToggle = async (enabled: boolean) => {
    onUpdateUser({ ...user, notificationsEnabled: enabled });
    if (enabled) {
      if (Capacitor.isNativePlatform()) {
        try {
          const permStatus = await LocalNotifications.checkPermissions();
          if (permStatus.display !== 'granted') {
            await LocalNotifications.requestPermissions();
          }
        } catch (e) {
          console.error("Local notifications not available", e);
        }
      } else if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "vintage") => {
    setTheme(newTheme);
    onUpdateUser({ ...user, theme: newTheme });
  };

  const handleLangChange = (newLang: "english" | "malayalam" | "bilingual") => {
    setLang(newLang);
    onUpdateUser({ ...user, language: newLang });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h2>
        <p className="text-xs text-slate-500 font-semibold leading-none">
          Manage your app preferences / ക്രമീകരണങ്ങൾ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Appearance Section */}
        <section className="bg-white border border-[#eae2de] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Palette className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-sm text-[#00234e]">Appearance</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            
            {/* Light */}
            <button
              onClick={() => handleThemeChange("light")}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                theme === "light"
                  ? "bg-slate-50 border-emerald-800 ring-2 ring-emerald-800/10"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Sun className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold">Light</span>
            </button>

            {/* Dark */}
            <button
              onClick={() => handleThemeChange("dark")}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                theme === "dark"
                  ? "bg-slate-900 text-white border-emerald-800 ring-2 ring-emerald-800/20"
                  : "bg-slate-900 text-white border-slate-800 hover:bg-slate-850"
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-300">Dark</span>
            </button>

            {/* Vintage */}
            <button
              onClick={() => handleThemeChange("vintage")}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                theme === "vintage"
                  ? "bg-[#faf6f0] border-emerald-800 ring-2 ring-emerald-800/10"
                  : "bg-[#faf6f0] border-[#c3c6d1] hover:bg-[#f3edd9]"
              }`}
            >
              <Heart className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-800 font-serif">Vintage</span>
            </button>
          </div>
        </section>

        {/* Language Selection */}
        <section className="bg-white border border-[#eae2de] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Languages className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-sm text-[#00234e]">Language / ഭാഷ</h3>
          </div>
          <div className="flex flex-col gap-2">
            {/* English Only */}
            <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="lang"
                checked={lang === "english"}
                onChange={() => handleLangChange("english")}
                className="w-4 h-4 text-emerald-800 border-slate-300 focus:ring-emerald-800"
              />
              <span className="text-xs font-bold text-slate-700">English Only</span>
            </label>

            {/* Malayalam Only */}
            <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="lang"
                checked={lang === "malayalam"}
                onChange={() => handleLangChange("malayalam")}
                className="w-4 h-4 text-emerald-800 border-slate-300 focus:ring-emerald-800"
              />
              <span className="text-xs font-bold text-slate-700">മലയാളം മാത്രം</span>
            </label>

            {/* Bilingual (Default) */}
            <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="lang"
                checked={lang === "bilingual"}
                onChange={() => handleLangChange("bilingual")}
                className="w-4 h-4 text-emerald-800 border-slate-300 focus:ring-emerald-800"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 leading-tight">Bilingual</span>
                <span className="text-[10px] text-slate-400">English + മലയാളം</span>
              </div>
            </label>
          </div>
        </section>

        {/* Notifications Checkboxes */}
        <section className="bg-white border border-[#eae2de] rounded-2xl p-5 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BellRing className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-sm text-[#00234e]">Notifications Control</h3>
          </div>
          <div className="flex flex-col divide-y divide-slate-100">
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col pr-4">
                <span className="text-xs font-bold text-slate-800">Push Notifications</span>
                <span className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  Receive instant alerts for subsidies, stock updates, and exclusive offers on your device.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={user.notificationsEnabled}
                  onChange={(e) => handlePushToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-850"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Info & support items */}
        <section className="bg-white border border-[#eae2de] rounded-2xl p-5 shadow-sm space-y-3 md:col-span-2">
          <div className="flex flex-col divide-y divide-slate-100">
            <button
              onClick={() => alert("Learn more at https://www.civilsupplieskerala.gov.in/")}
              className="flex items-center justify-between py-2 hover:bg-slate-50 transition-colors w-full cursor-pointer text-left font-semibold text-xs text-slate-700"
            >
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-slate-400" />
                <span>About Supplyco Kerala Corporation</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => alert("Ration Card criteria is managed by the Ministry of Food & Civil Supplies.")}
              className="flex items-center justify-between py-2 hover:bg-slate-50 transition-colors w-full cursor-pointer text-left font-semibold text-xs text-slate-700"
            >
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-slate-400" />
                <span>Terms & Ration Card Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="pt-3 flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-100">
            <span>App Version Settings</span>
            <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              v1.5.0 (Build 9438)
            </span>
          </div>
        </section>
      </div>

      {/* Logout Row */}
      <div className="w-full flex justify-center pt-4">
        <button
          onClick={onLogout}
          className="bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-200 hover:border-red-300 px-6 py-2.5 rounded-full text-xs font-bold tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Log Out / പുറത്തുകടക്കുക</span>
        </button>
      </div>
    </div>
  );
}
