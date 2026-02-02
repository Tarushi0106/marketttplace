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
  Headphones,
  Info,
  LayoutGrid,
  CreditCard,
  HelpCircle,
  BookOpen,
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
import { formatCurrency } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
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
    },
  });

  if (product) {
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return product;
}

async function getRelatedProducts(categoryId: string | null, currentProductId: string) {
  if (!categoryId) return [];

  return prisma.product.findMany({
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

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  const features = (product.features as string[]) || [];
  const specifications = (product.specifications as Record<string, string>) || {};

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

  const hasPricing = Number(product.basePrice) > 0 || product.variants.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image */}
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
                <span className="text-white truncate max-w-[200px]">{product.name}</span>
              </nav>

              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                  {product.brandLogo ? (
                    <Image src={product.brandLogo} alt={`${product.name} logo`} width={80} height={80} className="w-full h-full object-contain p-2" />
                  ) : product.images[0]?.url ? (
                    <Image src={product.images[0].url} alt={product.name} width={80} height={80} className="w-full h-full object-contain p-2" />
                  ) : (
                    <Building2 className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {product.isFeatured && <Badge className="bg-amber-500 text-white text-xs shadow-lg">Featured</Badge>}
                    {hasDiscount && <Badge className="bg-green-500 text-white text-xs shadow-lg">{discountPercent}% OFF</Badge>}
                    <Badge variant="outline" className="text-gray-300 border-gray-600 text-xs">
                      {product.productType.replace("_", " ")}
                    </Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">{product.name}</h1>
                </div>
              </div>

              {product.shortDescription && (
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
                  {hasPricing ? (
                    <>
                      <Button size="lg" className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white" asChild>
                        <a href="#pricing"><ShoppingBag className="h-4 w-4 mr-2" />Buy Now</a>
                      </Button>
                      <Button size="lg" variant="outline" className="border-gray-500 text-white hover:bg-white/10 hover:border-gray-400" asChild>
                        <Link href="/contact"><MessageCircle className="h-4 w-4 mr-2" />Contact Us</Link>
                      </Button>
                    </>
                  ) : (
                    <Button size="lg" className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white" asChild>
                      <Link href="/contact"><MessageCircle className="h-4 w-4 mr-2" />Contact Us</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-[70px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <Tabs defaultValue="overview" className="w-full">
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
              <TabsTrigger
                value="pricing"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B1D1D] data-[state=active]:text-[#8B1D1D] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
                id="pricing"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pricing
              </TabsTrigger>
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
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">30-Day Refund</p>
                      <p className="text-sm text-gray-500">Money back guarantee</p>
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
                    {/* Image Gallery */}
                    {product.images.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Gallery</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {product.images.slice(0, 4).map((image, index) => (
                            <div
                              key={image.id}
                              className={`relative rounded-2xl overflow-hidden bg-gray-100 ${index === 0 ? "col-span-2 aspect-video" : "aspect-square"}`}
                            >
                              <Image src={image.url} alt={image.alt || product.name} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">About {product.name}</h3>
                      {product.description ? (
                        <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                      ) : (
                        <p className="text-gray-600">{product.shortDescription || "No description available."}</p>
                      )}
                    </div>

                    {/* Quick Features */}
                    {features.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {features.slice(0, 6).map((feature, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                        {features.length > 6 && (
                          <p className="mt-3 text-sm text-[#8B1D1D] font-medium">+{features.length - 6} more features in Features tab</p>
                        )}
                      </div>
                    )}
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

                    {/* Specs Preview */}
                    {Object.keys(specifications).length > 0 && (
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Specifications</h3>
                        <div className="space-y-3">
                          {Object.entries(specifications).slice(0, 5).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-500">{key}</span>
                              <span className="font-medium text-gray-900">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick CTA */}
                    <div className="bg-[#8B1D1D] rounded-2xl p-6 text-center">
                      <p className="text-white/80 text-sm mb-2">Starting from</p>
                      <p className="text-3xl font-bold text-white mb-4">
                        {hasPricing ? formatCurrency(Number(product.basePrice)) : "Custom"}
                        {hasPricing && <span className="text-lg font-normal">/mo</span>}
                      </p>
                      <Button className="w-full bg-white text-[#8B1D1D] hover:bg-gray-100" asChild>
                        <a href="#pricing">View Pricing</a>
                      </Button>
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
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#8B1D1D]/30 hover:shadow-md transition-all group">
                          <div className="w-10 h-10 rounded-xl bg-green-100 group-hover:bg-green-500 flex items-center justify-center flex-shrink-0 transition-colors">
                            <Check className="h-5 w-5 text-green-600 group-hover:text-white transition-colors" />
                          </div>
                          <span className="text-gray-700 pt-2">{feature}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500">No features listed for this product.</div>
                  )}

                  {/* Specifications */}
                  {Object.keys(specifications).length > 0 && (
                    <div className="mt-16">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Technical Specifications</h3>
                      <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                        {Object.entries(specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-500">{key}</span>
                            <span className="font-semibold text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="mt-0">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-10">
                    <Badge className="mb-4 bg-[#8B1D1D]/10 text-[#8B1D1D] hover:bg-[#8B1D1D]/10">
                      <Rocket className="h-4 w-4 mr-1" /> Pricing
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose your plan</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">Flexible pricing options to fit your needs.</p>
                  </div>

                  {product.variants.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-6">
                      {product.variants.map((variant: any) => (
                        <div
                          key={variant.id}
                          className={`relative bg-white rounded-3xl p-8 ${variant.isDefault ? "ring-2 ring-[#8B1D1D] shadow-xl" : "border border-gray-200"}`}
                        >
                          {variant.isDefault && (
                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B1D1D]">Most Popular</Badge>
                          )}
                          <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{variant.name}</h3>
                            <p className="text-4xl font-bold text-gray-900">
                              {formatCurrency(Number(variant.price))}
                              <span className="text-base font-normal text-gray-500">/mo</span>
                            </p>
                          </div>
                          {variant.attributes && (
                            <ul className="space-y-3 mb-8">
                              {Object.entries(variant.attributes as Record<string, string>).map(([key, value]) => (
                                <li key={key} className="flex items-center gap-3 text-sm">
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                  <span className="text-gray-600 capitalize">{key}:</span>
                                  <span className="font-medium text-gray-900">{value}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          <Button className={`w-full h-12 ${variant.isDefault ? "bg-[#8B1D1D] hover:bg-[#7A1919]" : ""}`} variant={variant.isDefault ? "default" : "outline"}>
                            Get Started <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : hasPricing ? (
                    <div className="max-w-md mx-auto bg-white rounded-3xl p-10 text-center shadow-lg border">
                      <p className="text-5xl font-bold text-gray-900 mb-1">
                        {formatCurrency(Number(product.basePrice))}
                        <span className="text-xl font-normal text-gray-500">/mo</span>
                      </p>
                      {hasDiscount && <p className="text-gray-400 line-through mb-6">{formatCurrency(Number(product.compareAtPrice))}</p>}
                      <div className="space-y-3">
                        <Button size="lg" className="w-full bg-[#8B1D1D] hover:bg-[#7A1919] h-14">
                          <ShoppingBag className="h-5 w-5 mr-2" /> Buy Now
                        </Button>
                        <Button size="lg" variant="outline" className="w-full h-14" asChild>
                          <Link href="/contact">Contact Sales</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto bg-gray-900 rounded-3xl p-10 text-center">
                      <p className="text-2xl font-semibold text-white mb-2">Custom Pricing</p>
                      <p className="text-gray-400 mb-8">Get a personalized quote for your business</p>
                      <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 h-14 w-full" asChild>
                        <Link href="/contact"><MessageCircle className="h-5 w-5 mr-2" /> Contact Us</Link>
                      </Button>
                    </div>
                  )}

                  {/* Add-ons */}
                  {product.addons.length > 0 && (
                    <div className="mt-16">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Available Add-ons</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {product.addons.map((addon: any) => (
                          <div key={addon.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#8B1D1D]/30 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {addon.pricingType === "ONE_TIME" ? "One-time" : addon.pricingType === "RECURRING_MONTHLY" ? "Monthly" : "Yearly"}
                              </Badge>
                            </div>
                            {addon.description && <p className="text-sm text-gray-500 mb-3">{addon.description}</p>}
                            <p className="text-2xl font-bold text-[#8B1D1D]">{formatCurrency(Number(addon.price))}</p>
                          </div>
                        ))}
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
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(Number(related.basePrice))}<span className="text-sm font-normal text-gray-500">/mo</span></p>
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
