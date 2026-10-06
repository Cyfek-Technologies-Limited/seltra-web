// app/api/v1/admin/earnings/reject/route.ts
import { NextRequest } from "next/server";
import { getCurrentUserWithRoles } from "../../../../../../../lib/user";
import { handleCatch, handleResponse } from "../../../../../../../lib";
import { prisma } from "../../../../../../../lib/db.cjs";
import {
  sendClaimRejectedEmail,
  sendEmail,
  sendNewCampaignNotification,
} from "../../../../../../../lib/email-service";
import { email } from "zod";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    // Check if user is admin
    const isAdmin = user.roles.includes("ADMIN");
    if (!isAdmin) {
      return handleResponse(403, "Only admins can reject claims");
    }

    const body = await request.json();
    const { claimId, rejectionReason } = body;
    console.log("body", claimId, rejectionReason);

    if (!claimId) {
      return handleResponse(
        400,
        "Earning ID and rejection reason are required"
      );
    }

    // Get the earning record with campaign details
    const earning = await prisma.publisherEarning.findUnique({
      where: { id: claimId },
      include: {
        campaign: { select: { title: true } },
        publisher: {
          include: {
            account: true,
            user: {
              select: {
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!earning) {
      return handleResponse(404, "Earning record not found");
    }

    // Check if already rejected
    if (earning.status === "REJECTED") {
      return handleResponse(400, "Claim has already been rejected");
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the earning status to REJECTED
      const updatedEarning = await tx.publisherEarning.update({
        where: { id: claimId },
        data: {
          status: "REJECTED",
          rejectionReason,
          // reviewedAt: new Date(),
          // reviewedBy: user.userId,
        },
      });

      // 2. Remove the views from campaign total (only if they were previously added)
      if (earning.status === "PENDING" || earning.status === "APPROVED") {
        await tx.campaign.update({
          where: { id: earning.campaignId },
          data: {
            views: {
              decrement: earning.views,
            },
          },
        });
      }

      // 3. Remove the amount from publisher's pending balance (if it was added)
      if (earning.status === "PENDING") {
        await tx.publisherAccount.update({
          where: { publisherId: earning.publisherId },
          data: {
            pendingBalance: {
              decrement: earning.amount,
            },
          },
        });
      }

      // 4. If campaign was marked as COMPLETED due to this claim, revert to ACTIVE
      const campaign = await tx.campaign.findUnique({
        where: { id: earning.campaignId },
        include: {
          earnings: {
            where: {
              status: {
                in: ["PENDING", "APPROVED"],
              },
            },
          },
        },
      });

      if (campaign && campaign.status === "COMPLETED") {
        // Recalculate total approved/pending views
        const totalActiveViews = campaign.earnings.reduce(
          (sum, e) => sum + e.views,
          0
        );

        // If total active views is less than target, revert to ACTIVE
        if (totalActiveViews < campaign.targetViews) {
          await tx.campaign.update({
            where: { id: earning.campaignId },
            data: {
              status: "ACTIVE",
              completedAt: null,
            },
          });
        }
      }

      return updatedEarning;
    });

    console.log(`✅ Claim ${claimId} rejected successfully`);

    console.log({
      claimId: claimId,
      earning: result,
      message: `Claim rejected. ${earning.views} views removed from campaign total.`,
    });

    const emailSent = await sendClaimRejectedEmail(
      earning.publisher.user.email,
      earning.publisher.user.username,
      earning.campaign.title,
      rejectionReason || ""
    );
    console.log("email sent", emailSent);

    return handleResponse(200, "Claim rejected successfully", {
      earning: result,
      message: `Claim rejected. ${earning.views} views removed from campaign total.`,
    });
  } catch (error: unknown) {
    console.error("❌ Error rejecting claim:", error);
    return handleCatch(error);
  }
}

// Optional: GET endpoint to get rejection reasons or stats
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const isAdmin = user.roles.includes("admin");
    if (!isAdmin) {
      return handleResponse(403, "Only admins can access this data");
    }

    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get("claimId");

    if (claimId) {
      const earning = await prisma.publisherEarning.findUnique({
        where: { id: claimId },
        include: {
          campaign: true,
          publisher: {
            include: {
              user: {
                select: {
                  email: true,
                  username: true,
                },
              },
            },
          },
        },
      });

      if (!earning) {
        return handleResponse(404, "Earning record not found");
      }

      return handleResponse(200, "Earning details retrieved", earning);
    }

    // Get all rejected claims for admin review
    const rejectedClaims = await prisma.publisherEarning.findMany({
      where: {
        status: "REJECTED",
      },
      include: {
        campaign: {
          select: {
            title: true,
            platform: true,
          },
        },
        publisher: {
          include: {
            user: {
              select: {
                email: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        reviewedAt: "desc",
      },
      take: 50,
    });

    return handleResponse(200, "Rejected claims retrieved", rejectedClaims);
  } catch (error: unknown) {
    console.error("❌ Error fetching rejected claims:", error);
    return handleCatch(error);
  }
}
