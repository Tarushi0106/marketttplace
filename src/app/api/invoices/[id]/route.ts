import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/invoices/[id] - Get invoice details
 * Fetches invoice with order details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const invoice = await (prisma as any).invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            items: {
              include: {
                product: true,
                variant: true,
                bundle: true,
                addons: true,
              },
            },
            shippingAddress: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        pdfUrl: invoice.pdfUrl,
        status: invoice.status,
        issuedAt: invoice.issuedAt,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        orderId: invoice.orderId,
        order: invoice.order,
      },
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}
