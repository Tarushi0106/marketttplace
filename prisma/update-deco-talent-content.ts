import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const features = [
  "AI Resume Scoring - Ranks every resume against your defined rubric — consistently and instantly, at any volume.",
  "Automated Candidate Shortlisting - AI-generated ranked shortlist ready in seconds after bulk upload, zero manual effort.",
  "AI-Conducted Voice Interviews - Full voice interview with adaptive questions and real-time NLP analysis, fully recorded.",
  "10-Parameter Candidate Reports - Scores across communication, technical depth, problem-solving, and 7 more dimensions.",
  "Video + Transcript Delivery - Auto-transcribed interviews with speaker labels, full video playback, and searchable text.",
  "30+ Language Support - Screen and interview candidates globally without specialist recruiters in every language.",
  "ATS & CRM Integration - Push shortlists and reports directly to Darwinbox, Keka, Zoho People, and more.",
  "Custom Evaluation Criteria - Define skill weightages and scoring rubric tailored to each specific role.",
  "Bulk Candidate Processing - Upload hundreds of profiles at once — parsed, deduplicated, and scored in seconds.",
  "Compliance-Ready Data Handling - GDPR-compliant data storage with candidate consent management built in.",
];

async function main() {
  const updated = await prisma.product.update({
    where: { slug: "deco-talent" },
    data: { features },
  });
  console.log("Updated features for:", updated.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
