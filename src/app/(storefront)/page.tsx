import Link from "next/link";
import { ArrowRight, Check, Video, Users, Mic, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
import { TrendingProducts } from "@/components/storefront/TrendingProducts";
import { Testimonials } from "@/components/storefront/Testimonials";

export default async function HomePage() {
  return (
    <div className="bg-white">

      {/* Hero Banner Section */}
      <section className="relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')`,
              }}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-transparent" />

            {/* Content */}
            <div className="relative h-full flex items-center pb-12 md:pb-16 px-8 md:px-12 lg:px-16">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
                  Choose. Click. Subscribe.
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Enterprise IT Solutions for Growing Business
                </h1>
                <p className="mt-6 text-base md:text-lg text-gray-300 leading-relaxed max-w-xl">
                  Get started with digital transformation — powered by DeWiN Solutions
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-[#1E2260] hover:bg-[#2B3080] text-white rounded-lg h-12 px-8 border border-[#4A9FD5]/30"
                    asChild
                  >
                    <Link href="/products">
                      Explore Marketplace
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-black/30 backdrop-blur-sm text-white hover:bg-white/10 rounded-lg h-12 px-8"
                    asChild
                  >
                    <Link href="/solutions">
                      View Solutions
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* VSaaS Banner Section */}
      <section className="py-4 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12 md:py-16 px-8 md:px-14 lg:px-20">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Left: Text */}
            <div className="text-white flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-amber-900 rounded-full text-[11px] font-bold tracking-wide uppercase">
                  <span>★</span> Premium Best Seller
                </div>
                <div className="inline-flex items-center px-3 py-1 bg-[#1E2260] rounded-full text-xs font-medium">
                  <Video className="w-3 h-3 mr-1.5" />
                  Full Video Surveillance Camera System
                </div>
              </div>
              <p className="text-slate-400 text-xs mb-3 tracking-wide uppercase font-medium">
                VSaaS — <span className="text-slate-300">Video Surveillance as a Service</span>
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-snug">
                Enterprise-Grade CCTV &amp; AI Video Surveillance
              </h2>
              <p className="text-slate-400 text-sm mb-6 max-w-lg leading-relaxed">
                Our VSaaS platform powers complete video surveillance deployments — from single-site CCTV to multi-location enterprise networks. Monitor every corner, detect threats instantly, and manage it all from one cloud dashboard.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-slate-300">
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#4A9FD5] shrink-0" /> HD &amp; 4K Camera Support</div>
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#4A9FD5] shrink-0" /> AI Threat Detection</div>
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#4A9FD5] shrink-0" /> 24/7 Cloud Recording</div>
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#4A9FD5] shrink-0" /> Remote Live View</div>
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#4A9FD5] shrink-0" /> ONVIF Compatible</div>
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#4A9FD5] shrink-0" /> Instant Alerts</div>
              </div>
              <div className="flex gap-3">
                <a
                  href="/heropage"
                  className="inline-flex items-center px-5 py-2.5 bg-[#1E2260] text-white text-sm font-semibold rounded-lg hover:bg-[#2B3080] transition-all"
                >
                  Explore VSaaS
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </a>
                <a
                  href="/products/vsaas?tab=solutions"
                  className="inline-flex items-center px-5 py-2.5 border border-slate-600 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-800 transition-all"
                >
                  View Solutions
                </a>
              </div>
            </div>

            {/* Right: Image */}
            <div className="hidden md:block shrink-0">
              <div className="w-80 h-60 rounded-xl overflow-hidden shadow-xl shadow-[#1E2260]/30 border border-slate-700 bg-slate-800">
                <img
                  src="/uploads/camera.jpeg"
                  alt="VSaaS CCTV Camera Surveillance System"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Deco Talent — HR Bot Banner Section */}
      <section className="py-4 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 py-12 md:py-16 px-8 md:px-14 lg:px-20">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              {/* Left: Text */}
              <div className="text-white flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-amber-900 rounded-full text-[11px] font-bold tracking-wide uppercase">
                    <span>★</span> AI-Powered
                  </div>
                  <div className="inline-flex items-center px-3 py-1 bg-indigo-600 rounded-full text-xs font-medium">
                    <Mic className="w-3 h-3 mr-1.5" />
                    AI Interview & Screening Bot
                  </div>
                </div>
                <p className="text-slate-400 text-xs mb-3 tracking-wide uppercase font-medium">
                  Deco Talent — <span className="text-slate-300">by DeWiN Digital Infrastructure & AI Solutions</span>
                </p>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-snug">
                  Hire Smarter with AI-Powered Talent Screening
                </h2>
                <p className="text-slate-400 text-sm mb-6 max-w-lg leading-relaxed">
                  Deco Talent automates your entire hiring pipeline — from AI resume scoring to voice interviews and 10-parameter candidate reports. Screen hundreds of candidates instantly, in 30+ languages, with zero recruiter fatigue.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-indigo-400 shrink-0" /> AI Resume Screening</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-indigo-400 shrink-0" /> Automated Candidate Scoring</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-indigo-400 shrink-0" /> AI-Conducted Interviews</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-indigo-400 shrink-0" /> Video + Transcript Reports</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-indigo-400 shrink-0" /> 30+ Language Support</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-indigo-400 shrink-0" /> ATS & CRM Integration</div>
                </div>
              </div>

              {/* Right: Visual Card */}
              <div className="hidden md:block shrink-0">
                <div className="w-80 rounded-xl overflow-hidden shadow-xl shadow-indigo-900/40 border border-slate-700 bg-slate-800/60 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Deco AI Interviewer</p>
                      <p className="text-indigo-400 text-xs">Active • Interviewing now</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-5">
                    <div className="bg-slate-700/60 rounded-lg p-3">
                      <p className="text-slate-400 text-[10px] uppercase font-medium mb-1">Profile Scoring</p>
                      <p className="text-white text-sm font-bold">₹20 <span className="text-slate-400 font-normal text-xs">/ profile</span></p>
                    </div>
                    <div className="bg-slate-700/60 rounded-lg p-3">
                      <p className="text-slate-400 text-[10px] uppercase font-medium mb-1">Screening Call (5 min)</p>
                      <p className="text-white text-sm font-bold">₹50 <span className="text-slate-400 font-normal text-xs">/ call</span></p>
                    </div>
                    <div className="bg-slate-700/60 rounded-lg p-3">
                      <p className="text-slate-400 text-[10px] uppercase font-medium mb-1">AI Interview</p>
                      <p className="text-white text-sm font-bold">₹500 <span className="text-slate-400 font-normal text-xs">/ interview</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <p className="text-slate-400 text-xs">Shared LLM from <span className="text-white font-medium">₹5/min</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Categories Section */}
      <TrendingProducts />

      {/* Testimonials Section */}
      <Testimonials />

    </div>
  );
}
