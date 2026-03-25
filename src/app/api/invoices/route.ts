import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber, generateInvoicePDF, transformOrderToInvoiceData } from "@/lib/invoice-pdfmake";
import { sendOrderConfirmationEmail } from "@/lib/email";
import path from "path";
import type { Order, OrderItem, Address, AddressType } from "@/types";

// Extend Prisma client with Invoice model (type assertion)
const invoices = (prisma as any);

// Transform Prisma order to Order type for PDF generation
function transformOrderForPDF(order: any): Order {
  // Handle shippingAddress from metadata if not available from relation
  let shippingAddress = null;
  if (order.shippingAddress) {
    shippingAddress = {
      id: order.shippingAddress.id,
      userId: order.shippingAddress.userId,
      type: order.shippingAddress.type,
      firstName: order.shippingAddress.firstName,
      lastName: order.shippingAddress.lastName,
      company: order.shippingAddress.company || "",
      address1: order.shippingAddress.address1,
      address2: order.shippingAddress.address2 || "",
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
      phone: order.shippingAddress.phone || "",
      isDefault: order.shippingAddress.isDefault || false,
    };
  } else if (order.metadata && typeof order.metadata === 'object') {
    const metadata = order.metadata as Record<string, any>;
    if (metadata.shippingAddress) {
      shippingAddress = {
        id: '',
        userId: '',
        type: 'SHIPPING' as AddressType,
        ...metadata.shippingAddress,
        company: metadata.shippingAddress.company || "",
        address2: metadata.shippingAddress.address2 || "",
        phone: metadata.shippingAddress.phone || "",
        isDefault: false,
      };
    }
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    email: order.email,
    phone: order.phone,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    taxAmount: Number(order.taxAmount),
    shippingAmount: Number(order.shippingAmount),
    total: Number(order.total),
    currency: order.currency || "INR",
    discountId: order.discountId,
    shippingAddressId: order.shippingAddressId,
    billingAddressId: order.billingAddressId,
    notes: order.notes,
    metadata: order.metadata as Record<string, unknown> | null,
    items: (order.items || []).map((item: any) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      variantId: item.variantId,
      bundleId: item.bundleId,
      name: item.name,
      sku: item.sku || "",
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      configuration: item.configuration as Record<string, string> | null,
      billingCycle: item.billingCycle,
      isRecurring: item.isRecurring || false,
      recurringPrice: item.recurringPrice ? Number(item.recurringPrice) : null,
      addons: (item.addons || []).map((addon: any) => ({
        id: addon.id,
        orderItemId: addon.orderItemId,
        addonId: addon.addonId,
        name: addon.name,
        price: Number(addon.price),
        quantity: addon.quantity,
        billingCycle: addon.billingCycle,
        isRecurring: addon.isRecurring || false,
      })),
    })),
    shippingAddress,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

