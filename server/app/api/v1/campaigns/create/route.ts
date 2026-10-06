// app/api/v1/campaigns/create/route.ts - FIXED VERSION
import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../lib";
import { getCurrentUserWithRoles } from "../../../../../lib/user";
import { prisma } from "../../../../../lib/db.cjs";
import { sendNewCampaignNotification } from "../../../../../lib/email-service";
import { sendCampaignWhatsAppToPublishers } from "../../../../../lib/whatsapp-service";
// import re from 're';  // Import regex if needed, but use built-in

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [CREATE CAMPAIGN] Creating campaign after payment...");

    const user = await getCurrentUserWithRoles(request);
    if (!user) {
      return handleResponse(401, "Authentication required");
    }

    const body = await request.json();
    const { reservationId, paymentReference } = body;

    console.log("🔍 [CREATE CAMPAIGN] Parameters:", {
      reservationId,
      paymentReference,
    });

    if (!reservationId || !paymentReference) {
      return handleResponse(
        400,
        "Reservation ID and payment reference are required"
      );
    }

    // Get reservation
    const reservation = await prisma.campaignReservation.findUnique({
      where: { reservationId },
    });

    if (!reservation) {
      console.log("❌ [CREATE CAMPAIGN] Reservation not found:", reservationId);

      // Check if campaign was already created (idempotency)
      const existingCampaign = await prisma.campaign.findFirst({
        where: {
          OR: [{ reservationId }, { paymentReference }],
        },
      });

      if (existingCampaign) {
        console.log(
          "✅ [CREATE CAMPAIGN] Campaign already exists:",
          existingCampaign.id
        );
        return handleResponse(200, "Campaign already created", {
          campaign: existingCampaign,
          alreadyExists: true,
        });
      }

      return handleResponse(404, "Campaign reservation not found");
    }

    // Verify user owns this reservation
    if (reservation.userId !== user.userId) {
      return handleResponse(403, "Access denied");
    }

    // Verify reservation is in correct state
    if (reservation.status !== "PAYMENT_INITIATED") {
      return handleResponse(
        400,
        "Reservation is not in a valid state for campaign creation"
      );
    }

    // Extract adCreative data from reservation
    const reservationAdCreative = reservation.adCreative as any;

    console.log("🔍 [CREATE CAMPAIGN] AdCreative data from reservation:", {
      text: reservationAdCreative.text?.substring(0, 100) + "...", // Log first 100 chars only
      fileUrl: reservationAdCreative.fileUrl,
    });

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. First create the AdCreative record
        const adCreative = await tx.adCreative.create({
          data: {
            fileUrl: reservationAdCreative.fileUrl,
            text: reservationAdCreative.text, // This should be the actual ad text, not code
            approved: true,
          },
        });

        console.log("✅ [CREATE CAMPAIGN] AdCreative created:", adCreative.id);

        // 2. Create the Campaign with reference to AdCreative
        const campaignData = {
          title: reservation.title,
          category: reservation.category,
          description: reservation.description, // This should be the actual campaign description
          targetViews: reservation.targetViews,
          platform: reservation.platform,
          amountPaid: reservation.amountPaid,
          status: "ACTIVE", // Use enum value, not string
          userId: user.userId,
          reservationId: reservation.reservationId,
          paymentReference: paymentReference,
          adCreativeId: adCreative.id,
        };

        console.log("🔍 [CREATE CAMPAIGN] Creating campaign with data:", {
          title: campaignData.title,
          category: campaignData.category,
          description: campaignData.description?.substring(0, 100) + "...",
          targetViews: campaignData.targetViews,
          platform: campaignData.platform,
          status: campaignData.status,
        });

        const campaign = await tx.campaign.create({
          data: campaignData,
        });

        console.log("✅ [CREATE CAMPAIGN] Campaign created:", campaign.id);

        // 3. DELETE THE RESERVATION AFTER SUCCESSFUL CREATION
        await tx.campaignReservation.delete({
          where: { reservationId },
        });

        console.log(
          "✅ [CREATE CAMPAIGN] Reservation deleted after campaign creation"
        );

        // Return campaign with adCreative included
        return {
          ...campaign,
          adCreative: adCreative,
        };
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    console.log(
      "✅ [CREATE CAMPAIGN] Campaign created successfully:",
      result.id
    );

    const publishers = await prisma.publisher.findMany({
      include: { user: true },
    });
    const publisherEmails = publishers
      .map((p) => p.user.email)
      .filter(Boolean) as string[];

    // const emailSent = await sendNewCampaignNotification(
    //   publisherEmails,
    //   result.title,
    //   result.id,
    //   result.category,
    //   result.platform,
    //   result.targetViews
    // );
    // console.log("email sent", emailSent);

    // Validate and normalize phone numbers
    const publishersToNotify = publishers
      .map((p) => {
        let phone = p.user.phone?.trim();
        if (!phone || phone === "No Phone Number") {
          return null;
        }
        // Normalize: Add + if missing and starts with country code
        // if (!phone.startsWith("+") && phone.startsWith("234")) {
        //   phone = "+" + phone;
        // } else if (!phone.startsWith("+")) {
        //   // Assume Nigeria if starts with 0
        //   if (phone.startsWith("0")) {
        //     phone = "+234" + phone.slice(1);
        //   } else if (
        //     phone.startsWith("7") ||
        //     phone.startsWith("8") ||
        //     phone.startsWith("9")
        //   ) {
        //     phone = "+234" + phone;
        //   } else {
        //     return null; // Invalid
        //   }
        // }
        // // Validate E.164: + followed by 10-15 digits
        // if (!/^\+[1-9]\d{9,14}$/.test(phone)) {
        //   console.log(`Invalid phone skipped: ${phone}`);
        //   return null;
        // }
        return {
          phone,
          name: p.user.username || p.user.email?.split("@")[0] || "Publisher",
        };
      })
      .filter(Boolean) as { phone: string; name: string }[];

    console.log("phone numbers to notify", publishersToNotify.length);

    // Fire & forget with error handling
    sendCampaignWhatsAppToPublishers(publishersToNotify).catch((err) => {
      console.error("Background WhatsApp sending failed:", err);
    });

    return handleResponse(201, "Campaign created successfully", {
      campaign: result,
    });
  } catch (error: unknown) {
    console.error("🔴 [CREATE CAMPAIGN] Error:", error);

    if (error instanceof Error && error.message.includes("timeout")) {
      return handleResponse(
        500,
        "Transaction timeout. Please check if campaign was created."
      );
    }

    return handleCatch(error);
  }
}
