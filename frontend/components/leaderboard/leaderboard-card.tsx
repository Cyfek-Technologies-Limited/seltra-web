"use client";
import { toast } from "@/hooks/use-toast";
import { Trophy, Medal, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/ReusableComponents";

export default function LeaderboardCard() {
  const [topThree, setTopThree] = useState([]);
  const [otherRanks, setOtherRanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    getLeaderboard();
  }, []);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getLeaderboard = async (): Promise<Campaign[]> => {
    setIsLoading(true);
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const token = localStorage.getItem("auth-token");
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${BASE_URL}/leaderboard`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const res = await response.json();
      if (res.status === 200 && res.data) {
        const leaderboardData = res.data.leaderboard || [];

        setTopThree(leaderboardData.slice(0, 3));
        setOtherRanks(leaderboardData.slice(3, 10));
        return leaderboardData;
      } else {
        throw new Error(res.error || "Failed to fetch leaderboard");
      }
    } catch (error: any) {
      toast({
        title: "Fetch Failed",
        description: error.message || "Failed to fetch leaderboard",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading)
    return (
      <div>
        <Spinner />
      </div>
    );

  // --- MOVE RANK 1 TO MIDDLE FOR DISPLAY ---
  const displayTopThree = [...topThree];
  if (displayTopThree.length === 3) {
    const temp = displayTopThree[0];
    displayTopThree[0] = displayTopThree[1];
    displayTopThree[1] = temp;
  }

  return (
    <main className="space-y-10 px-4 md:px-10 pb-24">
      {/* PRIZE HEADER */}
      {/* Prize Banner - Clean and Professional */}
      <div className="mt-3 bg-gradient-to-r from-accent to-amber-500 rounded-lg p-4 text-center text-white shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Crown className="h-4 w-4" />
          <span className="font-semibold text-sm">GRAND PRIZE</span>
        </div>
        <div className="text-2xl font-bold">₦100,000</div>
        <p className="text-xs opacity-90 mt-1">Top referrer by Dec 15th wins</p>
      </div>

      {/* TOP PERFORMERS */}
      {/* TOP PERFORMERS */}
      <section className="w-full">
        <h2 className="font-semibold text-lg mb-4">Top Performers</h2>

        <div
          className="
    flex gap-4 overflow-x-auto pb-6 -mx-4 px-4
    md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible
  "
        >
          {topThree.map((person, i) => (
            <div
              key={person.rank}
              className={`
          min-w-[75%] sm:min-w-[60%] md:min-w-0
          bg-white rounded-2xl shadow-md
          p-6 flex flex-col items-center border
          hover:shadow-lg transition
          md:h-auto

          /* 👇 THIS makes the second card come first */
          ${i === 0 ? "order-1 md:order-none scale-105" : ""}
          ${i === 1 ? "order-2 md:order-none" : ""}
          ${i === 2 ? "order-3 md:order-none" : ""}

          ${i === 0 ? "lg:scale-110 border-2 border-yellow-400 shadow-xl" : ""}
        `}
            >
              {/* Avatar */}
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center bg-gray-200 text-3xl md:text-4xl font-bold border-4 border-gray-200">
                {person.username?.[0]?.toUpperCase()}
              </div>

              <p className="font-semibold mt-3 text-center">
                {person.username}
              </p>

              <p className="text-sm text-gray-500">
                {person.totalReferrals} Referrals
              </p>

              {/* Rank Icon */}
              <div
                className={`flex items-center gap-1 mt-2 ${
                  person.rank === 1 ? "text-yellow-500" : "text-gray-600"
                }`}
              >
                {person.rank === 1 ? (
                  <Crown className="w-5 h-5" />
                ) : person.rank === 2 ? (
                  <Medal className="w-4 h-4" />
                ) : (
                  <Trophy className="w-4 h-4" />
                )}

                <span className="font-medium">Rank {person.rank}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OTHER RANKS TABLE */}
      <section className="bg-white rounded-2xl shadow-md p-6 border mt-6">
        <h3 className="font-semibold text-lg mb-4"> </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-gray-500">
                <th className="pb-3">Rank</th>
                <th className="pb-3">Learner</th>
                <th className="pb-3">Referrals</th>

                {/* Hide Joined on Mobile */}
                <th className="pb-3 hidden md:table-cell">Joined</th>
              </tr>
            </thead>

            <tbody>
              {otherRanks.map((item) => (
                <tr
                  key={item.rank}
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  <td className="py-3 font-semibold">{item.rank}</td>
                  <td className="py-3">{item.username}</td>
                  <td className="py-3">{item.totalReferrals}</td>

                  <td className="py-3 text-gray-500 hidden md:table-cell">
                    {formatDate(item.joinDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

// // components/leaderboard/leaderboard-card.tsx - MATCHING CY-FRONTEND DESIGN
// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Trophy, Crown, Medal, Users, Share2, Target } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useAuth } from "@/hooks/useAuth";
// import { toast } from "@/hooks/use-toast";
// import { Spinner } from "../ui/ReusableComponents";

// interface LeaderboardEntry {
//   id: string;
//   userId: string;
//   username: string;
//   totalReferrals: number;
//   rank: number;
//   prizeAmount?: number;
// }

// interface LeaderboardData {
//   leaderboard: LeaderboardEntry[];
//   prizeInfo: {
//     amount: number;
//     daysLeft: number;
//   };
// }

// export function LeaderboardCard() {
//   const [data, setData] = useState<LeaderboardData | null>(null);
//   const [loading, setLoading] = useState(false);
//   const { user } = useAuth();

//   const [topThree, setTopThree] = useState([]);
//   const [otherRanks, setOtherRanks] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

//   useEffect(() => {
//     getLeaderboard();
//   }, []);

//   const formatDate = (isoString: string) => {
//     const d = new Date(isoString);
//     return d.toLocaleString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const getLeaderboard = async (): Promise<Campaign[]> => {
//     setIsLoading(true);
//     try {
//       const headers: HeadersInit = { "Content-Type": "application/json" };
//       const token = localStorage.getItem("auth-token");
//       if (token) headers["Authorization"] = `Bearer ${token}`;

//       const response = await fetch(`${BASE_URL}/leaderboard`, {
//         method: "GET",
//         headers,
//         credentials: "include",
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(
//           errorData.error || `HTTP error! status: ${response.status}`
//         );
//       }

//       const res = await response.json();
//       if (res.status === 200 && res.data) {
//         const leaderboardData = res.data.leaderboard || [];
//         console.log("leaderboardData", leaderboardData);

//         setTopThree(leaderboardData.slice(0, 3));
//         setOtherRanks(leaderboardData.slice(3, 10));
//         return leaderboardData;
//       } else {
//         throw new Error(res.error || "Failed to fetch leaderboard");
//       }
//     } catch (error: any) {
//       toast({
//         title: "Fetch Failed",
//         description: error.message || "Failed to fetch leaderboard",
//         variant: "destructive",
//       });
//       return [];
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading)
//     return (
//       <div>
//         <Spinner />
//       </div>
//     );

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-NG", {
//       style: "currency",
//       currency: "NGN",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const getRankStyles = (rank: number) => {
//     switch (rank) {
//       case 1:
//         return "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-md";
//       case 2:
//         return "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 shadow-sm";
//       case 3:
//         return "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-sm";
//       default:
//         return "bg-white border-gray-100";
//     }
//   };

//   const getRankIcon = (rank: number) => {
//     switch (rank) {
//       case 1:
//         return <Crown className="h-5 w-5 text-yellow-600" />;
//       case 2:
//         return <Medal className="h-4 w-4 text-slate-500" />;
//       case 3:
//         return <Medal className="h-4 w-4 text-orange-500" />;
//       default:
//         return <Trophy className="h-4 w-4 text-blue-500" />;
//     }
//   };

//   const getRankBadgeColor = (rank: number) => {
//     switch (rank) {
//       case 1:
//         return "bg-yellow-500 text-white";
//       case 2:
//         return "bg-slate-500 text-white";
//       case 3:
//         return "bg-orange-500 text-white";
//       default:
//         return "bg-blue-500 text-white";
//     }
//   };

//   if (loading) {
//     return (
//       <Card className="w-full bg-white border border-gray-200 rounded-xl shadow-sm">
//         <CardHeader className="pb-4">
//           <CardTitle className="text-lg font-semibold text-gray-900">
//             Referral Leaderboard
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {[...Array(3)].map((_, i) => (
//             <div
//               key={i}
//               className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 animate-pulse"
//             >
//               <div className="h-8 w-8 rounded-full bg-gray-200"></div>
//               <div className="flex-1 space-y-2">
//                 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
//               </div>
//             </div>
//           ))}
//         </CardContent>
//       </Card>
//     );
//   }

//   if (topThree.length === 0) {
//     return (
//       <Card className="w-full bg-white border border-gray-200 rounded-xl shadow-sm">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold text-gray-900">
//             Referral Leaderboard
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-8 text-gray-500">
//             <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
//             <p className="text-sm">No referrals yet!</p>
//             <p className="text-xs mt-1">
//               Be the first to refer friends and win.
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const currentUserRank = data.leaderboard.find(
//     (entry) => entry.userId === user?.id
//   );

//   return (
//     <Card className="w-full bg-white border border-gray-200 rounded-xl shadow-sm">
//       <CardHeader className="pb-4">
//         <div className="flex items-center justify-between">
//           <CardTitle className="text-lg font-semibold text-gray-900">
//             Referral Leaderboard
//           </CardTitle>
//           <Badge
//             variant="outline"
//             className="bg-green-50 text-green-700 border-green-200"
//           >
//             <Target className="h-3 w-3 mr-1" />
//             {data.prizeInfo.daysLeft}d left
//           </Badge>
//         </div>

//         {/* Prize Banner - Clean and Professional */}
//         <div className="mt-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg p-4 text-center text-white shadow-sm">
//           <div className="flex items-center justify-center gap-2 mb-1">
//             <Crown className="h-4 w-4" />
//             <span className="font-semibold text-sm">GRAND PRIZE</span>
//           </div>
//           <div className="text-2xl font-bold">
//             {formatCurrency(data.prizeInfo.amount)}
//           </div>
//           <p className="text-xs opacity-90 mt-1">
//             Top referrer by Dec 31st wins
//           </p>
//         </div>
//       </CardHeader>

//       <CardContent className="space-y-3">
//         {/* Current User Status - Only show if they're on leaderboard */}
//         {currentUserRank && (
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-blue-900">
//                   Your Position
//                 </p>
//                 <div className="flex items-center gap-2 mt-1">
//                   <div
//                     className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeColor(
//                       currentUserRank.rank
//                     )}`}
//                   >
//                     {currentUserRank.rank}
//                   </div>
//                   <div>
//                     <p className="text-lg font-bold text-blue-900">
//                       #{currentUserRank.rank}
//                     </p>
//                     <p className="text-xs text-blue-700">
//                       {currentUserRank.totalReferrals} referrals
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <Badge className="bg-blue-600 hover:bg-blue-700">
//                 <Share2 className="h-3 w-3 mr-1" />
//                 Share
//               </Badge>
//             </div>
//           </div>
//         )}

//         {/* Leaderboard Entries */}
//         <div className="space-y-2">
//           {data.leaderboard.map((entry) => (
//             <div
//               key={entry.id}
//               className={`flex items-center gap-3 p-3 rounded-lg border ${getRankStyles(
//                 entry.rank
//               )}`}
//             >
//               {/* Rank Badge */}
//               <div
//                 className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeColor(
//                   entry.rank
//                 )}`}
//               >
//                 {entry.rank}
//               </div>

//               {/* User Info */}
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2">
//                   <p className="font-medium text-gray-900 truncate">
//                     {entry.username}
//                   </p>
//                   {entry.userId === user?.id && (
//                     <Badge
//                       variant="secondary"
//                       className="bg-blue-100 text-blue-700 text-xs"
//                     >
//                       You
//                     </Badge>
//                   )}
//                   {entry.rank === 1 && (
//                     <Badge
//                       variant="secondary"
//                       className="bg-yellow-100 text-yellow-700 text-xs"
//                     >
//                       🏆 Leading
//                     </Badge>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-1 text-sm text-gray-600">
//                   <Users className="h-3 w-3" />
//                   <span>
//                     {entry.totalReferrals} referral
//                     {entry.totalReferrals !== 1 ? "s" : ""}
//                   </span>
//                 </div>
//               </div>

//               {/* Prize indicator for #1 */}
//               {entry.rank === 1 && entry.prizeAmount && (
//                 <div className="text-right">
//                   <div className="text-sm font-semibold text-yellow-700">
//                     {formatCurrency(entry.prizeAmount)}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Progress indicator */}
//         <div className="pt-2 border-t border-gray-100">
//           <div className="flex justify-between text-xs text-gray-500 mb-1">
//             <span>Competition ends in</span>
//             <span className="font-medium">{data.prizeInfo.daysLeft} days</span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-1.5">
//             <div
//               className="bg-gradient-to-r from-green-500 to-yellow-500 h-1.5 rounded-full transition-all duration-300"
//               style={{
//                 width: `${Math.max(
//                   2,
//                   100 - (data.prizeInfo.daysLeft / 31) * 100
//                 )}%`,
//               }}
//             />
//           </div>
//         </div>

//         {/* Encouragement message */}
//         {!currentUserRank && (
//           <div className="text-center pt-2">
//             <p className="text-xs text-gray-600">
//               Share your referral link to climb the ranks!
//             </p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
