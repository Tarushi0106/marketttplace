'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Eye, Brain, Bell, Users, Car, Zap, Clock, Award, Camera, Check, Menu, X } from 'lucide-react';

// Color theme
// Primary: #0B1220 (dark navy)
// Accent: #E11D48 (red)
// Background: white/gray-50

const features = [
  { icon: Shield, title: 'Anomaly Detection', desc: 'AI identifies unusual patterns in real-time' },
  { icon: Users, title: 'Crowd Monitoring', desc: 'Track density and flow patterns' },
  { icon: Eye, title: 'Object Detection', desc: 'Recognize vehicles and objects' },
  { icon: Bell, title: 'Real-time Alerts', desc: 'Instant notifications via SMS or email' },
  { icon: Brain, title: 'Face Recognition', desc: 'Identify faces with high accuracy' },
  { icon: Car, title: 'Vehicle Tracking', desc: 'ANPR for license plate recognition' },
];

const stats = [
  { value: '10,000+', label: 'Cameras' },
  { value: '99.9%', label: 'Uptime' },
  { value: '<1s', label: 'Alert Latency' },
  { value: '24/7', label: 'Monitoring' },
];

const whyVsSaas = [
  { icon: Zap, title: 'Fast Deployment', desc: 'Get started in minutes, not weeks' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption and compliance' },
  { icon: Brain, title: 'High Accuracy AI', desc: '99.8% detection accuracy' },
];

const useCaseTabs = [
  { 
    name: 'Retail', 
    points: ['Footfall analytics', 'Theft detection', 'Queue management', 'Heat mapping'] 
  },
  { 
    name: 'Manufacturing', 
    points: ['Worker safety', 'PPE compliance', 'Area monitoring', 'Intrusion detection'] 
  },
  { 
    name: 'Logistics', 
    points: ['Vehicle tracking', 'Yard monitoring', 'ANPR', 'Perimeter security'] 
  },
];

function HeroSection() {
  return (
    <section className="pt-32 pb-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1220] leading-tight mb-4">
              AI-Powered Video Surveillance Platform
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-lg">
              Turn existing CCTV into real-time intelligence with AI-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/products/vsaas" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E11D48] text-white font-semibold rounded-lg hover:bg-[#BE123C] transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="#" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0B1220] text-white font-semibold rounded-lg hover:bg-[#1E293B] transition-colors"
              >
                Book Demo
              </Link>
            </div>
          </div>

          {/* Right - Dashboard Mockup */}
          <div className="relative">
            <div className="bg-[#0B1220] rounded-xl p-4 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="px-3 py-1 bg-green-500/20 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-400 text-xs">Online</span>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: 'Cameras', value: '156' },
                  { label: 'Alerts', value: '23' },
                  { label: 'Events', value: '1,247' },
                  { label: 'Uptime', value: '99.9%' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-800/50 rounded-lg p-2">
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
              {/* Chart */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 bg-gray-800/30 rounded-lg p-2">
                  <div className="text-white text-xs font-medium mb-2">Activity</div>
                  <div className="flex items-end gap-1 h-12">
                    {[65, 45, 78, 52, 90, 68, 85, 72, 95, 58, 82, 70].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-[#E11D48] to-[#BE123C] rounded-t" 
                        style={{ height: `${h}%`, opacity: 0.5 + (i % 3) * 0.15 }} 
                      />
                    ))}
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-2">
                  <div className="text-white text-xs font-medium mb-2">Alerts</div>
                  <div className="space-y-1">
                    {['Intrusion', 'Crowd', 'Vehicle'].map((alert, i) => (
                      <div key={i} className="flex items-center gap-1 p-1 bg-gray-800/50 rounded">
                        <Shield className="w-3 h-3 text-red-400" />
                        <span className="text-white text-[10px]">{alert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="py-8 bg-[#0B1220]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#0B1220] mb-2">AI Capabilities</h2>
          <p className="text-gray-600 text-sm">Advanced video analytics powered by machine learning</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.title} 
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-[#E11D48]/30 hover:shadow-md transition-all"
              >
                <Icon className="w-5 h-5 text-[#E11D48] mb-3" />
                <h3 className="font-semibold text-[#0B1220] mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#0B1220] mb-2">Use Cases</h2>
          <p className="text-gray-600 text-sm">Solutions tailored for your industry</p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {useCaseTabs.map((tab, i) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === i 
                  ? 'bg-[#0B1220] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCaseTabs[activeTab].points.map((point) => (
              <div key={point} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyVsSaasSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#0B1220] mb-2">Why VSaaS</h2>
          <p className="text-gray-600 text-sm">Enterprise-grade video surveillance made simple</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {whyVsSaas.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.title} 
                className="bg-white rounded-lg border border-gray-200 p-5"
              >
                <Icon className="w-6 h-6 text-[#E11D48] mb-3" />
                <h3 className="font-semibold text-[#0B1220] mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl font-bold text-[#0B1220] mb-3">
          Start monitoring smarter today
        </h2>
        <p className="text-gray-600 mb-6">Join thousands of enterprises already using VSaaS</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/products/vsaas" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E11D48] text-white font-semibold rounded-lg hover:bg-[#BE123C] transition-colors"
          >
            Start Free Trial
          </Link>
          <Link 
            href="#" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Talk to Sales
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HeroPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <StatsStrip />
      <FeaturesSection />
      <UseCasesSection />
      <WhyVsSaasSection />
      <CTASection />
    </div>
  );
}
