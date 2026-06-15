"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface SiteSettings {
  name: string;
  legalName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  currency: string;
  currencySymbol: string;
  siteTitle: string;
  siteTagline: string;
  siteLogo: string | null;
  logoDark: string | null;  // Logo for light backgrounds
  logoLight: string | null; // Logo for dark backgrounds
  headerLogo: string | null;
  footerLogo: string | null;
  siteFavicon: string | null;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  } | null;
  // Footer settings
  footerCompanyName: string;
  footerTagline: string;
  footerAddress: string;
  footerPhone: string;
  footerEmail: string;
  footerCopyright: string;
}

const defaultSettings: SiteSettings = {
  name: "DeWiN Solutions",
  legalName: null,
  email: "contact@dewintele.com",
  phone: "+91-8698080000",
  address: "Mumbai",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
  currency: "INR",
  currencySymbol: "₹",
  siteTitle: "DeWiN Solutions",
  siteTagline: "IT Solutions & Services",
  siteLogo: null,
  logoDark: null,
  logoLight: null,
  headerLogo: null,
  footerLogo: null,
  siteFavicon: null,
  socialLinks: null,
  footerCompanyName: "",
  footerTagline: "",
  footerAddress: "",
  footerPhone: "",
  footerEmail: "",
  footerCopyright: "",
};

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings/site");
        const data = await response.json();
        if (data.data) {
          setSettings({
            ...defaultSettings,
            ...data.data,
          });
        }
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
      }
    }

    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
