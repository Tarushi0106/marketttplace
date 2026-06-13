import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding DeWiN AI products...");

  // Ensure AI category exists
  const aiCategory = await prisma.category.upsert({
    where: { slug: "ai" },
    update: {},
    create: {
      name: "AI Products",
      slug: "ai",
      description: "Artificial intelligence and automation solutions by DeWiN",
      icon: "Brain",
      iconBgColor: "#E8F0FF",
      isTrending: true,
      sortOrder: 6,
    },
  });
  console.log("AI category ready:", aiCategory.id);

  // ─── 1. Deco Voice ──────────────────────────────────────────────
  const decoVoice = await prisma.product.upsert({
    where: { slug: "deco-voice" },
    update: {
      status: "ACTIVE",
      isFeatured: true,
    },
    create: {
      categoryId: aiCategory.id,
      name: "Deco Voice",
      slug: "deco-voice",
      icon: "Mic",
      shortDescription: "AI-powered voice bot for automated customer interactions and 24/7 support",
      description:
        "Deploy intelligent voice bots that handle customer queries, route calls, and provide round-the-clock automated support with natural language understanding in 30+ languages. Built on DeWiN's AI infrastructure, Deco Voice integrates with your existing phone systems and CRMs to deliver human-like conversations at scale.",
      features: [
        "Natural Language Understanding (NLU)",
        "30+ Language Support",
        "24/7 Automated Call Handling",
        "CRM & Helpdesk Integration",
        "Real-time Call Analytics",
        "Custom Voice Personas",
        "Escalation to Live Agent",
        "DTMF & Voice Input",
      ],
      specifications: {
        "Supported Languages": "30+",
        "Avg Response Time": "< 500ms",
        "Uptime SLA": "99.9%",
        "Integration": "REST API / Webhook",
        "Channels": "Phone, SIP, WebRTC",
      },
      sku: "DECO-VOICE-001",
      basePrice: 5,
      productType: "CONFIGURABLE",
      status: "ACTIVE",
      isFeatured: true,
      isDigital: true,
      requiresShipping: false,
      trackInventory: false,
      stockQuantity: 9999,
      pricingDisplayFormat: "TABLE",
    },
  });

  await Promise.all([
    prisma.productVariant.upsert({
      where: { sku: "DECO-VOICE-SHARED" },
      update: {},
      create: {
        productId: decoVoice.id,
        name: "Shared LLM",
        sku: "DECO-VOICE-SHARED",
        price: 5,
        attributes: { billing: "per minute", model: "Shared LLM" },
        isDefault: true,
        isActive: true,
        sortOrder: 0,
      },
    }),
    prisma.productVariant.upsert({
      where: { sku: "DECO-VOICE-DEDICATED" },
      update: {},
      create: {
        productId: decoVoice.id,
        name: "Dedicated LLM",
        sku: "DECO-VOICE-DEDICATED",
        price: 15,
        attributes: { billing: "per minute", model: "Dedicated LLM" },
        isDefault: false,
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.productVariant.upsert({
      where: { sku: "DECO-VOICE-ENTERPRISE" },
      update: {},
      create: {
        productId: decoVoice.id,
        name: "Enterprise",
        sku: "DECO-VOICE-ENTERPRISE",
        price: 9999,
        attributes: { billing: "per month", model: "Dedicated + Priority Support" },
        isDefault: false,
        isActive: true,
        sortOrder: 2,
      },
    }),
  ]);
  console.log("Deco Voice created:", decoVoice.id);

  // ─── 2. Deco Talent ─────────────────────────────────────────────
  const decoTalent = await prisma.product.upsert({
    where: { slug: "deco-talent" },
    update: {
      status: "ACTIVE",
      isFeatured: true,
    },
    create: {
      categoryId: aiCategory.id,
      name: "Deco Talent",
      slug: "deco-talent",
      icon: "Users",
      shortDescription: "AI-powered talent screening platform — resume scoring, voice interviews, and 10-parameter candidate reports",
      description:
        "Deco Talent automates your entire hiring pipeline — from AI resume scoring to voice-conducted interviews and detailed 10-parameter candidate evaluation reports. Screen hundreds of applicants instantly, in 30+ languages, with zero recruiter fatigue. Seamlessly integrates with your ATS and CRM for end-to-end recruitment automation.",
      features: [
        "AI Resume & Profile Scoring",
        "Automated Candidate Shortlisting",
        "AI-Conducted Voice Interviews",
        "10-Parameter Candidate Reports",
        "Video + Transcript Delivery",
        "30+ Language Support",
        "ATS & CRM Integration",
        "Custom Evaluation Criteria",
        "Bulk Candidate Processing",
        "Compliance-Ready Data Handling",
      ],
      specifications: {
        "Scoring Parameters": "10",
        "Languages Supported": "30+",
        "Interview Duration": "5–30 min",
        "Report Delivery": "Instant",
        "Integration": "REST API / Webhook",
        "Data Security": "SOC2 Compliant",
      },
      sku: "DECO-TALENT-001",
      basePrice: 20,
      productType: "CONFIGURABLE",
      status: "ACTIVE",
      isFeatured: true,
      isDigital: true,
      requiresShipping: false,
      trackInventory: false,
      stockQuantity: 9999,
      pricingDisplayFormat: "TABLE",
    },
  });

  await Promise.all([
    prisma.productVariant.upsert({
      where: { sku: "DECO-TALENT-PROFILE" },
      update: {},
      create: {
        productId: decoTalent.id,
        name: "Profile Scoring",
        sku: "DECO-TALENT-PROFILE",
        price: 20,
        attributes: { billing: "per profile", description: "AI resume analysis and scoring" },
        isDefault: true,
        isActive: true,
        sortOrder: 0,
      },
    }),
    prisma.productVariant.upsert({
      where: { sku: "DECO-TALENT-SCREENING" },
      update: {},
      create: {
        productId: decoTalent.id,
        name: "Screening Call (5 min)",
        sku: "DECO-TALENT-SCREENING",
        price: 50,
        attributes: { billing: "per call", description: "5-minute AI voice screening interview" },
        isDefault: false,
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.productVariant.upsert({
      where: { sku: "DECO-TALENT-INTERVIEW" },
      update: {},
      create: {
        productId: decoTalent.id,
        name: "AI Interview",
        sku: "DECO-TALENT-INTERVIEW",
        price: 500,
        attributes: { billing: "per interview", description: "Full AI-conducted interview with report" },
        isDefault: false,
        isActive: true,
        sortOrder: 2,
      },
    }),
  ]);
  console.log("Deco Talent created:", decoTalent.id);

  // ─── 3. HR Bot ──────────────────────────────────────────────────
  const hrBot = await prisma.product.upsert({
    where: { slug: "hr-bot" },
    update: {
      status: "ACTIVE",
      isFeatured: true,
    },
    create: {
      categoryId: aiCategory.id,
      name: "HR Bot",
      slug: "hr-bot",
      icon: "Bot",
      shortDescription: "Intelligent HR automation bot for end-to-end workforce management and employee engagement",
      description:
        "HR Bot by DeWiN is a conversational AI assistant that handles the full employee lifecycle — from onboarding and leave management to payroll queries, policy FAQs, and performance tracking. Available 24/7 across WhatsApp, Teams, and web, it reduces HR workload by up to 70% while improving employee experience.",
      features: [
        "Employee Onboarding Automation",
        "Leave & Attendance Management",
        "Payroll Query Handling",
        "Policy & Compliance FAQ Bot",
        "Performance Review Reminders",
        "Multi-channel (WhatsApp, Teams, Web)",
        "HR Analytics Dashboard",
        "Escalation to HR Team",
        "Multi-language Support",
        "HRMS Integration",
      ],
      specifications: {
        "Channels": "WhatsApp, Teams, Web",
        "Uptime SLA": "99.9%",
        "Languages": "10+",
        "Integration": "REST API / Webhook",
        "HRMS Support": "Darwinbox, Keka, Zoho",
      },
      sku: "HR-BOT-001",
      basePrice: 999,
      productType: "CONFIGURABLE",
      status: "ACTIVE",
      isFeatured: true,
      isDigital: true,
      requiresShipping: false,
      trackInventory: false,
      stockQuantity: 9999,
      pricingDisplayFormat: "TABLE",
    },
  });

  await Promise.all([
    prisma.productVariant.upsert({
      where: { sku: "HR-BOT-STARTER" },
      update: {},
      create: {
        productId: hrBot.id,
        name: "Starter",
        sku: "HR-BOT-STARTER",
        price: 999,
        attributes: { billing: "per month", employees: "Up to 50 employees", channels: "Web" },
        isDefault: true,
        isActive: true,
        sortOrder: 0,
      },
    }),
    prisma.productVariant.upsert({
      where: { sku: "HR-BOT-PROFESSIONAL" },
      update: {},
      create: {
        productId: hrBot.id,
        name: "Professional",
        sku: "HR-BOT-PROFESSIONAL",
        price: 2999,
        attributes: { billing: "per month", employees: "Up to 250 employees", channels: "Web + WhatsApp" },
        isDefault: false,
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.productVariant.upsert({
      where: { sku: "HR-BOT-ENTERPRISE" },
      update: {},
      create: {
        productId: hrBot.id,
        name: "Enterprise",
        sku: "HR-BOT-ENTERPRISE",
        price: 7999,
        attributes: { billing: "per month", employees: "Unlimited employees", channels: "Web + WhatsApp + Teams" },
        isDefault: false,
        isActive: true,
        sortOrder: 2,
      },
    }),
  ]);
  console.log("HR Bot created:", hrBot.id);

  console.log("\nAll DeWiN AI products seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
