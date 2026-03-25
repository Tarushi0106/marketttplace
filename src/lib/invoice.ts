import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface OrderItemInterface {
  id?: string | null;
  name?: string | null;
  description?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  totalPrice?: number | null;
  product?: { name?: string | null } | null;
  variant?: { name?: string | null } | null | boolean;
  configuration?: Record<string, any> | null | boolean;
  bundle?: { name?: string | null } | null | boolean;
  hsnCode?: string | null;
  cgstRate?: number | null;
  sgstRate?: number | null;
  setupFee?: number | null;
  isRecurring?: boolean | null;
  billingCycle?: string | null;
  recurringPrice?: number | null;
  [key: string]: any;
}

interface OrderInterface {
  id?: string | null;
  orderNumber?: string | null;
  user?: any;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  paymentId?: string | null;
  subtotal?: number | null;
  discountAmount?: number | null;
  taxAmount?: number | null;
  cgstAmount?: number | null;
  sgstAmount?: number | null;
  shippingAmount?: number | null;
  total?: number | null;
  currency?: string | null;
  notes?: string | null;
  createdAt?: Date | null;
  items?: OrderItemInterface[] | null;
  billingAddress?: {
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
    gstin?: string | null;
  } | null;
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
    gstin?: string | null;
  } | null;
  discount?: any;
  invoice?: any;
  poNumber?: string | null;
  billingCycle?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  billingFrequency?: string | null;
  hostname?: string | null;
  placeOfSupply?: string | null;
  dueDate?: Date | string | null;
  paymentMade?: number | null;
  [key: string]: any;
}

/**
 * Generate a unique invoice number
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `INV-${year}${month}-${random}`;
}

/**
 * Format currency for display in INR
 */
function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date for display
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Generate professional invoice PDF buffer
 */
