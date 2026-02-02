import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all testimonials (for storefront)
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: testimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST - Create a new testimonial (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientName,
      designation,
      company,
      quote,
      title,
      image,
      rating,
      isActive,
      sortOrder,
    } = body;

    if (!clientName || !designation || !quote) {
      return NextResponse.json(
        { error: "Client name, designation, and quote are required" },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        clientName,
        designation,
        company,
        quote,
        title,
        image,
        rating: rating || 5,
        isActive: isActive ?? true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ data: testimonial }, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
