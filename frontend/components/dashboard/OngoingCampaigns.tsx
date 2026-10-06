// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { Button } from "../ui/button";
// import { Badge } from "../ui/badge";
// import { Progress } from "../ui/progress";
// import { useCampaigns } from "@/hooks/useCampaigns";
// import { Roller } from "../ui/ReusableComponents";
// import { ArrowRight, Plus, Target, Search } from "lucide-react";
// import { toast } from "@/hooks/use-toast";
// import { completedCampaigns, runningCampaigns } from "@/constants";
// import Link from "next/link";
// import { handleUploadProof } from "@/lib/utils";
// import { useConstants } from "@/hooks/useConstants";
// import CampaignCard from "./CampaignCard";
// import MyCampaignsTabs from "./MyCampaignsTabs";

// const OngoingCampaigns = () => {
//   const { loading, campaigns, advertiserCampaigns } = useCampaigns();
//   const { user } = useConstants();

//   return (
//     <>
//       {/* Advertiser View */}
//       {user?.role === "advertiser" && (
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle className="text-xl">Ongoing Campaigns</CardTitle>
//             <Link href={"/campaigns"}>
//               <Button
//                 size="sm"
//                 variant="outline"
//                 className="flex items-center gap-2"
//               >
//                 <ArrowRight className="w-4 h-4" />
//                 View All
//               </Button>
//             </Link>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="flex justify-center py-8">
//                 <Roller />
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {advertiserCampaigns?.slice(0, 3).map((campaign) => {
//                     const progress =
//                       (campaign.views / campaign.targetViews) * 100 > 100
//                         ? 100
//                         : (campaign.views / campaign.targetViews) * 100;

//                     return (
//                       <CampaignCard
//                         key={campaign._id}
//                         campaign={campaign}
//                         progress={progress}
//                       />
//                     );
//                   })}
//                 </div>

//                 {/* Empty State for Advertisers */}
//                 {advertiserCampaigns?.length === 0 && (
//                   <div className="text-center py-12">
//                     <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
//                       <Target className="w-8 h-8 text-muted-foreground" />
//                     </div>
//                     <h3 className="text-lg font-semibold mb-2">
//                       No campaigns yet
//                     </h3>
//                     <p className="text-muted-foreground mb-4">
//                       Create your first WhatsApp Ad campaign and start reaching
//                       thousands instantly.
//                     </p>
//                     <Button asChild>
//                       <Link href="/create-campaign">
//                         <Plus className="w-4 h-4 mr-2" />
//                         Create Campaign
//                       </Link>
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       )}

//       {/* Publisher View */}
//       {user?.role === "publisher" && (
//         <div className="space-y-6">
//           {/* Explore Campaigns */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between">
//               <CardTitle className="text-xl flex items-center gap-2">
//                 <Search className="w-5 h-5 text-primary" />
//                 Explore Campaigns
//               </CardTitle>
//               <Link href={"/campaigns"}>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="flex items-center gap-2"
//                 >
//                   <ArrowRight className="w-4 h-4" />
//                   View All
//                 </Button>
//               </Link>
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <div className="flex justify-center py-8">
//                   <Roller />
//                 </div>
//               ) : (
//                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {campaigns?.slice(0, 3).map((campaign) => {
//                     const progress =
//                       (campaign.views / campaign.targetViews) * 100 > 100
//                         ? 100
//                         : (campaign.views / campaign.targetViews) * 100;

//                     return (
//                       <CampaignCard
//                         key={campaign.id}
//                         campaign={campaign}
//                         progress={progress}
//                       />
//                     );
//                   })}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Publisher My Campaigns */}
//           <MyCampaignsTabs
//             runningCampaigns={runningCampaigns}
//             completedCampaigns={completedCampaigns}
//             onUploadProof={handleUploadProof}
//           />
//         </div>
//       )}
//     </>
//   );
// };

// export default OngoingCampaigns;
