import { 
  HeroSection, 
  CapabilitiesSection, 
  UseCaseGrid, 
  ArchitectureSection, 
  IndustrySection, 
  CTASection 
} from "@/components/vsaas";

export const metadata = {
  title: "AI Video Analytics (VSaaS) | Transform Your Surveillance",
  description: "Turn existing CCTV cameras into AI-powered insights with our Video Surveillance as a Service platform. Real-time anomaly detection, crowd monitoring, and object detection.",
};

export default function VSAASPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <HeroSection />
      <CapabilitiesSection />
      <UseCaseGrid />
      <ArchitectureSection />
      <IndustrySection />
      <CTASection />
    </div>
  );
}
