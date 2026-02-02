"use client";

import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  items: string[];
}

interface BundlesSectionProps {
  bundles: Bundle[];
}

export function BundlesSection({ bundles }: BundlesSectionProps) {
  // If no bundles from DB, show placeholder bundles
  const displayBundles = bundles.length > 0 ? bundles : [
    {
      id: "1",
      name: "Startup Bundle",
      slug: "startup-bundle",
      description: "Everything you need to launch your startup",
      price: 14999,
      originalPrice: 24999,
      items: ["VM Pro", "Load Balancer", "Managed DB", "SSL Certificate"],
    },
    {
      id: "2",
      name: "Enterprise Suite",
      slug: "enterprise-suite",
      description: "Complete infrastructure for enterprise workloads",
      price: 44999,
      originalPrice: 74999,
      items: ["VM Enterprise", "Multi-region LB", "Firewall Plus", "24/7 Support"],
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Product Bundles
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-2xl">
              Get everything you need in one package at a discounted price.
            </p>
          </div>
          <Link
            href="/bundles"
            className="hidden md:flex items-center gap-2 text-[#8B1D1D] font-medium hover:underline"
          >
            See All Bundles
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayBundles.map((bundle) => {
            const savings = bundle.originalPrice ? bundle.originalPrice - bundle.price : 0;
            const savingsPercent = bundle.originalPrice
              ? Math.round((savings / bundle.originalPrice) * 100)
              : 0;

            return (
              <div
                key={bundle.id}
                className="bg-white rounded-2xl p-6 md:p-8 relative overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {savings > 0 && (
                  <span className="absolute top-6 right-6 bg-[#8B1D1D] text-white text-sm font-medium px-3 py-1 rounded-full">
                    Save {savingsPercent}%
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900">{bundle.name}</h3>
                <p className="mt-2 text-gray-500">{bundle.description}</p>

                <ul className="mt-5 space-y-2">
                  {bundle.items.slice(0, 4).map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                  {bundle.items.length > 4 && (
                    <li className="text-sm text-gray-500">
                      +{bundle.items.length - 4} more items
                    </li>
                  )}
                </ul>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{bundle.price.toLocaleString("en-IN")}
                  </span>
                  {bundle.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      ₹{bundle.originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                  <span className="text-gray-500">/mo</span>
                </div>

                <Button
                  className="mt-5 w-full bg-[#8B1D1D] hover:bg-[#7A1919] text-white rounded-lg h-12"
                  asChild
                >
                  <Link href={`/bundles/${bundle.slug}`}>View Bundle</Link>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/bundles"
            className="inline-flex items-center gap-2 text-[#8B1D1D] font-medium"
          >
            See All Bundles
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
