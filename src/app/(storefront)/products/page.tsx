import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Package,
  Check,
  Zap,
  Globe,
  Clock,
  Infinity as InfinityIcon,
  Grid3X3,
  List,
  MessageCircle,
  TrendingUp,
  Bell,
  PlayCircle,
} from "lucide-react";
import { ProductsGrid } from "@/components/storefront/ProductsGrid";
import { ProductSortSelect } from "@/components/storefront/ProductFilters";
import { cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";


// Helper function to convert Prisma Decimal fields to plain objects
function convertDecimalToString(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (typeof obj === 'object') {
    if (obj instanceof Date) return obj;
    const constructorName = obj.constructor?.name;
    if (constructorName === 'Decimal' || 
        (typeof obj.toNumber === 'function' && typeof obj.equals === 'function') ||
        (typeof obj.toFixed === 'function' && typeof obj.toString === 'function' && obj.toString !== Object.prototype.toString)) {
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map(item => convertDecimalToString(item));
    }
    const converted: any = {};
    for (const key of Object.keys(obj)) {
      converted[key] = convertDecimalToString(obj[key]);
    }
    return converted;
  }
  return obj;
}

// Helper function to transform recurringPrices array to object format
function transformRecurringPrices(recurringPrices: any[]): any {
  if (!recurringPrices || recurringPrices.length === 0) return null;
  
  const price = recurringPrices[0];
  return {
    monthly: price.monthlyPrice ? Number(price.monthlyPrice) : null,
    quarterly: price.quarterlyPrice ? Number(price.quarterlyPrice) : null,
    yearly: price.yearlyPrice ? Number(price.yearlyPrice) : null,
    biennial: price.biennialPrice ? Number(price.biennialPrice) : null,
    triennial: price.triennialPrice ? Number(price.triennialPrice) : null,
  };
}

// Helper to transform variant with recurring prices
function transformVariant(variant: any) {
  // First, preserve the original recurringPrices array before any conversion
  const originalRecurringPrices = variant.recurringPrices;
  
  const converted = convertDecimalToString(variant);
  
  // Restore the original array (ensure it's an array, not an object)
  if (originalRecurringPrices && Array.isArray(originalRecurringPrices)) {
    converted.recurringPrices = originalRecurringPrices.map((rp: any) => convertDecimalToString(rp));
  } else {
    converted.recurringPrices = [];
  }
  
  // Determine billing type based on recurring prices
  if (converted.recurringPrices && converted.recurringPrices.length > 0) {
    // Add transformed object for storefront frontend (monthly, quarterly, yearly keys)
    converted.recurringPricesObj = transformRecurringPrices(converted.recurringPrices);
    converted.billingType = 'recurring';
  } else {
    converted.billingType = 'one_time';
  }
  
  return converted;
}

// Helper to transform product with variants
function transformProduct(product: any) {
  const converted = convertDecimalToString(product);
  // Transform variants to include recurringPrices in the expected format
  if (converted.variants) {
    converted.variants = converted.variants.map((variant: any) => transformVariant(variant));
  }
  return converted;
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Products | Browse All Products",
  description: "Browse our comprehensive range of NaaS products and services. Find cloud solutions, network services, security products, and more.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string | string[];
    subcategory?: string;
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

async function getProducts(searchParams: Awaited<ProductsPageProps["searchParams"]>) {
  try {
    const page = parseInt(searchParams.page || "1");
    const limit = 12;
    const skip = (page - 1) * limit;

    // Build where clause - show all products for debugging
    const where: Prisma.ProductWhereInput = {};

  // Search filter
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { shortDescription: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
      { sku: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  // Category filter (can be multiple)
  const categories = Array.isArray(searchParams.category)
    ? searchParams.category
    : searchParams.category
    ? [searchParams.category]
    : [];

  if (categories.length > 0) {
    where.category = {
      slug: { in: categories },
    };
  }

  // Subcategory filter
  if (searchParams.subcategory) {
    where.subCategory = {
      slug: searchParams.subcategory,
    };
  }

  // Product type filter (can be multiple)
  const types = Array.isArray(searchParams.type)
    ? searchParams.type
    : searchParams.type
    ? [searchParams.type]
    : [];

  if (types.length > 0) {
    where.productType = { in: types as any[] };
  }

  // Price range filter
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.basePrice = {};
    if (searchParams.minPrice) {
      where.basePrice.gte = parseFloat(searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      where.basePrice.lte = parseFloat(searchParams.maxPrice);
    }
  }

  // In stock filter
  if (searchParams.inStock === "true") {
    where.stockQuantity = { gt: 0 };
  }

  // Featured filter
  if (searchParams.featured === "true") {
    where.isFeatured = true;
  }

  // Build orderBy clause
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

  // Execute queries in parallel
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        description: true,
        basePrice: true,
        compareAtPrice: true,
        averageRating: true,
        reviewCount: true,
        isFeatured: true,
        productType: true,
        icon: true,
        brandLogo: true,
        category: true,
        subCategory: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 2,
        },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            recurringPrices: true,
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const productsWithPricing = products.map((product: any) => {
    // First transform the product to include recurringPrices and billingType
    const transformedProduct = transformProduct(product);
    
    // For CONFIGURABLE products, use only variant prices
    if (product.productType === "CONFIGURABLE" && product.variants && product.variants.length > 0) {
      const variantPrices = product.variants
        .filter((v: any) => v.price !== null)
        .map((v: any) => Number(v.price));
      const minVariantPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : Number(product.basePrice);
      return {
        ...transformedProduct,
        displayPrice: minVariantPrice,
        variants: transformedProduct.variants,
      };
    }
    // For other product types (STANDALONE, WITH_ADDONS), use basePrice
    return {
      ...transformedProduct,
      displayPrice: Number(product.basePrice),
      variants: transformedProduct.variants,
    };
  });

  return {
    products: productsWithPricing,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  } catch (error) {
    console.error('Database error in getProducts:', error);
    return {
      products: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

const fallbackCategories = [
  { value: "software-as-a-service", label: "Software as a Service", count: 0 },
  { value: "connectivity", label: "Connectivity", count: 0 },
  { value: "security", label: "Security", count: 0 },
  { value: "managed-infrastructure", label: "Managed Infrastructure Services", count: 0 },
  { value: "mobility-iot", label: "Mobility & IOT", count: 0 },
  { value: "ai", label: "AI", count: 0 },
  { value: "hardware-logistics", label: "Hardware & Logistics", count: 0 },
];

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    if (categories.length > 0) {
      return categories.map((cat) => ({
        value: cat.slug,
        label: cat.name,
        count: cat._count.products,
      }));
    }

    return fallbackCategories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return fallbackCategories;
  }
}

async function getSubCategoriesForSidebar() {
  try {
    const slugsToFetch = ["software-as-a-service", "managed-infrastructure", "connectivity", "security"];

    const cats = await prisma.category.findMany({
      where: { slug: { in: slugsToFetch } },
      include: {
        subCategories: {
          where: { isActive: true },
          include: {
            _count: {
              select: { products: { where: { status: "ACTIVE" } } },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return cats.flatMap((cat) =>
      cat.subCategories.map((sub) => ({
        parentValue: cat.slug,
        value: sub.slug,
        label: sub.name,
        count: sub._count.products,
      }))
    );
  } catch (error) {
    console.error("Error fetching sidebar subcategories:", error);
    return [
      { parentValue: "software-as-a-service", value: "business-applications-saas", label: "Business Applications", count: 0 },
      { parentValue: "managed-infrastructure", value: "surveillance-ai-analytics", label: "Surveillance & AI Analytics", count: 0 },
      { parentValue: "managed-infrastructure", value: "wifi-as-a-service", label: "WiFi as a Service", count: 0 },
      { parentValue: "security", value: "cybersecurity-sub", label: "CyberSecurity", count: 0 },
    ];
  }
}

async function getPriceRange() {
  try {
    const result = await prisma.product.aggregate({
      where: { status: "ACTIVE" },
      _min: { basePrice: true },
      _max: { basePrice: true },
    });

    return {
      min: Math.floor(Number(result._min.basePrice) || 0),
      max: Math.ceil(Number(result._max.basePrice) || 10000),
    };
  } catch (error) {
    console.error("Error fetching price range:", error);
    return { min: 0, max: 10000 };
  }
}

async function getProductTypeCounts() {
  try {
    const counts = await prisma.product.groupBy({
      by: ["productType"],
      where: { status: "ACTIVE" },
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

    return Object.values(typeMap);
  } catch (error) {
    console.error("Error fetching product type counts:", error);
    return [];
  }
}

async function getFeaturedCount() {
  try {
    return await prisma.product.count({
      where: { status: "ACTIVE", isFeatured: true },
    });
  } catch (error) {
    console.error("Error fetching featured count:", error);
    return 0;
  }
}

async function getFeaturedSpotlightProduct() {
  const select = {
    id: true,
    name: true,
    slug: true,
    brandLogo: true,
    shortDescription: true,
    specifications: true,
    category: { select: { name: true } },
    subCategory: { select: { name: true } },
    images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  };

  try {
    // Deco Voice is the flagship spotlight product; fall back to any other
    // featured product if it's ever unpublished.
    const decoVoice = await prisma.product.findFirst({
      where: { status: "ACTIVE", slug: "deco-voice" },
      select,
    });
    if (decoVoice) return decoVoice;

    return await prisma.product.findFirst({
      where: { status: "ACTIVE", isFeatured: true },
      orderBy: { sortOrder: "asc" },
      select,
    });
  } catch (error) {
    console.error("Error fetching featured spotlight product:", error);
    return null;
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const viewMode = params.view || "grid";

  // Fetch all data in parallel
  const [{ products, pagination }, categories, priceRange, productTypes, featuredCount, sidebarSubCategories, spotlightProduct] = await Promise.all([
    getProducts(params),
    getCategories(),
    getPriceRange(),
    getProductTypeCounts(),
    getFeaturedCount(),
    getSubCategoriesForSidebar(),
    getFeaturedSpotlightProduct(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {/* Featured Product Spotlight */}
        {spotlightProduct && <FeaturedSpotlight product={spotlightProduct} />}

        {/* Filter Toolbar */}
        <FilterToolbar
          categories={categories.filter((c: { value: string; label: string; count: number }) => ["ai-video-surveillance", "ai-voice-automation", "ai-talent-intelligence"].includes(c.value))}
          productTypes={productTypes}
          params={params}
          viewMode={viewMode}
          pagination={pagination}
        />

        {/* Product Grid Section */}
        <div>
          {/* Active Filters Display */}
          <ActiveFilters params={params} categories={categories} />

          {/* Products Grid/List */}
          <Suspense fallback={<ProductGridSkeleton viewMode={viewMode} />}>
            <ProductsGrid
              products={products}
              viewMode={viewMode}
            />
          </Suspense>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              searchParams={params}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Category Products Section with Category Links
function CategoryProductsSection({ 
  products
}: { 
  products: any[]; 
}) {
  const targetCategories = [
    { key: "tally-on-cloud", label: "Software as a Service - Tally on Cloud", parent: "Software as a Service - Business Applications" },
    { key: "cyber-security", label: "Security - CyberSecurity", parent: "Security" },
    { key: "surveillance", label: "Managed Infrastructure Services - Surveillance & AI Analytics", parent: "Managed Infrastructure Services" },
    { key: "wifi-as-a-service", label: "Managed Infrastructure Services - Wifi as a Service", parent: "Managed Infrastructure Services" },
    { key: "mobility", label: "Mobility & IoT", parent: "Mobility & IoT" },
    { key: "iot", label: "Mobility & IoT", parent: "Mobility & IoT" },
    { key: "ai", label: "AI Products", parent: "AI Products" },
    { key: "hardware", label: "Hardware & Logistics", parent: "Hardware & Logistics" },
  ];

  // Group products by category - check both category slug and product slug
  const productsByCategory = targetCategories.map(cat => {
    const catProducts = products.filter(p => {
      const catSlug = p.category?.slug || "";
      const prodSlug = p.slug || "";
      return catSlug === cat.key || 
        prodSlug === cat.key ||
        catSlug.includes(cat.key) || 
        prodSlug.includes(cat.key);
    });
    return { ...cat, products: catProducts };
  }).filter(cat => cat.products.length > 0);

  if (productsByCategory.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {productsByCategory.map((cat) => (
          <div key={cat.key} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{cat.label}</h2>
              <Link 
                href={`/products?category=${cat.key}`}
                className="text-sm text-[#1E2260] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {cat.products.slice(0, 5).map((product) => (
                <Link 
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] relative bg-gray-50 flex items-center justify-center p-4">
                    {product.images?.[0]?.url ? (
                      <img 
                        src={product.images[0].url} 
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-gray-300" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight group-hover:text-[#1E2260] transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    {product.shortDescription && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                        {product.shortDescription}
                      </p>
                    )}
                    <p className="mt-2 font-semibold text-gray-900">
                      {product.displayPrice ? `₹${Number(product.displayPrice).toLocaleString('en-IN')}` : 'Price on request'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Icons cycled through the 2x2 feature card grid, in order
const FEATURE_ICONS = [Zap, Globe, Clock, InfinityIcon];

// Featured Product Spotlight — large rounded hero card with animated visual + feature grid
function FeaturedSpotlight({ product }: { product: any }) {
  const specs =
    product.specifications && typeof product.specifications === "object" && !Array.isArray(product.specifications)
      ? Object.entries(product.specifications as Record<string, string>).slice(0, 4)
      : [];

  return (
    <div className="mb-8 grid gap-6 rounded-[24px] bg-gradient-to-br from-white via-[#F5F9FF] to-[#EAF3FF] p-5 shadow-[0_4px_24px_rgba(30,34,96,0.06)] md:grid-cols-[58fr_42fr] md:items-center md:p-7 lg:min-h-[340px]">
      {/* Animated visual */}
      <Link
        href={`/products/${product.slug}`}
        className="relative flex h-full min-h-[220px] items-center justify-center"
      >
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,132,216,0.16),transparent_70%)]" />

        {/* Floating chat bubble */}
        <div className="pointer-events-none absolute left-2 top-4 z-10 hidden animate-float items-center gap-1.5 rounded-full border border-[#ECECEC] bg-white px-3 py-2 shadow-md sm:flex">
          <MessageCircle className="h-3.5 w-3.5 text-[#0A84D8]" />
          <span className="text-xs font-medium text-gray-600">How can I help?</span>
        </div>

        {/* Floating analytics card */}
        <div className="pointer-events-none absolute bottom-6 left-0 z-10 hidden animate-float-slow rounded-xl border border-[#ECECEC] bg-white px-3 py-2 shadow-md sm:block">
          <div className="flex items-center gap-1.5 text-[#1E2260]">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">+42%</span>
          </div>
          <span className="text-[10px] text-gray-400">Engagement</span>
        </div>

        {/* Floating notification bubble */}
        <div className="pointer-events-none absolute right-2 top-8 z-10 hidden h-9 w-9 animate-float items-center justify-center rounded-full border border-[#ECECEC] bg-white shadow-md sm:flex [animation-delay:-1.5s]">
          <Bell className="h-4 w-4 text-[#0A84D8]" />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
        </div>

        {/* Tiny glowing particles */}
        <span className="pointer-events-none absolute right-10 bottom-10 h-2 w-2 animate-pulse rounded-full bg-[#0A84D8]/60" />
        <span className="pointer-events-none absolute right-24 top-14 h-1.5 w-1.5 animate-pulse rounded-full bg-[#0A84D8]/40 [animation-delay:-1s]" />

        {/* White card with the animation */}
        <div className="relative flex h-full w-full items-center justify-center rounded-[20px] border border-[#ECECEC] bg-white p-5 shadow-[0_8px_30px_rgba(30,34,96,0.08)]">
          <img
            src="/gif/bot-video.gif"
            alt={`${product.name} demo`}
            className="h-[65%] w-[65%] object-contain"
          />
        </div>
      </Link>

      <div className="flex flex-col justify-center">
        {product.brandLogo ? (
          <img src={product.brandLogo} alt={product.name} className="mb-3 h-8 w-auto object-contain" />
        ) : (
          (() => {
            const [firstWord, ...rest] = product.name.split(" ");
            const restLabel = rest.join(" ");
            return (
              <div className="mb-3 flex items-baseline gap-1.5">
                <span className="text-base font-extrabold uppercase tracking-wide text-gray-900">{firstWord}</span>
                {restLabel && (
                  <span className="text-base font-medium italic text-[#1E2260]">{restLabel}</span>
                )}
              </div>
            );
          })()
        )}

        <h2 className="text-[36px] font-extrabold leading-tight tracking-tight text-[#1E2260]">
          {product.subCategory?.name || product.category?.name || product.name}
        </h2>

        {product.shortDescription && (
          <p className="mt-3 max-w-md text-base font-medium leading-relaxed text-[#5F6470]">
            {product.shortDescription}
          </p>
        )}

        {specs.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {specs.map(([label, value], i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <div
                  key={label}
                  className="rounded-2xl border border-[#ECECEC] bg-white p-4 shadow-[0_2px_10px_rgba(30,34,96,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(30,34,96,0.1)]"
                >
                  <Icon className="mb-2 h-5 w-5 text-[#1E2260]" />
                  <p className="text-2xl font-bold leading-none text-[#1E2260]">{String(value)}</p>
                  <p className="mt-1 text-sm text-gray-500">{label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#1E2260] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#14184C] hover:shadow-lg"
          >
            Explore Product
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1E2260]/40 hover:shadow-md"
          >
            <PlayCircle className="h-4 w-4" />
            Watch Demo
          </Link>
        </div>
      </div>
    </div>
  );
}

// Dropdown wrapper — native <details> styled as a rounded white pill, no client JS needed
function FilterDropdown({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#ECECEC] bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-[#0A84D8]/40 [&::-webkit-details-marker]:hidden">
        {label}
        {count > 0 && (
          <span className="rounded-full bg-[#0A84D8]/10 px-1.5 py-0.5 text-xs font-semibold text-[#0A84D8]">
            {count}
          </span>
        )}
        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[220px] rounded-2xl border border-[#ECECEC] bg-white p-3 shadow-lg">
        {children}
      </div>
    </details>
  );
}

// View Toggle — Grid / List
function ViewToggle({ currentView, params }: { currentView: string; params: Record<string, any> }) {
  const buildViewUrl = (view: string) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (k === "view" || !v) return;
      if (Array.isArray(v)) v.forEach((vv: string) => p.append(k, vv));
      else p.set(k, v as string);
    });
    p.set("view", view);
    return `/products?${p.toString()}`;
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-[#ECECEC] bg-white p-1 shadow-sm">
      <Link
        href={buildViewUrl("grid")}
        className={cn(
          "rounded-full p-2 transition-colors",
          currentView === "grid" ? "bg-[#1E2260] text-white" : "text-gray-400 hover:text-gray-700"
        )}
        title="Grid view"
      >
        <Grid3X3 className="h-4 w-4" />
      </Link>
      <Link
        href={buildViewUrl("list")}
        className={cn(
          "rounded-full p-2 transition-colors",
          currentView === "list" ? "bg-[#1E2260] text-white" : "text-gray-400 hover:text-gray-700"
        )}
        title="List view"
      >
        <List className="h-4 w-4" />
      </Link>
    </div>
  );
}

// Filter Toolbar — results count, dropdown filters, view toggle, and sort in one rounded bar
function FilterToolbar({
  categories,
  productTypes,
  params,
  viewMode,
  pagination,
}: {
  categories: { value: string; label: string; count: number }[];
  productTypes: { value: string; label: string; count: number }[];
  params: Record<string, any>;
  viewMode: string;
  pagination: { page: number; limit: number; total: number };
}) {
  const selectedCategories = Array.isArray(params.category)
    ? params.category
    : params.category
    ? [params.category]
    : [];
  const selectedTypes = Array.isArray(params.type)
    ? params.type
    : params.type
    ? [params.type]
    : [];

  const buildParams = (overrideKey?: string) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (k === overrideKey || k === "page") return;
      if (Array.isArray(v)) v.forEach((vv: string) => p.append(k, vv));
      else if (v) p.set(k, v as string);
    });
    return p;
  };

  const buildArrayToggleUrl = (key: string, value: string, current: string[]) => {
    const p = buildParams(key);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    next.forEach((v) => p.append(key, v));
    return `/products?${p.toString()}`;
  };

  const buildBoolToggleUrl = (key: string, isActive: boolean) => {
    const p = buildParams(key);
    if (!isActive) p.set(key, "true");
    return `/products?${p.toString()}`;
  };

  const availabilityCount = (params.inStock === "true" ? 1 : 0) + (params.featured === "true" ? 1 : 0);
  const activeFilterCount = selectedCategories.length + selectedTypes.length + availabilityCount;

  const CheckRow = ({ href, checked, label, count }: { href: string; checked: boolean; label: string; count?: number }) => (
    <Link href={href} className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-sm hover:bg-[#F8F9FC]">
      <span
        className={cn(
          "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border",
          checked ? "border-[#1E2260] bg-[#1E2260]" : "border-gray-300"
        )}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </span>
      <span className="flex-1 whitespace-nowrap text-gray-700">{label}</span>
      {count !== undefined && <span className="text-xs text-gray-400">({count})</span>}
    </Link>
  );

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#ECECEC] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      {/* Left: results count */}
      <p className="whitespace-nowrap text-sm text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-900">
          {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
          {"-"}
          {Math.min(pagination.page * pagination.limit, pagination.total)}
        </span>{" "}
        of <span className="font-semibold text-gray-900">{pagination.total}</span> products
      </p>

      {/* Center: dropdown filters */}
      <div className="flex flex-wrap items-center gap-3">
        {categories.length > 0 && (
          <FilterDropdown label="Categories" count={selectedCategories.length}>
            {categories.map((c) => (
              <CheckRow
                key={c.value}
                href={buildArrayToggleUrl("category", c.value, selectedCategories)}
                checked={selectedCategories.includes(c.value)}
                label={c.label}
                count={c.count}
              />
            ))}
          </FilterDropdown>
        )}

        <FilterDropdown label="Product Type" count={selectedTypes.length}>
          {productTypes.map((t) => (
            <CheckRow
              key={t.value}
              href={buildArrayToggleUrl("type", t.value, selectedTypes)}
              checked={selectedTypes.includes(t.value)}
              label={t.label}
              count={t.count}
            />
          ))}
        </FilterDropdown>

        <FilterDropdown label="Availability" count={availabilityCount}>
          <CheckRow
            href={buildBoolToggleUrl("inStock", params.inStock === "true")}
            checked={params.inStock === "true"}
            label="In Stock Only"
          />
          <CheckRow
            href={buildBoolToggleUrl("featured", params.featured === "true")}
            checked={params.featured === "true"}
            label="Featured Products"
          />
        </FilterDropdown>

        {activeFilterCount > 0 && (
          <Link href="/products" className="text-sm font-medium text-[#1E2260] hover:underline">
            Clear all ({activeFilterCount})
          </Link>
        )}
      </div>

      {/* Right: view toggle + sort */}
      <div className="flex items-center gap-3">
        <ViewToggle currentView={viewMode} params={params} />
        <ProductSortSelect />
      </div>
    </div>
  );
}

// Active Filters Display Component
function ActiveFilters({
  params,
  categories,
}: {
  params: Awaited<ProductsPageProps["searchParams"]>;
  categories: { value: string; label: string }[];
}) {
  const selectedCategories = Array.isArray(params.category)
    ? params.category
    : params.category
    ? [params.category]
    : [];

  const selectedTypes = Array.isArray(params.type)
    ? params.type
    : params.type
    ? [params.type]
    : [];

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedTypes.length > 0 ||
    params.search ||
    params.minPrice ||
    params.maxPrice ||
    params.featured === "true" ||
    params.inStock === "true";

  if (!hasFilters) return null;

  const typeLabels: Record<string, string> = {
    STANDALONE: "Standalone",
    WITH_ADDONS: "With Add-ons",
    CONFIGURABLE: "Configurable",
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 bg-[#F8F9FC] rounded-2xl p-4 border border-[#ECECEC]">
      <span className="text-sm font-medium text-gray-700">Active filters:</span>

      {params.search && (
        <FilterBadge
          label={`"${params.search}"`}
          removeKey="search"
          params={params}
        />
      )}

      {selectedCategories.map((cat) => {
        const category = categories.find((c) => c.value === cat);
        return (
          <FilterBadge
            key={cat}
            label={category?.label || cat}
            removeKey="category"
            removeValue={cat}
            params={params}
          />
        );
      })}

      {selectedTypes.map((type) => (
        <FilterBadge
          key={type}
          label={typeLabels[type] || type}
          removeKey="type"
          removeValue={type}
          params={params}
        />
      ))}

      {(params.minPrice || params.maxPrice) && (
        <FilterBadge
          label={`₹${params.minPrice || 0} - ₹${params.maxPrice || "∞"}`}
          removeKey={["minPrice", "maxPrice"]}
          params={params}
        />
      )}

      {params.featured === "true" && (
        <FilterBadge label="Featured" removeKey="featured" params={params} />
      )}

      {params.inStock === "true" && (
        <FilterBadge label="In Stock" removeKey="inStock" params={params} />
      )}

      <Link
        href="/products"
        className="text-sm text-[#1E2260] hover:underline font-medium ml-2"
      >
        Clear all
      </Link>
    </div>
  );
}

// Filter Badge Component
function FilterBadge({
  label,
  removeKey,
  removeValue,
  params,
}: {
  label: string;
  removeKey: string | string[];
  removeValue?: string;
  params: Record<string, any>;
}) {
  // Build URL without this filter
  const newParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const keysToRemove = Array.isArray(removeKey) ? removeKey : [removeKey];

    if (keysToRemove.includes(key)) {
      if (removeValue && Array.isArray(value)) {
        value
          .filter((v: string) => v !== removeValue)
          .forEach((v: string) => newParams.append(key, v));
      } else if (removeValue && value === removeValue) {
        // Skip
      } else if (!removeValue) {
        // Skip
      } else {
        newParams.set(key, value);
      }
    } else if (Array.isArray(value)) {
      value.forEach((v: string) => newParams.append(key, v));
    } else if (value) {
      newParams.set(key, value);
    }
  });

  const href = `/products${newParams.toString() ? `?${newParams.toString()}` : ""}`;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2260]/10 text-[#1E2260] rounded-full text-sm font-medium hover:bg-[#1E2260]/20 transition-colors group"
    >
      {label}
      <span className="text-[#1E2260]/60 group-hover:text-[#1E2260] transition-colors">×</span>
    </Link>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
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
    return `/products?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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
          <Link href={buildPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Link>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </>
        )}
      </Button>

      <div className="hidden sm:flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-3 text-gray-400">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className={`min-w-[40px] rounded-xl ${
                page === currentPage ? "bg-[#1E2260] hover:bg-[#14184C]" : "border-[#ECECEC]"
              }`}
              asChild={page !== currentPage}
            >
              {page !== currentPage ? (
                <Link href={buildPageUrl(page)}>{page}</Link>
              ) : (
                <span>{page}</span>
              )}
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
          <Link href={buildPageUrl(currentPage + 1)}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        ) : (
          <>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
}

function ProductGridSkeleton({ viewMode }: { viewMode: string }) {
  const isCompact = viewMode === "compact";
  const isList = viewMode === "list";

  if (isList) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
            <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${isCompact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
      {[...Array(isCompact ? 10 : 6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <Skeleton className={`w-full ${isCompact ? "h-32" : "aspect-square"}`} />
          <div className={`p-3 space-y-2 ${isCompact ? "p-2" : "p-4"}`}>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
