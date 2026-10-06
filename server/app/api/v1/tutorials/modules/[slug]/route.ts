import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../../lib";
import { prisma } from "../../../../../../lib/db.cjs";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const module = await prisma.tutorialModule.findUnique({
      where: { slug },
      include: {
        category: true,
        resources: true,
      },
    });

    if (!module) {
      return handleResponse(404, "Tutorial module not found");
    }

    return handleResponse(200, "Module retrieved successfully", module);
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
