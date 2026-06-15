"use client";

import { 
  Factory, 
  ShoppingBag, 
  Truck, 
  Building2,
  CheckCircle2
} from "lucide-react";

const industries = [
  {
    icon: Factory,
    title: "Manufacturing",
    description: "Smart factory solutions for enhanced safety and efficiency",
    benefits: [
      "Workplace safety monitoring",
      "Equipment theft prevention",
      "Production line analytics",
      "Quality control automation",
    ],
    color: "bg-orange-500",
  },
  {
    icon: ShoppingBag,
    title: "Retail",
    description: "Transform retail spaces with intelligent video analytics",
    benefits: [
      "Customer behavior analysis",
      "Shoplifting prevention",
      "Heat mapping for layout optimization",
      "Queue management alerts",
    ],
    color: "bg-[#4A9FD5]",
  },
  {
    icon: Truck,
    title: "Logistics",
    description: "End-to-end visibility for supply chain operations",
    benefits: [
      "Warehouse security",
      "Fleet monitoring",
      "Loading dock efficiency",
      "Cargo tracking & detection",
    ],
    color: "bg-blue-500",
  },
  {
    icon: Building2,
    title: "Commercial Real Estate",
    description: "Secure and optimize commercial properties",
    benefits: [
      "Access control integration",
      "Parking management",
      "Tenant safety compliance",
      "Energy optimization",
    ],
    color: "bg-green-500",
  },
];

export function IndustrySection() {
  return (
    <section id="industries" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Industry Applications
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Tailored video analytics solutions for diverse industries, 
            delivering measurable business outcomes.
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {industries.map((industry, index) => (
            <div 
              key={index}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:border-[#1E2260]/30 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-14 h-14 ${industry.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <industry.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {industry.title}
                  </h3>
                  <p className="text-slate-400">
                    {industry.description}
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {industry.benefits.map((benefit, benefitIndex) => (
                  <div 
                    key={benefitIndex}
                    className="flex items-center gap-2 text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
