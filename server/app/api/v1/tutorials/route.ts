import { NextRequest } from "next/server";
import { handleCatch, handleResponse } from "../../../../lib";
import { prisma } from "../../../../lib/db.cjs";

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.tutorialCategory.findMany({
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { resources: true },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return handleResponse(200, "Tutorial categories retrieved", categories);
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
