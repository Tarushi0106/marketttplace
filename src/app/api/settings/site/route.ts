import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch site settings (public)
export async function GET() {
  try {
    // Try to get existing company info
    let companyInfo = await prisma.companyInfo.findFirst();

    // If no company info exists, create default
    if (!companyInfo) {
      companyInfo = await prisma.companyInfo.create({
        data: {
          name: "Shaurrya Teleservices",
          legalName: "Shaurrya Teleservices Pvt. Ltd.",
          email: "support@shaurrya.com",
          phone: "+91 (999) 123-4567",
          address: "Mumbai, India",
          currency: "INR",
          currencySymbol: "₹",
        },
      });
    }

    // Get additional settings from the settings table
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "site_title",
            "site_tagline",
            "meta_description",
            "site_logo",
            "logo_dark",
            "logo_light",
            "site_favicon",
            "header_logo",
            "footer_logo",
          ],
        },
      },
    });

    // Convert settings array to object - handle Json type properly
    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => {
      // The value is stored as JSON, extract the actual value
      settingsMap[s.key] = typeof s.value === 'string' ? s.value : (s.value as any);
    });

    return NextResponse.json({
      data: {
        ...companyInfo,
        siteTitle: settingsMap.site_title || companyInfo.name,
        siteTagline: settingsMap.site_tagline || "Enterprise Solutions",
        metaDescription: settingsMap.meta_description || "",
        siteLogo: settingsMap.site_logo || null,
        logoDark: settingsMap.logo_dark || null,
        logoLight: settingsMap.logo_light || null,
        siteFavicon: settingsMap.site_favicon || null,
        headerLogo: settingsMap.header_logo || null,
        footerLogo: settingsMap.footer_logo || null,
      },
    });
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch site settings" },
      { status: 500 }
    );
  }
}

// PUT - Update site settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check origin for requests from admin panel
    const origin = request.headers.get("origin") || request.headers.get("referer");
    if (!origin?.includes("localhost:3000") && !origin?.includes("127.0.0.1:3000")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      legalName,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      currency,
      currencySymbol,
      siteTitle,
      siteTagline,
      metaDescription,
      siteLogo,
      logoDark,
      logoLight,
      siteFavicon,
      headerLogo,
      footerLogo,
      socialLinks,
    } = body;

    // Update or create company info
    let companyInfo = await prisma.companyInfo.findFirst();

    if (companyInfo) {
      companyInfo = await prisma.companyInfo.update({
        where: { id: companyInfo.id },
        data: {
          ...(name && { name }),
          ...(legalName !== undefined && { legalName }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(country !== undefined && { country }),
          ...(postalCode !== undefined && { postalCode }),
          ...(currency && { currency }),
          ...(currencySymbol && { currencySymbol }),
          ...(socialLinks !== undefined && { socialLinks }),
        },
      });
    } else {
      companyInfo = await prisma.companyInfo.create({
        data: {
          name: name || "Shaurrya Teleservices",
          legalName,
          email,
          phone,
          address,
          city,
          state,
          country,
          postalCode,
          currency: currency || "INR",
          currencySymbol: currencySymbol || "₹",
          socialLinks,
        },
      });
    }

    // Update settings in the settings table
    const settingsToUpdate = [
      { key: "site_title", value: siteTitle },
      { key: "site_tagline", value: siteTagline },
      { key: "meta_description", value: metaDescription },
      { key: "site_logo", value: siteLogo },
      { key: "logo_dark", value: logoDark },
      { key: "logo_light", value: logoLight },
      { key: "site_favicon", value: siteFavicon },
      { key: "header_logo", value: headerLogo },
      { key: "footer_logo", value: footerLogo },
    ];

    for (const setting of settingsToUpdate) {
      // Only update if the value was explicitly provided (even if null or empty string)
      if (setting.value !== undefined) {
        // Store the value - Prisma Json field accepts string, null, object, etc.
        const valueToStore = setting.value === null ? null : setting.value;
        await prisma.setting.upsert({
          where: { key: setting.key },
          update: { value: valueToStore as any, group: "site" },
          create: { key: setting.key, value: valueToStore as any, group: "site" },
        });
      }
    }

    return NextResponse.json({
      data: companyInfo,
      message: "Site settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating site settings:", error);
    return NextResponse.json(
      { error: "Failed to update site settings" },
      { status: 500 }
    );
  }
}
