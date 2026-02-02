import Stripe from "stripe";

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is missing");
    }

    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }

  return stripe;
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
  const stripe = getStripe();

  return stripe.checkout.sessions.create({
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
  const stripe = getStripe();

  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    receipt_email: customerEmail,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return getStripe().paymentIntents.retrieve(paymentIntentId);
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET missing");
  }

  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

export const formatAmountForStripe = (amount: number) =>
  Math.round(amount * 100);

export const formatAmountFromStripe = (amount: number) =>
  amount / 100;
