"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Mic, Users, ChevronRight, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    slug: "ai-video-surveillance",
    label: "AI Video Surveillance",
    productLabel: "VSaaS",
    productHref: "/products/vsaas",
    Icon: Camera,
  },
  {
    slug: "ai-voice-automation",
    label: "AI Voice Automation",
    productLabel: "Deco Voice",
    productHref: "/products/deco-voice",
    Icon: Mic,
  },
  {
    slug: "ai-talent-intelligence",
    label: "AI Talent Intelligence",
    productLabel: "Deco Talent",
    productHref: "/products/deco-talent",
    Icon: Users,
  },
];

export function SolutionsNavbar() {
  const pathname = usePathname();

  if (!pathname?.startsWith("/solutions")) {
    return null;
  }

  return (
    <section className="bg-white border-b border-gray-200 py-3 sticky top-[70px] z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {/* All Solutions */}
          <Link
            href="/solutions"
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              pathname === "/solutions"
                ? "bg-[#1E2260] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            All Solutions
          </Link>

          <div className="w-px h-5 bg-gray-200 flex-shrink-0 mx-1" />

          {/* Category → Product pairs */}
          {CATEGORIES.map((cat) => (
            <div key={cat.slug} className="flex items-center gap-1 flex-shrink-0">
              {/* Category label (non-clickable) */}
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 whitespace-nowrap hidden sm:inline">
                {cat.label}
              </span>
              <ChevronRight className="h-3 w-3 text-gray-300 hidden sm:inline flex-shrink-0" />
              {/* Product link */}
              <Link
                href={cat.productHref}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  pathname === cat.productHref
                    ? "bg-[#1E2260] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-[#EEF2FF] hover:text-[#1E2260]"
                )}
              >
                <cat.Icon className="h-4 w-4 flex-shrink-0" />
                {cat.productLabel}
              </Link>

              <div className="w-px h-5 bg-gray-200 flex-shrink-0 mx-1 last:hidden" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
