interface AuthFormData {
  username?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: "publisher" | "advertiser";
  whatsapp?: string;
  referralCode?: string;
}

interface User {
  id: string;
  email: string;
  username?: string;
  passwordHash?: string;
  emailVerified?: string;
  googleId?: string;
  avatar?: string;
  authProvider: "EMAIL" | "GOOGLE";
  createdAt: string;
  roles: string[];
  campaigns?: Campaign[];
  stats?: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalViews: number;
    totalCampaignBudget: number;
    averagePublishersPerCampaign: string | number;
    // Add other stat properties you need
  };
  transactions?: Array<{
    id: string;
    type: string;
    status: string;
    amount: number;
    // Add other transaction properties
  }>;
  isPublisher: boolean;
  isAdvertiser: boolean;
  isAdmin: boolean;
}

// Add to your useAuth hook return type
const useAuth = () => {
  // ... existing functions ...
  googleLogin: (role?: string) => Promise<void>;
};

interface AuthResponse {
  status: number;
  token?: string;
  data?: any;
  msg?: string;
  error?: string;
}

interface UserResponse {
  status: number;
  data?: User;
  msg?: string;
  error?: string;
}
