import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ChevronRight,
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
  Folder,
  Package,
  ArrowRight,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Categories | Shaurrya Teleservices",
  description: "Explore our comprehensive range of enterprise solutions and services. Find cloud infrastructure, security, networking, and more.",
};

// Icon mapping
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
};

function getCategoryIcon(iconName: string | null, className: string) {
  const IconComponent = iconName ? iconComponents[iconName] : null;
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  return <Folder className={className} />;
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
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
      _count: {
        select: { products: { where: { status: "ACTIVE" } } },
      },
    },
  });
  return categories;
}

async function getStats() {
  const [totalProducts, totalCategories, featuredCount] = await Promise.all([
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.product.count({ where: { status: "ACTIVE", isFeatured: true } }),
  ]);
  return { totalProducts, totalCategories, featuredCount };
}

export default async function CategoriesPage() {
  const [categories, stats] = await Promise.all([
    getCategories(),
    getStats(),
  ]);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section - Matching Index Page Style */}
      <section className="relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="relative h-[280px] md:h-[320px] rounded-2xl overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
              }}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-6 md:p-10">
              {/* Breadcrumb */}
              <nav className="mb-4">
                <ol className="flex items-center gap-2 text-sm">
                  <li>
                    <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                      Home
                    </Link>
                  </li>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                  <li className="text-white font-medium">Categories</li>
                </ol>
              </nav>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Browse All Categories
              </h1>
              <p className="mt-3 text-base md:text-lg text-gray-200 max-w-2xl">
                Explore our comprehensive range of enterprise solutions and services.
              </p>

              {/* Stats Row */}
              <div className="mt-6 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#8B1D1D]" />
                  <span className="text-white font-semibold">{stats.totalProducts}+</span>
                  <span className="text-gray-300">Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-[#8B1D1D]" />
                  <span className="text-white font-semibold">{stats.totalCategories}</span>
                  <span className="text-gray-300">Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#8B1D1D]" />
                  <span className="text-white font-semibold">{stats.featuredCount}</span>
                  <span className="text-gray-300">Featured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Featured Categories - Large Cards */}
          {categories.length > 0 && (
            <>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-[#8B1D1D]/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[#8B1D1D]" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Featured Categories
                  </h2>
                  <p className="text-gray-500">Our most popular solution categories</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {categories.slice(0, 2).map((category, index) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group"
                  >
                    <div
                      className="relative rounded-3xl p-8 md:p-10 h-full overflow-hidden transition-all duration-300 hover:shadow-2xl"
                      style={{
                        backgroundColor: category.iconBgColor || "#F3F4F6",
                      }}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `radial-gradient(circle at 2px 2px, ${category.iconBgColor === '#000000' ? '#fff' : '#000'} 1px, transparent 0)`,
                          backgroundSize: '30px 30px'
                        }} />
                      </div>

                      {/* Number Badge */}
                      <div className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center ${
                        category.iconBgColor === '#000000' ? 'bg-white/10' : 'bg-black/5'
                      }`}>
                        <span className={`text-sm font-bold ${
                          category.iconBgColor === '#000000' ? 'text-white/50' : 'text-black/20'
                        }`}>
                          0{index + 1}
                        </span>
                      </div>

                      <div className="relative">
                        {/* Icon */}
                        <div
                          className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
                            category.iconBgColor === "#000000"
                              ? "bg-white/10"
                              : "bg-white/60"
                          } backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}
                        >
                          {getCategoryIcon(
                            category.icon,
                            `w-10 h-10 ${
                              category.iconBgColor === "#000000"
                                ? "text-white"
                                : "text-gray-700"
                            }`
                          )}
                        </div>

                        {/* Content */}
                        <h3
                          className={`text-2xl md:text-3xl font-bold ${
                            category.iconBgColor === "#000000"
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {category.name}
                        </h3>
                        <p
                          className={`mt-3 text-base ${
                            category.iconBgColor === "#000000"
                              ? "text-gray-300"
                              : "text-gray-600"
                          } line-clamp-2 max-w-md`}
                        >
                          {category.description || "Explore our solutions in this category"}
                        </p>

                        {/* Stats */}
                        <div className="mt-6 flex items-center gap-6">
                          <span
                            className={`text-sm ${
                              category.iconBgColor === "#000000"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            <strong
                              className={
                                category.iconBgColor === "#000000"
                                  ? "text-white"
                                  : "text-gray-900"
                              }
                            >
                              {category._count.products}
                            </strong>{" "}
                            Products
                          </span>
                          {category.subCategories.length > 0 && (
                            <span
                              className={`text-sm ${
                                category.iconBgColor === "#000000"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              <strong
                                className={
                                  category.iconBgColor === "#000000"
                                    ? "text-white"
                                    : "text-gray-900"
                                }
                              >
                                {category.subCategories.length}
                              </strong>{" "}
                              Subcategories
                            </span>
                          )}
                        </div>

                        {/* View Link */}
                        <div
                          className={`mt-8 inline-flex items-center gap-2 font-semibold ${
                            category.iconBgColor === "#000000"
                              ? "text-white"
                              : "text-[#8B1D1D]"
                          } group-hover:gap-3 transition-all`}
                        >
                          Explore Category
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* All Categories - Grid */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Folder className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                All Categories
              </h2>
              <p className="text-gray-500">Browse our complete catalog</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-[#8B1D1D]/20 transition-all duration-300 h-full relative overflow-hidden">
                  {/* Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8B1D1D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Number */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#8B1D1D] flex items-center justify-center transition-colors">
                    <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="relative">
                    {/* Category Icon */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: category.iconBgColor || "#F3F4F6",
                      }}
                    >
                      {getCategoryIcon(
                        category.icon,
                        `w-7 h-7 ${
                          category.iconBgColor === "#000000"
                            ? "text-white"
                            : "text-gray-700"
                        }`
                      )}
                    </div>

                    {/* Category Info */}
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#8B1D1D] transition-colors">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-gray-500 text-sm line-clamp-2">
                      {category.description || "Explore our solutions in this category"}
                    </p>

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        <strong className="text-gray-900">{category._count.products}</strong> Products
                      </span>
                      {category.subCategories.length > 0 && (
                        <span className="text-gray-600">
                          <strong className="text-gray-900">{category.subCategories.length}</strong> Subcategories
                        </span>
                      )}
                    </div>

                    {/* Subcategories Preview */}
                    {category.subCategories.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          {category.subCategories.slice(0, 3).map((sub) => (
                            <span
                              key={sub.id}
                              className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 group-hover:bg-[#8B1D1D]/10 group-hover:text-[#8B1D1D] transition-colors"
                            >
                              {sub.name}
                            </span>
                          ))}
                          {category.subCategories.length > 3 && (
                            <span className="px-3 py-1.5 text-xs text-gray-400">
                              +{category.subCategories.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Arrow */}
                    <div className="mt-4 flex items-center text-[#8B1D1D] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View Category
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Check back soon for our product catalog.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/products">Browse All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Can&apos;t Find What You&apos;re Looking For?
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Contact our sales team to discuss custom solutions tailored to your specific business needs.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white rounded-lg h-12 px-8"
                asChild
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-white hover:bg-white/10 rounded-lg h-12 px-8"
                asChild
              >
                <Link href="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
