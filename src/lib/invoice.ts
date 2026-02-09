import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Order } from '@/types';
import path from 'path';
import { readFile } from 'fs/promises';

// Company configuration
const COMPANY_CONFIG = {
  name: 'Shaurryya Teleservices Pvt Ltd',
  address: 'Plot No. 45, Sector 12, Industrial Area',
  city: 'Noida',
  state: 'Uttar Pradesh',
  pincode: '201301',
  phone: '+91 98765 43210',
  email: 'info@shaurryateleservices.com',
  gstin: '09AABCS1234A1Z5',
  website: 'www.shaurryateleservices.com',
  logoPath: '/uploads/branding/iconf.png', // Company logo path
};

// Bank details
const BANK_DETAILS = {
  bankName: 'HDFC Bank',
  accountNumber: '50100234567890',
  ifscCode: 'HDFC0001234',
  branch: 'Sector 12, Noida',
};

/**
 * Generate a unique invoice number
 */
export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `INV-${year}${month}-${random}`;
}

/**
 * Format currency value
 */
function formatCurrency(value: number, currency: string = 'INR'): string {
  // Use Rs. instead of ₹ symbol since standard PDF fonts don't support it
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value).replace('₹', 'Rs.');
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
 * Get configuration string from item configuration
 */
function getConfigurationString(configuration: Record<string, string> | null): string {
  if (!configuration) return '';
  
  const configLabels: Record<string, string> = {
    cpu: 'CPU',
    ram: 'RAM',
    storage: 'Storage',
    tier: 'Tier',
    os: 'OS',
    bandwidth: 'Bandwidth',
    gpu: 'GPU',
    data_center: 'Data Center',
  };
  
  const parts = [];
  for (const [key, value] of Object.entries(configuration)) {
    const label = configLabels[key.toLowerCase()] || key;
    
    let formattedValue = value;
    const lowerKey = key.toLowerCase();
    
    if (lowerKey === 'cpu' || lowerKey === 'vcpu') {
      formattedValue = `${value} vCPU`;
    } else if (lowerKey === 'ram' || lowerKey === 'memory') {
      formattedValue = `${value} GB`;
    } else if (lowerKey === 'storage' || lowerKey === 'disk') {
      formattedValue = `${value} GB`;
    } else if (lowerKey === 'tier') {
      formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    
    parts.push(`${label}: ${formattedValue}`);
  }
  
  return parts.join(' | ');
}

/**
 * Load company logo image
 */
async function loadCompanyLogo(pdfDoc: PDFDocument): Promise<{ image: any; width: number; height: number } | null> {
  try {
    const logoFilePath = path.join(process.cwd(), 'public', COMPANY_CONFIG.logoPath);
    const logoBytes = await readFile(logoFilePath);
    
    // Check if PNG or JPG
    const isPng = logoBytes[0] === 0x89 && logoBytes[1] === 0x50 && logoBytes[2] === 0x4E && logoBytes[3] === 0x47;
    
    let logoImage;
    if (isPng) {
      logoImage = await pdfDoc.embedPng(logoBytes);
    } else {
      logoImage = await pdfDoc.embedJpg(logoBytes);
    }
    
    // Scale logo to reasonable dimensions (max 120x50)
    const maxWidth = 120;
    const maxHeight = 50;
    const scale = Math.min(maxWidth / logoImage.width, maxHeight / logoImage.height);
    
    return {
      image: logoImage,
      width: logoImage.width * scale,
      height: logoImage.height * scale,
    };
  } catch (error) {
    console.error('Error loading company logo:', error);
    return null;
  }
}

/**
 * Generate a PDF invoice for an order
 */
export async function generateInvoicePDF(order: Order): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  
  const fontSize = {
    title: 20,
    subtitle: 14,
    header: 11,
    body: 10,
    small: 9,
    tiny: 8,
  };
  
  // Brand colors - Red theme (#8B1D1D)
  const primaryColor = rgb(0.1, 0.1, 0.1);
  const secondaryColor = rgb(0.3, 0.3, 0.3);
  const lightGray = rgb(0.95, 0.95, 0.95);
  const white = rgb(1, 1, 1);
  const red = rgb(0.8, 0.1, 0.1);
  const green = rgb(0.1, 0.5, 0.1);
  // Brand red color: #8B1D1D = rgb(0.545, 0.114, 0.114)
  const brandRed = rgb(0.545, 0.114, 0.114);
  const lightRed = rgb(0.98, 0.92, 0.92);
  
  // ==================== HEADER SECTION ====================
  // Load and draw company logo
  let logoData = await loadCompanyLogo(pdfDoc);
  let currentY = height - 50;
  
  if (logoData) {
    page.drawImage(logoData.image, {
      x: 50,
      y: currentY - logoData.height,
      width: logoData.width,
      height: logoData.height,
    });
    // Move text to the right of logo
    currentY = currentY - logoData.height + 5;
  }
  
  // Company name (next to logo or alone)
  const textStartX = logoData ? 50 + logoData.width + 20 : 50;
  page.drawText(COMPANY_CONFIG.name, {
    x: textStartX,
    y: currentY,
    size: fontSize.title,
    font: helveticaBold,
    color: brandRed,
  });
  
  // Company details
  page.drawText(`${COMPANY_CONFIG.address}, ${COMPANY_CONFIG.city} - ${COMPANY_CONFIG.pincode}`, {
    x: textStartX,
    y: currentY - 20,
    size: fontSize.small,
    font: helveticaFont,
    color: secondaryColor,
  });
  
  page.drawText(`Ph: ${COMPANY_CONFIG.phone} | Email: ${COMPANY_CONFIG.email}`, {
    x: textStartX,
    y: currentY - 35,
    size: fontSize.small,
    font: helveticaFont,
    color: secondaryColor,
  });
  
  page.drawText(`GSTIN: ${COMPANY_CONFIG.gstin} | ${COMPANY_CONFIG.website}`, {
    x: textStartX,
    y: currentY - 50,
    size: fontSize.small,
    font: helveticaFont,
    color: secondaryColor,
  });
  
  // Invoice title box with red brand color
  page.drawRectangle({
    x: width - 130,
    y: currentY - 10,
    width: 80,
    height: 30,
    color: brandRed,
  });
  
  page.drawText('INVOICE', {
    x: width - 118,
    y: currentY + 7,
    size: fontSize.subtitle,
    font: helveticaBold,
    color: white,
  });
  
  // ==================== INVOICE DETAILS ====================
  let yPos = currentY - 80;
  
  // Invoice Details Box
  page.drawText('Invoice No:', {
    x: 50,
    y: yPos,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });
  page.drawText(generateInvoiceNumber(), {
    x: 120,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  
  page.drawText('Invoice Date:', {
    x: 300,
    y: yPos,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });
  page.drawText(formatDate(order.createdAt), {
    x: 395,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  
  yPos -= 18;
  
  page.drawText('Order No:', {
    x: 50,
    y: yPos,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });
  page.drawText(order.orderNumber, {
    x: 120,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  
  page.drawText('Payment Status:', {
    x: 300,
    y: yPos,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });
  const statusColor = order.paymentStatus === 'PAID' ? green : red;
  page.drawText(order.paymentStatus, {
    x: 395,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: statusColor,
  });
  
  // ==================== BILL TO & SHIP TO ====================
  yPos -= 35;
  
  // Divider line with brand red
  page.drawRectangle({
    x: 50,
    y: yPos,
    width: 495,
    height: 1,
    color: lightGray,
  });
  
  yPos -= 15;
  
  // Bill To Section
  const billingAddress = order.shippingAddress;
  let addressStartY = yPos;
  
  page.drawText('BILL TO:', {
    x: 50,
    y: addressStartY,
    size: fontSize.header,
    font: helveticaBold,
    color: brandRed,
  });
  
  if (billingAddress) {
    let billY = addressStartY - 15;
    
    // Customer name/company
    const customerName = billingAddress.company 
      ? `${billingAddress.company}\nAttn: ${billingAddress.firstName} ${billingAddress.lastName}`
      : `${billingAddress.firstName} ${billingAddress.lastName}`;
    
    page.drawText(customerName, {
      x: 50,
      y: billY,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    billY -= billingAddress.company ? 35 : 20;
    
    // Address lines
    page.drawText(`${billingAddress.address1}`, {
      x: 50,
      y: billY,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    billY -= 14;
    
    if (billingAddress.address2) {
      page.drawText(`${billingAddress.address2}`, {
        x: 50,
        y: billY,
        size: fontSize.body,
        font: helveticaFont,
        color: secondaryColor,
      });
      billY -= 14;
    }
    
    page.drawText(`${billingAddress.city}, ${billingAddress.state} - ${billingAddress.postalCode}`, {
      x: 50,
      y: billY,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    billY -= 14;
    
    page.drawText(`${billingAddress.country}`, {
      x: 50,
      y: billY,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    billY -= 14;
    
    page.drawText(`Ph: ${billingAddress.phone || 'N/A'}`, {
      x: 50,
      y: billY,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    
    page.drawText(`Email: ${order.email}`, {
      x: 250,
      y: billY,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
  }
  
  // Ship To Section (if different from Bill To)
  page.drawText('SHIP TO:', {
    x: 320,
    y: addressStartY,
    size: fontSize.header,
    font: helveticaBold,
    color: brandRed,
  });
  
  if (billingAddress) {
    let shipY = addressStartY - 15;
    
    const customerName = billingAddress.company 
      ? `${billingAddress.company}\nAttn: ${billingAddress.firstName} ${billingAddress.lastName}`
      : `${billingAddress.firstName} ${billingAddress.lastName}`;
    
    page.drawText(customerName, {
      x: 320,
      y: shipY,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    shipY -= billingAddress.company ? 35 : 20;
    
    page.drawText(`${billingAddress.address1}`, {
      x: 320,
      y: shipY,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    shipY -= 14;
    
    if (billingAddress.address2) {
      page.drawText(`${billingAddress.address2}`, {
        x: 320,
        y: shipY,
        size: fontSize.body,
        font: helveticaFont,
        color: secondaryColor,
      });
      shipY -= 14;
    }
    
    page.drawText(`${billingAddress.city}, ${billingAddress.state} - ${billingAddress.postalCode}`, {
      x: 320,
      y: shipY,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    shipY -= 14;
    
    page.drawText(`${billingAddress.country}`, {
      x: 320,
      y: shipY,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
  }
  
  // ==================== LINE ITEMS TABLE ====================
  yPos = addressStartY - 100;
  
  // Table header with brand red color
  page.drawRectangle({
    x: 50,
    y: yPos,
    width: 495,
    height: 25,
    color: brandRed,
  });
  
  page.drawText('Description', {
    x: 55,
    y: yPos + 7,
    size: fontSize.body,
    font: helveticaBold,
    color: white,
  });
  page.drawText('Qty', {
    x: 360,
    y: yPos + 7,
    size: fontSize.body,
    font: helveticaBold,
    color: white,
  });
  page.drawText('Rate', {
    x: 420,
    y: yPos + 7,
    size: fontSize.body,
    font: helveticaBold,
    color: white,
  });
  page.drawText('Amount', {
    x: 500,
    y: yPos + 7,
    size: fontSize.body,
    font: helveticaBold,
    color: white,
  });
  
  yPos += 25;
  const rowHeight = 30;
  
  order.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      page.drawRectangle({
        x: 50,
        y: yPos,
        width: 495,
        height: rowHeight,
        color: lightGray,
      });
    }
    
    const configStr = getConfigurationString(item.configuration);
    const itemName = configStr ? `${item.name} (${configStr})` : item.name;
    
    // Truncate item name if too long
    const truncatedName = itemName.length > 55 ? itemName.substring(0, 55) + '...' : itemName;
    
    page.drawText(truncatedName, {
      x: 55,
      y: yPos + 10,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    page.drawText(item.quantity.toString(), {
      x: 370,
      y: yPos + 10,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    page.drawText(formatCurrency(item.unitPrice, order.currency), {
      x: 420,
      y: yPos + 10,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    page.drawText(formatCurrency(item.totalPrice, order.currency), {
      x: 500,
      y: yPos + 10,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    
    yPos += rowHeight;
  });
  
  // ==================== TOTALS SECTION ====================
  yPos += 15;
  
  // Subtotal
  page.drawText('Subtotal:', {
    x: 350,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: secondaryColor,
  });
  page.drawText(formatCurrency(order.subtotal, order.currency), {
    x: 500,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  
  yPos += 14;
  
  // Discount
  if (order.discountAmount > 0) {
    page.drawText('Discount:', {
      x: 350,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: secondaryColor,
    });
    page.drawText(`-${formatCurrency(order.discountAmount, order.currency)}`, {
      x: 500,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: red,
    });
    yPos += 14;
  }
  
  // SGST
  const sgst = order.taxAmount / 2;
  page.drawText('SGST:', {
    x: 350,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: secondaryColor,
  });
  page.drawText(formatCurrency(sgst, order.currency), {
    x: 500,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  
  yPos += 14;
  
  // CGST
  page.drawText('CGST:', {
    x: 350,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: secondaryColor,
  });
  page.drawText(formatCurrency(sgst, order.currency), {
    x: 500,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  
  yPos += 14;
  
  // Shipping
  page.drawText('Shipping:', {
    x: 350,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: secondaryColor,
  });
  page.drawText(formatCurrency(order.shippingAmount, order.currency), {
    x: 500,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  
  // Grand Total with brand red
  yPos += 20;
  page.drawRectangle({
    x: 350,
    y: yPos - 3,
    width: 195,
    height: 28,
    color: brandRed,
  });
  
  page.drawText('TOTAL:', {
    x: 360,
    y: yPos + 4,
    size: fontSize.subtitle,
    font: helveticaBold,
    color: white,
  });
  page.drawText(formatCurrency(order.total, order.currency), {
    x: 500,
    y: yPos + 4,
    size: fontSize.subtitle,
    font: helveticaBold,
    color: white,
  });
  
  // ==================== BANK DETAILS SECTION WITH PAGE BREAK DETECTION ====================
  // Constants for page break calculation
  const BANK_DETAILS_BLOCK_HEIGHT = 130;
  const TERMS_HEIGHT = 40;
  const FOOTER_BUFFER = 80;
  const MIN_Y_POS = 150; // Minimum Y position before footer
  
  // Check if we need a new page for bank details
  if (yPos - BANK_DETAILS_BLOCK_HEIGHT < MIN_Y_POS) {
    const newPage = pdfDoc.addPage([595.28, 841.89]);
    yPos = newPage.getHeight() - 50;
  }
  
  yPos -= 30;
  
  // Bank details box with light red background and border
  const bankBoxX = 50;
  const bankBoxY = yPos - BANK_DETAILS_BLOCK_HEIGHT + 30;
  const bankBoxWidth = 240;
  const bankBoxHeight = BANK_DETAILS_BLOCK_HEIGHT - 30;
  
  // Light red background
  page.drawRectangle({
    x: bankBoxX,
    y: bankBoxY,
    width: bankBoxWidth,
    height: bankBoxHeight,
    color: lightRed,
  });
  
  // Red border
  page.drawRectangle({
    x: bankBoxX,
    y: bankBoxY,
    width: bankBoxWidth,
    height: bankBoxHeight,
    color: brandRed,
    borderColor: brandRed,
    borderWidth: 1,
  });
  
  // Bank details header with brand red
  page.drawText('Bank Details:', {
    x: bankBoxX + 10,
    y: yPos,
    size: fontSize.header,
    font: helveticaBold,
    color: brandRed,
  });
  
  yPos -= 18;
  page.drawText(`Bank Name: ${BANK_DETAILS.bankName}`, {
    x: bankBoxX + 10,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  
  yPos -= 14;
  page.drawText(`A/c No: ${BANK_DETAILS.accountNumber}`, {
    x: bankBoxX + 10,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  
  yPos -= 14;
  page.drawText(`IFSC Code: ${BANK_DETAILS.ifscCode}`, {
    x: bankBoxX + 10,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  
  yPos -= 14;
  page.drawText(`Branch: ${BANK_DETAILS.branch}`, {
    x: bankBoxX + 10,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  
  // ==================== TERMS & CONDITIONS ====================
  // Check if we need a new page for terms
  if (yPos - TERMS_HEIGHT < MIN_Y_POS) {
    const newPage = pdfDoc.addPage([595.28, 841.89]);
    yPos = newPage.getHeight() - 50;
  }
  
  yPos -= 30;
  page.drawText('Terms & Conditions:', {
    x: 50,
    y: yPos,
    size: fontSize.header,
    font: helveticaBold,
    color: brandRed,
  });
  
  yPos -= 16;
  page.drawText('1. Payment to be made within 15 days of invoice date.', {
    x: 50,
    y: yPos,
    size: fontSize.small,
    font: helveticaFont,
    color: secondaryColor,
  });
  
  yPos -= 14;
  page.drawText('2. Goods once sold cannot be returned.', {
    x: 50,
    y: yPos,
    size: fontSize.small,
    font: helveticaFont,
    color: secondaryColor,
  });
  
  // ==================== FOOTER WITH SIGNATURE ====================
  // Footer is always at the bottom of the page
  const footerY = 60;
  page.drawText(`For ${COMPANY_CONFIG.name},`, {
    x: 400,
    y: footerY,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });
  
  // Signature line
  page.drawRectangle({
    x: 400,
    y: footerY - 25,
    width: 120,
    height: 1,
    color: primaryColor,
  });
  
  page.drawText('Authorized Signatory', {
    x: 410,
    y: footerY - 40,
    size: fontSize.small,
    font: helveticaFont,
    color: secondaryColor,
  });
  
  // Footer thank you message with brand red
  page.drawText('Thank you for your business!', {
    x: 50,
    y: footerY - 40,
    size: fontSize.small,
    font: helveticaBold,
    color: brandRed,
  });
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
