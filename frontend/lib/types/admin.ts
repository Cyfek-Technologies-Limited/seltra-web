interface ClaimDetails {
  stampedCreativeUrl: string | Blob;
  id: string;
  amount: number;
  views: number;
  proofImages: string[];
  proofUrl: string;
  claimedAt: string;
  extractedViews?: number;
  status: string;
  publisher: {
    id: string;
    user: {
      email: string;
      username?: string;
      createdAt: string;
    };
    account: {
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
      isVerified: boolean;
      availableBalance: number;
      totalEarnings: number;
    };
    strikes: Array<{
      id: string;
      reason: string;
      severity: string;
      issuedAt: string;
      resolvedAt?: string;
      evidence?: any;
    }>;
    verified: boolean;
    earnings: number;
  };
  campaign: {
    id: string;
    title: string;
    description: string;
    platform: string;
    views: number;
    targetViews: number;
    amountPaid: number;
    status: string;
    createdAt: string;
    user: {
      email: string;
      username?: string;
    };
    adCreative?: {
      fileUrl: string;
      text: string;
    };
  };
}

interface Claim {
  id: string;
  status: string;
  proofImages: string[];
  claimedAt: string;
  campaign?: {
    title: string;
  };
}
