import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Create a recurring subscription after checkout
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const {
      orderId,
      userId,
      productId,
      variantId,
      billingCycle,
      pricePerCycle,
      preferredTime,
      preferredDay,
      configuration,
      selectedConfigs,
      selectedAddons,
    } = body;

    // Validate required fields
    if (!orderId || !productId || !billingCycle || !pricePerCycle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate next billing date based on preferences
    const now = new Date();
    let nextBillingDate = new Date(now);
    let startDate = new Date(now);

    if (billingCycle === "MONTHLY") {
      nextBillingDate.setDate(preferredDay || 1);
      if (nextBillingDate <= now) {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      }
    } else if (billingCycle === "QUARTERLY") {
      nextBillingDate.setDate(preferredDay || 1);
      const currentMonth = nextBillingDate.getMonth();
      nextBillingDate.setMonth(currentMonth + 3);
      if (nextBillingDate <= now) {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
      }
    } else if (billingCycle === "YEARLY") {
      nextBillingDate.setDate(preferredDay || 1);
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      if (nextBillingDate <= now) {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }
    } else {
      // Default to monthly
      nextBillingDate.setDate(preferredDay || 1);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    // Set preferred time
    if (preferredTime) {
      const [hours, minutes] = preferredTime.split(":");
      nextBillingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    // Create the recurring subscription
    const subscription = await prisma.recurringSubscription.create({
      data: {
        userId: userId || session?.user?.id,
        productId,
        variantId: variantId || null,
        billingCycle,
        pricePerCycle,
        currency: "USD",
        startDate,
        nextBillingDate,
        preferredTime: preferredTime || null,
        preferredDay: preferredDay || 1,
        status: "ACTIVE",
        autoRenew: true,
        configuration: configuration || {},
        selectedConfigs: selectedConfigs || [],
        selectedAddons: selectedAddons || [],
        totalBilled: 1,
        totalSpent: pricePerCycle,
      },
    });

    // Update order to mark as recurring
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          metadata: {
            recurringSubscriptionId: subscription.id,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Error creating recurring subscription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create subscription" },
      { status: 500 }
    );
  }
}

// GET - Fetch recurring subscriptions for a user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId && !session?.user?.id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const subscriptions = await prisma.recurringSubscription.findMany({
      where: {
        userId: userId || session?.user?.id,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
          },
        },
        billingHistory: {
          orderBy: {
            billingDate: "desc",
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
