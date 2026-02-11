import { NextRequest, NextResponse } from "next/server";
import { testSmtpConnection } from "@/lib/email";

/**
 * POST /api/admin/settings/smtp-test - Test SMTP connection
 */
export async function POST(request: NextRequest) {
  try {
    const result = await testSmtpConnection();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error testing SMTP connection:", error);
    return NextResponse.json(
      { success: false, message: "Failed to test SMTP connection" },
      { status: 500 }
    );
  }
}
