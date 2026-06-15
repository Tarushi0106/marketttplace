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
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Trending Categories
          </h2>
          <p className="mt-3 text-gray-500 text-lg max-w-2xl">
            AI-powered solutions built for modern enterprises — surveillance, voice automation, and talent intelligence.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
          {PRODUCTS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.href}
                href={p.href}
                className="flex flex-col items-center text-center group cursor-pointer w-44"
              >
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                  style={{ backgroundColor: p.bg }}
                >
                  <Icon className="h-12 w-12" style={{ color: p.iconColor }} />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900 text-lg group-hover:text-[#1E2260] transition-colors">
                  {p.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-[180px]">
                  {p.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
