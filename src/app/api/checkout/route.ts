import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCheckoutSession, createPaymentIntent, isStripeConfigured } from "@/lib/stripe";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";
import { runtimeEnv } from "@/runtime-env";

// Instance-based configuration (from ProductConfigurator)
const cartItemInstanceSchema = z.object({
  instanceId: z.string(),
  instanceNumber: z.number(),
  instanceName: z.string(),
  quantity: z.number().int().min(1).default(1),
  selectedConfigs: z.array(z.object({
    configId: z.string(),
    configName: z.string().optional(),
    value: z.string(),
    quantity: z.number().optional(),
    price: z.number().optional(),
    monthlyPriceModifier: z.number().optional(),
    yearlyPriceModifier: z.number().optional(),
    optionLabel: z.string().optional(),
  })).optional(),
  selectedAddons: z.array(z.object({
    addon: z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
    }),
    quantity: z.number().int().min(1),
  })).optional(),
});

const checkoutItemSchema = z.object({
  productId: z.string().optional().nullable(),
  variantId: z.string().optional().nullable(),
  bundleId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
  // Pricing fields
  baseProductPrice: z.coerce.number().optional().default(0), // One-time product price
  recurringAmount: z.coerce.number().optional().default(0), // Recurring price per cycle
  setupFee: z.coerce.number().optional().default(0), // One-time setup fee
  addons: z
    .array(
      z.object({
        addonId: z.string().optional().nullable(),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .optional(),
  configs: z
    .array(
      z.object({
        configId: z.string().optional().nullable(),
        value: z.string().optional().nullable(),
      })
    )
    .optional(),
  // Instance-based configuration (from ProductConfigurator)
  instances: z.array(cartItemInstanceSchema).optional(),
  unitPrice: z.number().optional(), // Pre-calculated unit price from cart
  // Recurring billing fields
  isRecurring: z.boolean().optional().default(false),
  billingCycle: z.enum(["ONE_TIME", "MONTHLY", "BIMONTHLY", "QUARTERLY", "FOUR_MONTHLY", "SEMI_ANNUAL", "TRI_ANNUAL", "YEARLY", "BIENNIAL", "TRIENNIAL"]).optional(),
  recurringData: z.object({
    enabled: z.boolean(),
    billingCycle: z.enum(["ONE_TIME", "MONTHLY", "BIMONTHLY", "QUARTERLY", "FOUR_MONTHLY", "SEMI_ANNUAL", "TRI_ANNUAL", "YEARLY", "BIENNIAL", "TRIENNIAL"]),
    setupFee: z.coerce.number().optional(),
    baseProductPrice: z.coerce.number().optional(),
    preferredTime: z.string(),
    preferredDay: z.coerce.number().int().min(1).max(28),
    autoRenew: z.boolean(),
  }).optional(),
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  paymentMethod: z.enum(["stripe", "razorpay"]),
  email: z.string().email().or(z.string().min(1)),
  phone: z.string().optional(),
  shippingAddress: z
    .object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      company: z.string().optional(),
      address1: z.string().min(1).optional(),
      address2: z.string().optional(),
      city: z.string().min(1).optional(),
      state: z.string().min(1).optional(),
      postalCode: z.string().min(1).optional(),
      country: z.string().min(1).optional(),
      phone: z.string().optional(),
    })
    .optional(),
  discountCode: z.string().nullable().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    
    // Debug: Log first item details
    if (body.items && body.items.length > 0) {
      const firstItem = body.items[0];
      console.log("=== DEBUG CHECKOUT ===");
      console.log("unitPrice:", firstItem.unitPrice);
      console.log("isRecurring:", firstItem.isRecurring);
      console.log("recurringData:", JSON.stringify(firstItem.recurringData, null, 2));
      console.log("instances:", firstItem.instances ? "present" : "absent");
      console.log("=====================");
    } else {
      console.log("=== DEBUG CHECKOUT ===");
      console.log("No items in cart!");
      console.log("Body:", JSON.stringify(body, null, 2));
      console.log("=====================");
    }
    
    // Validate cart has items before proceeding
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty. Please add items before checking out." },
        { status: 400 }
      );
    }
    
    console.log("Checkout request body:", JSON.stringify(body, null, 2));
    const data = checkoutSchema.parse(body);

    // Calculate order totals
    let subtotal = 0;
    const orderItems: any[] = [];
    
    console.log("Starting order item processing...");
    console.log("Number of items in data.items:", data.items.length);

    for (const item of data.items) {
      console.log("Processing item:", JSON.stringify(item, null, 2));
      
      if (!item.productId && !item.bundleId) {
        console.warn("Skipping item without productId or bundleId:", item);
        continue;
      }

      let unitPrice = 0;
      let itemName = "";
      let sku = "";
      let validatedVariantId: string | undefined = undefined;

      if (item.productId) {
        console.log("Looking up product:", item.productId);
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            variants: true,
            addons: true,
            configs: { include: { options: true } },
          },
        });
        
        console.log("Product found:", product ? product.name : "NOT FOUND");

        if (!product || product.status !== "ACTIVE") {
          return NextResponse.json(
            { error: `Product not found or unavailable: ${item.productId}` },
            { status: 400 }
          );
        }

        // Validate variantId exists in DB before connecting (scalar FK not allowed in nested create)
        // If variant no longer exists, gracefully fall back to product-only (don't block checkout)
        if (item.variantId) {
          const dbVariant = await prisma.productVariant.findUnique({
            where: { id: item.variantId },
            select: { id: true },
          });
          if (dbVariant) {
            validatedVariantId = dbVariant.id;
          }
          // If not found, validatedVariantId stays undefined — order item created without variant
        }

        // If instances are provided (from ProductConfigurator), use the pre-calculated unitPrice
        if (item.unitPrice !== undefined && item.unitPrice > 0) {
          unitPrice = item.unitPrice;
          itemName = product.name;
          sku = product.sku || "";

          console.log("Using pre-calculated unitPrice:", unitPrice);
          // Note: setup fee is already included in unitPrice for recurring products
          // (productPrice from cart = oneTimeTotal which includes setupFee)
        } else {
          console.log("Using fallback calculation - basePrice:", Number(product.basePrice));
          unitPrice = Number(product.basePrice);
          itemName = product.name;
          sku = product.sku || "";
        }

        // Add addon prices
        if (item.addons) {
            for (const addonItem of item.addons) {
              const addon = product.addons.find((a) => a.id === addonItem.addonId);
              if (addon) {
                unitPrice += Number(addon.price) * addonItem.quantity;
              }
            }
          }

        // Add config price modifiers
        if (item.configs) {
          for (const configItem of item.configs) {
            const config = product.configs.find((c) => c.id === configItem.configId);
            if (config) {
              const options = config.options as any[];
              const selectedOption = options.find((o) => o.value === configItem.value);
              if (selectedOption?.priceModifier) {
                unitPrice += selectedOption.priceModifier;
              }
            }
          }
        }

        // Calculate setup fee if recurring billing
        const setupFee = item.isRecurring && item.recurringData?.setupFee 
          ? item.recurringData.setupFee 
          : (item.setupFee || 0);
        
        // Use billingCycle from item or recurringData
        const billingCycle = item.billingCycle || (item.isRecurring && item.recurringData ? item.recurringData.billingCycle : "ONE_TIME");
        
        // Calculate recurring price per cycle (without setup fee)
        // Use recurringAmount from item, or calculate from unitPrice if not provided
        const recurringAmount = item.recurringAmount || (item.isRecurring ? (unitPrice - setupFee) : null);
        
        // Base product price (one-time price component)
        const baseProductPrice = item.baseProductPrice || (item.recurringData?.baseProductPrice || (unitPrice - (item.isRecurring ? setupFee : 0)));
        
        console.log("Creating orderItem:", { 
          productId: product.id, 
          unitPrice, 
          baseProductPrice,
          setupFee, 
          recurringAmount,
          billingCycle 
        });
        
        orderItems.push({
          product: { connect: { id: product.id } },
          ...(validatedVariantId ? { variant: { connect: { id: validatedVariantId } } } : {}),
          name: itemName,
          sku,
          quantity: item.quantity || 1,
          unitPrice,
          totalPrice: unitPrice * (item.quantity || 1),
          // Store configuration as JSON
          configuration: item.instances && item.instances.length > 0
            ? {
                instances: item.instances.map((inst: any) => ({
                  instanceId: inst.instanceId,
                  instanceNumber: inst.instanceNumber,
                  instanceName: inst.instanceName,
                  quantity: inst.quantity,
                  configs: inst.selectedConfigs,
                  addons: inst.selectedAddons?.map((a: any) => ({
                    id: a.addon?.id,
                    name: a.addon?.name,
                    quantity: a.quantity,
                  })),
                })),
              }
            : (item.configs && item.configs.length > 0
                ? Object.fromEntries(
                    item.configs.map((c) => [c.configId || "", c.value || ""])
                  )
                : null),
          // Pricing fields
          baseProductPrice,
          recurringAmount,
          // Recurring billing fields
          billingCycle,
          isRecurring: item.isRecurring || false,
          recurringPrice: recurringAmount,
          setupFee: setupFee > 0 ? setupFee : undefined,
        });
      } else if (item.bundleId) {
        const bundle = await prisma.bundle.findUnique({
          where: { id: item.bundleId },
        });

        if (!bundle || bundle.status !== "ACTIVE") {
          return NextResponse.json(
            { error: `Bundle not found or unavailable: ${item.bundleId}` },
            { status: 400 }
          );
        }

        unitPrice = Number(bundle.price);
        itemName = bundle.name;

        orderItems.push({
          bundle: { connect: { id: bundle.id } },
          name: itemName,
          quantity: item.quantity || 1,
          unitPrice,
          totalPrice: unitPrice * (item.quantity || 1),
        });
      }

      subtotal += unitPrice * (item.quantity || 1);
    }

    // Apply discount
    let discountAmount = 0;
    let discountId = null;

    if (data.discountCode) {
      const discount = await prisma.discount.findFirst({
        where: {
          code: data.discountCode,
          isActive: true,
          OR: [
            { startsAt: null },
            { startsAt: { lte: new Date() } },
          ],
          AND: [
            { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
          ],
        },
      });

      // Check usage limit after fetching
      if (discount && discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
        // Discount has reached its usage limit, don't apply it
        console.log("Discount usage limit reached");
        return NextResponse.json(
          { error: "This discount code has reached its usage limit" },
          { status: 400 }
        );
      }

      if (discount) {
        if (discount.minPurchase && subtotal < Number(discount.minPurchase)) {
          return NextResponse.json(
            { error: `Minimum purchase of ₹${discount.minPurchase} required for this discount` },
            { status: 400 }
          );
        }

        if (discount.type === "PERCENTAGE") {
          discountAmount = subtotal * (Number(discount.value) / 100);
        } else {
          discountAmount = Number(discount.value);
        }

        if (discount.maxDiscount && discountAmount > Number(discount.maxDiscount)) {
          discountAmount = Number(discount.maxDiscount);
        }

        discountId = discount.id;
      }
    }

    // Calculate tax (18%)
    const taxRate = 0.18;
    const taxAmount = (subtotal - discountAmount) * taxRate;

    // Shipping (free for now)
    const shippingAmount = 0;

    // Total
    const total = subtotal - discountAmount + taxAmount + shippingAmount;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create shipping address if provided
    let shippingAddressId: string | undefined;
    if (data.shippingAddress && session?.user?.id) {
      // Verify user exists in database before creating address
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true }
      });
      
      if (userExists) {
        try {
          const address = await prisma.address.create({
            data: {
              userId: session.user.id,
              type: "SHIPPING",
              firstName: data.shippingAddress.firstName || "",
              lastName: data.shippingAddress.lastName || "",
              company: data.shippingAddress.company || null,
              address1: data.shippingAddress.address1 || "",
              address2: data.shippingAddress.address2 || null,
              city: data.shippingAddress.city || "",
              state: data.shippingAddress.state || "",
              postalCode: data.shippingAddress.postalCode || "",
              country: data.shippingAddress.country || "",
              phone: data.shippingAddress.phone || null,
            },
          });
          shippingAddressId = address.id;
        } catch (addressError) {
          console.error("Error creating address:", addressError);
          // Continue without address if creation fails
        }
      }
    }

    // Collect recurring billing info for metadata
    const recurringItems = data.items.filter(item => item.isRecurring && (item.recurringData || item.billingCycle));
    const recurringBillingMetadata = recurringItems.length > 0 ? recurringItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      billingCycle: item.billingCycle || item.recurringData?.billingCycle,
      preferredTime: item.recurringData?.preferredTime,
      preferredDay: item.recurringData?.preferredDay,
      autoRenew: item.recurringData?.autoRenew,
    })) : undefined;

    // Validate user ID if user is logged in
    let validatedUserId: string | undefined = undefined;
    if (session?.user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true }
      });
      if (userExists) {
        validatedUserId = session.user.id;
      } else {
        console.warn("User session has invalid userId, proceeding as guest checkout");
      }
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: validatedUserId,
        email: data.email,
        phone: data.phone,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: data.paymentMethod,
        subtotal,
        discountAmount,
        taxAmount,
        shippingAmount,
        total,
        currency: "INR", // Use Indian Rupees
        discountId,
        notes: data.notes,
        shippingAddressId,
        // Store shipping address and recurring billing info in metadata
        metadata: {
          ...(data.shippingAddress ? {
            shippingAddress: {
              firstName: data.shippingAddress.firstName,
              lastName: data.shippingAddress.lastName,
              company: data.shippingAddress.company,
              address1: data.shippingAddress.address1,
              address2: data.shippingAddress.address2,
              city: data.shippingAddress.city,
              state: data.shippingAddress.state,
              postalCode: data.shippingAddress.postalCode,
              country: data.shippingAddress.country,
              phone: data.shippingAddress.phone,
            },
          } : {}),
          ...(recurringBillingMetadata ? { recurringBilling: recurringBillingMetadata } : {}),
        },
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // Create payment session based on method
    let paymentData: any = {};
    
    console.log("Creating payment session, paymentMethod:", data.paymentMethod);
    console.log("Stripe configured:", isStripeConfigured());
    console.log("Razorpay configured:", isRazorpayConfigured());

    if (data.paymentMethod === "stripe") {
      // Check if Stripe is configured
      if (!isStripeConfigured()) {
        console.error("Stripe is not configured. STRIPE_SECRET_KEY is missing.");
        return NextResponse.json(
          { error: "Stripe is not configured. Please contact support." },
          { status: 500 }
        );
      }
      
      console.log("Creating Stripe checkout session...");
      const lineItems = order.items.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(Number(item.unitPrice) * 100),
        },
        quantity: item.quantity,
      }));

      // Add tax as a line item
      if (taxAmount > 0) {
        lineItems.push({
          price_data: {
            currency: "inr",
            product_data: {
              name: "Tax",
            },
            unit_amount: Math.round(taxAmount * 100),
          },
          quantity: 1,
        });
      }

      const checkoutSession = await createCheckoutSession({
        lineItems,
        customerEmail: data.email,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      });
      
      console.log("Stripe checkout session created successfully:", checkoutSession.id);

      paymentData = {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      };
    } else if (data.paymentMethod === "razorpay") {
      // Check if Razorpay is configured
      if (!isRazorpayConfigured()) {
        console.error("Razorpay is not configured. RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing.");
        return NextResponse.json(
          { error: "Razorpay is not configured. Please contact support." },
          { status: 500 }
        );
      }
      
      console.log("Creating Razorpay order...");
      
      const razorpayOrder = await createRazorpayOrder({
        amount: total,
        currency: "INR",
        receipt: order.orderNumber,
        notes: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      });

      paymentData = {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: runtimeEnv.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      };
    }

    return NextResponse.json({
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
        },
        payment: paymentData,
      },
    });
  } catch (error) {
    console.error("========== CHECKOUT ERROR ==========");
    console.error("Error creating checkout:", error);
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Check for specific error types
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", JSON.stringify(error.issues, null, 2));
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues.map(i => i.message).join(", ") },
        { status: 400 }
      );
    }
    
    // Check for Prisma errors
    if (error instanceof Error && error.message.includes('Prisma')) {
      console.error("Database error detected:", error.message);
      return NextResponse.json(
        { error: "Database error", message: "There was a problem processing your request. Please try again." },
        { status: 500 }
      );
    }
    
    // Check for Stripe/Razorpay configuration errors
    if (error instanceof Error && (error.message.includes('STRIPE') || error.message.includes('Razorpay'))) {
      console.error("Payment gateway configuration error:", error.message);
      return NextResponse.json(
        { error: "Payment gateway not configured", message: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to create checkout", 
        message: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
