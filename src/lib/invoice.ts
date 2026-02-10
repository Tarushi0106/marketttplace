import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

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
 * Format currency for display
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
 * Generate invoice PDF buffer - Professional GST Compliant Invoice
 */
export async function generateInvoicePDF(order: OrderInterface): Promise<Uint8Array> {
  // Create new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add page - A4 size
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Load fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const primaryColor = rgb(0.1, 0.1, 0.1);
  const secondaryColor = rgb(0.3, 0.3, 0.3);
  const lightGray = rgb(0.7, 0.7, 0.7);
  const veryLightGray = rgb(0.95, 0.95, 0.95);
  const greenColor = rgb(0.1, 0.5, 0.1);
  const whiteColor = rgb(1, 1, 1);
  const companyBlue = rgb(0.1, 0.3, 0.6);

  // Font sizes
  const fontSize = {
    header: 18,
    title: 16,
    subtitle: 12,
    body: 9,
    small: 8,
    tiny: 7,
  };

  let yPos = height - 30;
  const leftMargin = 40;
  const rightMargin = width - 40;

  // ==================== TOP HEADER BAR ====================
  // Company blue header bar
  page.drawRectangle({
    x: leftMargin,
    y: height - 30,
    width: width - 80,
    height: 35,
    color: companyBlue,
  });

  // Company name in header
  page.drawText("SHAURRYA TELESERVICES PVT. LTD", {
    x: leftMargin + 10,
    y: height - 20,
    size: 14,
    font: helveticaBold,
    color: whiteColor,
  });

  // GSTIN info in header
  page.drawText("GSTIN: 27ABCCS1234A1Z5 | CIN: U72200MH2020PTC123456", {
    x: leftMargin + 280,
    y: height - 20,
    size: 8,
    font: helveticaFont,
    color: whiteColor,
  });

  yPos = height - 80;

  // ==================== LOGO AND COMPANY INFO ====================
  // Try to load company logo
  let logoLoaded = false;
  const brandingDir = path.join(process.cwd(), "public", "uploads", "branding");
  
  if (fs.existsSync(brandingDir)) {
    const files = fs.readdirSync(brandingDir);
    
    // Try PNG files first
    const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));
    for (const pngFile of pngFiles) {
      try {
        const logoPath = path.join(brandingDir, pngFile);
        const logoBytes = fs.readFileSync(logoPath);
        const logoImage = await pdfDoc.embedPng(logoBytes);
        const logoDims = logoImage.scale(0.5);
        
        // Draw logo
        page.drawImage(logoImage, {
          x: leftMargin,
          y: yPos - 60,
          width: logoDims.width,
          height: logoDims.height,
        });
        
        yPos -= 70;
        logoLoaded = true;
        break;
      } catch (e) {
        console.warn("Could not embed PNG logo:", pngFile, e);
      }
    }
  }

  // If no logo loaded, show styled "S" logo
  if (!logoLoaded) {
    // Logo placeholder - blue box with "S"
    page.drawRectangle({
      x: leftMargin,
      y: yPos - 60,
      width: 70,
      height: 60,
      color: companyBlue,
    });
    page.drawText("S", {
      x: leftMargin + 28,
      y: yPos - 30,
      size: 32,
      font: helveticaBold,
      color: whiteColor,
    });
    yPos -= 70;
  }

  // Company name
  page.drawText("Shaurrya Teleservices", {
    x: leftMargin,
    y: yPos - 5,
    size: 18,
    font: helveticaBold,
    color: companyBlue,
  });
  page.drawText("Pvt. Ltd", {
    x: leftMargin,
    y: yPos - 20,
    size: 10,
    font: helveticaFont,
    color: secondaryColor,
  });

  // Company address block
  yPos -= 35;
  page.drawText("603, Laxmi Plaza, Laxmi Industrial Estate", {
    x: leftMargin,
    y: yPos,
    size: 9,
    font: helveticaFont,
    color: secondaryColor,
  });
  yPos -= 12;
  page.drawText("Sab TV Lane, Andheri West, Mumbai 400053", {
    x: leftMargin,
    y: yPos,
    size: 9,
    font: helveticaFont,
    color: secondaryColor,
  });
  yPos -= 12;
  page.drawText("PAN: ABCCS1234A | MSME: MH27D0012345", {
    x: leftMargin,
    y: yPos,
    size: 9,
    font: helveticaFont,
    color: secondaryColor,
  });

  // Right side - TAX INVOICE box
  const invoiceBoxX = width - 170;
  page.drawRectangle({
    x: invoiceBoxX - 15,
    y: yPos - 50,
    width: 155,
    height: 55,
    color: veryLightGray,
    borderColor: lightGray,
    borderWidth: 1,
  });

  page.drawText("TAX INVOICE", {
    x: invoiceBoxX,
    y: yPos - 20,
    size: 20,
    font: helveticaBold,
    color: companyBlue,
  });

  // Invoice number
  const invoiceNumber = generateInvoiceNumber();
  page.drawText(`Inv #: ${invoiceNumber}`, {
    x: invoiceBoxX,
    y: yPos - 38,
    size: 10,
    font: helveticaFont,
    color: primaryColor,
  });

  // Date
  page.drawText(`Date: ${formatDate(order.createdAt)}`, {
    x: invoiceBoxX,
    y: yPos - 52,
    size: 10,
    font: helveticaFont,
    color: secondaryColor,
  });

  // PAID status box
  if (order.paymentStatus === "PAID") {
    page.drawRectangle({
      x: invoiceBoxX + 75,
      y: yPos - 45,
      width: 50,
      height: 18,
      color: greenColor,
    });
    page.drawText("PAID", {
      x: invoiceBoxX + 83,
      y: yPos - 38,
      size: 10,
      font: helveticaBold,
      color: whiteColor,
    });
  }

  // Divider line
  yPos -= 55;
  page.drawLine({
    start: { x: leftMargin, y: yPos },
    end: { x: rightMargin, y: yPos },
    thickness: 2,
    color: companyBlue,
  });

  yPos -= 15;

  // ==================== INVOICE INFO SECTION (3 COLUMNS) ====================
  const col1X = leftMargin;
  const col2X = leftMargin + 140;
  const col3X = leftMargin + 300;

  // LEFT COLUMN - Invoice Details
  page.drawText("Invoice Date", {
    x: col1X,
    y: yPos,
    size: fontSize.tiny,
    font: helveticaFont,
    color: secondaryColor,
  });
  page.drawText(formatDate(order.createdAt), {
    x: col1X,
    y: yPos - 10,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });

  yPos -= 25;
  page.drawText("Terms", {
    x: col1X,
    y: yPos,
    size: fontSize.tiny,
    font: helveticaFont,
    color: secondaryColor,
  });
  page.drawText("Due on Receipt", {
    x: col1X,
    y: yPos - 10,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });

  yPos -= 25;
  page.drawText("Due Date", {
    x: col1X,
    y: yPos,
    size: fontSize.tiny,
    font: helveticaFont,
    color: secondaryColor,
  });
  page.drawText(formatDate(order.dueDate), {
    x: col1X,
    y: yPos - 10,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });

  yPos -= 25;
  if (order.poNumber) {
    page.drawText("P.O #", {
      x: col1X,
      y: yPos,
      size: fontSize.tiny,
      font: helveticaFont,
      color: secondaryColor,
    });
    page.drawText(order.poNumber, {
      x: col1X,
      y: yPos - 10,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    yPos -= 25;
  }

  if (order.billingCycle) {
    page.drawText("Billing Cycle", {
      x: col1X,
      y: yPos,
      size: fontSize.tiny,
      font: helveticaFont,
      color: secondaryColor,
    });
    page.drawText(order.billingCycle, {
      x: col1X,
      y: yPos - 10,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    yPos -= 25;
  }

  if (order.hostname) {
    page.drawText("Hostname", {
      x: col1X,
      y: yPos,
      size: fontSize.tiny,
      font: helveticaFont,
      color: secondaryColor,
    });
    page.drawText(order.hostname, {
      x: col1X,
      y: yPos - 10,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
  }

  // Reset yPos for right columns
  yPos = height - 230;

  // MIDDLE COLUMN - Bill To
  page.drawText("Bill To:", {
    x: col2X,
    y: yPos,
    size: fontSize.tiny,
    font: helveticaBold,
    color: secondaryColor,
  });
  yPos -= 12;

  const billingAddr = order.billingAddress || order.shippingAddress;
  if (billingAddr?.company) {
    page.drawText(billingAddr.company, {
      x: col2X,
      y: yPos,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    yPos -= 12;
  }

  if (billingAddr?.firstName || billingAddr?.lastName) {
    page.drawText(`${billingAddr.firstName || ''} ${billingAddr.lastName || ''}`, {
      x: col2X,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    yPos -= 12;
  }

  if (billingAddr?.address1) {
    page.drawText(billingAddr.address1, {
      x: col2X,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    yPos -= 12;
  }

  if (billingAddr?.city || billingAddr?.state || billingAddr?.postalCode) {
    const cityLine = `${billingAddr.city || ''}${billingAddr.city && billingAddr.state ? ', ' : ''}${billingAddr.state || ''} ${billingAddr.postalCode || ''}`;
    page.drawText(cityLine, {
      x: col2X,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    yPos -= 12;
  }

  if (billingAddr?.gstin) {
    page.drawText(`GSTIN: ${billingAddr.gstin}`, {
      x: col2X,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });
  }

  // RIGHT COLUMN - Ship To
  yPos = height - 230;
  page.drawText("Ship To:", {
    x: col3X,
    y: yPos,
    size: fontSize.tiny,
    font: helveticaBold,
    color: secondaryColor,
  });
  yPos -= 12;

  const shippingAddr = order.shippingAddress;
  if (shippingAddr?.company) {
    page.drawText(shippingAddr.company, {
      x: col3X,
      y: yPos,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    yPos -= 12;
  }

  if (shippingAddr?.address1) {
    page.drawText(shippingAddr.address1, {
      x: col3X,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    yPos -= 12;
  }

  if (shippingAddr?.city || shippingAddr?.state || shippingAddr?.postalCode) {
    const shipCityLine = `${shippingAddr.city || ''}${shippingAddr.city && shippingAddr.state ? ', ' : ''}${shippingAddr.state || ''} ${shippingAddr.postalCode || ''}`;
    page.drawText(shipCityLine, {
      x: col3X,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    yPos -= 12;
  }

  if (shippingAddr?.gstin) {
    page.drawText(`GSTIN: ${shippingAddr.gstin}`, {
      x: col3X,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });
  }

  // Place of Supply
  yPos -= 20;
  const placeOfSupply = order.placeOfSupply || billingAddr?.state || "Maharashtra";
  const placeOfSupplyCode = order.placeOfSupply ? "" : " (27)";
  page.drawText(`Place of Supply: ${placeOfSupply}${placeOfSupplyCode}`, {
    x: col3X,
    y: yPos,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });

  // Divider line
  yPos -= 15;
  page.drawLine({
    start: { x: leftMargin, y: yPos },
    end: { x: rightMargin, y: yPos },
    thickness: 1,
    color: lightGray,
  });

  // ==================== ITEMS TABLE ====================
  yPos -= 10;

  // Table header background
  page.drawRectangle({
    x: leftMargin,
    y: yPos - 3,
    width: width - 80,
    height: 18,
    color: veryLightGray,
  });

  // Table header text
  const colX = {
    item: leftMargin + 5,
    desc: leftMargin + 60,
    hsn: leftMargin + 200,
    qty: leftMargin + 255,
    unit: leftMargin + 290,
    rate: leftMargin + 325,
    cgst: leftMargin + 365,
    sgst: leftMargin + 405,
    amount: leftMargin + 445,
  };

  page.drawText("Item", { x: colX.item, y: yPos, size: fontSize.tiny, font: helveticaBold, color: secondaryColor });
  page.drawText("Description", { x: colX.desc, y: yPos, size: fontSize.tiny, font: helveticaBold, color: secondaryColor });
  page.drawText("HSN/SAC", { x: colX.hsn, y: yPos, size: fontSize.tiny, font: helveticaBold, color: secondaryColor });
  page.drawText("Qty", { x: colX.qty, y: yPos, size: fontSize.tiny, font: helveticaBold, color: secondaryColor });
  page.drawText("Units", { x: colX.unit, y: yPos, size: fontSize.tiny, font: helveticaBold, color: secondaryColor });
  page.drawText("Rate", { x: colX.rate, y: yPos, size: fontSize.tiny, font: helveticaBold, color: secondaryColor });
  page.drawText("CGST", { x: colX.cgst, y: yPos, size: fontSize.tiny, font: helveticaBold, color: secondaryColor });
  page.drawText("SGST", { x: colX.sgst, y: yPos, size: fontSize.tiny, font: helveticaBold, color: secondaryColor });
  page.drawText("Amount", { x: colX.amount, y: yPos, size: fontSize.tiny, font: helveticaBold, color: secondaryColor });

  yPos -= 22;
  page.drawLine({
    start: { x: leftMargin, y: yPos },
    end: { x: rightMargin, y: yPos },
    thickness: 0.5,
    color: lightGray,
  });
  yPos -= 5;

  // Draw items
  const items = order.items || [];
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;

  for (const item of items) {
    if (!item) continue;

    const quantity = Number(item.quantity) || 1;
    const unitPrice = Number(item.unitPrice) || 0;
    const itemTotal = quantity * unitPrice;
    const cgstRate = Number(item.cgstRate) || 9;
    const sgstRate = Number(item.sgstRate) || 9;
    const cgstAmount = (itemTotal * cgstRate) / 100;
    const sgstAmount = (itemTotal * sgstRate) / 100;

    subtotal += itemTotal;
    totalCgst += cgstAmount;
    totalSgst += sgstAmount;

    const itemName = item.name || item.product?.name || "Item";
    const description = item.description || "";
    const hsnCode = item.hsnCode || "998313";

    // Item name
    page.drawText(itemName.substring(0, 18), {
      x: colX.item,
      y: yPos,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });

    // Description
    page.drawText(description.substring(0, 45), {
      x: colX.desc,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });

    // HSN/SAC
    page.drawText(hsnCode, {
      x: colX.hsn,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });

    // Quantity
    page.drawText(quantity.toString(), {
      x: colX.qty,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });

    // Units
    page.drawText("NOS", {
      x: colX.unit,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });

    // Rate
    page.drawText(formatCurrency(unitPrice), {
      x: colX.rate,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });

    // CGST
    page.drawText(`${cgstRate}%`, {
      x: colX.cgst,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });

    // SGST
    page.drawText(`${sgstRate}%`, {
      x: colX.sgst,
      y: yPos,
      size: fontSize.small,
      font: helveticaFont,
      color: secondaryColor,
    });

    // Amount
    page.drawText(formatCurrency(itemTotal), {
      x: colX.amount,
      y: yPos,
      size: fontSize.small,
      font: helveticaBold,
      color: primaryColor,
    });

    yPos -= 15;

    // Table row divider
    page.drawLine({
      start: { x: leftMargin, y: yPos },
      end: { x: rightMargin, y: yPos },
      thickness: 0.3,
      color: lightGray,
    });
    yPos -= 5;

    // Check for page break
    if (yPos < 100) {
      pdfDoc.addPage();
      const newPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
      yPos = height - 50;
    }
  }

  // ==================== SUMMARY SECTION ====================
  yPos -= 10;

  // Totals box on right side
  const totalsBoxX = width - 180;
  const totalsBoxWidth = 135;

  // Subtotal
  page.drawText("Sub Total:", {
    x: totalsBoxX,
    y: yPos,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });
  page.drawText(formatCurrency(subtotal), {
    x: totalsBoxX + totalsBoxWidth - 80,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  yPos -= 14;

  // CGST
  page.drawText(`CGST ${totalCgst > 0 ? '9%' : '0%'}:`, {
    x: totalsBoxX,
    y: yPos,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });
  page.drawText(formatCurrency(totalCgst), {
    x: totalsBoxX + totalsBoxWidth - 80,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  yPos -= 14;

  // SGST
  page.drawText(`SGST ${totalSgst > 0 ? '9%' : '0%'}:`, {
    x: totalsBoxX,
    y: yPos,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });
  page.drawText(formatCurrency(totalSgst), {
    x: totalsBoxX + totalsBoxWidth - 80,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  yPos -= 14;

  // Discount if applicable
  if (order.discountAmount && Number(order.discountAmount) > 0) {
    page.drawText("Discount:", {
      x: totalsBoxX,
      y: yPos,
      size: fontSize.body,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText(`-${formatCurrency(Number(order.discountAmount))}`, {
      x: totalsBoxX + totalsBoxWidth - 80,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: primaryColor,
    });
    yPos -= 14;
  }

  // Divider line
  yPos -= 2;
  page.drawLine({
    start: { x: totalsBoxX, y: yPos },
    end: { x: totalsBoxX + totalsBoxWidth, y: yPos },
    thickness: 1,
    color: primaryColor,
  });
  yPos -= 10;

  // Total
  const total = Number(order.total) || (subtotal + totalCgst + totalSgst - Number(order.discountAmount || 0));
  page.drawText("Total Amount:", {
    x: totalsBoxX,
    y: yPos,
    size: fontSize.title,
    font: helveticaBold,
    color: primaryColor,
  });
  page.drawText(formatCurrency(total), {
    x: totalsBoxX + totalsBoxWidth - 80,
    y: yPos,
    size: fontSize.title,
    font: helveticaBold,
    color: primaryColor,
  });
  yPos -= 14;

  // Payment Made
  if (order.paymentMade && Number(order.paymentMade) > 0) {
    page.drawText("Payment Made:", {
      x: totalsBoxX,
      y: yPos,
      size: fontSize.body,
      font: helveticaBold,
      color: greenColor,
    });
    page.drawText(`-${formatCurrency(Number(order.paymentMade))}`, {
      x: totalsBoxX + totalsBoxWidth - 80,
      y: yPos,
      size: fontSize.body,
      font: helveticaFont,
      color: greenColor,
    });
    yPos -= 14;

    // Balance Due
    const balanceDue = total - Number(order.paymentMade);
    if (balanceDue > 0) {
      page.drawText("Balance Due:", {
        x: totalsBoxX,
        y: yPos,
        size: fontSize.title,
        font: helveticaBold,
        color: primaryColor,
      });
      page.drawText(formatCurrency(balanceDue), {
        x: totalsBoxX + totalsBoxWidth - 80,
        y: yPos,
        size: fontSize.title,
        font: helveticaBold,
        color: primaryColor,
      });
    }
  }

  // ==================== FOOTER SECTION ====================
  yPos -= 30;
  page.drawLine({
    start: { x: leftMargin, y: yPos },
    end: { x: rightMargin, y: yPos },
    thickness: 1,
    color: lightGray,
  });
  yPos -= 15;

  const footerCol1X = leftMargin;
  const footerCol2X = leftMargin + 180;
  const footerCol3X = leftMargin + 350;

  // LEFT - Notes and Bank Details
  page.drawText("Notes:", {
    x: footerCol1X,
    y: yPos,
    size: fontSize.tiny,
    font: helveticaBold,
    color: secondaryColor,
  });
  yPos -= 10;
  page.drawText("Thank you for your business!", {
    x: footerCol1X,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
  });
  yPos -= 15;

  page.drawText("Bank Details:", {
    x: footerCol1X,
    y: yPos,
    size: fontSize.tiny,
    font: helveticaBold,
    color: secondaryColor,
  });
  yPos -= 10;
  page.drawText("Bank Name: HDFC Bank", {
    x: footerCol1X,
    y: yPos,
    size: fontSize.small,
    font: helveticaFont,
    color: primaryColor,
  });
  yPos -= 10;
  page.drawText("A/c No.: 50100123456789", {
    x: footerCol1X,
    y: yPos,
    size: fontSize.small,
    font: helveticaFont,
    color: primaryColor,
  });
  yPos -= 10;
  page.drawText("IFSC Code: HDFC0001234", {
    x: footerCol1X,
    y: yPos,
    size: fontSize.small,
    font: helveticaFont,
    color: primaryColor,
  });

  // CENTER - Terms & Conditions
  page.drawText("Terms & Conditions:", {
    x: footerCol2X,
    y: yPos + 40,
    size: fontSize.tiny,
    font: helveticaBold,
    color: secondaryColor,
  });
  yPos -= 10;
  page.drawText("1. Payment is due within 30 days of invoice date.", {
    x: footerCol2X,
    y: yPos,
    size: fontSize.small,
    font: helveticaFont,
    color: secondaryColor,
  });
  yPos -= 10;
  page.drawText("2. All prices are exclusive of GST unless specified.", {
    x: footerCol2X,
    y: yPos,
    size: fontSize.small,
    font: helveticaFont,
    color: secondaryColor,
  });
  yPos -= 10;
  page.drawText("3. Services once rendered cannot be refunded.", {
    x: footerCol2X,
    y: yPos,
    size: fontSize.small,
    font: helveticaFont,
    color: secondaryColor,
  });
  yPos -= 10;
  page.drawText("4. Dispute, if any, shall be subject to Mumbai jurisdiction.", {
    x: footerCol2X,
    y: yPos,
    size: fontSize.small,
    font: helveticaFont,
    color: secondaryColor,
  });

  // RIGHT - Authorized Signature
  page.drawText("Authorized Signatory", {
    x: footerCol3X,
    y: yPos + 40,
    size: fontSize.tiny,
    font: helveticaBold,
    color: secondaryColor,
  });
  yPos -= 25;
  page.drawRectangle({
    x: footerCol3X - 10,
    y: yPos - 20,
    width: 100,
    height: 35,
    color: veryLightGray,
  });
  page.drawText("(Digitally Signed)", {
    x: footerCol3X,
    y: yPos - 10,
    size: fontSize.tiny,
    font: helveticaFont,
    color: secondaryColor,
  });

  // BOTTOM - Amount in words and certification
  yPos -= 35;
  page.drawLine({
    start: { x: leftMargin, y: yPos },
    end: { x: rightMargin, y: yPos },
    thickness: 1,
    color: lightGray,
  });
  yPos -= 15;

  // Total amount in words
  const amountInWords = convertNumberToWords(total);
  page.drawText(`Total Amount (in words): ${amountInWords}`, {
    x: leftMargin,
    y: yPos,
    size: fontSize.body,
    font: helveticaBold,
    color: primaryColor,
  });
  yPos -= 15;

  // Certification
  page.drawText("Certified that the particulars given above are true and correct", {
    x: leftMargin,
    y: yPos,
    size: fontSize.small,
    font: helveticaFont,
    color: secondaryColor,
  });

  // Company stamp/signature area
  page.drawText("For Shaurrya Teleservices Pvt. Ltd", {
    x: width - 180,
    y: yPos,
    size: fontSize.body,
    font: helveticaFont,
    color: primaryColor,
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
