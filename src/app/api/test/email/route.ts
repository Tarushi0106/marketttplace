import { NextRequest, NextResponse } from "next/server";
import { testSmtpConnection, sendOrderConfirmationEmail } from "@/lib/email";

/**
 * POST /api/test/email - Test email sending
 */
export async function POST(request: NextRequest) {
  try {
    // First test SMTP connection
    const connectionResult = await testSmtpConnection();
    
    if (!connectionResult.success) {
      return NextResponse.json({
        success: false,
        message: "SMTP connection failed",
        error: connectionResult.message,
      });
    }

    // If connection successful, send a test email
    const testEmail = await request.json().catch(() => ({}));

    const testOrder = {
      orderNumber: "TEST-ORDER-001",
      customerName: "Test Customer",
      customerEmail: testEmail.email || "tarushich0106@gmail.com",
      items: [
        {
          name: "Tally On Cloud",
          quantity: 1,
          price: 1999,
          configs: [
            { name: "Operating Systems", value: "os", price: 0 },
            { name: "TSPlus Enterprise Plus Edition", value: "users", price: 200 },
          ],
        },
      ],
      subtotal: 2199,
      setupFee: 300,
      tax: 450,
      total: 2949,
      billingCycle: "MONTHLY",
      recurringAmount: 200,
      recurringPeriod: "1 month",
      companyInfo: {
        name: "DeWiN Solutions",
        email: "tarushich0106@gmail.com",
        phone: "+91 99999 99999",
      },
    };

    const emailSent = await sendOrderConfirmationEmail(testOrder);

    return NextResponse.json({
      success: true,
      message: "Email test completed",
      smtpConnection: connectionResult.message,
      emailSent,
    });
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      { success: false, message: "Email test failed", error: String(error) },
      { status: 500 }
    );
  }
}
