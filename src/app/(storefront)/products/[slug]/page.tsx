import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { marked } from "marked";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  ChevronRight,
  Star,
  Shield,
  Clock,
  CheckCircle,
  ExternalLink,
  FileText,
  Download,
  MessageSquare,
  ThumbsUp,
  Building2,
  Globe,
  Users,
  Zap,
  Award,
  HeartHandshake,
  Check,
  Play,
  ShoppingBag,
  MessageCircle,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  Rocket,
  Cloud,
  Server,
  Database,
  Lock,
  Headphones,
  Info,
  LayoutGrid,
  CreditCard,
  HelpCircle,
  BookOpen,
  Video,
  HardDrive,
  LayoutDashboard,
  Monitor,
  Globe as GlobeIcon,
  Smartphone,
  Activity,
  BarChart3,
  ScrollText,
  Wifi,
  Brain,
  Mic,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatPrice } from "@/lib/utils";
import { AcronisConfigurator } from "@/components/storefront/AcronisConfigurator";
import { Microsoft365Configurator } from "@/components/storefront/Microsoft365Configurator";
import { ProductPageTracker } from "@/components/storefront/ProductPageTracker";

// Render icon based on icon name
function renderIcon(iconName?: string | null) {
  const props = { size: 28, className: "text-[#1E2260]" };

  switch (iconName) {
    case "Cloud":
      return <Cloud {...props} />;
    case "Shield":
      return <Shield {...props} />;
    case "Server":
      return <Server {...props} />;
    case "Database":
      return <Database {...props} />;
    case "Lock":
      return <Lock {...props} />;
    case "Globe":
      return <Globe {...props} />;
    default:
      return <Cloud {...props} />;
  }
}

// ─── Deco Talent — custom rich overview ──────────────────────────────────────
function DecoTalentDescription() {
  const stats = [
    { value: "3x", label: "Faster shortlisting" },
    { value: "100+", label: "Resumes scored / min" },
    { value: "10", label: "Evaluation parameters" },
    { value: "30+", label: "Supported languages" },
  ];
  const steps = [
    { num: "01", title: "Define evaluation criteria", desc: "Set skills, weightages, and scoring rubric for the role — once, reused forever." },
    { num: "02", title: "Upload resumes in bulk", desc: "PDF/DOCX batch upload; AI parses, deduplicates, and scores every profile instantly." },
    { num: "03", title: "AI scores every profile", desc: "Ranked against your rubric in seconds — shortlist ready with zero manual effort." },
    { num: "04", title: "Schedule screening call", desc: "Automated 5-minute AI screening call dispatched to top-ranked candidates." },
    { num: "05", title: "Conduct AI interview", desc: "Full voice interview with adaptive questions, recorded and transcribed in real time." },
    { num: "06", title: "Review 10-parameter report", desc: "Comprehensive evaluation report with video playback and one-click ATS export." },
  ];
  const parameters = [
    "Communication", "Technical Depth", "Problem-solving", "Confidence", "Clarity of Thought",
    "Domain Knowledge", "Active Listening", "Leadership Signals", "Culture Fit", "Overall Hire Fit",
  ];
  const advantages = [
    { title: "AI handles first round entirely", desc: "HR steps in only when the shortlist is ready — zero Round 1 effort." },
    { title: "100+ resumes per minute", desc: "No manual CV screening — every profile scored in seconds at any volume." },
    { title: "Bias-free evaluation", desc: "Rubric-bound scoring removes interviewer subjectivity and variation." },
    { title: "Any hiring volume", desc: "5 or 500 candidates simultaneously — no extra headcount needed." },
    { title: "30+ interview languages", desc: "Screen and interview globally without language specialist recruiters." },
    { title: "ATS-ready reports", desc: "Push shortlists and evaluation data directly to your HR system in one click." },
  ];
  return (
    <div className="space-y-10">
      <p className="text-gray-600 leading-relaxed text-base">
        Deco Talent is a fully automated AI talent screening platform that handles resume scoring, AI-conducted voice interviews, and 10-parameter candidate evaluation — delivering a ranked shortlist with zero recruiter effort until you need to act.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#1E2260] rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-[#4A9FD5] mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
      <div>
        <h4 className="text-base font-bold text-gray-900 mb-4">How It Works</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {steps.map((s) => (
            <div key={s.num} className="flex gap-3 p-4 rounded-xl border border-gray-100 hover:border-[#1E2260]/20 hover:shadow-sm transition-all bg-white">
              <span className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#1E2260] text-xs font-black flex items-center justify-center shrink-0">{s.num}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-base font-bold text-gray-900 mb-4">10 Evaluated Parameters</h4>
        <div className="flex flex-wrap gap-2">
          {parameters.map((p, i) => (
            <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F9FF] border border-[#E8EEFF] text-xs font-medium text-gray-700">
              <span className="w-4 h-4 rounded-full bg-[#1E2260] text-white text-[9px] font-bold flex items-center justify-center">{i + 1}</span>
              {p}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-base font-bold text-gray-900 mb-4">Key Advantages</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {advantages.map((a) => (
            <div key={a.title} className="flex items-start gap-3 p-4 rounded-xl bg-[#F8F9FF] border border-[#E8EEFF]">
              <div className="w-5 h-5 rounded-full bg-[#1E2260] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Deco Voice — custom rich overview ───────────────────────────────────────
function DecoVoiceDescription() {
  const stats = [
    { value: "10+", label: "Languages supported" },
    { value: "Faster", label: "Response time" },
    { value: "24/7", label: "Business availability" },
    { value: "∞", label: "Unlimited scalability" },
  ];
  const steps = [
    { num: "01", title: "Import Leads", desc: "Upload or sync your lead list from your CRM or spreadsheet instantly." },
    { num: "02", title: "AI Initiates Conversations", desc: "DECO Voice dials out with a natural, human-like voice — personalised per lead." },
    { num: "03", title: "Intelligent Conversation Handling", desc: "Understands responses, handles objections, and advances the conversation goal." },
    { num: "04", title: "Human Escalation When Needed", desc: "Seamlessly transfers to a live agent with full call context — no repeat required." },
    { num: "05", title: "Real-Time CRM Updates", desc: "Every call outcome, transcript, and disposition synced to your CRM automatically." },
  ];
  const useCases = [
    "Lead Qualification & Follow-Ups",
    "Appointment Booking & Reminders",
    "Payment Collection Calls",
    "Customer Support Automation",
    "Surveys & Feedback Collection",
    "AI Receptionist / IVR Replacement",
    "Order Confirmation Calls",
    "Customer Re-Engagement Campaigns",
  ];
  const advantages = [
    { title: "Faster Response Time", desc: "Instant AI responses — no hold music, no waiting in queue." },
    { title: "Unlimited Scalability", desc: "Handle hundreds of simultaneous calls with no extra headcount." },
    { title: "10+ Language Support", desc: "Serve customers in their native language across India and globally." },
    { title: "Human-Like Conversations", desc: "Natural dialogue flow that sounds nothing like a traditional IVR." },
    { title: "Real-Time CRM Sync", desc: "Zoho, HubSpot, LeadSquared, Salesforce — every call logged instantly." },
    { title: "24/7 Business Availability", desc: "Never miss a lead or a support request — your AI works all day, every day." },
  ];
  return (
    <div className="space-y-10">
      <p className="text-gray-600 leading-relaxed text-base">
        DECO Voice automates your business conversations end-to-end — inbound and outbound. From lead qualification and appointment booking to payment collection and customer support, DECO handles it all with human-like AI voice, real-time CRM sync, and intelligent escalation.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#1E2260] rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-[#4A9FD5] mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
      <div>
        <h4 className="text-base font-bold text-gray-900 mb-4">How DECO Voice Works</h4>
        <div className="flex flex-col sm:flex-row gap-2 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 p-4 rounded-xl border border-gray-100 bg-white flex-1 min-w-[160px]">
              <span className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#1E2260] text-xs font-black flex items-center justify-center shrink-0">{s.num}</span>
              <div className="sm:text-center">
                <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && <div className="hidden sm:block w-full h-px bg-gradient-to-r from-[#1E2260]/20 to-transparent absolute" />}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-base font-bold text-gray-900 mb-4">Where DECO Can Help</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {useCases.map((uc, i) => (
            <div key={uc} className="flex items-start gap-2 p-3 rounded-xl bg-[#F8F9FF] border border-[#E8EEFF]">
              <span className="w-5 h-5 rounded-full bg-[#1E2260] text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-xs font-medium text-gray-700 leading-relaxed">{uc}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-base font-bold text-gray-900 mb-4">Key Advantages</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {advantages.map((a) => (
            <div key={a.title} className="flex items-start gap-3 p-4 rounded-xl bg-[#F8F9FF] border border-[#E8EEFF]">
              <div className="w-5 h-5 rounded-full bg-[#1E2260] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-base font-bold text-gray-900 mb-4">Integrations</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Telephony</p>
            <div className="flex flex-wrap gap-2">
              {["Exotel", "Airtel", "VOIP", "Tata Communications"].map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-full bg-[#EEF2FF] text-[#1E2260] text-xs font-semibold">{t}</span>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">CRM</p>
            <div className="flex flex-wrap gap-2">
              {["Zoho", "HubSpot", "LeadSquared", "Salesforce", "Custom CRM"].map((c) => (
                <span key={c} className="px-3 py-1.5 rounded-full bg-[#EEF2FF] text-[#1E2260] text-xs font-semibold">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

async function getProductDisplaySetting(): Promise<"card" | "table"> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "product-display" },
    });
    if (setting && setting.value && typeof setting.value === "object") {
      const val = setting.value as { displayFormat?: string };
      if (val.displayFormat === "table") return "table";
    }
    return "card";
  } catch {
    return "card";
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
      subCategory: true,
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
      configs: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, image: true } },
        },
      },
      seoMetadata: true,
      recurringPrices: true,
    },
  });

  if (product) {
    // Store all recurring prices before filtering (for variant lookup)
    const allRecurringPrices = product.recurringPrices ? [...product.recurringPrices] : [];
    
    // Transform recurringPrices to include variant-specific pricing
    // For standalone products: recurringPrices where variantId is null
    // For variable products: recurringPrices for each variant
    if (product.recurringPrices) {
      // Filter product-level recurring prices (variantId = null)
      product.recurringPrices = product.recurringPrices.filter((rp) => !rp.variantId);
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
          (variant as any).recurringPricesObj = {
            monthly: variantSpecificPrices[0]?.monthlyPrice ? Number(variantSpecificPrices[0].monthlyPrice) : null,
            quarterly: variantSpecificPrices[0]?.quarterlyPrice ? Number(variantSpecificPrices[0].quarterlyPrice) : null,
            yearly: variantSpecificPrices[0]?.yearlyPrice ? Number(variantSpecificPrices[0].yearlyPrice) : null,
            biennial: variantSpecificPrices[0]?.biennialPrice ? Number(variantSpecificPrices[0].biennialPrice) : null,
            triennial: variantSpecificPrices[0]?.triennialPrice ? Number(variantSpecificPrices[0].triennialPrice) : null,
          };
          (variant as any).billingType = 'recurring';
        } else if (variant.recurringPrices && variant.recurringPrices.length > 0) {
          // Variant already has recurring prices (included in query)
          // Keep as is
          (variant as any).recurringPricesObj = {
            monthly: variant.recurringPrices[0]?.monthlyPrice ? Number(variant.recurringPrices[0].monthlyPrice) : null,
            quarterly: variant.recurringPrices[0]?.quarterlyPrice ? Number(variant.recurringPrices[0].quarterlyPrice) : null,
            yearly: variant.recurringPrices[0]?.yearlyPrice ? Number(variant.recurringPrices[0].yearlyPrice) : null,
            biennial: variant.recurringPrices[0]?.biennialPrice ? Number(variant.recurringPrices[0].biennialPrice) : null,
            triennial: variant.recurringPrices[0]?.triennialPrice ? Number(variant.recurringPrices[0].triennialPrice) : null,
          };
          (variant as any).billingType = 'recurring';
        } else {
          // No variant-specific prices - clear to avoid stale data
          variant.recurringPrices = [];
          (variant as any).recurringPricesObj = null;
          (variant as any).billingType = 'one_time';
        }
        return variant;
      });
    }
  }

  if (product) {
    try {
      await prisma.product.update({
        where: { id: product.id },
        data: { viewCount: { increment: 1 } },
      });
    } catch (error) {
      // Silently fail for view count update
    }
  }

  return product;
  } catch (error) {
    console.error('Database connection error:', error);
    return null;
  }
}

