import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ChevronRight,
  Star,
  ArrowRight,
  Package,
  Building2,
  Grid3X3,
  LayoutGrid,
  List,
  Sparkles,
  ShoppingBag,
  MessageCircle,
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
  Zap,
  Globe,
  Cpu,
  HardDrive,
  Network,
  Layers,
  Rocket,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductFilters, ProductSortSelect } from "@/components/storefront/ProductFilters";
import type { Prisma } from "@prisma/client";

// Icon mapping for subcategories
const iconComponents: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  cloud: Cloud, server: Server, database: Database, shield: Shield, zap: Zap,
  globe: Globe, cpu: Cpu, layers: Layers, rocket: Rocket, target: Target,
  network: Network, wifi: Wifi, settings: Settings, brain: Brain, monitor: Monitor,
  lock: Lock, share2: Share2, hardDrive: HardDrive,
};

const subCategoryColors = [
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEE2E2", text: "#991B1B" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#E9D5FF", text: "#6B21A8" },
  { bg: "#CFFAFE", text: "#0E7490" },
];

const subCategoryIcons = ["cloud", "server", "database", "shield", "zap", "globe", "cpu", "layers"];

function getSubCategoryStyle(index: number) {
  return subCategoryColors[index % subCategoryColors.length];
}

function getSubCategoryIcon(iconName: string | null, index: number, className: string, color: string) {
  const icon = iconName || subCategoryIcons[index % subCategoryIcons.length];
  const IconComponent = iconComponents[icon];
  if (IconComponent) {
    return <IconComponent className={className} style={{ color }} />;
  }
  return <Folder className={className} style={{ color }} />;
}

interface SubCategoryPageProps {
  params: Promise<{ slug: string; sub: string }>;
  searchParams: Promise<{
    search?: string;
    type?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
    inStock?: string;
    featured?: string;
    view?: string;
  }>;
}


async function getSubCategory(categorySlug: string, subSlug: string) {
  const subCategory = await prisma.subCategory.findFirst({
    where: {
      slug: subSlug,
      isActive: true,
      category: {
        slug: categorySlug,
        isActive: true,
      },
    },
    include: {
      category: {
        include: {
          subCategories: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              iconBgColor: true,
              _count: {
                select: { products: { where: { status: "ACTIVE" } } },
              },
            },
          },
        },
      },
      _count: {
        select: { products: { where: { status: "ACTIVE" } } },
      },
    },
  });
  return subCategory;
}

