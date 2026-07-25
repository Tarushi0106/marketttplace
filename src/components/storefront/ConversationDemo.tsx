"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, RotateCcw } from "lucide-react";

const SCENARIOS = [
  {
    key: "support",
    label: "Customer Support",
    messages: [
      { from: "user", text: "Hi, my internet has been down since this morning." },
      { from: "bot", text: "Sorry to hear that! Let me check your connection status right now." },
      { from: "bot", text: "Found it — there's an outage in your area. A technician is on the way, ETA 45 minutes." },
      { from: "user", text: "That was fast, thank you!" },
    ],
  },
  {
    key: "sales",
    label: "Sales Qualification",
    messages: [
      { from: "user", text: "I'm looking for a VSaaS plan for 12 store locations." },
      { from: "bot", text: "Great! For 12 locations, our Enterprise plan covers 4K cameras, AI alerts, and 24/7 monitoring." },
      { from: "bot", text: "Want me to set up a call with our solutions team?" },
      { from: "user", text: "Yes, tomorrow afternoon works." },
    ],
  },
  {
    key: "booking",
    label: "Appointment Booking",
    messages: [
      { from: "user", text: "I'd like to book a demo for Deco Talent." },
      { from: "bot", text: "Sure! I have slots open Thursday at 11 AM or Friday at 3 PM." },
      { from: "user", text: "Friday at 3 PM works for me." },
      { from: "bot", text: "Booked! You'll get a confirmation email shortly." },
    ],
  },
];

export function ConversationDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const scenario = SCENARIOS[activeTab];

  useEffect(() => {
    setVisibleCount(0);
    setIsTyping(false);
    let cancelled = false;

    function playNext(i: number) {
      if (cancelled || i >= scenario.messages.length) return;
      setIsTyping(true);
      timeoutRef.current = setTimeout(() => {
        if (cancelled) return;
        setIsTyping(false);
        setVisibleCount(i + 1);
        timeoutRef.current = setTimeout(() => playNext(i + 1), 650);
      }, 850);
    }

    playNext(0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
    };
  }, [activeTab, replayKey, scenario.messages.length]);

  return (
    <div>
      {/* Scenario tabs — click to switch conversations */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === i
                ? "bg-[#1E2260] text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:border-[#1E2260]/30 hover:text-[#1E2260]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1E2260]">
            <Mic className="h-4 w-4 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">Deco Voice</p>
            <p className="flex items-center gap-1 text-xs text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplayKey((k) => k + 1)}
            aria-label="Replay conversation"
            title="Replay conversation"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-[300px] space-y-3 p-4">
          {scenario.messages.slice(0, visibleCount).map((m, i) => (
            <div key={i} className={`flex animate-fade-in ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  m.from === "user"
                    ? "rounded-br-sm bg-[#1E2260] text-white"
                    : "rounded-bl-sm bg-gray-100 text-gray-800"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
