import { NextRequest } from "next/server";
import { prisma } from "../../../../../lib/db.cjs";
import { getFullUser } from "../../../../../lib/user";
import {
  handleResponse,
  hashPassword,
  verifyPassword,
} from "../../../../../lib";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getFullUser(request);
    if (!user) {
      return handleResponse(409, "user not authenticated");
    }

    console.log(user.passwordHash);

    const { currentPassword, newPassword } = await request.json();
    console.log("payload", { currentPassword, newPassword });

    const correctCurrentPassword = await verifyPassword(
      user.passwordHash,
      currentPassword
    );

    if (!correctCurrentPassword) {
      return handleResponse(409, "current password is incorrect");
    }
    const newPasswordHash = await hashPassword(newPassword);

    const resetData = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return handleResponse(200, "Password has been reset", resetData);
  } catch (error) {
    console.log("error", error);
  }
}
