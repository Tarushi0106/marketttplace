"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cloud,
  Briefcase,
  Network,
  Users,
  Shield,
  Brain,
  Drone,
  Calculator,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const solutions = [
  {
    id: "cloud-infrastructure",
    label: "Cloud & Infrastructure",
    icon: Cloud,
    href: "/products?category=cloud-infrastructure",
  },
  {
    id: "business-applications",
    label: "Business Applications",
    icon: Briefcase,
    href: "/products?category=business-applications",
  },
  {
    id: "connectivity",
    label: "Connectivity – SDWAN",
    icon: Network,
    href: "/products?category=connectivity",
  },
  {
    id: "workplace",
    label: "Workplace & Collaboration",
    icon: Users,
    href: "/products?category=workplace",
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity",
    icon: Shield,
    href: "/products?category=cybersecurity",
  },
  {
    id: "data-ai",
    label: "Data, AI & Intelligence",
    icon: Brain,
    href: "/products?category=data-ai",
  },
  {
    id: "industry-solutions",
    label: "Industry Solutions",
    icon: Drone,
    href: "/products?category=industry-solutions",
  },
  {
    id: "pricing",
    label: "Get Pricing",
    icon: Calculator,
    href: "/pricing-calculator",
  },
];

export function SolutionsNavbar() {
  const pathname = usePathname();

  // Only show on solutions page
  if (!pathname?.startsWith("/solutions")) {
    return null;
  }

  return (
    <section className="bg-white border-b border-gray-200 py-3 sticky top-[70px] z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            href="/solutions"
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              pathname === "/solutions"
                ? "bg-[#1E2260] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            All Solutions
          </Link>
          {solutions.map((solution) => (
            <Link
              key={solution.id}
              href={solution.href}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
            >
              <solution.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{solution.label}</span>
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
