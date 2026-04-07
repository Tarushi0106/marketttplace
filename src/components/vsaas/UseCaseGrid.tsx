"use client";

import { 
  Shield, 
  Settings, 
  AlertTriangle, 
  Search,
  Camera,
  Clock,
  Car,
  Package,
  Users,
  Footprints
} from "lucide-react";

const useCases = [
  {
    category: "Security",
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    examples: [
      { icon: Camera, text: "Perimeter Intrusion Detection" },
      { icon: Shield, text: "Unauthorized Access Alerts" },
      { icon: Search, text: "Suspicious Activity Detection" },
    ],
  },
  {
    category: "Operations",
    icon: Settings,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    examples: [
      { icon: Users, text: "Foot Traffic Analysis" },
      { icon: Clock, text: "Queue Management" },
      { icon: Package, text: "Inventory Monitoring" },
    ],
  },
  {
    category: "Safety",
    icon: AlertTriangle,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    examples: [
      { icon: Users, text: "Fall Detection" },
      { icon: AlertTriangle, text: "Fire/Smoke Detection" },
      { icon: Search, text: " PPE Compliance" },
    ],
  },
  {
    category: "Investigation",
    icon: Search,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    examples: [
      { icon: Search, text: "Object Tracking" },
      { icon: Car, text: "Vehicle Search" },
      { icon: Clock, text: "Timeline Reconstruction" },
    ],
  },
];

export function UseCaseGrid() {
  return (
    <section id="use-cases" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Comprehensive Use Cases
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            From security to operations, our AI video analytics platform addresses 
            multiple business needs across industries.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div 
              key={index}
              className={`bg-slate-800/50 border ${useCase.borderColor} rounded-2xl p-8 hover:border-opacity-100 transition-all duration-300`}
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 ${useCase.bgColor} rounded-xl flex items-center justify-center`}>
                  <useCase.icon className={`w-6 h-6 ${useCase.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {useCase.category}
                </h3>
              </div>

              {/* Examples List */}
              <ul className="space-y-4">
                {useCase.examples.map((example, exampleIndex) => (
                  <li key={exampleIndex} className="flex items-center gap-3 text-slate-300">
                    <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <example.icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <span>{example.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
