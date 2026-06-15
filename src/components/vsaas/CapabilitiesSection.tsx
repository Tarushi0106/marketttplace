"use client";

import { 
  Brain, 
  Users, 
  Eye, 
  AlertTriangle, 
  Activity, 
  Zap 
} from "lucide-react";

const capabilities = [
  {
    icon: Brain,
    title: "Anomaly Detection",
    description: "AI-powered detection of unusual behavior, movements, and events in real-time. Automatically alert security personnel when anomalies are detected.",
    color: "bg-[#1E2260]",
  },
  {
    icon: Users,
    title: "Crowd Monitoring",
    description: "Track crowd density, flow patterns, and detect overcrowding situations. Perfect for public events, retail spaces, and transportation hubs.",
    color: "bg-blue-500",
  },
  {
    icon: Eye,
    title: "Object Detection",
    description: "Identify and track specific objects including vehicles, bags, weapons, and custom objects. Enable search across thousands of hours of footage.",
    color: "bg-green-500",
  },
  {
    icon: AlertTriangle,
    title: "Intrusion Detection",
    description: "Set virtual perimeters and receive instant alerts when unauthorized access is detected. Perfect for perimeter security and restricted areas.",
    color: "bg-orange-500",
  },
  {
    icon: Activity,
    title: "Activity Recognition",
    description: "Understand complex activities like fighting, falls, loitering, and abandoned objects. Get meaningful alerts instead of endless video feeds.",
    color: "bg-purple-500",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Edge computing capabilities for ultra-low latency processing. Analyze video streams locally with cloud backup and synchronization.",
    color: "bg-yellow-500",
  },
];

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Powerful AI Capabilities
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Advanced computer vision and deep learning algorithms that transform 
            your existing camera infrastructure into an intelligent surveillance network.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((capability, index) => (
            <div 
              key={index}
              className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-[#1E2260]/50 transition-all duration-300 hover:transform hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`w-14 h-14 ${capability.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <capability.icon className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3">
                {capability.title}
              </h3>

              {/* Description */}
              <p className="text-slate-400 leading-relaxed">
                {capability.description}
              </p>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1E2260]/0 via-[#1E2260]/5 to-[#1E2260]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
