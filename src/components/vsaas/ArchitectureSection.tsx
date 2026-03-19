"use client";

import { 
  Camera, 
  Cloud, 
  Cpu, 
  BarChart3, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Camera",
    description: "Existing CCTV or IP cameras capture video footage",
    color: "bg-blue-500",
  },
  {
    icon: Cpu,
    title: "Edge Processing",
    description: "AI analysis happens locally on edge devices",
    color: "bg-purple-500",
  },
  {
    icon: Cloud,
    title: "Cloud",
    description: "Data synced to cloud for storage & advanced analytics",
    color: "bg-sky-500",
  },
  {
    icon: BarChart3,
    title: "Dashboard",
    description: "Real-time insights, alerts & actionable intelligence",
    color: "bg-green-500",
  },
];

const features = [
  "Low bandwidth requirements with edge processing",
  "99.9% uptime with cloud redundancy",
  "End-to-end encryption for data security",
  "Scalable from 10 to 10,000+ cameras",
  "Real-time alerts within 100ms",
  "30-day cloud storage included",
];

export function ArchitectureSection() {
  return (
    <section id="architecture" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Platform Architecture
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Our intelligent architecture processes video at the edge while 
            leveraging cloud power for advanced analytics and storage.
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="mb-20">
          {/* Mobile: Vertical Stack */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 bg-slate-900/50 border border-slate-800 rounded-xl p-6"
              >
                <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-600 ml-auto rotate-90" />
                )}
              </div>
            ))}
          </div>

          {/* Desktop: Horizontal Flow */}
          <div className="hidden lg:flex items-center justify-between gap-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 min-w-[220px] text-center hover:border-red-500/30 transition-colors group">
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="mx-4">
                    <ArrowRight className="w-8 h-8 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 text-slate-300 bg-slate-900/30 border border-slate-800 rounded-xl p-4"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
