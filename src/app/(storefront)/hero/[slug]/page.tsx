import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  ChevronRight,
  CheckCircle,
  Cloud,
  Server,
  ArrowRight,
  Check,
  Star,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getHeroProduct(slug: string) {
  try {
    const settings = await prisma.setting.findUnique({
      where: { key: "hero-products" },
    });

    if (!settings) return null;

    const value = settings.value as any;
    const products = value?.products || [];
    return products.find((p: any) => p.slug === slug && p.isActive);
  } catch (error) {
    console.error("Error fetching hero product:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getHeroProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} | Shaurrya Teleservices`,
    description: product.shortDescription || product.heroSubtitle,
  };
}

export default async function HeroProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getHeroProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section
        className="relative py-20 px-4 bg-cover bg-center"
        style={{
          backgroundImage: product.heroImage
            ? `url(${product.heroImage})`
            : undefined,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative max-w-6xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {product.heroTitle || product.name}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            {product.heroSubtitle}
          </p>
          {product.heroCtaText && product.heroCtaLink && (
            <Link href={product.heroCtaLink}>
              <Button size="lg" className="bg-[#C62828] hover:bg-[#B71C1C]">
                {product.heroCtaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Overview Section */}
      {product.overview && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Overview</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-600 whitespace-pre-wrap">
                {product.overview}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {product.features && product.features.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.features.map((feature: string, index: number) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions Section */}
      {product.solutions && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Solutions</h2>
            <p className="text-center text-gray-600 mb-12">
              Choose the deployment option that best fits your needs
            </p>

            <Tabs defaultValue="cloud" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="cloud" className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  {product.solutions.cloud?.title || "Cloud"}
                </TabsTrigger>
                <TabsTrigger value="onPremise" className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  {product.solutions.onPremise?.title || "On-Premise"}
                </TabsTrigger>
              </TabsList>

              {/* Cloud Solution */}
              <TabsContent value="cloud" className="mt-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Cloud className="h-8 w-8 text-blue-600" />
                    <h3 className="text-2xl font-bold">
                      {product.solutions.cloud?.title || "VSaaS on Cloud"}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {product.solutions.cloud?.description}
                  </p>

                  {product.solutions.cloud?.features &&
                    product.solutions.cloud.features.length > 0 && (
                      <div className="grid md:grid-cols-2 gap-3 mb-6">
                        {product.solutions.cloud.features.map(
                          (feature: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-4 w-4 text-blue-600" />
                              <span>{feature}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {product.solutions.cloud?.buttonText &&
                    product.solutions.cloud.link && (
                      <Link href={product.solutions.cloud.link}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          {product.solutions.cloud.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                </div>
              </TabsContent>

              {/* On-Premise Solution */}
              <TabsContent value="onPremise" className="mt-8">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Server className="h-8 w-8 text-purple-600" />
                    <h3 className="text-2xl font-bold">
                      {product.solutions.onPremise?.title ||
                        "On-Premise Solution"}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {product.solutions.onPremise?.description}
                  </p>

                  {product.solutions.onPremise?.features &&
                    product.solutions.onPremise.features.length > 0 && (
                      <div className="grid md:grid-cols-2 gap-3 mb-6">
                        {product.solutions.onPremise.features.map(
                          (feature: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-4 w-4 text-purple-600" />
                              <span>{feature}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {product.solutions.onPremise?.buttonText &&
                    product.solutions.onPremise.link && (
                      <Link href={product.solutions.onPremise.link}>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          {product.solutions.onPremise.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      {product.pricing && (product.pricing.monthly || product.pricing.yearly) && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Pricing</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {product.pricing.monthly && (
                <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
                  <h3 className="text-xl font-semibold mb-2">Monthly</h3>
                  <p className="text-4xl font-bold text-[#C62828] mb-4">
                    {product.pricing.monthly}
                  </p>
                  <p className="text-gray-500 text-sm">per month</p>
                </div>
              )}

              {product.pricing.yearly && (
                <div className="bg-white rounded-xl p-6 shadow-sm border text-center relative overflow-hidden">
                  <Badge className="absolute top-4 right-4 bg-green-100 text-green-800">
                    Best Value
                  </Badge>
                  <h3 className="text-xl font-semibold mb-2">Yearly</h3>
                  <p className="text-4xl font-bold text-[#C62828] mb-4">
                    {product.pricing.yearly}
                  </p>
                  <p className="text-gray-500 text-sm">per year</p>
                </div>
              )}
            </div>

            {product.pricing.features &&
              product.pricing.features.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 text-center">
                    What's Included
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {product.pricing.features.map(
                      (feature: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 justify-center"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 bg-[#C62828] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Contact us today to learn more about {product.name}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                variant="secondary"
                className="text-[#C62828]"
              >
                Contact Sales
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/cart">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#C62828]"
              >
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
