// ---------------------------------- individual -------------------------- //

export const advertiserNav = [
  {
    name: "Dashboard",
    icon: "/dash/request.svg",
    route: "/dashboard/advertiser",
  },
  {
    name: "Pricing",
    icon: "/dash/wallet.svg",
    route: "/dashboard/advertiser/pricing",
  },

  {
    name: "Create",
    icon: "/dash/service.svg",
    route: "/dashboard/advertiser/campaigns/create",
  },

  {
    name: "My Campaigns",
    icon: "/dash/orders.svg",
    route: "/dashboard/advertiser/campaigns/my-campaigns",
  },

  {
    name: "Help & Support",
    icon: "/dash/phone.svg",
    route: "/dashboard/advertiser/support",
  },
  {
    name: "leaderoard",
    icon: "/dash/phone.svg",
    route: "/dashboard/advertiser/leaderoard",
  },
];

export const publisherNav = [
  {
    name: "Dashboard",
    icon: "/dash/request.svg",
    route: "/dashboard/publisher",
  },

  {
    name: "Explore",
    icon: "/dash/service.svg",
    route: "/explore",
  },
  {
    name: "My Campaigns",
    icon: "/dash/orders.svg",
    route: "/dashboard/publisher/campaigns/my-campaigns",
  },

  {
    name: "Profile",
    icon: "/dash/users.svg",
    route: "/dashboard/publisher/profile",
  },
  {
    name: "Withdraw",
    icon: "/dash/wallet.svg",
    route: "/dashboard/publisher/withdraw",
  },
  {
    name: "Referrals",
    icon: "/dash/users.svg",
    route: "/dashboard/publisher/referrals",
  },

  // {
  //   name: "leaderoard",
  //   icon: "/dash/request.svg",
  //   route: "/dashboard/publisher/leaderboard",
  // },
];

export const adminNav = [
  {
    name: "Dashboard",
    icon: "/dash/request.svg",
    route: "/dashboard/admin",
  },

  {
    name: "Claims",
    icon: "/dash/service.svg",
    route: "/dashboard/admin/claims",
  },

  {
    name: "Users",
    icon: "/dash/users.svg",
    route: "/dashboard/admin/users",
  },
  {
    name: "Reservations",
    icon: "/dash/wallet.svg",
    route: "/dashboard/admin/reservations",
  },

  {
    name: "Settings",
    icon: "/dash/settings.svg",
    route: "",
  },
  {
    name: "Create Blog",
    icon: "/dash/orders.svg",
    route: "/blog/create",
  },
];

// ---------------------------------- BUSINESS ------------------------------- //
export const stats = [
  {
    title: "Active Requests",
    value: "6 Total",
    subtitle: "4 Pending, 2 In Progress",
    icon: "/dash/student/chat-bubble.svg",
  },
  {
    title: "Monthly Quota",
    value: "12/20",
    icon: "/dash/business/pie-chart.svg",
    subtitle: "Orders Used",
  },
  {
    title: "Cloud Storage",
    value: "4.5GB / 20GB",
    icon: "/dash/student/cloud-file.svg",
    subtitle: "Storage Consumed",
  },
  {
    title: "Assigned Agent",
    value: "Chizzy",
    icon: "/dash/business/headset.svg",
    subtitle: "Admin Support",
  },
  {
    title: "Billing Status",
    value: "Active",
    icon: "/dash/business/cash-flow.svg",
    subtitle: "Subscription Renews July 3rd",
  },
];

export const ongoingCampaigns = [
  {
    icon: "/dash/business/paper.svg",
    text: "Convert these 3 files into a branded report?",
    bgColor: "bg-[#2FC22B]",
    views: 20,
    btnColor: "bg-[#A2FF9F]",
    targetViews: 100,
  },
  {
    icon: "/dash/business/bar-chart.svg",
    text: "Want us to format your March report?",
    bgColor: "bg-[#A2FF9F]",
    btnColor: "bg-[#008C0E]",
    targetViews: 50,
    views: 30,
  },
  {
    icon: "/dash/business/export.svg",
    text: "Move these 7 files into a folder for easy access?",
    bgColor: "bg-[#00A0D4]",
    btnColor: "bg-[#9FEAFF]",
    targetViews: 1000,
    views: 93,
    btnTextColor: "text-[#00A0D4]",
  },
];

export const currentTask = [
  {
    icon: "/dash/recent/print.svg",
    title: "Create Invoice Template",
    subtitle: "Task assigned to Finance team",
    status: "In Progress",
    progress: 65,
    progressBar: "/dash/recent/pro1.svg",
  },
  {
    icon: "/dash/recent/bro.svg",
    title: "Design Proposal Cover",
    subtitle: "Task assigned to Marketing team",
    status: "Assigned",
    progress: 23,
    progressBar: "/dash/recent/pro2.svg",
  },
  {
    icon: "/dash/business/update.svg",
    title: "Update Onboarding Form",
    subtitle: "New request added by HR",
    status: "New Task",
    progress: 0,
    progressBar: "/dash/recent/pro3.svg",
  },
  {
    icon: "/dash/business/bar-chart-blue.svg",
    title: "Annual Report Formatting",
    subtitle: "Delivered to Admin team",
    status: "Delivered",
    progress: 100,
    progressBar: "/dash/recent/pro4.svg",
  },
  {
    icon: "/dash/business/sm-flyer.svg",
    title: "Social Media Flyer",
    subtitle: "Reopened by Marketing team",
    status: "In Progress",
    progress: 45,
    progressBar: "/dash/recent/pro5.svg",
  },
];
