"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Download, Loader2, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  email: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  pdfUrl: string;
  status: string;
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const sessionId = searchParams.get("session_id");

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

    fetchOrderAndInvoice();
  }, [orderId, router]);

  const fetchOrderAndInvoice = async () => {
    try {
      // Always try to verify Stripe session if available
      if (sessionId) {
        console.log("Verifying Stripe session:", sessionId);
        const verifyResponse = await fetch("/api/checkout/verify-stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, orderId }),
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log("Stripe verification result:", verifyData);
        }
      }

      // Fetch order details
      console.log("Fetching order:", orderId);
      const orderResponse = await fetch(`/api/orders/${orderId}`);
      
      if (!orderResponse.ok) {
        console.error("Order not found:", orderResponse.status);
        setLoading(false);
        return;
      }
      
      const orderData = await orderResponse.json();
      console.log("Order data:", orderData);
      const orderResult = orderData.data || orderData;
      setOrder(orderResult as Order);

      // Try to get or generate invoice using the actual order ID
      console.log("Checking for invoice:", orderResult.id);
      
      // First try to fetch existing invoice
      try {
        const invoiceResponse = await fetch(`/api/invoices?orderId=${orderResult.id}`);
        if (invoiceResponse.ok) {
          const invoiceData = await invoiceResponse.json();
          console.log("Invoice response:", invoiceData);
          
          if (invoiceData.invoice) {
            // Invoice exists, show it
            setInvoice(invoiceData.invoice);
            setLoading(false);
            return;
          }
        }
      } catch (invError) {
        console.error("Error checking invoice:", invError);
      }

      // No invoice found, generate one
      console.log("Generating new invoice...");
      await generateInvoice();
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order/invoice:", error);
      setLoading(false);
    }
  };

  const generateInvoice = async () => {
    if (!order?.id) {
      setError("Order not loaded");
      return;
    }
    
    setGeneratingInvoice(true);
    setError(null);
    try {
      console.log("Generating invoice for order:", order.id, "sendEmail:", sendEmail);
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, sendEmail }),
      });

      console.log("Invoice response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Invoice generated:", data);
        setInvoice(data.invoice);
        if (data.emailSent) {
          setEmailSent(true);
        }
      } else if (response.status === 409) {
        // Invoice already exists
        const data = await response.json();
        console.log("Invoice already exists:", data.invoice);
        setInvoice(data.invoice);
      } else {
        const errorData = await response.json();
        console.error("Failed to generate invoice:", errorData);
        setError(errorData.error || errorData.details || "Failed to generate invoice. Please try again later.");
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      setError("An error occurred while generating invoice");
    } finally {
      setGeneratingInvoice(false);
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
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                      )}
                    </div>
                    <span className="font-medium ml-4">
                      {formatCurrency(item.totalPrice, order.currency)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Paid</span>
                <span>{formatCurrency(order.total, order.currency)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Section */}
        <div className="space-y-6">
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
                  <Button className="w-full" asChild>
                    <a href={invoice.pdfUrl} download target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download Invoice PDF
                    </a>
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
