import { prisma } from "./db.cjs";
import {
  sendBulkEmails,
  sendEmail,
  sendNewCampaignNotification,
} from "./email-service"; // Now this will work
import { emailQueue } from "./queue-service";

export async function createNotification({
  userId,
  type,
  title,
  message,
  actionUrl,
  metadata,
  expiresAt,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
  expiresAt?: Date;
}) {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actionUrl,
        metadata,
        expiresAt,
      },
    });

    // Get user to send email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true, roles: true },
    });

    if (user) {
      // Send email notification
      await sendNotificationEmail(
        user.email,
        type,
        title,
        message,
        actionUrl,
        user.roles
      );
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

async function sendNotificationEmail(
  email: string,
  type: string,
  title: string,
  message: string,
  actionUrl?: string,
  roles?: string[]
) {
  const role = roles?.includes("PUBLISHER") ? "publisher" : "advertiser";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; background: white; padding: 30px; border-radius: 10px; margin: 0 auto; }
        .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <p>${message}</p>
        
        ${
          actionUrl
            ? `
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://seltra.app${actionUrl}" class="button">View Details</a>
        </p>
        `
            : ""
        }
        
        ${getRoleSpecificTips(role, type)}
        
        <div class="footer">
          <p>Best regards,<br>The CELTRA Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(email, title, emailHtml);
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}

function getRoleSpecificTips(role: string, type: string): string {
  if (role === "publisher") {
    switch (type) {
      case "CAMPAIGN_ACCEPTED":
        return `
          <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📹 Need Help?</h3>
            <p>Watch our tutorial on how to submit proof: <a href="https://youtube.com/tutorial-proof">Proof Submission Guide</a></p>
          </div>
        `;
      case "WITHDRAWAL_ELIGIBLE":
        return `
          <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">💰 Ready to Withdraw?</h3>
            <p>Learn how to withdraw your earnings: <a href="https://youtube.com/tutorial-withdraw">Withdrawal Guide</a></p>
          </div>
        `;
    }
  }

  if (role === "advertiser") {
    switch (type) {
      case "CAMPAIGN_CREATED":
        return `
          <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📊 Track Your Campaign</h3>
            <p>Monitor your campaign performance and analytics in your dashboard.</p>
          </div>
        `;
    }
  }

  return "";
}

export async function notifyPublishersAboutNewCampaign(campaignId: string) {
  try {
    console.log("🔄 Queueing publisher notification for campaign:", campaignId);

    // Immediately queue the job and return success
    await emailQueue.addJob(
      "NOTIFY_PUBLISHERS",
      {
        campaignId,
        batchSize: 50,
        delayBetweenBatches: 2000,
      },
      1000
    ); // 1 second initial delay

    console.log("✅ Publisher notification queued for background processing");
    return true;
  } catch (error) {
    console.error("❌ Error queueing publisher notification:", error);
    return false;
  }
}

export async function processPublisherNotifications(
  campaignId: string,
  batchSize: number = 50,
  delayBetweenBatches: number = 2000
) {
  try {
    console.log(
      "🔄 Processing publisher notifications for campaign:",
      campaignId
    );

    // Get campaign details
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        user: { select: { username: true } },
        adCreative: true,
      },
    });

    if (!campaign) {
      console.error("❌ Campaign not found:", campaignId);
      return;
    }

    // SMART FILTERING: Only notify relevant publishers
    const publishers = await getRelevantPublishers(campaign);

    if (publishers.length === 0) {
      console.log("ℹ️ No relevant publishers found to notify");
      return;
    }

    console.log(`📨 Notifying ${publishers.length} relevant publishers`);

    // Split into batches for processing
    const batches = chunkArray(publishers, batchSize);
    let totalProcessed = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(
        `📦 Processing batch ${i + 1}/${batches.length} (${
          batch.length
        } publishers)`
      );

      // Process email notifications for this batch
      await processEmailBatch(batch, campaign);

      // Process in-app notifications for this batch
      await processInAppNotificationBatch(batch, campaign);

      totalProcessed += batch.length;
      console.log(
        `✅ Batch ${i + 1} completed (Total: ${totalProcessed}/${
          publishers.length
        })`
      );

      // Delay between batches
      if (i < batches.length - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    console.log(
      `🎉 All publisher notifications completed for campaign: ${campaignId}`
    );
  } catch (error) {
    console.error("❌ Error processing publisher notifications:", error);
    throw error;
  }
}

