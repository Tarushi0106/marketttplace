import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

/**
 * POST /api/invoices/[id]/resend - Resend invoice email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch invoice with order details
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: true,
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

    const order = invoice.order;
    if (!order) {
      return NextResponse.json(
        { error: "Order not found for invoice" },
        { status: 404 }
      );
    }

    // Get company info
    const companyInfo = await prisma.companyInfo.findFirst() || {
      name: 'Marketplace',
      email: 'support@example.com',
      phone: '+91 99999 99999',
    };

    // Prepare order details
    const metadata = order.metadata as Record<string, any> || {};
    const orderDetails = {
      orderNumber: order.orderNumber,
      customerName: order.shippingAddress?.firstName 
        ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ''}`.trim()
        : (metadata.customerName as string) || 'Customer',
      customerEmail: order.email || '',
      items: order.items.map((item) => {
        // Format configuration properly - handle nested instances
        let formattedConfigs: Array<{name: string; value: string; price: number}> = [];
        
        if (item.configuration) {
          if (typeof item.configuration === 'object') {
            // Check if it has an 'instances' array
            if (item.configuration.instances && Array.isArray(item.configuration.instances)) {
              item.configuration.instances.forEach((inst: any, idx: number) => {
                formattedConfigs.push({
                  name: `Instance ${idx + 1}`,
                  value: inst.instanceName || `Instance ${idx + 1}`,
                  price: 0
                });
              });
            } else {
              // Regular configuration entries
              formattedConfigs = Object.entries(item.configuration).map(([name, value]) => ({
                name,
                value: String(value),
                price: 0
              }));
            }
          }
        }
        
        return {
          name: item.name,
          quantity: item.quantity,
          price: Number(item.totalPrice),
          configs: formattedConfigs
        };
      }),
      subtotal: Number(order.subtotal),
      setupFee: Number(metadata.setupFee || 0),
      tax: Number(order.taxAmount),
      total: Number(order.total),
      billingCycle: order.items[0]?.billingCycle || 'MONTHLY',
      recurringAmount: order.items.reduce((sum: number, item: any) => 
        sum + (item.recurringPrice ? Number(item.recurringPrice) : 0), 0),
      recurringPeriod: order.items[0]?.billingCycle === 'YEARLY' ? '1 year' : '1 month',
      companyInfo: {
        name: companyInfo.name || 'Marketplace',
        email: companyInfo.email || 'support@example.com',
        phone: companyInfo.phone || '+91 99999 99999',
      },
    };

    // Send email
    const emailSent = await sendOrderConfirmationEmail(orderDetails);

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error resending invoice email:", error);
    return NextResponse.json(
      { error: "Failed to resend email" },
      { status: 500 }
    );
  }
}
