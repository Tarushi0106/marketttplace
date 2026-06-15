"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin,
  Zap, Youtube, Github, LucideIcon, ArrowRight, ExternalLink,
} from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface MenuItem {
  id: string;
  label: string;
  href: string | null;
  icon: string | null;
  target: string;
  isActive: boolean;
}

const defaultFooterLinks = {
  solutions: [
    { label: "Cloud Infrastructure",  href: "/categories/cloud-services"  },
    { label: "Connectivity",          href: "/categories/connectivity"     },
    { label: "Security Solutions",    href: "/categories/security"         },
    { label: "SaaS Products",         href: "/categories/saas-products"    },
  ],
  company: [
    { label: "About Us",  href: "/about"   },
    { label: "Contact",   href: "/contact" },
  ],
  support: [
    { label: "My Orders", href: "/orders" },
  ],
};

const socialIconMap: Record<string, LucideIcon> = {
  facebook: Facebook, twitter: Twitter, linkedin: Linkedin,
  instagram: Instagram, youtube: Youtube, github: Github,
};

const defaultSocialLinks = [
  { label: "Facebook",  icon: "facebook",  href: "#" },
  { label: "Twitter",   icon: "twitter",   href: "#" },
  { label: "LinkedIn",  icon: "linkedin",  href: "#" },
  { label: "Instagram", icon: "instagram", href: "#" },
];

const marqueeItems = [
  "Cloud Infrastructure", "VSaaS", "Cybersecurity", "SD-WAN",
  "Microsoft 365", "Managed Services", "AI Solutions", "IoT & Mobility",
  "Tally on Cloud", "Backup & Recovery", "Network Hardware", "Connectivity",
];