async function getProducts(
  subCategoryId: string,
  searchParams: Awaited<SubCategoryPageProps["searchParams"]>
) {
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    subCategoryId,
  };

  const types = Array.isArray(searchParams.type)
    ? searchParams.type
    : searchParams.type
    ? [searchParams.type]
    : [];

  if (types.length > 0) {
    where.productType = { in: types as any[] };
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.basePrice = {};
    if (searchParams.minPrice) {
      where.basePrice.gte = parseFloat(searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      where.basePrice.lte = parseFloat(searchParams.maxPrice);
    }
  }

  if (searchParams.inStock === "true") {
    where.stockQuantity = { gt: 0 };
  }

  if (searchParams.featured === "true") {
    where.isFeatured = true;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

  switch (searchParams.sortBy) {
    case "price-asc":
      orderBy = { basePrice: "asc" };
      break;
    case "price-desc":
      orderBy = { basePrice: "desc" };
      break;
    case "rating":
      orderBy = { averageRating: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "popularity":
    default:
      orderBy = { viewCount: "desc" };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 2,
        },
        _count: { select: { reviews: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getPriceRange(subCategoryId: string) {
  const result = await prisma.product.aggregate({
    where: { status: "ACTIVE", subCategoryId },
    _min: { basePrice: true },
    _max: { basePrice: true },
  });

  return {
    min: Math.floor(Number(result._min.basePrice) || 0),
    max: Math.ceil(Number(result._max.basePrice) || 10000),
  };
}

async function getProductTypeCounts(subCategoryId: string) {
  const counts = await prisma.product.groupBy({
    by: ["productType"],
    where: { status: "ACTIVE", subCategoryId },
    _count: true,
  });

  const typeMap: Record<string, { value: string; label: string; count: number }> = {
    STANDALONE: { value: "STANDALONE", label: "Standalone", count: 0 },
    WITH_ADDONS: { value: "WITH_ADDONS", label: "With Add-ons", count: 0 },
    CONFIGURABLE: { value: "CONFIGURABLE", label: "Configurable", count: 0 },
  };

  counts.forEach((item) => {
    if (typeMap[item.productType]) {
      typeMap[item.productType].count = item._count;
    }
  });

  return Object.values(typeMap).filter((t) => t.count > 0);
}

export default async function SubCategoryPage({
  params,
  searchParams,
}: SubCategoryPageProps) {
  const { slug, sub } = await params;
  const searchParamsResolved = await searchParams;
  const subCategory = await getSubCategory(slug, sub);

  if (!subCategory) {
    notFound();
  }

  const category = subCategory.category;
  const viewMode = searchParamsResolved.view || "grid";

  const [{ products, pagination }, priceRange, productTypes] = await Promise.all([
    getProducts(subCategory.id, searchParamsResolved),
    getPriceRange(subCategory.id),
    getProductTypeCounts(subCategory.id),
  ]);

  const siblingSubcategories = category.subCategories.filter(
    (s) => s.id !== subCategory.id
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Image */}
      <section className="relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="relative h-[240px] md:h-[280px] rounded-2xl overflow-hidden">
            {/* Background Image - use category heroImage or default */}
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
                <ol className="flex items-center gap-2 text-sm flex-wrap">
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
                  <li>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                  <li className="text-white font-medium">{subCategory.name}</li>
                </ol>
              </nav>

              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400 font-medium">{category.name}</span>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-400 font-medium">{pagination.total} Products</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {subCategory.name}
              </h1>
              {subCategory.description && (
                <p className="mt-3 text-base md:text-lg text-gray-300 max-w-2xl">
                  {subCategory.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Subcategory Quick Links */}
      {siblingSubcategories.length > 0 && (
        <section className="border-b border-gray-100">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <Link
                href={`/categories/${category.slug}`}
                className="flex-shrink-0 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-[#8B1D1D] hover:text-white transition-colors"
              >
                All {category.name}
              </Link>
              <span className="h-5 w-px bg-gray-200" />
              {category.subCategories.map((sibling) => (
                <Link
                  key={sibling.id}
                  href={`/categories/${category.slug}/${sibling.slug}`}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sibling.id === subCategory.id
                      ? "bg-[#8B1D1D] text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {sibling.name}
                  <span className="ml-1 opacity-60">({sibling._count.products})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-6 md:py-10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <ProductFilters
              categories={[]}
              productTypes={productTypes}
              minPrice={priceRange.min}
              maxPrice={priceRange.max}
              totalProducts={pagination.total}
            />

            {/* Products Grid */}
            <div className="flex-1">
              {/* Top bar */}
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
                    {" - "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{" "}
                  of <span className="font-semibold text-gray-900">{pagination.total}</span> products
                </p>
                <div className="flex items-center gap-4">
                  <ViewToggle currentView={viewMode} slug={slug} sub={sub} searchParams={searchParamsResolved} />
                  <div className="hidden lg:block">
                    <ProductSortSelect />
                  </div>
                </div>
              </div>

              {/* Products */}
              {products.length > 0 ? (
                <ProductsDisplay products={products} viewMode={viewMode} category={category} />
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Try adjusting your filters or browse other subcategories.
                  </p>
                  <div className="mt-6 flex gap-4 justify-center">
                    <Button variant="outline" asChild>
                      <Link href={`/categories/${category.slug}`}>Back to {category.name}</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/products">Browse All Products</Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  basePath={`/categories/${slug}/${sub}`}
                  searchParams={searchParamsResolved}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Categories */}
      <section className="py-10 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              More in {category.name}
            </h2>
            <Link
              href={`/categories/${category.slug}`}
              className="text-[#8B1D1D] font-medium flex items-center hover:underline text-sm"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {category.subCategories.slice(0, 6).map((s, index) => {
              const color = getSubCategoryStyle(index);
              const isActive = s.id === subCategory.id;
              return (
                <Link
                  key={s.id}
                  href={`/categories/${category.slug}/${s.slug}`}
                  className={`group p-4 rounded-xl border transition-all text-center ${
                    isActive
                      ? "border-[#8B1D1D] bg-[#8B1D1D]/5 shadow-md"
                      : "border-gray-200 bg-white hover:shadow-lg hover:-translate-y-1"
                  }`}
                >
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: isActive ? "#8B1D1D15" : color.bg }}
                  >
                    {getSubCategoryIcon(s.icon, index, "w-6 h-6", isActive ? "#8B1D1D" : color.text)}
                  </div>
                  <h3 className={`font-semibold text-sm ${
                    isActive
                      ? "text-[#8B1D1D]"
                      : "text-gray-900 group-hover:text-[#8B1D1D]"
                  } transition-colors line-clamp-2`}>
                    {s.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {s._count.products} products
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

// View Toggle Component
function ViewToggle({
  currentView,
  slug,
  sub,
  searchParams
}: {
  currentView: string;
  slug: string;
  sub: string;
  searchParams: Record<string, any>;
}) {
  const buildViewUrl = (view: string) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "view" && value) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });
    params.set("view", view);
    return `/categories/${slug}/${sub}?${params.toString()}`;
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <Link
        href={buildViewUrl("grid")}
        className={`p-2 rounded-md transition-colors ${
          currentView === "grid"
            ? "bg-white shadow-sm text-[#8B1D1D]"
            : "text-gray-500 hover:text-gray-700"
        }`}
        title="Grid view"
      >
        <Grid3X3 className="h-4 w-4" />
      </Link>
      <Link
        href={buildViewUrl("compact")}
        className={`p-2 rounded-md transition-colors ${
          currentView === "compact"
            ? "bg-white shadow-sm text-[#8B1D1D]"
            : "text-gray-500 hover:text-gray-700"
        }`}
        title="Compact grid"
      >
        <LayoutGrid className="h-4 w-4" />
      </Link>
      <Link
        href={buildViewUrl("list")}
        className={`p-2 rounded-md transition-colors ${
          currentView === "list"
            ? "bg-white shadow-sm text-[#8B1D1D]"
            : "text-gray-500 hover:text-gray-700"
        }`}
        title="List view"
      >
        <List className="h-4 w-4" />
      </Link>
    </div>
  );
}

// Products Display Component
function ProductsDisplay({
  products,
  viewMode,
  category
}: {
  products: any[];
  viewMode: string;
  category: any;
}) {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <ProductListItem key={product.id} product={product} category={category} />
        ))}
      </div>
    );
  }

  if (viewMode === "compact") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <CompactProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} category={category} />
      ))}
    </div>
  );
}

// Product Card Component
function ProductCard({ product, category }: { product: any; category: any }) {
  const discount = product.compareAtPrice
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.basePrice)) /
          Number(product.compareAtPrice)) *
          100
      )
    : 0;
  const hasPrice = Number(product.basePrice) > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#8B1D1D]/20 transition-all duration-300 h-full flex flex-col group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {product.images[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-300">{product.name.charAt(0)}</span>
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isFeatured && (
              <Badge className="bg-gradient-to-r from-[#8B1D1D] to-[#B91C1C] text-white border-0 shadow-lg">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                {discount}% OFF
              </Badge>
            )}
          </div>
          <div className="absolute bottom-3 left-3">
            <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center border border-gray-100">
              <span className="text-lg font-bold text-[#8B1D1D]">{product.name.charAt(0)}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {category.name}
          </span>
        </div>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-[#8B1D1D] transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        {product.shortDescription && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
            {product.shortDescription}
          </p>
        )}
        <div className="flex items-center gap-2 mb-3">
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
          <span className="text-xs text-gray-500">({product._count.reviews})</span>
        </div>
        <div className="mt-auto pt-3 border-t border-gray-100">
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
}

