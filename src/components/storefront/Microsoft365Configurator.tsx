"use client";

import { Users, Building2 } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "smb",
    label: "SMB Plans",
    sublabel: "Up to 300 Users",
    icon: Users,
    description: "Business Basic, Standard, Premium & Apps for Business",
    color: "blue",
  },
  {
    id: "enterprise",
    label: "Enterprise Plans",
    sublabel: "Large Organisations",
    icon: Building2,
    description: "E1, E3, E5, ProPlus and bundled Microsoft 365 plans",
    color: "indigo",
  },
];

const COLOR_MAP: Record<string, string> = {
  blue:   "bg-blue-50 border-blue-200 text-blue-700",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
};

const ICON_COLOR_MAP: Record<string, string> = {
  blue:   "text-blue-500",
  indigo: "text-indigo-500",
};

export function Microsoft365Configurator({ productSlug }: { productSlug: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
        What type of Microsoft 365 licence do you need?
      </p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`/products/${productSlug}/configure?category=${cat.id}`}
              className={`text-left p-4 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5 ${COLOR_MAP[cat.color]} hover:border-[#1E2260] group`}
            >
              <Icon className={`h-6 w-6 mb-2 ${ICON_COLOR_MAP[cat.color]} group-hover:text-[#1E2260]`} />
              <div className="font-bold text-gray-900 text-sm">{cat.label}</div>
              <div className="text-xs font-semibold text-gray-500">{cat.sublabel}</div>
              <div className="text-xs text-gray-400 mt-1 leading-snug">{cat.description}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
