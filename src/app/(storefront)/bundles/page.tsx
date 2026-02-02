import Link from "next/link";
import { BundleCard } from "@/components/storefront/BundleCard";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Package, Percent, Sparkles, Zap } from "lucide-react";

// Mock bundles data
const mockBundles = [
  {
    id: "1",
    name: "Startup Bundle",
    slug: "startup-bundle",
    description:
      "Everything you need to launch your startup. Includes VM, load balancer, managed database, and SSL certificate.",
    shortDescription: "Perfect for startups and small teams getting started",
    image: null,
    price: 199.99,
    compareAtPrice: 349.99,
    discountType: "FIXED" as const,
    discountValue: 150,
    status: "ACTIVE" as const,
    isFeatured: true,
    isCustomizable: false,
    minItems: null,
    maxItems: null,
    validFrom: null,
    validUntil: null,
    items: [
      {
        id: "i1",
        bundleId: "1",
        productId: "1",
        quantity: 1,
        isRequired: true,
        isDefault: true,
        sortOrder: 0,
        product: {
          id: "1",
          name: "Virtual Machine Pro",
          slug: "virtual-machine-pro",
          basePrice: 99.99,
        } as any,
      },
      {
        id: "i2",
        bundleId: "1",
        productId: "2",
        quantity: 1,
        isRequired: true,
        isDefault: true,
        sortOrder: 1,
        product: {
          id: "2",
          name: "Load Balancer Standard",
          slug: "load-balancer-standard",
          basePrice: 49.99,
        } as any,
      },
      {
        id: "i3",
        bundleId: "1",
        productId: "4",
        quantity: 1,
        isRequired: true,
        isDefault: true,
        sortOrder: 2,
        product: {
          id: "4",
          name: "PostgreSQL Managed",
          slug: "postgresql-managed",
          basePrice: 59.99,
        } as any,
      },
      {
        id: "i4",
        bundleId: "1",
        productId: "5",
        quantity: 1,
        isRequired: true,
        isDefault: true,
        sortOrder: 3,
        product: {
          id: "5",
          name: "SSL Certificate",
          slug: "ssl-certificate",
          basePrice: 29.99,
        } as any,
      },
    ],
    seoMetadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Enterprise Suite",
    slug: "enterprise-suite",
    description:
      "Complete infrastructure for enterprise workloads. Includes enterprise VM, multi-region load balancer, firewall, and premium support.",
    shortDescription: "For large-scale enterprise deployments",
    image: null,
    price: 599.99,
    compareAtPrice: 999.99,
    discountType: "PERCENTAGE" as const,
    discountValue: 40,
    status: "ACTIVE" as const,
    isFeatured: true,
    isCustomizable: true,
    minItems: 3,
    maxItems: 6,
    validFrom: null,
    validUntil: null,
    items: [
      {
        id: "i5",
        bundleId: "2",
        productId: "1",
        quantity: 2,
        isRequired: true,
        isDefault: true,
        sortOrder: 0,
        product: {
          id: "1",
          name: "Virtual Machine Enterprise",
          slug: "virtual-machine-enterprise",
          basePrice: 199.99,
        } as any,
      },
      {
        id: "i6",
        bundleId: "2",
        productId: "2",
        quantity: 1,
        isRequired: true,
        isDefault: true,
        sortOrder: 1,
        product: {
          id: "2",
          name: "Multi-Region Load Balancer",
          slug: "multi-region-load-balancer",
          basePrice: 149.99,
        } as any,
      },
      {
        id: "i7",
        bundleId: "2",
        productId: "3",
        quantity: 1,
        isRequired: true,
        isDefault: true,
        sortOrder: 2,
        product: {
          id: "3",
          name: "Managed Firewall Plus",
          slug: "managed-firewall-plus",
          basePrice: 149.99,
        } as any,
      },
      {
        id: "i8",
        bundleId: "2",
        productId: "6",
        quantity: 1,
        isRequired: false,
        isDefault: true,
        sortOrder: 3,
        product: {
          id: "6",
          name: "24/7 Premium Support",
          slug: "premium-support",
          basePrice: 99.99,
        } as any,
      },
    ],
    seoMetadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "DevOps Toolkit",
    slug: "devops-toolkit",
    description:
      "Complete DevOps solution with CI/CD, monitoring, logging, and container registry.",
    shortDescription: "Accelerate your development workflow",
    image: null,
    price: 299.99,
    compareAtPrice: 449.99,
    discountType: "FIXED" as const,
    discountValue: 150,
    status: "ACTIVE" as const,
    isFeatured: false,
    isCustomizable: false,
    minItems: null,
    maxItems: null,
    validFrom: null,
    validUntil: null,
    items: [
      {
        id: "i9",
        bundleId: "3",
        productId: "5",
        quantity: 1,
        isRequired: true,
        isDefault: true,
        sortOrder: 0,
        product: {
          id: "5",
          name: "CI/CD Pipeline Pro",
          slug: "ci-cd-pipeline-pro",
          basePrice: 89.99,
        } as any,
      },
      {
        id: "i10",
        bundleId: "3",
        productId: "7",
        quantity: 1,
        isRequired: true,
        isDefault: true,
        sortOrder: 1,
        product: {
          id: "7",
          name: "Monitoring Suite",
          slug: "monitoring-suite",
          basePrice: 79.99,
        } as any,
      },
      {
        id: "i11",
        bundleId: "3",
        productId: "8",
        quantity: 1,
        isRequired: true,
        isDefault: true,
        sortOrder: 2,
        product: {
          id: "8",
          name: "Log Management",
          slug: "log-management",
          basePrice: 59.99,
        } as any,
      },
      {
        id: "i12",
        bundleId: "3",
        productId: "9",
        quantity: 1,
        isRequired: true,
        isDefault: true,
        sortOrder: 3,
        product: {
          id: "9",
          name: "Container Registry",
          slug: "container-registry",
          basePrice: 49.99,
        } as any,
      },
    ],
    seoMetadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const metadata = {
  title: "Bundles",
  description:
    "Save more with our curated product bundles. Get everything you need at a discounted price.",
};

export default function BundlesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="relative h-[240px] md:h-[280px] rounded-2xl overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80')`,
              }}
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-white">Bundles</span>
              </nav>
              <Badge className="w-fit mb-3 bg-[#8B1D1D] hover:bg-[#7A1919]">
                <Percent className="h-3 w-3 mr-1" />
                Save up to 40%
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Product Bundles
              </h1>
              <p className="text-gray-200 max-w-2xl">
                Get everything you need in one package at a discounted price. Our
                bundles are carefully curated to provide the best value for your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bundles Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mockBundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle as any} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Bundles Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why Choose Bundles?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#8B1D1D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Percent className="h-6 w-6 text-[#8B1D1D]" />
              </div>
              <h3 className="font-semibold mb-2">Save Money</h3>
              <p className="text-sm text-gray-600">
                Get up to 40% off compared to purchasing products individually.
              </p>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#8B1D1D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-[#8B1D1D]" />
              </div>
              <h3 className="font-semibold mb-2">Curated Selection</h3>
              <p className="text-sm text-gray-600">
                Products that work together seamlessly for your use case.
              </p>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#8B1D1D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-[#8B1D1D]" />
              </div>
              <h3 className="font-semibold mb-2">Quick Setup</h3>
              <p className="text-sm text-gray-600">
                Pre-configured bundles let you get started faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-center">
            <Sparkles className="h-10 w-10 text-[#8B1D1D] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Need a Custom Bundle?
            </h2>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              Contact us to create a custom bundle tailored to your specific requirements.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-[#8B1D1D] text-white font-medium hover:bg-[#7A1919] transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
