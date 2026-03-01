import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { prisma } from '@/lib/prisma';

interface OrderItem {
  id?: string | null;
  name?: string | null;
  description?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  totalPrice?: number | null;
  configuration?: Record<string, any> | null | boolean;
  billingCycle?: string | null;
  isRecurring?: boolean | null;
  recurringPrice?: number | null;
  setupFee?: number | null;
  [key: string]: any;
}

interface Order {
  id?: string | null;
  orderNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  subtotal?: number | null;
  discountAmount?: number | null;
  taxAmount?: number | null;
  shippingAmount?: number | null;
  total?: number | null;
  currency?: string | null;
  notes?: string | null;
  createdAt?: Date | string | null;
  items?: OrderItem[] | null;
  shippingAddress?: {
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    phone?: string | null;
  } | null;
  metadata?: Record<string, any> | null;
}

/**
 * Generate unique invoice number
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
}

/**
 * Format currency for PDF with Indian Rupee symbol
 */
function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Extract clean description from item configuration
 */
function extractItemDescription(item: OrderItem): string {
  const parts: string[] = [];
  
  // Handle configuration object
  if (item.configuration && typeof item.configuration === 'object') {
    const config = item.configuration as any;
    
    // Handle instances array (for configurable products)
    if (config.instances && Array.isArray(config.instances)) {
      const instanceCount = config.instances.length;
      if (instanceCount > 0) {
        parts.push(`${instanceCount} instance(s)`);
      }
    } else {
      // Handle simple key-value config
      const entries = Object.entries(config).filter(([_, v]) => v !== null && v !== undefined && v !== '');
      if (entries.length > 0) {
        const configStr = entries.map(([key, value]) => {
          if (typeof value === 'object') {
            return `${key}: ${JSON.stringify(value)}`;
          }
          return `${key}: ${value}`;
        }).join(', ');
        parts.push(configStr);
      }
    }
  }
  
  // Handle recurring billing
  if (item.isRecurring && item.billingCycle && item.billingCycle !== 'ONE_TIME') {
    const periodMap: Record<string, string> = {
      'MONTHLY': 'month',
      'BIMONTHLY': '2 months',
      'QUARTERLY': '3 months',
      'FOUR_MONTHLY': '4 months',
      'SEMI_ANNUAL': '6 months',
      'TRI_ANNUAL': '9 months',
      'YEARLY': 'year',
      'BIENNIAL': '2 years',
      'TRIENNIAL': '3 years'
    };
    const period = periodMap[item.billingCycle] || item.billingCycle;
    parts.push(`Billed ${period}`);
  }
  
  return parts.length > 0 ? parts.join(' | ') : '-';
}

/**
 * Transform order items into structured invoice line items
 */
function transformInvoiceItems(items: OrderItem[] | null | undefined): Array<{
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}> {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  return items.map(item => ({
    name: item.name || 'Unknown Item',
    description: extractItemDescription(item),
    quantity: Number(item.quantity) || 1,
    rate: Number(item.unitPrice) || 0,
    amount: Number(item.totalPrice) || (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)
  }));
}

/**
 * Create structured invoice data object
 */
