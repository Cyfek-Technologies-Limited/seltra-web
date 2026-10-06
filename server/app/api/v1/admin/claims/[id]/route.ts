// app/api/v1/admin/claims/[id]/route.ts
import { NextRequest } from "next/server";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";
import { handleCatch, handleResponse } from "../../../../../../lib";
import { prisma } from "../../../../../../lib/db.cjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params;
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const isAdmin = user.roles.includes("ADMIN");
    if (!isAdmin) {
      return handleResponse(403, "Admin access required");
    }

    const claim = await prisma.publisherEarning.findUnique({
      where: { id: claimId },
      include: {
        publisher: {
          include: {
            user: {
              select: {
                email: true,
                username: true,
                createdAt: true,
              },
            },
            account: true,
            strikes: {
              orderBy: { issuedAt: "desc" },
            },
          },
        },
        campaign: {
          include: {
            user: {
              select: {
                email: true,
                username: true,
              },
            },
            adCreative: true,
          },
        },
      },
    });

    if (!claim) {
      return handleResponse(404, "Claim not found");
    }

    return handleResponse(200, "Claim details retrieved", {
      claim,
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
