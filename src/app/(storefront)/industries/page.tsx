import Link from "next/link";
import { ChevronRight, ArrowRight, Building2, ShoppingCart, Laptop, Hospital, GraduationCap, Building, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Industries We Serve | DeWiN",
  description: "DeWiN provides tailored cloud hosting solutions for businesses across various industries.",
};

const industries = [
  {
    icon: Building2,
    name: "Real Estate",
    slug: "real-estate",
    description: "Fast, secure hosting for property listings, CRM systems, and customer portals.",
    features: ["High availability", "Secure data storage", "Fast page loads"],
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: ShoppingCart,
    name: "E-commerce",
    slug: "ecommerce",
    description: "Scalable infrastructure for online stores that handle peak traffic effortlessly.",
    features: ["PCI compliance", "Fast checkout", "Inventory sync"],
    color: "from-green-500 to-green-600",
  },
  {
    icon: Laptop,
    name: "IT & Software",
    slug: "it-software",
    description: "Development environments, CI/CD pipelines, and production hosting.",
    features: ["Docker & Kubernetes", "Git integration", "Auto-scaling"],
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Hospital,
    name: "Healthcare",
    slug: "healthcare",
    description: "HIPAA-compliant hosting for patient data and medical applications.",
    features: ["HIPAA compliant", "Data encryption", "99.99% uptime"],
    color: "from-[#1E2260] to-[#1E2260]",
  },
  {
    icon: GraduationCap,
    name: "Education",
    slug: "education",
    description: "Learning management systems, video streaming, and student portals.",
    features: ["Video streaming", "Bandwidth scaling", "Student portals"],
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: Building,
    name: "Finance & Banking",
    slug: "finance",
    description: "Secure, compliant infrastructure for financial services and fintech.",
    features: ["Bank-grade security", "99.99% uptime", "Compliance ready"],
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Factory,
    name: "Manufacturing",
    slug: "manufacturing",
    description: "IoT platforms, supply chain management, and operational technology.",
    features: ["IoT ready", "Real-time data", "Edge computing"],
    color: "from-gray-600 to-gray-700",
  },
];

export default function IndustriesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-[#1E2260] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/20 mb-6">
              Serving 50,000+ Businesses Worldwide
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Industries We{" "}
              <span className="text-[#FF6B6B]">Serve</span>
            </h1>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              From startups to enterprises, we provide tailored cloud solutions that meet
              the unique needs of each industry.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Industries Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tailored Solutions for Every Sector
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform is designed to meet industry-specific compliance, performance, and security requirements.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${industry.color}`}></div>
                <CardContent className="p-6">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <industry.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {industry.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{industry.description}</p>
                  <div className="space-y-2 mb-4">
                    {industry.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1E2260]"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="link"
                    className="text-[#1E2260] p-0 h-auto font-semibold"
                    asChild
                  >
                    <Link href={`/contact?industry=${industry.slug}`}>
                      Get Custom Solution
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#1E2260] mb-2">50K+</div>
              <div className="text-gray-600">Businesses Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#1E2260] mb-2">15+</div>
              <div className="text-gray-600">Industries Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#1E2260] mb-2">99.99%</div>
              <div className="text-gray-600">Uptime SLA</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#1E2260] mb-2">24/7</div>
              <div className="text-gray-600">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1E2260] to-[#4A9FD5]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Don't See Your Industry?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            We work with businesses of all sizes and industries. Contact us to discuss your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#1E2260] hover:bg-gray-100" asChild>
              <Link href="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#1E2260] bg-transparent"
              asChild
            >
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
