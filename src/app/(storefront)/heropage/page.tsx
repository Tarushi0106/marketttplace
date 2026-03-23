'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Eye, Brain, Bell, Users, Car, Activity, Zap, Check, Building2, ShoppingBag, Truck, Lock, EyeOff, Clock, BarChart3, Box, Cloud as CloudIcon, Target, Cpu, Wifi, Database, Fingerprint, Camera, Monitor, AlertTriangle, Search, TrendingUp } from 'lucide-react';
import { Footer } from '@/components/storefront/Footer';

// ==================== HERO SECTION ====================
function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-white via-slate-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>
      
      {/* Subtle Gradient Orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-red-100 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-blue-50 rounded-full blur-3xl" />

      <div className="max-w-[1400px] mx-auto px-6 py-20 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-medium mb-8">
              <Activity className="w-4 h-4" />
              AI Powered Video Analytics
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Turn existing CCTV cameras into{' '}
              <span className="text-red-600">
                real-time AI insights
              </span>{' '}
              with enterprise-grade analytics.
            </h1>

            {/* Subtext */}
            <p className="text-lg text-slate-600 mb-10 max-w-lg">
              Enterprise-grade video analytics powered by AI. Detect, analyze and act in real-time with our advanced surveillance platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/products/vsaas"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all hover:shadow-lg hover:shadow-red-600/25 hover:scale-105"
              >
                View Products
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#capabilities"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-slate-200">
              {[
                { value: '99.9%', label: 'Accuracy' },
                { value: '10K+', label: 'Cameras' },
                { value: '24/7', label: 'Monitoring' },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image - Professional Dashboard Mockup */}
          <div className="hidden lg:block relative">
            <div className="relative">
              {/* Main Image Container with Effects */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-red-100/20 z-10" />
                
                {/* Main Image */}
                <img 
                  src="/uploads/WhatsApp Image 2026-03-23 at 5.03.20 PM.jpeg" 
                  alt="VSaaS Video Analytics Platform" 
                  className="w-full h-[400px] object-cover"
                />
                
                {/* Corner Accents */}
                <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-red-500/50 rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-red-500/50 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-red-500/50 rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-red-500/50 rounded-br-lg" />
              </div>

              {/* Floating UI Elements */}
              {/* Detection Badge */}
              <div className="absolute -left-6 top-1/4 bg-white/95 backdrop-blur-sm border border-green-200 rounded-xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-700 font-medium">Face Detected</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Confidence: 98.5%</div>
              </div>

              {/* Stats Badge */}
              <div className="absolute -right-4 top-1/2 bg-white/95 backdrop-blur-sm border border-blue-200 rounded-xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">Object Tracking</span>
                </div>
                <div className="text-xs text-slate-500">12 objects in frame</div>
              </div>

              {/* Camera Status */}
              <div className="absolute -left-4 bottom-8 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2 shadow-xl">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Camera className="w-3 h-3 text-red-600" />
                    <span className="text-slate-700">24 Cameras</span>
                  </div>
                  <div className="w-px h-3 bg-slate-300" />
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-slate-700">All Active</span>
                  </div>
                </div>
              </div>

              {/* AI Badge */}
              <div className="absolute -right-6 bottom-12 bg-gradient-to-r from-red-600 to-red-700 rounded-xl px-4 py-2 shadow-lg shadow-red-600/20">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-medium">AI Active</span>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute -inset-6 bg-gradient-to-r from-red-100/50 via-transparent to-blue-100/50 rounded-3xl blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-slate-400 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}

// ==================== AI CAPABILITIES SECTION ====================
function AICapabilitiesSection() {
  const capabilities = [
    { icon: Bell, title: 'Real-time Alerts', desc: 'Instant notifications via SMS, email, or push alerts when anomalies are detected.' },
    { icon: Users, title: 'Crowd Monitoring', desc: 'Track crowd density, flow patterns, and generate insights for better space management.' },
    { icon: Shield, title: 'Anomaly Detection', desc: 'AI identifies unusual patterns and suspicious behavior in real time.' },
    { icon: Eye, title: 'Object Detection', desc: 'Detect and recognize objects like vehicles, weapons, and people.' },
    { icon: CloudIcon, title: 'Cloud Storage', desc: 'Secure, scalable video storage with redundancy' },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="capabilities">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.03),transparent_70%)]" />
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-medium mb-6">
            <Activity className="w-4 h-4" />
            Enterprise Solutions
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            AI Video Analytics Capabilities
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-600 mx-auto mb-6" />
          <p className="text-lg text-slate-600 leading-relaxed">
            Transform legacy surveillance infrastructure into intelligent AI-powered security ecosystems with real-time threat detection and operational intelligence.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon!;
            return (
              <div 
                key={cap.title}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-red-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">{cap.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{cap.desc}</p>
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
    { 
      title: 'Security', 
      desc: 'Intrusion detection, perimeter monitoring, face recognition',
      icon: Shield,
      color: 'from-red-500 to-red-600'
    },
    { 
      title: 'Operations', 
      desc: 'People counting, queue management, heat mapping',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Safety', 
      desc: 'PPE detection, smoke & fire detection, anomaly alerts',
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600'
    },
    { 
      title: 'Investigation', 
      desc: 'ANPR, object tracking, forensic search',
      icon: Search,
      color: 'from-purple-500 to-purple-600'
    },
  ];

  return (
    <section className="py-24 bg-slate-50" id="use-cases">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            <Target className="w-4 h-4" />
            Applications
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            AI Features
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-6" />
          <p className="text-lg text-slate-600 leading-relaxed">
            Comprehensive solutions across security, operations, safety, and investigation
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, idx) => {
            const Icon = useCase.icon;
            return (
              <div 
                key={useCase.title}
                className="group bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${useCase.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3">{useCase.title}</h3>
                <p className="text-slate-600 leading-relaxed">{useCase.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ==================== PLATFORM ARCHITECTURE ====================
function PlatformArchitectureSection() {
  const steps = [
    { icon: Camera, label: 'Camera', desc: 'Existing CCTV', color: 'from-red-500 to-red-600' },
    { icon: Cpu, label: 'Edge/Cloud', desc: 'Processing', color: 'from-orange-500 to-orange-600' },
    { icon: Brain, label: 'AI Analytics', desc: 'Intelligence', color: 'from-blue-500 to-blue-600' },
    { icon: Monitor, label: 'Dashboard', desc: 'Monitoring', color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.05),transparent_50%)]" />
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Workflow
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            How VSaaS Works
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6" />
          <p className="text-lg text-slate-600 leading-relaxed">
            Simple flow from camera to actionable intelligence
          </p>
        </div>

        {/* Architecture Flow */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-200 via-red-300 to-slate-200 -translate-y-1/2" />
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="text-center relative">
                  {/* Icon Circle */}
                  <div className="w-20 h-20 mx-auto bg-white border-2 border-slate-200 rounded-full flex items-center justify-center mb-4 relative z-10 hover:border-red-300 transition-colors shadow-sm">
                    <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <div className="font-bold text-lg text-slate-900 mb-1">{step.label}</div>
                  <div className="text-sm text-slate-500">{step.desc}</div>
                  
                  {/* Arrow for desktop */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-4 text-slate-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== INDUSTRY APPLICATIONS ====================
function IndustryApplicationsSection() {
  const applications = [
    { 
      image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&h=400&fit=crop',
      title: 'Anomaly Detection', 
      description: 'AI identifies unusual patterns and behaviors in real-time, flagging potential security threats instantly'
    },
    { 
      image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=400&fit=crop',
      title: 'Object Detection', 
      description: 'Recognize vehicles, weapons, bags, and other objects with high accuracy'
    },
    { 
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop',
      title: 'Violence Detection', 
      description: 'Detect suspicious fights or aggressive activity in real time for rapid intervention'
    },
    { 
      image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&h=400&fit=crop',
      title: 'Smoke & Fire Detection', 
      description: 'Identify smoke and early fire indicators quickly through AI-powered visual monitoring'
    },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-sm font-medium mb-6">
            <Building2 className="w-4 h-4" />
            Industries
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Industry Applications
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            AI-powered VSaaS solutions tailored for different industries
          </p>
        </div>

        {/* Cards with Pictures */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {applications.map((app) => (
            <div 
              key={app.title}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={app.image} 
                  alt={app.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                
                {/* Overlay Icon */}
                <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{app.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{app.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== MAIN PAGE ====================
export default function HeroPage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <AICapabilitiesSection />
      <AIUseCasesSection />
      <PlatformArchitectureSection />
      <IndustryApplicationsSection />
    </div>
  );
}
