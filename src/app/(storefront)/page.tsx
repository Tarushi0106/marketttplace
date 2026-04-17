import Link from "next/link";
import { ArrowRight, Check, ChevronRight, ChevronLeft, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedCategories } from "@/components/storefront/FeaturedCategories";
import { TrendingProducts } from "@/components/storefront/TrendingProducts";
import { Testimonials } from "@/components/storefront/Testimonials";

export default async function HomePage() {
  return (
    <div className="bg-white">                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
      {/* Hero Banner Section */}
      <section className="relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
            {/* Background Image - Earth from space */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')`,
              }}
            />
            {/* Dark Overlay with gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-transparent" />

            {/* Content - Left aligned */}
            <div className="relative h-full flex items-center pb-12 md:pb-16 px-8 md:px-12 lg:px-16">
              <div className="max-w-2xl">
                {/* Pill label */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
                  Choose. Click. Subscribe.
                </div>
                
                {/* Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Enterprise Solutions for Growing Business
                </h1>
                
                {/* Subheading */}
                <p className="mt-6 text-base md:text-lg text-gray-300 leading-relaxed max-w-xl">
                  Get started with digital transformation solutions
                </p>
                
                {/* Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-12 px-8"
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

      {/* Featured Categories Section - From Backend */}
      <FeaturedCategories />

      {/* VSaaS Banner Section */}
      <section className="py-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left: Text */}
            <div className="text-white flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-amber-900 rounded-full text-[11px] font-bold tracking-wide uppercase">
                  <span>★</span> Premium Best Seller
                </div>
                <div className="inline-flex items-center px-3 py-1 bg-red-600 rounded-full text-xs font-medium">
                  <Video className="w-3 h-3 mr-1.5" />
                  Full Video Surveillance Camera System
                </div>
              </div>
              <p className="text-slate-400 text-xs mb-3 tracking-wide uppercase font-medium">
                VSaaS — <span className="text-slate-300">Video Surveillance as a Service</span>
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-snug">
                Enterprise-Grade CCTV &amp; AI Video Surveillance
              </h2>
              <p className="text-slate-400 text-sm mb-5 max-w-lg">
                Our VSaaS platform powers complete video surveillance deployments — from single-site CCTV to multi-location enterprise networks. Monitor every corner, detect threats instantly, and manage it all from one cloud dashboard.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-red-400 shrink-0" /> HD &amp; 4K Camera Support</div>
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-red-400 shrink-0" /> AI Threat Detection</div>
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-red-400 shrink-0" /> 24/7 Cloud Recording</div>
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-red-400 shrink-0" /> Remote Live View</div>
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-red-400 shrink-0" /> ONVIF Compatible</div>
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-red-400 shrink-0" /> Instant Alerts</div>
              </div>
              <div className="flex gap-3">
                <a
                  href="/heropage"
                  className="inline-flex items-center px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-all"
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
              <div className="w-80 h-56 rounded-xl overflow-hidden shadow-xl shadow-red-900/30 border border-slate-700 bg-slate-800">
                <img
                  src="/uploads/camera.jpeg"
                  alt="VSaaS CCTV Camera Surveillance System"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Trending Products Section - From Backend */}
      <TrendingProducts />

      {/* What our Clients Say Section - From Backend */}
      <Testimonials />
    </div>
  );
}
