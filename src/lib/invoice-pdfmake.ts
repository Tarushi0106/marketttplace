import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';

interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  status: string;
  company: {
    name: string;
    address: string;
    city: string;
    gst: string;
    email: string;
    phone: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  recurring?: {
    hasRecurring: boolean;
    items: { name: string; amount: number; period: string }[];
  };
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
}

function fmt(n: number): string {
  return `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Convert hex color to pdf-lib rgb (0-1 range)
function hex(h: string) {
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const { invoiceNumber, date, status, company, customer, items, subtotal, tax, discount, total, recurring } = data;
  const isPaid = status === 'PAID';

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize(); // 595.28 x 841.89

  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // y coordinate helpers (pdf-lib measures from bottom-left)
  const y = (fromTop: number) => height - fromTop;

  // ── Header accent bar ─────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 6, width, height: 6, color: hex('#161848') });

  // ── Company info (left) ───────────────────────────────────────
  page.drawText(company.name, { x: 50, y: y(44), font: bold, size: 18, color: hex('#1a2744') });
  page.drawText(company.address, { x: 50, y: y(62), font: regular, size: 9, color: hex('#64748b') });
  page.drawText(company.city,    { x: 50, y: y(74), font: regular, size: 9, color: hex('#64748b') });
  page.drawText(`GST: ${company.gst}`, { x: 50, y: y(86), font: regular, size: 8, color: hex('#94a3b8') });

  // ── Invoice meta (right) ──────────────────────────────────────
  const invTitle = 'INVOICE';
  const invTitleW = bold.widthOfTextAtSize(invTitle, 24);
  page.drawText(invTitle, { x: width - 50 - invTitleW, y: y(42), font: bold, size: 24, color: hex('#161848') });

  const invNum = `# ${invoiceNumber}`;
  const invNumW = bold.widthOfTextAtSize(invNum, 10);
  page.drawText(invNum, { x: width - 50 - invNumW, y: y(64), font: bold, size: 10, color: hex('#1a2744') });

  const invDate = `Date: ${date}`;
  const invDateW = regular.widthOfTextAtSize(invDate, 9);
  page.drawText(invDate, { x: width - 50 - invDateW, y: y(76), font: regular, size: 9, color: hex('#64748b') });

  // Status badge
  const badgeBg  = isPaid ? hex('#dcfce7') : hex('#fef3c7');
  const badgeFg  = isPaid ? hex('#15803d') : hex('#b45309');
  const badgeTxt = isPaid ? 'PAID' : 'PENDING';
  const badgeTxtW = bold.widthOfTextAtSize(badgeTxt, 9);
  const badgeX = width - 50 - 90;
  page.drawRectangle({ x: badgeX, y: y(106), width: 90, height: 18, color: badgeBg });
  page.drawText(badgeTxt, { x: badgeX + (90 - badgeTxtW) / 2, y: y(101), font: bold, size: 9, color: badgeFg });

  // ── Divider ───────────────────────────────────────────────────
  page.drawLine({ start: { x: 50, y: y(116) }, end: { x: width - 50, y: y(116) }, thickness: 0.5, color: hex('#e8edf5') });

  // ── Bill To ───────────────────────────────────────────────────
  page.drawText('BILL TO', { x: 50, y: y(132), font: bold, size: 8, color: hex('#94a3b8') });
  page.drawText(customer.name || 'Customer', { x: 50, y: y(146), font: bold, size: 11, color: hex('#1a2744') });
  if (customer.address) page.drawText(customer.address, { x: 50, y: y(161), font: regular, size: 9, color: hex('#475569') });
  if (customer.email)   page.drawText(customer.email,   { x: 50, y: y(174), font: regular, size: 9, color: hex('#475569') });
  if (customer.phone)   page.drawText(customer.phone,   { x: 50, y: y(187), font: regular, size: 9, color: hex('#475569') });

  // ── Order details (right) ─────────────────────────────────────
  page.drawText('ORDER DETAILS', { x: 330, y: y(132), font: bold, size: 8, color: hex('#94a3b8') });
  const orderRows = [
    ['Invoice No.', invoiceNumber],
    ['Invoice Date', date],
    ['Status', status || 'PENDING'],
  ];
  let oy = 146;
  for (const [k, v] of orderRows) {
    page.drawText(k, { x: 330, y: y(oy), font: regular, size: 9, color: hex('#94a3b8') });
    const vw = bold.widthOfTextAtSize(v, 9);
    page.drawText(v, { x: width - 50 - vw, y: y(oy), font: bold, size: 9, color: hex('#1a2744') });
    oy += 14;
  }

  // ── Items table ───────────────────────────────────────────────
  let tableTop = 212;
  page.drawRectangle({ x: 50, y: y(tableTop + 22), width: 495, height: 22, color: hex('#1a2744') });

  const colDesc = 56, colQty = 336, colRate = 386, colAmt = 466;

  page.drawText('DESCRIPTION', { x: colDesc, y: y(tableTop + 14), font: bold, size: 9, color: hex('#cbd5e1') });
  page.drawText('QTY',    { x: colQty, y: y(tableTop + 14), font: bold, size: 9, color: hex('#cbd5e1') });
  page.drawText('RATE',   { x: colRate, y: y(tableTop + 14), font: bold, size: 9, color: hex('#cbd5e1') });
  page.drawText('AMOUNT', { x: colAmt, y: y(tableTop + 14), font: bold, size: 9, color: hex('#cbd5e1') });

  let rowTop = tableTop + 22;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const rowBg = i % 2 === 0 ? hex('#f8fafc') : hex('#ffffff');
    page.drawRectangle({ x: 50, y: y(rowTop + 24), width: 495, height: 24, color: rowBg });

    // Truncate long names
    let name = item.name;
    while (name.length > 2 && bold.widthOfTextAtSize(name, 10) > 260) name = name.slice(0, -1);
    if (name !== item.name) name += '…';

    page.drawText(name, { x: colDesc, y: y(rowTop + 16), font: bold, size: 10, color: hex('#1a2744') });
    page.drawText(String(item.quantity), { x: colQty, y: y(rowTop + 16), font: regular, size: 10, color: hex('#475569') });

    const rateStr = fmt(item.rate);
    const rateW = regular.widthOfTextAtSize(rateStr, 10);
    page.drawText(rateStr, { x: colRate + 70 - rateW, y: y(rowTop + 16), font: regular, size: 10, color: hex('#475569') });

    const amtStr = fmt(item.amount);
    const amtW = regular.widthOfTextAtSize(amtStr, 10);
    page.drawText(amtStr, { x: width - 50 - amtW, y: y(rowTop + 16), font: regular, size: 10, color: hex('#475569') });

    rowTop += 24;
  }

  // ── Totals ────────────────────────────────────────────────────
  let totY = rowTop + 16;
  const totalRows: [string, string, boolean][] = [
    ['Subtotal', fmt(subtotal), false],
    ...(tax > 0      ? [['Tax (GST)', fmt(tax), false] as [string, string, boolean]] : []),
    ...(discount > 0 ? [['Discount', `-${fmt(discount)}`, true] as [string, string, boolean]] : []),
  ];
  for (const [label, value, isDiscount] of totalRows) {
    page.drawText(label, { x: 360, y: y(totY), font: regular, size: 10, color: hex('#64748b') });
    const vw = regular.widthOfTextAtSize(value, 10);
    page.drawText(value, { x: width - 50 - vw, y: y(totY), font: regular, size: 10, color: isDiscount ? hex('#15803d') : hex('#1a2744') });
    totY += 16;
  }

  // Total box
  totY += 4;
  page.drawRectangle({ x: 355, y: y(totY + 28), width: 190, height: 28, color: hex('#1a2744') });
  page.drawText('Total Due', { x: 363, y: y(totY + 17), font: bold, size: 12, color: hex('#ffffff') });
  const totalStr = fmt(total);
  const totalStrW = bold.widthOfTextAtSize(totalStr, 13);
  page.drawText(totalStr, { x: width - 56 - totalStrW, y: y(totY + 17), font: bold, size: 13, color: hex('#93C5FD') });

  // ── Recurring info ────────────────────────────────────────────
  if (recurring?.hasRecurring && recurring.items.length > 0) {
    totY += 38;
    page.drawRectangle({ x: 50, y: y(totY + 22), width: 495, height: 22, color: hex('#E8F0FF') });
    const recText = `Recurring: ${recurring.items.map(i => `${i.name}: Rs. ${i.amount.toLocaleString('en-IN')}/${i.period}`).join(' | ')}`;
    page.drawText(recText, { x: 58, y: y(totY + 13), font: regular, size: 9, color: hex('#141740') });
  }

  // ── Footer ────────────────────────────────────────────────────
  const footerY = 80;
  page.drawLine({ start: { x: 50, y: footerY + 40 }, end: { x: width - 50, y: footerY + 40 }, thickness: 0.5, color: hex('#e8edf5') });
  const thanks = 'Thank you for your business!';
  const thanksW = regular.widthOfTextAtSize(thanks, 9);
  page.drawText(thanks, { x: (width - thanksW) / 2, y: footerY + 26, font: regular, size: 9, color: hex('#64748b') });

  const contactLine = `${company.name}  |  ${company.email}  |  ${company.phone}`;
  const contactW = regular.widthOfTextAtSize(contactLine, 8);
  page.drawText(contactLine, { x: (width - contactW) / 2, y: footerY + 14, font: regular, size: 8, color: hex('#94a3b8') });

  const disclaimer = 'Computer-generated invoice. No signature required.';
  const disclaimerW = regular.widthOfTextAtSize(disclaimer, 7);
  page.drawText(disclaimer, { x: (width - disclaimerW) / 2, y: footerY + 4, font: regular, size: 7, color: hex('#94a3b8') });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export function transformOrderToInvoiceData(order: any): InvoiceData {
  const billingAddr = order.billingAddress || order.shippingAddress || {};
  const customerName = billingAddr.company ||
    `${billingAddr.firstName || ''} ${billingAddr.lastName || ''}`.trim() ||
    order.email?.split('@')[0] || 'Customer';

  const customerAddress = [
    billingAddr.address1,
    billingAddr.address2,
    [billingAddr.city, billingAddr.state, billingAddr.postalCode].filter(Boolean).join(', ')
  ].filter(Boolean).join(', ');

  const items: InvoiceItem[] = (order.items || []).map((item: any) => ({
    name: item.product?.name || item.name || 'Item',
    description: item.variant?.name || item.description,
    quantity: Number(item.quantity) || 1,
    rate: Number(item.unitPrice) || 0,
    amount: Number(item.totalPrice) || (Number(item.quantity) * Number(item.unitPrice)) || 0
  }));

  const subtotal = Number(order.subtotal) || items.reduce((sum: number, i: InvoiceItem) => sum + i.amount, 0);
  const tax = Number(order.taxAmount) || 0;
  const discount = Number(order.discountAmount) || 0;
  const total = Number(order.total) || subtotal + tax - discount;

  const recurringItems = (order.items || []).filter((item: any) => item.isRecurring);
  const hasRecurring = recurringItems.length > 0;

  return {
    invoiceNumber: generateInvoiceNumber(),
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: order.paymentStatus || 'PENDING',
    company: {
      name: 'DeWiN Solutions',
      address: 'Laxmi Plaza, 213, Off New Link Rd, Laxmi Industrial Estate',
      city: 'Andheri West, Mumbai, Maharashtra 400053',
      gst: '27ABCCS1234A1Z9',
      email: 'info@dewintele.com',
      phone: '+91 99102 05084'
    },
    customer: {
      name: customerName,
      email: order.email || '',
      phone: billingAddr.phone || order.phone || '',
      address: customerAddress
    },
    items,
    subtotal,
    tax,
    discount,
    total,
    recurring: hasRecurring ? {
      hasRecurring: true,
      items: recurringItems.map((item: any) => ({
        name: item.product?.name || item.name || 'Item',
        amount: Number(item.recurringPrice) || 0,
        period: item.billingCycle === 'YEARLY' ? 'year' : 'month'
      }))
    } : undefined
  };
}