// SMART FILTERING: Only notify publishers who are likely to be interested
async function getRelevantPublishers(campaign: any) {
  const { category, platform } = campaign;

  // Base query for active, verified publishers
  const baseWhere = {
    roles: { has: "PUBLISHER" },
    emailVerified: { not: null },
    publisher: { verified: true },
  };

  // Try to find publishers who have previously engaged with similar campaigns
  const engagedPublishers = await prisma.user.findMany({
    where: {
      ...baseWhere,
      // Publishers who have completed campaigns in similar categories
      publisher: {
        earningsHistory: {
          some: {
            campaign: {
              category: category || undefined,
              platform: platform || undefined,
            },
          },
        },
      },
    },
    select: {
      email: true,
      id: true,
      username: true,
    },
    take: 200, // Limit for highly engaged publishers
  });

  // If we don't have enough engaged publishers, get active publishers
  if (engagedPublishers.length < 50) {
    const activePublishers = await prisma.user.findMany({
      where: baseWhere,
      select: {
        email: true,
        id: true,
        username: true,
      },
      take: 500, // Limit total notifications
    });

    // Merge and deduplicate
    const allPublishers = [...engagedPublishers];
    const engagedIds = new Set(engagedPublishers.map((p) => p.id));

    for (const publisher of activePublishers) {
      if (!engagedIds.has(publisher.id) && allPublishers.length < 1000) {
        allPublishers.push(publisher);
      }
    }

    return allPublishers;
  }

  return engagedPublishers;
}

async function processEmailBatch(publishers: any[], campaign: any) {
  const publisherEmails = publishers.map((p) => p.email).filter(Boolean);

  if (publisherEmails.length === 0) return;

  const amountPerView = calculateAmountPerView(
    campaign.platform,
    campaign.adCreativeId
  );

  const html = generateCampaignEmailHtml(
    campaign.title,
    campaign.description || "No description provided",
    campaign.category || "General",
    campaign.platform,
    campaign.targetViews,
    amountPerView
  );

  await sendBulkEmails(
    publisherEmails,
    `🎯 New Campaign: ${campaign.title}`,
    html,
    50, // Batch size for emails within this batch
    1000 // Delay between email sub-batches
  );
}

async function processInAppNotificationBatch(publishers: any[], campaign: any) {
  const amountPerView = calculateAmountPerView(
    campaign.platform,
    campaign.adCreativeId
  );

  const notificationPromises = publishers.map((publisher) =>
    createNotification({
      userId: publisher.id,
      type: "CAMPAIGN_CREATED",
      title: "New Campaign Available! 🎯",
      message: `New campaign "${campaign.title}" is available. Earn ₦${amountPerView} per view!`,
      actionUrl: `/dashboard/publisher/campaigns`,
      metadata: {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        amountPerView,
      },
    }).catch((error) => {
      console.error(
        `❌ Failed to create notification for publisher ${publisher.id}:`,
        error
      );
      return null;
    })
  );

  await Promise.all(notificationPromises);
}

function chunkArray(array: any[], chunkSize: number): any[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function calculateAmountPerView(
  platform: string,
  adCreativeId: string | null
): number {
  const baseRates: { [key: string]: number } = {
    whatsapp: 5,
    instagram: 7.5,
    twitter: 7.5,
    linkedin: 7.5,
    all: 10,
  };
  return baseRates[platform] || 5;
}

function generateCampaignEmailHtml(
  title: string,
  description: string,
  category: string,
  platform: string,
  targetViews: number,
  amountPerView: number
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; background: white; padding: 30px; border-radius: 10px; margin: 0 auto; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; }
            .campaign-card { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .badge { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 New Campaign Available!</h1>
            <p>Hello Publisher,</p>
            <p>A new campaign matching your interests has been created and is ready for you to accept!</p>
            
            <div class="campaign-card">
                <h2 style="margin-top: 0;">${title}</h2>
                <p>${description}</p>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0;">
                    <span class="badge">${category}</span>
                    <span class="badge">${platform}</span>
                    <span class="badge">${targetViews.toLocaleString()} views</span>
                    <span class="badge">₦${amountPerView}/view</span>
                </div>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="https://seltra.app/dashboard/publisher/campaigns" class="button">Browse Available Campaigns</a>
            </p>
            
            <div class="footer">
                <p>Best regards,<br>The SELTRA Team</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
