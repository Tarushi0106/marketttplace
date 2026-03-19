"use client";

import Link from "next/link";
import { ChevronRight, ChevronLeft, Heart, Star, ShoppingCart, Box, Wifi, Shield, Server, Database, Cloud, Cpu, Headphones, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  averageRating: number;
  salesCount: number;
  productType: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: {
    id: string;
    url: string;
    alt: string | null;
  }[];
  variants?: {
    id: string;
    price: number | null;
  }[];
  _count: {
    reviews: number;
  };
}

// Sample fallback products when database is empty
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Cloud Server Basic",
    slug: "cloud-server-basic",
    shortDescription: "Entry-level cloud server with essential features",
    basePrice: 29.99,
    compareAtPrice: 39.99,
    averageRating: 4.5,
    salesCount: 10,
    productType: "STANDALONE",
    category: { id: "1", name: "Cloud Services", slug: "cloud-services" },
    images: [],
    _count: { reviews: 5 },
  },
  {
    id: "2",
    name: "Enterprise Security Suite",
    slug: "enterprise-security",
    shortDescription: "Complete security solution for enterprise",
    basePrice: 199.99,
    compareAtPrice: 299.99,
    averageRating: 4.8,
    salesCount: 25,
    productType: "STANDALONE",
    category: { id: "2", name: "Security", slug: "security" },
    images: [],
    _count: { reviews: 12 },
  },
  {
    id: "3",
    name: "SD-WAN Solution",
    slug: "sdwan-solution",
    shortDescription: "Software-defined wide area networking",
    basePrice: 349.99,
    compareAtPrice: 449.99,
    averageRating: 4.3,
    salesCount: 8,
    productType: "STANDALONE",
    category: { id: "3", name: "Network Solutions", slug: "network-solutions" },
    images: [],
    _count: { reviews: 3 },
  },
  {
    id: "4",
    name: "Microsoft 365 Business",
    slug: "microsoft-365-business",
    shortDescription: "Complete office productivity suite",
    basePrice: 12.99,
    compareAtPrice: 15.99,
    averageRating: 4.7,
    salesCount: 50,
    productType: "STANDALONE",
    category: { id: "4", name: "Software", slug: "software" },
    images: [],
    _count: { reviews: 20 },
  },
  {
    id: "5",
    name: "Tally on Cloud",
    slug: "tally-on-cloud",
    shortDescription: "Accounting software hosted on cloud",
    basePrice: 49.99,
    compareAtPrice: 79.99,
    averageRating: 4.6,
    salesCount: 30,
    productType: "STANDALONE",
    category: { id: "5", name: "Business Applications", slug: "business-applications" },
    images: [],
    _count: { reviews: 15 },
  },
];

// Function to get icon based on product name
const getProductIcon = (productName: string) => {
  const name = productName.toLowerCase();
  if (name.includes("wifi") || name.includes("router") || name.includes("network")) return <Wifi className="w-10 h-10 text-red-600" />;
  if (name.includes("security") || name.includes("firewall") || name.includes("protect")) return <Shield className="w-10 h-10 text-red-600" />;
  if (name.includes("server") || name.includes("hosting")) return <Server className="w-10 h-10 text-red-600" />;
  if (name.includes("database") || name.includes("data")) return <Database className="w-10 h-10 text-red-600" />;
  if (name.includes("cloud")) return <Cloud className="w-10 h-10 text-red-600" />;
  if (name.includes("cpu") || name.includes("processor") || name.includes("compute")) return <Cpu className="w-10 h-10 text-red-600" />;
  if (name.includes("support") || name.includes("service") || name.includes("managed")) return <Headphones className="w-10 h-10 text-red-600" />;
  if (name.includes("business") || name.includes("enterprise") || name.includes("solution")) return <Briefcase className="w-10 h-10 text-red-600" />;
  return <Box className="w-10 h-10 text-red-600" />;
};

