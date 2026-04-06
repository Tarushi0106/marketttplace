import puppeteer from "puppeteer";
import { generateInvoiceNumber } from "./invoice";

interface OrderItem {
  id?: string | null;
  name?: string | null;
  description?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  totalPrice?: number | null;
  baseProductPrice?: number | null; // One-time product price
  recurringAmount?: number | null; // Recurring price per cycle
  product?: { id?: string | null; name?: string | null } | null;
  variant?: { id?: string | null; name?: string | null } | null | boolean;
  configuration?: Record<string, any> | null | boolean;
  bundle?: { id?: string | null; name?: string | null } | null | boolean;
  hsnCode?: string | null;
  cgstRate?: number | null;
  sgstRate?: number | null;
  setupFee?: number | null;
  isRecurring?: boolean | null;
  billingCycle?: string | null;
  recurringPrice?: number | null;
}

interface Order {
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
  items?: OrderItem[] | null;
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
}

const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatInvoiceDate = (): string => {
  const d = new Date();
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getBillingCycleLabel = (cycle?: string | null): string => {
  const labels: Record<string, string> = {
    ONE_TIME: "One-time",
    MONTHLY: "Monthly",
    BIMONTHLY: "Bi-Monthly",
    QUARTERLY: "Quarterly",
    FOUR_MONTHLY: "Four-Monthly",
    SEMI_ANNUAL: "Semi-Annual",
    TRI_ANNUAL: "Tri-Annual",
    YEARLY: "Yearly",
    BIENNIAL: "Biennial",
    TRIENNIAL: "Triennial",
  };
  return labels[cycle || ""] || cycle || "One-time";
};

// Group items by productId, variantId, and billingCycle to combine quantities
// Helper function to safely get variant id
const getVariantId = (variant: OrderItem['variant']): string => {
  if (typeof variant === 'object' && variant !== null) {
    const v = variant as { id?: string | null };
    return v.id || 'default';
  }
  return 'default';
};

// Group items by productId, variantId, and billingCycle to combine quantities
const groupItems = (items: OrderItem[]): OrderItem[] => {
  const grouped: Record<string, OrderItem> = {};
  
  items.forEach((item) => {
    const itemAny = item as any;
    const key = `${itemAny.product?.id || itemAny.bundle?.id || 'default'}-${getVariantId(item.variant)}-${item.billingCycle || 'ONE_TIME'}`;
    
    if (grouped[key]) {
      grouped[key] = {
        ...grouped[key],
        quantity: (grouped[key].quantity || 0) + (item.quantity || 1),
        totalPrice: (Number(grouped[key].totalPrice) || 0) + (Number(item.totalPrice) || 0),
      };
    } else {
      grouped[key] = { ...item };
    }
  });
  
  return Object.values(grouped);
};

function generateHTML(order: Order): string {
  const invoiceNumber = generateInvoiceNumber();
  const billingAddr = order.billingAddress || order.shippingAddress;
  const items = groupItems(order.items || []);

  const discountAmount = Number(order.discountAmount) || 0;
  const taxAmount     = Number(order.taxAmount)      || 0;
  const cgstAmount    = Number((order as any).cgstAmount)  || (taxAmount / 2);
  const sgstAmount    = Number((order as any).sgstAmount)  || (taxAmount / 2);
  const shippingAmount = Number(order.shippingAmount) || 0;

  const subtotal = items.reduce((sum, item) => {
    const base  = Number(item.baseProductPrice) || Number(item.unitPrice) || 0;
    const setup = Number(item.setupFee) || 0;
    const qty   = Number(item.quantity) || 1;
    return sum + (base + setup) * qty;
  }, 0);

  const total = Number(order.total) || subtotal - discountAmount + taxAmount + shippingAmount;
  const recurringItem = items.find(item => item.isRecurring);
  const hasRecurring  = !!recurringItem?.isRecurring;

  const isPaid = order.paymentStatus === 'PAID';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page { size: A4; margin: 0; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #1a1a2e;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #fff;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    /* ── TOP ACCENT BAR ── */
    .accent-bar {
      height: 6px;
      background: linear-gradient(90deg, #1a2744 0%, #b91c1c 60%, #ef4444 100%);
    }

    /* ── HEADER ── */
    .header {
      padding: 32px 48px 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #e8edf5;
    }

    .company-name {
      font-size: 22px;
      font-weight: 700;
      color: #1a2744;
      letter-spacing: -0.3px;
      margin-bottom: 6px;
    }

    .company-tagline {
      font-size: 10px;
      color: #64748b;
      font-weight: 400;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .company-meta {
      font-size: 11px;
      color: #64748b;
      line-height: 1.7;
    }

    .company-tax {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 6px;
    }

    .invoice-meta {
      text-align: right;
    }

    .invoice-label {
      font-size: 28px;
      font-weight: 700;
      color: #b91c1c;
      letter-spacing: -0.5px;
      line-height: 1;
      margin-bottom: 10px;
    }

    .invoice-number {
      font-size: 12px;
      font-weight: 600;
      color: #1a2744;
      margin-bottom: 3px;
    }

    .invoice-date {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 10px;
    }

    .badge-paid {
      display: inline-block;
      padding: 4px 14px;
      background: #dcfce7;
      color: #15803d;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      border-radius: 20px;
      border: 1px solid #bbf7d0;
      text-transform: uppercase;
    }

    .badge-pending {
      display: inline-block;
      padding: 4px 14px;
      background: #fef3c7;
      color: #b45309;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      border-radius: 20px;
      border: 1px solid #fde68a;
      text-transform: uppercase;
    }

    /* ── PAID WATERMARK ── */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 96px;
      font-weight: 800;
      color: rgba(21, 128, 61, 0.055);
      letter-spacing: 8px;
      pointer-events: none;
      z-index: 0;
      user-select: none;
    }

    /* ── ADDRESS SECTION ── */
    .address-section {
      padding: 24px 48px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      border-bottom: 1px solid #e8edf5;
    }

    .section-label {
      font-size: 9px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .addr-name {
      font-size: 13px;
      font-weight: 600;
      color: #1a2744;
      margin-bottom: 4px;
    }

    .addr-line {
      font-size: 11px;
      color: #475569;
      line-height: 1.8;
    }

    .addr-gstin {
      font-size: 10px;
      color: #64748b;
      margin-top: 6px;
      font-weight: 500;
    }

    .order-detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      padding: 3px 0;
    }

    .order-detail-key {
      color: #94a3b8;
      font-weight: 500;
    }

    .order-detail-val {
      color: #1a2744;
      font-weight: 500;
      text-align: right;
    }

    /* ── TABLE ── */
    .table-section {
      padding: 24px 48px 0;
      flex: 1;
      position: relative;
      z-index: 1;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead tr {
      background: #1a2744;
    }

    thead th {
      padding: 10px 12px;
      font-size: 10px;
      font-weight: 600;
      color: #cbd5e1;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    thead th:first-child { border-radius: 4px 0 0 4px; }
    thead th:last-child  { border-radius: 0 4px 4px 0; }

    tbody tr {
      border-bottom: 1px solid #f1f5f9;
    }

    tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    tbody td {
      padding: 12px 12px;
      vertical-align: top;
    }

    .item-name {
      font-size: 12px;
      font-weight: 600;
      color: #1a2744;
      margin-bottom: 2px;
    }

    .item-sub {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }

    .item-tag {
      display: inline-block;
      margin-top: 4px;
      padding: 2px 8px;
      background: #fff1f2;
      color: #b91c1c;
      font-size: 9px;
      font-weight: 600;
      border-radius: 10px;
      border: 1px solid #fecaca;
    }

    .item-tag-amber {
      background: #fffbeb;
      color: #b45309;
      border-color: #fde68a;
    }

    /* ── TOTALS ── */
    .totals-section {
      padding: 20px 48px 0;
      display: flex;
      justify-content: flex-end;
    }

    .totals-box {
      width: 260px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 12px;
      border-bottom: 1px dashed #e8edf5;
    }

    .totals-row:last-child { border-bottom: none; }

    .totals-label { color: #64748b; }
    .totals-value { color: #1a2744; font-weight: 500; }
    .totals-value-green { color: #15803d; font-weight: 500; }

    .totals-final {
      display: flex;
      justify-content: space-between;
      padding: 12px 14px;
      margin-top: 8px;
      background: #1a2744;
      border-radius: 6px;
    }

    .totals-final-label {
      font-size: 13px;
      font-weight: 700;
      color: #fff;
    }

    .totals-final-value {
      font-size: 16px;
      font-weight: 700;
      color: #fca5a5;
    }

    /* ── RECURRING BANNER ── */
    .recurring-box {
      margin: 16px 48px 0;
      padding: 10px 16px;
      background: #fff1f2;
      border-left: 3px solid #b91c1c;
      border-radius: 0 4px 4px 0;
      font-size: 11px;
      color: #991b1b;
    }

    /* ── FOOTER ── */
    .footer {
      margin-top: auto;
      padding: 20px 48px 24px;
      border-top: 1px solid #e8edf5;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 16px;
    }

    .footer-heading {
      font-size: 9px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .footer-text {
      font-size: 10px;
      color: #64748b;
      line-height: 1.7;
    }

    .sig-line {
      width: 120px;
      border-top: 1px solid #cbd5e1;
      margin-top: 28px;
      margin-bottom: 4px;
    }

    .footer-note {
      text-align: center;
      font-size: 9px;
      color: #cbd5e1;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    /* ── HELPERS ── */
    .text-right { text-align: right; }
    .text-center { text-align: center; }
  </style>
</head>
<body>
<div class="page">

  ${isPaid ? '<div class="watermark">PAID</div>' : ''}

  <!-- Accent bar -->
  <div class="accent-bar"></div>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="company-name">SHAURRYA TELESERVICES</div>
      <div class="company-tagline">Telecom &amp; Technology Solutions</div>
      <div class="company-meta">
        Laxmi Plaza, 213, Off New Link Rd<br>
        Laxmi Industrial Estate, Andheri West<br>
        Mumbai, Maharashtra 400053
      </div>
      <div class="company-tax">PAN: ABCCS1234A &nbsp;|&nbsp; GSTIN: 27ABCCS1234A1Z9</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-label">INVOICE</div>
      <div class="invoice-number">${invoiceNumber}</div>
      <div class="invoice-date">Date: ${formatInvoiceDate()}</div>
      ${isPaid
        ? '<span class="badge-paid">&#10003; Paid</span>'
        : '<span class="badge-pending">Pending</span>'}
    </div>
  </div>

  <!-- Address + Order Details -->
  <div class="address-section">
    <div>
      <div class="section-label">Bill To</div>
      ${billingAddr?.company ? `<div class="addr-name">${billingAddr.company}</div>` : ''}
      <div class="addr-name" style="${billingAddr?.company ? 'font-weight:500;font-size:12px' : ''}">
        ${billingAddr?.firstName || ''} ${billingAddr?.lastName || ''}
      </div>
      <div class="addr-line">
        ${[
          billingAddr?.address1,
          billingAddr?.address2,
          [billingAddr?.city, billingAddr?.state].filter(Boolean).join(', '),
          billingAddr?.postalCode,
        ].filter(Boolean).join('<br>')}
      </div>
      ${billingAddr?.phone   ? `<div class="addr-line" style="margin-top:6px">&#128222; ${billingAddr.phone}</div>` : ''}
      ${order.email          ? `<div class="addr-line">&#9993; ${order.email}</div>` : ''}
      ${billingAddr?.gstin   ? `<div class="addr-gstin">GSTIN: ${billingAddr.gstin}</div>` : ''}
    </div>

    <div>
      <div class="section-label">Order Details</div>
      ${order.orderNumber ? `
      <div class="order-detail-row">
        <span class="order-detail-key">Order No.</span>
        <span class="order-detail-val">${order.orderNumber}</span>
      </div>` : ''}
      <div class="order-detail-row">
        <span class="order-detail-key">Invoice No.</span>
        <span class="order-detail-val">${invoiceNumber}</span>
      </div>
      <div class="order-detail-row">
        <span class="order-detail-key">Invoice Date</span>
        <span class="order-detail-val">${formatInvoiceDate()}</span>
      </div>
      <div class="order-detail-row">
        <span class="order-detail-key">Payment Mode</span>
        <span class="order-detail-val">${(order.paymentMethod || 'N/A').toUpperCase()}</span>
      </div>
      <div class="order-detail-row">
        <span class="order-detail-key">Payment Status</span>
        <span class="order-detail-val">${order.paymentStatus || 'Pending'}</span>
      </div>
      <div class="order-detail-row">
        <span class="order-detail-key">Place of Supply</span>
        <span class="order-detail-val">Maharashtra (27)</span>
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <div class="table-section">
    <table>
      <thead>
        <tr>
          <th style="width:32px">#</th>
          <th style="text-align:left">Description</th>
          <th style="width:48px">HSN</th>
          <th style="width:40px">Qty</th>
          <th style="width:88px;text-align:right">Unit Price</th>
          <th style="width:88px;text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item, idx) => `
        <tr>
          <td class="text-center" style="color:#94a3b8;font-size:11px">${idx + 1}</td>
          <td>
            <div class="item-name">${item.name || ''}</div>
            ${item.variant && typeof item.variant === 'object'
              ? `<div class="item-sub">Variant: ${(item.variant as any).name || ''}</div>`
              : ''}
            ${item.isRecurring
              ? `<span class="item-tag">&#8635; ${getBillingCycleLabel(item.billingCycle)}${item.recurringPrice ? ` — ${formatCurrency(Number(item.recurringPrice))}/cycle` : ''}</span>`
              : ''}
            ${item.setupFee && Number(item.setupFee) > 0
              ? `<span class="item-tag item-tag-amber">Setup: ${formatCurrency(Number(item.setupFee))}</span>`
              : ''}
          </td>
          <td class="text-center" style="font-size:10px;color:#94a3b8">${(item as any).hsnCode || '—'}</td>
          <td class="text-center" style="color:#475569">${item.quantity || 1}</td>
          <td class="text-right" style="color:#475569">${formatCurrency(Number(item.unitPrice) || 0)}</td>
          <td class="text-right" style="font-weight:600;color:#1a2744">${formatCurrency(Number(item.totalPrice) || 0)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- Totals -->
  <div class="totals-section">
    <div class="totals-box">
      <div class="totals-row">
        <span class="totals-label">Subtotal</span>
        <span class="totals-value">${formatCurrency(subtotal)}</span>
      </div>
      ${discountAmount > 0 ? `
      <div class="totals-row">
        <span class="totals-label">Discount</span>
        <span class="totals-value-green">&#8722; ${formatCurrency(discountAmount)}</span>
      </div>` : ''}
      ${taxAmount > 0 ? `
      <div class="totals-row">
        <span class="totals-label">CGST (9%)</span>
        <span class="totals-value">${formatCurrency(cgstAmount)}</span>
      </div>
      <div class="totals-row">
        <span class="totals-label">SGST (9%)</span>
        <span class="totals-value">${formatCurrency(sgstAmount)}</span>
      </div>` : ''}
      ${shippingAmount > 0 ? `
      <div class="totals-row">
        <span class="totals-label">Shipping</span>
        <span class="totals-value">${formatCurrency(shippingAmount)}</span>
      </div>` : ''}
      <div class="totals-final">
        <span class="totals-final-label">Total Due</span>
        <span class="totals-final-value">${formatCurrency(total)}</span>
      </div>
    </div>
  </div>

  <!-- Recurring Info -->
  ${hasRecurring ? `
  <div class="recurring-box">
    <strong>Recurring Subscription:</strong>
    ${getBillingCycleLabel(recurringItem?.billingCycle)} billing
    ${recurringItem?.recurringPrice ? ` — ${formatCurrency(Number(recurringItem.recurringPrice))} per cycle` : ''}
    &nbsp;&bull;&nbsp; Next charge will be billed automatically.
  </div>` : ''}

  <!-- Footer -->
  <div class="footer">
    <div class="footer-grid">
      <div>
        <div class="footer-heading">Bank Details</div>
        <div class="footer-text">
          <strong>Bank:</strong> HDFC Bank<br>
          <strong>A/C No:</strong> 123456789012<br>
          <strong>IFSC:</strong> HDFC0001234<br>
          <strong>Branch:</strong> Andheri West, Mumbai
        </div>
      </div>
      <div style="text-align:right">
        <div class="footer-heading">For Shaurrya Teleservices</div>
        <div class="sig-line" style="margin-left:auto;margin-right:0"></div>
        <div class="footer-text">Authorised Signatory</div>
      </div>
    </div>
    <div class="footer-note">
      This is a computer-generated invoice and does not require a physical signature. &nbsp;|&nbsp;
      Subject to Mumbai jurisdiction. &nbsp;|&nbsp; E&amp;OE
    </div>
  </div>

</div>
</body>
</html>`;
}

export async function generateInvoicePDF(order: Order): Promise<Buffer> {
  const html = generateHTML(order);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export { generateHTML };
