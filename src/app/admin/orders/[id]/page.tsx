"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Package,
  Truck,
  CreditCard,
  User,
  RefreshCw,
  FileText,
  Download,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  variant?: {
    id: string;
    name: string;
    sku: string;
  } | null;
  bundle?: {
    id: string;
    name: string;
  } | null;
  configuration?: Record<string, any> | null;
  billingCycle: string;
  isRecurring: boolean;
  recurringPrice?: number;
  addons?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface ShippingAddress {
  id: string;
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
}

interface BillingAddress {
  id: string;
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
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  pdfUrl: string;
  status: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  email: string;
  phone?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  discount?: {
    id: string;
    code: string;
    type: string;
    value: number;
  } | null;
  invoice?: Invoice | null;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const paymentColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
  PARTIALLY_REFUNDED: "bg-orange-100 text-orange-800",
};

// Configuration label mappings for better readability
const configLabels: Record<string, string> = {
  cpu: "CPU",
  ram: "RAM",
  storage: "Storage",
  tier: "Tier",
  os: "Operating System",
  bandwidth: "Bandwidth",
  gpu: "GPU",
  data_center: "Data Center",
  users: "Number of Users",
  license: "License Type",
  backup: "Backup Option",
  security: "Security Level",
  support: "Support Level",
};

function formatConfigLabel(key: string): string {
  // First check if we have a predefined label
  if (configLabels[key.toLowerCase()]) {
    return configLabels[key.toLowerCase()];
  }
  
  // Convert camelCase or snake_case to Title Case
  const formatted = key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase());
  
  return formatted.trim();
}

function formatConfigValue(key: string, value: string): string {
  // Special formatting for specific config types
  const lowerKey = key.toLowerCase();
  
  // CPU values
  if (lowerKey === "cpu" || lowerKey === "vcpu") {
    if (value.match(/^\d+$/)) {
      return `${value} vCPU`;
    }
    return value;
  }
  
  // RAM values (GB/TB)
  if (lowerKey === "ram" || lowerKey === "memory") {
    if (value.match(/^\d+$/)) {
      return `${value} GB`;
    }
    return value;
  }
  
  // Storage values (GB/TB)
  if (lowerKey === "storage" || lowerKey === "disk") {
    if (value.match(/^\d+$/)) {
      return `${value} GB`;
    }
    return value;
  }
  
  // Tier values - capitalize first letter
  if (lowerKey === "tier") {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  
  return value;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("");

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  async function fetchOrder() {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      const data = await response.json();

      if (data.data) {
        setOrder(data.data);
        setSelectedStatus(data.data.status);
        setSelectedPaymentStatus(data.data.paymentStatus);
        
        // Fetch invoice
        try {
          const invoiceResponse = await fetch(`/api/invoices?orderId=${params.id}`);
          if (invoiceResponse.ok) {
            const invoiceData = await invoiceResponse.json();
            if (invoiceData.invoice) {
              setInvoice(invoiceData.invoice);
            }
          }
        } catch (invError) {
          console.error("Error fetching invoice:", invError);
        }
      } else {
        toast({
          title: "Error",
          description: "Order not found",
          variant: "destructive",
        });
        router.push("/admin/orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function generateInvoice() {
    if (!order?.id) return;
    
    setGeneratingInvoice(true);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, sendEmail: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setInvoice(data.invoice);
        toast({
          title: "Success",
          description: "Invoice generated successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to generate invoice",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive",
      });
    } finally {
      setGeneratingInvoice(false);
    }
  }

  async function updateOrderStatus() {
    if (!order?.id) return;
    
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: selectedStatus,
          paymentStatus: selectedPaymentStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.data);
        toast({
          title: "Success",
          description: "Order status updated successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update order status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-muted-foreground mt-1">
              Placed on {formatDate(new Date(order.createdAt))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusColors[order.status]}>
            {order.status}
          </Badge>
          <Badge variant="outline" className={paymentColors[order.paymentStatus]}>
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Order Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        {item.product && (
                          <p className="text-sm text-muted-foreground">
                            Product: {item.product.name}
                          </p>
                        )}
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">
                            Variant: {item.variant.name} (SKU: {item.variant.sku})
                          </p>
                        )}
                        {item.bundle && (
                          <p className="text-sm text-muted-foreground">
                            Bundle: {item.bundle.name}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(Number(item.totalPrice))}
                        </p>
                        {item.isRecurring && item.recurringPrice && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            {formatCurrency(Number(item.recurringPrice))}/{item.billingCycle.toLowerCase()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Configuration */}
                    {item.configuration && Object.keys(item.configuration).length > 0 && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-2">Configuration:</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(item.configuration).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-muted-foreground">{formatConfigLabel(key)}:</span>{" "}
                              <span className="font-medium">{formatConfigValue(key, String(value))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Addons */}
                    {item.addons && item.addons.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Addons:</p>
                        <div className="space-y-1">
                          {item.addons.map((addon) => (
                            <div key={addon.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {addon.name} x{addon.quantity}
                              </span>
                              <span>{formatCurrency(Number(addon.price) * addon.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(Number(order.subtotal))}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount {order.discount && `(${order.discount.code})`}</span>
                    <span>-{formatCurrency(Number(order.discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(Number(order.taxAmount))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(Number(order.shippingAmount))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(Number(order.total))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.user ? (
                <>
                  <div>
                    <p className="text-sm font-medium">{order.user.name}</p>
                    <p className="text-sm text-muted-foreground">{order.user.email}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Guest Customer</p>
              )}
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{order.email}</p>
              </div>
              {order.phone && (
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{order.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  {order.shippingAddress.company && (
                    <p>{order.shippingAddress.company}</p>
                  )}
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && (
                    <p>{order.shippingAddress.address2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No shipping address</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Method</p>
                <p className="text-sm text-muted-foreground">
                  {order.paymentMethod || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant="outline" className={paymentColors[order.paymentStatus]}>
                  {order.paymentStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Currency</p>
                <p className="text-sm text-muted-foreground">{order.currency}</p>
              </div>
            </CardContent>
          </Card>

          {/* Invoice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoice ? (
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Invoice Number</p>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" asChild>
                      <a href={invoice.pdfUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">No invoice generated yet</p>
                  <Button 
                    onClick={generateInvoice} 
                    disabled={generatingInvoice}
                    className="w-full"
                  >
                    {generatingInvoice ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Generate Invoice
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Update Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="relative z-50">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                  <SelectTrigger className="relative z-50">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                    <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={updateOrderStatus} 
                disabled={updatingStatus || (selectedStatus === order.status && selectedPaymentStatus === order.paymentStatus)}
                className="w-full"
              >
                {updatingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Status
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
