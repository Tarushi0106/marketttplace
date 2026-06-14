import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const features = [
  "Multilingual Job Cards - Auto-translate job descriptions into 30+ languages for global hiring.",
  "Rubric-Driven Resume Scoring - AI scores every resume against skill weightages you define — consistently.",
  "Bulk Resume Upload - Upload hundreds of PDFs or DOCX files at once; parsed and scored instantly.",
  "Automatic Duplicate Detection - Flags candidates already in the pool to prevent re-evaluation.",
  "AI-Conducted Interviews - Structured, role-specific questions with real-time adaptive follow-ups.",
  "NLP Sentiment & Confidence Analysis - Analyses intent, fluency, and confidence throughout the session.",
  "Full Video & Transcript Recording - Auto-transcribed with speaker labels; searchable and exportable.",
  "10-Parameter Candidate Report - Scores across communication, technical depth, problem-solving, and 7 more.",
  "Side-by-Side Candidate Comparison - Compare shortlisted candidates and push to ATS in one click.",
  "Time-Zone Aware Scheduling - Invites show each party's correct local time automatically.",
  "Branded Candidate Invite - One-click browser link from your domain — zero candidate setup.",
  "Automated Reminders - Sent 24 hrs and 30 mins before the slot to reduce no-shows.",
  "HRMS Integration - REST API sync with Darwinbox, Keka, Zoho People, and more.",
];

async function main() {
  const updated = await prisma.product.update({
    where: { slug: "deco-talent" },
    data: { features },
  });
  console.log("Updated:", updated.name, "—", (updated.features as string[]).length, "features");
}

main().catch(console.error).finally(() => prisma.$disconnect());
