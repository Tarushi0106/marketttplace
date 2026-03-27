import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VSAASLandingPage } from "@/components/storefront/VSAASLandingPage";
import { TallyCloudConfigurator } from "@/components/storefront/TallyCloudConfigurator";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  
  // For VSAAS, return special metadata
  if (resolvedParams.slug === "vsaas") {
    return {
      title: "VSaaS Cloud Surveillance | Configure Your Plan",
      description: "Configure your AI-powered Video Surveillance as a Service solution. Choose cloud or on-premise deployment.",
    };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug: resolvedParams.slug },
    });

    return {
      title: product ? `${product.name} | Configure | Shaurrya Teleservices` : 'Product Not Found',
      description: product?.shortDescription || 'Configure product',
    };
  } catch (error) {
    return {
      title: "Configure Product | Shaurrya Teleservices",
    };
  }
}

async function getProduct(slug: string) {
  try {
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
      const allRecurringPrices = product.recurringPrices ? [...product.recurringPrices] : [];
      
      if (product.recurringPrices) {
        product.recurringPrices = product.recurringPrices.map((rp) => {
          const variantSpecificPrices = allRecurringPrices.filter(
            (arp) => arp.variantId === rp.variantId
          );
          
          if (variantSpecificPrices.length > 0 && rp.variantId) {
            return {
              ...rp,
              monthlyPrice: rp.monthlyPrice,
              quarterlyPrice: rp.quarterlyPrice,
              yearlyPrice: rp.yearlyPrice,
            };
          }
          return rp;
        });
      }

      if (product.variants) {
        product.variants = product.variants.map((variant) => {
          const variantSpecificPrices = allRecurringPrices.filter((rp) => rp.variantId === variant.id);
          
          if (variantSpecificPrices.length > 0) {
            variant.recurringPrices = variantSpecificPrices;
            // @ts-ignore
            variant.recurringPricesObj = {
              monthly: variantSpecificPrices[0]?.monthlyPrice ? Number(variantSpecificPrices[0].monthlyPrice) : null,
              quarterly: variantSpecificPrices[0]?.quarterlyPrice ? Number(variantSpecificPrices[0].quarterlyPrice) : null,
              yearly: variantSpecificPrices[0]?.yearlyPrice ? Number(variantSpecificPrices[0].yearlyPrice) : null,
              biennial: variantSpecificPrices[0]?.biennialPrice ? Number(variantSpecificPrices[0].biennialPrice) : null,
              triennial: variantSpecificPrices[0]?.triennialPrice ? Number(variantSpecificPrices[0].triennialPrice) : null,
              semiAnnual: variantSpecificPrices[0]?.semiAnnualPrice ? Number(variantSpecificPrices[0].semiAnnualPrice) : null,
            };
            // @ts-ignore
            variant.billingType = 'recurring';
          } else if (variant.recurringPrices && variant.recurringPrices.length > 0) {
            // @ts-ignore
            variant.recurringPricesObj = {
              monthly: variant.recurringPrices[0]?.monthlyPrice ? Number(variant.recurringPrices[0].monthlyPrice) : null,
              quarterly: variant.recurringPrices[0]?.quarterlyPrice ? Number(variant.recurringPrices[0].quarterlyPrice) : null,
              yearly: variant.recurringPrices[0]?.yearlyPrice ? Number(variant.recurringPrices[0].yearlyPrice) : null,
              biennial: variant.recurringPrices[0]?.biennialPrice ? Number(variant.recurringPrices[0].biennialPrice) : null,
              triennial: variant.recurringPrices[0]?.triennialPrice ? Number(variant.recurringPrices[0].triennialPrice) : null,
              semiAnnual: variant.recurringPrices[0]?.semiAnnualPrice ? Number(variant.recurringPrices[0].semiAnnualPrice) : null,
            };
            // @ts-ignore
            variant.billingType = 'recurring';
          } else {
            variant.recurringPrices = [];
            // @ts-ignore
            variant.recurringPricesObj = null;
            // @ts-ignore
            variant.billingType = 'one_time';
          }
          return variant;
        });
      }
    }

    return product;
  } catch (error) {
    console.error("[VSAAS Configure Page] Error fetching product:", error);
    return null;
  }
}

