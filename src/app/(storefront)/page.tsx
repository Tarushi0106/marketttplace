import Link from "next/link";
import {
  ArrowRight,
  Check,
  Video,
  Mic,
  Zap,
  Shield,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
import { TrendingProducts } from "@/components/storefront/TrendingProducts";
import { Testimonials } from "@/components/storefront/Testimonials";
import { AutoPlayVideo } from "@/components/storefront/AutoPlayVideo";
import { ConversationDemo } from "@/components/storefront/ConversationDemo";

export default async function HomePage() {
  return (
    <div className="bg-white">

      {/* Hero Banner Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-white via-[#F2F7FF] to-[#E4EEFF]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(30,34,96,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,34,96,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div className="container relative mx-auto px-4 md:px-6 lg:px-8 pt-16 pb-10 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-[#1E2260] leading-[1.12] tracking-tight">
              Enterprise IT Solutions for <br />
              Growing Business
            </h1>
            <p className="mt-5 text-base md:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
              From AI-powered hiring to enterprise video surveillance — DeWiN delivers complete digital transformation under one roof, at a click.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-[#1E2260] hover:bg-[#2B3080] text-white rounded-lg h-12 px-8"
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
                className="border-[#1E2260]/30 bg-white text-[#1E2260] hover:bg-[#1E2260]/5 rounded-lg h-12 px-8"
                asChild
              >
                <Link href="/solutions">
                  View Solutions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Mascot visual */}
          <div className="relative mx-auto mt-6 flex max-w-md justify-center md:mt-4">
            <img
              src="/gif/bot-3.gif"
              alt="DeWiN AI assistant"
              className="w-full max-w-sm object-contain"
            />
            <div className="animate-float absolute -right-2 top-6 hidden h-16 w-16 overflow-hidden rounded-full border-4 border-white shadow-lg sm:block md:right-4">
              <img src="/gif/frame-3.gif" alt="" aria-hidden="true" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-[#1E2260] py-3.5">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-semibold text-white/70 tracking-wide uppercase">
            {[
              { icon: <Shield className="w-3.5 h-3.5" />, text: "ISO-Grade Security" },
              { icon: <Zap className="w-3.5 h-3.5" />, text: "Instant Deployment" },
              { icon: <Star className="w-3.5 h-3.5" />, text: "₹0 Setup Fees" },
              { icon: <Clock className="w-3.5 h-3.5" />, text: "Same-Day Onboarding" },
              { icon: <Check className="w-3.5 h-3.5" />, text: "No Lock-in Contracts" },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="pt-14 pb-2">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 mb-6">
          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EEF2FF] text-[#1E2260] text-xs font-semibold tracking-wide uppercase mb-3">
              Our Product Suite
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Tools That Actually Move the Needle
            </h2>
            <p className="mt-2 text-gray-500 text-sm max-w-lg mx-auto">
              Purpose-built AI and IT products for enterprises that refuse to stand still.
            </p>
          </div>

          {/* Product Suite mockup */}
          <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
            {/* Left animation */}
            <div className="group flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(17,24,39,0.1)] md:p-8">
              <img src="/2 frame.gif" alt="Left Animation" className="product-suite-animation" />
            </div>

            {/* Right animation */}
            <div className="group flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_4px_20px_rgba(17,24,39,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(17,24,39,0.1)] md:p-8">
              <AutoPlayVideo src="/3frame.mp4" className="product-suite-animation" />
            </div>
          </div>

          <style>{`
            .product-suite-animation {
              width: 100%;
              height: 100%;
              object-fit: contain;
              display: block;
              border-radius: 0.75rem;
            }
          `}</style>
        </div>
        <FeaturedProducts />
      </section>

      {/* VSaaS + Deco Talent Banner Section */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200 divide-y divide-gray-200">
            {/* VSaaS row */}
            <div className="grid bg-[#F8F9FC] md:grid-cols-2 md:divide-x md:divide-gray-200">
              {/* Text */}
              <div className="p-8 md:p-12 lg:p-14">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-amber-900 rounded-full text-[11px] font-bold tracking-wide uppercase">
                    <span>★</span> Premium Best Seller
                  </div>
                  <div className="inline-flex items-center px-3 py-1 bg-[#1E2260] text-white rounded-full text-xs font-medium">
                    <Video className="w-3 h-3 mr-1.5" />
                    Full Video Surveillance Camera System
                  </div>
                </div>
                <p className="text-gray-500 text-xs mb-3 tracking-wide uppercase font-medium">
                  VSaaS — <span className="text-gray-600">Video Surveillance as a Service</span>
                </p>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-snug text-gray-900">
                  See Everything. Miss Nothing. Act Instantly.
                </h2>
                <p className="text-gray-500 text-sm mb-6 max-w-lg leading-relaxed">
                  One cloud dashboard for every camera, every site, every threat. Real-time AI alerts so your security team acts before damage is done — not after.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#1E2260] shrink-0" /> AI Threat Detection</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#1E2260] shrink-0" /> HD &amp; 4K Camera Support</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#1E2260] shrink-0" /> Remote Live View</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#1E2260] shrink-0" /> 24/7 Cloud Recording</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#1E2260] shrink-0" /> Instant Alerts</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#1E2260] shrink-0" /> ONVIF Compatible</div>
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
                    className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-white transition-all"
                  >
                    View Solutions
                  </a>
                </div>
              </div>

              {/* Image */}
              <div className="flex items-center justify-center p-8 md:p-12">
                <img
                  src="/uploads/deco-voice-card.jpeg"
                  alt="Deco Voice AI assistant"
                  className="w-72 md:w-80 object-contain"
                />
              </div>
            </div>

            {/* Deco Talent row */}
            <div className="grid bg-white md:grid-cols-2 md:divide-x md:divide-gray-200">
              {/* Image */}
              <div className="order-2 flex items-center justify-center p-8 md:order-1 md:p-12">
                <img
                  src="/uploads/deco-talent-card.jpeg"
                  alt="Deco Talent AI screening assistant"
                  className="w-72 md:w-80 object-contain"
                />
              </div>

              {/* Text */}
              <div className="order-1 p-8 md:order-2 md:p-12 lg:p-14">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-amber-900 rounded-full text-[11px] font-bold tracking-wide uppercase">
                    <span>★</span> Premium Best Seller
                  </div>
                  <div className="inline-flex items-center px-3 py-1 bg-[#1E2260] text-white rounded-full text-xs font-medium">
                    <Mic className="w-3 h-3 mr-1.5" />
                    AI Interview &amp; Screening Bot
                  </div>
                </div>
                <p className="text-gray-500 text-xs mb-3 tracking-wide uppercase font-medium">
                  Deco Talent — <span className="text-gray-600">by DeWiN Digital Infrastructure &amp; AI Solutions</span>
                </p>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-snug text-gray-900">
                  Your Best Hire is One AI Conversation Away.
                </h2>
                <p className="text-gray-500 text-sm mb-6 max-w-lg leading-relaxed">
                  Stop drowning in CVs. Deco Talent scores every resume, conducts the first round, and hands you a 10-parameter report — before your morning coffee.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#1E2260] shrink-0" /> AI Resume Screening</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#1E2260] shrink-0" /> Automated Candidate Scoring</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#1E2260] shrink-0" /> AI-Conducted Interviews</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#1E2260] shrink-0" /> Video + Transcript Reports</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#1E2260] shrink-0" /> 30+ Language Support</div>
                  <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#1E2260] shrink-0" /> ATS &amp; CRM Integration</div>
                </div>
                <div className="flex gap-3">
                  <a
                    href="/products/deco-talent"
                    className="inline-flex items-center px-5 py-2.5 bg-[#1E2260] text-white text-sm font-semibold rounded-lg hover:bg-[#2B3080] transition-all"
                  >
                    Explore Deco Talent
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </a>
                  <a
                    href="/solutions"
                    className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
                  >
                    View Solutions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <TrendingProducts />

      {/* Interactive Conversation Demo Section */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Every Conversation. Handled Smarter.
            </h2>
            <p className="mt-2 text-gray-500 max-w-lg mx-auto">
              Pick a scenario and watch Deco Voice handle it in real time.
            </p>
          </div>

          <div className="mt-10">
            <ConversationDemo />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

    </div>
  );
}
