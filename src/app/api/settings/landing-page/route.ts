import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.setting.findUnique({
      where: { key: "landing-page" },
    });

    if (!settings) {
      return NextResponse.json(null);
    }

    return NextResponse.json(settings.value);
  } catch (error) {
    console.error("Error fetching landing page settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const settings = await prisma.setting.upsert({
      where: { key: "landing-page" },
      update: { value: body },
      create: {
        key: "landing-page",
        value: body,
        group: "landing-page",
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error saving landing page settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
