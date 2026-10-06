import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../../lib";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";
import { ReferralService } from "../../../../../../lib/referral-service";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRoles(request);
    if (!user) return handleResponse(401, "Authentication required");

    const isPublisher = user.roles.includes("PUBLISHER");
    if (!isPublisher) {
      return handleResponse(403, "Only publishers can generate referral codes");
    }

    // Generate referral code
    const referralCode = await ReferralService.generateReferralCode(
      user.userId
    );

    console.log("referralCode:", referralCode);
    return handleResponse(200, "Referral code generated successfully", {
      code: referralCode,
      message:
        "Your referral code has been created! Share it to earn ₦700 per referral.",
    });
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
