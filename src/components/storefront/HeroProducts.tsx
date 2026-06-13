"use client";

import Link from "next/link";
import { ArrowRight, Cloud, Server, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface HeroProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroImage: string;
  pricing?: {
    monthly?: string;
    yearly?: string;
  };
}

export function HeroProducts() {
  const [products, setProducts] = useState<HeroProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHeroProducts() {
      try {
        const response = await fetch("/api/hero-products");
        const data = await response.json();
        // Handle both { data: [...] } and [...] response formats
        const productsArray = Array.isArray(data) ? data : (data?.data || []);
        setProducts(productsArray);
      } catch (error) {
        console.error("Error fetching hero products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHeroProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-8 animate-pulse" />
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Solutions
          </h2>
          <p className="mt-3 text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our enterprise-grade products and services
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/hero/${product.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Background Image */}
              {product.heroImage && (
                <div className="absolute inset-0">
                  <img
                    src={product.heroImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
                </div>
              )}

              {/* Content */}
              <div className="relative p-8 min-h-[280px] flex flex-col justify-center">
                {!product.heroImage && (
                  <div className="absolute top-4 right-4">
                    {product.slug.includes("cloud") ? (
                      <Cloud className="h-12 w-12 text-blue-500" />
                    ) : (
                      <Server className="h-12 w-12 text-purple-500" />
                    )}
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-2">
                  {product.heroTitle || product.name}
                </h3>
                <p className="text-gray-200 mb-4 line-clamp-2">
                  {product.heroSubtitle}
                </p>

                {/* Pricing if available */}
                {product.pricing && (
                  <div className="flex items-baseline gap-3 mb-4">
                    {product.pricing.monthly && (
                      <span className="text-2xl font-bold text-white">
                        {product.pricing.monthly}
                      </span>
                    )}
                    {product.pricing.yearly && (
                      <span className="text-sm text-gray-300">
                        or {product.pricing.yearly}/year
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
                  {product.heroCtaText || "Learn More"}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/products">
            <Button variant="outline" className="border-[#1E2260] text-[#1E2260] hover:bg-[#1E2260] hover:text-white">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
