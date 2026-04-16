import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ProductFilters, ProductSortSelect } from "@/components/storefront/ProductFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  LayoutGrid,
  List,
  Search,
  Star,
  Building2,
  ArrowRight,
  Sparkles,
  Package
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductsGrid } from "@/components/storefront/ProductsGrid";
import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";

// Sample fallback products when database is empty
const sampleProducts = [
  {
    id: "1",
    name: "Cloud Server Basic",
    slug: "cloud-server-basic",
    shortDescription: "Entry-level cloud server with essential features",
    description: "Entry-level cloud server with essential features for small businesses",
    basePrice: "29.99",
    compareAtPrice: null,
    averageRating: 4.5,
    reviewCount: 10,
    isFeatured: true,
    productType: "STANDALONE" as const,
    icon: "Server",
    category: { name: "Cloud Services", slug: "cloud-services" },
    subCategory: null,
    images: [],
    variants: [],
    _count: { reviews: 5 },
  },
  {
    id: "2",
    name: "Enterprise Security Suite",
    slug: "enterprise-security",
    shortDescription: "Complete security solution for enterprise",
    description: "Complete security solution for enterprise networks",
    basePrice: "199.99",
    compareAtPrice: "299.99",
    averageRating: 4.8,
    reviewCount: 25,
    isFeatured: true,
    productType: "STANDALONE" as const,
    icon: "Shield",
    category: { name: "Security", slug: "security" },
    subCategory: null,
    images: [],
    variants: [],
    _count: { reviews: 12 },
  },
  {
    id: "3",
    name: "SD-WAN Solution",
    slug: "sdwan-solution",
    shortDescription: "Software-defined wide area networking",
    description: "Software-defined wide area networking for modern enterprises",
    basePrice: "349.99",
    compareAtPrice: "449.99",
    averageRating: 4.3,
    reviewCount: 8,
    isFeatured: true,
    productType: "STANDALONE" as const,
    icon: "Globe",
    category: { name: "Network Solutions", slug: "network-solutions" },
    subCategory: null,
    images: [],
    variants: [],
    _count: { reviews: 3 },
  },
  {
    id: "4",
    name: "Microsoft 365 Business",
    slug: "microsoft-365-business",
    shortDescription: "Complete office productivity suite",
    description: "Complete office productivity suite for businesses",
    basePrice: "12.99",
    compareAtPrice: "15.99",
    averageRating: 4.7,
    reviewCount: 50,
    isFeatured: true,
    productType: "STANDALONE" as const,
    icon: "Laptop",
    category: { name: "Software", slug: "software" },
    subCategory: null,
    images: [],
    variants: [],
    _count: { reviews: 20 },
  },
  {
    id: "5",
    name: "Tally on Cloud",
    slug: "tally-on-cloud",
    shortDescription: "Accounting software hosted on cloud",
    description: "Accounting software hosted on cloud for easy access",
    basePrice: "49.99",
    compareAtPrice: "79.99",
    averageRating: 4.6,
    reviewCount: 30,
    isFeatured: true,
    productType: "STANDALONE" as const,
    icon: "Briefcase",
    category: { name: "Business Applications", slug: "business-applications" },
    subCategory: null,
    images: [],
    variants: [],
    _count: { reviews: 15 },
  },
  {
    id: "6",
    name: "Acronis Cyber Protection",
    slug: "acronis-cyber-protection",
    shortDescription: "Advanced cyber protection for your business",
    description: "Advanced cyber protection for your business data",
    basePrice: "89.99",
    compareAtPrice: "119.99",
    averageRating: 4.9,
    reviewCount: 45,
    isFeatured: true,
    productType: "STANDALONE" as const,
    icon: "Shield",
    category: { name: "Security", slug: "security" },
    subCategory: null,
    images: [],
    variants: [],
    _count: { reviews: 25 },
  },
];

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

  // Use database products if available, otherwise show fallback
  const productsToTransform = products.length > 0 ? products : sampleProducts;
  const productsWithPricing = productsToTransform.map((product: any) => {
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
      total: products.length > 0 ? total : sampleProducts.length,
      totalPages: Math.ceil((products.length > 0 ? total : sampleProducts.length) / limit),
    },
  };
  } catch (error) {
    console.error('Database error in getProducts:', error);
    return {
      products: sampleProducts.map((product: any) => ({
        ...product,
        displayPrice: Number(product.basePrice),
        variants: [],
      })),
      pagination: {
        page: 1,
        limit: 12,
        total: sampleProducts.length,
        totalPages: 1,
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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const viewMode = params.view || "grid";

  // Fetch all data in parallel
  const [{ products, pagination }, categories, priceRange, productTypes, featuredCount, sidebarSubCategories] = await Promise.all([
    getProducts(params),
    getCategories(),
    getPriceRange(),
    getProductTypeCounts(),
    getFeaturedCount(),
    getSubCategoriesForSidebar(),
  ]);

  // Get current filter display info
  const selectedCategories = Array.isArray(params.category)
    ? params.category
    : params.category
    ? [params.category]
    : [];

  const categoryNames = categories
    .filter((c: { value: string; label: string }) => selectedCategories.includes(c.value))
    .map((c: { value: string; label: string }) => c.label);

  // Build breadcrumb items
  const breadcrumbItems = [{ label: "Products" }];
  if (categoryNames.length === 1) {
    breadcrumbItems.push({ label: categoryNames[0] });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image */}
      <section className="relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="relative h-[200px] md:h-[240px] rounded-2xl overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80')`,
              }}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
              {/* Breadcrumb */}
              <nav className="mb-3">
                <ol className="flex items-center gap-2 text-sm">
                  <li>
                    <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                      Home
                    </Link>
                  </li>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                  <li className="text-white font-medium">Products</li>
                  {categoryNames.length === 1 && (
                    <>
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                      <li className="text-white font-medium">{categoryNames[0]}</li>
                    </>
                  )}
                </ol>
              </nav>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                    {categoryNames.length === 1 ? categoryNames[0] : "All Products"}
                  </h1>
                  <p className="mt-1 text-gray-300">
                    {pagination.total} products available
                  </p>
                </div>

                {/* Search Bar */}
                <div className="w-full md:w-80">
                  <SearchForm initialSearch={params.search} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Products Section */}
      <CategoryProductsSection products={products} />

      {/* Quick Filters Bar - Horizontal */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <QuickFilterBar categories={categories} />
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <ProductFilters
            categories={categories.filter((c: { value: string; label: string; count: number }) => ["software-as-a-service", "connectivity", "security", "managed-infrastructure", "managed-infrastructure-services", "mobility-iot", "ai", "hardware-logistics"].includes(c.value))}
            subCategories={sidebarSubCategories}
            productTypes={productTypes}
            minPrice={priceRange.min}
            maxPrice={priceRange.max}
            totalProducts={pagination.total}
          />

          {/* Product Grid Section */}
          <div className="flex-1">
            {/* Top bar with results count, view toggle, and sorting */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div>
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
                    {" - "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">{pagination.total}</span>{" "}
                  products
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <ViewToggle currentView={viewMode} searchParams={params} />
                <div className="hidden lg:block">
                  <ProductSortSelect />
                </div>
              </div>
            </div>

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
    { key: "ai", label: "AI", parent: "AI" },
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
                className="text-sm text-[#8B1D1D] hover:underline flex items-center gap-1"
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
                    <h3 className="font-medium text-gray-900 text-sm leading-tight group-hover:text-[#8B1D1D] transition-colors line-clamp-2">
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

// Search Form Component
function SearchForm({ initialSearch }: { initialSearch?: string }) {
  return (
    <form action="/products" method="GET" className="relative">
      <div className="flex items-center bg-white/10 border border-white/20 rounded-lg overflow-hidden focus-within:border-white/40 transition-colors">
        <Search className="ml-3 h-4 w-4 text-gray-400" />
        <input
          type="search"
          name="search"
          defaultValue={initialSearch}
          placeholder="Search products..."
          className="flex-1 px-3 py-2.5 bg-transparent text-white placeholder:text-gray-400 focus:outline-none text-sm"
        />
        <Button
          type="submit"
          size="sm"
          className="m-1 bg-[#8B1D1D] hover:bg-[#7A1919] text-white rounded-md px-4"
        >
          Search
        </Button>
      </div>
    </form>
  );
}

// Quick Filter Bar Component
function QuickFilterBar({ categories }: { categories: { value: string; label: string; count: number }[] }) {
  const customCategories = [
    { value: "", label: "All Categories" },
    { value: "tally-on-cloud", label: "Software as a Service - Tally on Cloud" },
    { value: "business-applications", label: "Software as a Service - Business Applications" },
    { value: "connectivity", label: "Connectivity" },
    { value: "sdwan", label: "Connectivity - SDWAN" },
    { value: "security", label: "Security" },
    { value: "cyber-security", label: "Security - CyberSecurity" },
    { value: "managed-infrastructure-services", label: "Managed Infrastructure Services" },
    { value: "surveillance", label: "Managed Infrastructure Services - Surveillance & AI Analytics" },
    { value: "wifi-as-a-service", label: "Managed Infrastructure Services - Wifi as a Service" },
    { value: "mobility-iot", label: "Mobility & IoT" },
    { value: "ai", label: "AI" },
    { value: "hardware-logistics", label: "Hardware & Logistics" },
  ];

  return (
    <form action="/products" method="GET" className="py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">I am looking for:</span>
        <select
          name="category"
          className="h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-[#8B1D1D] focus:ring-2 focus:ring-[#8B1D1D]/20 focus:outline-none cursor-pointer min-w-[280px]"
        >
          {customCategories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <Button
          type="submit"
          className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white h-10 px-6 rounded-lg shadow-sm"
        >
          <Search className="h-4 w-4 mr-2" />
          Find Solutions
        </Button>
      </div>
    </form>
  );
}

// View Toggle Component
function ViewToggle({
  currentView,
  searchParams
}: {
  currentView: string;
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
    return `/products?${params.toString()}`;
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
    <div className="mb-6 flex flex-wrap items-center gap-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
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
        className="text-sm text-[#8B1D1D] hover:underline font-medium ml-2"
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8B1D1D]/10 text-[#8B1D1D] rounded-full text-sm font-medium hover:bg-[#8B1D1D]/20 transition-colors group"
    >
      {label}
      <span className="text-[#8B1D1D]/60 group-hover:text-[#8B1D1D] transition-colors">×</span>
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
                page === currentPage ? "bg-[#8B1D1D] hover:bg-[#7A1919]" : ""
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
