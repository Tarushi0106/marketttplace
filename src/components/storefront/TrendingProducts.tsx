"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wifi, Shield, Cloud, Settings, Brain, Share2 } from "lucide-react";

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
  settings: Settings,
  brain: Brain,
  share2: Share2,
  // Add more icons as needed
};

// Default trending categories (fallback if none marked as trending in DB)
const defaultCategories: TrendingCategory[] = [
  {
    id: "1",
    name: "Wi-Fi",
    slug: "wifi",
    description: "Reliable enterprise connectivity built for speed, stability, & seamless performance.",
    icon: "wifi",
    iconBgColor: "#000000",
    image: null,
  },
  {
    id: "2",
    name: "Security",
    slug: "security",
    description: "Protecting networks with intelligent threat detection for unmatched digital safety.",
    icon: "shield",
    iconBgColor: "#D4A574",
    image: null,
  },
  {
    id: "3",
    name: "Cloud",
    slug: "cloud-services",
    description: "Scalable cloud technology powering simplified workflows across modern businesses.",
    icon: "cloud",
    iconBgColor: "#E5E5E5",
    image: null,
  },
  {
    id: "4",
    name: "Automation",
    slug: "automation",
    description: "Streamlining complex operations using intelligent automated processes for efficiency.",
    icon: "settings",
    iconBgColor: "#FFE4E4",
    image: null,
  },
  {
    id: "5",
    name: "AI-Core",
    slug: "ai-core",
    description: "Advanced artificial intelligence enabling smart decisions across your network.",
    icon: "brain",
    iconBgColor: "#FFE4E4",
    image: null,
  },
  {
    id: "6",
    name: "IoT",
    slug: "iot",
    description: "Connecting devices intelligently to automate tasks and enhance productivity.",
    icon: "share2",
    iconBgColor: "#F5F5F5",
    image: null,
  },
];

export function TrendingProducts() {
  const [categories, setCategories] = useState<TrendingCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        // First try to fetch categories marked as trending
        const response = await fetch("/api/categories/trending");
        const data = await response.json();

        if (data.data && data.data.length > 0) {
          setCategories(data.data);
        } else {
          // Fallback to old trending-categories API
          const fallbackResponse = await fetch("/api/trending-categories");
          const fallbackData = await fallbackResponse.json();

          if (fallbackData.data && fallbackData.data.length > 0) {
            // Map to TrendingCategory format
            setCategories(fallbackData.data.map((cat: any) => ({
              ...cat,
              slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
            })));
          } else {
            setCategories(defaultCategories);
          }
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
              Our Trending Products
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

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Trending Products
          </h2>
          <p className="mt-3 text-gray-500 text-lg max-w-2xl">
            Explore our most popular enterprise solutions trusted by businesses worldwide
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
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
