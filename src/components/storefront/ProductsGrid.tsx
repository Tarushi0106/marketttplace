"use client";

import Link from "next/link";
import { Star, Building2, Package, Sparkles, ShoppingBag, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Helper to check if product has pricing
function hasPricing(price: any): boolean {
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice > 0;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: any;
  compareAtPrice: any;
  averageRating: any;
  reviewCount: number;
  isFeatured: boolean;
  productType: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  subCategory: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: {
    id: string;
    url: string;
    alt: string | null;
  }[];
  _count: {
    reviews: number;
  };
}

interface ProductsGridProps {
  products: Product[];
  viewMode: string;
}

export function ProductsGrid({ products, viewMode }: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Try adjusting your filters or search query to find what you&apos;re looking for.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/products">Clear all filters</Link>
        </Button>
      </div>
    );
  }

  if (viewMode === "list") {
    return <ListView products={products} />;
  }

  if (viewMode === "compact") {
    return <CompactGridView products={products} />;
  }

  return <GridView products={products} />;
}

// Standard Grid View
function GridView({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Compact Grid View - Smaller cards
function CompactGridView({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <CompactProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// List View
function ListView({ products }: { products: Product[] }) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductListItem key={product.id} product={product} />
      ))}
    </div>
  );
}

// Standard Product Card
function ProductCard({ product }: { product: Product }) {
  const discount = product.compareAtPrice
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.basePrice)) /
          Number(product.compareAtPrice)) *
          100
      )
    : 0;
  const hasPrice = hasPricing(product.basePrice);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#8B1D1D]/20 transition-all duration-300 h-full flex flex-col group">
      {/* Image Section - Clickable */}
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
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-400">
                  {product.name.charAt(0)}
                </span>
              </div>
            </div>
          )}

          {/* Badges */}
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

          {/* Product Logo/Icon Overlay */}
          <div className="absolute bottom-3 left-3">
            <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center border border-gray-100">
              {product.images[1]?.url ? (
                <img
                  src={product.images[1].url}
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <span className="text-lg font-bold text-[#8B1D1D]">
                  {product.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category */}
        {product.category && (
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Title - Clickable */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-[#8B1D1D] transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.shortDescription && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
            {product.shortDescription}
          </p>
        )}

        {/* Rating */}
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
          <span className="text-xs text-gray-500">
            ({product._count.reviews})
          </span>
        </div>

        {/* Price & CTA Buttons */}
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

// Compact Product Card - Smaller with logo prominent
function CompactProductCard({ product }: { product: Product }) {
  const discount = product.compareAtPrice
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.basePrice)) /
          Number(product.compareAtPrice)) *
          100
      )
    : 0;
  const hasPrice = hasPricing(product.basePrice);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#8B1D1D]/20 transition-all duration-300 h-full flex flex-col group">
      {/* Compact Image with Logo - Clickable */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden p-4 flex items-center justify-center">
          {/* Background Image (subtle) */}
          {product.images[0]?.url && (
            <div className="absolute inset-0 opacity-20">
              <img
                src={product.images[0].url}
                alt=""
                className="w-full h-full object-cover blur-sm"
              />
            </div>
          )}

          {/* Product Logo - Main focus */}
          <div className="relative w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
            {product.images[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-[#8B1D1D]">
                {product.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Badges - Small */}
          {(product.isFeatured || discount > 0) && (
            <div className="absolute top-2 right-2">
              {product.isFeatured && (
                <div className="w-6 h-6 rounded-full bg-[#8B1D1D] flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 border-0">
              -{discount}%
            </Badge>
          )}
        </div>
      </Link>

      {/* Compact Content */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Category Tag */}
        {product.category && (
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            {product.category.name}
          </span>
        )}

        {/* Title - Clickable */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm text-gray-900 group-hover:text-[#8B1D1D] transition-colors line-clamp-2 mt-1 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating - Compact */}
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-600 font-medium">
            {Number(product.averageRating || 0).toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">
            ({product._count.reviews})
          </span>
        </div>

        {/* Price */}
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

        {/* CTA Button */}
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
function ProductListItem({ product }: { product: Product }) {
  const discount = product.compareAtPrice
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.basePrice)) /
          Number(product.compareAtPrice)) *
          100
      )
    : 0;
  const hasPrice = hasPricing(product.basePrice);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#8B1D1D]/20 transition-all duration-300 group">
      <div className="flex items-stretch">
        {/* Image/Logo Section - Clickable */}
        <Link href={`/products/${product.slug}`} className="w-32 sm:w-40 flex-shrink-0 relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          {product.images[0]?.url ? (
            <div className="w-20 h-20 rounded-xl bg-white shadow-md flex items-center justify-center border border-gray-100">
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-14 h-14 object-contain"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-white shadow-md flex items-center justify-center border border-gray-100">
              <span className="text-2xl font-bold text-[#8B1D1D]">
                {product.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Badges */}
          {product.isFeatured && (
            <div className="absolute top-2 left-2">
              <div className="w-6 h-6 rounded-full bg-[#8B1D1D] flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
          )}
        </Link>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            {/* Category */}
            {product.category && (
              <div className="flex items-center gap-1.5 mb-1">
                <Building2 className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  {product.category.name}
                  {product.subCategory && ` / ${product.subCategory.name}`}
                </span>
              </div>
            )}

            {/* Title - Clickable */}
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-semibold text-gray-900 group-hover:text-[#8B1D1D] transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>

            {/* Description */}
            {product.shortDescription && (
              <p className="text-sm text-gray-500 line-clamp-1 mt-1 hidden sm:block">
                {product.shortDescription}
              </p>
            )}

            {/* Rating & Type */}
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
                <span className="text-xs text-gray-500 ml-1">
                  ({product._count.reviews})
                </span>
              </div>
              {product.productType !== "STANDALONE" && (
                <Badge variant="outline" className="text-xs">
                  {product.productType === "WITH_ADDONS" && "Add-ons"}
                  {product.productType === "CONFIGURABLE" && "Configurable"}
                </Badge>
              )}
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
            {hasPrice && (
              <div className="text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ₹{Number(product.basePrice).toLocaleString("en-IN")}
                  </span>
                  {discount > 0 && (
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                      -{discount}%
                    </Badge>
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
                  <Button
                    size="sm"
                    className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white rounded-lg whitespace-nowrap"
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
                    className="border-gray-200 hover:border-[#8B1D1D] hover:text-[#8B1D1D] rounded-lg"
                    asChild
                  >
                    <Link href="/contact">
                      <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                      Contact
                    </Link>
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="bg-[#8B1D1D] hover:bg-[#7A1919] text-white rounded-lg whitespace-nowrap"
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
    </div>
  );
}
