// app/api/v1/admin/claims/[id]/approve/route.ts - FIXED
import { NextRequest } from "next/server";
import { getCurrentUserWithRoles } from "../../../../../../../lib/user";
import { handleCatch, handleResponse } from "../../../../../../../lib";
import { prisma } from "../../../../../../../lib/db.cjs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params first
    const { id: claimId } = await params;

    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const isAdmin = user.roles.includes("ADMIN");
    if (!isAdmin) {
      return handleResponse(403, "Admin access required");
    }

    const body = await request.json();
    const { notes } = body;

    // Get the claim with publisher bank details and campaign
    const claim = await prisma.publisherEarning.findUnique({
      where: { id: claimId },
      include: {
        publisher: {
          include: {
            account: true,
            user: { select: { email: true } },
          },
        },
        campaign: {
          select: {
            title: true,
            id: true,
            views: true,
            targetViews: true,
            amountPaid: true,
          },
        },
      },
    });

    if (!claim) {
      return handleResponse(404, "Claim not found");
    }

    if (claim.status !== "PENDING") {
      return handleResponse(400, "Claim is not pending approval");
    }

    // Calculate payment: Fixed 5 Naira per view
    const publisherAmount = claim.views * 5; // 5 Naira per view

    console.log(
      `💰 Payment calculation: ${claim.views} views × ₦5 = ₦${publisherAmount}`
    );

    // Check if publisher has bank details
    // if (
    //   !claim.publisher.account?.bankName ||
    //   !claim.publisher.account?.accountNumber ||
    //   !claim.publisher.account?.accountName
    // ) {
    //   return handleResponse(209, "Publisher has no bank account details");
    // }

    // STEP 1: Update database records in a quick transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Update claim status and set the final approved amount
        const updatedClaim = await tx.publisherEarning.update({
          where: { id: claimId },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
            amount: publisherAmount, // Set the calculated amount (5 Naira per view)
          },
        });

        // 3. Update publisher balances with the calculated amount (5 Naira per view)
        await tx.publisherAccount.update({
          where: { publisherId: claim.publisherId },
          data: {
            availableBalance: { increment: publisherAmount },
            totalEarnings: { increment: publisherAmount },
            pendingBalance: { decrement: claim.amount }, // Remove the original pending amount
          },
        });

        return updatedClaim;
      },
      {
        timeout: 10000, // Increase transaction timeout to 10 seconds
      }
    );

    // STEP 2: Record admin action outside the transaction (non-critical operation)
    try {
      await prisma.adminAction.create({
        data: {
          adminId: user.userId,
          actionType: "APPROVE_CLAIM",
          targetId: claimId,
          description: `Approved claim for ${claim.views} views on campaign: ${claim.campaign.title}. Paid ₦${publisherAmount} (₦5 per view)`,
          metadata: {
            campaignAmount: claim.campaign.amountPaid,
            publisherAmount: publisherAmount,
            ratePerView: 5,
            views: claim.views,
            publisherEmail: claim.publisher.user.email,
            campaignId: claim.campaign.id,
            notes,
          },
        },
      });
    } catch (adminActionError) {
      console.error("❌ Failed to record admin action:", adminActionError);
      // Don't fail the whole request if admin action recording fails
    }

    // STEP 3: Process payment asynchronously (outside transaction)
    // let paymentInitiated = false;
    // let paymentReference = null;

    // try {
    //   const bankCode = await getBankCode(claim.publisher.account.bankName);

    //   if (bankCode) {
    //     // Create transfer recipient
    //     const recipient = await paystackService.createTransferRecipient(
    //       claim.publisher.account.accountNumber,
    //       bankCode,
    //       claim.publisher.account.accountName
    //     );

    //     // Initiate transfer with the calculated amount (5 Naira per view)
    //     const transfer = await paystackService.initiateTransfer(
    //       recipient.data.recipient_code,
    //       publisherAmount,
    //       `Payment for ${claim.views} views on campaign: ${claim.campaign.title} (₦5 per view)`
    //     );

    //     // Update claim with payment reference
    //     await prisma.publisherEarning.update({
    //       where: { id: claimId },
    //       data: {
    //         status: "PAID",
    //         paidAt: new Date(),
    //         paymentReference: transfer.data.reference,
    //       },
    //     });

    //     paymentInitiated = true;
    //     paymentReference = transfer.data.reference;

    //     console.log(
    //       `✅ Automatic payment initiated for claim ${claimId}:`,
    //       `₦${publisherAmount} for ${claim.views} views`
    //     );
    //   }
    // } catch (paymentError: any) {
    //   console.error("❌ Automatic payment failed:", paymentError.message);
    //   // Don't fail the whole request if payment fails
    // }

    return handleResponse(200, "Claim approved and publisher balance updated", {
      claim: result,
      viewsAdded: claim.views,
      amountPaid: publisherAmount,
      ratePerView: 5,
      campaignAmount: claim.campaign.amountPaid,
      // paymentInitiated,
      // paymentReference,
    });
  } catch (error: unknown) {
    console.error("❌ Error in approve claim route:", error);
    return handleCatch(error);
  }
}

// Helper function to get bank code from bank name
async function getBankCode(bankName: string): Promise<string | null> {
  const bankMappings: { [key: string]: string } = {
    "Access Bank": "044",
    GTBank: "058",
    "First Bank": "011",
    "Zenith Bank": "057",
    UBA: "033",
    "Fidelity Bank": "070",
    "Stanbic IBTC": "039",
    "Union Bank": "032",
    "Polaris Bank": "076",
    "Wema Bank": "035",
    Ecobank: "050",
    "Heritage Bank": "030",
    "Keystone Bank": "082",
    "Sterling Bank": "232",
    "Unity Bank": "215",
    "Jaiz Bank": "301",
  };

  return bankMappings[bankName] || null;
}
