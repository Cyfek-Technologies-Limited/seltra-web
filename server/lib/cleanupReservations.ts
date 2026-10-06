// lib/cleanupReservations.ts
import { prisma } from "./db.cjs";

export async function cleanupExpiredReservations() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await prisma.campaignReservation.deleteMany({
      where: {
        OR: [
          // Delete expired reservations that were never used
          { expiresAt: { lt: new Date() } },
          // Delete completed reservations older than 24 hours
          {
            status: "COMPLETED",
            completedAt: { lt: twentyFourHoursAgo },
          },
        ],
      },
    });

    console.log(`🧹 Cleaned up ${result.count} expired reservations`);
    return result.count;
  } catch (error) {
    console.error("🔴 Cleanup error:", error);
    return 0;
  }
}
