import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Lock,
  Cloud,
  Phone,
  Mail,
  Building,
  Globe,
  Wifi,
  BarChart3,
  Camera,
  Mic,
  Users,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Solutions | DeWiN - Enterprise Digital Solutions",
  description: "Explore our comprehensive digital solutions for growing businesses",
};

const solutions = [
  {
    id: "vsaas",
    icon: Camera,
    iconColor: "text-[#1E2260]",
    iconBg: "bg-[#EEF2FF]",
    badge: "Popular",
    badgeColor: "bg-[#E8F0FF] text-[#161848]",
    tag: "AI Video Surveillance",
    title: "VSaaS",
    description: "AI-powered cloud video surveillance with real-time monitoring, intelligent alerts, and multi-site management.",
    features: ["Real-time AI threat detection", "Cloud recording & playback", "Multi-site camera management"],
    href: "/products/vsaas",
  },
  {
    id: "deco-voice",
    icon: Mic,
    iconColor: "text-[#0369A1]",
    iconBg: "bg-[#E0F2FE]",
    badge: "Trending",
    badgeColor: "bg-[#E0F2FE] text-[#0369A1]",
    tag: "AI Voice Automation",
    title: "Deco Voice",
    description: "Fully automated inbound & outbound AI voice calls — lead qualification, customer support, and CRM sync 24/7.",
    features: ["Automated inbound & outbound calls", "CRM integration & sync", "24/7 voice bot coverage"],
    href: "/products/deco-voice",
  },
  {
    id: "deco-talent",
    icon: Users,
    iconColor: "text-[#166534]",
    iconBg: "bg-[#F0FDF4]",
    badge: "AI-Powered",
    badgeColor: "bg-[#F0FDF4] text-[#166534]",
    tag: "AI Talent Intelligence",
    title: "Deco Talent",
    description: "Resume scoring, AI voice interviews, and 10-parameter candidate reports — hire smarter and faster.",
    features: ["AI resume scoring", "Automated voice interviews", "10-parameter candidate reports"],
    href: "/products/deco-talent",
  },
];

const industries = [
  { icon: Building, title: "SaaS Companies", description: "Scalable infrastructure for software platforms" },
  { icon: BarChart3, title: "Financial Services", description: "Secure, compliant infrastructure for fintech" },
  { icon: Globe, title: "E-commerce", description: "High-performance solutions for online retail" },
  { icon: Wifi, title: "Telecommunications", description: "Reliable infrastructure for telecom providers" },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1E2260]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold text-[#4A9FD5] uppercase tracking-widest mb-4">
              Enterprise Solutions
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
              Digital Infrastructure<br />
              <span className="text-[#4A9FD5]">Built for Business</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              From AI surveillance to cloud backup — powerful solutions for growing enterprises.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button className="bg-[#1E2260] hover:bg-[#161848] text-white px-6">
                  Explore All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-semibold text-[#1E2260] uppercase tracking-widest mb-2">Our Products</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Our Solutions</h2>
            <p className="text-gray-500 mt-2">Choose from our portfolio of enterprise-grade products</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((s, i) => (
              <Link
                key={i}
                href={s.href}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 hover:scale-[1.02] transition-all duration-200 flex flex-col"
              >
                {/* Top icon area */}
                <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                    <s.icon className={`h-6 w-6 ${s.iconColor}`} strokeWidth={1.75} />
                  </div>
                  {s.badge && (
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${s.badgeColor}`}>
                      {s.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="px-6 pb-6 flex flex-col flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{s.tag}</p>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#1E2260] transition-colors mb-2 leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{s.description}</p>

                  {/* Features */}
                  <ul className="space-y-1.5 mb-5 mt-auto">
                    {s.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-sm font-semibold text-[#1E2260]">
                    <span>Explore</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="mb-10">
            <p className="text-xs font-semibold text-[#1E2260] uppercase tracking-widest mb-2">Industries</p>
            <h2 className="text-2xl font-bold text-gray-900">Industries We Serve</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {industries.map((ind, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ind.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{ind.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{ind.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold text-[#4A9FD5] uppercase tracking-widest mb-3">Why DeWiN</p>
              <h2 className="text-3xl font-bold text-white mb-4">Built for performance.<br />Trusted by enterprises.</h2>
              <p className="text-gray-400 mb-8">Reliable, secure, and scalable solutions with dedicated support.</p>
              <div className="space-y-5">
                {[
                  { icon: Zap, title: "Instant Deployment", desc: "Go live in minutes, not days" },
                  { icon: Lock, title: "Enterprise Security", desc: "Bank-grade encryption & compliance" },
                  { icon: Cloud, title: "99.9% Uptime SLA", desc: "Always-on infrastructure you can rely on" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-[#4A9FD5]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-2">Talk to our team</h3>
              <p className="text-gray-400 text-sm mb-6">Get expert guidance and a custom quote for your business.</p>
              <div className="space-y-3 mb-6">
                <a href="tel:+918698080000" className="flex items-center gap-3 text-gray-300 hover:text-white text-sm transition-colors">
                  <Phone className="h-4 w-4 text-[#4A9FD5]" />
                  +91 86980 80000
                </a>
                <a href="mailto:sales@dewin.com" className="flex items-center gap-3 text-gray-300 hover:text-white text-sm transition-colors">
                  <Mail className="h-4 w-4 text-[#4A9FD5]" />
                  sales@dewin.com
                </a>
              </div>
              <Link href="/contact">
                <Button className="w-full bg-[#1E2260] hover:bg-[#161848] text-white">
                  Contact Sales
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
