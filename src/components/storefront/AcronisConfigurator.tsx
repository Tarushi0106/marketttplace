"use client";

import { Monitor, Server, HardDrive, Mail } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "device",
    label: "Per Device",
    sublabel: "Workstation & Mobile",
    icon: Monitor,
    description: "Backup for Windows/Mac desktops, laptops & mobile devices",
    color: "blue",
  },
  {
    id: "vm",
    label: "Per VM",
    sublabel: "Virtual Machine",
    icon: HardDrive,
    description: "Backup for virtual machines (VMware, Hyper-V etc.)",
    color: "purple",
  },
  {
    id: "server",
    label: "Per Server",
    sublabel: "Physical Server",
    icon: Server,
    description: "Backup for physical Windows/Linux servers",
    color: "orange",
  },
  {
    id: "virtualhost",
    label: "Per Virtual Host",
    sublabel: "Unlimited VMs",
    icon: Server,
    description: "Unlimited VMs on a single host — best for VMware/Hyper-V clusters",
    color: "green",
  },
  {
    id: "mailbox",
    label: "Per Mailbox",
    sublabel: "Office 365",
    icon: Mail,
    description: "Backup for Microsoft Office 365 mailboxes",
    color: "red",
  },
];


const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
  green: "bg-green-50 border-green-200 text-green-700",
  red: "bg-[#EEF2FF] border-[#D0DEFF] text-[#161848]",
  teal: "bg-teal-50 border-teal-200 text-teal-700",
  gray: "bg-gray-50 border-gray-200 text-gray-700",
};

const ICON_COLOR_MAP: Record<string, string> = {
  blue: "text-blue-500",
  purple: "text-purple-500",
  orange: "text-orange-500",
  green: "text-green-500",
  red: "text-[#1E2260]",
  teal: "text-teal-500",
  gray: "text-gray-500",
};

export function AcronisConfigurator({ productSlug }: { productSlug: string }) {
  return (
    <div>
      {/* Main categories */}
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">What do you need to back up?</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
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
