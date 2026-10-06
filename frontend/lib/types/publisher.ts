interface PublisherDashboardData {
  profile: {
    verified: boolean;
    platforms: any;
    userId: string;
    memberSince: Date;
  };
  account: {
    availableBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    bankName?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
    isVerified: boolean;
  };
  stats: {
    totalCampaigns: number;
    availableCampaigns: number;
    totalEarnings: number;
    approvedEarnings: number;
    pendingEarnings: number;
    strikes: number;
    completionRate: number;
  };
  recentEarnings: Array<{
    id: string;
    amount: number;
    views: number;
    status: string;
    claimedAt: Date;
    campaignTitle: string;
    platform: string;
  }>;
  strikes: Array<{
    reason: string;
    severity: string;
    issuedAt: Date;
  }>;
  warnings: string | null;
}

interface ProfileData {
  profile: {
    verified: boolean;
    platforms: any;
    userId: string;
    memberSince: Date;
    phone: string;
  };
  account: {
    availableBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    bankName?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
    isVerified: boolean;
  };
}

interface AcceptedCampaign {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  platform: string;
  targetViews: number;
  views: number;
  amount: number;
  status: string;
  progress: number;
  claimedAt: string;
  canSubmitProof: boolean;
  adCreative?: {
    fileUrl: string;
    text?: string;
  };
}

interface CampaignStats {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  rejected: number;
  totalEarnings: number;
}
