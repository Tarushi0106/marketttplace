"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Cloud, Shield, Wifi, Database, Settings, Share2, Server, Monitor, Lock, Brain, Folder, ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  iconBgColor: string | null;
  productCount: number;
  bgClass: string;
  titleClass: string;
  textClass: string;
  iconBg: string;
}

interface SolutionsCarouselProps {
  categories: Category[];
  iconMap: Record<string, React.ReactNode>;
}

// Icon mapping
const defaultIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  shield: Shield,
  cloud: Cloud,
  settings: Settings,
  brain: Brain,
  share2: Share2,
  database: Database,
  server: Server,
  monitor: Monitor,
  lock: Lock,
};

export function SolutionsCarousel({ categories }: SolutionsCarouselProps) {
  const solutionsScrollRef = useRef<HTMLDivElement>(null);

  const scrollSolutionsLeft = () => {
    if (solutionsScrollRef.current) {
      solutionsScrollRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollSolutionsRight = () => {
    if (solutionsScrollRef.current) {
      solutionsScrollRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  const getIcon = (iconName: string | null, className: string) => {
    const IconComponent = iconName ? defaultIconMap[iconName] : null;
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return <Folder className={className} />;
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Browse Top Solutions
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-2xl">
              Discover our comprehensive range of enterprise solutions designed to transform your business operations.
            </p>
          </div>
          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={scrollSolutionsLeft}
              className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={scrollSolutionsRight}
              className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          ref={solutionsScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex-shrink-0 snap-start group"
            >
              <div
                className={`${category.bgClass} rounded-3xl w-[280px] md:w-[300px] h-[320px] flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden`}
              >
                {/* Top Section with Icon */}
                <div className="p-6 pb-0">
                  <div className={`w-12 h-12 rounded-xl ${category.iconBg} flex items-center justify-center mb-5`}>
                    {getIcon(category.icon, `w-6 h-6 ${category.titleClass}`)}
                  </div>

                  <h3 className={`${category.titleClass} text-xl font-bold leading-tight`}>
                    {category.name}
                  </h3>
                  <p className={`${category.textClass} mt-2 text-sm leading-relaxed line-clamp-2 opacity-80`}>
                    {category.description || `Explore our ${category.name.toLowerCase()} products and solutions.`}
                  </p>
                </div>

                {/* Bottom Section */}
                <div className="mt-auto p-6 pt-4">
                  <div className="flex items-center justify-between">
                    <span className={`${category.textClass} text-sm opacity-70`}>
                      {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                    </span>
                    <div className={`w-10 h-10 rounded-full ${category.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <ArrowRight className={`w-5 h-5 ${category.titleClass} group-hover:translate-x-0.5 transition-transform`} />
                    </div>
                  </div>
                </div>

                {/* Decorative element */}
                <div className={`absolute -bottom-16 -right-16 w-40 h-40 rounded-full ${category.iconBg} opacity-50`} />
              </div>
            </Link>
          ))}

          {/* View All Card */}
          <Link
            href="/categories"
            className="flex-shrink-0 snap-start group"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl w-[280px] md:w-[300px] h-[320px] flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-8 right-8 w-20 h-20 rounded-full border border-white/10" />
              <div className="absolute bottom-8 left-8 w-16 h-16 rounded-full border border-white/10" />

              <div className="relative z-10 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  View All Categories
                </h3>
                <p className="mt-2 text-white/50 text-sm">
                  Explore our complete catalog
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
