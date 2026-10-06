import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../../lib";
import { prisma } from "../../../../../../lib/db.cjs";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);

    if (!user || !user.roles.includes("admin")) {
      return handleResponse(403, "Admin access required");
    }

    const body = await request.json();
    const { name, description, order } = body;

    if (!name) {
      return handleResponse(400, "Category name is required");
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Check if slug exists
    const existingCategory = await prisma.tutorialCategory.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return handleResponse(409, "Category with this name already exists");
    }

    const category = await prisma.tutorialCategory.create({
      data: {
        name,
        description,
        slug,
        order: order || 0,
      },
    });

    return handleResponse(201, "Category created successfully", category);
  } catch (error: unknown) {
    return handleCatch(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);

    if (!user || !user.roles.includes("admin")) {
      return handleResponse(403, "Admin access required");
    }

    const categories = await prisma.tutorialCategory.findMany({
      include: {
        modules: {
          include: {
            lessons: true,
            resources: true,
            _count: {
              select: {
                lessons: true,
                resources: true,
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return handleResponse(200, "Categories retrieved", categories);
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
