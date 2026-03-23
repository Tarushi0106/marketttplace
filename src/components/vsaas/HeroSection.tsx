"use client";

import Link from "next/link";
import { ArrowRight, Play, Eye, Shield, Cpu, Activity, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.3),transparent_50%)]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content - Text */}
          <div className="text-center lg:text-left">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Transform Your Security with VSaaS
            </h1>
            
            {/* Subtext */}
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Experience next-generation AI video surveillance that sees, thinks, and acts. From real-time threat detection to crowd analytics — secure your premises with intelligent monitoring that works 24/7.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button 
                asChild 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
              >
                <Link href="#use-cases">
                  <Play className="w-5 h-5 mr-2" />
                  Explore VSaaS
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg" 
                className="bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
              >
                <Link href="/products">
                  View Solutions
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {[
                { value: "99.9%", label: "Uptime" },
                { value: "AI-Powered", label: "Analytics" },
                { value: "24/7", label: "Support" },
                { value: "10K+", label: "Cameras" },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - AI Surveillance Visual */}
          <div className="hidden lg:block relative">
            <div className="relative">
              {/* Main Image Container with Glow */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-red-500/20">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-transparent to-red-900/30 z-10" />
                
                {/* Main CCTV/Monitoring Image - User uploaded (second image) */}
                <img 
                  src="/uploads/vsaas pic1.jpeg"
                  alt="AI Video Surveillance Monitoring System"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                
                {/* Scan Line Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
                
                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-red-500/60 rounded-tl" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-red-500/60 rounded-tr" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-red-500/60 rounded-bl" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-red-500/60 rounded-br" />
              </div>

              {/* Floating UI Elements */}
              {/* AI Detection Box 1 */}
              <div className="absolute top-1/4 -left-4 bg-slate-900/90 backdrop-blur-sm border border-red-500/40 rounded-lg p-3 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Face Detected</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Confidence: 98.5%</div>
              </div>

              {/* AI Detection Box 2 */}
              <div className="absolute top-1/2 -right-4 bg-slate-900/90 backdrop-blur-sm border border-blue-500/40 rounded-lg p-3 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">Object Tracking</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">12 objects in frame</div>
              </div>

              {/* Stats Overlay */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm border border-red-500/30 rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-red-400" />
                    <span className="text-slate-300">24 Cameras</span>
                  </div>
                  <div className="w-px h-4 bg-slate-600" />
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    <span className="text-slate-300">All Secure</span>
                  </div>
                  <div className="w-px h-4 bg-slate-600" />
                  <div className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-blue-400" />
                    <span className="text-slate-300">AI Active</span>
                  </div>
                </div>
              </div>

              {/* Glow Effect Behind */}
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 via-red-500/10 to-blue-600/20 rounded-3xl blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-slate-400 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
