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
    const {
      title,
      description,
      categoryId,
      order,
      isFree,
      isPublished,
      duration,
    } = body;

    if (!title || !categoryId) {
      return handleResponse(400, "Title and category are required");
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Check if slug exists
    const existingModule = await prisma.tutorialModule.findUnique({
      where: { slug },
    });

    if (existingModule) {
      return handleResponse(409, "Module with this title already exists");
    }

    const module = await prisma.tutorialModule.create({
      data: {
        title,
        description,
        slug,
        categoryId,
        order: order || 0,
        isFree: isFree !== undefined ? isFree : true,
        isPublished: isPublished !== undefined ? isPublished : false,
        duration: duration || 0,
      },
      include: {
        category: true,
        lessons: true,
        resources: true,
      },
    });

    return handleResponse(201, "Module created successfully", module);
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
