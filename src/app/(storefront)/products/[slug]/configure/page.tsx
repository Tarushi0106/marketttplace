import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TallyCloudConfigurator } from "@/components/storefront/TallyCloudConfigurator";
import { AcronisOrderConfigurator } from "@/components/storefront/AcronisOrderConfigurator";
import { Microsoft365CombinedConfigurator } from "@/components/storefront/Microsoft365CombinedConfigurator";

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string; category?: string }>;
}

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      status: "ACTIVE",
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          recurringPrices: true,
        },
      },
      addons: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      configs: {
        orderBy: { sortOrder: "asc" },
      },
      recurringPrices: true,
      seoMetadata: true,
    },
  });

  if (product) {
    // Store all recurring prices before filtering (for variant lookup)
    const allRecurringPrices = product.recurringPrices ? [...product.recurringPrices] : [];
    
    // Transform recurringPrices to include variant-specific pricing
    // For standalone products: recurringPrices where variantId is null
    // For variable products: recurringPrices for each variant
    if (product.recurringPrices) {
      product.recurringPrices = product.recurringPrices.map((rp) => {
        // Get the variant-specific pricing if applicable
        const variantSpecificPrices = allRecurringPrices.filter(
          (arp) => arp.variantId === rp.variantId
        );
        
        // If there are variant-specific prices, merge them
        if (variantSpecificPrices.length > 0 && rp.variantId) {
          return {
            ...rp,
            // Keep original values but allow variant override
            monthlyPrice: rp.monthlyPrice,
            quarterlyPrice: rp.quarterlyPrice,
            yearlyPrice: rp.yearlyPrice,
          };
        }
        
        return rp;
      });
    }

    // Ensure variant recurringPrices are properly associated
    if (product.variants) {
      product.variants = product.variants.map((variant) => {
        // Find recurring prices specifically for this variant from the original array
        const variantSpecificPrices = allRecurringPrices.filter((rp) => rp.variantId === variant.id);
        
        if (variantSpecificPrices.length > 0) {
          // Use variant-specific recurring prices
          variant.recurringPrices = variantSpecificPrices;
          // Add transformed object for storefront frontend
          // @ts-ignore - Adding dynamic properties
          variant.recurringPricesObj = {
            monthly: variantSpecificPrices[0]?.monthlyPrice ? Number(variantSpecificPrices[0].monthlyPrice) : null,
            quarterly: variantSpecificPrices[0]?.quarterlyPrice ? Number(variantSpecificPrices[0].quarterlyPrice) : null,
            yearly: variantSpecificPrices[0]?.yearlyPrice ? Number(variantSpecificPrices[0].yearlyPrice) : null,
            biennial: variantSpecificPrices[0]?.biennialPrice ? Number(variantSpecificPrices[0].biennialPrice) : null,
            triennial: variantSpecificPrices[0]?.triennialPrice ? Number(variantSpecificPrices[0].triennialPrice) : null,
            semiAnnual: variantSpecificPrices[0]?.semiAnnualPrice ? Number(variantSpecificPrices[0].semiAnnualPrice) : null,
          };
          // @ts-ignore - Adding dynamic properties
          variant.billingType = 'recurring';
        } else if (variant.recurringPrices && variant.recurringPrices.length > 0) {
          // Variant already has recurring prices (included in query)
          // @ts-ignore - Adding dynamic properties
          variant.recurringPricesObj = {
            monthly: variant.recurringPrices[0]?.monthlyPrice ? Number(variant.recurringPrices[0].monthlyPrice) : null,
            quarterly: variant.recurringPrices[0]?.quarterlyPrice ? Number(variant.recurringPrices[0].quarterlyPrice) : null,
            yearly: variant.recurringPrices[0]?.yearlyPrice ? Number(variant.recurringPrices[0].yearlyPrice) : null,
            biennial: variant.recurringPrices[0]?.biennialPrice ? Number(variant.recurringPrices[0].biennialPrice) : null,
            triennial: variant.recurringPrices[0]?.triennialPrice ? Number(variant.recurringPrices[0].triennialPrice) : null,
            semiAnnual: variant.recurringPrices[0]?.semiAnnualPrice ? Number(variant.recurringPrices[0].semiAnnualPrice) : null,
          };
          // @ts-ignore - Adding dynamic properties
          variant.billingType = 'recurring';
        } else {
          // No variant-specific prices - clear to avoid stale data
          variant.recurringPrices = [];
          // @ts-ignore - Adding dynamic properties
          variant.recurringPricesObj = null;
          // @ts-ignore - Adding dynamic properties
          variant.billingType = 'one_time';
        }
        return variant;
      });
    }
  }

  return product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: (product.seoMetadata as any)?.title || `${product.name} | Configure`,
    description: (product.seoMetadata as any)?.description || product.shortDescription || `Configure ${product.name}`,
  };
}

