import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.setting.findUnique({
      where: { key: "product-display" },
    });

    if (!settings) {
      return NextResponse.json({ displayFormat: "card" });
    }

    return NextResponse.json(settings.value);
  } catch (error) {
    console.error("Error fetching product display settings:", error);
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
      where: { key: "product-display" },
      update: { value: body },
      create: {
        key: "product-display",
        value: body,
        group: "display",
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error saving product display settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
