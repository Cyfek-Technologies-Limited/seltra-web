// // lib/fraud-detection.ts - FIXED
// import { prisma } from "./db.cjs";
// import { ImageProcessingService } from "./image-processing";

// export class FraudDetectionSystem {
//   static async checkForFraud(
//     publisherId: string,
//     campaignId: string,
//     imageUrl: string,
//     proofUrl: string,
//     viewsCount: number
//   ): Promise<{
//     isFraud: boolean;
//     reason?: string;
//     confidence: number;
//   }> {
//     const checks = await Promise.all([
//       this.checkScreenshotAuthenticity(imageUrl, campaignId),
//       this.checkPublisherHistory(publisherId),
//       this.checkClaimPattern(publisherId),
//     ]);

//     const fraudChecks = checks.filter((check) => check.isFraud);
//     const totalConfidence = fraudChecks.reduce(
//       (sum, check) => sum + check.confidence,
//       0
//     );

//     return {
//       isFraud: fraudChecks.length > 0,
//       reason: fraudChecks.length > 0 ? fraudChecks[0].reason : undefined,
//       confidence: totalConfidence / Math.max(fraudChecks.length, 1),
//     };
//   }

//   private static async checkScreenshotAuthenticity(
//     imageUrl: string,
//     campaignId: string
//   ) {
//     // For now, skip screenshot validation to avoid errors
//     // You can implement this later when you have the image processing service ready
//     return {
//       isFraud: false,
//       confidence: 0,
//     };
//   }

//   private static async checkPublisherHistory(publisherId: string) {
//     const strikes = await prisma.publisherStrike.count({
//       where: {
//         publisherId,
//         resolvedAt: null,
//         severity: "STRIKE",
//       },
//     });

//     return {
//       isFraud: strikes >= 2, // 2 strikes already, this would be 3rd
//       reason: strikes >= 2 ? "Publisher has multiple strikes" : undefined,
//       confidence: strikes * 33.33, // 33.33% per strike
//     };
//   }

//   private static async checkClaimPattern(publisherId: string) {
//     // Check if publisher is claiming too many campaigns too quickly
//     const recentClaims = await prisma.publisherEarning.count({
//       where: {
//         publisherId,
//         claimedAt: {
//           gte: new Date(Date.now() - 1 * 60 * 60 * 1000), // Last 1 hour
//         },
//       },
//     });

//     return {
//       isFraud: recentClaims > 5, // More than 5 claims per hour
//       reason: recentClaims > 5 ? "Suspicious claim frequency" : undefined,
//       confidence: Math.min(recentClaims * 20, 100), // 20% per extra claim
//     };
//   }

//   static async issueStrike(
//     publisherId: string,
//     reason: string,
//     evidence: any = null
//   ) {
//     try {
//       const strike = await prisma.publisherStrike.create({
//         data: {
//           publisherId,
//           reason,
//           severity: "STRIKE",
//           evidence,
//         },
//       });

//       // Check if publisher should be deactivated
//       const strikeCount = await prisma.publisherStrike.count({
//         where: {
//           publisherId,
//           severity: "STRIKE",
//           resolvedAt: null,
//         },
//       });

//       if (strikeCount >= 3) {
//         await this.deactivatePublisher(publisherId);
//       }

//       return strike;
//     } catch (error) {
//       console.error("❌ Error issuing strike:", error);
//       throw error;
//     }
//   }

//   private static async deactivatePublisher(publisherId: string) {
//     try {
//       // First, find the publisher by their ID to get the userId
//       const publisher = await prisma.publisher.findUnique({
//         where: { id: publisherId },
//       });

//       if (!publisher) {
//         console.error(`❌ Publisher not found with id: ${publisherId}`);
//         return;
//       }

//       // Deactivate publisher account using userId
//       await prisma.publisher.update({
//         where: { userId: publisher.userId },
//         data: { verified: false },
//       });

//       // Notify admin
//       await this.notifyAdmin(
//         `Publisher ${publisherId} (user: ${publisher.userId}) deactivated due to 3 strikes`
//       );
//     } catch (error) {
//       console.error("❌ Error deactivating publisher:", error);
//       throw error;
//     }
//   }

//   private static async notifyAdmin(message: string) {
//     // Implement admin notification (email, Slack, etc.)
//     console.log(`ADMIN ALERT: ${message}`);
//     // You can integrate with your notification system here
//   }
// }