function createInvoiceData(order: Order) {
  const lineItems = transformInvoiceItems(order.items);
  
  const subtotal = Number(order.subtotal) || 0;
  const taxAmount = Number(order.taxAmount) || 0;
  const discountAmount = Number(order.discountAmount) || 0;
  const total = Number(order.total) || (subtotal + taxAmount - discountAmount);
  
  // Get customer info from shipping address
  const shippingAddr = order.shippingAddress;
  const customerName = shippingAddr?.company 
    || (shippingAddr?.firstName && shippingAddr?.lastName 
      ? `${shippingAddr.firstName} ${shippingAddr.lastName}`
      : null)
    || order.email 
    || 'Customer';
  
  const customerAddress = [
    shippingAddr?.address1,
    shippingAddr?.address2,
    shippingAddr?.city && shippingAddr?.state 
      ? `${shippingAddr.city}, ${shippingAddr.state}`
      : shippingAddr?.city || shippingAddr?.state,
    shippingAddr?.postalCode,
    shippingAddr?.country
  ].filter(Boolean).join(', ');
  
  // Check for recurring items
  const recurringItems = (order.items || []).filter(
    item => item.isRecurring && item.billingCycle && item.billingCycle !== 'ONE_TIME'
  );
  
  return {
    invoiceNumber: generateInvoiceNumber(),
    orderNumber: order.orderNumber,
    date: formatDate(order.createdAt),
    paymentStatus: order.paymentStatus || 'PENDING',
    paymentMethod: order.paymentMethod?.toUpperCase() || 'N/A',
    status: order.status || 'Pending',
    
    company: {
      name: 'SHAURRYA TELESERVICES',
      address: 'Laxmi Plaza, 213, Off New Link Rd, Laxmi Industrial Estate',
      city: 'Milat Nagar, Andheri West, Mumbai, Maharashtra 400053',
      pan: 'ABCCS1234A',
      gst: '27ABCCS1234A1Z9',
      email: 'info@shaurryatele.com',
      phone: '+91 99102 05084'
    },
    
    customer: {
      name: customerName,
      address: customerAddress,
      phone: shippingAddr?.phone || order.phone || '',
      email: order.email || ''
    },
    
    items: lineItems,
    
    totals: {
      subtotal,
      taxAmount,
      discountAmount,
      total
    },
    
    recurringInfo: recurringItems.length > 0 ? {
      hasRecurring: true,
      items: recurringItems.map(item => ({
        name: item.name,
        amount: Number(item.recurringPrice) || 0,
        period: item.billingCycle === 'YEARLY' ? 'year' : 'month'
      }))
    } : null
  };
}

/**
 * Generate professional PDF invoice using pdf-lib
 */
