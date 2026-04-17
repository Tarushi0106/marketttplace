"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  CreditCard,
  Lock,
  Shield,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getSubtotal, getTax, getSetupFeeTotal, discountCode, clearSidebar } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const subtotal = getSubtotal();
  const tax = getTax();
  const setupFeeTotal = getSetupFeeTotal();

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  // Auto-fill user details if logged in
  useEffect(() => {
    if (session?.user) {
      const user = session.user as { email?: string | null; name?: string | null };
      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        phone: prev.phone,
        firstName: user.name?.split(" ")[0] || prev.firstName,
        lastName: user.name?.split(" ").slice(1).join(" ") || prev.lastName,
      }));
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleShippingAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items
            .filter((item) => item.product?.id || item.bundle?.id)
            .map((item) => ({
              productId: item.product?.id || undefined,
              variantId: item.variant?.id || undefined,
              bundleId: item.bundle?.id || undefined,
              quantity: item.quantity,
              // For recurring products: unitPrice is the total due today (setup fee + first recurring + addons)
              // For one-time products: unitPrice is the full product price
              unitPrice: item.isRecurring 
                ? (() => {
                    const setupFee = Number(item.recurringData?.setupFee) || 0;
                    const recurringAmount = Number(item.recurringAmount) || 0;
                    const addonsTotal = item.instances?.reduce((instSum: number, inst: any) => {
                      return instSum + (inst.selectedAddons?.reduce((addonSum: number, addon: any) => 
                        addonSum + Number(addon.addon?.price || 0) * addon.quantity, 0) || 0);
                    }, 0) || 0;
                    return setupFee + recurringAmount + addonsTotal;
                  })()
                : (item.productPrice || item.unitPrice || 0),
              baseProductPrice: item.baseProductPrice || 0,
              recurringAmount: item.recurringAmount || 0,
              billingCycle: item.billingCycle,
              isRecurring: item.isRecurring || false,
              setupFee: item.recurringData?.setupFee || 0,
              recurringData: item.recurringData ? {
                enabled: item.recurringData.enabled,
                billingCycle: item.recurringData.billingCycle,
                setupFee: item.recurringData.setupFee,
                pricePerCycle: item.recurringData.pricePerCycle,
                baseProductPrice: item.recurringData.baseProductPrice,
                preferredTime: item.recurringData.preferredTime || "",
                preferredDay: item.recurringData.preferredDay || 1,
                autoRenew: item.recurringData.autoRenew ?? true,
              } : undefined,
              instances: item.instances || undefined,
              addons: (item.selectedAddons || [])
                .filter((a) => a.addon?.id)
                .map((a) => ({
                  addonId: a.addon.id,
                  quantity: a.quantity,
                })),
              name: item.product?.name || item.bundle?.name || undefined,
              configs: (item.selectedConfigs || []).map((c) => ({
                configId: c.configId,
                value: c.value,
              })),
              quantityLocked: (item as any).quantityLocked || false,
            })),
          paymentMethod,
          email: formData.email,
          phone: formData.phone,
          shippingAddress: sameAsShipping
            ? {
                phone: formData.phone,
                firstName: formData.firstName,
                lastName: formData.lastName,
                company: formData.company,
                address1: formData.address1,
                address2: formData.address2,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country,
              }
            : {
                phone: shippingAddress.phone,
                firstName: shippingAddress.firstName,
                lastName: shippingAddress.lastName,
                company: shippingAddress.company,
                address1: shippingAddress.address1,
                address2: shippingAddress.address2,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postalCode: shippingAddress.postalCode,
                country: shippingAddress.country,
              },
          discountCode,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid server response. Please try again.");
      }

      console.log("Checkout response status:", response.status);
      console.log("Checkout response data:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error("Checkout API error:", data);
        console.error("Response status:", response.status);
        
        // Provide more user-friendly error messages
        let errorMessage = data.error || data.details || data.message || "Checkout failed";
        
        if (response.status === 500) {
          if (errorMessage.includes("Stripe") || errorMessage.includes("Razorpay") || errorMessage.includes("payment")) {
            errorMessage = "Payment system is not available. Please try again later or contact support.";
          } else if (errorMessage.includes("Database") || errorMessage.includes("database")) {
            errorMessage = "Server error. Please try again.";
          } else if (errorMessage.includes("empty")) {
            errorMessage = "Your cart is empty. Please add items before checking out.";
          }
        }
        
        throw new Error(errorMessage);
      }

      // Check if payment data exists
      if (!data.data?.payment) {
        console.error("No payment data in response:", data);
        throw new Error("Payment initialization failed. Please try again.");
      }

      if (paymentMethod === "stripe" && data.data.payment.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.payment.url;
      } else if (paymentMethod === "razorpay") {
        // Check if Razorpay has required fields
        if (!data.data.payment.keyId || !data.data.payment.orderId) {
          throw new Error("Razorpay is not properly configured. Please contact support.");
        }
        
        // Initialize Razorpay
        const options = {
          key: data.data.payment.keyId,
          amount: data.data.payment.amount,
          currency: data.data.payment.currency,
          order_id: data.data.payment.orderId,
          handler: async function (response: any) {
            // Verify payment
            await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.data.order.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            clearSidebar();
            router.push(`/checkout/success?order=${data.data.order.id}`);
          },
          prefill: {
            email: formData.email,
            contact: formData.phone,
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "An error occurred during checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} className="mb-6" />

        <div className="flex flex-col items-center justify-center py-16">
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some products before checking out.
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} className="mb-6" />

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address1">Address *</Label>
                  <Input
                    id="address1"
                    name="address1"
                    placeholder="Street address"
                    value={formData.address1}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input
                    id="address2"
                    name="address2"
                    placeholder="Apartment, suite, etc."
                    value={formData.address2}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">ZIP Code *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, country: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAsShipping"
                    checked={sameAsShipping}
                    onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                  />
                  <label
                    htmlFor="sameAsShipping"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Same as billing address
                  </label>
                </div>

                {!sameAsShipping && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingFirstName">First Name *</Label>
                        <Input
                          id="shippingFirstName"
                          name="firstName"
                          value={shippingAddress.firstName}
                          onChange={handleShippingAddressChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingLastName">Last Name *</Label>
                        <Input
                          id="shippingLastName"
                          name="lastName"
                          value={shippingAddress.lastName}
                          onChange={handleShippingAddressChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingCompany">Company (Optional)</Label>
                      <Input
                        id="shippingCompany"
                        name="company"
                        value={shippingAddress.company}
                        onChange={handleShippingAddressChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress1">Address *</Label>
                      <Input
                        id="shippingAddress1"
                        name="address1"
                        placeholder="Street address"
                        value={shippingAddress.address1}
                        onChange={handleShippingAddressChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress2">Address Line 2</Label>
                      <Input
                        id="shippingAddress2"
                        name="address2"
                        placeholder="Apartment, suite, etc."
                        value={shippingAddress.address2}
                        onChange={handleShippingAddressChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="shippingCity">City *</Label>
                        <Input
                          id="shippingCity"
                          name="city"
                          value={shippingAddress.city}
                          onChange={handleShippingAddressChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingState">State *</Label>
                        <Input
                          id="shippingState"
                          name="state"
                          value={shippingAddress.state}
                          onChange={handleShippingAddressChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingPostalCode">ZIP Code *</Label>
                        <Input
                          id="shippingPostalCode"
                          name="postalCode"
                          value={shippingAddress.postalCode}
                          onChange={handleShippingAddressChange}
                          required
                        />
                      </div>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="shippingCountry">Country *</Label>
                        <Select
                          value={shippingAddress.country}
                          onValueChange={(value) =>
                            setShippingAddress((prev) => ({ ...prev, country: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="stripe">Credit Card</TabsTrigger>
                    <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
                  </TabsList>
                  <TabsContent value="stripe" className="pt-4">
                    <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pay with Credit Card</p>
                        <p className="text-sm text-muted-foreground">
                          You'll be redirected to Stripe to complete payment
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="razorpay" className="pt-4">
                    <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pay with Razorpay</p>
                        <p className="text-sm text-muted-foreground">
                          Credit card, debit card, UPI, and more
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - Right Side */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items - matching configure page format */}
                <div className="space-y-3">
                  {items.map((item: any) => (
                    <div key={item.id}>
                      {/* Product/Bundle name */}
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-900">{item.product?.name || item.bundle?.name || "Product"}</span>
                        <span>{formatPrice(item.isRecurring && item.billingCycle !== 'ONE_TIME' ? (item.quantityLocked ? (item.recurringAmount || 0) : (item.recurringAmount || 0) * (item.quantity || 1)) : (item.baseProductPrice || 0))}</span>
                      </div>

                      {/* Quantity row */}
                      <div className="flex items-center gap-2 mt-1 ml-1">
                        <span className="text-xs text-gray-400">Qty:</span>
                        <span className="text-xs font-medium text-gray-700">{item.quantity ?? 1}</span>
                        {item.quantityLocked && item.cameraCount && (
                          <span className="text-xs text-gray-400">
                            — {Math.ceil(item.cameraCount / 8)} device{Math.ceil(item.cameraCount / 8) > 1 ? 's' : ''} for {item.cameraCount} camera{item.cameraCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* For configurable products with instances */}
                      {/* For recurring products, configs are included in recurringAmount - show "included" */}
                      {/* For ONE_TIME products, show config prices separately */}
                      {item.instances && item.instances.length > 0 && (
                        <div className="ml-2">
                          {item.instances.map((instance: any) => (
                            <div key={instance.instanceId} className="mb-2">
                              {/* Config options */}
                              {instance.selectedConfigs?.map((config: any) => (
                                <div key={config.configId} className="flex justify-between text-sm">
                                  <span className="text-gray-500">
                                    {config.configName}: {config.optionLabel || config.value}
                                  </span>
                                  {item.isRecurring && item.billingCycle !== 'ONE_TIME' ? (
                                    <span className="text-gray-400 text-xs">included</span>
                                  ) : (
                                    <span>{formatPrice(config.price || 0)}</span>
                                  )}
                                </div>
                              ))}
                              
                              {/* Addons - these are one-time charges */}
                              {instance.selectedAddons?.filter((addon: any) => addon.addon?.name).map((addon: any) => (
                                <div key={addon.addon?.id} className="flex justify-between text-sm ml-4">
                                  <span className="text-gray-500">+ {addon.addon?.name}</span>
                                  <span>{formatPrice((addon.addon?.price || 0) * addon.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Legacy flat configs - only show prices for ONE_TIME products */}
                      {item.selectedConfigs && item.selectedConfigs.length > 0 && !item.instances && (
                        <div className="ml-2">
                          {item.selectedConfigs.map((config: any) => (
                            <div key={config.configId} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {config.configName || config.configId}: {config.optionLabel || config.value}
                              </span>
                              {item.isRecurring && item.billingCycle !== 'ONE_TIME' ? (
                                <span className="text-gray-400 text-xs">included</span>
                              ) : (
                                <span>{formatPrice(config.price || 0)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Legacy flat addons */}
                      {item.selectedAddons && item.selectedAddons.length > 0 && !item.instances && (
                        <div className="ml-2">
                          {item.selectedAddons.filter((addon: any) => addon.addon?.name).map((addon: any) => (
                            <div key={addon.addon?.id} className="flex justify-between text-sm">
                              <span className="text-gray-600">+ {addon.addon?.name}</span>
                              <span>{formatPrice((addon.addon?.price || 0) * addon.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Setup Fee for recurring products - shown in summary section instead */}
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Product Price (Due Today) - includes setup fee for recurring products */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Price (Due Today)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                {/* Tax (18% GST) */}
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                )}

                {/* Recurring info - only show for recurring billing cycles */}
                {items.some((item: any) => item.recurringAmount > 0 && item.billingCycle !== 'ONE_TIME') && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <p className="text-sm text-gray-600">
                      You will be charged <span className="font-medium">
                        {formatPrice(
                          items.reduce((sum: number, item: any) => {
                            const amount = item.recurringAmount || 0;
                            if (item.quantityLocked) return sum + amount;
                            return sum + amount * (Number(item.quantity) || 1);
                          }, 0)
                        )}
                      </span> every {
                        items[0]?.billingCycle === 'MONTHLY' ? '1 month' :
                        items[0]?.billingCycle === 'BIMONTHLY' ? '2 months' :
                        items[0]?.billingCycle === 'QUARTERLY' ? '3 months' :
                        items[0]?.billingCycle === 'FOUR_MONTHLY' ? '4 months' :
                        items[0]?.billingCycle === 'SEMI_ANNUAL' ? '6 months' :
                        items[0]?.billingCycle === 'YEARLY' ? '1 year' :
                        items[0]?.billingCycle || ''
                      } after purchase.
                    </p>
                  </div>
                )}

                <Separator />

                {/* Total Due Today */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Due Today</span>
                  <span className="text-2xl font-bold text-[#8B1D1D]">
                    {formatPrice(Number(subtotal) + Number(tax) + Number(setupFeeTotal))}
                  </span>
                </div>

                {/* Security badges */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Secure checkout</span>
                  <Shield className="h-3 w-3 ml-2" />
                  <span>SSL encrypted</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Order
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
