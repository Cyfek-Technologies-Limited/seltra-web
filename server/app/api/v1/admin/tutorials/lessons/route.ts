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
    const { title, content, moduleId, order, duration, videoUrl } = body;

    if (!title || !moduleId) {
      return handleResponse(400, "Title and module are required");
    }

    const lesson = await prisma.tutorialLesson.create({
      data: {
        title,
        content,
        moduleId,
        order: order || 0,
        duration: duration || 0,
        videoUrl,
      },
      include: {
        module: {
          include: {
            category: true,
          },
        },
        resources: true,
      },
    });

    return handleResponse(201, "Lesson created successfully", lesson);
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
