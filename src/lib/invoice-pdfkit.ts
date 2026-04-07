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
  // Use Rs. instead of ₹ symbol because StandardFonts.Helvetica cannot encode Unicode characters
  return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
 * Generate professional PDF invoice using pdf-lib - Modern Clean Grid Layout
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
    
    // Colors - Clean palette
    const PRIMARY = rgb(0.1, 0.1, 0.15);
    const SECONDARY = rgb(0.3, 0.3, 0.35);
    const ACCENT = rgb(0.15, 0.25, 0.45);
    const LIGHT_GRAY = rgb(0.96, 0.96, 0.97);
    const BORDER = rgb(0.9, 0.9, 0.9);
    const SUCCESS = rgb(0.1, 0.6, 0.2);
    const TEXT_MUTED = rgb(0.55, 0.55, 0.6);
    const WHITE = rgb(1, 1, 1);
    
    // Layout constants - 2 column grid
    const LEFT_MARGIN = 50;
    const RIGHT_MARGIN = 50;
    const CONTENT_WIDTH = width - LEFT_MARGIN - RIGHT_MARGIN;
    const COL_WIDTH = CONTENT_WIDTH / 2;
    const RIGHT_COL_START = LEFT_MARGIN + COL_WIDTH;
    
    // Helper function to draw text
    const drawText = (text: string, x: number, y: number, options?: { font?: any; size?: number; color?: any; align?: 'left' | 'center' | 'right'; width?: number }) => {
      const font = options?.font || helvetica;
      const size = options?.size || 10;
      const color = options?.color || PRIMARY;
      const align = options?.align || 'left';
      const maxWidth = options?.width || 200;
      
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
    
    // White background
    page.drawRectangle({ x: 0, y: 0, width: width, height: height, color: WHITE });
    
    // =====================
    // HEADER - 2 Column Grid
    // =====================
    let yPos = height - 50;
    
    // LEFT: Company info
    drawText(invoice.company.name, LEFT_MARGIN, yPos, { font: helveticaBold, size: 22, color: PRIMARY });
    yPos -= 20;
    drawText(invoice.company.address, LEFT_MARGIN, yPos, { font: helvetica, size: 9, color: SECONDARY });
    yPos -= 12;
    drawText(invoice.company.city, LEFT_MARGIN, yPos, { font: helvetica, size: 9, color: SECONDARY });
    yPos -= 12;
    drawText(`GST: ${invoice.company.gst}`, LEFT_MARGIN, yPos, { font: helvetica, size: 8, color: TEXT_MUTED });
    
    // RIGHT: Invoice info - align to right column start
    const rightX = RIGHT_COL_START;
    const rightColWidth = COL_WIDTH - 20;
    
    drawText('INVOICE', rightX, height - 50, { font: helveticaBold, size: 26, color: ACCENT, width: rightColWidth });
    drawText(`# ${invoice.invoiceNumber}`, rightX, height - 75, { font: helveticaBold, size: 10, color: PRIMARY, width: rightColWidth });
    drawText(`Date: ${invoice.date}`, rightX, height - 90, { font: helvetica, size: 10, color: SECONDARY, width: rightColWidth });
    
    // Status badge
    if (invoice.paymentStatus === 'PAID') {
      page.drawRectangle({ x: rightX, y: height - 115, width: 55, height: 18, color: rgb(0.95, 0.98, 0.95), borderColor: SUCCESS, borderWidth: 1 });
      drawText('PAID', rightX + 12, height - 110, { font: helveticaBold, size: 8, color: SUCCESS, width: 40 });
    } else {
      page.drawRectangle({ x: rightX, y: height - 115, width: 65, height: 18, color: rgb(0.98, 0.96, 0.92), borderColor: rgb(0.75, 0.55, 0.1), borderWidth: 1 });
      drawText('PENDING', rightX + 10, height - 110, { font: helveticaBold, size: 8, color: rgb(0.7, 0.5, 0.1), width: 50 });
    }
    
    // Track header bottom yPos
    const headerBottom = height - 140;
    
    // Header divider
    page.drawLine({ start: { x: LEFT_MARGIN, y: headerBottom }, end: { x: width - RIGHT_MARGIN, y: headerBottom }, color: BORDER, thickness: 1 });
    
    // =====================
    // BILL TO & ORDER DETAILS - 2 Column Grid
    // =====================
    yPos = headerBottom - 25;
    
    // LEFT: Bill To
    drawText('BILL TO', LEFT_MARGIN, yPos, { font: helveticaBold, size: 9, color: TEXT_MUTED });
    yPos -= 14;
    
    if (invoice.customer.name) {
      drawText(invoice.customer.name, LEFT_MARGIN, yPos, { font: helveticaBold, size: 10, color: PRIMARY });
      yPos -= 12;
    }
    
    if (invoice.customer.address) {
      const addressParts = invoice.customer.address.split(', ');
      addressParts.slice(0, 3).forEach((part) => {
        if (part.trim()) {
          drawText(part, LEFT_MARGIN, yPos, { font: helvetica, size: 9, color: SECONDARY });
          yPos -= 11;
        }
      });
    }
    
    if (invoice.customer.email) {
      drawText(invoice.customer.email, LEFT_MARGIN, yPos, { font: helvetica, size: 8, color: TEXT_MUTED });
      yPos -= 10;
    }
    if (invoice.customer.phone) {
      drawText(invoice.customer.phone, LEFT_MARGIN, yPos, { font: helvetica, size: 8, color: TEXT_MUTED });
    }
    
    // RIGHT: Order Details
    let rightY = headerBottom - 25;
    drawText('ORDER DETAILS', rightX, rightY, { font: helveticaBold, size: 9, color: TEXT_MUTED, width: rightColWidth });
    rightY -= 14;
    
    if (invoice.orderNumber) {
      drawText(`Order #: ${invoice.orderNumber}`, rightX, rightY, { font: helvetica, size: 10, color: SECONDARY, width: rightColWidth });
      rightY -= 12;
    }
    
    drawText(`Payment: ${invoice.paymentMethod || 'N/A'}`, rightX, rightY, { font: helvetica, size: 10, color: SECONDARY, width: rightColWidth });
    rightY -= 12;
    
    const statusColor = invoice.status === 'COMPLETED' || invoice.status === 'DELIVERED' ? SUCCESS : SECONDARY;
    drawText(`Status: ${invoice.status || 'N/A'}`, rightX, rightY, { font: helvetica, size: 10, color: statusColor, width: rightColWidth });
    
    // Determine the lower of the two columns
    const detailsBottom = Math.min(yPos, rightY) - 15;
    
    // Divider after details
    page.drawLine({ start: { x: LEFT_MARGIN, y: detailsBottom }, end: { x: width - RIGHT_MARGIN, y: detailsBottom }, color: BORDER, thickness: 1 });
    
    // =====================
    // FULL WIDTH TABLE
    // =====================
    yPos = detailsBottom - 20;
    
    // Table header
    page.drawRectangle({ x: LEFT_MARGIN, y: yPos - 4, width: CONTENT_WIDTH, height: 24, color: LIGHT_GRAY });
    
    const tableCols = [
      { name: 'Item', x: LEFT_MARGIN + 10, w: 260 },
      { name: 'Qty', x: LEFT_MARGIN + 320, w: 50, align: 'right' as const },
      { name: 'Rate', x: LEFT_MARGIN + 380, w: 80, align: 'right' as const },
      { name: 'Amount', x: LEFT_MARGIN + 470, w: 70, align: 'right' as const }
    ];
    
    tableCols.forEach(col => {
      drawText(col.name, col.x, yPos, { font: helveticaBold, size: 9, color: SECONDARY, align: col.align || 'left', width: col.w });
    });
    
    yPos += 24;
    
    // Table rows
    invoice.items.forEach((item, idx) => {
      const rowHeight = 28;
      
      // Alternating background
      if (idx % 2 === 0) {
        page.drawRectangle({ x: LEFT_MARGIN, y: yPos, width: CONTENT_WIDTH, height: rowHeight, color: WHITE });
      }
      
      // Bottom border
      page.drawLine({ start: { x: LEFT_MARGIN, y: yPos + rowHeight }, end: { x: width - RIGHT_MARGIN, y: yPos + rowHeight }, color: BORDER, thickness: 0.5 });
      
      // Item name
      drawText(item.name || 'Item', tableCols[0].x, yPos + 8, { font: helvetica, size: 9, color: PRIMARY, width: tableCols[0].w });
      
      // Description if exists
      if (item.description) {
        drawText(item.description.substring(0, 50), tableCols[0].x, yPos - 2, { font: helvetica, size: 7, color: TEXT_MUTED, width: tableCols[0].w });
      }
      
      // Quantity, Rate, Amount
      drawText(String(item.quantity || 1), tableCols[1].x, yPos + 8, { font: helvetica, size: 9, color: SECONDARY, align: 'right', width: tableCols[1].w });
      drawText(formatCurrency(item.rate), tableCols[2].x, yPos + 8, { font: helvetica, size: 9, color: SECONDARY, align: 'right', width: tableCols[2].w });
      drawText(formatCurrency(item.amount), tableCols[3].x, yPos + 8, { font: helveticaBold, size: 9, color: PRIMARY, align: 'right', width: tableCols[3].w });
      
      yPos += rowHeight;
    });
    
    yPos += 10;
    
    // Table bottom border
    page.drawLine({ start: { x: LEFT_MARGIN, y: yPos }, end: { x: width - RIGHT_MARGIN, y: yPos }, color: BORDER, thickness: 1 });
    
    yPos += 15;
    
    // =====================
    // TOTALS - Right aligned
    // =====================
    const totalsWidth = 180;
    const totalsX = width - RIGHT_MARGIN - totalsWidth;
    
    // Subtotal row
    drawText('Subtotal', totalsX, yPos, { font: helvetica, size: 10, color: SECONDARY });
    drawText(formatCurrency(invoice.totals.subtotal), totalsX + totalsWidth, yPos, { font: helvetica, size: 10, color: PRIMARY, align: 'right', width: totalsWidth });
    yPos -= 14;
    
    // Tax row
    if (invoice.totals.taxAmount > 0) {
      drawText('Tax', totalsX, yPos, { font: helvetica, size: 10, color: SECONDARY });
      drawText(formatCurrency(invoice.totals.taxAmount), totalsX + totalsWidth, yPos, { font: helvetica, size: 10, color: PRIMARY, align: 'right', width: totalsWidth });
      yPos -= 14;
    }
    
    // Discount row
    if (invoice.totals.discountAmount > 0) {
      drawText('Discount', totalsX, yPos, { font: helvetica, size: 10, color: SUCCESS });
      drawText(`-${formatCurrency(invoice.totals.discountAmount)}`, totalsX + totalsWidth, yPos, { font: helvetica, size: 10, color: SUCCESS, align: 'right', width: totalsWidth });
      yPos -= 14;
    }
    
    // Total line
    page.drawLine({ start: { x: totalsX, y: yPos + 2 }, end: { x: width - RIGHT_MARGIN, y: yPos + 2 }, color: BORDER, thickness: 1 });
    yPos -= 4;
    
    // Total
    drawText('Total', totalsX, yPos, { font: helveticaBold, size: 11, color: PRIMARY });
    drawText(formatCurrency(invoice.totals.total), totalsX + totalsWidth, yPos, { font: helveticaBold, size: 13, color: ACCENT, align: 'right', width: totalsWidth });
    
    yPos -= 20;
    
    // =====================
    // RECURRING INFO - Inline text (no colored bar)
    // =====================
    if (invoice.recurringInfo && invoice.recurringInfo.hasRecurring) {
      const recurringInfo = invoice.recurringInfo.items.map(item => 
        `${item.name}: Rs. ${item.amount.toLocaleString('en-IN')}/${item.period}`
      ).join(' | ');
      
      drawText(`Recurring: ${recurringInfo}`, LEFT_MARGIN, yPos, { font: helvetica, size: 9, color: SECONDARY, width: CONTENT_WIDTH });
      yPos -= 15;
    }
    
    // =====================
    // FOOTER
    // =====================
    // Calculate footer position based on content
    const minFooterY = 90;
    if (yPos < minFooterY) {
      yPos = minFooterY;
    }
    
    page.drawLine({ start: { x: LEFT_MARGIN, y: yPos }, end: { x: width - RIGHT_MARGIN, y: yPos }, color: BORDER, thickness: 1 });
    yPos -= 15;
    
    drawText('Thank you for your business!', width / 2, yPos, { font: helvetica, size: 10, color: SECONDARY, align: 'center', width: CONTENT_WIDTH });
    yPos -= 12;
    drawText(`${invoice.company.name} | ${invoice.company.email} | ${invoice.company.phone}`, width / 2, yPos, { font: helvetica, size: 8, color: TEXT_MUTED, align: 'center', width: CONTENT_WIDTH });
    yPos -= 10;
    drawText('Computer-generated invoice. No signature required.', width / 2, yPos, { font: helvetica, size: 7, color: TEXT_MUTED, align: 'center', width: CONTENT_WIDTH });
    
    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
