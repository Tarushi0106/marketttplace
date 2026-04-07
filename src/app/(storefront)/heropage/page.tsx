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

      <div className="max-w-[1400px] mx-auto px-6 py-12 w-full relative z-10">
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
                  src="/uploads/cam2.jpeg"
                  alt="VSaaS Video Analytics Platform"
                  className="w-full h-[400px] object-contain bg-slate-900"
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
    <section className="py-16 bg-white relative overflow-hidden" id="capabilities">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.03),transparent_70%)]" />
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
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
                className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-red-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                
                {/* Animated Background Elements */}
                {idx === 0 && (
                  <div className="absolute top-2 right-2 w-8 h-8 bg-red-100 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                )}
                {idx === 1 && (
                  <div className="absolute top-4 right-4 flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                )}
                {idx === 2 && (
                  <div className="absolute top-3 right-3 w-10 h-10 border-2 border-red-300 rounded-full animate-pulse" />
                )}
                {idx === 3 && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 border-2 border-blue-400 rounded animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                )}
                
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform relative">
                  <Icon className="w-7 h-7 text-white" />
                  {/* Notification dot for alerts */}
                  {idx === 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">{cap.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{cap.desc}</p>
                
                {/* Progress bar animation for certain cards */}
                {idx < 4 && (
                  <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse" 
                      style={{ width: `${60 + idx * 10}%` }} 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        

      </div>
    </section>
  );
}

// ==================== AI FEATURES DEMO SECTION ====================
function AIFeaturesDemo() {
  const demos = [
    {
      title: 'Real-time Alerts',
      bg: 'from-red-900/20 to-red-950/30',
      border: 'border-red-500/30',
      icon: Bell,
      animation: (
        <div className="relative w-32 h-24 bg-slate-900/80 rounded-lg overflow-hidden border border-red-500/30">
          {/* Sliding notification panel */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-red-600 flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">⚠ SECURITY ALERT</span>
          </div>
          {/* Bell ringing animation */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2">
            <div className="w-8 h-10 relative">
              <div className="w-8 h-8 bg-red-500 rounded-full absolute top-0 animate-[bellRing_0.5s_ease-in-out_infinite]" style={{ transformOrigin: 'top center' }} />
              <div className="w-1 h-3 bg-red-500 absolute top-7 left-1/2 -translate-x-1/2" />
              <div className="w-3 h-3 bg-red-500 rounded-full absolute top-9 left-1/2 -translate-x-1/2 animate-ping" />
            </div>
          </div>
          {/* Scrolling alert list */}
          <div className="absolute bottom-2 left-1 right-1 h-8 overflow-hidden">
            <div className="flex flex-col gap-1 animate-[scrollUp_3s_linear_infinite]">
              <div className="bg-red-900/60 text-red-200 text-[7px] px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />Motion detected
              </div>
              <div className="bg-red-900/60 text-red-200 text-[7px] px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />Face recognized
              </div>
              <div className="bg-red-900/60 text-red-200 text-[7px] px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />Zone breach
              </div>
            </div>
          </div>
          <style jsx>{`
            @keyframes bellRing {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(15deg); }
              75% { transform: rotate(-15deg); }
            }
            @keyframes scrollUp {
              0% { transform: translateY(100%); }
              100% { transform: translateY(-100%); }
            }
          `}</style>
        </div>
      )
    },
    {
      title: 'Crowd Monitoring',
      bg: 'from-blue-900/20 to-blue-950/30',
      border: 'border-blue-500/30',
      icon: Users,
      animation: (
        <div className="relative w-32 h-24 bg-slate-900/80 rounded-lg overflow-hidden border border-blue-500/30">
          {/* Wave pattern background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-blue-600/30 to-transparent">
              <svg className="w-full h-full animate-[wave_2s_ease-in-out_infinite]" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="0 20 Q 25 5, 50 20 T 100 20 L 100 20 L 0 20" fill="rgba(59,130,246,0.3)" />
              </svg>
            </div>
            <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-cyan-600/20 to-transparent" style={{ animationDelay: '0.5s' }}>
              <svg className="w-full h-full animate-[wave_2.5s_ease-in-out_infinite]" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="0 20 Q 25 10, 50 20 T 100 20 L 100 20 L 0 20" fill="rgba(6,182,212,0.2)" />
              </svg>
            </div>
          </div>
          {/* Counter with rolling numbers */}
          <div className="absolute top-2 left-2">
            <div className="bg-blue-600/80 rounded px-2 py-1">
              <span className="text-white font-bold text-lg">24</span>
              <span className="text-blue-200 text-[8px] ml-1">people</span>
            </div>
          </div>
          {/* Density heat zones */}
          <div className="absolute top-2 right-2 flex gap-0.5">
            <div className="w-2 h-4 bg-gradient-to-t from-green-500 to-green-300 rounded-sm animate-[pulse_1s_ease-in-out_infinite]" />
            <div className="w-2 h-4 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-sm animate-[pulse_1s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-4 bg-gradient-to-t from-orange-500 to-orange-300 rounded-sm animate-[pulse_1s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }} />
            <div className="w-2 h-4 bg-gradient-to-t from-red-500 to-red-300 rounded-sm animate-[pulse_1s_ease-in-out_infinite]" style={{ animationDelay: '0.6s' }} />
          </div>
          {/* Animated stick figures */}
          <div className="absolute inset-0 flex items-end justify-around pb-2">
            <div className="w-2 h-4 bg-blue-400 rounded-full animate-[bounce_1s_ease-in-out_infinite]" />
            <div className="w-2 h-5 bg-cyan-400 rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }} />
            <div className="w-2 h-4 bg-blue-400 rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '0.6s' }} />
          </div>
          <style jsx>{`
            @keyframes wave {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(-20px); }
            }
          `}</style>
        </div>
      )
    },
    {
      title: 'Anomaly Detection',
      bg: 'from-purple-900/20 to-purple-950/30',
      border: 'border-purple-500/30',
      icon: Shield,
      animation: (
        <div className="relative w-32 h-24 bg-slate-900/80 rounded-lg overflow-hidden border border-purple-500/30">
          {/* Grid scanning effect */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-px bg-slate-800/50">
            {[...Array(16)].map((_, i) => (
              <div 
                key={i} 
                className={`bg-slate-700/30 ${[0,3,5,6,9,10,12,15].includes(i) ? 'animate-[flash_1.5s_ease-in-out_infinite]' : ''}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          {/* Center eye/scan */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 relative">
              <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-[spin_4s_linear_infinite]" />
              <div className="absolute inset-2 border border-purple-400 rounded-full animate-[spin_3s_linear_infinite]" style={{ animationDirection: 'reverse' }} />
              <div className="absolute inset-4 bg-purple-500/50 rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-purple-400 rounded-full animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          </div>
          {/* Status indicator */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-center">
            <div className="bg-green-600/80 text-white text-[8px] px-3 py-1 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              ALL NORMAL
            </div>
          </div>
          <style jsx>{`
            @keyframes flash {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; background-color: rgba(168,85,247,0.5); }
            }
            @keyframes scan {
              0%, 100% { top: 0; }
              50% { top: 100%; }
            }
          `}</style>
        </div>
      )
    },
    {
      title: 'Object Detection',
      bg: 'from-cyan-900/20 to-cyan-950/30',
      border: 'border-cyan-500/30',
      icon: Eye,
      animation: (
        <div className="relative w-32 h-24 bg-slate-900/80 rounded-lg overflow-hidden border border-cyan-500/30">
          {/* Crosshair overlay */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-500/30" />
            {/* Corner brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400" />
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-400" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-400" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400" />
          </div>
          {/* Moving/identified objects */}
          <div className="absolute top-4 left-4">
            <div className="relative">
              {/* Car with trail */}
              <div className="w-10 h-5 bg-gradient-to-r from-transparent via-cyan-500/50 to-cyan-500 rounded flex items-center justify-start px-1">
                <div className="w-2 h-2 bg-cyan-300 rounded-sm" />
              </div>
              {/* Motion trail */}
              <div className="absolute -left-4 top-1 w-4 h-3 flex gap-0.5">
                <span className="w-1 h-1 bg-cyan-400/50 rounded-full animate-ping" />
                <span className="w-1 h-1 bg-cyan-400/30 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
          <div className="absolute bottom-6 right-4">
            <div className="relative">
              {/* Person */}
              <div className="w-4 h-8 flex flex-col items-center">
                <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                <div className="w-3 h-5 bg-cyan-500/70 rounded-b" />
              </div>
            </div>
          </div>
          {/* Detection frame */}
          <div className="absolute top-3 left-3 w-12 h-7 border-2 border-cyan-400 rounded animate-[tracking_2s_ease-in-out_infinite]" />
          <div className="absolute bottom-5 right-3 w-6 h-10 border-2 border-cyan-400 rounded animate-[tracking_2.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />
          {/* Object labels */}
          <div className="absolute top-1 right-1 text-[6px]">
            <div className="bg-cyan-600 text-white px-1 rounded mb-0.5">CAR 98%</div>
            <div className="bg-cyan-600 text-white px-1 rounded">PERSON 95%</div>
          </div>
          <style jsx>{`
            @keyframes tracking {
              0%, 100% { opacity: 0.5; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.05); }
            }
          `}</style>
        </div>
      )
    }
  ];

  return (
    <section className="py-16 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            See AI in Action
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Watch how our AI features detect, analyze, and alert in real-time
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {demos.map((demo, idx) => {
            const Icon = demo.icon;
            return (
              <div 
                key={demo.title}
                className={`bg-gradient-to-br ${demo.bg} rounded-2xl p-1 border ${demo.border} hover:shadow-xl transition-all duration-300 hover:scale-105`}
              >
                <div className="bg-slate-900/90 rounded-xl p-4 h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-semibold text-sm">{demo.title}</span>
                  </div>
                  <div className="flex justify-center">
                    {demo.animation}
                  </div>
                </div>
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
    <section className="py-16 bg-slate-50" id="use-cases">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
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

        {/* Plans Section */}
        <div className="mt-12 flex justify-center">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 text-center w-full max-w-2xl">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium mb-4">
                <Zap className="w-3 h-3" />
                Special Launch Offer
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Starting at Just ₹199/feature
              </h3>
              <p className="text-red-100 text-sm mb-5">
                Full-featured AI video analytics. No setup fees, cancel anytime.
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap justify-center gap-4 mb-5">
                <div className="flex items-center gap-1 text-white/90 text-xs">
                  <Check className="w-3 h-3 text-green-400" />
                  AI Detection
                </div>
                <div className="flex items-center gap-1 text-white/90 text-xs">
                  <Check className="w-3 h-3 text-green-400" />
                  Cloud Storage
                </div>
                <div className="flex items-center gap-1 text-white/90 text-xs">
                  <Check className="w-3 h-3 text-green-400" />
                  Mobile App
                </div>
                <div className="flex items-center gap-1 text-white/90 text-xs">
                  <Check className="w-3 h-3 text-green-400" />
                  24/7 Support
                </div>
              </div>

              {/* Price Card */}
              <div className="bg-white rounded-lg p-5 max-w-xs mx-auto shadow-lg">
                <p className="text-xs text-slate-500 mb-1">Starting Plan</p>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-3xl font-bold text-slate-900">₹199</span>
                  <span className="text-slate-500 text-sm">/feature</span>
                </div>
                <a 
                  href="/products/vsaas/configure" 
                  className="inline-flex items-center justify-center gap-1 w-full px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                >
                  View Plans
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
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
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.05),transparent_50%)]" />
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
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
          
          <div className="grid md:grid-cols-4 gap-6 relative">
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
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
      title: 'Manufacturing', 
      subtitle: 'Worker Safety',
      description: 'VSaaS is a cloud-based security solution that enables manufacturers to monitor production, people, assets & facilities in real time with centralized control, AI analytics & remote access.',
      points: ['Worker Safety & Compliance Monitoring', 'Production Line Monitoring', 'Asset & Inventory Protection']
    },
    { 
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop',
      title: 'Hospital', 
      subtitle: 'Healthcare Security',
      description: 'VSaaS is a cloud-based video monitoring solution that helps hospitals enhance patient safety, staff security, asset protection & operational efficiency through real-time & recorded surveillance.',
      points: ['Patient Safety & Monitoring', 'Staff Safety & Workplace Security', 'Access Control & Restricted Areas']
    },
    { 
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop',
      title: 'Education', 
      subtitle: 'Campus Safety',
      description: 'VSaaS is a cloud-based video monitoring solution that helps educational institutions ensure campus safety, student security & operational transparency through real-time & recorded surveillance.',
      points: ['Campus Security & Intrusion Prevention', 'Student Safety & Behavior Monitoring', 'Classroom & Examination Monitoring']
    },
    { 
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
      title: 'Retail', 
      subtitle: 'Store Security',
      description: 'VSaaS is a cloud-based security solution that helps retailers monitor stores, staff, inventory & customer activity in real time, improving security, operational efficiency & customer experience.',
      points: ['Provides irrefutable evidence for claims', 'Reduces liability & legal costs', 'Supports transparent collaboration']
    },
  ];

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-sm font-medium mb-6">
            <Building2 className="w-4 h-4" />
            Industries
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Industry Video Surveillance-as-a-Service Use Cases
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            AI-powered VSaaS solutions tailored for different industries
          </p>
        </div>

        {/* Cards with Pictures */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {applications.map((app) => (
            <div 
              key={app.title}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={app.image} 
                  alt={app.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
              </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{app.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{app.description}</p>
                <ul className="space-y-1">
                  {app.points.map((point, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
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
      <AIFeaturesDemo />
      <AIUseCasesSection />
      <PlatformArchitectureSection />
      <IndustryApplicationsSection />
    </div>
  );
}
