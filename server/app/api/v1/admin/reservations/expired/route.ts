// app/api/v1/admin/reservations/expired/route.ts
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../../lib";
import { prisma } from "../../../../../../lib/db.cjs";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const isAdmin = user.roles.includes("admin");
    if (!isAdmin) {
      return handleResponse(403, "Admin access required");
    }

    const expiredReservations = await prisma.campaignReservation.findMany({
      where: {
        expiresAt: { lt: new Date() },
        status: "PENDING",
      },
      include: {
        user: {
          select: { email: true, username: true },
        },
      },
      orderBy: { expiresAt: "asc" },
    });

    return handleResponse(200, "Expired reservations retrieved", {
      reservations: expiredReservations,
      total: expiredReservations.length,
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const isAdmin = user.roles.includes("admin");
    if (!isAdmin) {
      return handleResponse(403, "Admin access required");
    }

    const body = await request.json();
    const { reservationIds } = body;

    if (!reservationIds || !Array.isArray(reservationIds)) {
      return handleResponse(400, "Reservation IDs array is required");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Delete reservations
      const deletedReservations = await tx.campaignReservation.deleteMany({
        where: {
          id: { in: reservationIds },
          expiresAt: { lt: new Date() },
          status: "PENDING",
        },
      });

      // Record admin action
      await tx.adminAction.create({
        data: {
          adminId: user.userId,
          actionType: "DELETE_EXPIRED_RESERVATIONS",
          targetId: "multiple",
          description: `Deleted ${deletedReservations.count} expired reservations`,
          metadata: {
            reservationIds,
            count: deletedReservations.count,
          },
        },
      });

      return deletedReservations;
    });

    return handleResponse(200, "Expired reservations deleted successfully", {
      deletedCount: result.count,
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
