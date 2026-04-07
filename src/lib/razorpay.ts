import Razorpay from "razorpay";
import crypto from "crypto";
import { runtimeEnv } from "@/runtime-env";

let _razorpay: Razorpay | null = null;

function getRazorpayKeys(): { keyId: string; keySecret: string } {
  // Use runtimeEnv first (for Amplify SSR), fallback to process.env
  const keyId = runtimeEnv.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = runtimeEnv.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.");
  }
  return { keyId, keySecret };
}

function getRazorpay(): Razorpay {
  if (!_razorpay) {
    const { keyId, keySecret } = getRazorpayKeys();
    _razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return _razorpay;
}

export function isRazorpayConfigured(): boolean {
  // Use runtimeEnv first (for Amplify SSR), fallback to process.env
  const keyId = runtimeEnv.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = runtimeEnv.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
  return !!(keyId && keySecret);
}

export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
  notes,
}: {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const order = await getRazorpay().orders.create({
    amount: Math.round(amount * 100), // Convert to paise
    currency,
    receipt,
    notes,
  });

  return order;
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayKeys();
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

export async function fetchRazorpayPayment(paymentId: string) {
  return getRazorpay().payments.fetch(paymentId);
}

export async function refundRazorpayPayment({
  paymentId,
  amount,
}: {
  paymentId: string;
  amount?: number;
}) {
  const refund = await getRazorpay().payments.refund(paymentId, {
    amount: amount ? Math.round(amount * 100) : undefined,
  });

  return refund;
}

export function formatAmountForRazorpay(amount: number): number {
  return Math.round(amount * 100);
}

export function formatAmountFromRazorpay(amount: number): number {
  return amount / 100;
}
