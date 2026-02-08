import { NextRequest, NextResponse } from "next/server";
import { stripe, constructWebhookEvent } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber, generateInvoicePDF } from "@/lib/invoice";
import fs from "fs";
import path from "path";

// Extend Prisma client with Invoice model (type assertion)
const invoices = (prisma as any);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;

  try {
    event = await constructWebhookEvent(body, signature);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.error("No orderId in session metadata");
          break;
        }

        console.log(`Processing Stripe checkout completion for order: ${orderId}`);

        // Update order status
        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
            paymentId: session.payment_intent as string,
          },
        } as any);

        // Check if invoice already exists
        const existingInvoice = await invoices.invoice.findUnique({
          where: { orderId: order.id },
        });

        if (existingInvoice) {
          console.log(`Invoice already exists for order: ${orderId}`);
          break;
        }

        // Generate invoice for the order
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
          await invoices.invoice.create({
            data: {
              orderId: order.id,
              invoiceNumber,
              pdfUrl: `/uploads/invoices/${pdfFileName}`,
              status: "ISSUED",
              issuedAt: new Date(),
            },
          });

          console.log(`Invoice generated for order: ${orderId}, invoice: ${invoiceNumber}`);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
        // Additional handling if needed
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent failed: ${paymentIntent.id}`);
        // Handle failed payment if needed
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