export function Footer() {
  const settings = useSiteSettings();
  const [solutionsLinks, setSolutionsLinks] = useState<MenuItem[]>([]);
  const [companyLinks,   setCompanyLinks]   = useState<MenuItem[]>([]);
  const [supportLinks,   setSupportLinks]   = useState<MenuItem[]>([]);
  const [socialLinks,    setSocialLinks]    = useState<MenuItem[]>([]);
  const [email,          setEmail]          = useState("");
  const [subscribed,     setSubscribed]     = useState(false);

  useEffect(() => {
    async function fetchFooterMenus() {
      try {
        const [s, c, su, so] = await Promise.all([
          fetch("/api/menus?location=footer_solutions").then(r => r.json()).catch(() => null),
          fetch("/api/menus?location=footer_company").then(r => r.json()).catch(() => null),
          fetch("/api/menus?location=footer_support").then(r => r.json()).catch(() => null),
          fetch("/api/menus?location=footer_social").then(r => r.json()).catch(() => null),
        ]);
        setSolutionsLinks(s?.data?.items?.length  > 0 ? s.data.items  : defaultFooterLinks.solutions as MenuItem[]);
        setCompanyLinks(c?.data?.items?.length    > 0 ? c.data.items  : defaultFooterLinks.company   as MenuItem[]);
        setSupportLinks(su?.data?.items?.length   > 0 ? su.data.items : defaultFooterLinks.support   as MenuItem[]);
        setSocialLinks(so?.data?.items?.length    > 0 ? so.data.items : defaultSocialLinks            as MenuItem[]);
      } catch {
        setSolutionsLinks(defaultFooterLinks.solutions as MenuItem[]);
        setCompanyLinks(defaultFooterLinks.company     as MenuItem[]);
        setSupportLinks(defaultFooterLinks.support     as MenuItem[]);
        setSocialLinks(defaultSocialLinks              as MenuItem[]);
      }
    }
    fetchFooterMenus();
  }, []);

  const address = [settings.city, settings.state, settings.country].filter(Boolean).join(", ") || settings.address;

  return (
    <footer className="relative overflow-hidden bg-[#0D0F2B]">

      {/* ── Decorative background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Navy glow top-left */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#1E2260]/40 blur-[120px]" />
        {/* Blue glow bottom-right */}
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#4A9FD5]/20 blur-[100px]" />
      </div>

      {/* ── Marquee strip ── */}
      <div className="relative border-b border-white/10 py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-0">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-6 text-sm font-medium text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4A9FD5] flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="relative border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-[#4A9FD5] text-sm font-semibold uppercase tracking-widest mb-3">Ready to transform?</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight max-w-xl">
                Let's build something <span className="text-[#4A9FD5]">amazing</span> together
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link href="/contact"
                className="inline-flex items-center gap-2 px-7 py-4 bg-[#1E2260] hover:bg-[#2B3080] text-white font-bold rounded-2xl transition-all hover:scale-105 text-sm border border-[#4A9FD5]/30">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/products"
                className="inline-flex items-center gap-2 px-7 py-4 border border-white/20 hover:border-white/40 text-white font-semibold rounded-2xl transition-all text-sm hover:bg-white/5">
                Browse Products
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="relative container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Brand col */}
          <div className="lg:col-span-4">
            <Link href="/">
              <div className="inline-block bg-white rounded-xl p-2 hover:opacity-90 transition-opacity mb-6">
                <img src="/dewin-logo.jpeg" alt="DeWiN Solutions" className="h-14 w-auto object-contain" />
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xs">
              {settings.footerTagline || settings.siteTagline || "Enterprise-grade IT solutions for modern businesses. Trusted nationwide."}
            </p>

            {/* Contact */}
            <div className="space-y-3">
              {settings.phone && (
                <a href={`tel:${settings.phone}`}
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors group">
                  <span className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 group-hover:border-[#4A9FD5] group-hover:bg-[#4A9FD5]/10 flex items-center justify-center transition-all flex-shrink-0">
                    <Phone className="h-4 w-4 text-[#4A9FD5]" />
                  </span>
                  {settings.phone}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors group">
                  <span className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 group-hover:border-[#4A9FD5] group-hover:bg-[#4A9FD5]/10 flex items-center justify-center transition-all flex-shrink-0">
                    <Mail className="h-4 w-4 text-[#4A9FD5]" />
                  </span>
                  {settings.email}
                </a>
              )}
              {address && (
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <span className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-[#4A9FD5]" />
                  </span>
                  {address}
                </div>
              )}
            </div>
          </div>

          {/* Nav cols */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-8">
            {[
              { title: "Solutions", links: solutionsLinks },
              { title: "Company",   links: companyLinks   },
              { title: "Support",   links: supportLinks   },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-xs font-bold text-white/25 uppercase tracking-widest mb-5">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link, i) => (
                    <li key={link.id || i}>
                      <Link href={link.href || "#"}
                        target={link.target === "_blank" ? "_blank" : undefined}
                        className="text-sm text-white/45 hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-0 group-hover:w-2 h-px bg-[#4A9FD5] transition-all duration-200 flex-shrink-0" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter col */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold text-white/25 uppercase tracking-widest mb-5">Newsletter</h4>
            <p className="text-sm text-white/40 mb-5 leading-relaxed">
              Get new products and enterprise insights delivered to your inbox.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium py-3">
                <div className="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center text-xs">✓</div>
                You're subscribed — thanks!
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#4A9FD5] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
                />
                <button
                  onClick={() => { if (email) setSubscribed(true); }}
                  className="w-full py-3 bg-[#1E2260] hover:bg-[#2B3080] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#4A9FD5]/30"
                >
                  <Zap className="h-4 w-4" />
                  Subscribe
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">
              {settings.footerCopyright
                ? settings.footerCopyright.replace("{year}", new Date().getFullYear().toString())
                : `© ${new Date().getFullYear()} ${settings.legalName || settings.name || "DeWiN Solutions Private Limited"}. All rights reserved.`}
            </p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="text-xs text-white/25 hover:text-white/60 transition-colors">Privacy Policy</Link>
              <Link href="/terms"   className="text-xs text-white/25 hover:text-white/60 transition-colors">Terms of Service</Link>
              <div className="flex items-center gap-1.5 ml-1">
                {socialLinks.map((social, i) => {
                  const Icon = social.icon ? socialIconMap[social.icon.toLowerCase()] : null;
                  if (!Icon) return null;
                  return (
                    <a key={social.id || i} href={social.href || "#"}
                      target={social.target === "_blank" ? "_blank" : undefined}
                      aria-label={social.label}
                      className="w-8 h-8 rounded-lg border border-white/10 hover:border-[#4A9FD5] hover:bg-[#4A9FD5]/10 flex items-center justify-center text-white/30 hover:text-white transition-all">
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee keyframe */}
      <style jsx>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </footer>
  );
}
