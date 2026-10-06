interface AdCreative {
  fileUrl: string;
  text?: string;
}

interface Campaign {
  id: string;
  title: string;
  description?: string;
  budget: number;
  targetViews: number;
  category: string;
  platform: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "PAUSED";
  impressions: number;
  views: number;
  createdAt: string;
  completedAt?: string;
  amountPaid?: number;
  paymentStatus: string;
  paymentReference?: string;
  paidAt?: string;
  userId: string;
  adCreativeId?: string;
  adCreative?: AdCreative;
  user?: {
    id: string;
    email: string;
    username?: string;
  };
}

interface Transaction {
  id: string;
  userId: string;
  campaignId?: string;
  amount: number;
  type: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "PAUSED";
  referemce: string;
  createdAt: string;
  completedAt?: string;
  campaign?: {
    id: string;
    title: string;
    adCreative?: AdCreative;
  };
  user?: {
    id: string;
    email: string;
    username?: string;
  };
}

interface CreateCampaignData {
  title: string;
  description?: string;
  targetViews: number;
  platform: string;
  adCreative: AdCreative;
}

interface UpdateCampaignData {
  title?: string;
  description?: string;
  status?: "PENDING" | "ACTIVE" | "COMPLETED" | "PAUSED";
}

interface CampaignReservation {
  reservationId: string;
  pricing: {
    totalCost: number;
    platformFee: number;
    publisherPayout: number;
    pricePerView: number;
    discount: number;
    platformMultiplier: number;
  };
  expiresAt: string;
  paymentRequired: boolean;
}

interface AcceptedCampaign {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  platform: string;
  category?: string;
  targetViews: number;
  status: string;
  amount: number;
  views: number;
  proofImage: string;
  claimedAt: string;
  // adCreative: {
  //   fileUrl: string;
  //   text?: string;
  // };
  progress: number;
  canClaimReward: boolean;
  canSubmitProof: boolean;
  isCompleted: boolean;
  isRejected: boolean;
  daysSinceClaim: number;
}

interface CampaignStats {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  rejected: number;
  totalEarnings: number;
  pendingEarnings: number;
}

interface PaymentData {
  authorization_url: string;
  reference: string;
  access_code: string;
  amount: number;
  reservationId: string;
}

interface PublisherCampaign {
  id: string;
  campaignId: string;
  publisherId: string;
  status: "active" | "proof_pending" | "completed" | "rejected";
  acceptedAt: string;
  completedAt?: string;
  proofImage?: string;
  views: number;
  earnings: number;
  campaign: {
    id: string;
    title: string;
    description?: string;
    platform: string;
    targetViews: number;
    adCreative: {
      fileUrl: string;
      text?: string;
    };
    status: string;
  };
}

interface CampaignStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  earnings: number;
}
