import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const features = [
  "Lead Qualification & Follow-Ups - AI calls your leads, qualifies them, and pushes disposition to your CRM automatically.",
  "Appointment Booking & Reminders - Schedules meetings and sends automated reminders to reduce no-shows.",
  "Payment Collection Calls - Politely follows up on overdue payments with conversational AI — no agent needed.",
  "Customer Support Automation - Resolves FAQs, complaints, and service requests end-to-end via AI voice.",
  "Surveys & Feedback Collection - Conducts post-interaction surveys with natural voice and logs structured responses.",
  "AI Receptionist / IVR Replacement - Replaces legacy IVR with a fully conversational AI front desk.",
  "Order Confirmation Calls - Confirms orders and deliveries with customers automatically post-purchase.",
  "Customer Re-Engagement Campaigns - Runs personalised win-back campaigns to lapsed customers via AI outbound calls.",
  "10+ Language Support - Conduct conversations in Hindi, English, and 8+ regional languages natively.",
  "Real-Time CRM Sync - Every call outcome synced instantly to Zoho, HubSpot, LeadSquared, Salesforce, and more.",
  "Human Escalation - Seamlessly transfers complex conversations to a live agent with full call context preserved.",
  "Private LLM Deployment - Deploy on your own NVIDIA GPU infrastructure for complete data privacy.",
  "Shared Cloud (GCP) - Instant deployment on Google Cloud for startups, SMBs, D2C and retail businesses.",
];

async function main() {
  const updated = await prisma.product.update({
    where: { slug: "deco-voice" },
    data: { features },
  });
  console.log("Updated:", updated.name, "—", (updated.features as string[]).length, "features");
}

main().catch(console.error).finally(() => prisma.$disconnect());
