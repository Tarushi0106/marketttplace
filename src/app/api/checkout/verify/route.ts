import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { generateInvoiceNumber, generateInvoicePDF } from "@/lib/invoice";
import { z } from "zod";
import fs from "fs";
import path from "path";

const verifySchema = z.object({
  orderId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = verifySchema.parse(body);

    // Verify the signature
    const isValid = verifyRazorpaySignature({
      orderId: data.razorpayOrderId,
      paymentId: data.razorpayPaymentId,
      signature: data.razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update order status - store Razorpay data in metadata
    console.log("Verifying Razorpay payment for order:", data.orderId);
    const order = await prisma.order.update({
      where: { id: data.orderId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentId: data.razorpayPaymentId,
        metadata: {
          razorpayOrderId: data.razorpayOrderId,
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
        },
      },
    });
    console.log("Order updated:", order.id);

    // Generate invoice for the order
    let invoice = await (prisma as any).invoice.findUnique({
      where: { orderId: order.id },
    });
    console.log("Existing invoice:", invoice);

    if (!invoice) {
      console.log("Generating new invoice for order:", order.id);
      // Fetch full order data for invoice
      const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          user: true,
          items: true,
          shippingAddress: true,
          discount: true,
        },
      });

      if (fullOrder) {
        // Generate invoice number
        const invoiceNumber = generateInvoiceNumber();

        // Generate PDF
        const pdfBuffer = await generateInvoicePDF(fullOrder as any);

        // Ensure invoices directory exists
        const invoicesDir = path.join(process.cwd(), "public", "uploads", "invoices");
        if (!fs.existsSync(invoicesDir)) {
          fs.mkdirSync(invoicesDir, { recursive: true });
        }

        // Save PDF to file
        const pdfFileName = `${invoiceNumber}.pdf`;
        const pdfPath = path.join(invoicesDir, pdfFileName);
        fs.writeFileSync(pdfPath, pdfBuffer);

        // Create invoice record
        invoice = await (prisma as any).invoice.create({
          data: {
            orderId: order.id,
            invoiceNumber,
            pdfUrl: `/uploads/invoices/${pdfFileName}`,
            status: "ISSUED",
            issuedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      },
      invoice: invoice ? {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        pdfUrl: invoice.pdfUrl,
      } : null,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
