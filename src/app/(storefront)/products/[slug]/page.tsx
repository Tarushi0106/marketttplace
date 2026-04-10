import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  ChevronRight,
  Star,
  Shield,
  Clock,
  CheckCircle,
  ExternalLink,
  FileText,
  Download,
  MessageSquare,
  ThumbsUp,
  Building2,
  Globe,
  Users,
  Zap,
  Award,
  HeartHandshake,
  Check,
  Play,
  ShoppingBag,
  MessageCircle,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  Rocket,
  Cloud,
  Server,
  Database,
  Lock,
  Headphones,
  Info,
  LayoutGrid,
  CreditCard,
  HelpCircle,
  BookOpen,
  Video,
  HardDrive,
  LayoutDashboard,
  Monitor,
  Globe as GlobeIcon,
  Smartphone,
  Activity,
  BarChart3,
  ScrollText,
  Wifi,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatPrice } from "@/lib/utils";

// Render icon based on icon name
function renderIcon(iconName?: string | null) {
  const props = { size: 28, className: "text-[#C62828]" };

  switch (iconName) {
    case "Cloud":
      return <Cloud {...props} />;
    case "Shield":
      return <Shield {...props} />;
    case "Server":
      return <Server {...props} />;
    case "Database":
      return <Database {...props} />;
    case "Lock":
      return <Lock {...props} />;
    case "Globe":
      return <Globe {...props} />;
    default:
      return <Cloud {...props} />;
  }
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

async function getProductDisplaySetting(): Promise<"card" | "table"> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "product-display" },
    });
    if (setting && setting.value && typeof setting.value === "object") {
      const val = setting.value as { displayFormat?: string };
      if (val.displayFormat === "table") return "table";
    }
    return "card";
  } catch {
    return "card";
  }
}

async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      status: "ACTIVE",
    },
    include: {
      category: true,
      subCategory: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          recurringPrices: true,
        },
      },
      addons: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      configs: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, image: true } },
        },
      },
      seoMetadata: true,
      recurringPrices: true,
    },
  });

  if (product) {
    // Store all recurring prices before filtering (for variant lookup)
    const allRecurringPrices = product.recurringPrices ? [...product.recurringPrices] : [];
    
    // Transform recurringPrices to include variant-specific pricing
    // For standalone products: recurringPrices where variantId is null
    // For variable products: recurringPrices for each variant
    if (product.recurringPrices) {
      // Filter product-level recurring prices (variantId = null)
      product.recurringPrices = product.recurringPrices.filter((rp) => !rp.variantId);
    }
    
    // Ensure variant recurringPrices are properly associated
    if (product.variants) {
      product.variants = product.variants.map((variant) => {
        // Find recurring prices specifically for this variant from the original array
        const variantSpecificPrices = allRecurringPrices.filter((rp) => rp.variantId === variant.id);
        
        if (variantSpecificPrices.length > 0) {
          // Use variant-specific recurring prices
          variant.recurringPrices = variantSpecificPrices;
          // Add transformed object for storefront frontend
          (variant as any).recurringPricesObj = {
            monthly: variantSpecificPrices[0]?.monthlyPrice ? Number(variantSpecificPrices[0].monthlyPrice) : null,
            quarterly: variantSpecificPrices[0]?.quarterlyPrice ? Number(variantSpecificPrices[0].quarterlyPrice) : null,
            yearly: variantSpecificPrices[0]?.yearlyPrice ? Number(variantSpecificPrices[0].yearlyPrice) : null,
            biennial: variantSpecificPrices[0]?.biennialPrice ? Number(variantSpecificPrices[0].biennialPrice) : null,
            triennial: variantSpecificPrices[0]?.triennialPrice ? Number(variantSpecificPrices[0].triennialPrice) : null,
          };
          (variant as any).billingType = 'recurring';
        } else if (variant.recurringPrices && variant.recurringPrices.length > 0) {
          // Variant already has recurring prices (included in query)
          // Keep as is
          (variant as any).recurringPricesObj = {
            monthly: variant.recurringPrices[0]?.monthlyPrice ? Number(variant.recurringPrices[0].monthlyPrice) : null,
            quarterly: variant.recurringPrices[0]?.quarterlyPrice ? Number(variant.recurringPrices[0].quarterlyPrice) : null,
            yearly: variant.recurringPrices[0]?.yearlyPrice ? Number(variant.recurringPrices[0].yearlyPrice) : null,
            biennial: variant.recurringPrices[0]?.biennialPrice ? Number(variant.recurringPrices[0].biennialPrice) : null,
            triennial: variant.recurringPrices[0]?.triennialPrice ? Number(variant.recurringPrices[0].triennialPrice) : null,
          };
          (variant as any).billingType = 'recurring';
        } else {
          // No variant-specific prices - clear to avoid stale data
          variant.recurringPrices = [];
          (variant as any).recurringPricesObj = null;
          (variant as any).billingType = 'one_time';
        }
        return variant;
      });
    }
  }

  if (product) {
    try {
      await prisma.product.update({
        where: { id: product.id },
        data: { viewCount: { increment: 1 } },
      });
    } catch (error) {
      // Silently fail for view count update
    }
  }

  return product;
  } catch (error) {
    console.error('Database connection error:', error);
    return null;
  }
}