export function FeaturedProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products?isFeatured=true&limit=10");
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setProducts(data.data);
        }
        // Don't set fallback products here - we'll use sampleProducts as fallback in rendering
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Remove hardcoded fallback - show empty state when no products
  const displayProducts = products;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isConfigurable = product.productType === 'CONFIGURABLE' || product.productType === 'BUNDLE' || product.productType === 'WITH_ADDONS';
    
    let displayPrice: number;
    if (isConfigurable && product.variants && product.variants.length > 0) {
      const variantPrices = product.variants
        .filter((v) => v.price !== null)
        .map((v) => Number(v.price));
      displayPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : Number(product.basePrice);
    } else {
      displayPrice = Number(product.basePrice);
    }
    
    if (isNaN(displayPrice) || displayPrice === 0) {
      console.error("Invalid price for product:", product.name);
      return;
    }
    
    addItem({
      product: product as any,
      quantity: 1,
      selectedAddons: [],
      selectedConfigs: [],
      unitPrice: displayPrice,
    });
  };

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Featured Products
              </h2>
              <p className="mt-3 text-gray-500 text-lg max-w-2xl">
                Discover our top connectivity and enterprise solutions trusted by businesses worldwide.
              </p>
            </div>
          </div>
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[280px] h-[380px] bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Featured Products
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-2xl">
              Discover our top connectivity and enterprise solutions trusted by businesses worldwide.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 text-[#8B1D1D] font-medium hover:underline"
          >
            See All Products
          </Link>
        </div>

        {/* Scrollable Products Container */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory items-start"
          >
            {displayProducts.map((product) => {
              const hasSales = product.salesCount > 0;
              
              const isConfigurable = product.productType === 'CONFIGURABLE' || product.productType === 'BUNDLE' || product.productType === 'WITH_ADDONS';
              
              let displayPrice: number;
              if (isConfigurable && product.variants && product.variants.length > 0) {
                const variantPrices = product.variants
                  .filter((v) => v.price !== null)
                  .map((v) => Number(v.price));
                displayPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : Number(product.basePrice);
              } else {
                displayPrice = Number(product.basePrice);
              }

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="flex-shrink-0 snap-start w-[280px] group"
                >
                  <div className="border border-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Wishlist Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => toggleWishlist(e, product.id)}
                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            wishlist.includes(product.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                      </button>

                      {/* Brand Logo Area */}
                      <div className="h-48 bg-white flex items-center justify-center">
                        {product.images[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            className="max-h-32 max-w-[80%] object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center">
                            {getProductIcon(product.name)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="min-h-[48px]">
                        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2">
                          {product.name}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                        {product.shortDescription || "High-quality enterprise solution for your business needs."}
                      </p>

                      {/* Price and Rating */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{displayPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{product.compareAtPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                          {isConfigurable && product.variants && product.variants.length > 0 && (
                            <span className="text-xs text-gray-500">
                              (Starts from)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.floor(product.averageRating || 5)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">
                            ({product._count?.reviews || 0})
                          </span>
                        </div>
                      </div>

                      {/* Sold Progress - Only show if there are sales */}
                      {hasSales && (
                        <div className="mt-3">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-900 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min((product.salesCount || 0) * 2, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {product.salesCount} Sold
                          </span>
                        </div>
                      )}

                      {/* Hover Buttons - Height expands on hover */}
                      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                        <div className="overflow-hidden">
                          <div className="pt-4 space-y-2">
                            <Button
                              onClick={(e) => handleAddToCart(e, product)}
                              className="w-full bg-[#1A1A1A] hover:bg-[#2D2D2D] text-white rounded-lg h-10 flex items-center justify-center gap-2"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Add To Cart
                            </Button>
                            <Link href={`/products/${product.slug}`} className="block w-full">
                              <Button
                                variant="outline"
                                className="w-full border-gray-300 text-gray-700 rounded-lg h-10 hover:bg-gray-50"
                              >
                                Product Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[#8B1D1D] font-medium"
          >
            See All Products
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
