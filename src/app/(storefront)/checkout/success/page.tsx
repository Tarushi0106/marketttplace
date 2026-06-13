"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Download, Loader2, FileText, ArrowRight, User, MapPin, Mail, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  configuration?: Record<string, any> | null;
  // Recurring billing fields
  billingCycle?: "ONE_TIME" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "FOUR_MONTHLY" | "SEMI_ANNUAL" | "TRI_ANNUAL" | "YEARLY" | "BIENNIAL" | "TRIENNIAL" | null | undefined;
  isRecurring?: boolean;
  recurringPrice?: number | null;
  setupFee?: number | null;
  // Cart-style pricing fields
  recurringAmount?: number | null;
  productPrice?: number | null;
  baseProductPrice?: number | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  items: OrderItem[];
  metadata?: Record<string, any> | null;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    company?: string | null;
    address1: string;
    address2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string | null;
  } | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  pdfUrl: string;
  pdfData?: string; // Base64 PDF data for download
  status: string;
}

// Configuration label mappings
const configLabels: Record<string, string> = {
  cpu: "CPU",
  ram: "RAM",
  storage: "Storage",
  tier: "Tier",
  os: "OS",
  bandwidth: "Bandwidth",
  gpu: "GPU",
  data_center: "Data Center",
};

function formatConfigValue(key: string, value: string): string {
  const lowerKey = key.toLowerCase();
  
  if (lowerKey === "cpu" || lowerKey === "vcpu") {
    if (value.match(/^\d+$/)) return `${value} vCPU`;
    return value;
  }
  if (lowerKey === "ram" || lowerKey === "memory") {
    if (value.match(/^\d+$/)) return `${value} GB`;
    return value;
  }
  if (lowerKey === "storage" || lowerKey === "disk") {
    if (value.match(/^\d+$/)) return `${value} GB`;
    return value;
  }
  if (lowerKey === "tier") {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  return value;
}

// Billing cycle label helper
function getBillingCycleLabel(cycle: string | null | undefined): string {
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
  return labels[cycle || ""] || cycle || "";
}

// Get interval text for recurring
function getRecurringInterval(billingCycle: string | null | undefined): string {
  const intervals: Record<string, string> = {
    MONTHLY: "1 month",
    BIMONTHLY: "2 months",
    QUARTERLY: "3 months",
    FOUR_MONTHLY: "4 months",
    SEMI_ANNUAL: "6 months",
    TRI_ANNUAL: "9 months",
    YEARLY: "1 year",
    BIENNIAL: "2 years",
    TRIENNIAL: "3 years",
  };
  return intervals[billingCycle || ""] || "";
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const sessionId = searchParams.get("session_id");
  const clearSidebar = useCartStore((state) => state.clearSidebar);

  const [order, setOrder] = useState<Order | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    // Clear sidebar immediately on mount (normal navigation)
    clearSidebar();
    fetchOrderAndInvoice();

    // Also handle bfcache restore (browser back/forward button)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) clearSidebar();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [orderId, router]);

  const fetchOrderAndInvoice = async () => {
    try {
      if (sessionId) {
        const verifyResponse = await fetch("/api/checkout/verify-stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, orderId }),
        });
        if (verifyResponse.ok) {
          verifyResponse.json();
        }
      }

      const orderResponse = await fetch(`/api/orders/${orderId}`);
      
      if (!orderResponse.ok) {
        setLoading(false);
        return;
      }
      
      const orderData = await orderResponse.json();
      const orderResult = orderData.data || orderData;
      setOrder(orderResult as Order);
      console.log('[Checkout] Order loaded:', orderResult.orderNumber, 'Email:', orderResult.email, 'Status:', orderResult.paymentStatus);

      try {
        const invoiceResponse = await fetch(`/api/invoices?orderId=${orderResult.id}`);
        console.log('[Checkout] Invoice check response status:', invoiceResponse.status);
        if (invoiceResponse.ok) {
          const invoiceData = await invoiceResponse.json();
          console.log('[Checkout] Invoice data:', invoiceData);
          if (invoiceData.invoice) {
            setInvoice(invoiceData.invoice);
            console.log('[Checkout] Invoice already exists, triggering email send');
            // Send email for existing invoice
            await sendInvoiceEmail(invoiceData.invoice.id);
            setLoading(false);
            return;
          }
        }
      } catch (invError) {
        console.error("Error checking invoice:", invError);
      }

      console.log('[Checkout] Calling generateInvoice()');
      await generateInvoice(orderResult);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order/invoice:", error);
      setLoading(false);
    }
  };

  const generateInvoice = async (orderData?: Order) => {
    const targetOrder = orderData || order;
    console.log('[Checkout] Generating invoice for order:', targetOrder?.id, 'Email:', targetOrder?.email);
    if (!targetOrder?.id) {
      setError("Order not loaded");
      return;
    }

    setGeneratingInvoice(true);
    setError(null);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: targetOrder.id, sendEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        setInvoice(data.invoice);
        if (data.emailSent) {
          setEmailSent(true);
        }
      } else if (response.status === 409) {
        const data = await response.json();
        setInvoice(data.invoice);
        // Send email for existing invoice (409 = already exists)
        if (data.invoice?.id) {
          await sendInvoiceEmail(data.invoice.id);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || errorData.details || "Failed to generate invoice.");
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      setError("An error occurred while generating invoice");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Send invoice email (for new or existing invoices)
  const sendInvoiceEmail = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/resend`, {
        method: "POST",
      });
      if (response.ok) {
        setEmailSent(true);
        console.log("[Checkout] Email sent successfully for existing invoice");
      }
    } catch (error) {
      console.error("Error sending invoice email:", error);
    }
  };

  // Download invoice PDF (handles base64 data)
  const downloadInvoicePdf = () => {
    if (!invoice) return;
    
    if (invoice.pdfData) {
      // Use base64 data for download
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${invoice.pdfData}`;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (invoice.pdfUrl) {
      // Fallback to URL if no base64 data
      window.open(invoice.pdfUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Checkout", href: "/checkout" },
          { label: "Success", href: "/checkout/success" },
        ]}
        className="mb-8"
      />

      {/* Success Header */}
      <div className="flex flex-col items-center justify-center mb-12">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Thank you for your order. A confirmation email has been sent to{" "}
          <span className="font-medium">{order.email}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="font-medium">
                  {order.shippingAddress.company || `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.address1}
                  {order.shippingAddress.address2 && `, ${order.shippingAddress.address2}`}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </p>
                <p className="text-muted-foreground">Phone: {order.shippingAddress.phone || order.phone}</p>
                <p className="text-muted-foreground">Email: {order.email}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Details</span>
                <span className="text-sm font-normal text-muted-foreground">
                  #{order.orderNumber}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <p className="font-medium capitalize">{order.paymentStatus.toLowerCase()}</p>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-medium">Items Ordered</h3>
                {order.items?.map((item: any) => {
                  // Use cart-style pricing: recurringAmount for recurring products
                  const displayPrice = item.isRecurring && item.billingCycle !== 'ONE_TIME'
                    ? (item.recurringAmount || item.unitPrice || 0)
                    : (item.productPrice || item.baseProductPrice || item.totalPrice || 0);
                  
                  // Get instances from configuration
                  const instances = item.configuration?.instances || item.instances || [];
                  
                  return (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-medium">
                          {item.isRecurring && item.billingCycle !== 'ONE_TIME'
                            ? `${formatCurrency(displayPrice, order.currency)}/${getBillingCycleLabel(item.billingCycle)}`
                            : formatCurrency(displayPrice, order.currency)
                          }
                        </span>
                      </div>
                      
                      {/* Show configs for this item */}
                      {instances.map((instance: any) => (
                        <div key={instance.instanceId}>
                          {instance.selectedConfigs?.map((config: any) => (
                            <div key={config.configId} className="flex justify-between text-xs text-muted-foreground ml-2">
                              <span>{config.configName || config.configId}</span>
                              <span>{item.isRecurring && item.billingCycle !== 'ONE_TIME' ? 'included' : formatCurrency(config.price || 0, order.currency)}</span>
                            </div>
                          ))}
                          {instance.selectedAddons?.map((addon: any) => (
                            <div key={addon.addon?.id} className="flex justify-between text-xs text-muted-foreground ml-2">
                              <span>+ {addon.addon?.name}</span>
                              <span>{formatCurrency(addon.addon?.price || 0, order.currency)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        {item.isRecurring && item.billingCycle && item.billingCycle !== 'ONE_TIME' && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                            {getBillingCycleLabel(item.billingCycle)}
                          </span>
                        )}
                      </div>
                      {item.recurringData?.setupFee && item.recurringData.setupFee > 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          + {formatCurrency(item.recurringData.setupFee, order.currency)} setup fee included
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Order Summary - Full Pricing Breakdown - matching configure page format */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Order Summary</h3>
                
                {/* Check if billing is ONE_TIME or RECURRING */}
                {order.items?.[0]?.billingCycle === 'ONE_TIME' ? (
                  /* ONE TIME BILLING */
                  <>
                    {/* Product name and base price */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{order.items?.[0]?.name || 'Product'}</span>
                      <span>{formatCurrency(order.subtotal, order.currency)}</span>
                    </div>
                    
                    {/* Configs breakdown - showing instance configs with prices for ONE_TIME */}
                    {order.items?.map((item: any) => {
                      const instances = item.configuration?.instances || item.instances || [];
                      return (
                        <div key={item.id}>
                          {instances.map((instance: any) => (
                            <div key={instance.instanceId}>
                              {instance.selectedConfigs?.map((config: any) => (
                                <div key={config.configId} className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {config.configName || config.configId}
                                  </span>
                                  <span>{formatCurrency(config.price || 0, order.currency)}</span>
                                </div>
                              ))}
                              {instance.selectedAddons?.map((addon: any) => (
                                <div key={addon.addon?.id} className="flex justify-between text-sm">
                                  <span className="text-gray-600">+ {addon.addon?.name}</span>
                                  <span>{formatCurrency(addon.addon?.price || 0, order.currency)}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">One-time Setup</span>
                      <span className="font-medium">
                        {formatCurrency(
                          order.items?.reduce((sum: number, item: any) => sum + Number(item.setupFee || 0), 0) || 0,
                          order.currency
                        )}
                      </span>
                    </div>
                    {/* Tax */}
                    {order.taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (GST)</span>
                        <span>{formatCurrency(order.taxAmount, order.currency)}</span>
                      </div>
                    )}
                    {/* Discount */}
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(order.discountAmount, order.currency)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  /* RECURRING BILLING */
                  <>
                    {/* Product name and recurring price (includes configs) */}
                    {order.items?.map((item: any) => {
                      // Use cart-style pricing: recurringAmount for recurring products
                      const displayPrice = item.recurringAmount || item.unitPrice || 0;
                      
                      // Get instances from configuration
                      const instances = item.configuration?.instances || item.instances || [];
                      
                      return (
                        <div key={item.id}>
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-900">{item.name}</span>
                            <span>{formatCurrency(displayPrice, order.currency)}/{getBillingCycleLabel(item.billingCycle)}</span>
                          </div>
                          
                          {/* Configs - show names only, prices included in recurring */}
                          {instances.map((instance: any) => (
                            <div key={instance.instanceId}>
                              {instance.selectedConfigs?.map((config: any) => (
                                <div key={config.configId} className="flex justify-between text-sm">
                                  <span className="text-gray-500">
                                    {config.configName || config.configId}
                                  </span>
                                  <span className="text-gray-400 text-xs">included</span>
                                </div>
                              ))}
                              {/* Addons - these are one-time charges */}
                              {instance.selectedAddons?.map((addon: any) => (
                                <div key={addon.addon?.id} className="flex justify-between text-sm">
                                  <span className="text-gray-500">+ {addon.addon?.name}</span>
                                  <span>{formatCurrency(addon.addon?.price || 0, order.currency)}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                    
                    <Separator className="my-2" />
                    
                    {/* Product Price (Due Today) - includes setup fee for recurring products */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product Price (Due Today)</span>
                      <span className="font-medium">{formatCurrency(order.subtotal, order.currency)}</span>
                    </div>
                    
                    {/* Tax */}
                    {order.taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (GST)</span>
                        <span>{formatCurrency(order.taxAmount, order.currency)}</span>
                      </div>
                    )}
                    
                    {/* Discount */}
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(order.discountAmount, order.currency)}</span>
                      </div>
                    )}
                    
                    {/* Recurring Plan Info */}
                    {order.items?.some((item: any) => item.isRecurring && item.billingCycle !== 'ONE_TIME') && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-2">
                        <p className="text-sm text-gray-600">
                          You will be charged <span className="font-medium">
                            {formatCurrency(
                              order.items?.reduce((sum: number, item: any) => sum + Number(item.recurringAmount || item.unitPrice || 0), 0),
                              order.currency
                            )}
                          </span> every {getRecurringInterval(order.items?.[0]?.billingCycle)} after purchase.
                        </p>
                      </div>
                    )}
                  </>
                )}
                
                <Separator className="my-2" />
                
                {/* Total Due Today */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Due Today</span>
                  <span className="text-2xl font-bold text-[#1E2260]">
                    {formatCurrency(order.total, order.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Section */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Order Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'PROCESSING' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'CONFIRMED' ? 'bg-indigo-100 text-indigo-800' :
                    order.status === 'CANCELLED' ? 'bg-[#E8F0FF] text-[#141740]' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Payment Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'FAILED' ? 'bg-[#E8F0FF] text-[#141740]' :
                    order.paymentStatus === 'REFUNDED' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Invoice Number:</p>
                    <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                  </div>
                  <Button className="w-full" onClick={downloadInvoicePdf}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Invoice PDF
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                    <FileText className="h-5 w-5" />
                    <p className="text-sm font-medium">
                      Invoice will be generated automatically
                    </p>
                  </div>
                  {order?.paymentStatus === 'PENDING' && (
                    <p className="text-sm text-muted-foreground">
                      Your invoice will be generated once payment is confirmed.
                    </p>
                  )}
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  {emailSent && (
                    <p className="text-sm text-success">Invoice sent to your email!</p>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sendEmail"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="sendEmail" className="text-sm text-muted-foreground">
                      Send invoice to {order?.email}
                    </label>
                  </div>
                  <Button
                    className="w-full"
                    onClick={generateInvoice}
                    disabled={generatingInvoice || order?.paymentStatus === 'PENDING'}
                  >
                    {generatingInvoice ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : order?.paymentStatus === 'PENDING' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Waiting for payment...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Invoice
                      </>
                    )}
                  </Button>
                  {order?.paymentStatus === 'PENDING' && (
                    <p className="text-xs text-center text-muted-foreground">
                      Refresh this page after payment to generate invoice
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Order Status:</span>
                <Badge variant="outline" className={
                  order?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  order?.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  order?.status === 'PROCESSING' ? 'bg-purple-100 text-purple-800' :
                  order?.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' :
                  order?.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  order?.status === 'CANCELLED' ? 'bg-[#E8F0FF] text-[#141740]' :
                  'bg-gray-100 text-gray-800'
                }>
                  {order?.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Status:</span>
                <Badge variant="outline" className={
                  order?.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  order?.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                  order?.paymentStatus === 'FAILED' ? 'bg-[#E8F0FF] text-[#141740]' :
                  order?.paymentStatus === 'REFUNDED' ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                }>
                  {order?.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/orders">
                  View All Orders
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/products">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
