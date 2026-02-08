import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import { readFile } from "fs/promises";

/**
 * GET /api/invoices/[id]/pdf - Download invoice PDF
 * Returns the PDF file as a downloadable response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const invoice = await (prisma as any).invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (!invoice.pdfUrl) {
      return NextResponse.json(
        { error: "PDF not available for this invoice" },
        { status: 404 }
      );
    }

    // Get the full file path
    const pdfPath = path.join(process.cwd(), "public", invoice.pdfUrl);

    try {
      const pdfBuffer = await readFile(pdfPath);

      // Return the PDF as a downloadable file
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
          "Content-Length": pdfBuffer.length.toString(),
        },
      });
    } catch (fileError) {
      console.error("Error reading PDF file:", fileError);
      return NextResponse.json(
        { error: "PDF file not found on disk" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error downloading invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to download invoice PDF" },
      { status: 500 }
    );
  }
}
