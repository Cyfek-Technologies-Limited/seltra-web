// app/api/cron/promotional/route.ts
import { NextRequest } from "next/server";
import {
  getAdvertiserEmails,
  sendPromotionalToAdvertisers,
} from "../../../../lib/email-service";

export async function GET(request: NextRequest) {
  // This will be triggered automatically by Vercel cron
  try {
    console.log("⏰ Cron job triggered: Promotional emails");

    const emails = await getAdvertiserEmails();

    if (emails.length === 0) {
      return Response.json({
        success: false,
        message: "No advertisers found",
      });
    }

    // Send in smaller batches to avoid rate limits
    const batchSize = 50;
    let successfulBatches = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const result = await sendPromotionalToAdvertisers(batch);

      if (result) successfulBatches++;

      // Small delay between batches
      if (i + batchSize < emails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return Response.json({
      success: true,
      message: `Promotional emails processed for ${emails.length} advertisers`,
      batches: successfulBatches,
    });
  } catch (error) {
    console.error("❌ Cron job failed:", error);
    return Response.json({ error: "Cron job failed" }, { status: 500 });
  }
}
