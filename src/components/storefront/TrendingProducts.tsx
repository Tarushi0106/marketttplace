"use client";

import Link from "next/link";
import { Camera, Mic, Users } from "lucide-react";

const PRODUCTS = [
  {
    href: "/categories/ai-video-surveillance",
    name: "AI Video Surveillance",
    description: "Cloud-hosted cameras, AI motion detection, and real-time alerts — see everything, miss nothing.",
    icon: Camera,
    bg: "#EEF2FF",
    iconColor: "#1E2260",
  },
  {
    href: "/categories/ai-voice-automation",
    name: "AI Voice Automation",
    description: "Fully automated inbound & outbound calls — lead qualification, support, and CRM sync, 24/7.",
    icon: Mic,
    bg: "#E0F2FE",
    iconColor: "#0369A1",
  },
  {
    href: "/categories/ai-talent-intelligence",
    name: "AI Talent Intelligence",
    description: "Resume scoring, AI voice interviews, and 10-parameter candidate reports — hire smarter, faster.",
    icon: Users,
    bg: "#F0FDF4",
    iconColor: "#166534",
  },
];

export function TrendingProducts() {
  return (
    <section
      className="relative overflow-hidden bg-[#1E2260] py-16 md:py-20"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      <div className="container relative mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Our Trending Categories
          </h2>
          <p className="mt-3 text-white/60 text-lg max-w-2xl mx-auto">
            AI-powered solutions built for modern enterprises — surveillance, voice automation, and talent intelligence.
          </p>
        </div>

        <div className="relative">
          {/* Connector lines */}
          <svg
            className="absolute inset-x-0 top-0 -mt-10 h-10 w-full"
            viewBox="0 0 300 40"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M150,0 L150,14 M50,14 L250,14 M50,14 L50,40 M150,14 L150,40 M250,14 L250,40"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
            {PRODUCTS.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  className="group flex flex-col items-center text-center cursor-pointer"
                >
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full shadow-sm transition-transform group-hover:scale-110"
                    style={{ backgroundColor: p.bg }}
                  >
                    <Icon className="h-8 w-8" style={{ color: p.iconColor }} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white transition-colors group-hover:text-[#4A9FD5]">
                    {p.name}
                  </h3>
                  <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-white/60">
                    {p.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
