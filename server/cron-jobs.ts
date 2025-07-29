import { storage } from "./storage";

/**
 * Cron job functions for automated tasks
 * These functions are designed to be called by a cron scheduler
 */

/**
 * Update contract statuses based on end dates
 * This function should be run daily via cron
 */
export async function updateExpiredContracts(): Promise<void> {
  try {
    console.log("🕐 [CRON] Starting contract status update job...");
    
    const contracts = await storage.getContracts();
    const currentDate = new Date();
    let updatedCount = 0;

    for (const contract of contracts) {
      // Only check signed contracts with an end date
      if (contract.status?.statusCode === 'signed' && contract.endDate) {
        const contractEndDate = new Date(contract.endDate);
        
        // If current date is past the contract end date, update to completed
        if (currentDate > contractEndDate) {
          try {
            await storage.updateContractStatusById(contract.id, 4); // Status ID 4 = "completed"
            console.log(`✅ [CRON] Contract #${contract.orderNumber} updated to "Finalizat" - ended on ${contractEndDate.toLocaleDateString('ro-RO')}`);
            updatedCount++;
          } catch (error) {
            console.error(`❌ [CRON] Failed to update Contract #${contract.orderNumber}:`, error);
          }
        }
      }
    }

    if (updatedCount > 0) {
      console.log(`📋 [CRON] Contract status update completed: ${updatedCount} contracts updated to "Finalizat"`);
    } else {
      console.log("📋 [CRON] No contracts needed status updates");
    }
  } catch (error) {
    console.error("❌ [CRON] Error during contract status update:", error);
    throw error;
  }
}

/**
 * Weekly cleanup tasks
 * This function should be run weekly via cron
 */
export async function weeklyCleanup(): Promise<void> {
  try {
    console.log("🧹 [CRON] Starting weekly cleanup job...");
    
    // Add any weekly cleanup tasks here
    // For example: clean up old logs, temporary files, etc.
    
    console.log("✅ [CRON] Weekly cleanup completed");
  } catch (error) {
    console.error("❌ [CRON] Error during weekly cleanup:", error);
    throw error;
  }
}

/**
 * Monthly statistics update
 * This function should be run monthly via cron
 */
export async function monthlyStatsUpdate(): Promise<void> {
  try {
    console.log("📊 [CRON] Starting monthly statistics update...");
    
    const stats = await storage.getContractStats();
    console.log("📈 [CRON] Current statistics:", {
      total: stats.totalContracts,
      pending: stats.pendingContracts,
      signed: stats.signedContracts,
      completed: stats.completedContracts,
      reserved: stats.reservedContracts
    });
    
    console.log("✅ [CRON] Monthly statistics update completed");
  } catch (error) {
    console.error("❌ [CRON] Error during monthly statistics update:", error);
    throw error;
  }
}