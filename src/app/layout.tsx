import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Script from "next/script";

// Force dynamic rendering for the entire app to prevent build-time prerendering errors
export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "DeWiN Solutions - IT Solutions & Services",
    template: "%s | DeWiN Solutions",
  },
  description:
    "Enterprise IT marketplace. Browse connectivity, cloud services, SaaS products, and security solutions.",
  keywords: [
    "IT Solutions",
    "Connectivity",
    "Cloud Services",
    "Enterprise Solutions",
    "SaaS Products",
    "Network Solutions",
  ],
  authors: [{ name: "DeWiN Solutions" }],
  creator: "DeWiN Solutions",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "DeWiN Solutions - IT Solutions & Services",
    description:
      "Enterprise IT marketplace. Browse connectivity, cloud services, SaaS products, and security solutions.",
    siteName: "DeWiN Solutions",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeWiN Solutions - IT Solutions & Services",
    description:
      "Enterprise IT marketplace. Browse connectivity, cloud services, SaaS products, and security solutions.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
