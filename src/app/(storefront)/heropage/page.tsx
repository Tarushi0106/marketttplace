'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Eye, Brain, Bell, Users, Car, Activity, Zap, Check, Building2, ShoppingBag, Truck, Lock, EyeOff, Clock, BarChart3 } from 'lucide-react';

// ==================== HERO SECTION ====================
function HeroSection() {
  return (
    <section className="min-h-[70vh] flex items-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-[1400px] mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-medium mb-8">
              <Activity className="w-4 h-4" />
              AI Powered Video Analytics (VSaaS)
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 leading-tight mb-6">
              Turn existing CCTV cameras into{' '}
              <span className="text-red-600">
                real-time AI insights
              </span>{' '}
              with enterprise-grade analytics.
            </h1>

            {/* Subtext */}
            <p className="text-lg text-slate-600 mb-10 max-w-lg">
              Enterprise-grade video analytics powered by AI. Detect, analyze and act in real-time.
            </p>

            {/* CTA Button */}
            <Link 
              href="/products/vsaas"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              View Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Right Image - VSaaS Banner */}
          <div className="hidden lg:block">
            <div className="relative aspect-video max-w-2xl mx-auto">
              <img 
                src="https://www.videonetics.com/media/images/blogpost/image/vsaas-banner-1726844830.jpeg" 
                alt="VSaaS Video Analytics Platform" 
                className="w-full h-full object-contain rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== AI CAPABILITIES SECTION ====================
function AICapabilitiesSection() {
  const capabilities = [
    { icon: Shield, title: 'Anomaly Detection', desc: 'AI identifies unusual patterns and behaviors in real-time, flagging potential security threats instantly.' },
    { icon: Users, title: 'Crowd Monitoring', desc: 'Track crowd density, flow patterns, and generate insights for better space management.' },
    { icon: Eye, title: 'Object Detection', desc: 'Recognize vehicles, weapons, bags, and other objects with high accuracy.' },
    { icon: Bell, title: 'Real-time Alerts', desc: 'Instant notifications via SMS, email, or push alerts when anomalies are detected.' },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-red-50 relative overflow-hidden" id="capabilities">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-red-600 tracking-wider uppercase mb-4">Enterprise Solutions</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            AI Video Analytics Capabilities
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-600 mx-auto mb-8" />
          <p className="text-xl text-slate-500 leading-relaxed">
            Transform legacy surveillance infrastructure into intelligent AI-powered security ecosystems with real-time threat detection and operational intelligence.
          </p>
        </div>

        {/* 4-Column Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div 
                key={cap.title}
                className="relative group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Colored top bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-t-xl" />
                
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{cap.title}</h3>
                <p className="text-sm text-slate-600">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ==================== AI USE CASES GRID ====================
function AIUseCasesSection() {
  const useCases = [
    { title: 'Security', desc: 'Intrusion detection, perimeter monitoring, face recognition' },
    { title: 'Operations', desc: 'People counting, queue management, heat mapping' },
    { title: 'Safety', desc: 'PPE detection, smoke & fire detection, anomaly alerts' },
    { title: 'Investigation', desc: 'ANPR, object tracking, forensic search' },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-red-50" id="use-cases">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-red-600 tracking-wider uppercase mb-4">Applications</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            AI Use Cases
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-600 mx-auto mb-8" />
          <p className="text-xl text-slate-600 leading-relaxed">
            Comprehensive solutions across security, operations, safety, and investigation
          </p>
        </div>

        {/* Simple Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase) => (
            <div 
              key={useCase.title}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:border-red-300 hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">{useCase.title}</h3>
              <p className="text-sm text-slate-600">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== PLATFORM ARCHITECTURE ====================
function PlatformArchitectureSection() {
  const steps = [
    { icon: Eye, label: 'Camera', desc: 'Existing CCTV' },
    { icon: Zap, label: 'Edge/Cloud', desc: 'Processing' },
    { icon: Brain, label: 'AI Analytics', desc: 'Intelligence' },
    { icon: BarChart3, label: 'Dashboard', desc: 'Monitoring' },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-red-50 via-white to-slate-50 relative overflow-hidden">
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-red-600 tracking-wider uppercase mb-4">Workflow</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            How VSaaS Works
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-600 mx-auto mb-8" />
          <p className="text-xl text-slate-600 leading-relaxed">
            Simple flow from camera to actionable intelligence
          </p>
        </div>

        {/* Simple 4-Step Flow */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center mb-3 shadow-md">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="font-bold text-slate-900">{step.label}</div>
                <div className="text-sm text-slate-600">{step.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Features below */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <Cloud className="w-8 h-8 text-red-600 mb-3" />
            <h3 className="font-bold text-slate-900 mb-2">Cloud Storage</h3>
            <p className="text-sm text-slate-600">Secure, scalable video storage</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <Bell className="w-8 h-8 text-red-600 mb-3" />
            <h3 className="font-bold text-slate-900 mb-2">Real-time Alerts</h3>
            <p className="text-sm text-slate-600">Instant notifications</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <Building2 className="w-8 h-8 text-red-600 mb-3" />
            <h3 className="font-bold text-slate-900 mb-2">Multi-location</h3>
            <p className="text-sm text-slate-600">Single dashboard</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper component for Cloud icon
function Cloud({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}

// ==================== INDUSTRY APPLICATIONS ====================
function IndustryApplicationsSection() {
  const industries = [
    { 
      icon: Building2, 
      title: 'Manufacturing', 
      items: ['Worker safety monitoring', 'PPE compliance detection'],
      description: 'Ensure workplace safety with AI-powered monitoring'
    },
    { 
      icon: ShoppingBag, 
      title: 'Retail', 
      items: ['Footfall analytics', 'Theft detection'],
      description: 'Optimize store operations and prevent losses'
    },
    { 
      icon: Truck, 
      title: 'Logistics', 
      items: ['Vehicle tracking', 'Yard monitoring'],
      description: 'Streamline logistics with intelligent video analytics'
    },
  ];

  return (
    <section className="py-16 -mt-2 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Industry Applications
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tailored solutions for various industry verticals
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <div 
                key={industry.title}
                className="bg-white rounded-xl p-6 border border-slate-200"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{industry.title}</h3>
                <p className="text-sm text-slate-600">{industry.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ==================== MAIN PAGE ====================
export default function HeroPage() {
  return (
    <div>
      <HeroSection />
      <AICapabilitiesSection />
      <AIUseCasesSection />
      <PlatformArchitectureSection />
      <IndustryApplicationsSection />
    </div>
  );
}
