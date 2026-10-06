import { createNotification } from "./notification-service";

export async function triggerWelcomeNotification(userId: string, role: string) {
  return createNotification({
    userId,
    type: "WELCOME",
    title: "Welcome to SELTRA! ",
    message: `Welcome to SELTRA! You've successfully joined as ${role}. Imagine thousands of real Nigerians posting your business flyer on their WhatsApp status and social media. People trust what their friends share more than any random ad you run. This is word-of-mouth marketing, but amplified for the digital age. With Seltra, you upload your campaign and real people share it everywhere for you. This simple strategy will get you more customers who trust the source. Create a campaing today!`,
    actionUrl: `/dashboard/${role}/campaigns/create`,
    metadata: { role },
  });
}

export async function triggerCampaignCreatedNotification(
  userId: string,
  campaignId: string,
  campaignTitle: string
) {
  return createNotification({
    userId,
    type: "CAMPAIGN_CREATED",
    title: "Campaign Created Successfully! ",
    message: `Your campaign "${campaignTitle}" has been created successfully. You can track its performance in your dashboard.`,
    // actionUrl: `/dashboard/${role}campaigns/${campaignId}`,
    metadata: { campaignId, campaignTitle },
  });
}

export async function triggerCampaignAcceptedNotification(
  userId: string,
  campaignId: string,
  campaignTitle: string
) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return createNotification({
    userId,
    type: "CAMPAIGN_ACCEPTED",
    title: "Campaign Accepted! ✅",
    message: `You've accepted "${campaignTitle}". Please submit proof of posting within 24 hours to get paid.`,
    // actionUrl: `/dashboard/submit-proof/${campaignId}`,
    metadata: { campaignId, campaignTitle },
    expiresAt,
  });
}

export async function triggerProofSubmittedNotification(
  userId: string,
  campaignId: string,
  campaignTitle: string,
  amount: number
) {
  return createNotification({
    userId,
    type: "PROOF_SUBMITTED",
    title: "Proof Submitted! 📸",
    message: `Your proof for "${campaignTitle}" has been submitted successfully. You'll earn ₦${amount.toLocaleString()} once approved.`,
    // actionUrl: `/dashboard/proofs`,
    metadata: { campaignId, campaignTitle, amount },
  });
}

export async function triggerEarningsApprovedNotification(
  userId: string,
  campaignTitle: string,
  amount: number,
  totalBalance: number
) {
  return createNotification({
    userId,
    type: "EARNINGS_APPROVED",
    title: "Earnings Approved! 💰",
    message: `Congratulations! You've earned ₦${amount.toLocaleString()} from "${campaignTitle}". Your total balance is now ₦${totalBalance.toLocaleString()}.`,
    // actionUrl: `/dashboard/earnings`,
    metadata: { campaignTitle, amount, totalBalance },
  });
}

export async function triggerWithdrawalEligibleNotification(
  userId: string,
  balance: number
) {
  return createNotification({
    userId,
    type: "WITHDRAWAL_ELIGIBLE",
    title: "Ready to Withdraw! 🎊",
    message: `Great news! You've reached the minimum withdrawal threshold of ₦3,000. Your current balance is ₦${balance.toLocaleString()}. You can now withdraw your earnings.`,
    // actionUrl: `/dashboard/withdraw`,
    metadata: { balance },
  });
}

// Add this to your existing notification triggers
export async function triggerNewCampaignAvailableNotification(
  publisherId: string,
  campaignId: string,
  campaignTitle: string,
  amountPerView: number
) {
  return createNotification({
    userId: publisherId,
    type: "CAMPAIGN_CREATED",
    title: "New Campaign Available! 🎯",
    message: `New campaign "${campaignTitle}" is available. Earn ₦${amountPerView} per view!`,
    actionUrl: `/dashboard/publisher/campaigns`,
    metadata: {
      campaignId,
      campaignTitle,
      amountPerView,
    },
  });
}
