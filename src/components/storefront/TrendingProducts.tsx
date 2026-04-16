"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wifi, Shield, Cloud, Brain, Smartphone, Package, Server } from "lucide-react";

interface TrendingCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  iconBgColor: string | null;
  image: string | null;
}

// Icon mapping for dynamic icon rendering
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  wifi: Wifi,
  shield: Shield,
  cloud: Cloud,
  brain: Brain,
  smartphone: Smartphone,
  package: Package,
  server: Server,
};

// Sidebar slugs — same order as navbar dropdown
const sidebarSlugs = [
  "software-as-a-service",
  "connectivity",
  "security",
  "managed-infrastructure",
  "mobility-iot",
  "ai",
  "hardware-logistics",
];

// Fallback categories matching the 7 navbar categories
const defaultCategories: TrendingCategory[] = [
  {
    id: "1",
    name: "Software as a Service",
    slug: "software-as-a-service",
    description: "Cloud-based software solutions for business productivity and collaboration.",
    icon: "cloud",
    iconBgColor: "#DBEAFE",
    image: null,
  },
  {
    id: "2",
    name: "Connectivity",
    slug: "connectivity",
    description: "Network connectivity and communication solutions for modern enterprises.",
    icon: "wifi",
    iconBgColor: "#D1FAE5",
    image: null,
  },
  {
    id: "3",
    name: "Security",
    slug: "security",
    description: "Cybersecurity and protection solutions to safeguard your business.",
    icon: "shield",
    iconBgColor: "#FFE4E4",
    image: null,
  },
  {
    id: "4",
    name: "Managed Infrastructure Services",
    slug: "managed-infrastructure",
    description: "Fully managed IT infrastructure and support for seamless operations.",
    icon: "server",
    iconBgColor: "#F5F5F5",
    image: null,
  },
  {
    id: "5",
    name: "Mobility & IOT",
    slug: "mobility-iot",
    description: "Mobile solutions and Internet of Things for connected enterprises.",
    icon: "smartphone",
    iconBgColor: "#E9D5FF",
    image: null,
  },
  {
    id: "6",
    name: "AI",
    slug: "ai",
    description: "Artificial intelligence and machine learning solutions for smarter business.",
    icon: "brain",
    iconBgColor: "#FEF3C7",
    image: null,
  },
  {
    id: "7",
    name: "Hardware & Logistics",
    slug: "hardware-logistics",
    description: "Hardware procurement and logistics services for enterprise needs.",
    icon: "package",
    iconBgColor: "#D4A574",
    image: null,
  },
];

export function TrendingProducts() {
  const [categories, setCategories] = useState<TrendingCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories?includeSubCategories=false");
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const filtered = (data.data as TrendingCategory[]).filter((c) =>
            sidebarSlugs.includes(c.slug)
          );
          filtered.sort(
            (a, b) => sidebarSlugs.indexOf(a.slug) - sidebarSlugs.indexOf(b.slug)
          );
          setCategories(filtered.length > 0 ? filtered : defaultCategories);
        } else {
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error("Error fetching trending categories:", error);
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Our Trending Categories
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-2xl">
              Explore our most popular enterprise solutions
            </p>
          </div>
          <div className="flex gap-8 justify-center flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-28 h-28 rounded-full bg-gray-100 animate-pulse" />
                <div className="mt-4 h-4 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Trending Categories
          </h2>
          <p className="mt-3 text-gray-500 text-lg max-w-2xl">
            Explore our most popular enterprise solutions trusted by businesses worldwide
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon?.toLowerCase() || "cloud"] || Cloud;
            const bgColor = category.iconBgColor || "#E5E5E5";
            const isBlack = bgColor === "#000000" || bgColor.toLowerCase() === "#1a1a1a";
            const isRed = bgColor.toLowerCase().includes("ffe4e4") || bgColor.toLowerCase().includes("fce7f3");

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                {/* Icon Circle */}
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: bgColor }}
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <IconComponent
                      className={`h-12 w-12 ${
                        isBlack
                          ? "text-white"
                          : isRed
                          ? "text-[#8B1D1D]"
                          : "text-gray-700"
                      }`}
                    />
                  )}
                </div>

                {/* Category Name */}
                <h3 className="mt-4 font-semibold text-gray-900 text-lg group-hover:text-[#8B1D1D] transition-colors">
                  {category.name}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-[180px]">
                  {category.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
