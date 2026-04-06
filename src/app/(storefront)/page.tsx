import Link from "next/link";
import { ArrowRight, Check, ChevronRight, ChevronLeft, Cloud, Shield, Wifi, Database, Settings, Share2, Server, Monitor, Lock, Brain, Sparkles, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
import { TrendingProducts } from "@/components/storefront/TrendingProducts";
import { Testimonials } from "@/components/storefront/Testimonials";
import { prisma } from "@/lib/prisma";
import { SolutionsCarousel } from "@/components/storefront/SolutionsCarousel";

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

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div className="bg-white">
      {/* Hero Banner Section */}
      <section className="relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
            {/* Background Image - Earth from space */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')`,
              }}
            />
            {/* Dark Overlay with gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-transparent" />

            {/* Content - Left aligned */}
            <div className="relative h-full flex items-center pb-12 md:pb-16 px-8 md:px-12 lg:px-16">
              <div className="max-w-2xl">
                {/* Pill label */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
                  Choose. Click. Launch.
                </div>
                
                {/* Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Enterprise Solutions for Growing Business
                </h1>
                
                {/* Subheading */}
                <p className="mt-6 text-base md:text-lg text-gray-300 leading-relaxed max-w-xl">
                  Get started with our cloud hosting solutions
                </p>
                
                {/* Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-12 px-8"
                    asChild
                  >
                    <Link href="/products">
                      Explore Marketplace
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-black/30 backdrop-blur-sm text-white hover:bg-white/10 rounded-lg h-12 px-8"
                    asChild
                  >
                    <Link href="/solutions">
                      View Solutions
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Top Solutions Section - From Database */}
      <SolutionsCarousel categories={categories} iconMap={iconMap} />

      {/* Hero Product Section */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-white max-w-2xl">
              <div className="inline-flex items-center px-4 py-1.5 bg-red-600 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Video Surveillance
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Transform Your Security with <span className="text-red-500">VSaaS</span>
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Experience next-generation AI video surveillance that sees, thinks, and acts. 
                From real-time threat detection to crowd analytics — secure your premises with 
                intelligent monitoring that works 24/7.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="/heropage" 
                  className="inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all hover:shadow-lg hover:shadow-red-600/25"
                >
                  Explore VSaaS
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
                <a 
                  href="/products/vsaas" 
                  className="inline-flex items-center px-8 py-4 border-2 border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
                >
                  View Solutions
                </a>
              </div>
              <div className="flex items-center gap-8 mt-10 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>99.9% Uptime — Always watching, never sleeping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>AI-Powered — Learns and adapts to your environment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>24/7 Support — We're here whenever you need us</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Cloud Storage — Your footage, safe and accessible anywhere</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Real-Time Alerts — Know the moment something happens</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                {/* Main Image Container */}
                <div className="w-80 h-80 rounded-2xl overflow-hidden shadow-2xl shadow-red-600/30">
                  <img 
                    src="/uploads/vsaas pic1.jpeg" 
                    alt="AI Video Surveillance" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating Brain Icon */}
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                  <Brain className="w-12 h-12 text-red-500" />
                </div>
                {/* Floating Video Icon */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                  <Video className="w-12 h-12 text-red-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section - From Backend */}
      <FeaturedProducts />

      {/* Our Trending Products Section - From Backend */}
      <TrendingProducts />

      {/* What our Clients Say Section - From Backend */}
      <Testimonials />
    </div>
  );
}
