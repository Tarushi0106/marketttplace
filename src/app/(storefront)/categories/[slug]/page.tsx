import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ChevronRight,
  Star,
  ArrowRight,
  Package,
  Folder,
  Cloud,
  Shield,
  Wifi,
  Database,
  Settings,
  Share2,
  Server,
  Monitor,
  Lock,
  Brain,
  Sparkles,
  Building2,
  TrendingUp,
  ShoppingBag,
  MessageCircle,
  Zap,
  Globe,
  Cpu,
  HardDrive,
  Network,
  Radio,
  Smartphone,
  Laptop,
  Headphones,
  Mail,
  Video,
  Phone,
  Users,
  BarChart3,
  PieChart,
  FileText,
  Calculator,
  Briefcase,
  CreditCard,
  Layers,
  Box,
  Rocket,
  Target,
  Award,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Extended icon mapping
const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
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
  zap: Zap,
  globe: Globe,
  cpu: Cpu,
  hardDrive: HardDrive,
  network: Network,
  radio: Radio,
  smartphone: Smartphone,
  laptop: Laptop,
  headphones: Headphones,
  mail: Mail,
  video: Video,
  phone: Phone,
  users: Users,
  barChart: BarChart3,
  pieChart: PieChart,
  fileText: FileText,
  calculator: Calculator,
  briefcase: Briefcase,
  creditCard: CreditCard,
  layers: Layers,
  box: Box,
  rocket: Rocket,
  target: Target,
  award: Award,
  checkCircle: CheckCircle,
};

// Color palette for subcategories
const subCategoryColors = [
  { bg: "#DBEAFE", text: "#1E40AF" }, // Blue
  { bg: "#D1FAE5", text: "#065F46" }, // Green
  { bg: "#FEE2E2", text: "#991B1B" }, // Red
  { bg: "#FEF3C7", text: "#92400E" }, // Amber
  { bg: "#E9D5FF", text: "#6B21A8" }, // Purple
  { bg: "#CFFAFE", text: "#0E7490" }, // Cyan
  { bg: "#FCE7F3", text: "#9D174D" }, // Pink
  { bg: "#F3E8FF", text: "#7C3AED" }, // Violet
];

// Icons to cycle through for subcategories
const subCategoryIcons = [
  "cloud", "server", "database", "shield", "zap", "globe", "cpu", "layers",
  "rocket", "target", "network", "laptop", "headphones", "mail", "users", "barChart"
];

function getCategoryIcon(iconName: string | null, className: string) {
  const IconComponent = iconName ? iconComponents[iconName] : null;
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  return <Folder className={className} />;
}

function getSubCategoryIcon(iconName: string | null, index: number, className: string, textColor?: string) {
  // Use specific icon if set, otherwise cycle through icons based on index
  const icon = iconName || subCategoryIcons[index % subCategoryIcons.length];
  const IconComponent = iconComponents[icon];
  const color = textColor || subCategoryColors[index % subCategoryColors.length].text;
if (IconComponent) {
  return <IconComponent className={`${className} text-[${color}]`} />;
}
return <Folder className={`${className} text-[${color}]`} />;

}

function getSubCategoryColor(iconBgColor: string | null, index: number) {
  // Use specific color if set, otherwise cycle through colors
  if (iconBgColor) {
    return { bg: iconBgColor, text: "#374151" };
  }
  return subCategoryColors[index % subCategoryColors.length];
}


