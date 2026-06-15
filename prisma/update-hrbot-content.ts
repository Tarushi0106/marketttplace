import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const description = `
HR Bot is an AI Interview Platform that automates your entire first round of hiring — from resume scoring to AI-conducted interviews and structured candidate reports.

**70% faster hiring · 0 hrs HR time on Round 1 · 10x throughput · 100% consistent scoring**

---

## How It Works

1. **HR creates a job card** — define skills, scoring rubric, and interview language (30+ supported)
2. **Upload resumes** — bulk upload in PDF/DOCX; AI parses, deduplicates, and scores instantly
3. **AI scores profiles** — every resume ranked against the rubric; shortlist ready in seconds
4. **Schedule AI interview** — pick duration (15–60 min), language, and depth; invite sent automatically
5. **Candidate joins** — one-click browser link, no app or account needed
6. **AI conducts the interview** — adaptive questions, real-time NLP, full video + transcript recorded
7. **HR reviews the report** — 10-parameter structured report, video playback, ATS export in one click

---

## 10 Evaluated Parameters

Communication · Technical depth · Problem-solving · Confidence · Clarity of thought · Domain knowledge · Active listening · Leadership signals · Culture fit signals · Overall hire fit

---

## Key Advantages

- First round entirely AI-handled — HR steps in only when the shortlist is ready
- Eliminates scheduling bottlenecks — what took 2–3 weeks now takes hours
- Objective, rubric-bound scoring — removes interviewer bias and variation
- Scales to any volume — 5 or 500 simultaneous interviews, no extra headcount
- Multilingual — 30+ interview languages, no specialist interviewers needed
`;

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
    where: { slug: "hr-bot" },
    data: {
      shortDescription: "AI Interview Platform — automates resume scoring, AI-conducted interviews, and 10-parameter candidate reports from end to end.",
      description: description.trim(),
      features,
      specifications: {
        "Interview Languages": "30+",
        "Resume Formats": "PDF, DOCX, LinkedIn",
        "Interview Duration": "15 – 60 min",
        "Evaluated Parameters": "10",
        "Candidate Setup": "Zero — browser only",
        "Uptime SLA": "99.9%",
        "HRMS Integration": "Darwinbox, Keka, Zoho",
        "Report Delivery": "Instant post-interview",
      },
    },
  });

  console.log("Updated:", updated.name);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