export async function generateInvoicePDF(order: OrderInterface): Promise<Uint8Array> {
  // Create new PDF document (A4 size) - MODERN CLEAN DESIGN
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Load fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const BLACK = rgb(0, 0, 0);
  const DARK_GRAY = rgb(0.2, 0.2, 0.2);
  const GRAY = rgb(0.4, 0.4, 0.4);
  const LIGHT_GRAY = rgb(0.7, 0.7, 0.7);
  const VERY_LIGHT_GRAY = rgb(0.95, 0.95, 0.95);
  const GREEN = rgb(0, 0.4, 0);
  const WHITE = rgb(1, 1, 1);

  // Layout constants
  const LEFT_MARGIN = 50;
  const RIGHT_MARGIN = 50;
  const PAGE_WIDTH = width;
  const MAX_RIGHT = PAGE_WIDTH - RIGHT_MARGIN;
  
  // Font sizes
  const sizes = {
    h1: 20,
    h2: 14,
    h3: 12,
    body: 10,
    small: 8,
    tiny: 7,
  };

  // Helper function for right-aligned text
  const rightAlign = (text: string, font: any, fontSize: number) => {
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    return MAX_RIGHT - textWidth;
  };

  // Helper function for left-aligned text at totals column
  const totalsLeft = LEFT_MARGIN + 280;
  const totalsRight = (text: string, font: any, fontSize: number) => {
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    return MAX_RIGHT - textWidth;
  };

  // Track Y position for vertical layout
  let y = height - 50;

  // ==================== HEADER ====================
  page.drawText("SHAURRYA TELESERVICES", {
    x: LEFT_MARGIN,
    y: y - 20,
    size: sizes.h1,
    font: helveticaBold,
    color: BLACK,
  });
  
  y -= 50;

  // Company info
  page.drawText("Laxmi Plaza, 213, Off New Link Rd, Laxmi Industrial Estate", {
    x: LEFT_MARGIN,
    y: y - 12,
    size: sizes.body,
    font: helveticaFont,
    color: DARK_GRAY,
  });
  page.drawText("Milat Nagar, Andheri West, Mumbai, Maharashtra 400053", {
    x: LEFT_MARGIN,
    y: y - 24,
    size: sizes.body,
    font: helveticaFont,
    color: DARK_GRAY,
  });
  page.drawText("PAN: ABCCS1234A | GST: 27ABCCS1234A1Z9", {
    x: LEFT_MARGIN,
    y: y - 36,
    size: sizes.small,
    font: helveticaFont,
    color: GRAY,
  });

  // TAX INVOICE box
  const invoiceBoxWidth = 130;
  const invoiceBoxX = MAX_RIGHT - invoiceBoxWidth;
  page.drawRectangle({
    x: invoiceBoxX - 10,
    y: y - 55,
    width: invoiceBoxWidth + 10,
    height: 50,
    color: VERY_LIGHT_GRAY,
    borderColor: LIGHT_GRAY,
    borderWidth: 1,
  });
  page.drawText("TAX INVOICE", {
    x: invoiceBoxX,
    y: y - 20,
    size: sizes.h2,
    font: helveticaBold,
    color: BLACK,
  });

  const invoiceNumber = generateInvoiceNumber();
  page.drawText(`Invoice #: ${invoiceNumber}`, {
    x: invoiceBoxX,
    y: y - 35,
    size: sizes.body,
    font: helveticaFont,
    color: DARK_GRAY,
  });
  page.drawText(`Date: ${formatDate(order.createdAt)}`, {
    x: invoiceBoxX,
    y: y - 48,
    size: sizes.body,
    font: helveticaFont,
    color: DARK_GRAY,
  });

  // PAID stamp
  if (order.paymentStatus === "PAID") {
    page.drawRectangle({
      x: invoiceBoxX + 60,
      y: y - 35,
      width: 55,
      height: 20,
      color: GREEN,
    });
    page.drawText("PAID", {
      x: invoiceBoxX + 68,
      y: y - 28,
      size: sizes.body,
      font: helveticaBold,
      color: WHITE,
    });
  }

  y -= 65;

  // Header divider
  page.drawLine({
    start: { x: LEFT_MARGIN, y: y },
    end: { x: MAX_RIGHT, y: y },
    thickness: 2,
    color: BLACK,
  });

  y -= 25;

  // ==================== BILL TO & SHIP TO ====================
  const col1X = LEFT_MARGIN;
  const col2X = LEFT_MARGIN + 160;
  const col3X = LEFT_MARGIN + 320;

  // Bill To
  page.drawText("BILL TO", {
    x: col1X,
    y: y,
    size: sizes.tiny,
    font: helveticaBold,
    color: GRAY,
  });
  y -= 12;

  const billingAddr = order.billingAddress || order.shippingAddress;
  if (billingAddr?.company) {
    page.drawText(billingAddr.company, {
      x: col1X,
      y: y,
      size: sizes.body,
      font: helveticaBold,
      color: BLACK,
    });
    y -= 12;
  }

  if (billingAddr?.firstName || billingAddr?.lastName) {
    page.drawText(`${billingAddr.firstName || ''} ${billingAddr.lastName || ''}`, {
      x: col1X,
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: DARK_GRAY,
    });
    y -= 12;
  }

  if (billingAddr?.address1) {
    page.drawText(billingAddr.address1, {
      x: col1X,
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: DARK_GRAY,
    });
    y -= 12;
  }

  if (billingAddr?.address2) {
    page.drawText(billingAddr.address2, {
      x: col1X,
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: DARK_GRAY,
    });
    y -= 12;
  }

  const cityLine = `${billingAddr?.city || ''}${billingAddr?.city && billingAddr?.state ? ', ' : ''}${billingAddr?.state || ''} ${billingAddr?.postalCode || ''}`;
  if (cityLine.trim()) {
    page.drawText(cityLine, {
      x: col1X,
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: DARK_GRAY,
    });
    y -= 12;
  }

  if (billingAddr?.phone) {
    page.drawText(`Ph: ${billingAddr.phone}`, {
      x: col1X,
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: DARK_GRAY,
    });
  }

  // Ship To
  y = height - 140;

  page.drawText("SHIP TO", {
    x: col2X,
    y: y,
    size: sizes.tiny,
    font: helveticaBold,
    color: GRAY,
  });
  y -= 12;

  const shippingAddr = order.shippingAddress;
  if (shippingAddr?.company) {
    page.drawText(shippingAddr.company, {
      x: col2X,
      y: y,
      size: sizes.body,
      font: helveticaBold,
      color: BLACK,
    });
    y -= 12;
  }

  if (shippingAddr?.firstName || shippingAddr?.lastName) {
    page.drawText(`${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`, {
      x: col2X,
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: DARK_GRAY,
    });
    y -= 12;
  }

  if (shippingAddr?.address1) {
    page.drawText(shippingAddr.address1, {
      x: col2X,
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: DARK_GRAY,
    });
    y -= 12;
  }

  if (shippingAddr?.city || shippingAddr?.state || shippingAddr?.postalCode) {
    const shipCityLine = `${shippingAddr.city || ''}${shippingAddr.city && shippingAddr.state ? ', ' : ''}${shippingAddr.state || ''} ${shippingAddr.postalCode || ''}`;
    page.drawText(shipCityLine, {
      x: col2X,
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: DARK_GRAY,
    });
    y -= 12;
  }

  if (shippingAddr?.phone) {
    page.drawText(`Ph: ${shippingAddr.phone}`, {
      x: col2X,
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: DARK_GRAY,
    });
  }

  // Order Details
  y = height - 140;
  page.drawText("ORDER DETAILS", {
    x: col3X,
    y: y,
    size: sizes.tiny,
    font: helveticaBold,
    color: GRAY,
  });
  y -= 12;

  if (order.orderNumber) {
    page.drawText(`Order #: ${order.orderNumber}`, {
      x: col3X,
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: DARK_GRAY,
    });
    y -= 12;
  }

  page.drawText(`Payment: ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}`, {
    x: col3X,
    y: y,
    size: sizes.body,
    font: helveticaFont,
    color: DARK_GRAY,
  });
  y -= 12;

  page.drawText(`Status: ${order.paymentStatus || order.status || 'Pending'}`, {
    x: col3X,
    y: y,
    size: sizes.body,
    font: helveticaFont,
    color: GREEN,
  });

  y -= 30;

  // Divider
  page.drawLine({
    start: { x: LEFT_MARGIN, y: y },
    end: { x: MAX_RIGHT, y: y },
    thickness: 1,
    color: LIGHT_GRAY,
  });

  y -= 20;

  // ==================== ITEMS TABLE ====================
  const tableWidth = MAX_RIGHT - LEFT_MARGIN;
  page.drawRectangle({
    x: LEFT_MARGIN,
    y: y - 3,
    width: tableWidth,
    height: 18,
    color: VERY_LIGHT_GRAY,
  });

  const cols = {
    item: LEFT_MARGIN + 5,
    desc: LEFT_MARGIN + 50,
    hsn: LEFT_MARGIN + 200,
    qty: LEFT_MARGIN + 250,
    rate: LEFT_MARGIN + 290,
    amount: MAX_RIGHT - 80,
  };

  page.drawText("Item", { x: cols.item, y: y, size: sizes.tiny, font: helveticaBold, color: GRAY });
  page.drawText("Description", { x: cols.desc, y: y, size: sizes.tiny, font: helveticaBold, color: GRAY });
  page.drawText("HSN", { x: cols.hsn, y: y, size: sizes.tiny, font: helveticaBold, color: GRAY });
  page.drawText("Qty", { x: cols.qty, y: y, size: sizes.tiny, font: helveticaBold, color: GRAY });
  page.drawText("Rate", { x: cols.rate, y: y, size: sizes.tiny, font: helveticaBold, color: GRAY });
  page.drawText("Amount", { x: cols.amount, y: y, size: sizes.tiny, font: helveticaBold, color: GRAY });

  y -= 22;
  page.drawLine({
    start: { x: LEFT_MARGIN, y: y },
    end: { x: MAX_RIGHT, y: y },
    thickness: 1,
    color: LIGHT_GRAY,
  });
  y -= 8;

  // Draw items
  const items = order.items || [];
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let oneTimeTotal = 0;

  for (const item of items) {
    if (!item) continue;

    const quantity = Number(item.quantity) || 1;
    const unitPrice = Number(item.unitPrice) || 0;
    const itemTotal = quantity * unitPrice;
    const cgstRate = Number(item.cgstRate) || 0;
    const sgstRate = Number(item.sgstRate) || 0;
    const setupFee = Number(item.setupFee) || 0;
    
    subtotal += itemTotal;
    totalCgst += (itemTotal * cgstRate) / 100;
    totalSgst += (itemTotal * sgstRate) / 100;
    oneTimeTotal += setupFee * quantity;

    // Item name
    let itemName = item.product?.name || item.name || "Item";
    if (item.variant && typeof item.variant === 'object') {
      itemName += ` - ${(item.variant as any).name || ''}`;
    }
    page.drawText(itemName.substring(0, 25), {
      x: cols.item,
      y: y,
      size: sizes.small,
      font: helveticaBold,
      color: BLACK,
    });

    // Description
    const desc = item.description ? item.description.substring(0, 30) : "";
    page.drawText(desc, {
      x: cols.desc,
      y: y,
      size: sizes.small,
      font: helveticaFont,
      color: DARK_GRAY,
    });

    // HSN
    page.drawText(item.hsnCode || "-", {
      x: cols.hsn,
      y: y,
      size: sizes.small,
      font: helveticaFont,
      color: DARK_GRAY,
    });

    // Qty
    page.drawText(quantity.toString(), {
      x: cols.qty + 5,
      y: y,
      size: sizes.small,
      font: helveticaFont,
      color: DARK_GRAY,
    });

    // Rate
    page.drawText(formatCurrency(unitPrice), {
      x: cols.rate,
      y: y,
      size: sizes.small,
      font: helveticaFont,
      color: DARK_GRAY,
    });

    // Amount
    page.drawText(formatCurrency(itemTotal), {
      x: cols.amount,
      y: y,
      size: sizes.small,
      font: helveticaBold,
      color: BLACK,
    });

    y -= 18;

    // Setup fee
    if (setupFee > 0) {
      const setupTotal = setupFee * quantity;
      const setupCgst = (setupTotal * cgstRate) / 100;
      const setupSgst = (setupTotal * sgstRate) / 100;
      
      totalCgst += setupCgst;
      totalSgst += setupSgst;

      page.drawText("  + One-Time Setup Fee", {
        x: cols.item,
        y: y,
        size: sizes.small,
        font: helveticaFont,
        color: GRAY,
      });
      page.drawText(formatCurrency(setupTotal), {
        x: cols.amount,
        y: y,
        size: sizes.small,
        font: helveticaFont,
        color: DARK_GRAY,
      });
      y -= 18;
    }

    // Check for page break
    if (y < 120) {
      pdfDoc.addPage();
      y = height - 50;
    }
  }

  y -= 15;

  // ==================== TOTALS SECTION ====================
  page.drawLine({
    start: { x: LEFT_MARGIN, y: y },
    end: { x: MAX_RIGHT, y: y },
    thickness: 1,
    color: LIGHT_GRAY,
  });

  y -= 15;

  // Totals block - right aligned with font width calculation
  const totalsBlockX = MAX_RIGHT - 180;
  const totalsBlockWidth = 170;

  // Subtotal
  const subtotalText = "Subtotal";
  const subtotalAmount = formatCurrency(subtotal);
  page.drawText(subtotalText, {
    x: totalsBlockX,
    y: y,
    size: sizes.body,
    font: helveticaBold,
    color: DARK_GRAY,
  });
  page.drawText(subtotalAmount, {
    x: totalsRight(subtotalAmount, helveticaFont, sizes.body),
    y: y,
    size: sizes.body,
    font: helveticaFont,
    color: BLACK,
  });
  y -= 14;

  // One-Time Charges
  if (oneTimeTotal > 0) {
    const chargesText = "One-Time Charges";
    const chargesAmount = formatCurrency(oneTimeTotal);
    page.drawText(chargesText, {
      x: totalsBlockX,
      y: y,
      size: sizes.body,
      font: helveticaBold,
      color: DARK_GRAY,
    });
    page.drawText(chargesAmount, {
      x: totalsRight(chargesAmount, helveticaFont, sizes.body),
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: BLACK,
    });
    y -= 14;
  }

  // CGST
  if (totalCgst > 0) {
    const cgstText = "CGST";
    const cgstAmount = formatCurrency(totalCgst);
    page.drawText(cgstText, {
      x: totalsBlockX,
      y: y,
      size: sizes.body,
      font: helveticaBold,
      color: DARK_GRAY,
    });
    page.drawText(cgstAmount, {
      x: totalsRight(cgstAmount, helveticaFont, sizes.body),
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: BLACK,
    });
    y -= 14;
  }

  // SGST
  if (totalSgst > 0) {
    const sgstText = "SGST";
    const sgstAmount = formatCurrency(totalSgst);
    page.drawText(sgstText, {
      x: totalsBlockX,
      y: y,
      size: sizes.body,
      font: helveticaBold,
      color: DARK_GRAY,
    });
    page.drawText(sgstAmount, {
      x: totalsRight(sgstAmount, helveticaFont, sizes.body),
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: BLACK,
    });
    y -= 14;
  }

  // Discount
  if (order.discountAmount && Number(order.discountAmount) > 0) {
    const discountText = "Discount";
    const discountAmount = `-${formatCurrency(Number(order.discountAmount))}`;
    page.drawText(discountText, {
      x: totalsBlockX,
      y: y,
      size: sizes.body,
      font: helveticaBold,
      color: GREEN,
    });
    page.drawText(discountAmount, {
      x: totalsRight(discountAmount, helveticaFont, sizes.body),
      y: y,
      size: sizes.body,
      font: helveticaFont,
      color: GREEN,
    });
    y -= 14;
  }

  y -= 6;

  // Total divider line
  page.drawLine({
    start: { x: totalsBlockX, y: y },
    end: { x: MAX_RIGHT, y: y },
    thickness: 2,
    color: BLACK,
  });

  y -= 12;

  // DUE TODAY
  const dueToday = subtotal + oneTimeTotal + totalCgst + totalSgst - Number(order.discountAmount || 0);
  const dueTodayLabel = "DUE TODAY";
  const dueTodayAmount = formatCurrency(dueToday);
  
  page.drawText(dueTodayLabel, {
    x: totalsBlockX,
    y: y,
    size: sizes.h3,
    font: helveticaBold,
    color: BLACK,
  });
  page.drawText(dueTodayAmount, {
    x: totalsRight(dueTodayAmount, helveticaBold, sizes.h3),
    y: y,
    size: sizes.h3,
    font: helveticaBold,
    color: BLACK,
  });

  y -= 18;

  // Billing frequency note
  if (order.billingCycle && order.billingCycle !== 'ONE_TIME') {
    let billingNote = "";
    if (order.billingCycle === 'MONTHLY') {
      billingNote = "Monthly billing";
    } else if (order.billingCycle === 'BIMONTHLY') {
      billingNote = "Every 2 months";
    } else if (order.billingCycle === 'QUARTERLY') {
      billingNote = "Quarterly billing";
    } else if (order.billingCycle === 'YEARLY') {
      billingNote = "Yearly billing";
    } else {
      billingNote = order.billingCycle.toLowerCase();
    }
    
    page.drawText(billingNote, {
      x: totalsBlockX,
      y: y,
      size: sizes.small,
      font: helveticaFont,
      color: GRAY,
    });
  }

  y -= 30;

  // ==================== FOOTER ====================
  page.drawLine({
    start: { x: LEFT_MARGIN, y: y },
    end: { x: MAX_RIGHT, y: y },
    thickness: 1,
    color: LIGHT_GRAY,
  });

  y -= 20;

  const footCol1 = LEFT_MARGIN;
  const footCol2 = LEFT_MARGIN + 180;
  const footCol3 = MAX_RIGHT - 100;

  // Bank Details
  page.drawText("Bank Details", {
    x: footCol1,
    y: y,
    size: sizes.tiny,
    font: helveticaBold,
    color: GRAY,
  });
  y -= 12;
  page.drawText("Bank: HDFC Bank | A/c: 50100123456789 | IFSC: HDFC0001234", {
    x: footCol1,
    y: y,
    size: sizes.small,
    font: helveticaFont,
    color: DARK_GRAY,
  });

  // Payment Info
  page.drawText("Payment Via", {
    x: footCol2,
    y: y,
    size: sizes.tiny,
    font: helveticaBold,
    color: GRAY,
  });
  y -= 12;
  const paymentMethod = order.paymentMethod === 'razorpay' ? 'Razorpay' : 
                        order.paymentMethod === 'stripe' ? 'Stripe' :
                        order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                        order.paymentMethod?.toUpperCase() || 'N/A';
  page.drawText(paymentMethod, {
    x: footCol2,
    y: y,
    size: sizes.body,
    font: helveticaBold,
    color: BLACK,
  });

  // Amount in words
  y -= 35;
  page.drawLine({
    start: { x: LEFT_MARGIN, y: y },
    end: { x: MAX_RIGHT, y: y },
    thickness: 1,
    color: LIGHT_GRAY,
  });

  y -= 15;
  const amountInWords = convertNumberToWords(dueToday);
  page.drawText(`Total (in words): ${amountInWords}`, {
    x: LEFT_MARGIN,
    y: y,
    size: sizes.body,
    font: helveticaBold,
    color: BLACK,
  });

  y -= 20;

  // Certification
  page.drawText("Certified that the particulars given above are true and correct", {
    x: LEFT_MARGIN,
    y: y,
    size: sizes.small,
    font: helveticaFont,
    color: GRAY,
  });

  // Signature
  y -= 40;
  page.drawText("For SHAURRYA TELESERVICES", {
    x: MAX_RIGHT - 150,
    y: y,
    size: sizes.body,
    font: helveticaBold,
    color: BLACK,
  });

  // Save PDF
  return pdfDoc.save();
}

/**
 * Convert number to words (Indian Rupees format)
 */
function convertNumberToWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
                "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertToWords(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convertToWords(n % 100) : "");
    if (n < 100000) return convertToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convertToWords(n % 1000) : "");
    if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convertToWords(n % 100000) : "");
    return convertToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convertToWords(n % 10000000) : "");
  }

  let result = convertToWords(rupees) + " Rupees";
  if (paise > 0) {
    result += " and " + convertToWords(paise) + " Paise";
  }
  return result;
}
