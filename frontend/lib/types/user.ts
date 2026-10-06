interface PublisherAccount {
  id: string;
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  isVerified: boolean;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
}

interface EarningsHistory {
  id: string;
  campaign: Campaign[];
  amount: number;
}

interface Withdrawals {
  publisherId: String;
  amount: number;
  status: String;
  reference: String;
}

interface Publisher {
  id: string;
  verified: boolean;
  earnings: number;
  platforms: any;
  account?: PublisherAccount;
  earningsHistory?: EarningsHistory[];
  withdrawals?: Withdrawals[];
}

interface AcceptCampaignResponse {
  success: boolean;
  message: string;
  publisherCampaign?: any;
}
