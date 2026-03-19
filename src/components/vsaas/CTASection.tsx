"use client";

import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "No credit card required",
  "14-day free trial",
  "Full access to all features",
  "Dedicated support team",
];

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Start your AI-powered surveillance today
        </h2>

        {/* Subtext */}
        <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
          Transform your existing cameras into intelligent AI systems. 
          Get real-time insights and actionable intelligence with our 
          easy-to-deploy VSaaS platform.
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-slate-300 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-full"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            asChild 
            size="lg" 
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-7 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
          >
            <Link href="/products/vsaas/configure?variant=cloud">
              Configure Solution
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>

          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-10 py-7 text-lg font-semibold rounded-full transition-all duration-300"
          >
            <Link href="/contact">
              <Calendar className="w-5 h-5 mr-2" />
              Request Demo
            </Link>
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm mb-4">Trusted by leading organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {["ISO 27001", "SOC 2", "GDPR Compliant", "99.9% SLA"].map((badge, index) => (
              <span key={index} className="text-slate-400 font-medium">{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
