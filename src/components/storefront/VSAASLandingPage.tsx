"use client";
// v2
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Shield,
  Cloud,
  Zap,
  Users,
  Server,
  Bell,
  Search,
  Scale,
  CheckCircle,
  ArrowRight,
  Play,
  Lock,
  Clock,
  Headphones,
  Building2,
  Eye,
  Smartphone,
  Wifi,
  Gauge,
  FileSearch,
  AlertTriangle,
  Database,
  Video,
  HardDrive,
  LayoutDashboard,
  Monitor,
  Globe,
  Activity,
  BarChart3,
  ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#D0DEFF] hover:shadow-xl hover:shadow-[#1E2260]/5 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E2260] to-[#1E2260] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

interface FeatureItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}

function FeatureItem({ title, description, icon, index }: FeatureItemProps) {
  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-[#D0DEFF] hover:shadow-lg hover:shadow-[#1E2260]/5 transition-all duration-300 p-5 flex gap-4 items-start">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E2260] to-[#1E2260] flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{title}</h4>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

interface TrustBadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function TrustBadge({ icon, title, description }: TrustBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

interface PricingCardProps {
  monthlyPrice: number;
  yearlyPrice: number;
  isYearly: boolean;
  onToggle: () => void;
}

function PricingCard({ monthlyPrice, yearlyPrice, isYearly, onToggle }: PricingCardProps) {
  const price = isYearly ? yearlyPrice : monthlyPrice;
  const period = isYearly ? "year" : "month";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl sticky top-8">
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold text-xl text-gray-900">VSaaS Cloud Surveillance</h3>
        <p className="text-sm text-gray-500 mt-1">AI-powered video surveillance</p>
      </div>
      
      <div className="p-6">
        {/* Pricing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className={cn("text-sm font-medium", !isYearly ? "text-gray-900" : "text-gray-500")}>Monthly</span>
          <button 
            onClick={onToggle}
            className={cn(
              "w-14 h-7 rounded-full transition-colors relative",
              isYearly ? "bg-[#1E2260]" : "bg-gray-200"
            )}
          >
            <span className={cn(
              "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform",
              isYearly ? "left-8" : "left-1"
            )} />
          </button>
          <span className={cn("text-sm font-medium", isYearly ? "text-gray-900" : "text-gray-500")}>
            Yearly <span className="text-[#1E2260] text-xs">(Save 20%)</span>
          </span>
        </div>

        <div className="text-center mb-6">
          <span className="text-4xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
          <span className="text-gray-500">/{period}</span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Cloud video storage</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>AI-powered analytics</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Real-time monitoring</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Mobile app access</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>24/7 support</span>
          </div>
        </div>

        <Link href="/products/vsaas/configure">
          <Button className="w-full h-12 bg-[#1E2260] hover:bg-[#2B3080] text-white font-semibold rounded-xl">
            Configure Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        
        <button className="w-full h-12 mt-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
          <Play className="h-4 w-4" /> View Demo
        </button>
      </div>
    </div>
  );
}

export function VSAASLandingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const benefits = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "No CapEx Model",
      description: "Subscription-based, no upfront investment."
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Anywhere Access",
      description: "Monitor all sites from one dashboard."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI Security",
      description: "Real-time threat and anomaly detection powered by advanced AI."
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: "Lower Costs",
      description: "Reduce manpower and maintenance expenses."
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Multi-Site Monitoring",
      description: "Manage multiple locations centrally from a single unified dashboard."
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Fast Investigations",
      description: "Find events instantly with AI search capabilities."
    },
    {
      icon: <Gauge className="h-6 w-6" />,
      title: "Scalable Solution",
      description: "Easily add or remove cameras anytime as your needs grow."
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Compliance Ready",
      description: "Secure, compliant, and audit-ready system."
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: "24/7 Support",
      description: "Always available assistance whenever you need it."
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: "Cloud Storage",
      description: "Securely store and access recordings on the cloud without local infrastructure."
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Real-Time Alerts",
      description: "Get instant notifications via app, email, or SMS for any anomalies."
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "AI Intelligence",
      description: "Advanced AI analytics for smarter surveillance and insights."
    }
  ];

  const features = [
    {
      icon: <Video className="h-5 w-5" />,
      title: "Cloud VMS with Live & Playback",
      description: "Access live camera feeds and recorded footage anytime from a unified cloud platform."
    },
    {
      icon: <HardDrive className="h-5 w-5" />,
      title: "3 Days Cloud Backup",
      description: "Automatic cloud recording at 8 fps, SD-640×480P resolution with H.265 compression."
    },
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: "Admin Panel",
      description: "Centralized admin panel for complete device and user management across all sites."
    },
    {
      icon: <Monitor className="h-5 w-5" />,
      title: "1x Core – Desktop Application",
      description: "Full-featured desktop application for monitoring and managing your surveillance system."
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "5x Web View Access",
      description: "Up to 5 web browser logins for real-time monitoring without any software installation."
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "5x Mobile App Access",
      description: "Mobile app access for up to 5 users on both Android and iOS devices."
    },
    {
      icon: <Activity className="h-5 w-5" />,
      title: "Device Health Check",
      description: "Proactive health monitoring for cameras, NVRs, HDDs, SD cards, and connected devices."
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Reports & Dashboard",
      description: "Visual dashboards and detailed reports for activity, events, and system performance."
    },
    {
      icon: <ScrollText className="h-5 w-5" />,
      title: "Logs & Audit Trail",
      description: "Complete audit trail with timestamped logs for all user actions and system events."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EEF2FF]/50 via-white to-[#EEF2FF]/30" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#E8F0FF]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#E8F0FF]/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <Badge className="bg-[#E8F0FF] text-[#161848] hover:bg-[#E8F0FF] mb-6">
                <Zap className="h-3 w-3 mr-1" /> AI-Powered Solution
              </Badge>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                VSaaS Cloud Surveillance
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                AI-powered Video Surveillance as a Service that delivers real-time monitoring, cloud recording, and intelligent analytics—without heavy infrastructure.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/products/vsaas/configure">
                  <Button size="lg" className="h-14 px-8 bg-[#1E2260] hover:bg-[#2B3080] text-white font-semibold rounded-xl">
                    Configure Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-14 px-8 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl">
                  <Play className="mr-2 h-5 w-5" /> View Demo
                </Button>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4A9FD5]" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#E8F0FF] flex items-center justify-center">
                        <Eye className="h-5 w-5 text-[#1E2260]" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">24 Cameras</p>
                        <p className="text-xs text-gray-500">Online</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">All Active</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">99.9%</p>
                      <p className="text-xs text-gray-500">Uptime</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">12TB</p>
                      <p className="text-xs text-gray-500">Storage</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">8</p>
                      <p className="text-xs text-gray-500">Alerts</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -left-4 top-1/4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">SLA Guaranteed</span>
              </div>
              <div className="absolute -right-4 bottom-1/4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Cloud Native</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose VSaaS?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to meet the demands of modern surveillance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <BenefitCard 
                key={index}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features & Solutions Tabs Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs defaultValue="features" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="bg-gray-100 p-1 rounded-xl">
                <TabsTrigger
                  value="features"
                  className="px-8 py-2.5 rounded-lg font-semibold data-[state=active]:bg-[#1E2260] data-[state=active]:text-white"
                >
                  Features
                </TabsTrigger>
                <TabsTrigger
                  value="solutions"
                  className="px-8 py-2.5 rounded-lg font-semibold data-[state=active]:bg-[#1E2260] data-[state=active]:text-white"
                >
                  Solutions
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Features Tab */}
            <TabsContent value="features">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  What's Included
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Everything you need for professional cloud video surveillance
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <FeatureItem
                    key={index}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    index={index}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Solutions Tab */}
            <TabsContent value="solutions">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  VSaaS Solutions
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Choose the deployment model that fits your business needs
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* VSaaS On Cloud */}
                <div className="group p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                    <Cloud className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">VSaaS On Cloud</h3>
                  <p className="text-gray-600 mb-6">
                    Fully managed cloud-hosted video surveillance. No on-site servers required — store, manage, and access all footage securely from anywhere.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Zero infrastructure investment",
                      "Automatic updates & maintenance",
                      "Scalable cloud storage",
                      "Access from any device, anywhere",
                      "Pay-as-you-grow model",
                      "99.99% uptime SLA",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/products/vsaas/configure">
                    <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* VSaaS On-Prem */}
                <div className="group p-8 bg-gradient-to-br from-[#EEF2FF] to-white rounded-2xl border border-[#E8F0FF] hover:border-[#93C5FD] hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E2260] to-[#1E2260] flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                    <Server className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">VSaaS On-Prem</h3>
                  <p className="text-gray-600 mb-6">
                    Deploy on your own infrastructure for maximum control, data privacy, and compliance. All the power of VSaaS — fully within your network.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Full data sovereignty & privacy",
                      "Works in air-gapped environments",
                      "Integrates with existing hardware",
                      "Customisable to your IT policies",
                      "No internet dependency",
                      "Dedicated on-site support",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-[#1E2260] flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full h-11 bg-[#1E2260] hover:bg-[#2B3080] text-white font-semibold rounded-xl">
                    Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Choose the plan that fits your needs. No hidden fees, no surprises.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-transparent hover:border-[#D0DEFF] transition-colors">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Starter</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-1">₹4,999<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    <p className="text-sm text-gray-500 mb-4">For small businesses</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Up to 8 cameras</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 7-day cloud storage</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Basic AI analytics</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-[#1E2260] bg-[#EEF2FF]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900">Professional</h3>
                      <Badge className="bg-[#1E2260] text-white">Popular</Badge>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">₹14,999<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    <p className="text-sm text-gray-500 mb-4">For growing businesses</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Up to 32 cameras</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 30-day cloud storage</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Advanced AI analytics</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Right: Sticky Pricing Card */}
            <div className="lg:col-span-1">
              <PricingCard 
                monthlyPrice={4999}
                yearlyPrice={47990}
                isYearly={isYearly}
                onToggle={() => setIsYearly(!isYearly)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <TrustBadge 
              icon={<Shield className="h-5 w-5" />}
              title="99.99% SLA"
              description="Guaranteed uptime"
            />
            <TrustBadge 
              icon={<Headphones className="h-5 w-5" />}
              title="24/7 Support"
              description="Always available"
            />
            <TrustBadge 
              icon={<Server className="h-5 w-5" />}
              title="ONVIF Compatible"
              description="Works with all brands"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1E2260] to-[#161848]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Start your journey today
          </h2>
          <p className="text-lg text-[#E8F0FF] mb-8">
            Get started with VSaaS today and experience the future of video surveillance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products/vsaas/configure">
              <Button size="lg" className="h-14 px-8 bg-white text-[#1E2260] hover:bg-gray-100 font-semibold rounded-xl">
                Configure Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
