export interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  flyer_url: string;
  text_template: string;
  start_date: string;
  end_date: string;
  budget: number;
  requirements: string[];
  status: "active" | "draft" | "completed";
}

export interface DatabaseNotification {
  id: string;
  title: string;
  message: string;
  type: string; // This will be the database enum types
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: any;
}

export interface PublisherCampaign {
  id: string;
  campaign: Campaign;
  accepted_at: string;
  status: "active" | "proof_pending" | "completed" | "rejected";
  time_remaining_hours: number;
  proof_submitted: boolean;
}

export interface Proof {
  id: string;
  publisher_campaign_id: string;
  proof_url: string;
  caption: string;
  link: string;
  submitted_at: string;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "deadline" | "approval" | "campaign" | "general" | string; // Allow string for database types
  priority: "high" | "medium" | "low";
  read: boolean;
  created_at: string;
  action_url?: string;
  campaign_id?: string;
}

export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Summer Fashion Collection Launch",
    description:
      "Promote our new summer collection with vibrant styles and trending pieces.",
    category: "Fashion",
    brand: "StyleCo",
    flyer_url: "/summer-fashion-collection-colorful-clothing.jpg",
    text_template:
      "Check out the hottest summer trends at StyleCo! 🌞 #SummerFashion #StyleCo",
    start_date: "2024-06-01",
    end_date: "2024-08-31",
    budget: 5000,
    requirements: ["Instagram post", "Minimum 1000 followers", "Fashion niche"],
    status: "active",
  },
  {
    id: "2",
    title: "Tech Gadget Review Campaign",
    description:
      "Review our latest smartphone and share your honest experience.",
    category: "Technology",
    brand: "TechNova",
    flyer_url: "/modern-smartphone-technology-review.jpg",
    text_template:
      "Just tried the new TechNova phone - here's my honest review! 📱 #TechReview #TechNova",
    start_date: "2024-05-15",
    end_date: "2024-07-15",
    budget: 8000,
    requirements: ["Video review", "Tech audience", "Minimum 5000 followers"],
    status: "active",
  },
  {
    id: "3",
    title: "Fitness App Promotion",
    description: "Share your fitness journey using our new workout app.",
    category: "Health & Fitness",
    brand: "FitLife",
    flyer_url: "/fitness-app-workout-motivation.jpg",
    text_template:
      "Crushing my fitness goals with FitLife app! 💪 Who's joining me? #FitLife #Workout",
    start_date: "2024-06-10",
    end_date: "2024-09-10",
    budget: 3000,
    requirements: ["Fitness content", "Before/after photos", "App screenshot"],
    status: "active",
  },
  {
    id: "4",
    title: "Sustainable Living Products",
    description:
      "Showcase eco-friendly products and sustainable lifestyle choices.",
    category: "Lifestyle",
    brand: "EcoGreen",
    flyer_url: "/eco-friendly-sustainable-products-green-living.jpg",
    text_template:
      "Living sustainably with EcoGreen products! 🌱 Small changes, big impact. #EcoFriendly #Sustainable",
    start_date: "2024-05-20",
    end_date: "2024-08-20",
    budget: 4500,
    requirements: [
      "Lifestyle content",
      "Product showcase",
      "Environmental message",
    ],
    status: "active",
  },
];

export const mockPublisherCampaigns: PublisherCampaign[] = [
  {
    id: "1",
    campaign: mockCampaigns[0],
    accepted_at: "2024-06-15T10:00:00Z",
    status: "active",
    time_remaining_hours: 18,
    proof_submitted: false,
  },
  {
    id: "2",
    campaign: mockCampaigns[1],
    accepted_at: "2024-06-10T14:30:00Z",
    status: "proof_pending",
    time_remaining_hours: 0,
    proof_submitted: true,
  },
  {
    id: "3",
    campaign: mockCampaigns[2],
    accepted_at: "2024-06-01T09:15:00Z",
    status: "completed",
    time_remaining_hours: 0,
    proof_submitted: true,
  },
];

export const mockProofs: Proof[] = [
  {
    id: "1",
    publisher_campaign_id: "2",
    proof_url: "/instagram-post-tech-review-smartphone.jpg",
    caption:
      "Just tried the new TechNova phone - here's my honest review! The camera quality is amazing and the battery life is impressive. Definitely recommend for tech enthusiasts! 📱 #TechReview #TechNova",
    link: "https://instagram.com/p/example123",
    submitted_at: "2024-06-16T16:45:00Z",
    status: "pending",
  },
  {
    id: "2",
    publisher_campaign_id: "3",
    proof_url: "/fitness-workout-app-screenshot-results.jpg",
    caption:
      "Crushing my fitness goals with FitLife app! 💪 Who's joining me? #FitLife #Workout",
    link: "https://instagram.com/p/example456",
    submitted_at: "2024-06-05T12:20:00Z",
    status: "approved",
    admin_notes: "Great content! Meets all requirements.",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Deadline Approaching",
    message:
      'Your proof submission for "Summer Fashion Collection Launch" is due in 6 hours. Please upload your proof to avoid missing the deadline.',
    type: "deadline",
    priority: "high",
    read: false,
    created_at: "2024-06-16T10:00:00Z",
    action_url: "/dashboard/publisher/my-campaigns",
    campaign_id: "1",
  },
  {
    id: "2",
    title: "Proof Approved",
    message:
      'Great news! Your proof for "Tech Gadget Review Campaign" has been approved. The campaign is now marked as completed.',
    type: "approval",
    priority: "medium",
    read: false,
    created_at: "2024-06-15T14:30:00Z",
    action_url: "/dashboard/publisher/completed",
    campaign_id: "2",
  },
  {
    id: "3",
    title: "New Campaign Available",
    message:
      'A new campaign "Sustainable Living Products" matching your interests is now available. Check it out and apply before spots fill up!',
    type: "campaign",
    priority: "medium",
    read: true,
    created_at: "2024-06-14T09:15:00Z",
    action_url: "/campaigns",
    campaign_id: "4",
  },
  {
    id: "4",
    title: "Proof Under Review",
    message:
      "Your proof submission for \"Fitness App Promotion\" is currently under admin review. You'll be notified once it's processed.",
    type: "approval",
    priority: "low",
    read: true,
    created_at: "2024-06-13T16:45:00Z",
    action_url: "/dashboard/publisher/my-campaigns",
    campaign_id: "3",
  },
  {
    id: "5",
    title: "Campaign Deadline Extended",
    message:
      'Good news! The deadline for "Summer Fashion Collection Launch" has been extended by 48 hours due to high demand.',
    type: "campaign",
    priority: "low",
    read: true,
    created_at: "2024-06-12T11:20:00Z",
    action_url: "/dashboard/publisher/my-campaigns",
    campaign_id: "1",
  },
  {
    id: "6",
    title: "Welcome to AdCampaign Pro",
    message:
      "Welcome to our platform! Start by exploring available campaigns and accepting ones that match your audience and interests.",
    type: "general",
    priority: "low",
    read: true,
    created_at: "2024-06-10T08:00:00Z",
    action_url: "/campaigns",
  },
];
