import {
  HeroSection,
  CapabilitiesSection,
  UseCaseGrid,
  ArchitectureSection,
  IndustrySection,
  CTASection
} from "@/components/vsaas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Eye, Zap, Scale, Building2, Search, Gauge, Lock } from "lucide-react";

export const metadata = {
  title: "AI Video Analytics (VSaaS) | Transform Your Surveillance",
  description: "Turn existing CCTV cameras into AI-powered insights with our Video Surveillance as a Service platform. Real-time anomaly detection, crowd monitoring, and object detection.",
};

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-[#1E2260]/50 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E2260] to-[#1E2260] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

export default function VSAASPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <HeroSection />
      
      {/* Tabs Section */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-900 border border-slate-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#1E2260] data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="capabilities" className="data-[state=active]:bg-[#1E2260] data-[state=active]:text-white">Capabilities</TabsTrigger>
              <TabsTrigger value="industries" className="data-[state=active]:bg-[#1E2260] data-[state=active]:text-white">Industries</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-12">
              {/* Description */}
              <div className="text-center max-w-3xl mx-auto">
                 <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                   Vsaas
                 </h2>
                 <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                   Overview Page
                 </h3>
                 <p className="text-lg text-slate-400 leading-relaxed">
                   AI-powered Video Surveillance as a Service (VSaaS) that delivers real-time monitoring, cloud recording, and intelligent analytics—without heavy infrastructure.
                 </p>
              </div>

              {/* Customer Benefits */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Customer Benefits
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-[#1E2260] mt-1">•</span>
                      <div>
                        <p className="font-semibold text-white">No CapEx Model</p>
                        <p className="text-slate-400 text-sm">Subscription-based, no upfront investment.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1E2260] mt-1">•</span>
                      <div>
                        <p className="font-semibold text-white">Anywhere Access</p>
                        <p className="text-slate-400 text-sm">Monitor all sites from one dashboard.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1E2260] mt-1">•</span>
                      <div>
                        <p className="font-semibold text-white">AI Security</p>
                        <p className="text-slate-400 text-sm">Real-time threat and anomaly detection.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1E2260] mt-1">•</span>
                      <div>
                        <p className="font-semibold text-white">Lower Costs</p>
                        <p className="text-slate-400 text-sm">Reduce manpower and maintenance expenses.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1E2260] mt-1">•</span>
                      <div>
                        <p className="font-semibold text-white">Multi-Site Monitoring</p>
                        <p className="text-slate-400 text-sm">Manage multiple locations centrally.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1E2260] mt-1">•</span>
                      <div>
                        <p className="font-semibold text-white">Fast Investigations</p>
                        <p className="text-slate-400 text-sm">Find events instantly with AI search.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1E2260] mt-1">•</span>
                      <div>
                        <p className="font-semibold text-white">Scalable Solution</p>
                        <p className="text-slate-400 text-sm">Easily add or remove cameras anytime.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1E2260] mt-1">•</span>
                      <div>
                        <p className="font-semibold text-white">Compliance Ready</p>
                        <p className="text-slate-400 text-sm">Secure, compliant, and audit-ready system.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Why Choose Us
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-[#1E2260] mt-1">•</span>
                      <div>
                        <p className="font-semibold text-white">99.99% SLA</p>
                        <p className="text-slate-400 text-sm">Guaranteed uptime</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1E2260] mt-1">•</span>
                      <div>
                        <p className="font-semibold text-white">Instant Setup</p>
                        <p className="text-slate-400 text-sm">Deploy in minutes</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1E2260] mt-1">•</span>
                      <div>
                        <p className="font-semibold text-white">24/7 Support</p>
                        <p className="text-slate-400 text-sm">Always available</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1E2260] mt-1">•</span>
                      <div>
                        <p className="font-semibold text-white">AI Intelligence</p>
                        <p className="text-slate-400 text-sm">Advanced AI analytics for smarter surveillance</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* ONVIF Compatibility Note */}
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-6 text-center">
                <p className="text-blue-300 font-medium">
                  👉 Our platform works seamlessly with ONVIF-compliant cameras across multiple brands, ensuring easy integration with your existing infrastructure.
                </p>
              </div>
            </TabsContent>

            {/* Capabilities Tab */}
            <TabsContent value="capabilities" className="space-y-12">
              <CapabilitiesSection />
              <UseCaseGrid />
              <ArchitectureSection />
            </TabsContent>

            {/* Industries Tab */}
            <TabsContent value="industries" className="space-y-12">
              <IndustrySection />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
