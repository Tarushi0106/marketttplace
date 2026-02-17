import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * PATCH /api/orders/[id] - Update order status
 * Used by admin to update order and payment status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    // Build update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            variant: true,
            bundle: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shippingAddress: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        paymentMethod: updatedOrder.paymentMethod,
        subtotal: Number(updatedOrder.subtotal) || 0,
        discountAmount: Number(updatedOrder.discountAmount) || 0,
        taxAmount: Number(updatedOrder.taxAmount) || 0,
        shippingAmount: Number(updatedOrder.shippingAmount) || 0,
        total: Number(updatedOrder.total) || 0,
        currency: updatedOrder.currency,
        email: updatedOrder.email,
        phone: updatedOrder.phone,
        notes: updatedOrder.notes,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        items: updatedOrder.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice) || 0,
          totalPrice: Number(item.totalPrice) || 0,
          product: item.product,
          variant: item.variant,
          bundle: item.bundle,
          configuration: item.configuration,
          billingCycle: item.billingCycle,
          isRecurring: item.isRecurring,
          recurringPrice: Number(item.recurringPrice) || 0,
          setupFee: Number(item.setupFee) || 0,
        })),
        user: updatedOrder.user,
        shippingAddress: updatedOrder.shippingAddress,
      },
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/[id] - Get single order by ID
 * Used by checkout success page for displaying order details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const origin = request.headers.get("origin") || request.headers.get("referer");

    // Allow same-origin requests (for checkout success page)
    // Skip token check to avoid errors when no session exists
    if (!origin?.includes("localhost:3000") && !origin?.includes("127.0.0.1:3000") && !origin?.includes("yourdomain.com")) {
      // For cross-origin requests, try to get token
      try {
        const { getToken } = await import("next-auth/jwt");
        const token = await getToken({ req: request });
        if (!token) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      } catch (authError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // First fetch basic order data
    let basicOrder;
    try {
      basicOrder = await prisma.order.findUnique({
        where: { id },
      });
    } catch (dbError) {
      console.error("Database error fetching order:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!basicOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Prepare order data with items
    const orderData: any = {
      id: basicOrder.id,
      orderNumber: basicOrder.orderNumber,
      status: basicOrder.status,
      paymentStatus: basicOrder.paymentStatus,
      paymentMethod: basicOrder.paymentMethod,
      subtotal: Number(basicOrder.subtotal) || 0,
      discountAmount: Number(basicOrder.discountAmount) || 0,
      taxAmount: Number(basicOrder.taxAmount) || 0,
      shippingAmount: Number(basicOrder.shippingAmount) || 0,
      total: Number(basicOrder.total) || 0,
      currency: basicOrder.currency,
      email: basicOrder.email,
      phone: basicOrder.phone,
      notes: basicOrder.notes,
      createdAt: basicOrder.createdAt,
      updatedAt: basicOrder.updatedAt,
      items: [],
      shippingAddress: null,
      billingAddress: null,
    };

    // Try to fetch with relations
    try {
      const orderWithRelations = await (prisma as any).order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              variant: true,
              bundle: true,
              addons: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          shippingAddress: true,
        },
      });

      if (orderWithRelations) {
        orderData.items = orderWithRelations.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice) || 0,
          totalPrice: Number(item.totalPrice) || 0,
          product: item.product,
          variant: item.variant,
          bundle: item.bundle,
          configuration: item.configuration,
          billingCycle: item.billingCycle,
          isRecurring: item.isRecurring,
          recurringPrice: Number(item.recurringPrice) || 0,
          setupFee: Number(item.setupFee) || 0,
        }));
        
        // Use shippingAddress from relation if available, otherwise try metadata
        if (orderWithRelations.shippingAddress) {
          orderData.shippingAddress = orderWithRelations.shippingAddress;
        } else if (basicOrder.metadata && typeof basicOrder.metadata === 'object') {
          const metadata = basicOrder.metadata as Record<string, any>;
          if (metadata.shippingAddress) {
            orderData.shippingAddress = metadata.shippingAddress;
          }
        }
      }
    } catch (includeError) {
      console.warn("Could not fetch order with relations, using basic data");
    }

    return NextResponse.json({
      success: true,
      data: orderData,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
