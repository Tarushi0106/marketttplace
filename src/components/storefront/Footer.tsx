"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Zap,
  Youtube,
  Github,
  LucideIcon,
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

interface FooterMenu {
  title: string;
  items: MenuItem[];
}

// Default footer links if no menus configured
const defaultFooterLinks = {
  solutions: [
    { label: "Cloud Infrastructure", href: "/categories/cloud-services" },
    { label: "Connectivity", href: "/categories/connectivity" },
    { label: "Security Solutions", href: "/categories/security" },
    { label: "SaaS Products", href: "/categories/saas-products" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Partners", href: "/partners" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/api" },
    { label: "Status", href: "/status" },
  ],
};

// Social icon mapping
const socialIconMap: Record<string, LucideIcon> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  github: Github,
};

const defaultSocialLinks = [
  { label: "Facebook", icon: "facebook", href: "#" },
  { label: "Twitter", icon: "twitter", href: "#" },
  { label: "LinkedIn", icon: "linkedin", href: "#" },
  { label: "Instagram", icon: "instagram", href: "#" },
];

export function Footer() {
  const settings = useSiteSettings();
  const [solutionsLinks, setSolutionsLinks] = useState<MenuItem[]>([]);
  const [companyLinks, setCompanyLinks] = useState<MenuItem[]>([]);
  const [supportLinks, setSupportLinks] = useState<MenuItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<MenuItem[]>([]);

  // Fetch footer menus
  useEffect(() => {
    async function fetchFooterMenus() {
      try {
        // Fetch all menus in parallel
        const [solutionsRes, companyRes, supportRes, socialRes] = await Promise.all([
          fetch("/api/menus?location=footer_solutions").then(r => r.json()).catch(() => null),
          fetch("/api/menus?location=footer_company").then(r => r.json()).catch(() => null),
          fetch("/api/menus?location=footer_support").then(r => r.json()).catch(() => null),
          fetch("/api/menus?location=footer_social").then(r => r.json()).catch(() => null),
        ]);

        // Set solutions links
        if (solutionsRes?.data?.items?.length > 0) {
          setSolutionsLinks(solutionsRes.data.items);
        } else {
          setSolutionsLinks(defaultFooterLinks.solutions as MenuItem[]);
        }

        // Set company links
        if (companyRes?.data?.items?.length > 0) {
          setCompanyLinks(companyRes.data.items);
        } else {
          setCompanyLinks(defaultFooterLinks.company as MenuItem[]);
        }

        // Set support links
        if (supportRes?.data?.items?.length > 0) {
          setSupportLinks(supportRes.data.items);
        } else {
          setSupportLinks(defaultFooterLinks.support as MenuItem[]);
        }

        // Set social links
        if (socialRes?.data?.items?.length > 0) {
          setSocialLinks(socialRes.data.items);
        } else {
          setSocialLinks(defaultSocialLinks as MenuItem[]);
        }
      } catch (error) {
        console.error("Failed to fetch footer menus:", error);
        // Use defaults on error
        setSolutionsLinks(defaultFooterLinks.solutions as MenuItem[]);
        setCompanyLinks(defaultFooterLinks.company as MenuItem[]);
        setSupportLinks(defaultFooterLinks.support as MenuItem[]);
        setSocialLinks(defaultSocialLinks as MenuItem[]);
      }
    }

    fetchFooterMenus();
  }, []);

  const DefaultLogo = () => (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-[#8B1D1D] rounded-2xl flex items-center justify-center">
        <span className="text-white font-black text-2xl">S</span>
      </div>
      <div>
        <span className="text-2xl font-bold text-white tracking-tight">Shaurrya</span>
        <p className="text-[10px] text-white/50 font-semibold tracking-[0.2em] uppercase">Teleservices</p>
      </div>
    </div>
  );

  const address = [settings.city, settings.state, settings.country].filter(Boolean).join(", ") || settings.address;

  return (
    <footer className="relative">
      {/* Main Footer */}
      <div className="bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-20">
          {/* Top Section - Big CTA */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm mb-6">
              <Zap className="h-4 w-4" />
              <span>Start your journey today</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-3xl mx-auto leading-tight">
              Let&apos;s build something amazing together
            </h2>
            <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto">
              Join thousands of businesses transforming their operations with our solutions.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="h-14 px-8 bg-[#8B1D1D] text-white font-bold rounded-full flex items-center gap-2 hover:bg-[#7A1919] transition-all hover:scale-105"
              >
                Get Started Free
                <ArrowUpRight className="h-5 w-5" />
              </Link>
              <Link
                href="/products"
                className="h-14 px-8 bg-white/10 text-white font-semibold rounded-full flex items-center gap-2 border border-white/20 hover:bg-white/20 transition-all"
              >
                Browse Products
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mb-16" />

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-4 lg:col-span-2">
              <Link href="/">
                {settings.footerLogo || settings.logoLight || settings.siteLogo ? (
                  <Image
                    src={settings.footerLogo || settings.logoLight || settings.siteLogo || ""}
                    alt={settings.name}
                    width={160}
                    height={50}
                    className="h-12 w-auto object-contain brightness-0 invert"
                  />
                ) : (
                  <DefaultLogo />
                )}
              </Link>
              <p className="mt-6 text-white/50 text-sm leading-relaxed max-w-xs">
                {settings.siteTagline || "Enterprise-grade solutions for modern businesses. Trusted worldwide."}
              </p>

              {/* Contact */}
              <div className="mt-8 flex flex-wrap gap-6">
                {settings.phone && (
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
                    <Phone className="h-4 w-4" />
                    {settings.phone}
                  </a>
                )}
                {settings.email && (
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
                    <Mail className="h-4 w-4" />
                    {settings.email}
                  </a>
                )}
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="font-bold text-white mb-5">Solutions</h4>
              <ul className="space-y-3">
                {solutionsLinks.map((link, index) => (
                  <li key={link.id || index}>
                    <Link
                      href={link.href || "#"}
                      target={link.target === "_blank" ? "_blank" : undefined}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-white mb-5">Company</h4>
              <ul className="space-y-3">
                {companyLinks.map((link, index) => (
                  <li key={link.id || index}>
                    <Link
                      href={link.href || "#"}
                      target={link.target === "_blank" ? "_blank" : undefined}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-white mb-5">Support</h4>
              <ul className="space-y-3">
                {supportLinks.map((link, index) => (
                  <li key={link.id || index}>
                    <Link
                      href={link.href || "#"}
                      target={link.target === "_blank" ? "_blank" : undefined}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} {settings.legalName || settings.name}. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-white/50 hover:text-white transition-colors">Terms</Link>

              {/* Social */}
              <div className="flex items-center gap-1 ml-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon ? socialIconMap[social.icon.toLowerCase()] : null;
                  if (!IconComponent) return null;
                  return (
                    <a
                      key={social.id || index}
                      href={social.href || "#"}
                      target={social.target === "_blank" ? "_blank" : undefined}
                      className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                      aria-label={social.label}
                    >
                      <IconComponent className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
