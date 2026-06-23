import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { t } from "../utils/lang";

interface CountdownTimerProps {
  expiresAt: string;
  language: "english" | "malayalam" | "bilingual";
}

export default function CountdownTimer({ expiresAt, language }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(expiresAt).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeLeft.isExpired) {
    return null;
  }

  const paddedD = String(timeLeft.days).padStart(2, "0");
  const paddedH = String(timeLeft.hours).padStart(2, "0");
  const paddedM = String(timeLeft.minutes).padStart(2, "0");
  const paddedS = String(timeLeft.seconds).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-red-50 text-red-700 text-[10px] font-bold border border-red-100 shadow-sm w-fit animate-pulse">
      <Timer className="w-3.5 h-3.5 text-red-600 animate-spin-slow shrink-0" />
      <span>{t("Offer ends", "ഓഫർ അവസാനിക്കുന്നു", language)}: </span>
      <span className="font-mono text-xs text-red-800 tracking-wider">
        {timeLeft.days > 0 ? `${paddedD}d ` : ''}{paddedH}h {paddedM}m {paddedS}s
      </span>
    </div>
  );
}
