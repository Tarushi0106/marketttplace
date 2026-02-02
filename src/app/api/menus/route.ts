import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET - Fetch all menus or a specific menu by location
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const includeItems = searchParams.get("includeItems") !== "false";

    if (location) {
      // Fetch specific menu by location
      const menu = await prisma.menu.findUnique({
        where: { location },
        include: includeItems
          ? {
              items: {
                where: { isActive: true, parentId: null },
                orderBy: { sortOrder: "asc" },
                include: {
                  children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: "asc" },
                  },
                },
              },
            }
          : undefined,
      });

      if (!menu) {
        return NextResponse.json({ data: null });
      }

      return NextResponse.json({ data: menu });
    }

    // Fetch all menus
    const menus = await prisma.menu.findMany({
      orderBy: { name: "asc" },
      include: includeItems
        ? {
            items: {
              orderBy: { sortOrder: "asc" },
              include: {
                children: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
            _count: {
              select: { items: true },
            },
          }
        : {
            _count: {
              select: { items: true },
            },
          },
    });

    return NextResponse.json({ data: menus });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}

const menuItemSchema = z.object({
  id: z.string().optional(),
  parentId: z.string().nullable().optional(),
  label: z.string().min(1),
  href: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  badge: z.string().optional().nullable(),
  badgeColor: z.string().optional().nullable(),
  target: z.string().optional().default("_self"),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
  children: z.array(z.lazy(() => menuItemSchema)).optional(),
});

const createMenuSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  items: z.array(menuItemSchema).optional().default([]),
});

// POST - Create a new menu
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createMenuSchema.parse(body);

    // Check if location is unique
    const existingMenu = await prisma.menu.findUnique({
      where: { location: data.location },
    });

    if (existingMenu) {
      return NextResponse.json(
        { error: "A menu with this location already exists" },
        { status: 400 }
      );
    }

    const { items, ...menuData } = data;

    // Create menu with items in a transaction
    const menu = await prisma.$transaction(async (tx) => {
      const newMenu = await tx.menu.create({
        data: menuData,
      });

      // Create menu items recursively
      if (items && items.length > 0) {
        await createMenuItems(tx, newMenu.id, items, null);
      }

      return tx.menu.findUnique({
        where: { id: newMenu.id },
        include: {
          items: {
            where: { parentId: null },
            orderBy: { sortOrder: "asc" },
            include: {
              children: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({ data: menu }, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create menu" },
      { status: 500 }
    );
  }
}

// Helper function to create menu items recursively
async function createMenuItems(
  tx: any,
  menuId: string,
  items: any[],
  parentId: string | null
) {
  for (const item of items) {
    const { children, id, ...itemData } = item;

    const newItem = await tx.menuItem.create({
      data: {
        ...itemData,
        menuId,
        parentId,
      },
    });

    if (children && children.length > 0) {
      await createMenuItems(tx, menuId, children, newItem.id);
    }
  }
}
