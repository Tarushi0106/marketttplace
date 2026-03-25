import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF, transformOrderToInvoiceData } from "@/lib/invoice-pdfmake";

/**
 * GET /api/invoices/[id]/pdf - Generate and download invoice PDF using Puppeteer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch order with all related data
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Transform order data for PDF generation
    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      email: order.email,
      phone: order.phone,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: Number(order.subtotal) || 0,
      discountAmount: Number(order.discountAmount) || 0,
      taxAmount: Number(order.taxAmount) || 0,
      cgstAmount: Number((order as any).cgstAmount) || 0,
      sgstAmount: Number((order as any).sgstAmount) || 0,
      shippingAmount: Number(order.shippingAmount) || 0,
      total: Number(order.total) || 0,
      currency: order.currency || "INR",
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice) || 0,
        totalPrice: Number(item.totalPrice) || 0,
        product: null,
        variant: null,
        bundle: null,
        configuration: item.configuration,
        hsnCode: (item as any).hsnCode || null,
        setupFee: Number((item as any).setupFee) || 0,
        isRecurring: item.isRecurring,
        billingCycle: item.billingCycle,
        recurringPrice: Number(item.recurringPrice) || 0,
      })),
      billingAddress: null,
      shippingAddress: null,
    };

    // Parse billing/shipping addresses from metadata
    const metadata = order.metadata as Record<string, any> || {};
    orderData.billingAddress = metadata.shippingAddress || null;
    orderData.shippingAddress = metadata.shippingAddress || null;

    // Transform order to invoice data and generate PDF using pdfmake
    const invoiceData = transformOrderToInvoiceData(orderData);
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Return the PDF as a downloadable file
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}
