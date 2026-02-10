import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCheckoutSession, createPaymentIntent } from "@/lib/stripe";
import { createRazorpayOrder } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const checkoutItemSchema = z.object({
  productId: z.string().optional().nullable(),
  variantId: z.string().optional().nullable(),
  bundleId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
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
  // Recurring billing fields
  isRecurring: z.boolean().optional().default(false),
  recurringData: z.object({
    enabled: z.boolean(),
    billingCycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
    preferredTime: z.string(),
    preferredDay: z.number().int().min(1).max(28),
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
    console.log("Checkout request body:", JSON.stringify(body, null, 2));
    const data = checkoutSchema.parse(body);

    // Calculate order totals
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of data.items) {
      if (!item.productId && !item.bundleId) {
        console.warn("Skipping item without productId or bundleId:", item);
        continue;
      }

      let unitPrice = 0;
      let itemName = "";
      let sku = "";

      if (item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            variants: true,
            addons: true,
            configs: { include: { options: true } },
          },
        });

        if (!product || product.status !== "ACTIVE") {
          return NextResponse.json(
            { error: `Product not found or unavailable: ${item.productId}` },
            { status: 400 }
          );
        }

        if (item.variantId) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) {
            return NextResponse.json(
              { error: `Variant not found: ${item.variantId}` },
              { status: 400 }
            );
          }
          unitPrice = Number(variant.price);
          itemName = `${product.name} - ${variant.name}`;
          sku = variant.sku || product.sku || "";
        } else {
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

        orderItems.push({
          productId: product.id,
          variantId: item.variantId || null,
          name: itemName,
          sku,
          quantity: item.quantity || 1,
          unitPrice,
          totalPrice: unitPrice * (item.quantity || 1),
          configuration: item.configs && item.configs.length > 0
            ? Object.fromEntries(
                item.configs.map((c) => [c.configId || "", c.value || ""])
              )
            : null,
          // Recurring billing fields
          billingCycle: item.isRecurring && item.recurringData 
            ? item.recurringData.billingCycle 
            : "ONE_TIME",
          isRecurring: item.isRecurring || false,
          recurringPrice: item.isRecurring && item.recurringData 
            ? unitPrice 
            : null,
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
          bundleId: bundle.id,
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
    if (data.shippingAddress) {
      // Only create address record if user is logged in
      if (session?.user?.id) {
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
      }
    }

    // Collect recurring billing info for metadata
    const recurringItems = data.items.filter(item => item.isRecurring && item.recurringData);
    const recurringBillingMetadata = recurringItems.length > 0 ? recurringItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      billingCycle: item.recurringData?.billingCycle,
      preferredTime: item.recurringData?.preferredTime,
      preferredDay: item.recurringData?.preferredDay,
      autoRenew: item.recurringData?.autoRenew,
    })) : undefined;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id,
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

    if (data.paymentMethod === "stripe") {
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

      paymentData = {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      };
    } else if (data.paymentMethod === "razorpay") {
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
        keyId: process.env.RAZORPAY_KEY_ID,
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
    console.error("Error creating checkout:", error);
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", JSON.stringify(error.issues, null, 2));
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues.map(i => i.message).join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create checkout", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
