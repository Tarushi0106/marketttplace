import Stripe from "stripe";
import { runtimeEnv } from "@/runtime-env";

let _stripe: Stripe | null = null;

// Check if Stripe key is available
function getStripeKey(): string {
  // Use runtimeEnv first (for Amplify SSR), fallback to process.env
  const key = runtimeEnv.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Please add your Stripe secret key to environment variables.");
  }
  return key;
}

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(getStripeKey(), {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return _stripe;
}

export function isStripeConfigured(): boolean {
  // Use runtimeEnv first (for Amplify SSR), fallback to process.env
  const key = runtimeEnv.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  return !!key;
}

export async function createCheckoutSession({
  lineItems,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata,
}: {
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "IN"],
    },
    billing_address_collection: "required",
  });

  return session;
}

export async function createPaymentIntent({
  amount,
  currency = "usd",
  customerEmail,
  metadata,
}: {
  amount: number;
  currency?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    receipt_email: customerEmail,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return getStripe().paymentIntents.retrieve(paymentIntentId);
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}
