"use client";

import { Users, Building2, Shield, Mail, Archive, AlertTriangle, Tag } from "lucide-react";
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
  {
    id: "security",
    label: "Security & Identity",
    sublabel: "Advanced Protection",
    icon: Shield,
    description: "Azure AD, ATP, EMS, Defender and Cloud App Security",
    color: "red",
  },
  {
    id: "exchange",
    label: "Exchange Online",
    sublabel: "Email Hosting",
    icon: Mail,
    description: "Exchange Online Plan 1, Plan 2, Kiosk & Protection",
    color: "teal",
  },
  {
    id: "backup",
    label: "Email Backup & Archiving",
    sublabel: "Data Protection",
    icon: Archive,
    description: "Office 365 Backup, DropSuite and XcellArchive plans",
    color: "green",
  },
  {
    id: "antiphishing",
    label: "Anti-Phishing",
    sublabel: "Email Security",
    icon: AlertTriangle,
    description: "Protection for up to 100, 300 or 750 employees",
    color: "orange",
  },
  {
    id: "signature",
    label: "Email Signature",
    sublabel: "Brand Identity",
    icon: Tag,
    description: "Exclaimer professional email signature management",
    color: "purple",
  },
];

const COLOR_MAP: Record<string, string> = {
  blue:   "bg-blue-50 border-blue-200 text-blue-700",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  red:    "bg-red-50 border-red-200 text-red-700",
  teal:   "bg-teal-50 border-teal-200 text-teal-700",
  green:  "bg-green-50 border-green-200 text-green-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
};

const ICON_COLOR_MAP: Record<string, string> = {
  blue:   "text-blue-500",
  indigo: "text-indigo-500",
  red:    "text-red-500",
  teal:   "text-teal-500",
  green:  "text-green-500",
  orange: "text-orange-500",
  purple: "text-purple-500",
};

export function Microsoft365Configurator({ productSlug }: { productSlug: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
        What type of Microsoft 365 licence do you need?
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`/products/${productSlug}/configure?category=${cat.id}`}
              className={`text-left p-4 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5 ${COLOR_MAP[cat.color]} hover:border-[#8B1D1D] group`}
            >
              <Icon className={`h-6 w-6 mb-2 ${ICON_COLOR_MAP[cat.color]} group-hover:text-[#8B1D1D]`} />
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