/**
 * POST /api/invoices - Generate invoice for an order
 * Accepts: { orderId }
 * Creates invoice record, generates PDF, saves to disk, sends email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, sendEmail } = body;
    console.log("POST /api/invoices - orderId:", orderId, "sendEmail:", sendEmail);

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch order with all related data
    let order: any;
    try {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
              bundle: true,
              addons: true,
            },
          },
          user: true,
          shippingAddress: true,
        },
      });
    } catch (orderError) {
      console.error("Error fetching order:", orderError);
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: 500 }
      );
    }

    console.log("Order found:", order ? order.id : "not found");

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if invoice already exists
    let existingInvoice: any;
    try {
      existingInvoice = await invoices.invoice.findUnique({
        where: { orderId: orderId },
      });
    } catch (invoiceCheckError) {
      console.warn("Could not check for existing invoice:", invoiceCheckError);
    }
    console.log("Existing invoice:", existingInvoice ? existingInvoice.id : "none");

    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice already exists for this order", invoice: existingInvoice },
        { status: 409 }
      );
    }

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();
    console.log("Generating invoice:", invoiceNumber);

    // Transform order for PDF generation
    let orderForPdf: Order;
    try {
      orderForPdf = transformOrderForPDF(order);
      console.log("Order transformed for PDF, items count:", orderForPdf.items.length);
    } catch (transformError) {
      console.error("Error transforming order:", transformError);
      return NextResponse.json(
        { error: "Failed to process order data for invoice" },
        { status: 500 }
      );
    }

    // Generate PDF using pdfmake
    let pdfBuffer: Buffer;
    try {
      console.log("Starting PDF generation with pdfmake...");
      const invoiceData = transformOrderToInvoiceData(orderForPdf);
      pdfBuffer = await generateInvoicePDF(invoiceData);
      console.log("PDF generated successfully, size:", pdfBuffer.length);
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
      return NextResponse.json(
        { error: "Failed to generate invoice PDF", details: pdfError instanceof Error ? pdfError.message : String(pdfError) },
        { status: 500 }
      );
    }

    // Convert PDF to base64 for storage (Amplify has ephemeral filesystem)
    const pdfBase64 = pdfBuffer.toString('base64');
    const pdfFilename = `${invoiceNumber}.pdf`;
    const pdfUrl = `data:application/pdf;base64,${pdfBase64}`;

    // Fetch company info for email
    const companyInfo = await prisma.companyInfo.findFirst() || {
      name: 'Marketplace',
      email: 'support@example.com',
      phone: '+91 99999 99999',
    };

    // Create invoice record in database with PDF data
    let invoice: any;
    try {
      invoice = await invoices.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber,
          pdfUrl: pdfFilename, // Store filename for reference
          status: "ISSUED",
          issuedAt: new Date(),
        },
      });
      console.log("Invoice record created:", invoice.id);
    } catch (dbError) {
      console.error("Error creating invoice record:", dbError);
      // Still return success with PDF data
      return NextResponse.json({
        success: true,
        invoice: {
          id: null,
          invoiceNumber,
          pdfUrl: pdfFilename,
          pdfData: pdfBase64,
          status: "ISSUED",
        },
        message: "Invoice PDF generated but database record creation failed",
      });
    }

    // Send email if requested
    let emailSent = false;
    console.log('[Invoice API] sendEmail:', sendEmail, 'order.email:', order?.email);
    if (sendEmail && order?.email) {
      try {
        console.log('[Invoice API] Preparing to send email to:', order.email);
        // Prepare order details for email
        const orderDetails = {
          orderNumber: order.orderNumber,
          customerName: order.shippingAddress?.firstName 
            ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ''}`.trim()
            : (order.metadata?.customerName as string) || 'Customer',
          customerEmail: order.email,
          items: order.items.map((item: any) => {
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
          setupFee: Number(order.metadata?.setupFee || 0),
          tax: Number(order.taxAmount),
          total: Number(order.total),
          billingCycle: order.items[0]?.billingCycle || 'MONTHLY',
          recurringAmount: order.items.reduce((sum: number, item: any) => 
            sum + (item.recurringPrice ? Number(item.recurringPrice) : 0), 0),
          recurringPeriod: order.items[0]?.billingCycle === 'YEARLY' ? '1 year' : '1 month',
          companyInfo: {
            name: companyInfo?.name || 'Marketplace',
            email: companyInfo?.email || 'support@example.com',
            phone: companyInfo?.phone || '+91 99999 99999',
          },
        };

        emailSent = await sendOrderConfirmationEmail(orderDetails);
        if (emailSent) {
          console.log('Order confirmation email sent successfully to:', order.email);
        }
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail the order if email fails
        emailSent = false;
      }
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        pdfUrl: invoice.pdfUrl,
        pdfData: pdfBase64, // Include base64 PDF data for download
        status: invoice.status,
        issuedAt: invoice.issuedAt,
        orderId: invoice.orderId,
      },
      emailSent,
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    const errorMessage = error instanceof Error ? error.message : typeof error === 'object' ? JSON.stringify(error) : 'Unknown error';
    return NextResponse.json(
      { error: "Failed to generate invoice", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invoices - Get invoice by orderId or list all invoices
 * Query params:
 *   - orderId: Get invoice for specific order
 *   - page, limit: Pagination for listing (admin)
 *   - status: Filter by status (admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const deleteInvoice = searchParams.get("delete") === "true";
    console.log("GET /api/invoices - orderId:", orderId, "delete:", deleteInvoice);

    // If orderId is provided and delete is true, delete existing invoice
    if (orderId && deleteInvoice) {
      try {
        const existingInvoice = await invoices.invoice.findUnique({
          where: { orderId },
        });
        
        if (existingInvoice) {
          await invoices.invoice.delete({
            where: { id: existingInvoice.id },
          });
          console.log("Invoice deleted:", existingInvoice.id);
          return NextResponse.json({
            success: true,
            message: "Invoice deleted successfully",
          });
        }
      } catch (deleteError) {
        console.error("Error deleting invoice:", deleteError);
        return NextResponse.json(
          { error: "Failed to delete invoice" },
          { status: 500 }
        );
      }
    }

    // If orderId is provided, find invoice for that order
    if (orderId) {
      const invoice = await invoices.invoice.findUnique({
        where: { orderId },
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
      console.log("Invoice found:", invoice ? invoice.id : "not found");

      if (!invoice) {
        return NextResponse.json({
          success: true,
          invoice: null,
          message: "No invoice exists for this order yet"
        });
      }

      // Regenerate PDF for existing invoice (Amplify has ephemeral filesystem)
      let pdfBase64: string | null = null;
      try {
        const orderForPdf = transformOrderForPDF(invoice.order);
        const invoiceData = transformOrderToInvoiceData(orderForPdf);
        const pdfBuffer = await generateInvoicePDF(invoiceData);
        pdfBase64 = pdfBuffer.toString('base64');
        console.log("PDF regenerated for existing invoice, size:", pdfBuffer.length);
      } catch (pdfError) {
        console.error("Error regenerating PDF:", pdfError);
        // Continue without PDF data
      }

      return NextResponse.json({
        success: true,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          pdfUrl: invoice.pdfUrl,
          pdfData: pdfBase64, // Include regenerated PDF data
          status: invoice.status,
          issuedAt: invoice.issuedAt,
          createdAt: invoice.createdAt,
          updatedAt: invoice.updatedAt,
          orderId: invoice.orderId,
        },
      });
    }

    // List all invoices (admin functionality)
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [invoicesData, total] = await Promise.all([
      invoices.invoice.findMany({
        where,
        include: {
          order: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      invoices.invoice.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: invoicesData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
