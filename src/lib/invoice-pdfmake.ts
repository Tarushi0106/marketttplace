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

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  // pdfkit works reliably in serverless/Lambda — pdfmake has ESM resolution issues
  const PDFDocument = require('pdfkit') as typeof import('pdfkit');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { invoiceNumber, date, status, company, customer, items, subtotal, tax, discount, total, recurring } = data;
    const fmt = (n: number) => `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const isPaid = status === 'PAID';

    // ── Header accent bar ─────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 6).fill('#b91c1c');

    // ── Company info (left) ───────────────────────────────────────
    doc.fillColor('#1a2744').fontSize(18).font('Helvetica-Bold')
      .text(company.name, 50, 30);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica')
      .text(company.address, 50, 52)
      .text(company.city, 50, 64)
      .text(`GST: ${company.gst}`, 50, 76);

    // ── Invoice meta (right) ──────────────────────────────────────
    doc.fillColor('#b91c1c').fontSize(24).font('Helvetica-Bold')
      .text('INVOICE', 350, 30, { align: 'right', width: 195 });
    doc.fillColor('#1a2744').fontSize(10).font('Helvetica-Bold')
      .text(`# ${invoiceNumber}`, 350, 58, { align: 'right', width: 195 });
    doc.fillColor('#64748b').fontSize(9).font('Helvetica')
      .text(`Date: ${date}`, 350, 72, { align: 'right', width: 195 });

    // Status badge
    const badgeColor = isPaid ? '#15803d' : '#b45309';
    const badgeBg   = isPaid ? '#dcfce7' : '#fef3c7';
    doc.roundedRect(440, 88, 105, 18, 9).fill(badgeBg);
    doc.fillColor(badgeColor).fontSize(9).font('Helvetica-Bold')
      .text(isPaid ? '✓ PAID' : 'PENDING', 440, 93, { align: 'center', width: 105 });

    // ── Divider ───────────────────────────────────────────────────
    doc.moveTo(50, 116).lineTo(545, 116).lineWidth(1).strokeColor('#e8edf5').stroke();

    // ── Bill To / Order Details ───────────────────────────────────
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica-Bold')
      .text('BILL TO', 50, 126);
    doc.fillColor('#1a2744').fontSize(11).font('Helvetica-Bold')
      .text(customer.name || 'Customer', 50, 138);
    doc.fillColor('#475569').fontSize(9).font('Helvetica')
      .text(customer.address || '', 50, 152)
      .text(customer.email || '', 50, 165)
      .text(customer.phone || '', 50, 177);

    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica-Bold')
      .text('ORDER DETAILS', 310, 126, { align: 'right', width: 235 });
    const orderRows = [
      ['Invoice No.', invoiceNumber],
      ['Invoice Date', date],
      ['Payment Status', status || 'Pending'],
    ];
    let oy = 138;
    for (const [k, v] of orderRows) {
      doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text(k, 310, oy, { width: 110 });
      doc.fillColor('#1a2744').fontSize(9).font('Helvetica-Bold').text(v, 420, oy, { align: 'right', width: 125 });
      oy += 14;
    }

    // ── Items table ───────────────────────────────────────────────
    const tableTop = 210;
    doc.rect(50, tableTop, 495, 22).fill('#1a2744');
    const cols = { desc: 50, qty: 330, rate: 380, amount: 460 };

    doc.fillColor('#cbd5e1').fontSize(9).font('Helvetica-Bold');
    doc.text('DESCRIPTION', cols.desc + 6, tableTop + 6);
    doc.text('QTY', cols.qty, tableTop + 6, { width: 50, align: 'center' });
    doc.text('RATE', cols.rate, tableTop + 6, { width: 80, align: 'right' });
    doc.text('AMOUNT', cols.amount, tableTop + 6, { width: 85, align: 'right' });

    let rowY = tableTop + 22;
    items.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
      doc.rect(50, rowY, 495, 24).fill(bg);
      doc.fillColor('#1a2744').fontSize(10).font('Helvetica-Bold')
        .text(item.name, cols.desc + 6, rowY + 7, { width: 270 });
      doc.fillColor('#475569').fontSize(10).font('Helvetica')
        .text(String(item.quantity), cols.qty, rowY + 7, { width: 50, align: 'center' })
        .text(fmt(item.rate), cols.rate, rowY + 7, { width: 80, align: 'right' })
        .text(fmt(item.amount), cols.amount, rowY + 7, { width: 85, align: 'right' });
      rowY += 24;
    });

    // ── Totals ────────────────────────────────────────────────────
    rowY += 10;
    const totals: [string, string, string?][] = [
      ['Subtotal', fmt(subtotal)],
      ...(tax > 0 ? [['Tax (GST)', fmt(tax)] as [string, string]] : []),
      ...(discount > 0 ? [['Discount', `-${fmt(discount)}`, 'green'] as [string, string, string]] : []),
    ];
    for (const [label, value, color] of totals) {
      doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(label, 360, rowY, { width: 100 });
      doc.fillColor(color === 'green' ? '#15803d' : '#1a2744').fontSize(10).font('Helvetica')
        .text(value, 460, rowY, { width: 85, align: 'right' });
      rowY += 16;
    }

    // Total box
    rowY += 4;
    doc.rect(355, rowY, 190, 28).fill('#1a2744');
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
      .text('Total Due', 362, rowY + 8, { width: 90 });
    doc.fillColor('#fca5a5').fontSize(14).font('Helvetica-Bold')
      .text(fmt(total), 362, rowY + 7, { width: 175, align: 'right' });

    // ── Recurring info ────────────────────────────────────────────
    if (recurring?.hasRecurring && recurring.items.length > 0) {
      rowY += 44;
      doc.rect(50, rowY, 495, 22).fill('#fff1f2');
      doc.fillColor('#991b1b').fontSize(9).font('Helvetica')
        .text(
          `Recurring: ${recurring.items.map(i => `${i.name}: Rs. ${i.amount.toLocaleString('en-IN')}/${i.period}`).join(' | ')}`,
          58, rowY + 7,
          { width: 479 }
        );
      rowY += 22;
    }

    // ── Footer ────────────────────────────────────────────────────
    const footerY = doc.page.height - 80;
    doc.moveTo(50, footerY).lineTo(545, footerY).lineWidth(1).strokeColor('#e8edf5').stroke();
    doc.fillColor('#64748b').fontSize(9).font('Helvetica')
      .text('Thank you for your business!', 50, footerY + 10, { align: 'center', width: 495 })
      .text(`${company.name}  |  ${company.email}  |  ${company.phone}`, 50, footerY + 24, { align: 'center', width: 495 });
    doc.fillColor('#94a3b8').fontSize(8)
      .text('Computer-generated invoice. No signature required.  |  Subject to Mumbai jurisdiction.', 50, footerY + 40, { align: 'center', width: 495 });

    doc.end();
  });
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
      name: 'Shaurrya Teleservices',
      address: 'Laxmi Plaza, 213, Off New Link Rd, Laxmi Industrial Estate',
      city: 'Andheri West, Mumbai, Maharashtra 400053',
      gst: '27ABCCS1234A1Z9',
      email: 'info@shaurryatele.com',
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
