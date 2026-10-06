// lib/scheduled-tasks.ts
import { CampaignAutomation } from "./campaign-automation";

export async function runScheduledTasks() {
  try {
    // Update campaign status every hour
    await CampaignAutomation.updateCampaignStatus();

    // Cleanup completed campaigns daily
    await CampaignAutomation.cleanupCompletedCampaigns();

    console.log("Scheduled tasks completed successfully");
  } catch (error) {
    console.error("Error running scheduled tasks:", error);
  }
}