async function getRelatedProducts(categoryId: string | null, currentProductId: string) {
  if (!categoryId) return [];

  try {
    return await prisma.product.findMany({
      where: {
        categoryId,
        status: "ACTIVE",
        id: { not: currentProductId },
      },
      include: {
        images: { take: 1 },
        category: true,
      },
      take: 4,
      orderBy: { salesCount: "desc" },
    });
  } catch (error) {
    console.error('Database connection error in getRelatedProducts:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.seoMetadata?.metaTitle || `${product.name} | Shaurrya Teleservices`,
    description: product.seoMetadata?.metaDescription || product.shortDescription || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const [product] = await Promise.all([
    getProduct(slug),
    getProductDisplaySetting(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  const VSAAS_FALLBACK_FEATURES = [
    "AI-Powered Analytics - Leverage AI to detect threats, analyze behavior, and generate real-time insights.",
    "Cloud Video Storage - Securely store and access recordings on the cloud without local infrastructure.",
    "Real-Time Monitoring - View live camera feeds and receive instant alerts on critical events.",
    "Centralized Dashboard - Manage all cameras, sites, and users from a single unified platform.",
    "Multi-Device Access - Access your surveillance system anytime via web or mobile devices.",
    "ONVIF Camera Support - Seamlessly integrate with all ONVIF-compliant cameras across brands.",
    "Plug & Play Deployment - Quick and hassle-free setup with minimal configuration required.",
    "AI-Based Search - Find footage instantly using smart filters like face, object, or event.",
    "Smart Alerts & Notifications - Get automated alerts via app, email, or SMS for any anomalies.",
    "Scalable Architecture - Easily expand across locations without infrastructure limitations.",
  ];

  const dbFeatures = (product.features as string[]) || [];
  // For VSaaS: always use hardcoded list so hosted and local stay in sync
  // regardless of what the DB has stored
  const features = product.slug === 'vsaas' ? VSAAS_FALLBACK_FEATURES : dbFeatures;

  const hasDiscount =
    product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.basePrice)) /
          Number(product.compareAtPrice)) *
          100
      )
    : 0;

  const averageRating = product.averageRating ? Number(product.averageRating) : 4.5;
  const reviewCount = product.reviewCount || 0;

  const isConfigurable = product.productType === "CONFIGURABLE";
  
  // For configurable products, use lowest variant price as starting price
  const startingPrice = isConfigurable && product.variants.length > 0
    ? Math.min(...product.variants.map((v: any) => Number(v.price)))
    : Number(product.basePrice);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <section className="relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="relative h-[280px] md:h-[320px] rounded-2xl overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80')`,
              }}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

            <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
              <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight className="h-4 w-4 text-gray-500" />
                <Link href="/products" className="hover:text-white transition-colors">Products</Link>
                {product.category && (
                  <>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                    <Link href={`/categories/${product.category.slug}`} className="hover:text-white transition-colors">
                      {product.category.name}
                    </Link>
                  </>
                )}
                <ChevronRight className="h-4 w-4 text-gray-500" />
                <span className="text-white truncate max-w-[200px]">{product.slug === 'vsaas' ? 'Video Surveillance as a Service (VSaaS)' : product.name}</span>
              </nav>

              <div className="flex items-start gap-4 mb-4">
                {/* Dynamic Product Icon - Light red background with red icon */}
                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-[#FDECEC] rounded-xl flex items-center justify-center">
                  {renderIcon(product.icon)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {product.isFeatured && <Badge className="bg-amber-500 text-white text-xs shadow-lg">Featured</Badge>}
                    {hasDiscount && <Badge className="bg-green-500 text-white text-xs shadow-lg">{discountPercent}% OFF</Badge>}
                    <Badge variant="outline" className="text-gray-300 border-gray-600 text-xs">
                      {product.productType.replace("_", " ")}
                    </Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                    {product.slug === 'vsaas' ? 'Video Surveillance as a Service (VSaaS)' : product.name}
                  </h1>
                </div>
              </div>

              {product.slug !== 'vsaas' && product.shortDescription && (
                <p className="text-gray-300 max-w-3xl mb-4 line-clamp-2">{product.shortDescription}</p>
              )}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${star <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-gray-600"}`} />
                      ))}
                    </div>
                    <span className="font-medium text-white">{averageRating.toFixed(1)}</span>
                    <span>({reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{product.salesCount || 0}+ users</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {product.slug === 'vsaas' ? (
                    <Button size="lg" className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white" asChild>
                      <a href="/Catalogues.zip" download="Catalogues.zip"><Download className="h-4 w-4 mr-2" />Download Catalogue</a>
                    </Button>
                  ) : (
                    <Button size="lg" className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white" asChild>
                      <Link href={`#pricing`}><ShoppingBag className="h-4 w-4 mr-2" />Pricing</Link>
                    </Button>
                  )}
                  <Button size="lg" className="bg-transparent text-white hover:bg-white/10 rounded-lg h-12 px-8 border border-white/30 hover:border-white/50" asChild>
                    <Link href="/contact"><MessageCircle className="h-4 w-4 mr-2" />Contact Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-[70px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <Tabs defaultValue={tab || "overview"} className="w-full">
            <TabsList className="h-14 w-full justify-start gap-0 bg-transparent p-0 overflow-x-auto">
              <TabsTrigger
                value="overview"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B1D1D] data-[state=active]:text-[#8B1D1D] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
              >
                <Info className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B1D1D] data-[state=active]:text-[#8B1D1D] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Features
              </TabsTrigger>
              {product.slug === 'vsaas' && (
              <TabsTrigger
                value="solutions"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B1D1D] data-[state=active]:text-[#8B1D1D] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
              >
                <Cloud className="h-4 w-4 mr-2" />
                Solutions
              </TabsTrigger>
              )}
              {product.slug !== 'vsaas' && (
              <TabsTrigger
                value="pricing"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B1D1D] data-[state=active]:text-[#8B1D1D] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
                id="pricing"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pricing
              </TabsTrigger>
              )}
              <TabsTrigger
                value="reviews"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B1D1D] data-[state=active]:text-[#8B1D1D] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
              >
                <Star className="h-4 w-4 mr-2" />
                Reviews
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">{reviewCount}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="support"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B1D1D] data-[state=active]:text-[#8B1D1D] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Support
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B1D1D] data-[state=active]:text-[#8B1D1D] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Resources
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <div className="py-10">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0">
                {/* Trust Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 p-6 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">99.99% SLA</p>
                      <p className="text-sm text-gray-500">Guaranteed uptime</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Instant Setup</p>
                      <p className="text-sm text-gray-500">Deploy in minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">AI Intelligence</p>
                      <p className="text-sm text-gray-500">Advanced AI analytics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Headphones className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">24/7 Support</p>
                      <p className="text-sm text-gray-500">Always available</p>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-10">
                    {/* Description */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">About {product.name}</h3>
                      {product.slug === 'vsaas' ? (
                        <div className="space-y-5">
                          <p className="text-gray-600 leading-relaxed">
                            NetNxt VSaaS (Video Surveillance as a Service) is an AI-powered cloud video surveillance platform that delivers real-time monitoring, intelligent analytics, and seamless multi-site management — all without the overhead of on-premise infrastructure.
                          </p>
                          <div>
                            <h4 className="text-base font-bold text-gray-900 mb-3">Customer Benefits</h4>
                            <ul className="space-y-2.5">
                              {[
                                { title: "No CapEx Model", desc: "Eliminate upfront hardware costs with a fully managed cloud solution." },
                                { title: "Anywhere Access", desc: "Monitor your premises from any device, anywhere in the world." },
                                { title: "AI Security", desc: "Proactive threat detection powered by advanced AI algorithms." },
                                { title: "Lower Costs", desc: "Reduce operational expenses compared to traditional CCTV infrastructure." },
                                { title: "Multi-Site Monitoring", desc: "Manage all your locations from a single unified dashboard." },
                                { title: "Fast Investigations", desc: "Quickly search and retrieve footage with intelligent indexing." },
                                { title: "Scalable Solution", desc: "Easily add cameras and users as your business grows." },
                                { title: "Compliance Ready", desc: "Meet industry regulations with encrypted, audit-ready recordings." },
                              ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8B1D1D] flex-shrink-0" />
                                  <span className="text-gray-600 text-sm"><span className="font-semibold text-gray-800">{item.title}</span> — {item.desc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <p className="text-sm text-gray-500 border-l-2 border-[#8B1D1D]/30 pl-3">
                            👉 Compatible with all ONVIF-standard IP cameras — works with your existing hardware.
                          </p>
                        </div>
                      ) : product.description ? (
                        <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                      ) : (
                        <p className="text-gray-600">{product.shortDescription || "No description available."}</p>
                      )}
                    </div>

                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Product Info */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Product Info</h3>
                      <div className="space-y-3">
                        {product.sku && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">SKU</span>
                            <span className="font-mono text-gray-900">{product.sku}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Type</span>
                          <span className="text-gray-900">{product.productType.replace("_", " ")}</span>
                        </div>
                        {product.category && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Category</span>
                            <Link href={`/categories/${product.category.slug}`} className="text-[#8B1D1D] hover:underline">
                              {product.category.name}
                            </Link>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Delivery</span>
                          <span className="text-gray-900">{product.isDigital ? "Instant" : "Shipping"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="mt-0">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-10">
                    <Badge className="mb-4 bg-[#8B1D1D]/10 text-[#8B1D1D] hover:bg-[#8B1D1D]/10">
                      <BadgeCheck className="h-4 w-4 mr-1" /> Features
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">Packed with powerful features to help your business succeed.</p>
                  </div>

                  {features.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {features.map((feature, index) => {
                        const icons = [Video, HardDrive, LayoutDashboard, Monitor, GlobeIcon, Smartphone, Activity, BarChart3, ScrollText, Wifi, Shield, Cloud, Database, Lock, Server];
                        const Icon = icons[index % icons.length];
                        const dashIdx = feature.indexOf(' - ');
                        const title = dashIdx !== -1 ? feature.slice(0, dashIdx) : feature;
                        const desc = dashIdx !== -1 ? feature.slice(dashIdx + 3) : null;
                        return (
                          <div key={index} className="group relative bg-white rounded-2xl border border-gray-100 hover:border-[#8B1D1D]/20 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 p-5 flex gap-4 items-start">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B1D1D] to-[#C62828] flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 leading-snug">{title}</p>
                              {desc && <p className="text-xs text-gray-500 mt-1 leading-snug">{desc}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500">No features listed for this product.</div>
                  )}
                </div>
              </TabsContent>

              {/* Solutions Tab — VSaaS only */}
              <TabsContent value="solutions" className="mt-0">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-10">
                    <Badge className="mb-4 bg-[#8B1D1D]/10 text-[#8B1D1D] hover:bg-[#8B1D1D]/10">
                      <Cloud className="h-4 w-4 mr-1" /> Solutions
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose your deployment model</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">Select the VSaaS solution that best fits your infrastructure and business requirements.</p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* VSaaS On Cloud */}
                    <div className="group p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                        <Cloud className="h-7 w-7" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">VSaaS On Cloud</h3>
                      <p className="text-gray-600 mb-6">
                        Fully managed cloud-hosted video surveillance. No on-site servers required — store, manage, and access all footage securely from anywhere.
                      </p>
                      <ul className="space-y-3 mb-8">
                        {[
                          "Zero infrastructure investment",
                          "Automatic updates & maintenance",
                          "Scalable cloud storage",
                          "Access from any device, anywhere",
                          "Pay-as-you-grow model",
                          "99.99% uptime SLA",
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link href="/products/vsaas/configure?showOnly=cloud">
                        <button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                          Get Started <ArrowRight className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>

                    {/* VSaaS On-Prem */}
                    <div className="group p-8 bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-100 hover:border-[#8B1D1D]/40 hover:shadow-xl transition-all duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B1D1D] to-[#C62828] flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                        <Server className="h-7 w-7" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">VSaaS On-Prem</h3>
                      <p className="text-gray-600 mb-6">
                        Deploy on your own infrastructure for maximum control, data privacy, and compliance. All the power of VSaaS — fully within your network.
                      </p>
                      <ul className="space-y-3 mb-8">
                        {[
                          "Full data sovereignty & privacy",
                          "Works in air-gapped environments",
                          "Integrates with existing hardware",
                          "Customisable to your IT policies",
                          "No internet dependency",
                          "Dedicated on-site support",
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 text-[#8B1D1D] flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link href="/products/vsaas/configure?deployment=onprem&showOnly=onprem">
                        <button className="w-full h-11 bg-[#8B1D1D] hover:bg-[#C62828] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                          Get Started <ArrowRight className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="mt-0">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-6">
                    <Badge className="mb-4 bg-[#8B1D1D]/10 text-[#8B1D1D] hover:bg-[#8B1D1D]/10">
                      <Rocket className="h-4 w-4 mr-1" /> Pricing
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      {isConfigurable ? "Choose your plan" : "Simple pricing"}
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                      {isConfigurable 
                        ? "Flexible pricing options to fit your needs."
                        : "One straightforward price, no hidden fees."}
                    </p>
                  </div>

                  {/* Variants Pricing */}
                  {product.variants && product.variants.length > 0 ? (
                    <div className="space-y-4">
                      {product.variants.map((variant: any) => {
                        const rp = variant.recurringPrices?.[0];
                        const reservedKeys = [
                          'billingType', 'setupFee',
                          'monthlyPrice', 'biMonthlyPrice', 'quarterlyPrice', 'fourMonthlyPrice',
                          'semiAnnualPrice', 'triAnnualPrice', 'yearlyPrice', 'biennialPrice', 'triennialPrice',
                          'monthlySetupFee', 'biMonthlySetupFee', 'quarterlySetupFee', 'fourMonthlySetupFee',
                          'semiAnnualSetupFee', 'triAnnualSetupFee', 'yearlySetupFee', 'biennialSetupFee', 'triennialSetupFee'
                        ];
                        const variantAttrs = variant.attributes as Record<string, string> || {};
                        const billingType = variantAttrs.billingType || 'RECURRING';
                        const isOneTime = billingType === 'ONE_TIME';
                        const allSpecs = Object.entries(variantAttrs).filter(([key]) => !reservedKeys.includes(key));

                        // Get the correct price based on billing type
                        // If recurring, use monthly price from recurringPricesObj
                        // If one-time, use variant.price
                        const displayPrice = isOneTime 
                          ? (variant.price ? Number(variant.price) : 0)
                          : (variant.recurringPricesObj?.monthly || variant.price ? Number(variant.price) : 0);

                        return (
                          <div
                            key={variant.id}
                            className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:shadow-xl ${
                              variant.isDefault
                                ? "border-[#8B1D1D] shadow-lg"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {/* Most Popular Banner */}
                            {variant.isDefault && (
                              <div className="bg-[#8B1D1D] text-white text-center text-xs font-bold py-2 tracking-widest uppercase">
                                Most Popular Plan
                              </div>
                            )}

                            <div className="bg-white">
                              {/* Plan Header Row */}
                              <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-4 border-b border-gray-100 ${variant.isDefault ? "bg-[#8B1D1D]/5" : "bg-gray-50"}`}>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">{variant.name}</h3>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <div className={`text-3xl font-extrabold ${variant.isDefault ? "text-[#8B1D1D]" : "text-gray-900"}`}>
                                      ₹{displayPrice.toLocaleString("en-IN")}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">{isOneTime ? 'one-time' : '/month'}</div>
                                  </div>
                                  <Button
                                    size="lg"
                                    className="h-12 px-8 font-semibold text-base whitespace-nowrap rounded-xl bg-[#8B1D1D] hover:bg-[#7A1919] text-white shadow-md"
                                    asChild
                                  >
                                    <Link href={`/products/${product.slug}/configure?variant=${variant.id}`}>
                                      Get Started <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>

                              {/* Specifications Grid */}
                              {allSpecs.length > 0 && (
                                <div className="px-4 py-4 border-t border-gray-100">
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Specifications</p>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {allSpecs.map(([key, value]) => (
                                      <div key={key} className="flex items-start gap-2.5">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">{key}</p>
                                          <p className="text-sm text-gray-900 font-semibold leading-snug">{value}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : product.configs && product.configs.length > 0 ? (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Customize Your Plan</h3>
                            <p className="text-gray-500 text-sm mt-1">Select configurations that best fit your needs</p>
                          </div>
                          <Badge className="bg-[#8B1D1D] text-white">{product.configs.length} Options Available</Badge>
                        </div>
                        <Button size="lg" className="w-full bg-[#8B1D1D] hover:bg-[#7A1919] text-white" asChild>
                          <Link href={`/products/${product.slug}/configure`}>
                            Configure Now <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                      
                      {/* Show Config Groups */}
                      {Object.entries(
                        product.configs.reduce((acc: any, config: any) => {
                          const group = config.configGroup || 'Other';
                          if (!acc[group]) acc[group] = [];
                          acc[group].push(config);
                          return acc;
                        }, {})
                      ).map(([group, configs]: [string, any]) => (
                        <div key={group} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-900">{group}</h4>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {configs.map((config: any) => (
                              <div key={config.id} className="flex items-center justify-between px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900">{config.name}</p>
                                  {config.description && <p className="text-sm text-gray-500">{config.description}</p>}
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-[#8B1D1D]">
                                    {config.basePrice > 0 ? `${config.basePrice}` : 'Included'}
                                    {config.billingCycle === 'MONTHLY' && <span className="text-sm text-gray-500 font-normal">/mo</span>}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto bg-gray-900 rounded-3xl p-10 text-center">
                      <p className="text-2xl font-semibold text-white mb-2">{formatPrice(startingPrice)}</p>
                      <p className="text-gray-400 mb-8">Simple, straightforward pricing</p>
                      <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 h-14 w-full" asChild>
                        <Link href="/contact"><MessageCircle className="h-5 w-5 mr-2" /> Contact Us</Link>
                      </Button>
                    </div>
                  )}

                  {/* Add-ons */}
                  {(product.addons.length > 0 || product.configs.length > 0) && (
                    <div className="mt-16">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        {product.addons.length > 0 ? 'Available Add-ons' : 'Available Configurations'}
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {product.addons.length > 0 ? (
                          product.addons.map((addon: any) => (
                            <div key={addon.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#8B1D1D]/30 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {addon.pricingType === "ONE_TIME" ? "One-time" : addon.pricingType === "RECURRING_MONTHLY" ? "Monthly" : "Yearly"}
                                </Badge>
                              </div>
                              {addon.description && <p className="text-sm text-gray-500 mb-3">{addon.description}</p>}
                              <p className="text-2xl font-bold text-[#8B1D1D]">{formatPrice(Number(addon.price))}</p>
                            </div>
                          ))
                        ) : (
                          product.configs.slice(0, 9).map((config: any) => (
                            <div key={config.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#8B1D1D]/30 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900">{config.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {config.billingCycle === 'ONE_TIME' ? 'One-time' : config.isRecurring ? 'Monthly' : 'N/A'}
                                </Badge>
                              </div>
                              {config.description && <p className="text-sm text-gray-500 mb-3">{config.description}</p>}
                              <p className="text-2xl font-bold text-[#8B1D1D]">
                                {config.basePrice > 0 ? formatPrice(Number(config.basePrice)) : 'Included'}
                                {config.isRecurring && <span className="text-sm font-normal text-gray-500">/mo</span>}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-0">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                    <Button>Write a Review</Button>
                  </div>

                  {/* Rating Summary */}
                  <div className="flex items-center gap-10 p-8 bg-gray-50 rounded-2xl mb-10">
                    <div className="text-center">
                      <p className="text-6xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                      <div className="flex justify-center my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-5 w-5 ${star <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <p className="text-gray-500">{reviewCount} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="w-3 text-sm text-gray-600">{rating}</span>
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${rating === 5 ? 65 : rating === 4 ? 25 : 10}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews */}
                  {product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.map((review: any) => (
                        <div key={review.id} className="p-6 bg-white border border-gray-100 rounded-2xl">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-600">
                              {review.user?.name?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-gray-900">{review.user?.name || "Anonymous"}</p>
                                <span className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className={`h-4 w-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                                ))}
                              </div>
                              {review.title && <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>}
                              <p className="text-gray-600">{review.content}</p>
                              <div className="flex items-center gap-4 mt-4">
                                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
                                  <ThumbsUp className="h-4 w-4" /> Helpful ({review.helpfulCount || 0})
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No reviews yet. Be the first to review!</p>
                      <Button>Write a Review</Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Support Tab */}
              <TabsContent value="support" className="mt-0">
                <div className="max-w-4xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Support Options</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-5 bg-white border rounded-2xl">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">24/7 Technical Support</p>
                            <p className="text-sm text-gray-500">Round-the-clock assistance via phone, email, and chat</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-5 bg-white border rounded-2xl">
                          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Documentation & Guides</p>
                            <p className="text-sm text-gray-500">Comprehensive docs, tutorials, and API references</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-5 bg-white border rounded-2xl">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Community Forum</p>
                            <p className="text-sm text-gray-500">Connect with other users and share knowledge</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Policies</h3>
                      <Accordion type="single" collapsible className="space-y-3">
                        <AccordionItem value="refund" className="border rounded-2xl px-5">
                          <AccordionTrigger className="hover:no-underline">Refund Policy</AccordionTrigger>
                          <AccordionContent className="text-gray-500">
                            We offer a 30-day money-back guarantee on all products. If you&apos;re not satisfied, contact our support team for a full refund.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="privacy" className="border rounded-2xl px-5">
                          <AccordionTrigger className="hover:no-underline">Privacy Policy</AccordionTrigger>
                          <AccordionContent className="text-gray-500">
                            Your data privacy is our priority. We comply with GDPR, CCPA, and other data protection regulations.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="sla" className="border rounded-2xl px-5">
                          <AccordionTrigger className="hover:no-underline">Service Level Agreement</AccordionTrigger>
                          <AccordionContent className="text-gray-500">
                            We guarantee 99.99% uptime with our enterprise SLA. Downtime credits are automatically applied.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="mt-0">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Documentation & Resources</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Getting Started Guide", type: "PDF • 2.4 MB", icon: FileText, color: "blue" },
                      { title: "API Documentation", type: "Online", icon: ExternalLink, color: "green" },
                      { title: "Video Tutorials", type: "12 videos", icon: Play, color: "amber" },
                      { title: "Case Studies", type: "PDF • 5.1 MB", icon: FileText, color: "purple" },
                      { title: "FAQ", type: "Online", icon: MessageSquare, color: "red" },
                      { title: "Release Notes", type: "Online", icon: FileText, color: "cyan" },
                    ].map((resource, index) => (
                      <a key={index} href="#" className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#8B1D1D]/30 hover:shadow-md transition-all group">
                        <div className={`w-12 h-12 rounded-xl bg-${resource.color}-100 flex items-center justify-center`}>
                          <resource.icon className={`h-6 w-6 text-${resource.color}-500`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover:text-[#8B1D1D] transition-colors">{resource.title}</p>
                          <p className="text-sm text-gray-500">{resource.type}</p>
                        </div>
                        <Download className="h-5 w-5 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
              <Link href="/products" className="text-[#8B1D1D] font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related: any) => (
                <Link key={related.id} href={`/products/${related.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square bg-gray-50 relative">
                    {related.images[0]?.url ? (
                      <Image src={related.images[0].url} alt={related.name} fill className="object-contain p-6 group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Building2 className="h-16 w-16 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-gray-500 mb-1">{related.category?.name}</p>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#8B1D1D] transition-colors line-clamp-2 mb-2">{related.name}</h3>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(Number(related.basePrice))}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}