// Compact Product Card
function CompactProductCard({ product }: { product: any }) {
  const discount = product.compareAtPrice
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.basePrice)) /
          Number(product.compareAtPrice)) *
          100
      )
    : 0;
  const hasPrice = Number(product.basePrice) > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#8B1D1D]/20 transition-all duration-300 h-full flex flex-col group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden p-4 flex items-center justify-center">
          {product.images[0]?.url && (
            <div className="absolute inset-0 opacity-20">
              <img src={product.images[0].url} alt="" className="w-full h-full object-cover blur-sm" />
            </div>
          )}
          <div className="relative w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
            {product.images[0]?.url ? (
              <img src={product.images[0].url} alt={product.name} className="w-12 h-12 object-contain" />
            ) : (
              <span className="text-2xl font-bold text-[#8B1D1D]">{product.name.charAt(0)}</span>
            )}
          </div>
          {product.isFeatured && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#8B1D1D] flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 border-0">
              -{discount}%
            </Badge>
          )}
        </div>
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm text-gray-900 group-hover:text-[#8B1D1D] transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-600 font-medium">
            {Number(product.averageRating || 0).toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">({product._count.reviews})</span>
        </div>
        {hasPrice && (
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-sm font-bold text-gray-900">
              ₹{Number(product.basePrice).toLocaleString("en-IN")}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{Number(product.compareAtPrice).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        )}
        <div className="mt-auto pt-2">
          {hasPrice ? (
            <Button
              size="sm"
              className="w-full h-7 text-xs bg-[#8B1D1D] hover:bg-[#7A1919] text-white"
              asChild
            >
              <Link href={`/products/${product.slug}#pricing`}>
                <ShoppingBag className="h-3 w-3 mr-1" />
                Buy Now
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full h-7 text-xs bg-[#8B1D1D] hover:bg-[#7A1919] text-white"
              asChild
            >
              <Link href="/contact">
                <MessageCircle className="h-3 w-3 mr-1" />
                Contact
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Product List Item
function ProductListItem({ product, category }: { product: any; category: any }) {
  const discount = product.compareAtPrice
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.basePrice)) /
          Number(product.compareAtPrice)) *
          100
      )
    : 0;
  const hasPrice = Number(product.basePrice) > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#8B1D1D]/20 transition-all duration-300 group">
      <div className="flex items-stretch">
        <Link href={`/products/${product.slug}`} className="w-32 sm:w-40 flex-shrink-0 relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="w-20 h-20 rounded-xl bg-white shadow-md flex items-center justify-center border border-gray-100">
            {product.images[0]?.url ? (
              <img src={product.images[0].url} alt={product.name} className="w-14 h-14 object-contain" />
            ) : (
              <span className="text-2xl font-bold text-[#8B1D1D]">{product.name.charAt(0)}</span>
            )}
          </div>
          {product.isFeatured && (
            <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#8B1D1D] flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          )}
        </Link>
        <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Building2 className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                {category.name}
              </span>
            </div>
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-semibold text-gray-900 group-hover:text-[#8B1D1D] transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            {product.shortDescription && (
              <p className="text-sm text-gray-500 line-clamp-1 mt-1 hidden sm:block">
                {product.shortDescription}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(Number(product.averageRating) || 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">({product._count.reviews})</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
            {hasPrice && (
              <div className="text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ₹{Number(product.basePrice).toLocaleString("en-IN")}
                  </span>
                  {discount > 0 && (
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">-{discount}%</Badge>
                  )}
                </div>
                {product.compareAtPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{Number(product.compareAtPrice).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            )}
            <div className="flex gap-2">
              {hasPrice ? (
                <>
                  <Button size="sm" className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white rounded-lg whitespace-nowrap" asChild>
                    <Link href={`/products/${product.slug}#pricing`}>
                      <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                      Buy Now
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-200 hover:border-[#8B1D1D] hover:text-[#8B1D1D] rounded-lg" asChild>
                    <Link href="/contact">
                      <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                      Contact
                    </Link>
                  </Button>
                </>
              ) : (
                <Button size="sm" className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white rounded-lg whitespace-nowrap" asChild>
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
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, any>;
}) {
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "page" && value) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsis = totalPages > 7;
    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        className="rounded-xl"
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link href={buildPageUrl(currentPage - 1)}>Previous</Link>
        ) : (
          <span>Previous</span>
        )}
      </Button>
      <div className="hidden sm:flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-3 text-gray-400">...</span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className={`min-w-[40px] rounded-xl ${page === currentPage ? "bg-[#8B1D1D] hover:bg-[#7A1919]" : ""}`}
              asChild={page !== currentPage}
            >
              {page !== currentPage ? <Link href={buildPageUrl(page)}>{page}</Link> : <span>{page}</span>}
            </Button>
          )
        )}
      </div>
      <span className="sm:hidden text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        className="rounded-xl"
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={buildPageUrl(currentPage + 1)}>Next</Link>
        ) : (
          <span>Next</span>
        )}
      </Button>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}) {
  const { slug, sub } = await params;
  const subCategory = await getSubCategory(slug, sub);

  if (!subCategory) {
    return { title: "Subcategory Not Found" };
  }

  return {
    title: `${subCategory.name} - ${subCategory.category.name} | Shaurrya Teleservices`,
    description:
      subCategory.description ||
      `Browse ${subCategory.name} products in ${subCategory.category.name}. Find the best solutions for your business.`,
  };
}
