import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { generateInvoiceNumber, generateInvoicePDF } from "@/lib/invoice";
import fs from "fs";
import path from "path";

// Extend Prisma client with Invoice model (type assertion)
const invoices = (prisma as any);

/**
 * POST /api/checkout/verify-stripe - Verify Stripe session and update order
 * Body: { sessionId, orderId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, orderId } = body;

    if (!sessionId || !orderId) {
      return NextResponse.json(
        { error: "Session ID and Order ID are required" },
        { status: 400 }
      );
    }

    // Check if order exists first
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order already updated
    if (existingOrder.paymentStatus === "PAID") {
      // Order already processed
      return NextResponse.json({
        success: true,
        message: "Order already verified",
        orderId,
      });
    }

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentId: session.payment_intent as string,
      },
    });

    // Generate invoice
    let invoice = await invoices.invoice.findUnique({
      where: { orderId: order.id },
    });

    if (!invoice) {
      try {
        const fullOrder = await prisma.order.findUnique({
          where: { id: order.id },
          include: {
            user: true,
            items: {
              include: {
                product: true,
                variant: true,
                bundle: true,
                addons: true,
              },
            },
            shippingAddress: true,
            discount: true,
          },
        });

        if (fullOrder) {
          // Prepare order data for invoice - handle shipping address from metadata if needed
          const orderDataForInvoice: any = {
            ...fullOrder,
          };
          
          // If no shippingAddress relation, try to get from metadata
          if (!orderDataForInvoice.shippingAddress && fullOrder.metadata && typeof fullOrder.metadata === 'object') {
            const metadata = fullOrder.metadata as Record<string, any>;
            if (metadata.shippingAddress) {
              orderDataForInvoice.shippingAddress = metadata.shippingAddress;
            }
          }

          const invoiceNumber = generateInvoiceNumber();
          const pdfBuffer = await generateInvoicePDF(orderDataForInvoice);

          const invoicesDir = path.join(process.cwd(), "public", "uploads", "invoices");
          if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
          }

          const pdfFileName = `${invoiceNumber}.pdf`;
          const pdfPath = path.join(invoicesDir, pdfFileName);
          fs.writeFileSync(pdfPath, pdfBuffer);

          invoice = await invoices.invoice.create({
            data: {
              orderId: order.id,
              invoiceNumber,
              pdfUrl: `/uploads/invoices/${pdfFileName}`,
              status: "ISSUED",
              issuedAt: new Date(),
            },
          });
        }
      } catch (invoiceError) {
        console.error("Error generating invoice:", invoiceError);
        // Continue without invoice - don't fail the whole request
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
      invoice: invoice ? {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        pdfUrl: invoice.pdfUrl,
        status: invoice.status,
      } : null,
    });
  } catch (error) {
    console.error("Error verifying Stripe session:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
