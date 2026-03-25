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

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
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
  const shippingAddr = order.shippingAddress;
  const items = groupItems(order.items || []);
  
  // Calculate today's total (baseProductPrice + setupFee)
  const todayTotal = items.reduce((sum, item) => {
    const basePrice = Number(item.baseProductPrice) || 0;
    const setupFee = Number(item.setupFee) || 0;
    const quantity = Number(item.quantity) || 1;
    return sum + ((basePrice + setupFee) * quantity);
  }, 0);
  
  const discountAmount = Number(order.discountAmount) || 0;
  const taxAmount = Number(order.taxAmount) || 0;
  const shippingAmount = Number(order.shippingAmount) || 0;
  const subtotal = todayTotal;
  const total = Number(order.total) || subtotal - discountAmount + taxAmount + shippingAmount;
  const setupFeeTotal = items.reduce((sum, item) => sum + (Number(item.setupFee) || 0), 0);
  const recurringItem = items.find(item => item.isRecurring);
  const hasRecurring = recurringItem?.isRecurring;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body class="bg-white m-0 p-0">
  <div class="max-w-[210mm] mx-auto bg-white" style="min-height: 297mm">
    <!-- Header -->
    <div class="px-8 pt-8 pb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-xl font-semibold text-gray-900">SHAURRYA TELESERVICES</h1>
          <p class="text-sm text-gray-500 mt-1">
            Laxmi Plaza, 213, Off New Link Rd, Laxmi Industrial Estate<br>
            Andheri West, Mumbai, Maharashtra 400053
          </p>
          <p class="text-xs text-gray-400 mt-1">
            PAN: ABCCS1234A | GST: 27ABCCS1234A1Z9
          </p>
        </div>
        <div class="text-right">
          <h2 class="text-lg font-medium text-gray-700">INVOICE</h2>
          <p class="text-sm text-gray-500 mt-2">${invoiceNumber}</p>
          <p class="text-sm text-gray-500">${formatInvoiceDate()}</p>
          ${order.paymentStatus === "PAID" ? `
          <span class="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded mt-2">
            PAID
          </span>
          ` : ''}
        </div>
      </div>
    </div>

    <!-- Bill To & Ship To -->
    <div class="px-8 pb-6">
      <div class="grid grid-cols-2 gap-12">
        <!-- Bill To -->
        <div>
          <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
          ${billingAddr?.company ? `<p class="text-sm font-medium text-gray-900">${billingAddr.company}</p>` : ''}
          <p class="text-sm text-gray-600">
            ${billingAddr?.firstName || ''} ${billingAddr?.lastName || ''}
          </p>
          <p class="text-sm text-gray-500">
            ${billingAddr?.address1 || ''}
            ${billingAddr?.address2 ? `, ${billingAddr.address2}` : ''}
          </p>
          <p class="text-sm text-gray-500">
            ${billingAddr?.city || ''}${billingAddr?.city && billingAddr?.state ? ', ' : ''}${billingAddr?.state || ''} ${billingAddr?.postalCode || ''}
          </p>
          ${billingAddr?.phone ? `<p class="text-sm text-gray-500 mt-1">${billingAddr.phone}</p>` : ''}
          ${billingAddr?.gstin ? `<p class="text-sm text-gray-500 mt-1">GSTIN: ${billingAddr.gstin}</p>` : ''}
          <p class="text-sm text-gray-500 mt-1">${order.email || ''}</p>
        </div>

        <!-- Ship To / Order Details -->
        <div>
          <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Order Details</h3>
          <p class="text-sm text-gray-600">
            <span class="text-gray-500">Order:</span> ${order.orderNumber || ''}
          </p>
          <p class="text-sm text-gray-600">
            <span class="text-gray-500">Payment:</span> ${(order.paymentMethod || '').toUpperCase() || 'N/A'}
          </p>
          <p class="text-sm text-gray-600">
            <span class="text-gray-500">Status:</span> ${order.paymentStatus || order.status || 'Pending'}
          </p>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="px-8">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
            <th class="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th class="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Qty</th>
            <th class="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Rate</th>
            <th class="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => `
          <tr class="border-b border-gray-100">
            <td class="py-3 text-sm text-gray-500">${index + 1}</td>
            <td class="py-3">
              <p class="text-sm text-gray-900">${item.name || ''}</p>
              ${item.variant && typeof item.variant === 'object' ? `<p class="text-xs text-gray-500">${(item.variant as any).name || ''}</p>` : ''}
              ${item.isRecurring ? `
              <p class="text-xs text-gray-500 mt-1">
                Recurring: ${getBillingCycleLabel(item.billingCycle)}
                ${item.recurringPrice ? ` (${formatCurrency(Number(item.recurringPrice))}/cycle)` : ''}
              </p>
              ` : ''}
              ${item.setupFee && item.setupFee > 0 ? `
              <p class="text-xs text-gray-500 mt-1">Setup Fee: ${formatCurrency(Number(item.setupFee))}</p>
              ` : ''}
            </td>
            <td class="py-3 text-sm text-gray-600 text-center">${item.quantity || 1}</td>
            <td class="py-3 text-sm text-gray-600 text-right">${formatCurrency(Number(item.unitPrice) || 0)}</td>
            <td class="py-3 text-sm text-gray-900 text-right font-medium">
              ${formatCurrency(Number(item.totalPrice) || 0)}
            </td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="px-8 py-6">
      <div class="flex justify-end">
        <div class="w-56">
          <div class="flex justify-between py-2 text-sm">
            <span class="text-gray-500">Subtotal</span>
            <span class="text-gray-900">${formatCurrency(subtotal)}</span>
          </div>
          ${discountAmount > 0 ? `
          <div class="flex justify-between py-2 text-sm">
            <span class="text-gray-500">Discount</span>
            <span class="text-green-600">-${formatCurrency(discountAmount)}</span>
          </div>
          ` : ''}
          ${taxAmount > 0 ? `
          <div class="flex justify-between py-2 text-sm">
            <span class="text-gray-500">Tax</span>
            <span class="text-gray-900">${formatCurrency(taxAmount)}</span>
          </div>
          ` : ''}
          ${shippingAmount > 0 ? `
          <div class="flex justify-between py-2 text-sm">
            <span class="text-gray-500">Shipping</span>
            <span class="text-gray-900">${formatCurrency(shippingAmount)}</span>
          </div>
          ` : ''}
          <div class="flex justify-between py-3 border-t border-gray-200 mt-2">
            <span class="text-sm font-medium text-gray-900">Total</span>
            <span class="text-sm font-medium text-gray-900">${formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recurring Info (inline, no colored bar) -->
    ${hasRecurring ? `
    <div class="px-8 py-4">
      <p class="text-sm text-gray-600">
        <span class="font-medium">Recurring:</span> ${getBillingCycleLabel(recurringItem?.billingCycle)}
        ${recurringItem?.recurringPrice ? ` (${formatCurrency(Number(recurringItem.recurringPrice))}/cycle)` : ''}
        ${setupFeeTotal > 0 ? ` | Setup Fee: ${formatCurrency(setupFeeTotal)}` : ''}
      </p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="px-8 py-6 border-t border-gray-100 mt-auto">
      <div class="flex justify-between items-end">
        <div>
          <h4 class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Bank Details</h4>
          <p class="text-xs text-gray-500">HDFC Bank | A/C: 123456789012 | IFSC: HDFC0001234</p>
          <p class="text-xs text-gray-400 mt-1">Andheri West, Mumbai</p>
        </div>
        <div class="text-right">
          <p class="text-xs font-medium text-gray-600">For Shaurrya Teleservices</p>
          <p class="text-xs text-gray-400 mt-4">Authorized Signatory</p>
        </div>
      </div>
      <p class="text-xs text-gray-300 text-center mt-6">
        Computer-generated invoice. No signature required.
      </p>
    </div>
  </div>
</body>
</html>
  `;
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
