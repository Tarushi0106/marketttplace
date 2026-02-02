import Link from "next/link";
import { ArrowRight, Check, ChevronRight, ChevronLeft, Cloud, Shield, Wifi, Database, Settings, Share2, Server, Monitor, Lock, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
import { TrendingProducts } from "@/components/storefront/TrendingProducts";
import { Testimonials } from "@/components/storefront/Testimonials";
import { CompanyLogos } from "@/components/storefront/CompanyLogos";
import { prisma } from "@/lib/prisma";
import { SolutionsCarousel } from "@/components/storefront/SolutionsCarousel";
import { BundlesSection } from "@/components/storefront/BundlesSection";

// Icon mapping for categories
const iconMap: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-12 h-12" />,
  shield: <Shield className="w-12 h-12" />,
  cloud: <Cloud className="w-12 h-12" />,
  settings: <Settings className="w-12 h-12" />,
  brain: <Brain className="w-12 h-12" />,
  share2: <Share2 className="w-12 h-12" />,
  database: <Database className="w-12 h-12" />,
  server: <Server className="w-12 h-12" />,
  monitor: <Monitor className="w-12 h-12" />,
  lock: <Lock className="w-12 h-12" />,
};

// Color mappings based on iconBgColor
function getCategoryColors(bgColor: string | null) {
  const colorMap: Record<string, { bgClass: string; titleClass: string; textClass: string; iconBg: string }> = {
    "#000000": {
      bgClass: "bg-[#1A1A1A]",
      titleClass: "text-white",
      textClass: "text-gray-400",
      iconBg: "bg-gray-700",
    },
    "#D4A574": {
      bgClass: "bg-[#FDF6E9]",
      titleClass: "text-[#92400E]",
      textClass: "text-[#78716C]",
      iconBg: "bg-white/60",
    },
    "#E5E5E5": {
      bgClass: "bg-[#F3F4F6]",
      titleClass: "text-[#111827]",
      textClass: "text-[#6B7280]",
      iconBg: "bg-white/80",
    },
    "#FFE4E4": {
      bgClass: "bg-[#FEE2E2]",
      titleClass: "text-[#8B1D1D]",
      textClass: "text-[#7F1D1D]",
      iconBg: "bg-white/60",
    },
    "#F5F5F5": {
      bgClass: "bg-[#F5F5F5]",
      titleClass: "text-[#374151]",
      textClass: "text-[#6B7280]",
      iconBg: "bg-white/80",
    },
    "#DBEAFE": {
      bgClass: "bg-[#DBEAFE]",
      titleClass: "text-[#1E40AF]",
      textClass: "text-[#3B82F6]",
      iconBg: "bg-white/60",
    },
    "#D1FAE5": {
      bgClass: "bg-[#D1FAE5]",
      titleClass: "text-[#065F46]",
      textClass: "text-[#059669]",
      iconBg: "bg-white/60",
    },
    "#FEF3C7": {
      bgClass: "bg-[#FEF3C7]",
      titleClass: "text-[#92400E]",
      textClass: "text-[#D97706]",
      iconBg: "bg-white/60",
    },
  };

  return colorMap[bgColor || "#E5E5E5"] || colorMap["#E5E5E5"];
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { products: { where: { status: "ACTIVE" } } },
      },
    },
  });

  return categories.map((cat) => {
    const colors = getCategoryColors(cat.iconBgColor);
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      iconBgColor: cat.iconBgColor,
      productCount: cat._count.products,
      ...colors,
    };
  });
}

async function getFeaturedBundles() {
  const bundles = await prisma.bundle.findMany({
    where: {
      status: "ACTIVE",
      isFeatured: true,
    },
    take: 2,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
        take: 4,
      },
    },
  });

  return bundles.map((bundle) => ({
    id: bundle.id,
    name: bundle.name,
    slug: bundle.slug,
    description: bundle.shortDescription || bundle.description,
    price: Number(bundle.price),
    originalPrice: bundle.compareAtPrice ? Number(bundle.compareAtPrice) : null,
    items: bundle.items.map((item) => item.product.name),
  }));
}

async function getStats() {
  const [productCount, categoryCount, reviewCount] = await Promise.all([
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.review.count({ where: { isApproved: true } }),
  ]);

  return { productCount, categoryCount, reviewCount };
}

export default async function HomePage() {
  const [categories, featuredBundles, stats] = await Promise.all([
    getCategories(),
    getFeaturedBundles(),
    getStats(),
  ]);

  return (
    <div className="bg-white">
      {/* Hero Banner Section */}
      <section className="relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="relative h-[500px] md:h-[550px] rounded-2xl overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
              }}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Content */}
            <div className="relative h-full flex items-end pb-12 md:pb-16 px-8 md:px-12 lg:px-16">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Powering Enterprise
                  <br />
                  Digital Transformation
                </h1>
                <p className="mt-6 text-base md:text-lg text-gray-200 leading-relaxed max-w-xl">
                  Accelerate your business growth with our comprehensive suite of enterprise-grade connectivity, cloud infrastructure, and SaaS solutions. Trusted by leading organizations worldwide.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white rounded-lg h-12 px-8"
                    asChild
                  >
                    <Link href="/products">
                      Explore Solutions
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 rounded-lg h-12 px-8"
                    asChild
                  >
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos - Auto Scrolling */}
      <CompanyLogos />

      {/* Browse Top Solutions Section - From Database */}
      <SolutionsCarousel categories={categories} iconMap={iconMap} />

      {/* Featured Products Section - From Backend */}
      <FeaturedProducts />

      {/* Our Trending Products Section - From Backend */}
      <TrendingProducts />

      {/* What our Clients Say Section - From Backend */}
      <Testimonials />

      {/* Bundles Section - From Database */}
      <BundlesSection bundles={featuredBundles} />

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-[#8B1D1D]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white">99.99%</div>
              <div className="mt-2 text-white/80">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white">{stats.productCount}+</div>
              <div className="mt-2 text-white/80">Products</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white">{stats.categoryCount}+</div>
              <div className="mt-2 text-white/80">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white">24/7</div>
              <div className="mt-2 text-white/80">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-2xl p-8 md:p-12 lg:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Scale Your Infrastructure?
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Join thousands of businesses that trust Shaurrya Teleservices for their network infrastructure needs.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white rounded-lg h-12 px-8"
                asChild
              >
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-white hover:bg-white/10 rounded-lg h-12 px-8"
                asChild
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
