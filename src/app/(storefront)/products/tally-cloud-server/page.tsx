import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TallyCloudConfigurator } from "@/components/storefront/TallyCloudConfigurator";
import { formatPrice } from "@/lib/utils";

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getTallyCloudServer() {
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: "tally-cloud-server" },
        { name: { contains: "Tally Cloud Server", mode: 'insensitive' } }
      ],
      status: "ACTIVE",
    },
    include: {
      addons: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      recurringPrices: true,
    },
  });

  return product;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Tally Cloud Server | Shaurrya Teleservices",
    description: "Configure your Tally Cloud Server plan with flexible billing options and powerful add-ons.",
  };
}

export default async function TallyCloudServerPage() {
  const product = await getTallyCloudServer();

  if (!product) {
    notFound();
  }

  // Transform addons for the configurator
  const addons = product.addons.map((addon) => ({
    id: addon.id,
    name: addon.name,
    description: addon.description,
    price: Number(addon.price),
    unit: addon.unit,
  }));

  // Get recurring prices for billing plans
  const recurringPrices = product.recurringPrices?.[0];
  
  const billingPlans = [
    { 
      id: "monthly", 
      label: "Monthly", 
      period: "/month", 
      price: recurringPrices?.monthlyPrice ? Number(recurringPrices.monthlyPrice) : 4500 
    },
    { 
      id: "quarterly", 
      label: "Quarterly", 
      period: "/quarter", 
      price: recurringPrices?.quarterlyPrice ? Number(recurringPrices.quarterlyPrice) : 12900,
      savings: 6
    },
    { 
      id: "semi-annual", 
      label: "Semi Annual", 
      period: "/6 months", 
      price: recurringPrices?.semiAnnualPrice ? Number(recurringPrices.semiAnnualPrice) : 24300,
      savings: 10
    },
    { 
      id: "yearly", 
      label: "Yearly", 
      period: "/year", 
      price: recurringPrices?.yearlyPrice ? Number(recurringPrices.yearlyPrice) : 43200,
      savings: 20
    },
  ];

  // Get base price
  const basePrice = product.basePrice ? Number(product.basePrice) : 4500;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tally Cloud Server
            </h1>
            <p className="text-lg text-gray-600">
              Enterprise-grade cloud hosting for Tally Prime with seamless integration, 
              automatic backups, and 24/7 support.
            </p>
          </div>
        </div>
      </div>

      {/* Configurator */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10">
        <TallyCloudConfigurator
          productName={product.name}
          productDescription={product.shortDescription || "Enterprise-grade cloud hosting for Tally Prime"}
          basePrice={basePrice}
          addons={addons}
          billingPlans={billingPlans}
        />
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Why Choose Tally Cloud Server?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-[#C62828]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Tally Certified</h3>
                <p className="text-gray-600 text-sm">Official Tally solution partner with certified expertise</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-[#C62828]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure & Compliant</h3>
                <p className="text-gray-600 text-sm">Enterprise-grade security with data encryption</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-[#C62828]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-gray-600 text-sm">Round-the-clock technical assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
