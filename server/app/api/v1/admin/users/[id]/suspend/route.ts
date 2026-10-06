import { NextRequest } from "next/server";
import { handleResponse } from "../../../../../../../lib";
import { prisma } from "../../../../../../../lib/db.cjs";
import { handleRoleAccess } from "../../../../../../../lib/user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await handleRoleAccess(request, "ADMIN");
    if (!isAdmin) return handleResponse(409, "user not allowed", request);

    const { id } = await params;
    if (!id) return handleResponse(400, "invalid id", request);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return handleResponse(401, "user not found", request);

    const suspendedUser = await prisma.user.update({
      where: { id },
      data: { suspended: true },
    });

    return handleResponse(200, "user has been suspended", suspendedUser);
  } catch (error) {
    console.log(error);
    return handleResponse(500, "internal server error", error);
  }
}
