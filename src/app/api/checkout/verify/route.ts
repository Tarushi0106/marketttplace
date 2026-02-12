import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { generateInvoiceNumber } from "@/lib/invoice-pdfkit";
import { generateInvoicePDF } from "@/lib/invoice-pdfkit";
import { sendOrderConfirmationEmail } from "@/lib/email";
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

        // Generate PDF using PDFKit
        const pdfBuffer = await generateInvoicePDF({
          id: fullOrder.id,
          orderNumber: fullOrder.orderNumber,
          email: fullOrder.email,
          phone: fullOrder.phone,
          status: fullOrder.status,
          paymentStatus: fullOrder.paymentStatus,
          paymentMethod: fullOrder.paymentMethod,
          subtotal: Number(fullOrder.subtotal),
          discountAmount: Number(fullOrder.discountAmount || 0),
          taxAmount: Number(fullOrder.taxAmount),
          shippingAmount: Number(fullOrder.shippingAmount || 0),
          total: Number(fullOrder.total),
          currency: fullOrder.currency || 'INR',
          createdAt: fullOrder.createdAt,
          items: fullOrder.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
            configuration: item.configuration,
            billingCycle: item.billingCycle,
            isRecurring: item.isRecurring,
            recurringPrice: item.recurringPrice ? Number(item.recurringPrice) : null,
          })),
          shippingAddress: fullOrder.shippingAddress || {
            firstName: fullOrder.metadata?.shippingAddress?.firstName,
            lastName: fullOrder.metadata?.shippingAddress?.lastName,
            company: fullOrder.metadata?.shippingAddress?.company,
            address1: fullOrder.metadata?.shippingAddress?.address1,
            address2: fullOrder.metadata?.shippingAddress?.address2,
            city: fullOrder.metadata?.shippingAddress?.city,
            state: fullOrder.metadata?.shippingAddress?.state,
            postalCode: fullOrder.metadata?.shippingAddress?.postalCode,
            country: fullOrder.metadata?.shippingAddress?.country,
            phone: fullOrder.metadata?.shippingAddress?.phone,
          },
          metadata: fullOrder.metadata,
        });

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

        // Send order confirmation email
        console.log("[Verify] Sending order confirmation email to:", fullOrder.email);
        try {
          const companyInfo = await prisma.companyInfo.findFirst() || {
            name: 'Shaurrya Teleservices',
            email: 'info@shaurryatele.com',
            phone: '+91 99102 05084',
          };
          
          const orderDetails = {
            orderNumber: fullOrder.orderNumber,
            customerName: fullOrder.shippingAddress?.firstName 
              ? `${fullOrder.shippingAddress.firstName} ${fullOrder.shippingAddress.lastName || ''}`.trim()
              : (fullOrder.metadata?.customerName as string) || 'Customer',
            customerEmail: fullOrder.email,
            items: fullOrder.items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: Number(item.totalPrice),
              configs: item.configuration ? Object.entries(item.configuration).map(([name, value]) => ({
                name,
                value: value as string,
                price: 0,
              })) : []
            })),
            subtotal: Number(fullOrder.subtotal),
            setupFee: Number(fullOrder.metadata?.setupFee || 0),
            tax: Number(fullOrder.taxAmount),
            total: Number(fullOrder.total),
            billingCycle: fullOrder.items[0]?.billingCycle || 'MONTHLY',
            recurringAmount: fullOrder.items.reduce((sum: number, item: any) => 
              sum + (item.recurringPrice ? Number(item.recurringPrice) : 0), 0),
            recurringPeriod: fullOrder.items[0]?.billingCycle === 'YEARLY' ? '1 year' : '1 month',
            companyInfo: {
              name: companyInfo.name,
              email: companyInfo.email,
              phone: companyInfo.phone,
            },
          };
          
          await sendOrderConfirmationEmail(orderDetails);
          console.log("[Verify] Email sent successfully to:", fullOrder.email);
        } catch (emailError) {
          console.error("[Verify] Failed to send email:", emailError);
        }
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