export async function generateInvoicePDF(order: Order): Promise<Buffer> {
  try {
    // Create structured invoice data
    const invoice = createInvoiceData(order);
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    
    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Colors
    const BLACK = rgb(0, 0, 0);
    const DARK_GRAY = rgb(0.2, 0.2, 0.2);
    const GRAY = rgb(0.4, 0.4, 0.4);
    const LIGHT_GRAY = rgb(0.8, 0.8, 0.8);
    const WHITE = rgb(1, 1, 1);
    const GREEN = rgb(0, 0.5, 0);
    const AMBER = rgb(0.92, 0.68, 0.04);
    
    // Helper function to draw text
    const drawText = (text: string, x: number, y: number, options?: { font?: any; size?: number; color?: any; align?: 'left' | 'center' | 'right'; width?: number }) => {
      const font = options?.font || helvetica;
      const size = options?.size || 10;
      const color = options?.color || BLACK;
      const align = options?.align || 'left';
      const maxWidth = options?.width || 200;
      
      // Truncate text if too long
      let displayText = text;
      let textWidth = font.widthOfTextAtSize(text, size);
      while (textWidth > maxWidth && displayText.length > 3) {
        displayText = displayText.slice(0, -4) + '...';
        textWidth = font.widthOfTextAtSize(displayText, size);
      }
      
      let xPos = x;
      
      if (align === 'center') {
        xPos = x + (maxWidth - textWidth) / 2;
      } else if (align === 'right') {
        xPos = x + maxWidth - textWidth;
      }
      
      page.drawText(displayText, { x: xPos, y, size, font, color });
    };
    
    let yPos = height - 50;
    
    // =====================
    // HEADER SECTION
    // =====================
    
    // Company name
    drawText(invoice.company.name, 50, yPos, { font: helveticaBold, size: 22 });
    yPos -= 25;
    
    // Company address
    drawText(invoice.company.address, 50, yPos, { font: helvetica, size: 9, color: DARK_GRAY });
    yPos -= 14;
    drawText(invoice.company.city, 50, yPos, { font: helvetica, size: 9, color: DARK_GRAY });
    yPos -= 14;
    
    // GST/PAN info
    drawText(`PAN: ${invoice.company.pan} | GST: ${invoice.company.gst}`, 50, yPos, { font: helvetica, size: 8, color: GRAY });
    yPos -= 20;
    
    // TAX INVOICE title on right
    drawText('TAX INVOICE', width - 145, height - 50, { font: helveticaBold, size: 16, align: 'right', width: 100 });
    
    // Invoice details box on right
    const rightX = width - 145;
    drawText(`Invoice #: ${invoice.invoiceNumber}`, rightX, height - 73, { font: helvetica, size: 10, align: 'right', width: 100 });
    drawText(`Date: ${invoice.date}`, rightX, height - 88, { font: helvetica, size: 10, align: 'right', width: 100 });
    
    // Payment status
    if (invoice.paymentStatus === 'PAID') {
      drawText('PAID', rightX, height - 103, { font: helveticaBold, size: 10, color: GREEN, align: 'right', width: 100 });
    }
    
    // Horizontal line
    page.drawLine({ start: { x: 50, y: height - 125 }, end: { x: width - 50, y: height - 125 }, color: LIGHT_GRAY, thickness: 1 });
    
    yPos = height - 145;
    
    // =====================
    // BILL TO SECTION (Single box)
    // =====================
    const boxWidth = 245;
    const boxHeight = 90;
    page.drawRectangle({ x: 50, y: yPos - boxHeight + 15, width: boxWidth, height: boxHeight, borderColor: LIGHT_GRAY, borderWidth: 1 });
    drawText('BILL TO / SHIP TO', 60, yPos - 55, { font: helveticaBold, size: 9, color: GRAY });
    
    const addrY = yPos - 40;
    let addrYPos = addrY;
    
    // Customer name (company or individual)
    if (invoice.customer.name) {
      drawText(invoice.customer.name, 60, addrYPos, { font: helveticaBold, size: 10 });
      addrYPos -= 14;
    }
    
    // Customer address
    if (invoice.customer.address) {
      // Split address into multiple lines if too long
      const addressParts = invoice.customer.address.split(', ');
      addressParts.forEach((part) => {
        if (addrYPos > yPos - boxHeight + 20) {
          drawText(part, 60, addrYPos, { font: helvetica, size: 10 });
          addrYPos -= 14;
        }
      });
    }
    
    // Phone
    if (invoice.customer.phone) {
      drawText(`Ph: ${invoice.customer.phone}`, 60, addrYPos, { font: helvetica, size: 10 });
    }
    
    yPos -= 110;
    
    // =====================
    // ORDER DETAILS SECTION
    // =====================
    drawText('Order Details', 50, yPos, { font: helveticaBold, size: 9, color: GRAY });
    yPos -= 15;
    
    if (invoice.orderNumber) {
      drawText(`Order #: ${invoice.orderNumber}`, 50, yPos, { font: helvetica, size: 10, color: DARK_GRAY });
      yPos -= 14;
    }
    drawText(`Payment: ${invoice.paymentMethod}`, 50, yPos, { font: helvetica, size: 10, color: DARK_GRAY });
    yPos -= 14;
    drawText(`Status: ${invoice.status}`, 50, yPos, { font: helvetica, size: 10, color: DARK_GRAY });
    
    yPos -= 15;
    
    // Horizontal line
    page.drawLine({ start: { x: 50, y: yPos }, end: { x: width - 50, y: yPos }, color: LIGHT_GRAY, thickness: 1 });
    
    yPos -= 20;
    
    // =====================
    // LINE ITEMS TABLE
    // =====================
    const tableTop = yPos;
    const headers = ['Item', 'Description', 'Qty', 'Rate', 'Amount'];
    const colPositions = [50, 160, 365, 420, 490];
    const colWidths = [110, 205, 55, 70, 95];
    
    // Table header background
    page.drawRectangle({ x: 50, y: tableTop - 5, width: 495, height: 20, color: rgb(0.96, 0.96, 0.96) });
    
    headers.forEach((header, i) => {
      const x = colPositions[i];
      const align = i >= 3 ? 'right' : 'left';
      drawText(header, x, tableTop, { font: helveticaBold, size: 9, color: DARK_GRAY, align, width: colWidths[i] });
    });
    
    yPos = tableTop + 20;
    
    // Table rows
    let rowIndex = 0;
    
    invoice.items.forEach((item) => {
      const rowTop = yPos;
      const rowHeight = 36; // Increased height for multiline descriptions
      
      // Alternating row colors
      if (rowIndex % 2 === 1) {
        page.drawRectangle({ x: 50, y: rowTop, width: 495, height: rowHeight, color: rgb(0.98, 0.98, 0.98) });
      }
      
      // Item name
      drawText(item.name, colPositions[0], rowTop + 12, { font: helvetica, size: 9, width: colWidths[0] });
      
      // Description (handle multiline)
      const descLines = [];
      let descStr = item.description;
      while (descStr.length > 30) {
        descLines.push(descStr.slice(0, 30));
        descStr = descStr.slice(30);
      }
      descLines.push(descStr);
      
      descLines.slice(0, 2).forEach((line, idx) => {
        drawText(line, colPositions[1], rowTop + 12 - (idx * 12), { font: helvetica, size: 8, color: GRAY, width: colWidths[1] });
      });
      
      // Quantity
      drawText(String(item.quantity), colPositions[2], rowTop + 12, { font: helvetica, size: 9, align: 'center', width: colWidths[2] });
      
      // Rate
      drawText(formatCurrency(item.rate), colPositions[3], rowTop + 12, { font: helvetica, size: 9, align: 'right', width: colWidths[3] });
      
      // Amount
      drawText(formatCurrency(item.amount), colPositions[4], rowTop + 12, { font: helveticaBold, size: 9, align: 'right', width: colWidths[4] });
      
      yPos = rowTop + rowHeight;
      rowIndex++;
    });
    
    yPos += 10;
    
    // Horizontal line after table
    page.drawLine({ start: { x: 50, y: yPos }, end: { x: width - 50, y: yPos }, color: LIGHT_GRAY, thickness: 1 });
    
    yPos += 15;
    
    // =====================
    // TOTALS SECTION
    // =====================
    const totalsLeft = 370;
    const totalsRight = width - 55;
    
    // Subtotal
    drawText('Subtotal:', totalsLeft, yPos, { font: helvetica, size: 10, color: DARK_GRAY, align: 'right', width: 115 });
    drawText(formatCurrency(invoice.totals.subtotal), totalsRight, yPos, { font: helveticaBold, size: 10, align: 'right', width: 95 });
    yPos += 12;
    
    // Tax
    if (invoice.totals.taxAmount > 0) {
      drawText('Tax (GST):', totalsLeft, yPos, { font: helvetica, size: 10, color: DARK_GRAY, align: 'right', width: 115 });
      drawText(formatCurrency(invoice.totals.taxAmount), totalsRight, yPos, { font: helveticaBold, size: 10, align: 'right', width: 95 });
      yPos += 12;
    }
    
    // Discount
    if (invoice.totals.discountAmount > 0) {
      drawText('Discount:', totalsLeft, yPos, { font: helvetica, size: 10, color: GRAY, align: 'right', width: 115 });
      drawText(`-${formatCurrency(invoice.totals.discountAmount)}`, totalsRight, yPos, { font: helveticaBold, size: 10, color: GREEN, align: 'right', width: 95 });
      yPos += 12;
    }
    
    // Total line
    page.drawLine({ start: { x: totalsLeft, y: yPos + 5 }, end: { x: width - 50, y: yPos + 5 }, color: BLACK, thickness: 1 });
    
    yPos += 15;
    
    // Total
    drawText('TOTAL:', totalsLeft, yPos, { font: helveticaBold, size: 12 });
    drawText(formatCurrency(invoice.totals.total), totalsRight, yPos, { font: helveticaBold, size: 14, align: 'right', width: 95 });
    
    yPos += 35;
    
    // =====================
    // RECURRING BILLING INFO
    // =====================
    if (invoice.recurringInfo && invoice.recurringInfo.hasRecurring) {
      // Draw a nice box for recurring info
      page.drawRectangle({ x: 50, y: yPos - 30, width: 495, height: 35, color: rgb(1, 0.98, 0.9) });
      
      const recurringText = invoice.recurringInfo.items.map(item => 
        `${item.name}: ${formatCurrency(item.amount)} every 1 ${item.period}`
      ).join(' | ');
      
      drawText('Recurring Billing:', 60, yPos, { font: helveticaBold, size: 10, color: rgb(0.55, 0.35, 0.05) });
      yPos -= 15;
      drawText(recurringText, 60, yPos, { font: helvetica, size: 9, color: rgb(0.55, 0.35, 0.05), width: 475 });
      
      yPos += 5;
    }
    
    yPos -= 30;
    
    // =====================
    // FOOTER SECTION
    // =====================
    drawText('Thank you for your business!', width / 2, yPos, { font: helvetica, size: 10, color: GRAY, align: 'center', width: width - 100 });
    yPos -= 18;
    drawText(`${invoice.company.name} | ${invoice.company.address}`, width / 2, yPos, { font: helvetica, size: 8, color: DARK_GRAY, align: 'center', width: width - 100 });
    yPos -= 14;
    drawText(`Email: ${invoice.company.email} | Phone: ${invoice.company.phone}`, width / 2, yPos, { font: helvetica, size: 8, color: DARK_GRAY, align: 'center', width: width - 100 });
    
    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
