import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Shaurrya Teleservices - Enterprise Teleservices Solutions",
    template: "%s | Shaurrya Teleservices",
  },
  description:
    "Enterprise-grade teleservices marketplace. Browse connectivity, cloud services, SaaS products, and security solutions.",
  keywords: [
    "Teleservices",
    "Connectivity",
    "Cloud Services",
    "Enterprise Solutions",
    "SaaS Products",
    "Network Solutions",
  ],
  authors: [{ name: "Shaurrya Teleservices" }],
  creator: "Shaurrya Teleservices",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Shaurrya Teleservices - Enterprise Teleservices Solutions",
    description:
      "Enterprise-grade teleservices marketplace. Browse connectivity, cloud services, SaaS products, and security solutions.",
    siteName: "Shaurrya Teleservices",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shaurrya Teleservices - Enterprise Teleservices Solutions",
    description:
      "Enterprise-grade teleservices marketplace. Browse connectivity, cloud services, SaaS products, and security solutions.",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
