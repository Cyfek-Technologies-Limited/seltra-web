import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db.cjs";
import { getCurrentUser } from "../../../../../lib/user";

const IN_FLIGHT_WITHDRAWAL_STATUSES = ["PROCESSING", "SENT"];

function clearAuthCookies(response: NextResponse) {
  for (const name of ["auth-token", "refresh-token"]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function DELETE(request: NextRequest) {
  const session = await getCurrentUser(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, publisher: { select: { id: true } } },
    });

    if (!user) {
      return clearAuthCookies(
        NextResponse.json({ error: "Account not found" }, { status: 404 })
      );
    }

    const publisherId: string | undefined = user.publisher?.id;

    // A payout already handed to Paystack can't be recalled, so deleting the
    // records mid-transfer would leave money moving with no trace of it.
    if (publisherId) {
      const inFlight = await prisma.withdrawal.count({
        where: { publisherId, status: { in: IN_FLIGHT_WITHDRAWAL_STATUSES } },
      });
      if (inFlight > 0) {
        return NextResponse.json(
          {
            error:
              "You have a withdrawal being processed. Please wait for it to complete before deleting your account.",
          },
          { status: 409 }
        );
      }
    }

    await prisma.$transaction(async (tx: any) => {
      if (publisherId) {
        await tx.referralUse.deleteMany({
          where: { referral: { publisherId } },
        });
        await tx.publisherStrike.deleteMany({ where: { publisherId } });
        await tx.withdrawal.deleteMany({ where: { publisherId } });
      }

      const campaigns = await tx.campaign.findMany({
        where: { userId },
        select: { id: true, adCreativeId: true },
      });
      const campaignIds = campaigns.map((c: { id: string }) => c.id);
      const creativeIds = campaigns
        .map((c: { adCreativeId: string | null }) => c.adCreativeId)
        .filter((id: string | null): id is string => Boolean(id));

      await tx.transaction.deleteMany({
        where: {
          OR: [{ userId }, { campaignId: { in: campaignIds } }],
        },
      });
      await tx.campaign.deleteMany({ where: { userId } });
      if (creativeIds.length > 0) {
        await tx.adCreative.deleteMany({
          where: { id: { in: creativeIds }, campaigns: { none: {} } },
        });
      }

      await tx.campaignReservation.deleteMany({ where: { userId } });
      await tx.adminAction.deleteMany({ where: { adminId: userId } });
      await tx.admin.deleteMany({ where: { userId } });

      const ownBlogIds = (
        await tx.blog.findMany({ where: { authorId: userId }, select: { id: true } })
      ).map((b: { id: string }) => b.id);
      const doomedComments = {
        OR: [{ authorId: userId }, { blogId: { in: ownBlogIds } }],
      };
      // Other people's replies to these comments would otherwise block the delete.
      await tx.blogComment.updateMany({
        where: { parent: doomedComments },
        data: { parentId: null },
      });
      await tx.blogComment.deleteMany({ where: doomedComments });
      await tx.blog.deleteMany({ where: { authorId: userId } });

      await tx.pendingRegistration.deleteMany({ where: { email: user.email } });

      // Remaining relations (publisher, account, earnings, referrals,
      // notifications, reset tokens, advertiser profile) cascade from here.
      await tx.user.delete({ where: { id: userId } });
    });

    return clearAuthCookies(
      NextResponse.json({ status: "200", msg: "Account deleted" }, { status: 200 })
    );
  } catch (error) {
    console.error("[DELETE-ACCOUNT] Failed to delete account:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }
}
