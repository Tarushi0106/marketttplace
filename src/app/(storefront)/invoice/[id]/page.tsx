"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// Helper functions
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

const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `INV-${year}${month}-${random}`;
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
const groupItems = (items: OrderItem[]): OrderItem[] => {
  const grouped: Record<string, OrderItem> = {};
  
  items.forEach((item) => {
    const itemAny = item as any;
    // Create unique key based on product, variant, and billing cycle
    const key = `${itemAny.product?.id || itemAny.bundle?.id || 'default'}-${(item.variant as any)?.id || 'default'}-${item.billingCycle || 'ONE_TIME'}`;
    
    if (grouped[key]) {
      // Combine quantities and totals
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

// Types
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

export default function InvoicePage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        if (!response.ok) {
          throw new Error("Order not found");
        }
        const data = await response.json();
        setOrder(data.data || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{error || "Order not found"}</p>
        </div>
      </div>
    );
  }

  const invoiceNumber = generateInvoiceNumber();
  const billingAddr = order.billingAddress || order.shippingAddress;
  const shippingAddr = order.shippingAddress;
  const items = order.items || [];
  
  // Calculate totals
  const subtotal = order.subtotal || items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const discountAmount = Number(order.discountAmount) || 0;
  const taxAmount = Number(order.taxAmount) || 0;
  const shippingAmount = Number(order.shippingAmount) || 0;
  const total = Number(order.total) || subtotal - discountAmount + taxAmount + shippingAmount;
  
  // Calculate setup fees from items
  const setupFeeTotal = items.reduce((sum, item) => sum + (Number(item.setupFee) || 0), 0);
  
  // Find recurring info
  const recurringItem = items.find(item => item.isRecurring);
  const hasRecurring = recurringItem?.isRecurring;

  return (
    <div className="min-h-screen bg-white">
      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* Invoice Container - A4 Size */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg" style={{ minHeight: "297mm" }}>
        
        {/* Header */}
        <div className="border-b-2 border-gray-900 p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SHAURRYA TELESERVICES</h1>
              <p className="text-sm text-gray-600 mt-1">
                Laxmi Plaza, 213, Off New Link Rd<br />
                Laxmi Industrial Estate, Andheri West<br />
                Mumbai, Maharashtra 400053
              </p>
              <p className="text-xs text-gray-500 mt-2">
                PAN: ABCCS1234A | GST: 27ABCCS1234A1Z9
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-gray-100 px-4 py-2 border border-gray-300">
                <h2 className="text-lg font-bold text-gray-900">TAX INVOICE</h2>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Invoice #: <span className="font-medium">{invoiceNumber}</span>
              </p>
              <p className="text-sm text-gray-600">
                Date: <span className="font-medium">{formatInvoiceDate()}</span>
              </p>
              {order.paymentStatus === "PAID" && (
                <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium mt-2">
                  PAID
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bill To & Ship To */}
        <div className="border-b border-gray-200 p-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Bill To */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Bill To</h3>
              {billingAddr?.company && (
                <p className="font-medium text-gray-900">{billingAddr.company}</p>
              )}
              <p className="text-sm text-gray-700">
                {billingAddr?.firstName} {billingAddr?.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {billingAddr?.address1}
                {billingAddr?.address2 && <><br />{billingAddr.address2}</>}
              </p>
              <p className="text-sm text-gray-600">
                {billingAddr?.city}{billingAddr?.city && ", "}{billingAddr?.state} {billingAddr?.postalCode}
              </p>
              {billingAddr?.phone && (
                <p className="text-sm text-gray-600 mt-1">Ph: {billingAddr.phone}</p>
              )}
              {billingAddr?.gstin && (
                <p className="text-sm text-gray-600 mt-1">GSTIN: {billingAddr.gstin}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">Email: {order.email}</p>
            </div>

            {/* Ship To */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ship To</h3>
              {shippingAddr?.company && (
                <p className="font-medium text-gray-900">{shippingAddr.company}</p>
              )}
              <p className="text-sm text-gray-700">
                {shippingAddr?.firstName} {shippingAddr?.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {shippingAddr?.address1}
                {shippingAddr?.address2 && <><br />{shippingAddr.address2}</>}
              </p>
              <p className="text-sm text-gray-600">
                {shippingAddr?.city}{shippingAddr?.city && ", "}{shippingAddr?.state} {shippingAddr?.postalCode}
              </p>
              {shippingAddr?.phone && (
                <p className="text-sm text-gray-600 mt-1">Ph: {shippingAddr.phone}</p>
              )}
            </div>

            {/* Order Details */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Order Details</h3>
              <p className="text-sm text-gray-700">
                Order #: <span className="font-medium">{order.orderNumber}</span>
              </p>
              <p className="text-sm text-gray-700">
                Payment: <span className="font-medium">{order.paymentMethod?.toUpperCase() || "N/A"}</span>
              </p>
              <p className="text-sm text-gray-700">
                Status: <span className="font-medium text-green-600">{order.paymentStatus || order.status || "Pending"}</span>
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Place of Supply: <span className="font-medium">Maharashtra (27)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-12">#</th>
                <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Item & Description</th>
                <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-20">HSN/SAC</th>
                <th className="text-center py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-16">Qty</th>
                <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-24">Rate</th>
                <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {groupItems(items).map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="py-3">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    {item.variant && typeof item.variant === 'object' && (
                      <p className="text-xs text-gray-500">{(item.variant as any).name}</p>
                    )}
                    {item.isRecurring && (
                      <p className="text-xs text-blue-600 mt-1">
                        Recurring: {getBillingCycleLabel(item.billingCycle)}
                        {item.recurringPrice && ` (${formatCurrency(Number(item.recurringPrice))}/cycle)`}
                      </p>
                    )}
                    {item.setupFee && item.setupFee > 0 && (
                      <p className="text-xs text-amber-600 mt-1">+ Setup Fee: {formatCurrency(Number(item.setupFee))}</p>
                    )}
                  </td>
                  <td className="py-3 text-sm text-gray-600">{item.hsnCode || "9983"}</td>
                  <td className="py-3 text-sm text-gray-600 text-center font-medium">{item.quantity || 1}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">{formatCurrency(Number(item.totalPrice) / (item.quantity || 1))}</td>
                  <td className="py-3 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(Number(item.totalPrice) || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-8 pb-8">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600 font-medium">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              {setupFeeTotal > 0 && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-amber-600">Setup Fees</span>
                  <span className="text-amber-600 font-medium">{formatCurrency(setupFeeTotal)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">Tax (18% GST)</span>
                <span className="text-gray-900 font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              {shippingAmount > 0 && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(shippingAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-base font-bold text-gray-900">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recurring Plan Section */}
        {hasRecurring && (
          <div className="px-8 pb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-800 mb-2">Recurring Billing Information</h4>
              <p className="text-sm text-blue-700">
                You will be charged according to your selected recurring plan: <span className="font-medium">{getBillingCycleLabel(recurringItem?.billingCycle)}</span>
                {recurringItem?.recurringPrice && (
                  <> (₹{Number(recurringItem.recurringPrice).toLocaleString("en-IN")}{getBillingCycleLabel(recurringItem?.billingCycle)?.toLowerCase().includes("one") ? "" : "/" + recurringItem?.billingCycle?.toLowerCase().replace("_", "-")})</>
                )}
              </p>
              {setupFeeTotal > 0 && (
                <p className="text-sm text-blue-700 mt-1">
                  A one-time setup fee of {formatCurrency(setupFeeTotal)} has been charged today.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 p-8 bg-gray-50">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Bank Details</h4>
              <p className="text-sm text-gray-700">Bank Name: HDFC Bank</p>
              <p className="text-sm text-gray-700">Account Number: 123456789012</p>
              <p className="text-sm text-gray-700">IFSC Code: HDFC0001234</p>
              <p className="text-sm text-gray-700">Branch: Andheri West, Mumbai</p>
            </div>
            <div className="text-right">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Authorized Signatory</h4>
              <div className="mt-8">
                <p className="text-sm font-medium text-gray-900">For Shaurrya Teleservices</p>
                <p className="text-xs text-gray-500 mt-6">Authorised Signatory</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-8">
            This is a computer-generated invoice. No signature is required.
          </p>
        </div>
      </div>

      {/* Print Button - Hidden when printing */}
      <div className="fixed bottom-8 right-8 no-print">
        <button
          onClick={() => window.print()}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Invoice
        </button>
      </div>
    </div>
  );
}
