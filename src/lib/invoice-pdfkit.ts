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
 * Format currency for PDF (uses Rs. instead of ₹ for compatibility with standard fonts)
 */
function formatCurrency(amount: number): string {
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
 * Generate professional PDF invoice using pdf-lib
 */
export async function generateInvoicePDF(order: Order): Promise<Buffer> {
  try {
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
      const width = options?.width || 200;
      
      const textWidth = font.widthOfTextAtSize(text, size);
      let xPos = x;
      
      if (align === 'center') {
        xPos = x + (width - textWidth) / 2;
      } else if (align === 'right') {
        xPos = x + width - textWidth;
      }
      
      page.drawText(text, { x: xPos, y, size, font, color });
    };
    
    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();
    
    let yPos = height - 50;
    
    // Company name
    drawText('SHAURRYA TELESERVICES', 50, yPos, { font: helveticaBold, size: 22 });
    yPos -= 25;
    
    // Company address
    drawText('Laxmi Plaza, 213, Off New Link Rd, Laxmi Industrial Estate', 50, yPos, { font: helvetica, size: 9, color: DARK_GRAY });
    yPos -= 14;
    drawText('Milat Nagar, Andheri West, Mumbai, Maharashtra 400053', 50, yPos, { font: helvetica, size: 9, color: DARK_GRAY });
    yPos -= 14;
    
    // GST/PAN info
    drawText('PAN: ABCCS1234A | GST: 27ABCCS1234A1Z9', 50, yPos, { font: helvetica, size: 8, color: GRAY });
    yPos -= 20;
    
    // TAX INVOICE title on right
    drawText('TAX INVOICE', width - 145, height - 50, { font: helveticaBold, size: 16, align: 'right', width: 100 });
    
    // Invoice details box on right
    const rightX = width - 145;
    drawText(`Invoice #: ${invoiceNumber}`, rightX, height - 73, { font: helvetica, size: 10, align: 'right', width: 100 });
    drawText(`Date: ${formatDate(order.createdAt)}`, rightX, height - 88, { font: helvetica, size: 10, align: 'right', width: 100 });
    
    // Payment status
    if (order.paymentStatus === 'PAID') {
      drawText('PAID', rightX, height - 103, { font: helveticaBold, size: 10, color: GREEN, align: 'right', width: 100 });
    }
    
    // Horizontal line
    page.drawLine({ start: { x: 50, y: height - 125 }, end: { x: width - 50, y: height - 125 }, color: LIGHT_GRAY, thickness: 1 });
    
    yPos = height - 145;
    
    // Bill To box
    const boxWidth = 245;
    const boxHeight = 80;
    page.drawRectangle({ x: 50, y: yPos - boxHeight + 15, width: boxWidth, height: boxHeight, borderColor: LIGHT_GRAY, borderWidth: 1 });
    drawText('BILL TO', 60, yPos - 55, { font: helveticaBold, size: 9, color: GRAY });
    
    const addrY = yPos - 40;
    const shippingAddr = order.shippingAddress;
    let addrYPos = addrY;
    
    if (shippingAddr?.company) {
      drawText(shippingAddr.company, 60, addrYPos, { font: helveticaBold, size: 10 });
      addrYPos -= 14;
    }
    
    if (shippingAddr?.firstName || shippingAddr?.lastName) {
      drawText(`${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`, 60, addrYPos, { font: helvetica, size: 10 });
      addrYPos -= 14;
    }
    
    if (shippingAddr?.address1) {
      drawText(shippingAddr.address1, 60, addrYPos, { font: helvetica, size: 10 });
      addrYPos -= 14;
    }
    
    const cityLine = `${shippingAddr?.city || ''}${shippingAddr?.city && shippingAddr?.state ? ', ' : ''}${shippingAddr?.state || ''} ${shippingAddr?.postalCode || ''}`;
    if (cityLine.trim()) {
      drawText(cityLine, 60, addrYPos, { font: helvetica, size: 10 });
      addrYPos -= 14;
    }
    
    if (shippingAddr?.phone) {
      drawText(`Ph: ${shippingAddr.phone}`, 60, addrYPos, { font: helvetica, size: 10 });
    }
    
    // Ship To box
    const shipX = 320;
    page.drawRectangle({ x: shipX, y: yPos - boxHeight + 15, width: boxWidth, height: boxHeight, borderColor: LIGHT_GRAY, borderWidth: 1 });
    drawText('SHIP TO', shipX + 10, yPos - 55, { font: helveticaBold, size: 9, color: GRAY });
    
    let shipYPos = addrY;
    if (shippingAddr?.company) {
      drawText(shippingAddr.company, shipX + 10, shipYPos, { font: helveticaBold, size: 10 });
      shipYPos -= 14;
    }
    
    if (shippingAddr?.firstName || shippingAddr?.lastName) {
      drawText(`${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`, shipX + 10, shipYPos, { font: helvetica, size: 10 });
      shipYPos -= 14;
    }
    
    if (shippingAddr?.address1) {
      drawText(shippingAddr.address1, shipX + 10, shipYPos, { font: helvetica, size: 10 });
      shipYPos -= 14;
    }
    
    if (cityLine.trim()) {
      drawText(cityLine, shipX + 10, shipYPos, { font: helvetica, size: 10 });
    }
    
    yPos -= 95;
    
    // Order Details
    drawText('Order Details', 50, yPos, { font: helveticaBold, size: 9, color: GRAY });
    yPos -= 15;
    
    if (order.orderNumber) {
      drawText(`Order #: ${order.orderNumber}`, 50, yPos, { font: helvetica, size: 10, color: DARK_GRAY });
      yPos -= 14;
    }
    drawText(`Payment: ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}`, 50, yPos, { font: helvetica, size: 10, color: DARK_GRAY });
    yPos -= 14;
    drawText(`Status: ${order.paymentStatus || order.status || 'Pending'}`, 50, yPos, { font: helvetica, size: 10, color: DARK_GRAY });
    
    yPos -= 15;
    
    // Horizontal line
    page.drawLine({ start: { x: 50, y: yPos }, end: { x: width - 50, y: yPos }, color: LIGHT_GRAY, thickness: 1 });
    
    yPos -= 20;
    
    // Table Headers
    const tableTop = yPos;
    const headers = ['Item', 'Description', 'Qty', 'Rate', 'Amount'];
    const colPositions = [50, 170, 370, 420, 490];
    const colWidths = [120, 200, 50, 70, 95];
    
    // Table header background
    page.drawRectangle({ x: 50, y: tableTop - 5, width: 495, height: 20, color: rgb(0.96, 0.96, 0.96) });
    
    headers.forEach((header, i) => {
      const x = colPositions[i];
      const align = i === 4 ? 'right' : 'left';
      drawText(header, x, tableTop, { font: helveticaBold, size: 9, color: DARK_GRAY, align, width: colWidths[i] });
    });
    
    yPos = tableTop + 20;
    
    // Table rows
    const items = order.items || [];
    let rowIndex = 0;
    
    items.forEach((item) => {
      const rowTop = yPos;
      const itemTotal = Number(item.totalPrice) || 0;
      
      // Alternating row colors
      if (rowIndex % 2 === 1) {
        page.drawRectangle({ x: 50, y: rowTop, width: 495, height: 18, color: rgb(0.98, 0.98, 0.98) });
      }
      
      // Item name
      drawText(item.name || '', colPositions[0], rowTop + 5, { font: helvetica, size: 9, width: colWidths[0] });
      
      // Description
      let description = '';
      if (item.configuration && typeof item.configuration === 'object') {
        const configEntries = Object.entries(item.configuration);
        if (configEntries.length > 0) {
          description = configEntries.map(([key, value]) => `${key}: ${value}`).join(', ');
        }
      }
      if (!description) description = '-';
      drawText(description.substring(0, 40), colPositions[1], rowTop + 5, { font: helvetica, size: 9, width: colWidths[1] });
      
      // Quantity
      drawText(String(item.quantity || 1), colPositions[2], rowTop + 5, { font: helvetica, size: 9, align: 'center', width: colWidths[2] });
      
      // Rate
      drawText(formatCurrency(Number(item.unitPrice) || 0), colPositions[3], rowTop + 5, { font: helvetica, size: 9, align: 'right', width: colWidths[3] });
      
      // Amount
      drawText(formatCurrency(itemTotal), colPositions[4], rowTop + 5, { font: helveticaBold, size: 9, align: 'right', width: colWidths[4] });
      
      yPos = rowTop + 18;
      rowIndex++;
    });
    
    yPos += 10;
    
    // Horizontal line
    page.drawLine({ start: { x: 50, y: yPos }, end: { x: width - 50, y: yPos }, color: LIGHT_GRAY, thickness: 1 });
    
    yPos += 15;
    
    // Totals
    const totalsLeft = 370;
    const totalsRight = width - 55;
    
    // Subtotal
    drawText('Subtotal:', totalsLeft, yPos, { font: helvetica, size: 10, color: DARK_GRAY, align: 'right', width: 115 });
    drawText(formatCurrency(Number(order.subtotal) || 0), totalsRight, yPos, { font: helveticaBold, size: 10, align: 'right', width: 95 });
    yPos += 12;
    
    // Tax
    if (order.taxAmount && Number(order.taxAmount) > 0) {
      drawText('Tax (GST):', totalsLeft, yPos, { font: helvetica, size: 10, color: DARK_GRAY, align: 'right', width: 115 });
      drawText(formatCurrency(Number(order.taxAmount)), totalsRight, yPos, { font: helveticaBold, size: 10, align: 'right', width: 95 });
      yPos += 12;
    }
    
    // Discount
    if (order.discountAmount && Number(order.discountAmount) > 0) {
      drawText('Discount:', totalsLeft, yPos, { font: helvetica, size: 10, color: GRAY, align: 'right', width: 115 });
      drawText(`-${formatCurrency(Number(order.discountAmount))}`, totalsRight, yPos, { font: helveticaBold, size: 10, color: GREEN, align: 'right', width: 95 });
      yPos += 12;
    }
    
    // Total line
    page.drawLine({ start: { x: totalsLeft, y: yPos + 5 }, end: { x: width - 50, y: yPos + 5 }, color: BLACK, thickness: 1 });
    
    yPos += 15;
    
    // Total
    drawText('TOTAL:', totalsLeft, yPos, { font: helveticaBold, size: 12 });
    drawText(formatCurrency(Number(order.total) || 0), totalsRight, yPos, { font: helveticaBold, size: 14, align: 'right', width: 95 });
    
    yPos += 30;
    
    // Recurring Info
    const recurringItem = items.find(item => item.isRecurring);
    if (recurringItem && recurringItem.billingCycle && recurringItem.billingCycle !== 'ONE_TIME') {
      const recurringAmount = Number(recurringItem.recurringPrice) || 0;
      const period = recurringItem.billingCycle === 'YEARLY' ? 'year' : 'month';
      
      page.drawRectangle({ x: 50, y: yPos - 5, width: 495, height: 25, color: rgb(1, 0.98, 0.9) });
      drawText(`You will be charged ${formatCurrency(recurringAmount)} every 1 ${period} after purchase.`, 60, yPos + 3, { font: helvetica, size: 10, color: rgb(0.55, 0.35, 0.05), width: 475 });
      
      yPos += 35;
    }
    
    yPos -= 20;
    
    // Footer
    drawText('Thank you for your business!', width / 2, yPos, { font: helvetica, size: 9, color: GRAY, align: 'center', width: width - 100 });
    yPos -= 15;
    drawText('Shaurrya Teleservices | Laxmi Plaza, 213, Off New Link Rd, Andheri West, Mumbai 400053', width / 2, yPos, { font: helvetica, size: 8, color: DARK_GRAY, align: 'center', width: width - 100 });
    yPos -= 12;
    drawText('Email: info@shaurryatele.com | Phone: +91 99102 05084', width / 2, yPos, { font: helvetica, size: 8, color: DARK_GRAY, align: 'center', width: width - 100 });
    
    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
