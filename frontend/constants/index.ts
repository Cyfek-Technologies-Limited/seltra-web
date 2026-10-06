// Mock data for publisher campaigns - replace with actual API calls
export const runningCampaigns = [
  {
    _id: "1",
    campaignName: "Back to School Promo",
    flyerUrl: "/hero/1.jpg",
    price: 8000,
    acceptedAt: "2024-01-14T10:00:00Z", // 24+ hours ago (upload available)
    status: "running",
    category: "education",
  },
  {
    _id: "2",
    campaignName: "September Sales Blast",
    flyerUrl: "/hero/2.jpg",
    price: 6500,
    acceptedAt: "2024-01-15T14:30:00Z", // Less than 24 hours ago
    status: "running",
    category: "sales",
  },
  {
    _id: "3",
    campaignName: "Weekend Flash Deal",
    flyerUrl: "/hero/3.png",
    price: 7200,
    acceptedAt: "2024-01-14T08:00:00Z", // 24+ hours ago (upload available)
    status: "running",
    category: "promotion",
  },
];

export const completedCampaigns = [
  {
    _id: "4",
    campaignName: "Holiday Special Offer",
    flyerUrl: "/hero/4.jpg",
    price: 9000,
    acceptedAt: "2024-01-12T09:00:00Z",
    completedAt: "2024-01-13T16:00:00Z",
    status: "completed",
    reportedViews: 15420,
    proofScreenshot: "/hero/proof1.jpg",
    category: "holiday",
  },
  {
    _id: "5",
    campaignName: "New Year Fitness",
    flyerUrl: "/hero/5.jpg",
    price: 5500,
    acceptedAt: "2024-01-10T11:00:00Z",
    completedAt: "2024-01-11T18:30:00Z",
    status: "completed",
    reportedViews: 8900,
    proofScreenshot: "/hero/proof2.jpg",
    category: "fitness",
  },
];
