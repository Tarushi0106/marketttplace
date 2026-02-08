import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Shield,
  Zap,
  Users,
  BarChart3,
  Lock,
  Phone,
  Mail,
  Building,
  Globe,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Solutions | NetNxt - Enterprise Digital Solutions",
  description: "Explore our comprehensive digital solutions for growing businesses",
};

const solutions = [
  {
    id: "cloud-infrastructure",
    icon: Cloud,
    title: "Cloud & Infrastructure",
    description: "Cloud servers and hosting, Domains, cloud servers, virtual machines",
    features: ["Cloud Servers", "Virtual Machines", "Domain Registration", "Cloud Hosting"],
    href: "/products?category=cloud-infrastructure",
  },
  {
    id: "business-applications",
    icon: Users,
    title: "Business Applications",
    description: "ERP, accounting (Tally on Cloud), CRM, HRMS, finance & core business software",
    features: ["ERP Solutions", "Tally on Cloud", "CRM Software", "HRMS Platform"],
    href: "/products?category=business-applications",
  },
  {
    id: "connectivity",
    icon: Globe,
    title: "Connectivity – SDWAN",
    description: "Secure Wide Area Network solutions for seamless connectivity",
    features: ["SD-WAN Implementation", "Network Optimization", "Secure Connectivity", "Remote Access"],
    href: "/products?category=connectivity",
  },
  {
    id: "workplace",
    icon: Users,
    title: "Workplace & Collaboration",
    description: "Microsoft 365, email, cloud telephony (ATA Cloud), meetings, unified communications",
    features: ["Microsoft 365", "Cloud Telephony (ATA)", "Video Conferencing", "Unified Communications"],
    href: "/products?category=workplace",
  },
  {
    id: "cybersecurity",
    icon: Shield,
    title: "Cybersecurity",
    description: "Acronis Cyber Security and comprehensive protection solutions",
    features: ["Acronis Cyber Security", "Threat Protection", "Data Encryption", "Endpoint Security"],
    href: "/products?category=cybersecurity",
  },
  {
    id: "data-ai",
    icon: BarChart3,
    title: "Data, AI & Intelligence",
    description: "Analytics platforms, AI tools, reporting, data platforms (fueady)",
    features: ["Analytics Platforms", "AI Tools", "Business Intelligence", "Data Platforms"],
    href: "/products?category=data-ai",
  },
  {
    id: "industry-solutions",
    icon: Globe,
    title: "Industry Solutions",
    description: "Drone as a Service, industry-specific monitoring, smart infrastructure solutions",
    features: ["Drone as a Service", "Industry Monitoring", "Smart Infrastructure", "Custom Solutions"],
    href: "/products?category=industry-solutions",
  },
  {
    id: "pricing",
    icon: ArrowRight,
    title: "Get Pricing",
    description: "Use our calculators to estimate your costs and plan your budget",
    features: ["Cost Calculator", "Pricing Estimator", "Budget Planner", "Quote Generator"],
    href: "/pricing-calculator",
  },
];

const industries = [
  {
    icon: Building,
    title: "SaaS Companies",
    description: "Scalable infrastructure for software-as-a-service platforms",
  },
  {
    icon: BarChart3,
    title: "Financial Services",
    description: "Secure, compliant infrastructure for fintech and banking",
  },
  {
    icon: Globe,
    title: "E-commerce",
    description: "High-performance solutions for online retail",
  },
  {
    icon: Wifi,
    title: "Telecommunications",
    description: "Reliable infrastructure for telecom providers",
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-[#8B1D1D] py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Enterprise Digital Solutions
              <br />
              <span className="text-[#8B1D1D]">Built for Scale</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Powerful infrastructure solutions designed for growing businesses.
              Deploy in seconds, scale infinitely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-[#8B1D1D] hover:bg-[#7A1919] w-full sm:w-auto">
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 w-full sm:w-auto">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive digital solutions to power your business growth
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, index) => (
              <Link
                key={index}
                href={solution.href}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#8B1D1D]/10 flex items-center justify-center mb-4 group-hover:bg-[#8B1D1D] transition-colors">
                  <solution.icon className="h-6 w-6 text-[#8B1D1D] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#8B1D1D] transition-colors">
                  {solution.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{solution.description}</p>
                <ul className="space-y-1">
                  {solution.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center text-[#8B1D1D] text-sm font-medium">
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Calculator CTA */}
      <section className="py-16 bg-gradient-to-br from-[#8B1D1D] to-[#6B1515]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get Your Pricing
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Use our interactive calculators to estimate your infrastructure costs
              and plan your budget effectively.
            </p>
            <Link href="/pricing-calculator">
              <Button size="lg" className="bg-white text-[#8B1D1D] hover:bg-gray-100">
                Open Pricing Calculator
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Industries We Serve
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Specialized solutions tailored for your industry
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-[#8B1D1D]/10 flex items-center justify-center mb-4">
                  <industry.icon className="h-6 w-6 text-[#8B1D1D]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {industry.title}
                </h3>
                <p className="text-gray-600 text-sm">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Why NetNxt?
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Built for businesses that demand performance, reliability, and
                scalability without the complexity.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#8B1D1D]/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-[#8B1D1D]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Instant Deployment</h3>
                    <p className="text-gray-400">
                      Deploy your infrastructure in seconds, not hours
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#8B1D1D]/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-[#8B1D1D]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Enterprise Security</h3>
                    <p className="text-gray-400">
                      Bank-grade encryption and compliance certifications
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#8B1D1D]/20 flex items-center justify-center flex-shrink-0">
                    <Cloud className="h-5 w-5 text-[#8B1D1D]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Global Scale</h3>
                    <p className="text-gray-400">
                      Data centers worldwide for low-latency access
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#8B1D1D] to-[#6B1515] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Start Your Journey</h3>
                <p className="text-gray-200 mb-6">
                  Ready to transform your business infrastructure? Let's talk.
                </p>
                <div className="space-y-3 mb-6">
                  <a
                    href="tel:+919999999999"
                    className="flex items-center gap-3 text-gray-200 hover:text-white"
                  >
                    <Phone className="h-5 w-5" />
                    +91 99999 99999
                  </a>
                  <a
                    href="mailto:sales@shaurrya.com"
                    className="flex items-center gap-3 text-gray-200 hover:text-white"
                  >
                    <Mail className="h-5 w-5" />
                    sales@shaurrya.com
                  </a>
                </div>
                <Link href="/contact">
                  <Button className="w-full bg-white text-[#8B1D1D] hover:bg-gray-100">
                    Contact Sales
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#8B1D1D]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using NetNxt for their digital needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Explore Marketplace
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white/10 w-full sm:w-auto"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
