"use client";

import Link from "next/link";
import { ChevronRight, ChevronLeft, Wifi, Shield, Cloud, Settings, Brain, Share2, Box, Server, Database, Cpu, Briefcase, Headphones, Smartphone, Package } from "lucide-react";
import { useRef, useState, useEffect } from "react";

// Same 7 categories as the navbar sidebar — in sidebar order
const SIDEBAR_SLUGS = [
  "software-as-a-service",
  "connectivity",
  "security",
  "managed-infrastructure",
  "mobility-iot",
  "ai",
  "hardware-logistics",
];

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  iconBgColor: string | null;
  _count: {
    products: number;
  };
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  wifi: Wifi,
  shield: Shield,
  cloud: Cloud,
  settings: Settings,
  brain: Brain,
  share2: Share2,
  server: Server,
  database: Database,
  cpu: Cpu,
  briefcase: Briefcase,
  headphones: Headphones,
  smartphone: Smartphone,
  package: Package,
};

const sampleCategories: Category[] = [
  { id: "1", name: "Software as a Service", slug: "software-as-a-service", description: "Cloud-based software solutions for business", image: null, icon: "cloud", iconBgColor: "#DBEAFE", _count: { products: 0 } },
  { id: "2", name: "Connectivity", slug: "connectivity", description: "Network connectivity and communication solutions", image: null, icon: "wifi", iconBgColor: "#D1FAE5", _count: { products: 0 } },
  { id: "3", name: "Security", slug: "security", description: "Cybersecurity and protection solutions", image: null, icon: "shield", iconBgColor: "#E8F0FF", _count: { products: 0 } },
  { id: "4", name: "Managed Infrastructure Services", slug: "managed-infrastructure", description: "Managed IT infrastructure and support", image: null, icon: "server", iconBgColor: "#F5F5F5", _count: { products: 0 } },
  { id: "5", name: "Mobility & IOT", slug: "mobility-iot", description: "Mobile solutions and Internet of Things", image: null, icon: "smartphone", iconBgColor: "#E9D5FF", _count: { products: 0 } },
  { id: "6", name: "AI", slug: "ai", description: "Artificial intelligence and machine learning solutions", image: null, icon: "brain", iconBgColor: "#FEF3C7", _count: { products: 0 } },
  { id: "7", name: "Hardware & Logistics", slug: "hardware-logistics", description: "Hardware procurement and logistics services", image: null, icon: "package", iconBgColor: "#D4A574", _count: { products: 0 } },
];

export function FeaturedCategories() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories?includeSubCategories=false");
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const filtered = (data.data as Category[]).filter((c) =>
            SIDEBAR_SLUGS.includes(c.slug)
          );
          filtered.sort(
            (a, b) => SIDEBAR_SLUGS.indexOf(a.slug) - SIDEBAR_SLUGS.indexOf(b.slug)
          );
          if (filtered.length > 0) {
            setCategories(filtered);
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const displayCategories = categories.length > 0 ? categories : sampleCategories;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Featured Categories
              </h2>
              <p className="mt-3 text-gray-500 text-lg max-w-2xl">
                Browse our top enterprise solution categories trusted by businesses worldwide.
              </p>
            </div>
          </div>
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-[280px] h-[220px] bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Featured Categories
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-2xl">
              Browse our top enterprise solution categories trusted by businesses worldwide.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 text-[#1E2260] font-medium hover:underline"
          >
            See All Categories
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          >
            {displayCategories.map((category) => {
              const IconComponent = iconMap[category.icon?.toLowerCase() || "box"] || Box;
              const bgColor = category.iconBgColor || "#E5E5E5";
              const isBlack = bgColor === "#000000" || bgColor.toLowerCase() === "#1a1a1a";
              const isRed = bgColor.toLowerCase().includes("ffe4e4") || bgColor.toLowerCase().includes("fce7f3");

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex-shrink-0 snap-start w-[280px] group"
                >
                  <div className="border border-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                    {/* Icon Area */}
                    <div className="h-48 flex items-center justify-center" style={{ backgroundColor: bgColor + "22" }}>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="max-h-32 max-w-[80%] object-contain"
                        />
                      ) : (
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: bgColor }}
                        >
                          <IconComponent
                            className={`h-10 w-10 ${
                              isBlack ? "text-white" : isRed ? "text-[#1E2260]" : "text-gray-700"
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Category Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-[#1E2260] transition-colors">
                        {category.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {category.description || "Explore enterprise solutions in this category."}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {category._count.products} {category._count.products === 1 ? "product" : "products"}
                        </span>
                        <span className="text-xs font-medium text-[#1E2260] group-hover:underline flex items-center gap-1">
                          Explore <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[#1E2260] font-medium"
          >
            See All Categories
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
