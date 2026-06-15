import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const features = [
  "Natural Language Understanding - Understands caller intent in real time with context retention across the conversation.",
  "Multi-turn Dialogue - Maintains conversation context across multiple turns for complex, multi-step query resolution.",
  "Custom Voice Personas - Deploy branded voices — choose tone, accent, and personality tailored to your business.",
  "30+ Language Support - Serve customers globally without specialist agents in every language.",
  "24/7 Automated Call Handling - Zero downtime, zero hold queues — every call answered instantly, any hour.",
  "Live Agent Escalation - Transfers to a human agent with full call context when needed — no caller repeats themselves.",
  "CRM & Helpdesk Integration - Auto-logs every interaction to Salesforce, Zoho, Freshdesk, and more via REST API.",
  "Real-time Call Analytics - Sentiment, resolution rate, and intent data captured for every call session.",
  "DTMF & Voice Input - Supports both keypress and voice-based navigation within the same call flow.",
  "SIP / WebRTC / PBX Support - Connects to your existing telephony infrastructure without a rip-and-replace.",
  "Call Recording & Transcripts - Auto-transcribed sessions with speaker labels, stored securely and searchable.",
  "Sub-500ms Response Time - Near-instant replies that feel natural and eliminate perceived lag.",
];

async function main() {
  const updated = await prisma.product.update({
    where: { slug: "deco-voice" },
    data: { features },
  });
  console.log("Updated features for:", updated.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
