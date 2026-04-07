import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all subscriptions with stats
export async function GET(request: NextRequest) {
  try {
    const subscriptions = await prisma.recurringSubscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter((s) => s.status === "ACTIVE").length,
      paused: subscriptions.filter((s) => s.status === "PAUSED").length,
      cancelled: subscriptions.filter((s) => s.status === "CANCELLED").length,
      totalRevenue: subscriptions.reduce((sum, s) => sum + Number(s.totalSpent), 0),
    };

    return NextResponse.json({
      subscriptions,
      stats,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