export default async function ConfigureProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const selectedVariantId = resolvedSearchParams?.variant || null;
  const category = resolvedSearchParams?.category || null;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Category → variant name keyword mapping for Acronis
  const ACRONIS_CATEGORY_KEYWORDS: Record<string, string> = {
    workstation: 'workstation',
    vm: '- vm',
    server: '- server',
    virtualhost: 'virtual host',
    mailbox: 'mailbox',
    mobile: 'mobile',
    install: 'setup',
    core: 'windows 2019',
    storage: 'storage',
  };

  const ACRONIS_CATEGORY_LABELS: Record<string, string> = {
    device: 'Per Device',
    workstation: 'Workstation',
    vm: 'Virtual Machine',
    server: 'Physical Server',
    virtualhost: 'Virtual Host',
    mailbox: 'Office 365 Mailbox',
    mobile: 'Mobile Device',
    install: 'Setup / Install',
    core: 'Windows License',
    storage: 'Cloud Storage',
  };

  // For Acronis, render its own configurator
  if (product.slug === 'acronis-backup-advanced-spla') {
    const getVariantPrice = (v: any): number => {
      if (Number(v.price) > 0) return Number(v.price);
      const rp = v.recurringPrices?.[0] || v.recurringPricesObj;
      if (!rp) return 0;
      const name = (v.name || "").toLowerCase();
      if (name.includes("3 year"))   return Number(rp.triennialPrice || rp.triennial) || 0;
      if (name.includes("2 year"))   return Number(rp.biennialPrice  || rp.biennial)  || 0;
      if (name.includes("1 year"))   return Number(rp.yearlyPrice    || rp.yearly)    || 0;
      return Number(rp.monthlyPrice || rp.monthly) || 0;
    };

    // "device" = combined workstation + mobile
    let acronisVariants: any[];
    if (category === 'device') {
      acronisVariants = product.variants
        .filter((v: any) => v.name?.toLowerCase().includes('workstation') || v.name?.toLowerCase().includes('mobile'))
        .map((v: any) => ({ id: v.id, name: v.name, price: getVariantPrice(v) }));
    } else {
      const keyword = category && ACRONIS_CATEGORY_KEYWORDS[category] ? ACRONIS_CATEGORY_KEYWORDS[category] : '';
      acronisVariants = keyword
        ? product.variants.filter((v: any) => v.name?.toLowerCase().includes(keyword)).map((v: any) => ({ id: v.id, name: v.name, price: getVariantPrice(v) }))
        : product.variants.map((v: any) => ({ id: v.id, name: v.name, price: getVariantPrice(v) }));
    }
    const acronisAddons = product.addons.map((a: any) => ({ id: a.id, name: a.name, price: Number(a.price) || 0, unit: a.unit || undefined }));
    return (
      <div className="min-h-screen bg-gray-50">
        <AcronisOrderConfigurator
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
          category={category || undefined}
          categoryLabel={category ? (ACRONIS_CATEGORY_LABELS[category] || category) : 'All'}
          variants={acronisVariants}
          addons={acronisAddons}
        />
      </div>
    );
  }

  // For Microsoft 365 — combined SMB + Enterprise configurator with toggle
  if (product.slug === 'microsoft-365-services') {
    const initialTab = category === 'enterprise' ? 'enterprise' : 'smb';
    return (
      <Microsoft365CombinedConfigurator
        productId={product.id}
        initialTab={initialTab}
      />
    );
  }

  // For all other products
  const filteredAddons = product.addons;

  // Show modern configurator for all products with recurring pricing
  // Transform database addons to the format expected by TallyCloudConfigurator
  const transformedAddons = filteredAddons.map(addon => ({
    id: addon.id,
    name: addon.name,
    description: addon.description || undefined,
    price: Number(addon.price) || 0,
    unit: addon.unit || undefined,
    pricingType: addon.pricingType as "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "YEARLY" | undefined,
    source: 'product',
    group: addon.group || undefined,
    options: addon.options as any || undefined,
  }));

  // For Acronis, filter variants by the selected category
  const filteredVariants = product.slug === 'acronis-backup-advanced-spla' && category && ACRONIS_CATEGORY_KEYWORDS[category]
    ? product.variants.filter((v: any) => v.name.toLowerCase().includes(ACRONIS_CATEGORY_KEYWORDS[category]))
    : product.variants;

  // Transform variants for the configurator
  const transformedVariants = filteredVariants.map((variant: any) => ({
    id: variant.id,
    name: variant.name,
    price: Number(variant.price) || 0,
    compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
    isDefault: variant.isDefault || false,
    attributes: variant.attributes as Record<string, string> || {},
    billingType: (variant.attributes as Record<string, any>)?.billingType || 'RECURRING',
    setupFee: (variant.attributes as Record<string, any>)?.setupFee ? Number((variant.attributes as Record<string, any>)?.setupFee) : 0,
    minQuantity: (variant.attributes as Record<string, any>)?.minQuantity ? Number((variant.attributes as Record<string, any>)?.minQuantity) : 1,
    maxQuantity: (variant.attributes as Record<string, any>)?.maxQuantity ? Number((variant.attributes as Record<string, any>)?.maxQuantity) : null,
    // Include recurring prices array from database
    recurringPrices: variant.recurringPrices ? variant.recurringPrices.map((rp: any) => ({
      id: rp.id,
      variantId: rp.variantId,
      monthlyPrice: rp.monthlyPrice ? Number(rp.monthlyPrice) : null,
      quarterlyPrice: rp.quarterlyPrice ? Number(rp.quarterlyPrice) : null,
      yearlyPrice: rp.yearlyPrice ? Number(rp.yearlyPrice) : null,
      semiAnnualPrice: rp.semiAnnualPrice ? Number(rp.semiAnnualPrice) : null,
      biMonthlyPrice: rp.biMonthlyPrice ? Number(rp.biMonthlyPrice) : null,
      fourMonthlyPrice: rp.fourMonthlyPrice ? Number(rp.fourMonthlyPrice) : null,
      triAnnualPrice: rp.triAnnualPrice ? Number(rp.triAnnualPrice) : null,
      biennialPrice: rp.biennialPrice ? Number(rp.biennialPrice) : null,
      triennialPrice: rp.triennialPrice ? Number(rp.triennialPrice) : null,
    })) : [],
    // Include recurringPricesObj for easier price lookup by billing cycle
    recurringPricesObj: variant.recurringPricesObj ? {
      monthly: variant.recurringPricesObj.monthly,
      quarterly: variant.recurringPricesObj.quarterly,
      yearly: variant.recurringPricesObj.yearly,
      semiAnnual: variant.recurringPricesObj.semiAnnual,
      biennial: variant.recurringPricesObj.biennial,
      triennial: variant.recurringPricesObj.triennial,
    } : null,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10">
        <TallyCloudConfigurator
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
          productDescription={product.shortDescription || product.description || undefined}
          basePrice={Number(product.basePrice) || 0}
          addons={transformedAddons}
          variants={transformedVariants}
          selectedVariantId={selectedVariantId}
          lockedVariantId={selectedVariantId}
        />

        {/* Deco Talent — pricing & features info */}
        {product.slug === 'deco-talent' && (
          <div className="max-w-3xl mx-auto mt-12 space-y-6">

            {/* End client rates table */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">End Client Rates</h3>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1E2260] text-white">
                      <th className="text-left px-5 py-3 font-semibold">Tier</th>
                      <th className="text-left px-5 py-3 font-semibold">Monthly Minutes</th>
                      <th className="text-right px-5 py-3 font-semibold">Rate (INR / min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tier: "Low",        minutes: "< 2,000 min",           rate: "₹8" },
                      { tier: "Moderator",  minutes: "2,000 – 10,000 min",    rate: "₹7" },
                      { tier: "High",       minutes: "10,000 – 50,000 min",   rate: "₹6" },
                      { tier: "Enterprise", minutes: "> 50,000 min",           rate: "₹5" },
                    ].map((row, i) => (
                      <tr key={row.tier} className={i % 2 === 1 ? "bg-[#F8F9FF]" : "bg-white"}>
                        <td className="px-5 py-3.5 font-medium text-gray-900">{row.tier}</td>
                        <td className="px-5 py-3.5 text-gray-600">{row.minutes}</td>
                        <td className="px-5 py-3.5 text-right font-bold text-[#1E2260]">{row.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Setup + Features row */}
            <div className="grid sm:grid-cols-2 gap-5">

              {/* One-time Setup */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">One-time Setup</p>
                <p className="text-lg font-black text-[#1E2260] mb-3">₹75,000 – ₹3,00,000</p>
                <p className="text-xs text-gray-500 mb-3">Depending on use case complexity. Includes:</p>
                <ul className="space-y-1.5">
                  {["Telephony integration", "Use case setup & scripting", "Dashboard for outbound & inbound"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E2260] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inclusions */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">What's Included</p>
                <ul className="space-y-2">
                  {[
                    "1 Year Validity",
                    "Unlimited Job Postings",
                    "Unlimited Candidate Data",
                    "Unlimited Seats / HR Users",
                    "Taxes as applicable",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-4 h-4 rounded-full bg-[#EEF2FF] border border-[#1E2260]/20 flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1E2260]" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
