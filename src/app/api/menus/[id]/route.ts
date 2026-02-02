import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET - Fetch single menu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const menu = await prisma.menu.findUnique({
      where: { id },
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

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({ data: menu });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

const menuItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
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
    children: z.array(menuItemSchema).optional(),
  })
);

const updateMenuSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  items: z.array(menuItemSchema).optional(),
});

// PUT - Update menu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateMenuSchema.parse(body);

    // Check if menu exists
    const existingMenu = await prisma.menu.findUnique({
      where: { id },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Check for location uniqueness if being updated
    if (data.location && data.location !== existingMenu.location) {
      const locationExists = await prisma.menu.findFirst({
        where: {
          location: data.location,
          id: { not: id },
        },
      });

      if (locationExists) {
        return NextResponse.json(
          { error: "A menu with this location already exists" },
          { status: 400 }
        );
      }
    }

    const { items, ...menuData } = data;

    // Update menu and items in a transaction
    const menu = await prisma.$transaction(async (tx) => {
      // Update menu
      await tx.menu.update({
        where: { id },
        data: menuData,
      });

      // Handle items if provided
      if (items !== undefined) {
        // Delete all existing items
        await tx.menuItem.deleteMany({
          where: { menuId: id },
        });

        // Create new items
        if (items.length > 0) {
          await createMenuItems(tx, id, items, null);
        }
      }

      return tx.menu.findUnique({
        where: { id },
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

    return NextResponse.json({ data: menu });
  } catch (error) {
    console.error("Error updating menu:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update menu" },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if menu exists
    const menu = await prisma.menu.findUnique({
      where: { id },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Delete menu (cascade will delete items)
    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json(
      { error: "Failed to delete menu" },
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
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const { children, id, ...itemData } = item;

    const newItem = await tx.menuItem.create({
      data: {
        ...itemData,
        menuId,
        parentId,
        sortOrder: itemData.sortOrder ?? i,
      },
    });

    if (children && children.length > 0) {
      await createMenuItems(tx, menuId, children, newItem.id);
    }
  }
}
