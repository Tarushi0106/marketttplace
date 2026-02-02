import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// In production, fetch these from database
const products = [
  { slug: "virtual-machine-pro", updatedAt: new Date() },
  { slug: "load-balancer-enterprise", updatedAt: new Date() },
  { slug: "managed-firewall-plus", updatedAt: new Date() },
  { slug: "postgresql-managed", updatedAt: new Date() },
];

const categories = [
  { slug: "cloud-services", updatedAt: new Date() },
  { slug: "network-solutions", updatedAt: new Date() },
  { slug: "security", updatedAt: new Date() },
  { slug: "databases", updatedAt: new Date() },
  { slug: "devops-tools", updatedAt: new Date() },
];

const bundles = [
  { slug: "startup-bundle", updatedAt: new Date() },
  { slug: "enterprise-suite", updatedAt: new Date() },
  { slug: "devops-toolkit", updatedAt: new Date() },
];

const staticPages = [
  "",
  "/products",
  "/bundles",
  "/categories",
  "/about",
  "/contact",
  "/support",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const bundleUrls = bundles.map((bundle) => ({
    url: `${baseUrl}/bundles/${bundle.slug}`,
    lastModified: bundle.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticUrls = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: page === "" ? 1 : 0.5,
  }));

  return [...staticUrls, ...productUrls, ...categoryUrls, ...bundleUrls];
}