async function getRelatedProducts(categoryId: string | null, currentProductId: string) {
  if (!categoryId) return [];

  try {
    return await prisma.product.findMany({
      where: {
        categoryId,
        status: "ACTIVE",
        id: { not: currentProductId },
      },
      include: {
        images: { take: 1 },
        category: true,
      },
      take: 4,
      orderBy: { salesCount: "desc" },
    });
  } catch (error) {
    console.error('Database connection error in getRelatedProducts:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.seoMetadata?.metaTitle || `${product.name} | DeWiN Solutions`,
    description: product.seoMetadata?.metaDescription || product.shortDescription || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const [product] = await Promise.all([
    getProduct(slug),
    getProductDisplaySetting(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  const VSAAS_FALLBACK_FEATURES = [
    "AI-Powered Analytics - Leverage AI to detect threats, analyze behavior, and generate real-time insights.",
    "Cloud Video Storage - Securely store and access recordings on the cloud without local infrastructure.",
    "Real-Time Monitoring - View live camera feeds and receive instant alerts on critical events.",
    "Centralized Dashboard - Manage all cameras, sites, and users from a single unified platform.",
    "Multi-Device Access - Access your surveillance system anytime via web or mobile devices.",
    "ONVIF Camera Support - Seamlessly integrate with all ONVIF-compliant cameras across brands.",
    "Plug & Play Deployment - Quick and hassle-free setup with minimal configuration required.",
    "AI-Based Search - Find footage instantly using smart filters like face, object, or event.",
    "Smart Alerts & Notifications - Get automated alerts via app, email, or SMS for any anomalies.",
    "Scalable Architecture - Easily expand across locations without infrastructure limitations.",
  ];

  const ACRONIS_FEATURES = [
    "Active Protection - Real-time AI-based ransomware and cryptojacking protection for all backed-up workloads.",
    "Multi-Platform Support - Backup for Windows, macOS, Linux, VMware, Hyper-V, Office 365, and mobile devices.",
    "Flexible Subscription Terms - Choose Monthly, 1 Year, 2 Year, or 3 Year licensing to match your budget.",
    "Incremental & Differential Backup - Only changed data is backed up after the first full backup, saving time and storage.",
    "Bare-Metal Recovery - Restore an entire system to the same or dissimilar hardware in minutes.",
    "Cloud & Local Storage - Back up to Acronis Cloud, on-premise appliances, or both simultaneously.",
    "Centralised Management Console - Monitor and manage all protected devices from a single web-based dashboard.",
    "Automated Backup Scheduling - Set and forget — backups run automatically on your defined schedule.",
    "Encryption & Compliance - AES-256 encryption in transit and at rest with compliance-ready audit logs.",
    "Instant Restore - Mount backups as live virtual machines to minimise downtime during recovery.",
    "Office 365 Backup - Full mailbox, OneDrive, SharePoint, and Teams backup with granular item recovery.",
    "Mobile Device Backup - Protect Android and iOS device data including contacts, photos, and app data.",
  ];

  const dbFeatures = (product.features as string[]) || [];
  const features = product.slug === 'vsaas'
    ? VSAAS_FALLBACK_FEATURES
    : product.slug === 'acronis-backup-advanced-spla'
    ? ACRONIS_FEATURES
    : dbFeatures;

  const hasDiscount =
    product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.basePrice)) /
          Number(product.compareAtPrice)) *
          100
      )
    : 0;

  const averageRating = product.averageRating ? Number(product.averageRating) : 4.5;
  const reviewCount = product.reviewCount || 0;

  const isConfigurable = product.productType === "CONFIGURABLE";
  
  // For configurable products, use lowest variant price as starting price
  const startingPrice = isConfigurable && product.variants.length > 0
    ? Math.min(...product.variants.map((v: any) => Number(v.price)))
    : Number(product.basePrice);

  return (
    <div className="min-h-screen bg-white">
      <ProductPageTracker slug={product.slug} name={product.name} />
      {/* Hero Section with Background Image */}
      <section className="relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="relative h-[280px] md:h-[320px] rounded-2xl overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80')`,
              }}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

            <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
              <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight className="h-4 w-4 text-gray-500" />
                <Link href="/products" className="hover:text-white transition-colors">Products</Link>
                {product.category && (
                  <>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                    <Link href={`/categories/${product.category.slug}`} className="hover:text-white transition-colors">
                      {product.category.name}
                    </Link>
                  </>
                )}
                <ChevronRight className="h-4 w-4 text-gray-500" />
                <span className="text-white truncate max-w-[200px]">{product.slug === 'vsaas' ? 'Video Surveillance as a Service (VSaaS)' : product.name}</span>
              </nav>

              <div className="flex items-start gap-4 mb-4">
                {/* Dynamic Product Icon - Light red background with red icon */}
                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-[#E8F0FF] rounded-xl flex items-center justify-center overflow-hidden">
                  {product.images[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    renderIcon(product.icon)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {product.isFeatured && <Badge className="bg-amber-500 text-white text-xs shadow-lg">Featured</Badge>}
                    {hasDiscount && <Badge className="bg-green-500 text-white text-xs shadow-lg">{discountPercent}% OFF</Badge>}
                    <Badge variant="outline" className="text-gray-300 border-gray-600 text-xs">
                      {product.productType.replace("_", " ")}
                    </Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                    {product.slug === 'vsaas' ? 'Video Surveillance as a Service (VSaaS)' : product.name}
                  </h1>
                </div>
              </div>

              {product.slug !== 'vsaas' && product.shortDescription && (
                <p className="text-gray-300 max-w-3xl mb-4 line-clamp-2">{product.shortDescription}</p>
              )}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${star <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-gray-600"}`} />
                      ))}
                    </div>
                    <span className="font-medium text-white">{averageRating.toFixed(1)}</span>
                    <span>({reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{product.salesCount || 0}+ users</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {product.slug === 'vsaas' ? (
                    <Button size="lg" className="bg-[#1E2260] hover:bg-[#161848] text-white" asChild>
                      <a href="/Catalogues.zip" download="Catalogues.zip"><Download className="h-4 w-4 mr-2" />Download Catalogue</a>
                    </Button>
                  ) : !['deco-voice', 'deco-talent'].includes(product.slug) && (
                    <Button size="lg" className="bg-[#1E2260] hover:bg-[#161848] text-white" asChild>
                      <Link href={`#pricing`}><ShoppingBag className="h-4 w-4 mr-2" />Pricing</Link>
                    </Button>
                  )}
                  <Button size="lg" className="bg-transparent text-white hover:bg-white/10 rounded-lg h-12 px-8 border border-white/30 hover:border-white/50" asChild>
                    <Link href="/contact"><MessageCircle className="h-4 w-4 mr-2" />Contact Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-[70px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <Tabs defaultValue={tab || "overview"} className="w-full">
            <TabsList className="h-14 w-full justify-start gap-0 bg-transparent p-0 overflow-x-auto">
              <TabsTrigger
                value="overview"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1E2260] data-[state=active]:text-[#1E2260] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
              >
                <Info className="h-4 w-4 mr-2" />
                Overview and Benefits
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1E2260] data-[state=active]:text-[#1E2260] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Features
              </TabsTrigger>
              {['vsaas', 'deco-voice', 'deco-talent'].includes(product.slug) && (
              <TabsTrigger
                value="solutions"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1E2260] data-[state=active]:text-[#1E2260] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
              >
                <Cloud className="h-4 w-4 mr-2" />
                Solutions
              </TabsTrigger>
              )}
              {!['vsaas', 'deco-voice', 'deco-talent'].includes(product.slug) && (
              <TabsTrigger
                value="pricing"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1E2260] data-[state=active]:text-[#1E2260] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
                id="pricing"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pricing
              </TabsTrigger>
              )}
              <TabsTrigger
                value="support"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1E2260] data-[state=active]:text-[#1E2260] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Support
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1E2260] data-[state=active]:text-[#1E2260] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Resources
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1E2260] data-[state=active]:text-[#1E2260] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium ml-auto"
              >
                <Star className="h-4 w-4 mr-2" />
                Reviews
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">{reviewCount}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <div className="py-10">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0">
                {/* Trust Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 p-6 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">99.99% SLA</p>
                      <p className="text-sm text-gray-500">Guaranteed uptime</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Instant Setup</p>
                      <p className="text-sm text-gray-500">Deploy in minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Headphones className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">24/7 Support</p>
                      <p className="text-sm text-gray-500">Always available</p>
                    </div>
                  </div>
                  {product.slug === 'vsaas' && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Brain className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">AI Intelligence</p>
                        <p className="text-sm text-gray-500">Smart analytics</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-10">
                    {/* Description */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {product.slug === 'tally-cloud-server'
                          ? 'About Tally on Cloud Server'
                          : `About ${product.name}`}
                      </h3>
                      {product.slug === 'tally-cloud-server' ? (
                        <div className="space-y-5">
                          <p className="text-gray-600 leading-relaxed">
                            Tally on Cloud Server enables you to access your Tally anytime, anywhere, on any device with secure, high-speed cloud infrastructure. It ensures seamless performance, real-time collaboration, and zero dependency on local systems—making your accounting smarter and more flexible.
                          </p>
                          <div>
                            <h4 className="text-base font-bold text-gray-900 mb-3">Benefits</h4>
                            <ul className="space-y-2.5">
                              {[
                                { title: "Work from Anywhere", desc: "Access Tally on any device, anytime" },
                                { title: "Cost Saving", desc: "No hardware or IT maintenance required" },
                                { title: "High Speed Performance", desc: "Smooth and lag-free operations" },
                                { title: "Data Security", desc: "Encrypted environment with regular backups" },
                                { title: "Multi-User Access", desc: "Collaborate in real-time" },
                                { title: "Scalable", desc: "Easily upgrade as your business grows" },
                              ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E2260] flex-shrink-0" />
                                  <span className="text-gray-600 text-sm"><span className="font-semibold text-gray-800">{item.title}</span> – {item.desc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : product.slug === 'vsaas' ? (
                        <div className="space-y-8">
                          <div>
                            <h4 className="text-base font-bold text-gray-900 mb-3">Overview</h4>
                            <p className="text-gray-600 leading-relaxed">
                              VSaaS (Video Surveillance as a Service) is an AI-powered cloud video surveillance platform that delivers real-time monitoring, intelligent analytics, and seamless multi-site management — all without the overhead of on-premise infrastructure.
                            </p>
                            <p className="text-sm text-gray-500 border-l-2 border-[#1E2260]/30 pl-3 mt-4">
                              👉 Compatible with all ONVIF-standard IP cameras — works with your existing hardware.
                            </p>
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-gray-900 mb-4">Customer Benefits</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { title: "No CapEx Model", desc: "Eliminate upfront hardware costs with a fully managed cloud solution." },
                                { title: "Anywhere Access", desc: "Monitor your premises from any device, anywhere in the world." },
                                { title: "AI Security", desc: "Proactive threat detection powered by advanced AI algorithms." },
                                { title: "Lower Costs", desc: "Reduce operational expenses compared to traditional CCTV infrastructure." },
                                { title: "Multi-Site Monitoring", desc: "Manage all your locations from a single unified dashboard." },
                                { title: "Fast Investigations", desc: "Quickly search and retrieve footage with intelligent indexing." },
                                { title: "Scalable Solution", desc: "Easily add cameras and users as your business grows." },
                                { title: "Compliance Ready", desc: "Meet industry regulations with encrypted, audit-ready recordings." },
                              ].map((item, i) => (
                                <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:border-[#1E2260]/30 hover:bg-[#EEF2FF]/30 transition-colors">
                                  <div className="font-semibold text-gray-900 text-sm mb-1">{item.title}</div>
                                  <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : product.slug === 'acronis-backup-advanced-spla' ? (
                        <div className="space-y-6">
                          <p className="text-gray-600 leading-relaxed">
                            XcellBackup powered by Acronis delivers enterprise-grade backup with Active Protection — safeguarding workstations, servers, virtual machines, Office 365 mailboxes, and mobile devices with flexible subscription terms.
                          </p>

                          {/* Subscription Licenses */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Subscription Licenses</h4>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {[
                                { label: "Workstations", terms: "Monthly · 1 Year · 2 Year · 3 Year" },
                                { label: "Virtual Machines", terms: "Monthly · 1 Year · 2 Year · 3 Year" },
                                { label: "Physical Servers", terms: "Monthly · 1 Year · 2 Year · 3 Year" },
                                { label: "Virtual Hosts", terms: "1 Year · 2 Year · 3 Year" },
                                { label: "Office 365 Mailboxes", terms: "Monthly · 1 Year · 2 Year · 3 Year" },
                                { label: "Mobile Devices", terms: "Monthly · 1 Year · 2 Year · 3 Year" },
                              ].map((item, i) => (
                                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#1E2260] flex-shrink-0" />
                                  <div>
                                    <div className="text-sm font-semibold text-gray-800">{item.label}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{item.terms}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Managed Services */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Managed Backup Services</h4>
                            <div className="flex flex-wrap gap-2">
                              {["Cloud Storage", "Per Virtual Host", "Per Server / VM", "Per Workstation", "Per Office 365"].map((s, i) => (
                                <span key={i} className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 rounded-full">{s}</span>
                              ))}
                            </div>
                          </div>

                          {/* Contract Terms */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Contract Terms</h4>
                            <ul className="space-y-2">
                              {[
                                "Advance payment with one-time setup charges",
                                "30 days advance termination notice required upon completion of subscription term",
                                "Delivery within 2 working days from PO + advance payment receipt",
                                "Overage billing charged as actuals",
                                "18% GST applicable · No TDS to be deducted on software licenses",
                              ].map((term, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                  {term}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : product.slug === 'microsoft-365-services' ? (
                        <Microsoft365Description />
                      ) : product.slug === 'deco-talent' ? (
                        <DecoTalentDescription />
                      ) : product.slug === 'deco-voice' ? (
                        <DecoVoiceDescription />
                      ) : product.description ? (
                        <div
                          className="prose prose-gray prose-headings:font-semibold prose-headings:text-gray-900 prose-strong:text-gray-900 prose-li:text-gray-600 prose-p:text-gray-600 max-w-none"
                          dangerouslySetInnerHTML={{ __html: marked(product.description) as string }}
                        />
                      ) : (
                        <p className="text-gray-600">{product.shortDescription || "No description available."}</p>
                      )}
                    </div>

                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Product Info */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Product Info</h3>
                      <div className="space-y-3">
                        {product.sku && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">SKU</span>
                            <span className="font-mono text-gray-900">{product.sku}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Type</span>
                          <span className="text-gray-900">{product.productType.replace("_", " ")}</span>
                        </div>
                        {product.category && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Category</span>
                            <Link href={`/categories/${product.category.slug}`} className="text-[#1E2260] hover:underline">
                              {product.category.name}
                            </Link>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Delivery</span>
                          <span className="text-gray-900">{product.isDigital ? "Instant" : "Shipping"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="mt-0">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-10">
                    <Badge className="mb-4 bg-[#1E2260]/10 text-[#1E2260] hover:bg-[#1E2260]/10">
                      <BadgeCheck className="h-4 w-4 mr-1" /> Features
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">Packed with powerful features to help your business succeed.</p>
                  </div>

                  {features.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {features.map((feature, index) => {
                        const icons = [Video, HardDrive, LayoutDashboard, Monitor, GlobeIcon, Smartphone, Activity, BarChart3, ScrollText, Wifi, Shield, Cloud, Database, Lock, Server];
                        const Icon = icons[index % icons.length];
                        const dashIdx = feature.indexOf(' - ');
                        const title = dashIdx !== -1 ? feature.slice(0, dashIdx) : feature;
                        const desc = dashIdx !== -1 ? feature.slice(dashIdx + 3) : null;
                        return (
                          <div key={index} className="group relative bg-white rounded-2xl border border-gray-100 hover:border-[#1E2260]/20 hover:shadow-lg hover:shadow-[#1E2260]/5 transition-all duration-300 p-5 flex gap-4 items-start">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E2260] to-[#1E2260] flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 leading-snug">{title}</p>
                              {desc && <p className="text-xs text-gray-500 mt-1 leading-snug">{desc}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500">No features listed for this product.</div>
                  )}
                </div>
              </TabsContent>

              {/* Solutions Tab */}
              <TabsContent value="solutions" className="mt-0">
                <div className="max-w-5xl mx-auto">

                  {/* ── Deco Voice Solutions ── */}
                  {product.slug === 'deco-voice' && (
                    <>
                    <div className="text-center mb-10">
                      <Badge className="mb-4 bg-[#1E2260]/10 text-[#1E2260] hover:bg-[#1E2260]/10">
                        <Mic className="h-4 w-4 mr-1" /> Shared LLM Pricing
                      </Badge>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Business Conversations. Fully Automated.</h2>
                      <p className="text-gray-500 max-w-xl mx-auto">Scalable AI Voice Infrastructure — secure, cost-effective, built for inbound &amp; outbound.</p>
                    </div>

                    {/* Pricing tiers */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
                      {[
                        { tier: "Starter",         price: "₹8",  unit: "/min", desc: "Small teams starting with AI voice" },
                        { tier: "Growth",          price: "₹7",  unit: "/min", desc: "Growing teams with regular call volume" },
                        { tier: "Business",        price: "₹6",  unit: "/min", desc: "Businesses needing priority infrastructure" },
                        { tier: "Enterprise",      price: "₹5",  unit: "/min", desc: "Large-scale private AI deployment" },
                        { tier: "Enterprise Plus", price: "₹75K",unit: "",     desc: "Custom setup, CRM, security & voice infra", highlight: true },
                      ].map((t) => (
                        <div key={t.tier} className={`rounded-2xl border p-4 text-center flex flex-col gap-1 ${t.highlight ? "bg-[#1E2260] border-[#1E2260] text-white" : "bg-white border-gray-200"}`}>
                          <p className={`text-xs font-bold uppercase tracking-wide ${t.highlight ? "text-[#4A9FD5]" : "text-gray-500"}`}>{t.tier}</p>
                          <p className={`text-2xl font-black ${t.highlight ? "text-white" : "text-[#1E2260]"}`}>{t.price}<span className={`text-sm font-semibold ${t.highlight ? "text-[#4A9FD5]" : "text-gray-400"}`}>{t.unit}</span></p>
                          <p className={`text-[10px] leading-relaxed ${t.highlight ? "text-blue-200" : "text-gray-500"}`}>{t.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Enterprise benefits */}
                    <div className="mb-10 p-4 rounded-xl bg-[#F8F9FF] border border-[#E8EEFF]">
                      <span className="text-xs font-bold text-gray-700 mr-2">Enterprise benefits:</span>
                      <span className="text-xs text-gray-500">Private deployment · Dedicated infrastructure · SLA support · Custom reporting · Security configuration · CRM integration</span>
                    </div>

                    {/* Deployment options */}
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Deployment Options</h3>
                    <div className="grid sm:grid-cols-2 gap-6 mb-10">
                      {/* Private LLM */}
                      <div className="p-6 rounded-2xl border border-[#E8EEFF] bg-gradient-to-br from-[#EEF2FF] to-white">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[#1E2260] font-black text-lg">01</span>
                          <h4 className="font-bold text-gray-900">PRIVATE LLM</h4>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Your AI. Your Infrastructure. <span className="inline-block ml-1 px-2 py-0.5 rounded-full bg-[#1E2260] text-white text-[10px] font-semibold">Operating on NVIDIA GPU</span></p>
                        <ul className="space-y-2">
                          {["Complete Data Privacy", "Internal Infrastructure Hosting", "Custom AI Training", "Enterprise-Grade Security"].map((b) => (
                            <li key={b} className="flex items-center gap-2 text-xs text-gray-700">
                              <CheckCircle className="h-3.5 w-3.5 text-[#1E2260] shrink-0" />{b}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Shared Cloud */}
                      <div className="p-6 rounded-2xl border border-gray-200 bg-white">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[#1E2260] font-black text-lg">02</span>
                          <h4 className="font-bold text-gray-900">SHARED CLOUD</h4>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">Deploy Faster. Scale Smarter. <span className="inline-block ml-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-semibold">Hosted on GCP</span></p>
                        <p className="text-[10px] text-[#4A9FD5] font-medium mb-4">Best For: Startups · SMBs · D2C Brands · Retail Businesses</p>
                        <ul className="space-y-2">
                          {["Instant Deployment", "No Infrastructure Investment", "Flexible Pay-As-You-Go Model", "Instant Scalability"].map((b) => (
                            <li key={b} className="flex items-center gap-2 text-xs text-gray-700">
                              <CheckCircle className="h-3.5 w-3.5 text-[#1E2260] shrink-0" />{b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Link href={`/products/deco-voice/configure`}>
                      <button className="w-full sm:w-auto mx-auto flex h-11 px-10 bg-[#1E2260] hover:bg-[#161848] text-white font-semibold rounded-xl items-center justify-center gap-2 transition-colors shadow-lg shadow-[#1E2260]/20">
                        Get Started <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                    </>
                  )}

                  {/* ── Deco Talent Solutions ── */}
                  {product.slug === 'deco-talent' && (
                    <>
                    <div className="text-center mb-10">
                      <Badge className="mb-4 bg-[#1E2260]/10 text-[#1E2260] hover:bg-[#1E2260]/10">
                        <Brain className="h-4 w-4 mr-1" /> AI Interview Bot
                      </Badge>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">Pre-Paid Plans</h2>
                      <p className="text-gray-500 max-w-xl mx-auto">Pay per candidate — no monthly commitment, no seat restrictions, 1 year validity.</p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                      <div className="group p-8 bg-gradient-to-br from-[#EEF2FF] to-white rounded-2xl border border-[#E8F0FF] hover:border-[#1E2260]/40 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E2260] to-[#2B3080] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Brain className="h-7 w-7" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">AI Interview Bot</h3>
                            <p className="text-[#4A9FD5] font-semibold text-sm">Pre-Paid · 1 Year Validity</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                          {[
                            { name: "Profile Scoring", price: "₹20", unit: "per profile" },
                            { name: "Screening Call", price: "₹60", unit: "per call (5 min)" },
                            { name: "AI Interview", price: "₹500", unit: "per interview" },
                          ].map((item) => (
                            <div key={item.name} className="rounded-xl bg-white border border-[#E8EEFF] p-4 text-center shadow-sm">
                              <p className="text-xs font-semibold text-gray-600 mb-1">{item.name}</p>
                              <p className="text-2xl font-black text-[#1E2260]">{item.price}</p>
                              <p className="text-[10px] text-[#4A9FD5] font-medium mt-0.5">{item.unit}</p>
                            </div>
                          ))}
                        </div>

                        <ul className="space-y-3 mb-8">
                          {[
                            "End client rates: Low (<2,000 min) ₹8/min · Moderator ₹7 · High ₹6 · Enterprise ₹5",
                            "One-time setup ₹75,000 – ₹3,00,000 (Telephony, Use case, Dashboard)",
                            "CRM integration — Custom pricing",
                            "1 Year Validity on all pre-paid packs",
                            "Unlimited job postings",
                            "Unlimited candidate data & HR seats",
                            "Taxes as applicable · Starter packs from ₹5,000",
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                              <CheckCircle className="h-4 w-4 text-[#1E2260] flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>

                        <Link href={`/products/deco-talent/configure`}>
                          <button className="w-full h-11 bg-[#1E2260] hover:bg-[#2B3080] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                            Buy Now <ArrowRight className="h-4 w-4" />
                          </button>
                        </Link>
                      </div>
                    </div>
                    </>
                  )}

                  {/* ── VSaaS Solutions ── */}
                  {product.slug === 'vsaas' && (<>
                  <div className="text-center mb-10">
                    <Badge className="mb-4 bg-[#1E2260]/10 text-[#1E2260] hover:bg-[#1E2260]/10">
                      <Cloud className="h-4 w-4 mr-1" /> Solutions
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose your deployment model</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">Select the VSaaS solution that best fits your infrastructure and business requirements.</p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* VSaaS On Cloud */}
                    <div className="group p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                        <Cloud className="h-7 w-7" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">VSaaS On Cloud</h3>
                      <p className="text-gray-600 mb-6">
                        Fully managed cloud-hosted video surveillance. No on-site servers required — store, manage, and access all footage securely from anywhere.
                      </p>
                      <ul className="space-y-3 mb-8">
                        {[
                          "Zero infrastructure investment",
                          "Automatic updates & maintenance",
                          "Scalable cloud storage",
                          "Access from any device, anywhere",
                          "Pay-as-you-grow model",
                          "99.99% uptime SLA",
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link href="/products/vsaas/configure?showOnly=cloud">
                        <button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                          Get Started <ArrowRight className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>

                    {/* VSaaS On-Prem */}
                    <div className="group p-8 bg-gradient-to-br from-[#EEF2FF] to-white rounded-2xl border border-[#E8F0FF] hover:border-[#1E2260]/40 hover:shadow-xl transition-all duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E2260] to-[#1E2260] flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                        <Server className="h-7 w-7" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">VSaaS On-Prem</h3>
                      <p className="text-gray-600 mb-6">
                        Deploy on your own infrastructure for maximum control, data privacy, and compliance. All the power of VSaaS — fully within your network.
                      </p>
                      <ul className="space-y-3 mb-8">
                        {[
                          "Full data sovereignty & privacy",
                          "Works in air-gapped environments",
                          "Integrates with existing hardware",
                          "Customisable to your IT policies",
                          "No internet dependency",
                          "Dedicated on-site support",
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 text-[#1E2260] flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link href="/products/vsaas/configure?deployment=onprem&showOnly=onprem">
                        <button className="w-full h-11 bg-[#1E2260] hover:bg-[#1E2260] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                          Get Started <ArrowRight className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                  </>)}

                </div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="mt-0">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-6">
                    <Badge className="mb-4 bg-[#1E2260]/10 text-[#1E2260] hover:bg-[#1E2260]/10">
                      <Rocket className="h-4 w-4 mr-1" /> Pricing
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      {isConfigurable ? "Choose your plan" : "Simple pricing"}
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                      {isConfigurable 
                        ? "Flexible pricing options to fit your needs."
                        : "One straightforward price, no hidden fees."}
                    </p>
                  </div>

                  {/* Acronis custom configurator */}
                  {product.slug === 'acronis-backup-advanced-spla' && (
                    <AcronisConfigurator productSlug={product.slug} />
                  )}

                  {/* Microsoft 365 custom configurator */}
                  {product.slug === 'microsoft-365-services' && (
                    <Microsoft365Configurator productSlug={product.slug} />
                  )}

                  {/* Variants Pricing */}
                  {product.slug !== 'acronis-backup-advanced-spla' && product.slug !== 'microsoft-365-services' && product.variants && product.variants.length > 0 ? (
                    product.slug === 'tally-cloud-server' ? (
                      <div className="space-y-3">
                        {product.variants.map((variant: any) => {
                          const variantAttrs = variant.attributes as Record<string, string> || {};
                          const billingType = variantAttrs.billingType || 'RECURRING';
                          const isOneTime = billingType === 'ONE_TIME';
                          const reservedKeys = ['billingType','setupFee','monthlyPrice','biMonthlyPrice','quarterlyPrice','fourMonthlyPrice','semiAnnualPrice','triAnnualPrice','yearlyPrice','biennialPrice','triennialPrice','monthlySetupFee','biMonthlySetupFee','quarterlySetupFee','fourMonthlySetupFee','semiAnnualSetupFee','triAnnualSetupFee','yearlySetupFee','biennialSetupFee','triennialSetupFee','shortDesc','annualSavings','quarterlySavings','semiAnnualSavings','users','description','annualPrice'];
                          const allSpecs = Object.entries(variantAttrs).filter(([key]) => !reservedKeys.includes(key));
                          const displayPrice = isOneTime ? Number(variant.price || 0) : (variant.recurringPricesObj?.monthly || Number(variant.price || 0));
                          const shortDesc = (variantAttrs.shortDesc || variant.shortDescription || '').replace(/\*/g, '').trim();
                          const userCount = variantAttrs.users || '';
                          // Extract tagline only — strip leading "For X Users - " prefix so we don't repeat what's already shown
                          const tagline = shortDesc.replace(/^For\s+[\d\-–]+\s*[Uu]sers?\s*[-–]?\s*/i, '').trim();
                          return (
                            <div
                              key={variant.id}
                              className={`rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-px ${
                                variant.isDefault
                                  ? 'shadow-lg ring-2 ring-[#1E2260]'
                                  : 'shadow-sm border border-gray-200 hover:border-[#1E2260]/30'
                              }`}
                            >
                              <div className="flex items-stretch bg-white">
                                {/* Left: User count panel */}
                                <div className={`flex flex-col items-center justify-center px-6 py-6 min-w-[110px] ${
                                  variant.isDefault ? 'bg-[#1E2260] text-white' : 'bg-gray-50 text-gray-900'
                                }`}>
                                  {variant.isDefault && (
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#D0DEFF] mb-2">Popular</span>
                                  )}
                                  <span className="text-3xl font-black leading-none">{userCount || '—'}</span>
                                  <span className={`text-[10px] font-semibold uppercase tracking-widest mt-1.5 ${variant.isDefault ? 'text-[#D0DEFF]' : 'text-gray-400'}`}>Users</span>
                                </div>

                                {/* Middle: Plan info + description + specs */}
                                <div className="flex-1 px-6 py-5 border-l border-gray-100">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{variant.name}</h3>
                                  </div>
                                  {tagline && (
                                    <p className="text-sm text-gray-500 leading-relaxed mb-3">{tagline}</p>
                                  )}
                                  {allSpecs.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {allSpecs.map(([key, value]) => (
                                        <span key={key} className={`inline-flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5 font-medium border ${
                                          variant.isDefault
                                            ? 'bg-[#EEF2FF] text-[#1E2260] border-[#E8F0FF]'
                                            : 'bg-gray-50 text-gray-700 border-gray-200'
                                        }`}>
                                          <span className="opacity-60">{key}</span>
                                          <span className="font-bold">{String(value).replace(/\*/g, '').trim()}</span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Right: Price + CTA */}
                                <div className={`flex flex-col items-end justify-center gap-4 px-6 py-5 border-l min-w-[190px] ${
                                  variant.isDefault ? 'bg-[#EEF2FF]/40 border-[#1E2260]/10' : 'bg-gray-50/80 border-gray-100'
                                }`}>
                                  <div className="text-right">
                                    <div className="flex items-baseline justify-end gap-1 whitespace-nowrap">
                                      <span className={`text-3xl font-black tracking-tight ${variant.isDefault ? 'text-[#1E2260]' : 'text-gray-900'}`}>₹{displayPrice.toLocaleString('en-IN')}</span>
                                      <span className="text-sm text-gray-400 font-medium">{isOneTime ? '' : '/mo'}</span>
                                    </div>
                                    {!isOneTime && <p className="text-xs text-gray-400 mt-0.5">Billed monthly</p>}
                                  </div>
                                  <Link
                                    href={`/products/${product.slug}/configure?variant=${variant.id}`}
                                    className="w-full text-center text-sm font-bold px-5 py-2.5 rounded-xl transition-all bg-[#1E2260] hover:bg-[#1E2260] text-white shadow-sm whitespace-nowrap"
                                  >
                                    Get Started →
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                    <div className="space-y-4">
                      {product.variants.map((variant: any) => {
                        const rp = variant.recurringPrices?.[0];
                        const reservedKeys = [
                          'billingType', 'setupFee',
                          'monthlyPrice', 'biMonthlyPrice', 'quarterlyPrice', 'fourMonthlyPrice',
                          'semiAnnualPrice', 'triAnnualPrice', 'yearlyPrice', 'biennialPrice', 'triennialPrice',
                          'monthlySetupFee', 'biMonthlySetupFee', 'quarterlySetupFee', 'fourMonthlySetupFee',
                          'semiAnnualSetupFee', 'triAnnualSetupFee', 'yearlySetupFee', 'biennialSetupFee', 'triennialSetupFee'
                        ];
                        const variantAttrs = variant.attributes as Record<string, string> || {};
                        const billingType = variantAttrs.billingType || 'RECURRING';
                        const isOneTime = billingType === 'ONE_TIME';
                        const allSpecs = Object.entries(variantAttrs).filter(([key]) => !reservedKeys.includes(key));
                        const displayPrice = isOneTime
                          ? (variant.price ? Number(variant.price) : 0)
                          : (variant.recurringPricesObj?.monthly || variant.price ? Number(variant.price) : 0);

                        return (
                          <div
                            key={variant.id}
                            className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:shadow-xl ${
                              variant.isDefault
                                ? "border-[#1E2260] shadow-lg"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {variant.isDefault && (
                              <div className="bg-[#1E2260] text-white text-center text-xs font-bold py-2 tracking-widest uppercase">
                                Most Popular Plan
                              </div>
                            )}
                            <div className="bg-white">
                              <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-4 border-b border-gray-100 ${variant.isDefault ? "bg-[#1E2260]/5" : "bg-gray-50"}`}>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">{variant.name}</h3>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <div className={`text-3xl font-extrabold ${variant.isDefault ? "text-[#1E2260]" : "text-gray-900"}`}>
                                      ₹{displayPrice.toLocaleString("en-IN")}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">{isOneTime ? 'one-time' : '/month'}</div>
                                  </div>
                                  <Button size="lg" className="h-12 px-8 font-semibold text-base whitespace-nowrap rounded-xl bg-[#1E2260] hover:bg-[#161848] text-white shadow-md" asChild>
                                    <Link href={`/products/${product.slug}/configure?variant=${variant.id}`}>
                                      Get Started <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                              {allSpecs.length > 0 && (
                                <div className="px-4 py-4 border-t border-gray-100">
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Specifications</p>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {allSpecs.map(([key, value]) => (
                                      <div key={key} className="flex items-start gap-2.5">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">{key}</p>
                                          <p className="text-sm text-gray-900 font-semibold leading-snug">{value}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    )
                  ) : product.configs && product.configs.length > 0 ? (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Customize Your Plan</h3>
                            <p className="text-gray-500 text-sm mt-1">Select configurations that best fit your needs</p>
                          </div>
                          <Badge className="bg-[#1E2260] text-white">{product.configs.length} Options Available</Badge>
                        </div>
                        <Button size="lg" className="w-full bg-[#1E2260] hover:bg-[#161848] text-white" asChild>
                          <Link href={`/products/${product.slug}/configure`}>
                            Configure Now <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                      
                      {/* Show Config Groups */}
                      {Object.entries(
                        product.configs.reduce((acc: any, config: any) => {
                          const group = config.configGroup || 'Other';
                          if (!acc[group]) acc[group] = [];
                          acc[group].push(config);
                          return acc;
                        }, {})
                      ).map(([group, configs]: [string, any]) => (
                        <div key={group} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-900">{group}</h4>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {configs.map((config: any) => (
                              <div key={config.id} className="flex items-center justify-between px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900">{config.name}</p>
                                  {config.description && <p className="text-sm text-gray-500">{config.description}</p>}
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-[#1E2260]">
                                    {config.basePrice > 0 ? `${config.basePrice}` : 'Included'}
                                    {config.billingCycle === 'MONTHLY' && <span className="text-sm text-gray-500 font-normal">/mo</span>}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    product.slug !== 'acronis-backup-advanced-spla' && product.slug !== 'microsoft-365-services' ? (
                    <div className="max-w-md mx-auto bg-gray-900 rounded-3xl p-10 text-center">
                      <p className="text-2xl font-semibold text-white mb-2">{formatPrice(startingPrice)}</p>
                      <p className="text-gray-400 mb-8">Simple, straightforward pricing</p>
                      <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 h-14 w-full" asChild>
                        <Link href="/contact"><MessageCircle className="h-5 w-5 mr-2" /> Contact Us</Link>
                      </Button>
                    </div>
                    ) : null
                  )}

                  {/* Add-ons */}
                  {(product.addons.length > 0 || product.configs.length > 0) && (
                    <div className="mt-16">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        {product.addons.length > 0 ? 'Available Add-ons' : 'Available Configurations'}
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {product.addons.length > 0 ? (
                          product.addons.map((addon: any) => (
                            <div key={addon.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#1E2260]/30 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {addon.pricingType === "ONE_TIME" ? "One-time" : addon.pricingType === "RECURRING_MONTHLY" ? "Monthly" : "Yearly"}
                                </Badge>
                              </div>
                              {addon.description && <p className="text-sm text-gray-500 mb-3">{addon.description}</p>}
                              <p className="text-2xl font-bold text-[#1E2260]">{formatPrice(Number(addon.price))}</p>
                            </div>
                          ))
                        ) : (
                          product.configs.slice(0, 9).map((config: any) => (
                            <div key={config.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#1E2260]/30 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900">{config.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {config.billingCycle === 'ONE_TIME' ? 'One-time' : config.isRecurring ? 'Monthly' : 'N/A'}
                                </Badge>
                              </div>
                              {config.description && <p className="text-sm text-gray-500 mb-3">{config.description}</p>}
                              <p className="text-2xl font-bold text-[#1E2260]">
                                {config.basePrice > 0 ? formatPrice(Number(config.basePrice)) : 'Included'}
                                {config.isRecurring && <span className="text-sm font-normal text-gray-500">/mo</span>}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-0">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                    <Button>Write a Review</Button>
                  </div>

                  {/* Rating Summary */}
                  <div className="flex items-center gap-10 p-8 bg-gray-50 rounded-2xl mb-10">
                    <div className="text-center">
                      <p className="text-6xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                      <div className="flex justify-center my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-5 w-5 ${star <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <p className="text-gray-500">{reviewCount} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="w-3 text-sm text-gray-600">{rating}</span>
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${rating === 5 ? 65 : rating === 4 ? 25 : 10}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews */}
                  {product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.map((review: any) => (
                        <div key={review.id} className="p-6 bg-white border border-gray-100 rounded-2xl">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-600">
                              {review.user?.name?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-gray-900">{review.user?.name || "Anonymous"}</p>
                                <span className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className={`h-4 w-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                                ))}
                              </div>
                              {review.title && <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>}
                              <p className="text-gray-600">{review.content}</p>
                              <div className="flex items-center gap-4 mt-4">
                                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
                                  <ThumbsUp className="h-4 w-4" /> Helpful ({review.helpfulCount || 0})
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No reviews yet. Be the first to review!</p>
                      <Button>Write a Review</Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Support Tab */}
              <TabsContent value="support" className="mt-0">
                <div className="max-w-4xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Support Options</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-5 bg-white border rounded-2xl">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">24/7 Technical Support</p>
                            <p className="text-sm text-gray-500">Round-the-clock assistance via phone, email, and chat</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-5 bg-white border rounded-2xl">
                          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Documentation & Guides</p>
                            <p className="text-sm text-gray-500">Comprehensive docs, tutorials, and API references</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-5 bg-white border rounded-2xl">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Community Forum</p>
                            <p className="text-sm text-gray-500">Connect with other users and share knowledge</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Policies</h3>
                      <Accordion type="single" collapsible className="space-y-3">
                        <AccordionItem value="refund" className="border rounded-2xl px-5">
                          <AccordionTrigger className="hover:no-underline">Refund Policy</AccordionTrigger>
                          <AccordionContent className="text-gray-500">
                            We offer a 30-day money-back guarantee on all products. If you&apos;re not satisfied, contact our support team for a full refund.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="privacy" className="border rounded-2xl px-5">
                          <AccordionTrigger className="hover:no-underline">Privacy Policy</AccordionTrigger>
                          <AccordionContent className="text-gray-500">
                            Your data privacy is our priority. We comply with GDPR, CCPA, and other data protection regulations.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="sla" className="border rounded-2xl px-5">
                          <AccordionTrigger className="hover:no-underline">Service Level Agreement</AccordionTrigger>
                          <AccordionContent className="text-gray-500">
                            We guarantee 99.99% uptime with our enterprise SLA. Downtime credits are automatically applied.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="mt-0">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Documentation & Resources</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Getting Started Guide", type: "PDF • 2.4 MB", icon: FileText, color: "blue" },
                      { title: "API Documentation", type: "Online", icon: ExternalLink, color: "green" },
                      { title: "Video Tutorials", type: "12 videos", icon: Play, color: "amber" },
                      { title: "Case Studies", type: "PDF • 5.1 MB", icon: FileText, color: "purple" },
                      { title: "FAQ", type: "Online", icon: MessageSquare, color: "red" },
                      { title: "Release Notes", type: "Online", icon: FileText, color: "cyan" },
                    ].map((resource, index) => (
                      <a key={index} href="#" className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#1E2260]/30 hover:shadow-md transition-all group">
                        <div className={`w-12 h-12 rounded-xl bg-${resource.color}-100 flex items-center justify-center`}>
                          <resource.icon className={`h-6 w-6 text-${resource.color}-500`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover:text-[#1E2260] transition-colors">{resource.title}</p>
                          <p className="text-sm text-gray-500">{resource.type}</p>
                        </div>
                        <Download className="h-5 w-5 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

    </div>
  );
}

// ─── Microsoft 365 Services — custom rich description ────────────────────────
function Microsoft365Description() {
  const smbPlans = [
    {
      name: "Business Basic",
      features: ["Microsoft Teams", "1 TB OneDrive cloud storage", "Web versions of Office apps", "Business email (Exchange Online)"],
    },
    {
      name: "Business Standard",
      features: ["Everything in Basic", "Full desktop Office apps (Word, Excel, PowerPoint)", "HD video meetings", "Webinar hosting"],
    },
    {
      name: "Business Premium",
      features: ["Everything in Standard", "Enterprise-grade security", "Intune device management", "Azure AD Premium P1"],
    },
  ];

  const enterprisePlans = [
    { name: "Microsoft 365 E1", desc: "Cloud productivity & collaboration without desktop apps" },
    { name: "Microsoft 365 E3", desc: "Full Office suite, compliance tools & advanced security" },
    { name: "Microsoft 365 E5", desc: "Complete enterprise security, analytics & voice capabilities" },
    { name: "Apps for Enterprise", desc: "Always up-to-date Office apps across five devices per user" },
  ];

  const securityFeatures = [
    { name: "Microsoft Defender", desc: "Advanced threat protection against malware, phishing & ransomware" },
    { name: "Azure Active Directory", desc: "Centralised identity & access management with Multi-Factor Authentication" },
    { name: "Enterprise Mobility + Security", desc: "Unified endpoint management and data loss prevention" },
  ];

  const backupOptions = [
    { name: "Office 365 Backup", desc: "Automated, point-in-time mailbox and OneDrive backups" },
    { name: "DropSuite Email Archiving", desc: "Tamper-proof, searchable email archive for compliance" },
    { name: "XcellArchive", desc: "Long-term archiving with rapid eDiscovery and audit trail support" },
  ];

  return (
    <div className="space-y-10">
      {/* Lead */}
      <p className="text-gray-600 leading-relaxed text-base">
        Microsoft 365 Services delivers a complete suite of cloud-powered productivity and security tools designed to keep your business running at its best — from anywhere, on any device.
      </p>

      {/* SMB Plans */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">SMB Plans</span>
          <span className="text-xs text-gray-400">· Up to 300 users</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Flexible plans built for small and medium businesses.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {smbPlans.map((plan) => (
            <div key={plan.name} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">{plan.name}</p>
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise Plans */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Enterprise Plans</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Scalable solutions for larger organisations.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {enterprisePlans.map((plan) => (
            <div key={plan.name} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Building2 className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{plan.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Identity */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Security & Identity</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Protect your organisation with built-in intelligent security.</p>
        <div className="space-y-3">
          {securityFeatures.map((f) => (
            <div key={f.name} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{f.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exchange Online */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Exchange Online</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Professional business email hosted in Microsoft's secure cloud.</p>
        <div className="flex flex-wrap gap-2">
          {["Scalable mailbox storage (50 GB – unlimited)", "Built-in anti-virus & anti-spam filtering", "99.9% uptime SLA", "Globally distributed infrastructure"].map((item) => (
            <span key={item} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-xs font-medium text-gray-600">
              <Check className="h-3 w-3 text-gray-400" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Backup & Archiving */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Backup & Archiving</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Never lose critical business communications.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {backupOptions.map((opt) => (
            <div key={opt.name} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="font-semibold text-gray-900 text-sm mb-1">{opt.name}</p>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
