import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCheckoutSession, createPaymentIntent } from "@/lib/stripe";
import { createRazorpayOrder } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const checkoutItemSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  bundleId: z.string().optional(),
  quantity: z.number().int().min(1),
  addons: z
    .array(
      z.object({
        addonId: z.string(),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .optional(),
  configs: z
    .array(
      z.object({
        configId: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  paymentMethod: z.enum(["stripe", "razorpay"]),
  email: z.string().email(),
  phone: z.string().optional(),
  shippingAddress: z
    .object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      company: z.string().optional(),
      address1: z.string().min(1),
      address2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1),
      phone: z.string().optional(),
    })
    .optional(),
  discountCode: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    // Calculate order totals
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of data.items) {
      let unitPrice = 0;
      let itemName = "";
      let sku = "";

      if (item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            variants: true,
            addons: true,
            configs: true,
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
          variantId: item.variantId,
          name: itemName,
          sku,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
          configuration: item.configs
            ? Object.fromEntries(
                item.configs.map((c) => [c.configId, c.value])
              )
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
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
        });
      }

      subtotal += unitPrice * item.quantity;
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
            { OR: [{ usageLimit: null }, { usageCount: { lt: prisma.discount.fields.usageLimit } }] },
          ],
        },
      });

      if (discount) {
        if (discount.minPurchase && subtotal < Number(discount.minPurchase)) {
          return NextResponse.json(
            { error: `Minimum purchase of $${discount.minPurchase} required for this discount` },
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

    // Calculate tax (10%)
    const taxRate = 0.1;
    const taxAmount = (subtotal - discountAmount) * taxRate;

    // Shipping (free for now)
    const shippingAmount = 0;

    // Total
    const total = subtotal - discountAmount + taxAmount + shippingAmount;

    // Generate order number
    const orderNumber = generateOrderNumber();

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
        discountId,
        notes: data.notes,
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
          currency: "usd",
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
            currency: "usd",
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
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${order.id}`,
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
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
