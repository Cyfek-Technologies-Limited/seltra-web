// app/api/admin/send-promotional/route.ts
import { NextRequest } from "next/server";
import {
  getAdvertiserEmails,
  getPublisherEmails,
  sendPromotionalToAdvertisers,
  sendPromotionalToPublishers,
} from "../../../../../lib/email-service";

export async function POST(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🎯 Starting promotional email campaign");

    // Get advertiser emails
    const emails = await getAdvertiserEmails();
    const publisherEmails = await getPublisherEmails();

    if (emails.length === 0) {
      return Response.json({
        success: false,
        message: "No advertisers found",
      });
    }

    if (publisherEmails.length === 0) {
      return Response.json({
        success: false,
        message: "No publisherEmails found",
      });
    }

    console.log(`📧 Found ${emails.length} advertisers to email`);
    console.log(`📧 Found ${publisherEmails.length} advertisers to email`);

    // Send promotional emails
    const result = await sendPromotionalToAdvertisers(emails);
    const result_pub = await sendPromotionalToPublishers(publisherEmails);

    return Response.json({
      success: { result, result_pub },
      message: `Promotional emails sent to ${emails.length} advertisers and ${publisherEmails.length} publishers`,
      count: emails.length,
    });
  } catch (error) {
    console.error("❌ Promotional campaign error:", error);
    return Response.json(
      { error: "Failed to send promotional emails" },
      { status: 500 }
    );
  }
}
