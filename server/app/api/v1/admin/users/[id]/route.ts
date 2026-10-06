// app/api/v1/admin/users/[id]/route.ts - NEW
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../../lib";
import { prisma } from "../../../../../../lib/db.cjs";
import {
  getCurrentUserWithRoles,
  handleRoleAccess,
} from "../../../../../../lib/user";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const isAdmin = user.roles.includes("ADMIN");
    if (!isAdmin) {
      return handleResponse(403, "Admin access required");
    }

    const data = await request.json();
    const { username, totalEarnings, availableBalance } = data;

    // Update user details if provided
    if (username !== undefined) {
      await prisma.user.update({
        where: { id: params.id },
        data: { username },
      });
    }

    // Update publisher account if financial data provided
    const publisher = await prisma.publisher.findUnique({
      where: { userId: params.id },
    });

    if (
      publisher &&
      (totalEarnings !== undefined || availableBalance !== undefined)
    ) {
      await prisma.publisherAccount.update({
        where: { publisherId: publisher.id },
        data: {
          ...(totalEarnings !== undefined ? { totalEarnings } : {}),
          ...(availableBalance !== undefined ? { availableBalance } : {}),
        },
      });
    } else if (
      !publisher &&
      (totalEarnings !== undefined || availableBalance !== undefined)
    ) {
      return handleResponse(400, "User is not a publisher");
    }

    return handleResponse(200, "User updated successfully");
  } catch (error: unknown) {
    console.error("Admin user update error:", error);
    return handleCatch(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await handleRoleAccess(request, "ADMIN");
    if (!isAdmin) return handleResponse(401, "user not allowed", request);

    const { id } = await params;
    if (!id) return handleResponse(401, "invalid id", request);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return handleResponse(401, "user not found", request);
    }

    await prisma.user.delete({ where: { id } });

    return handleResponse(200, "user sucessfully deleted", user);
  } catch (error) {
    console.log(error);
    return handleResponse(500, "internal server error", error);
  }
}
