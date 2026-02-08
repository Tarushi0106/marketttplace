import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Order } from '@/types';

// Company configuration
const COMPANY_CONFIG = {
  name: 'Marketplace Inc.',
  address: '123 Commerce Street, Business City, BC 12345',
  phone: '+91 98765 43210',
  email: 'support@marketplace.com',
  taxId: 'TAX-123456789',
  website: 'www.marketplace.com',
};

/**
 * Generate a unique invoice number
 */
export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `INV-${year}-${random}`;
}

/**
 * Format currency value
 */
function formatCurrency(value: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Get full address as string
 */
function getAddressString(address: any): string {
  if (!address) return '';
  
  const parts = [
    address.company ? `${address.company}` : '',
    `${address.firstName || ''} ${address.lastName || ''}`.trim(),
    address.address1 || '',
    address.address2 || '',
    `${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`.trim(),
    address.country || '',
    address.phone || '',
  ].filter(Boolean);
  
  return parts.join('\n');
}

/**
 * Generate a PDF invoice for an order
 */
export async function generateInvoicePDF(order: Order): Promise<Buffer> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed standard fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add a page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width } = page.getSize();
    
    const fontSize = {
      title: 24,
      subtitle: 12,
      header: 11,
      body: 10,
      small: 9,
    };
    
    const primaryColor = rgb(0.1, 0.1, 0.1);
    const secondaryColor = rgb(0.4, 0.4, 0.4);
    const lightGray = rgb(0.9, 0.9, 0.9);
    const darkGray = rgb(0.2, 0.2, 0.2);
    const white = rgb(1, 1, 1);
    const red = rgb(0.86, 0.08, 0.24);
    
    // ==================== HEADER SECTION ====================
    // Company name
    page.drawText(COMPANY_CONFIG.name, {
      x: 50,
      y: 780,
      size: fontSize.title,
      font: helveticaBold,
      color: primaryColor,
    });
    
    // Invoice title
    page.drawText('INVOICE', {
      x: 450,
      y: 780,
      size: 20,
      font: helveticaFont,
      color: primaryColor,
    });
    
    // Company details (left side)
    let yPos = 750;
    page.drawText(COMPANY_CONFIG.address, {
      x: 50,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });
    
    yPos -= 14;
    page.drawText(COMPANY_CONFIG.phone, {
      x: 50,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });
    
    yPos -= 14;
    page.drawText(COMPANY_CONFIG.email, {
      x: 50,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });
    
    yPos -= 14;
    page.drawText(COMPANY_CONFIG.website, {
      x: 50,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });
    
    yPos -= 14;
    page.drawText(`Tax ID: ${COMPANY_CONFIG.taxId}`, {
      x: 50,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });
    
    // Invoice details (right side)
    const invoiceNumber = generateInvoiceNumber();
    let rightY = 750;
    const rightX = 350;
    
    // Invoice number
    page.drawText('Invoice #:', {
      x: rightX,
      y: rightY,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText(invoiceNumber, {
      x: rightX + 150,
      y: rightY,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    rightY -= 16;
    // Order number
    page.drawText('Order #:', {
      x: rightX,
      y: rightY,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText(order.orderNumber, {
      x: rightX + 150,
      y: rightY,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    rightY -= 16;
    // Date
    page.drawText('Date:', {
      x: rightX,
      y: rightY,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText(formatDate(order.createdAt), {
      x: rightX + 150,
      y: rightY,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    rightY -= 16;
    // Payment Status
    page.drawText('Payment Status:', {
      x: rightX,
      y: rightY,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText(order.paymentStatus, {
      x: rightX + 150,
      y: rightY,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    rightY -= 16;
    // Payment Method
    page.drawText('Payment Method:', {
      x: rightX,
      y: rightY,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText(order.paymentMethod || 'N/A', {
      x: rightX + 150,
      y: rightY,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    // ==================== BILL TO SECTION ====================
    yPos = 620;
    
    page.drawText('BILL TO:', {
      x: 50,
      y: yPos,
      size: fontSize.header,
      font: helveticaBold,
      color: primaryColor,
    });
    
    yPos -= 18;
    const billingAddress = order.shippingAddress;
    const billingText = billingAddress ? getAddressString(billingAddress) : order.email;
    page.drawText(billingText, {
      x: 50,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    
    page.drawText('SHIP TO:', {
      x: 350,
      y: 620,
      size: fontSize.header,
      font: helveticaBold,
      color: primaryColor,
    });
    
    const shippingText = order.shippingAddress ? getAddressString(order.shippingAddress) : order.email;
    page.drawText(shippingText, {
      x: 350,
      y: 602,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    
    // ==================== LINE ITEMS TABLE ====================
    yPos = 560;
    
    // Table header background
    page.drawRectangle({
      x: 50,
      y: yPos - 5,
      width: 495,
      height: 25,
      color: lightGray,
    });
    
    // Table headers
    page.drawText('Item', {
      x: 55,
      y: yPos + 2,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText('Qty', {
      x: 350,
      y: yPos + 2,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText('Unit Price', {
      x: 420,
      y: yPos + 2,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText('Total', {
      x: 520,
      y: yPos + 2,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    
    yPos += 25;
    const rowHeight = 22;
    
    // Draw line items
    order.items.forEach((item, index) => {
      const isEven = index % 2 === 0;
      if (isEven) {
        page.drawRectangle({
          x: 50,
          y: yPos - 5,
          width: 495,
          height: rowHeight,
          color: rgb(0.98, 0.98, 0.98),
        });
      }
      
      // Item name
      const itemName = item.name.length > 35 
        ? item.name.substring(0, 32) + '...' 
        : item.name;
      page.drawText(itemName, {
        x: 55,
        y: yPos,
        size: fontSize.body,
        font: helveticaFont,
        color: primaryColor,
      });
      
      // Quantity
      page.drawText(item.quantity.toString(), {
        x: 350,
        y: yPos,
        size: fontSize.body,
        font: helveticaFont,
        color: primaryColor,
      });
      
      // Unit price
      page.drawText(formatCurrency(item.unitPrice, order.currency), {
        x: 420,
        y: yPos,
        size: fontSize.body,
        font: helveticaFont,
        color: primaryColor,
      });
      
      // Total
      page.drawText(formatCurrency(item.totalPrice, order.currency), {
        x: 520,
        y: yPos,
        size: fontSize.body,
        font: helveticaFont,
        color: primaryColor,
      });
      
      yPos += rowHeight;
    });
    
    // ==================== TOTALS SECTION ====================
    yPos += 20;
    
    page.drawText('Subtotal:', {
      x: 350,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    page.drawText(formatCurrency(order.subtotal, order.currency), {
      x: 520,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    yPos += 16;
    page.drawText('Discount:', {
      x: 350,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    if (order.discountAmount > 0) {
      page.drawText(`-${formatCurrency(order.discountAmount, order.currency)}`, {
        x: 520,
        y: yPos,
        size: fontSize.body,
        font: helveticaFont,
        color: red,
      });
    } else {
      page.drawText(formatCurrency(0, order.currency), {
        x: 520,
        y: yPos,
        size: fontSize.body,
        font: helveticaFont,
        color: secondaryColor,
      });
    }
    
    yPos += 16;
    page.drawText('Tax:', {
      x: 350,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    page.drawText(formatCurrency(order.taxAmount, order.currency), {
      x: 520,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    yPos += 16;
    page.drawText('Shipping:', {
      x: 350,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    page.drawText(formatCurrency(order.shippingAmount, order.currency), {
      x: 520,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    // Grand Total
    yPos += 22;
    page.drawRectangle({
      x: 350,
      y: yPos - 5,
      width: 195,
      height: 30,
      color: darkGray,
    });
    
    page.drawText('TOTAL:', {
      x: 360,
      y: yPos,
      size: fontSize.subtitle,
      font: helveticaBold,
      color: white,
    });
    page.drawText(formatCurrency(order.total, order.currency), {
      x: 520,
      y: yPos,
      size: fontSize.subtitle,
      font: helveticaBold,
      color: white,
    });
    
    // ==================== FOOTER SECTION ====================
    page.drawText('Payment Information:', {
      x: 50,
      y: 80,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    
    const paymentInfo = [
      `Payment Method: ${order.paymentMethod || 'N/A'}`,
      `Payment Status: ${order.paymentStatus}`,
      order.paymentId ? `Transaction ID: ${order.paymentId}` : '',
    ].filter(Boolean);
    
    page.drawText(paymentInfo.join('  |  '), {
      x: 50,
      y: 65,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });
    
    // Thank you message
    page.drawText('Thank you for your business!', {
      x: 50,
      y: 40,
      size: fontSize.subtitle,
      font: helveticaFont,
      color: primaryColor,
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    throw error;
  }
}

export type { Order };
