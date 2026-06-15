import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Shield,
  Zap,
  Users,
  Globe,
  Award,
  CheckCircle,
  ArrowRight,
  Server,
  Database,
  Cloud,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Why Choose DeWiN | DeWiN Solutions",
  description: "Discover why thousands of businesses trust DeWiN for their cloud hosting and infrastructure needs.",
};

export default function AboutPage() {
  const stats = [
    { value: "99.99%", label: "Uptime Guarantee" },
    { value: "50K+", label: "Customers Served" },
    { value: "24/7", label: "Expert Support" },
    { value: "15+", label: "Global Data Centers" },
  ];

  const values = [
    {
      icon: Zap,
      title: "Performance First",
      description:
        "We prioritize speed and reliability in everything we do, ensuring your applications run at peak performance.",
    },
    {
      icon: Shield,
      title: "Security First",
      description:
        "Enterprise-grade security measures protect your data and infrastructure around the clock.",
    },
    {
      icon: Users,
      title: "Customer Centric",
      description:
        "Your success is our success. We're committed to providing exceptional support and service.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "Our distributed infrastructure ensures low latency access from anywhere in the world.",
    },
  ];

  const features = [
    {
      icon: Server,
      title: "Virtual Servers",
      description: "High-performance cloud VMs with scalable resources",
    },
    {
      icon: Database,
      title: "Managed Databases",
      description: "Fully managed MySQL, PostgreSQL, and MongoDB services",
    },
    {
      icon: Cloud,
      title: "Cloud Storage",
      description: "Scalable, durable, and secure object storage solutions",
    },
    {
      icon: Lock,
      title: "DDoS Protection",
      description: "Advanced protection against distributed denial of service attacks",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-[#1E2260] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/20 mb-6">
              Trusted by 50,000+ Businesses Worldwide
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Why Choose{" "}
              <span className="text-[#FF6B6B]">DeWiN</span> for Your Cloud
              Infrastructure?
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              We combine cutting-edge technology with unparalleled support to deliver
              hosting solutions that scale with your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#1E2260] hover:bg-[#161848]" asChild>
                <Link href="/products">
                  Explore Our Solutions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
                asChild
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#1E2260] mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do and every decision we make.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1E2260] to-[#4A9FD5] flex items-center justify-center">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Enterprise-Grade Infrastructure
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built on the latest technology stack, our platform delivers the
                performance, reliability, and security your business demands.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1E2260]/10 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-[#1E2260]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1E2260] to-[#4A9FD5] rounded-3xl opacity-10 transform rotate-3"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800 p-8 flex items-center justify-center">
                    <Globe className="h-48 w-48 text-white opacity-50" />
                  </div>
                  <div className="p-6 bg-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="h-6 w-6 text-[#1E2260]" />
                      <span className="font-semibold text-gray-900">
                        Award-Winning Platform
                      </span>
                    </div>
                    <p className="text-gray-600">
                      Recognized by industry leaders for excellence in cloud
                      hosting and customer service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1E2260] to-[#4A9FD5]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience the DeWiN Difference?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust DeWiN for their
            mission-critical infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#1E2260] hover:bg-gray-100" asChild>
              <Link href="/products">
                Get Started
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#1E2260] bg-transparent"
              asChild
            >
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
