import { NextRequest } from "next/server";
import { getCurrentUserWithRoles } from "../../../../../lib/user";
import { handleCatch, handleResponse } from "../../../../../lib";
import { prisma } from "../../../../../lib/db.cjs";
import { PaystackService } from "../../../../../lib/paystack";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const isPublisher = user.roles.includes("PUBLISHER");
    if (!isPublisher) {
      return handleResponse(403, "Only publishers can update profile");
    }

    const body = await request.json();
    const { bankName, accountNumber, age, gender, location, occupation } = body;

    // Get publisher
    const publisher = await prisma.publisher.findUnique({
      where: { userId: user.userId },
      include: { account: true },
    });

    if (!publisher) {
      return handleResponse(404, "Publisher not found");
    }

    let updatedData: any = {};
    let bankCode: string | undefined;

    // If bank details are being updated, verify with Paystack
    if (bankName && accountNumber) {
      try {
        console.log("🔍 [BANK VERIFICATION] Starting bank verification...");

        const banks = await PaystackService.getBanks();
        const bank = banks.find(
          (b) =>
            b.name.toLowerCase().includes(bankName.toLowerCase()) ||
            bankName.toLowerCase().includes(b.name.toLowerCase())
        );

        if (!bank) {
          return handleResponse(
            400,
            `Bank "${bankName}" not found in supported banks. Please check the bank name and try again.`
          );
        }

        console.log(
          `🔍 [BANK VERIFICATION] Found bank: ${bank.name} (${bank.code})`
        );

        // Verify account number with Paystack
        const accountVerification = await PaystackService.verifyAccountNumber(
          accountNumber,
          bank.code
        );

        if (!accountVerification.status) {
          return handleResponse(
            400,
            "Invalid account number. Please check your account number."
          );
        }

        // Use verified account name from Paystack
        const verifiedAccountName = accountVerification.data.account_name;
        bankCode = bank.code;

        console.log(
          `✅ [BANK VERIFICATION] Account verified: ${verifiedAccountName}`
        );

        updatedData.account = {
          upsert: {
            create: {
              bankName: bank.name, // Use the official bank name from Paystack
              bankCode,
              accountNumber,
              accountName: verifiedAccountName,
              isVerified: true,
            },
            update: {
              bankName: bank.name,
              bankCode,
              accountNumber,
              accountName: verifiedAccountName,
              isVerified: true,
            },
          },
        };
      } catch (error: any) {
        console.error(
          "❌ [BANK VERIFICATION] Paystack verification error:",
          error
        );

        // User-friendly error messages for live mode
        if (error.message.includes("Test mode daily limit")) {
          return handleResponse(
            400,
            "Bank verification service is being upgraded. Please try again in a few minutes."
          );
        }

        return handleResponse(
          400,
          `Bank verification failed: ${error.message}. Please check your bank details and try again.`
        );
      }
    }

    // Update demographic fields
    if (
      age !== undefined ||
      gender !== undefined ||
      location !== undefined ||
      occupation !== undefined
    ) {
      updatedData.age = age !== undefined ? parseInt(age) : undefined;
      updatedData.gender = gender;
      updatedData.location = location;
      updatedData.occupation = occupation;

      // Check if all required demographic fields are filled
      // const hasAllDemographics = age && gender && location && occupation;
      updatedData.profileComplete = true;
    }

    // Update publisher profile
    const updatedPublisher = await prisma.publisher.update({
      where: { userId: user.userId },
      data: updatedData,
      include: {
        account: true,
        user: {
          select: {
            email: true,
            username: true,
            createdAt: true,
          },
        },
      },
    });

    return handleResponse(200, "Profile updated successfully", {
      profile: {
        verified: updatedPublisher.verified,
        memberSince: updatedPublisher.user.createdAt,
        age: updatedPublisher.age,
        gender: updatedPublisher.gender,
        location: updatedPublisher.location,
        occupation: updatedPublisher.occupation,
        profileComplete: updatedPublisher.profileComplete,
      },
      account: updatedPublisher.account,
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
