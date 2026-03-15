import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Cloud, Shield, Wifi, Database, Settings, Share2, Server, Monitor, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
import { Testimonials } from "@/components/storefront/Testimonials";
import { CompanyLogos } from "@/components/storefront/CompanyLogos";
import { prisma } from "@/lib/prisma";
import { SolutionsCarousel } from "@/components/storefront/SolutionsCarousel";

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic';

interface LandingPageSettings {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
  };
  navbar: {
    logoText: string;
    showCategories: boolean;
  };
  companyLogos: {
    enabled: boolean;
    title: string;
  };
  solutions: {
    enabled: boolean;
    title: string;
  };
  featuredProducts: {
    enabled: boolean;
    title: string;
  };
  testimonials: {
    enabled: boolean;
    title: string;
  };
  features: {
    enabled: boolean;
    title: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  stats: {
    enabled: boolean;
    items: Array<{
      value: string;
      label: string;
    }>;
  };
  footer: {
    enabled: boolean;
    companyName: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
    socialLinks: Array<{
      platform: string;
      url: string;
    }>;
  };
}

const defaultSettings: LandingPageSettings = {
  hero: {
    title: "Enterprise Solutions for Growing Business",
    subtitle: "Get started with our cloud hosting solutions",
    ctaText: "Explore Marketplace",
    ctaLink: "/products",
    backgroundImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80",
  },
  navbar: {
    logoText: "NetNxt",
    showCategories: true,
  },
  companyLogos: {
    enabled: true,
    title: "Trusted by Leading Companies",
  },
  solutions: {
    enabled: true,
    title: "Browse Top Solutions",
  },
  featuredProducts: {
    enabled: true,
    title: "Featured Products",
  },
  testimonials: {
    enabled: true,
    title: "What Our Clients Say",
  },
  features: {
    enabled: false,
    title: "Why Choose Us?",
    items: [
      { icon: "zap", title: "Lightning Fast", description: "SSD storage and optimized servers" },
      { icon: "shield", title: "Secure", description: "Enterprise-grade security" },
      { icon: "support", title: "24/7 Support", description: "Round-the-clock customer support" },
    ],
  },
  stats: {
    enabled: false,
    items: [
      { value: "99.99%", label: "Uptime" },
      { value: "50K+", label: "Customers" },
      { value: "15+", label: "Data Centers" },
      { value: "24/7", label: "Support" },
    ],
  },
  footer: {
    enabled: false,
    companyName: "",
    tagline: "",
    address: "",
    phone: "",
    email: "",
    socialLinks: [],
  },
};

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { products: { where: { status: "ACTIVE" } } },
        },
      },
    });

    function getCategoryColors(bgColor: string | null) {
      const colorMap: Record<string, { bgClass: string; titleClass: string; textClass: string; iconBg: string }> = {
        "#000000": { bgClass: "bg-gradient-to-br from-gray-900 to-gray-800", titleClass: "text-white", textClass: "text-gray-300", iconBg: "bg-white/10" },
        "#D4A574": { bgClass: "bg-[#FDF6E9]", titleClass: "text-[#92400E]", textClass: "text-[#78716C]", iconBg: "bg-white/60" },
        "#E5E5E5": { bgClass: "bg-[#F3F4F6]", titleClass: "text-[#111827]", textClass: "text-[#6B7280]", iconBg: "bg-white/80" },
        "#FFE4E4": { bgClass: "bg-[#FEE2E2]", titleClass: "text-[#8B1D1D]", textClass: "text-[#7F1D1D]", iconBg: "bg-white/60" },
        "#F5F5F5": { bgClass: "bg-[#F5F5F5]", titleClass: "text-[#374151]", textClass: "text-[#6B7280]", iconBg: "bg-white/80" },
        "#DBEAFE": { bgClass: "bg-[#DBEAFE]", titleClass: "text-[#1E40AF]", textClass: "text-[#3B82F6]", iconBg: "bg-white/60" },
        "#D1FAE5": { bgClass: "bg-[#D1FAE5]", titleClass: "text-[#065F46]", textClass: "text-[#059669]", iconBg: "bg-white/60" },
        "#FEF3C7": { bgClass: "bg-[#FEF3C7]", titleClass: "text-[#92400E]", textClass: "text-[#D97706]", iconBg: "bg-white/60" },
      };
      return colorMap[bgColor || "#E5E5E5"] || colorMap["#E5E5E5"];
    }

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
  } catch (error) {
    console.error('Database error in getCategories:', error);
    return [];
  }
}

