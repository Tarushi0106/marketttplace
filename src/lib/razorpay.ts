import Razorpay from "razorpay";
import crypto from "crypto";

let _razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return _razorpay;
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
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
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
