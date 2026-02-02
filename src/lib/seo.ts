import type { Metadata } from "next";
import type { Product, Bundle, Category } from "@/types";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const siteName = "NaaS Market";

export function generateProductMetadata(product: Product): Metadata {
  const title = product.seoMetadata?.metaTitle || product.name;
  const description =
    product.seoMetadata?.metaDescription ||
    product.shortDescription ||
    `${product.name} - Enterprise NaaS solution`;

  const images = product.images?.[0]?.url
    ? [
        {
          url: product.images[0].url,
          width: product.images[0].width || 1200,
          height: product.images[0].height || 630,
          alt: product.images[0].alt || product.name,
        },
      ]
    : [];

  return {
    title,
    description,
    keywords: product.seoMetadata?.metaKeywords?.split(",").map((k) => k.trim()),
    openGraph: {
      title: product.seoMetadata?.ogTitle || title,
      description: product.seoMetadata?.ogDescription || description,
      url: `${baseUrl}/products/${product.slug}`,
      siteName,
      images: product.seoMetadata?.ogImage ? [product.seoMetadata.ogImage] : images,
      type: "website",
    },
    twitter: {
      card: (product.seoMetadata?.twitterCard as "summary_large_image") || "summary_large_image",
      title: product.seoMetadata?.ogTitle || title,
      description: product.seoMetadata?.ogDescription || description,
      images: product.seoMetadata?.ogImage ? [product.seoMetadata.ogImage] : images.map((i) => i.url),
    },
    alternates: {
      canonical: product.seoMetadata?.canonicalUrl || `${baseUrl}/products/${product.slug}`,
    },
    robots: {
      index: !product.seoMetadata?.noIndex,
      follow: !product.seoMetadata?.noFollow,
    },
  };
}

export function generateBundleMetadata(bundle: Bundle): Metadata {
  const title = bundle.seoMetadata?.metaTitle || bundle.name;
  const description =
    bundle.seoMetadata?.metaDescription ||
    bundle.shortDescription ||
    `${bundle.name} - Save with our bundled NaaS solutions`;

  return {
    title,
    description,
    openGraph: {
      title: bundle.seoMetadata?.ogTitle || title,
      description: bundle.seoMetadata?.ogDescription || description,
      url: `${baseUrl}/bundles/${bundle.slug}`,
      siteName,
      images: bundle.image ? [bundle.image] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: bundle.seoMetadata?.ogTitle || title,
      description: bundle.seoMetadata?.ogDescription || description,
    },
    alternates: {
      canonical: `${baseUrl}/bundles/${bundle.slug}`,
    },
  };
}

export function generateCategoryMetadata(category: Category): Metadata {
  const title = `${category.name} - NaaS Products`;
  const description =
    category.description ||
    `Browse ${category.name} products and services at NaaS Market`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/categories/${category.slug}`,
      siteName,
      images: category.image ? [category.image] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/categories/${category.slug}`,
    },
  };
}

export function generateProductJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images?.[0]?.url,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: siteName,
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: "USD",
      price: product.basePrice,
      availability: product.stockQuantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: siteName,
      },
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.averageRating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      "https://twitter.com/naasmarket",
      "https://facebook.com/naasmarket",
      "https://linkedin.com/company/naasmarket",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-123-4567",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };
}

export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