async function getLandingPageSettings(): Promise<LandingPageSettings> {
  // Valid routes for CTA links
  const validCtaRoutes = ["/products", "/categories", "/solutions", "/bundles"];
  
  try {
    const settings = await prisma.setting.findUnique({
      where: { key: "landing-page" },
    });
    
    if (settings && settings.value) {
      const mergedSettings = { ...defaultSettings, ...settings.value as Partial<LandingPageSettings> };
      // Validate ctaLink points to a valid route
      if (mergedSettings.hero?.ctaLink && !validCtaRoutes.some(route => mergedSettings.hero!.ctaLink!.startsWith(route))) {
        mergedSettings.hero.ctaLink = defaultSettings.hero.ctaLink;
      }
      // Force disable footer and features regardless of database settings
      mergedSettings.footer = { ...defaultSettings.footer };
      mergedSettings.features = { ...defaultSettings.features };
      return mergedSettings;
    }
  } catch (error) {
    console.error("Error fetching landing page settings:", error);
  }
  return defaultSettings;
}

function getHeroIcon(iconName: string) {
  const icons: Record<string, typeof Cloud> = {
    cloud: Cloud, shield: Shield, wifi: Wifi, database: Database,
    settings: Settings, share2: Share2, server: Server, monitor: Monitor, lock: Lock,
  };
  return icons[iconName] || Cloud;
}

function getSocialIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case 'facebook': return '📘';
    case 'twitter': return '🐦';
    case 'instagram': return '📷';
    case 'linkedin': return '💼';
    case 'youtube': return '▶️';
    default: return '🔗';
  }
}

export default async function HomePage() {
  const categories = await getCategories();
  const settings = await getLandingPageSettings();
  const { hero, companyLogos, solutions, featuredProducts, testimonials, features, stats, footer } = settings;

  return (
    <div className="bg-white">
      {/* Hero Banner Section */}
      {hero && (
        <section className="relative">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
            <div className="relative h-[500px] md:h-[550px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${hero.backgroundImage || defaultSettings.hero.backgroundImage}')` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a3e]/85 via-[#2a1a5e]/60 to-transparent" />
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 right-10 w-80 h-80 bg-[#8B1D1D]/40 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-40 w-64 h-64 bg-blue-400/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-purple-400/25 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-400/20 rounded-full blur-2xl"></div>
              </div>
              <div className="relative h-full flex items-center px-8 md:px-12 lg:px-16">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
                    <span className="text-white/90 text-sm font-medium">Choose. Click. Launch.</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-slide-up">{hero.title}</h1>
                  <p className="mt-4 text-lg text-white/80">{hero.subtitle}</p>
                  <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <Link
                      href={hero.ctaLink || "/products"}
                      className="inline-flex items-center justify-center bg-[#8B1D1D] hover:bg-[#7A1919] text-white rounded-lg h-12 px-8 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 transition-all hover:scale-105 font-medium"
                    >
                      {hero.ctaText}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link
                      href="/categories"
                      className="inline-flex items-center justify-center bg-transparent text-white hover:bg-white/10 rounded-lg h-12 px-8 backdrop-blur-sm hover:scale-105 transition-all border border-white/30 hover:border-white/50 font-medium"
                    >
                      View Solutions
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                  {stats.enabled && (
                    <div className="mt-12 flex items-center gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      {stats.items.map((stat, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-white/80 text-sm">{stat.value} {stat.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Company Logos */}
      {companyLogos?.enabled && <CompanyLogos />}

      {/* Solutions Carousel */}
      {solutions?.enabled && <SolutionsCarousel categories={categories} />}

      {/* Featured Products */}
      {featuredProducts?.enabled && <FeaturedProducts />}

      {/* Testimonials */}
      {testimonials?.enabled && <Testimonials />}

      {/* Features Section */}
      {features?.enabled && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{features.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.items.map((feature, index) => {
                const Icon = getHeroIcon(feature.icon);
                return (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-14 h-14 bg-[#8B1D1D]/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-[#8B1D1D]" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      {footer?.enabled && (
        <footer className="bg-[#0f172a] text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">{footer.companyName}</h3>
                <p className="text-gray-400">{footer.tagline}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <p className="text-gray-400">{footer.address}</p>
                <p className="text-gray-400 mt-2">{footer.phone}</p>
                <p className="text-gray-400">{footer.email}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <div className="space-y-2">
                  <Link href="/products" className="block text-gray-400 hover:text-white">Products</Link>
                  <Link href="/categories" className="block text-gray-400 hover:text-white">Categories</Link>
                  <Link href="/about" className="block text-gray-400 hover:text-white">About Us</Link>
                  <Link href="/contact" className="block text-gray-400 hover:text-white">Contact</Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  {footer.socialLinks.map((social, index) => (
                    <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="text-2xl">
                      {getSocialIcon(social.platform)}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>© {new Date().getFullYear()} {footer.companyName}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
