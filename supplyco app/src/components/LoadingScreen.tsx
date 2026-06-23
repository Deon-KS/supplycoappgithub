import { useEffect } from "react";
import { Leaf } from "lucide-react";

interface LoadingScreenProps {
  onFinished: () => void;
}

export default function LoadingScreen({ onFinished }: LoadingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className="fixed inset-0 bg-amber-50/40 select-none flex flex-col justify-center items-center z-[100] font-sans overflow-hidden">
      {/* Subtle paper noise texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#00234e_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* Decorative WebGL-like organic bezier paths */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-10 pointer-events-none flex justify-center items-center">
        <svg className="w-full h-full text-green-700/20" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path
            className="animate-[pulse_3s_ease-in-out_infinite]"
            d="M0,50 Q25,10 50,50 T100,50"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            className="animate-[pulse_4s_ease-in-out_infinite_delay-1000]"
            d="M0,35 Q35,80 70,25 T100,70"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Main Content Card Container */}
      <div className="z-20 flex flex-col items-center justify-center space-y-6 max-w-md w-full px-6 text-center animate-[fadeIn_0.6s_ease-out]">
        {/* Logo and Tagline Stack */}
        <div className="flex flex-col items-center space-y-2">
          {/* Logo stamp illustration */}
          <div className="w-32 h-32 rounded-full border-4 border-emerald-800/10 p-2 flex items-center justify-center bg-white shadow-md relative transform hover:rotate-6 transition-transform duration-300">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_nKbtcXwrdiremImknoe7ghWVV-AnW6kdBm97c4R5TBIhKsjOv45BWPOuGkq2hkRvCacmu1vhRkGrSpyJfsT-ka_JZBz0SpPkGJpqeMLfqTT8fCfe0tsnC9IRDkR7AqbADR7_1EPF8E03xiyVf3aZ7OKiKCWzayNXn1eJjXFqYOUvBYFlaGKrOCMTcysW4haVCwPWitTXIcz_4zeCKmzT983pfLkEvWQs1nlGGfj_DJ6CCQuc-AHSAEWhhviIKXbcz_NpUuZsm-k"
              alt="Supplyco Stamp Seal"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-slate-800/90 tracking-tight font-sans mt-2">
            KERALA STATE CIVIL SUPPLIES
          </h1>
          <p className="text-xs text-orange-600 font-semibold uppercase tracking-widest">
            Assured Quality • Affordable Prices
          </p>
        </div>

        {/* Buffering Loading Indicator */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 border-t-emerald-700 animate-spin"></div>
          {/* Internal rotating icon */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/80 flex items-center justify-center backdrop-blur-sm shadow-sm border border-slate-100">
            <Leaf className="w-8 h-8 text-emerald-700 animate-bounce" />
          </div>
        </div>

        {/* Loading Malayalam / English Text */}
        <div className="flex flex-col items-center space-y-1">
          <p className="font-medium text-slate-600 animate-pulse text-sm">
            Loading your traditional harvest...
          </p>
          <span className="text-[13px] text-slate-500 font-normal">
            നിങ്ങളുടെ കാർഷിക വിളവുകൾ ഒരുക്കുന്നു...
          </span>
        </div>
      </div>
    </div>
  );
}
