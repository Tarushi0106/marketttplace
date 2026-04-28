'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Eye, Brain, Bell, Users, Activity, Zap, Check, Building2, Target, Cpu, Camera, Monitor, AlertTriangle, Search, TrendingUp } from 'lucide-react';

// ==================== HERO SECTION ====================
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* Soft colour orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-red-100 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-blue-100 rounded-full blur-[100px] pointer-events-none" />

      <style jsx>{`
        .float-card { animation: floatY 6s ease-in-out infinite; }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .shimmer-text {
          background: linear-gradient(90deg,#dc2626,#ef4444,#dc2626,#ef4444,#dc2626);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:300% center} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-6 py-20 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left ── */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 text-sm font-semibold mb-8">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              We're Here. Always On. Always Watching.
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-black text-slate-900 leading-[1.02] tracking-tight mb-6">
              Tell Us What{' '}
              <span className="shimmer-text">You Need.</span>
              <br />
              We'll{' '}
              <span className="shimmer-text">Make It Happen.</span>
            </h1>

            <p className="text-lg text-slate-500 mb-8 max-w-xl leading-relaxed">
              Your security challenges are unique — and so are our solutions.
              Share what you're trying to protect, detect, or optimize,
              and we'll configure the{' '}
              <span className="text-slate-900 font-semibold">exact AI that solves it</span>.
              No guesswork. Just results.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {['Intrusion Detection', 'Facial Recognition', 'ANPR', 'PPE Compliance', 'Queue Analytics'].map((f) => (
                <span key={f} className="px-3 py-1 text-xs font-medium bg-slate-100 border border-slate-200 text-slate-600 rounded-full">
                  {f}
                </span>
              ))}
              <span className="px-3 py-1 text-xs font-medium bg-red-50 border border-red-200 text-red-600 rounded-full">
                +15 more →
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products/vsaas?tab=solutions"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all hover:shadow-xl hover:shadow-red-600/25 hover:scale-105 text-base"
              >
                Explore Solutions
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="/products/vsaas/configure"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-800 font-bold rounded-xl hover:bg-slate-50 transition-all border border-slate-200 hover:border-slate-300 text-base shadow-sm"
              >
                <Cpu className="w-5 h-5 text-red-500" />
                Configure System
              </a>
            </div>

            {/* Inline stats */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center gap-8 flex-wrap">
              {[
                { v: '20+',    l: 'AI Models' },
                { v: '<100ms', l: 'Inference' },
                { v: '99.7%',  l: 'Accuracy' },
                { v: '24/7',   l: 'Monitoring' },
              ].map((s, i, arr) => (
                <div key={s.l} className="flex items-center gap-8">
                  <div>
                    <div className="text-2xl font-black text-slate-900 tabular-nums">
                      {s.v.replace(/[+%ms<]/g, '')}
                      <span className="text-red-600">{s.v.match(/[+%ms<]/g)?.join('') ?? ''}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.l}</div>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-8 bg-slate-200" />}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Camera mockup ── */}
          <div className="hidden lg:flex justify-center">
            <div className="relative float-card">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/80">
                {/* Detection overlays */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <div className="absolute top-3 left-3 w-12 h-12 border-l-2 border-t-2 border-red-500/60" />
                  <div className="absolute top-3 right-3 w-12 h-12 border-r-2 border-t-2 border-red-500/60" />
                  <div className="absolute bottom-3 left-3 w-12 h-12 border-l-2 border-b-2 border-red-500/60" />
                  <div className="absolute bottom-3 right-3 w-12 h-12 border-r-2 border-b-2 border-red-500/60" />
                  <div className="absolute top-1/3 left-1/4 w-16 h-20 border-2 border-cyan-500/80 rounded-sm">
                    <div className="absolute -top-5 left-0 bg-cyan-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">PERSON 97%</div>
                  </div>
                  <div className="absolute top-1/4 right-[20%] w-24 h-10 border-2 border-yellow-400/80 rounded-sm">
                    <div className="absolute -top-5 left-0 bg-yellow-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">VEHICLE 99%</div>
                  </div>
                </div>
                <img src="/uploads/cam2.jpeg" alt="VSaaS AI Platform" className="w-full h-[420px] object-contain bg-slate-900" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
              </div>

              {/* Floating badges — white glass cards */}
              <div className="absolute -left-12 top-1/4 bg-white border border-green-200 rounded-xl px-4 py-3 shadow-xl shadow-green-100/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 font-semibold uppercase tracking-wide">AI Active</span>
                </div>
                <div className="text-slate-900 text-sm font-bold">Face Detected</div>
                <div className="text-slate-400 text-xs mt-0.5">Confidence: 98.5%</div>
              </div>

              <div className="absolute -right-12 top-1/2 bg-white border border-blue-200 rounded-xl px-4 py-3 shadow-xl shadow-blue-100/50">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Tracking</span>
                </div>
                <div className="text-slate-900 text-sm font-bold">12 Objects</div>
                <div className="text-slate-400 text-xs mt-0.5">In current frame</div>
              </div>

              <div className="absolute -left-8 bottom-10 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-xl">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3 h-3 text-red-500" />
                    <span className="text-slate-700 font-medium">24 Cameras</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-slate-700 font-medium">All Live</span>
                  </div>
                </div>
              </div>

              <div className="absolute -inset-6 bg-gradient-to-br from-red-50 via-transparent to-blue-50 rounded-3xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== FEATURE TICKER ====================
function FeatureTicker() {
  const features = [
    'Intrusion Detection', 'Zone Monitoring', 'Camera Sabotage', 'Activity Detection',
    'Trespassing Alert', 'Perimeter Fence Jumping', 'Double Line Crossing', 'Loitering Detection',
    'Overcrowding Alert', 'People Counting', 'Missing Staff', 'Occupancy Statistics',
    'Queue Management', 'Heatmap Analytics', 'PPE Detection', 'Smoke & Fire Detection',
    'Person of Interest Search', 'Vehicle Tracking', 'ANPR', 'Facial Recognition',
  ];
  return (
    <div className="bg-[#DC2626] py-3 overflow-hidden select-none">
      <div className="flex gap-12 whitespace-nowrap" style={{ animation: 'ticker 35s linear infinite' }}>
        {[...features, ...features].map((f, i) => (
          <span key={i} className="text-white text-sm font-semibold flex items-center gap-3 flex-shrink-0">
            <span className="w-1.5 h-1.5 bg-red-200/70 rounded-full" />
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

// ==================== STATS BAR ====================
function StatsBar() {
  const stats = [
    { value: '20+',    label: 'AI Detection Models',    icon: Brain,    iconBg: 'bg-red-100',    iconColor: 'text-red-600'    },
    { value: '<100ms', label: 'Inference Latency',      icon: Zap,      iconBg: 'bg-amber-100',  iconColor: 'text-amber-600'  },
    { value: '99.7%',  label: 'Detection Accuracy',     icon: Target,   iconBg: 'bg-green-100',  iconColor: 'text-green-600'  },
    { value: '50k+',   label: 'Cameras Monitored',      icon: Camera,   iconBg: 'bg-blue-100',   iconColor: 'text-blue-600'   },
    { value: '24/7',   label: 'Real-time Intelligence', icon: Activity, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  ];
  return (
    <section className="py-6 bg-white border-y border-slate-100 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`flex flex-col items-center py-5 px-4 text-center ${i < 4 ? 'md:border-r border-slate-100' : ''}`}>
                <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <div className="text-3xl font-black text-slate-900 tabular-nums">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ==================== AI CAPABILITIES SECTION ====================
function AICapabilitiesSection() {
  const capabilities = [
    { icon: Bell,    title: 'Real-time Alerts',   desc: 'Sub-second notifications via SMS, email and push when anomalies occur. Zero delay between detection and response.', metric: '<1s',  metricLabel: 'response time', accent: 'from-red-500 to-rose-600',     light: 'bg-red-50 border-red-100',    metricColor: 'text-red-600'    },
    { icon: Users,   title: 'Crowd Intelligence', desc: 'Track crowd density, movement flows, and occupancy patterns with AI models trained on millions of real-world scenarios.', metric: '99%',  metricLabel: 'accuracy',      accent: 'from-blue-500 to-blue-600',    light: 'bg-blue-50 border-blue-100',  metricColor: 'text-blue-600'   },
    { icon: Shield,  title: 'Anomaly Detection',  desc: 'Deep neural networks identify unusual behavior, suspicious patterns, and policy violations the instant they happen.', metric: '24/7', metricLabel: 'always on',     accent: 'from-purple-500 to-purple-600',light: 'bg-purple-50 border-purple-100',metricColor: 'text-purple-600' },
    { icon: Eye,     title: 'Object Recognition', desc: 'Classify and track 50+ object types — vehicles, people, weapons — with enterprise-grade precision and confidence scores.', metric: '50+',  metricLabel: 'object types',  accent: 'from-cyan-500 to-cyan-600',    light: 'bg-cyan-50 border-cyan-100',  metricColor: 'text-cyan-600'   },
    { icon: Cpu,     title: 'Edge & Cloud AI',    desc: 'Deploy AI at the edge for sub-100ms latency or in the cloud for infinite scale. Hybrid architectures fully supported.', metric: '100%', metricLabel: 'uptime SLA',    accent: 'from-emerald-500 to-emerald-600',light: 'bg-emerald-50 border-emerald-100',metricColor: 'text-emerald-600'},
  ];

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden" id="capabilities">
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-sm font-semibold mb-6">
            <Activity className="w-4 h-4" />
            Core AI Capabilities
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-5">
            AI That{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
              Sees, Thinks & Acts
            </span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Transform legacy surveillance into an intelligent security layer with real-time threat detection, behavioral analytics, and predictive intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className={`group relative bg-white rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${cap.light}`}
              >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-b-2xl" />

                <div className={`w-12 h-12 bg-gradient-to-br ${cap.accent} rounded-xl flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{cap.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">{cap.desc}</p>

                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${cap.metricColor}`}>{cap.metric}</span>
                  <span className="text-xs text-slate-400">{cap.metricLabel}</span>
                </div>
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
      label: 'THREAT RESPONSE',
      cardBg: 'bg-red-50',
      cardBorder: 'border-red-200',
      accent: 'text-red-500',
      icon: Bell,
      iconBg: 'from-red-500 to-rose-600',
      animation: (
        <div className="relative w-full h-28 bg-slate-900 rounded-xl overflow-hidden border border-red-500/20">
          <div className="absolute top-0 left-0 right-0 h-7 bg-red-600 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-200 rounded-full animate-ping" />
            <span className="text-white text-[9px] font-black tracking-widest">⚠ SECURITY ALERT</span>
          </div>
          <div className="absolute top-10 left-1/2 -translate-x-1/2">
            <div className="w-8 h-8 relative">
              <div className="w-8 h-8 bg-red-500 rounded-full absolute top-0" style={{ animation: 'bellRing 0.5s ease-in-out infinite', transformOrigin: 'top center' }} />
              <div className="w-1 h-3 bg-red-500 absolute top-7 left-1/2 -translate-x-1/2" />
              <div className="w-3 h-3 bg-red-500 rounded-full absolute top-9 left-1/2 -translate-x-1/2 animate-ping" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 right-2 h-8 overflow-hidden">
            <div className="flex flex-col gap-1" style={{ animation: 'scrollUp 3s linear infinite' }}>
              {['Motion detected', 'Face recognized', 'Zone breach', 'Intrusion alert'].map((t) => (
                <div key={t} className="bg-red-900/60 text-red-200 text-[7px] px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />{t}
                </div>
              ))}
            </div>
          </div>
          <style jsx>{`
            @keyframes bellRing { 0%,100%{transform:rotate(0)} 25%{transform:rotate(15deg)} 75%{transform:rotate(-15deg)} }
            @keyframes scrollUp { 0%{transform:translateY(100%)} 100%{transform:translateY(-200%)} }
          `}</style>
        </div>
      ),
    },
    {
      title: 'Crowd Intelligence',
      label: 'BEHAVIORAL AI',
      cardBg: 'bg-blue-50',
      cardBorder: 'border-blue-200',
      accent: 'text-blue-500',
      icon: Users,
      iconBg: 'from-blue-500 to-blue-600',
      animation: (
        <div className="relative w-full h-28 bg-slate-900 rounded-xl overflow-hidden border border-blue-500/20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute bottom-0 w-full h-10 bg-gradient-to-t from-blue-600/30 to-transparent">
              <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none" style={{ animation: 'wave 2s ease-in-out infinite' }}>
                <path d="M0 20 Q25 5 50 20 T100 20 L100 20 L0 20" fill="rgba(59,130,246,0.3)" />
              </svg>
            </div>
          </div>
          <div className="absolute top-3 left-3 bg-blue-600/80 rounded px-2 py-1">
            <span className="text-white font-black text-lg">24</span>
            <span className="text-blue-200 text-[8px] ml-1">people</span>
          </div>
          <div className="absolute top-3 right-3 flex gap-0.5 items-end h-8">
            {[4, 6, 5, 8, 6, 7, 5].map((h, i) => (
              <div key={i} className="w-2 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-around px-4">
            {[0, 0.2, 0.4, 0.6].map((d) => (
              <div key={d} className="flex flex-col items-center gap-0.5">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                <div className="w-1 h-3 bg-blue-500/70 rounded-b" />
              </div>
            ))}
          </div>
          <style jsx>{`
            @keyframes wave { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-15px)} }
          `}</style>
        </div>
      ),
    },
    {
      title: 'Anomaly Detection',
      label: 'NEURAL SCAN',
      cardBg: 'bg-purple-50',
      cardBorder: 'border-purple-200',
      accent: 'text-purple-500',
      icon: Shield,
      iconBg: 'from-purple-500 to-purple-600',
      animation: (
        <div className="relative w-full h-28 bg-slate-900 rounded-xl overflow-hidden border border-purple-500/20">
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-px bg-slate-800/40 p-1">
            {[...Array(16)].map((_, i) => (
              <div key={i} className={`rounded-sm ${[0,3,5,6,9,10,12,15].includes(i) ? 'animate-pulse' : 'bg-slate-800/30'}`}
                style={{ animationDelay: `${i * 0.1}s`, backgroundColor: [0,3,5,6,9,10,12,15].includes(i) ? 'rgba(168,85,247,0.3)' : undefined }} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 relative">
              <div className="absolute inset-0 border-2 border-purple-500 rounded-full" style={{ animation: 'spin 4s linear infinite' }} />
              <div className="absolute inset-2 border border-purple-400 rounded-full" style={{ animation: 'spin 3s linear infinite reverse' }} />
              <div className="absolute inset-4 bg-purple-500/40 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex justify-center">
            <div className="bg-green-600/80 text-white text-[8px] px-3 py-1 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              ALL SYSTEMS NOMINAL
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Object Detection',
      label: 'COMPUTER VISION',
      cardBg: 'bg-cyan-50',
      cardBorder: 'border-cyan-200',
      accent: 'text-cyan-500',
      icon: Eye,
      iconBg: 'from-cyan-500 to-cyan-600',
      animation: (
        <div className="relative w-full h-28 bg-slate-900 rounded-xl overflow-hidden border border-cyan-500/20">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/20" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-500/20" />
            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400/80" />
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-400/80" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-400/80" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400/80" />
          </div>
          <div className="absolute top-3 left-5 w-14 h-7 border-2 border-cyan-400 rounded animate-pulse" />
          <div className="absolute bottom-6 right-5 w-6 h-10 border-2 border-cyan-400 rounded animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5">
            <div className="bg-cyan-600 text-white text-[7px] px-1.5 py-0.5 rounded font-bold">CAR 98%</div>
            <div className="bg-cyan-600 text-white text-[7px] px-1.5 py-0.5 rounded font-bold">PERSON 95%</div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-semibold mb-6">
            <Monitor className="w-4 h-4 text-red-500" />
            Live AI Demonstrations
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            See the AI{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
              Think in Real-Time
            </span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Visual simulations of how each AI module processes live camera feeds and responds to events.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {demos.map((demo) => {
            const Icon = demo.icon;
            return (
              <div
                key={demo.title}
                className={`${demo.cardBg} border ${demo.cardBorder} rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 bg-gradient-to-br ${demo.iconBg} rounded-lg flex items-center justify-center shadow-sm`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-900 font-bold text-sm">{demo.title}</span>
                  </div>
                  <span className={`text-[9px] font-black tracking-widest ${demo.accent}`}>{demo.label}</span>
                </div>
                {demo.animation}
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
    { title: 'Security',     desc: 'Intrusion detection, perimeter monitoring, facial recognition, and real-time threat response.',      icon: Shield,       gradient: 'from-red-500 to-rose-600',       bg: 'bg-red-50',     border: 'border-red-100',     features: ['Intrusion Detection', 'Face Recognition', 'Perimeter Monitoring'] },
    { title: 'Operations',   desc: 'People counting, queue management, heatmap analytics — turn camera data into business intelligence.',icon: TrendingUp,   gradient: 'from-blue-500 to-blue-600',      bg: 'bg-blue-50',    border: 'border-blue-100',    features: ['People Counting', 'Queue Management', 'Heatmap Analytics'] },
    { title: 'Safety',       desc: 'PPE compliance, smoke & fire detection, and hazard zone monitoring for zero-accident workplaces.',  icon: AlertTriangle, gradient: 'from-orange-500 to-amber-600',   bg: 'bg-orange-50',  border: 'border-orange-100',  features: ['PPE Detection', 'Smoke & Fire Alert', 'Hazard Zone Monitor'] },
    { title: 'Investigation',desc: 'ANPR, appearance-based search, vehicle tracking — forensic-grade tools built into your live feed.', icon: Search,       gradient: 'from-purple-500 to-violet-600',  bg: 'bg-purple-50',  border: 'border-purple-100',  features: ['ANPR', 'Appearance Search', 'Vehicle Tracking'] },
  ];

  return (
    <section className="py-20 bg-slate-50 relative" id="use-cases">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-semibold mb-6 shadow-sm">
            <Target className="w-4 h-4 text-red-500" />
            Industry Applications
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-5">
            One Platform.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
              Every Use Case.
            </span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Whether you need to secure a perimeter, manage a crowd, enforce safety, or investigate incidents — VSaaS has an AI model for it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div key={uc.title} className={`group bg-white rounded-2xl p-7 border ${uc.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}>
                <div className={`w-14 h-14 bg-gradient-to-br ${uc.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{uc.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">{uc.desc}</p>
                <ul className="space-y-2">
                  {uc.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA banner */}
        <div className="mt-14">
          <div className="relative bg-red-600 rounded-2xl p-10 overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-rose-500/30 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold mb-4">
                  <Zap className="w-3 h-3" />
                  Special Launch Offer
                </div>
                <h3 className="text-3xl font-black text-white mb-2">
                  Starting at Just ₹199/feature
                </h3>
                <p className="text-red-100 max-w-md">
                  Full-featured AI video analytics. No setup fees, no hardware replacement. Cancel anytime.
                </p>
                <div className="flex flex-wrap gap-5 mt-5">
                  {['AI Detection', 'Cloud Storage', 'Mobile App', '24/7 Support'].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-white/90 text-sm">
                      <Check className="w-4 h-4 text-green-300 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 bg-white rounded-2xl p-6 text-center min-w-[200px] shadow-2xl">
                <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Starting Plan</p>
                <div className="flex items-baseline justify-center gap-0.5 mb-4">
                  <span className="text-4xl font-black text-slate-900">₹199</span>
                  <span className="text-slate-500 text-sm">/feature</span>
                </div>
                <a href="/products/vsaas/configure" className="inline-flex items-center justify-center gap-1.5 w-full px-5 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors">
                  Configure Now
                  <ArrowRight className="w-4 h-4" />
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
    { icon: Camera,  num: '01', label: 'Capture',  desc: 'Existing CCTV cameras — no hardware replacement needed.',    color: 'from-red-500 to-rose-600',      numColor: 'text-red-100'    },
    { icon: Cpu,     num: '02', label: 'Process',  desc: 'Edge or cloud processing with GPU-accelerated inference.',    color: 'from-orange-500 to-amber-600',  numColor: 'text-orange-100' },
    { icon: Brain,   num: '03', label: 'Analyze',  desc: 'Deep learning models extract intelligence from every frame.', color: 'from-blue-500 to-blue-600',     numColor: 'text-blue-100'   },
    { icon: Monitor, num: '04', label: 'Act',       desc: 'Alerts, dashboards, and automated responses in real time.',  color: 'from-purple-500 to-violet-600', numColor: 'text-purple-100' },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" />
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-5">
            From Camera to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-600">
              Intelligence
            </span>
            {' '}in 4 Steps
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            A seamless pipeline from raw video to actionable AI insights, running in under 100 milliseconds.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-red-200 via-blue-200 to-purple-200" />
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="relative group text-center">
                  <div className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[80px] font-black ${step.numColor} select-none leading-none z-0`}>
                    {step.num}
                  </div>
                  <div className={`relative z-10 w-20 h-20 mx-auto bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-5 shadow-xl group-hover:scale-110 transition-transform`}>
                    <Icon className="w-9 h-9 text-white" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-xl font-black text-slate-900 mb-2">{step.label}</div>
                    <div className="text-sm text-slate-500 leading-relaxed max-w-[180px] mx-auto">{step.desc}</div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-5 z-20">
                      <ArrowRight className="w-6 h-6 text-slate-300" />
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
    { image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop', title: 'Manufacturing', tag: 'Worker Safety',    tagColor: 'bg-orange-500', description: 'Monitor production lines, enforce PPE compliance, and protect assets — all from a single cloud dashboard.',       points: ['Worker Safety & PPE Compliance', 'Production Line Monitoring', 'Asset & Inventory Protection'] },
    { image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop', title: 'Healthcare',    tag: 'Patient Safety',   tagColor: 'bg-blue-500',   description: 'Enhance patient safety, secure restricted zones, and monitor staff coverage with AI-powered analytics.',         points: ['Patient Safety Monitoring', 'Staff Security & Coverage', 'Access Control & Restricted Areas'] },
    { image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop', title: 'Education',     tag: 'Campus Safety',    tagColor: 'bg-green-500',  description: 'Protect students, prevent intrusions, and maintain a safe campus 24/7 with AI-powered surveillance.',            points: ['Intrusion Prevention', 'Student Safety Monitoring', 'Examination Surveillance'] },
    { image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop', title: 'Retail',        tag: 'Store Intelligence',tagColor: 'bg-purple-500', description: 'Reduce shrinkage, analyze customer flow, and optimize store layout with real-time video intelligence.',           points: ['Theft Prevention & ANPR', 'Customer Footfall Analytics', 'Queue & Crowd Management'] },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-sm font-semibold mb-6">
            <Building2 className="w-4 h-4" />
            Industry Solutions
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Built for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
              Every Industry
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            AI-powered VSaaS solutions tailored to the unique security and operational needs of each sector.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {applications.map((app) => (
            <div key={app.title} className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="relative h-44 overflow-hidden">
                <img src={app.image} alt={app.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <h3 className="text-lg font-black text-white">{app.title}</h3>
                  <span className={`${app.tagColor} text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide`}>{app.tag}</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{app.description}</p>
                <ul className="space-y-2">
                  {app.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
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
      <FeatureTicker />
      <StatsBar />
      <AICapabilitiesSection />
      <AIFeaturesDemo />
      <AIUseCasesSection />
      <PlatformArchitectureSection />
      <IndustryApplicationsSection />
    </div>
  );
}