async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      subCategories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: { products: { where: { status: "ACTIVE" } } },
          },
        },
      },
      products: {
        where: { status: "ACTIVE" },
        orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }],
        take: 8,
        include: {
          images: { take: 1 },
          _count: { select: { reviews: true } },
        },
      },
      _count: {
        select: { products: { where: { status: "ACTIVE" } } },
      },
    },
  });
  return category;
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Image */}
      <section className="relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="relative h-[280px] md:h-[320px] rounded-2xl overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: category.heroImage
                  ? `url('${category.heroImage}')`
                  : `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80')`,
              }}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-6 md:p-10">
              {/* Breadcrumb */}
              <nav className="mb-4">
                <ol className="flex items-center gap-2 text-sm">
                  <li>
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                      Home
                    </Link>
                  </li>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                  <li>
                    <Link href="/categories" className="text-gray-400 hover:text-white transition-colors">
                      Categories
                    </Link>
                  </li>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                  <li className="text-white font-medium">{category.name}</li>
                </ol>
              </nav>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: category.iconBgColor || '#8B1D1D' }}
                    >
                      {getCategoryIcon(category.icon, "w-6 h-6 text-white")}
                    </div>
                    <span className="text-gray-400 text-sm font-medium">{category._count.products} Products</span>
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="mt-3 text-base md:text-lg text-gray-300 max-w-2xl">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white rounded-lg h-12 px-6"
                    asChild
                  >
                    <Link href={`/products?category=${category.slug}`}>
                      View All Products
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-500 text-white hover:bg-white/10 hover:border-gray-400 rounded-lg h-12 px-6"
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

      {/* Subcategories Section */}
      {category.subCategories.length > 0 && (
        <section className="py-10 md:py-12">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Browse Subcategories
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Explore specialized solutions within {category.name}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {category.subCategories.map((sub, index) => {
                const color = getSubCategoryColor(sub.iconBgColor, index);
                return (
                  <Link
                    key={sub.id}
                    href={`/categories/${category.slug}/${sub.slug}`}
                    className="group"
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center hover:shadow-lg hover:border-gray-300 transition-all duration-300 h-full hover:-translate-y-1">
                      <div
                        className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm"
                        style={{ backgroundColor: color.bg }}
                      >
                        {sub.image ? (
                          <img src={sub.image} alt={sub.name} className="w-7 h-7 object-contain" />
                        ) : (
                          getSubCategoryIcon(sub.icon, index, "w-7 h-7", color.text)
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 group-hover:text-[#8B1D1D] transition-colors line-clamp-2 mb-1">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-gray-500">{sub._count.products} products</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-10 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Top Products in {category.name}
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Popular solutions from this category
              </p>
            </div>
            <Link
              href={`/products?category=${category.slug}`}
              className="hidden md:flex items-center gap-2 text-[#8B1D1D] font-medium hover:underline text-sm"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {category.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.products.map((product) => {
                const hasPrice = Number(product.basePrice) > 0;
                return (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#8B1D1D]/20 transition-all duration-300 h-full group flex flex-col"
                  >
                    {/* Product Image - Clickable */}
                    <Link href={`/products/${product.slug}`}>
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                        {product.images[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center">
                              <span className="text-3xl font-bold text-gray-300">
                                {product.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {product.isFeatured && (
                            <Badge className="bg-gradient-to-r from-[#8B1D1D] to-[#B91C1C] text-white border-0 shadow-lg">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        {product.compareAtPrice && (
                          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                            {Math.round(
                              ((Number(product.compareAtPrice) - Number(product.basePrice)) /
                                Number(product.compareAtPrice)) *
                                100
                            )}% OFF
                          </Badge>
                        )}

                        {/* Logo Overlay */}
                        <div className="absolute bottom-3 left-3">
                          <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center border border-gray-100">
                            <span className="text-sm font-bold text-[#8B1D1D]">
                              {product.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          {category.name}
                        </span>
                      </div>

                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#8B1D1D] transition-colors min-h-[3rem]">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.floor(Number(product.averageRating) || 0)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product._count.reviews})
                        </span>
                      </div>

                      {/* Price & CTA Buttons */}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        {hasPrice && (
                          <div className="mb-3">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{Number(product.basePrice).toLocaleString("en-IN")}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-sm text-gray-400 line-through ml-2">
                                ₹{Number(product.compareAtPrice).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {hasPrice ? (
                            <>
                              <Button
                                size="sm"
                                className="flex-1 bg-[#8B1D1D] hover:bg-[#7A1919] text-white"
                                asChild
                              >
                                <Link href={`/products/${product.slug}#pricing`}>
                                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                                  Buy Now
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-200 hover:border-[#8B1D1D] hover:text-[#8B1D1D]"
                                asChild
                              >
                                <Link href="/contact">
                                  <MessageCircle className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full bg-[#8B1D1D] hover:bg-[#7A1919] text-white"
                              asChild
                            >
                              <Link href="/contact">
                                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                Contact Us
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Products in this category are coming soon. Check back later or explore other categories.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/products">Browse All Products</Link>
              </Button>
            </div>
          )}

          {/* Mobile View All Link */}
          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={`/products?category=${category.slug}`}>
                View All Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Need Help Choosing the Right Solution?
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Our experts can help you find the perfect {category.name.toLowerCase()} solution for your business needs.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white rounded-lg h-12 px-8"
                asChild
              >
                <Link href="/contact">Talk to an Expert</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-white hover:bg-white/10 rounded-lg h-12 px-8"
                asChild
              >
                <Link href={`/products?category=${category.slug}`}>
                  Compare Products
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} | Shaurrya Teleservices`,
    description: category.description || `Browse ${category.name} products and solutions. Find the best enterprise-grade solutions for your business.`,
  };
}
