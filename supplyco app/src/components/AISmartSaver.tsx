import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageCircle, AlertCircle, RefreshCw } from "lucide-react";
import { UserProfile, CartItem } from "../types";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface AISmartSaverProps {
  user: UserProfile;
  cart: CartItem[];
}

export default function AISmartSaver({ user, cart }: AISmartSaverProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init_msg",
      sender: "bot",
      text: `Hello ${user.fullName || "Shopper"}! I am your **Supplyco Smart Saver (ശബരി സ്മാർട്ട് സേവർ)** Assistant, powered by Groq AI.

**Ask me anything! For example:**
- *How can I maximize my Malayalam meal planning with subsidy items?*
- *Suggest a high-protein recipe using Green Gram (ചെറുപയർ) and Coconut Oil (വെളിച്ചെണ്ണ).*
- *Calculate the total savings comparison of my current cart items.*
- *Provide instructions to authenticate my Kerala ration profile.*

What can I plan for you today?`,
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_QUERIES = [
    { label: "Green Gram Curry (ചെറുപയർ കറി)", prompt: "Suggest a budget green gram curry recipe using Supplyco subsidy items and Sabari spice powders." },
    { label: "Subsidy Shopping Tips", prompt: "Summarize the five best tips to maximize my government subsidy savings ceilings this week." },
    { label: "My Cart Savings Audit", prompt: "Explain the savings benefits of Jaya Rice vs Regular market rice and standard coconut oil cost." },
    { label: "Ration Card Rules (മലയാളം)", prompt: "Explain how to link Ration Cards under Supplyco in Malayalam." }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: "msg_" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Build simple memory logs
      const history = messages
        .filter((m) => m.id !== "init_msg")
        .map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          text: m.text,
        }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          history,
        }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: "msg_" + (Date.now() + 1),
        sender: "bot",
        text: data.text || "I was unable to analyze this. Please check your network connection.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      console.error(e);
      const errorMsg: Message = {
        id: "msg_" + (Date.now() + 1),
        sender: "bot",
        text: "🚨 *Network interruption: Could not reach the server.* Please try prompting again or ask other questions.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="flex flex-col h-[75vh] max-w-4xl mx-auto rounded-3xl border border-amber-900/10 bg-white overflow-hidden shadow-sm animate-[fadeIn_0.3s_ease-out]">
      {/* Bot Chat Header */}
      <div className="bg-emerald-850 px-6 py-4 flex items-center justify-between border-b border-amber-900/10 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 p-2 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm leading-tight text-white">AI Smart Saver</h3>
            <span className="text-[10px] text-emerald-100 font-semibold leading-none block mt-0.5">
              ശബരി സ്മാർട്ട് സേവർ • Groq AI Assistant
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (confirm("Reset current logs?")) {
                setMessages([messages[0]]);
              }
            }}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-100"
            title="Reset Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Logs */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fbf9f5] space-y-4">
        {messages.map((m) => {
          const isBot = m.sender === "bot";
          return (
            <div
              key={m.id}
              className={`flex ${isBot ? "justify-start" : "justify-end"} animate-[fadeIn_0.2s_ease-out]`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm font-sans tracking-wide leading-relaxed shadow-sm border ${
                  isBot
                    ? "bg-white text-slate-800 border-amber-900/5 rounded-tl-none prose prose-emerald prose-sm"
                    : "bg-emerald-850 text-white border-emerald-900 rounded-tr-none"
                }`}
              >
                {/* Parse Markdown representation beautifully */}
                <div className="whitespace-pre-line space-y-2">
                  {m.text}
                </div>
                <span
                  className={`text-[9px] mt-2 block text-right font-medium leading-none ${
                    isBot ? "text-slate-400" : "text-emerald-200"
                  }`}
                >
                  {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 text-slate-500 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-800" />
              <span className="text-xs font-semibold animate-pulse">Analyzing prices and catalog...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Filters Panel */}
      {messages.length === 1 && !loading && (
        <div className="px-4 py-3 bg-[#eae8e4] border-t border-amber-900/5 shrink-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Suggested Saving Queries:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SUGGESTED_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.prompt)}
                className="bg-white border border-slate-300 hover:border-emerald-800 rounded-full px-3.5 py-1.5 text-xs text-slate-700 font-semibold shrink-0 cursor-pointer shadow-sm hover:scale-[1.01] transition-transform"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Message Box */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-white hover:bg-slate-50 border-t border-slate-200 p-4 flex gap-3 items-center shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask me a savings recipe / ചോദ്യം ചോദിക്കുക..."
          className="flex-1 bg-slate-50 border border-slate-350 focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-850"
          disabled={loading}
        />
        <button
          type="submit"
          className="p-3 bg-emerald-850 hover:bg-emerald-900 text-white rounded-xl shadow-sm shrink-0 flex items-center justify-center transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
          disabled={loading || !inputText.trim()}
          title="Send Query"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