export default async function ConfigurePage({ params }: Props) {
  const resolvedParams = await params;
  console.log("[ConfigurePage] Rendering for slug:", resolvedParams.slug);
  
  // For VSAAS, fetch from database or show landing page
  if (resolvedParams.slug === "vsaas") {
    try {
      const product = await getProduct("vsaas");
      
      if (!product) {
        console.log("[ConfigurePage] VSAAS product not found in DB, showing landing page");
        // Show VSAAS landing page if product doesn't exist
        return <VSAASLandingPage />;
      }

      console.log("[ConfigurePage] Found VSAAS product:", product.name, "with", product.variants?.length || 0, "variants");

      const transformedAddons = product.addons?.map(addon => ({
        id: addon.id,
        name: addon.name,
        description: addon.description || undefined,
        price: Number(addon.price) || 0,
        unit: addon.unit || undefined,
        pricingType: addon.pricingType as "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "YEARLY" | undefined,
        source: 'product',
        group: addon.group || undefined,
        options: addon.options as any || undefined,
      })) || [];

      const transformedVariants = product.variants?.map((variant: any) => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price) || 0,
        compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
        isDefault: variant.isDefault || false,
        attributes: variant.attributes as Record<string, string> || {},
        billingType: (variant.attributes as Record<string, any>)?.billingType || 'RECURRING',
        setupFee: (variant.attributes as Record<string, any>)?.setupFee ? Number((variant.attributes as Record<string, any>)?.setupFee) : 0,
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
        recurringPricesObj: variant.recurringPricesObj ? {
          monthly: variant.recurringPricesObj.monthly,
          quarterly: variant.recurringPricesObj.quarterly,
          yearly: variant.recurringPricesObj.yearly,
          semiAnnual: variant.recurringPricesObj.semiAnnual,
          biennial: variant.recurringPricesObj.biennial,
          triennial: variant.recurringPricesObj.triennial,
        } : null,
      })) || [];

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
              selectedVariantId={null}
              lockedVariantId={null}
            />
          </div>
        </div>
      );
    } catch (error) {
      console.error("[ConfigurePage] Error rendering VSAAS configure page:", error);
      // Fallback to landing page on error
      return <VSAASLandingPage />;
    }
  }

  // For other products, try to fetch and render
  try {
    const product = await getProduct(resolvedParams.slug);

    if (!product) {
      notFound();
    }

    const transformedAddons = product.addons?.map(addon => ({
      id: addon.id,
      name: addon.name,
      description: addon.description || undefined,
      price: Number(addon.price) || 0,
      unit: addon.unit || undefined,
      pricingType: addon.pricingType as "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "YEARLY" | undefined,
      source: 'product',
      group: addon.group || undefined,
      options: addon.options as any || undefined,
    })) || [];

    const transformedVariants = product.variants?.map((variant: any) => ({
      id: variant.id,
      name: variant.name,
      price: Number(variant.price) || 0,
      compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
      isDefault: variant.isDefault || false,
      attributes: variant.attributes as Record<string, string> || {},
      billingType: (variant.attributes as Record<string, any>)?.billingType || 'RECURRING',
      setupFee: (variant.attributes as Record<string, any>)?.setupFee ? Number((variant.attributes as Record<string, any>)?.setupFee) : 0,
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
      recurringPricesObj: variant.recurringPricesObj ? {
        monthly: variant.recurringPricesObj.monthly,
        quarterly: variant.recurringPricesObj.quarterly,
        yearly: variant.recurringPricesObj.yearly,
        semiAnnual: variant.recurringPricesObj.semiAnnual,
        biennial: variant.recurringPricesObj.biennial,
        triennial: variant.recurringPricesObj.triennial,
      } : null,
    })) || [];

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
            selectedVariantId={null}
            lockedVariantId={null}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("[ConfigurePage] Error:", error);
    notFound();
  }
}
