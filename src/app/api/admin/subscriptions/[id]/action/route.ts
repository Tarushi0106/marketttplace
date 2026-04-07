import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Pause a subscription
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subscriptionId } = await params;
    const { action } = await request.json();

    const subscription = await prisma.recurringSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    let updatedSubscription;
    switch (action) {
      case "pause":
        updatedSubscription = await prisma.recurringSubscription.update({
          where: { id: subscriptionId },
          data: { status: "PAUSED" },
        });
        break;
      case "resume":
        updatedSubscription = await prisma.recurringSubscription.update({
          where: { id: subscriptionId },
          data: { status: "ACTIVE" },
        });
        break;
      case "cancel":
        updatedSubscription = await prisma.recurringSubscription.update({
          where: { id: subscriptionId },
          data: {
            status: "CANCELLED",
            autoRenew: false,
            cancelledAt: new Date(),
          },
        });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
