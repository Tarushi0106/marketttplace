import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - List all orders (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication using auth()
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    let orders: any[] = [];
    let total = 0;

    try {
      [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    slug: true,
                    category: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            _count: {
              select: { items: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.order.count({ where }),
      ]);
    } catch (dbError) {
      console.error("Database error fetching orders:", dbError);
      // Return empty array on database error
      return NextResponse.json({
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
        error: "Database error",
      });
    }

    // Convert Decimal fields to numbers
    const ordersWithNumbers = orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal) || 0,
      discountAmount: Number(order.discountAmount) || 0,
      taxAmount: Number(order.taxAmount) || 0,
      shippingAmount: Number(order.shippingAmount) || 0,
      total: Number(order.total) || 0,
    }));

    return NextResponse.json({
      data: ordersWithNumbers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + orders.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    // Return empty array instead of 500 error to prevent page crash
    return NextResponse.json({
      data: [],
      pagination: {
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false,
      },
      error: "Failed to fetch orders",
    });
  }
}
