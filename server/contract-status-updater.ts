import { storage } from "./storage";

/**
 * Simple contract status updater that runs on-demand
 * This is a lightweight alternative to the heavy cron scheduler
 */
export class ContractStatusUpdater {
  private static instance: ContractStatusUpdater;
  private lastUpdateTime: number = 0;
  private readonly UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

  private constructor() {}

  public static getInstance(): ContractStatusUpdater {
    if (!ContractStatusUpdater.instance) {
      ContractStatusUpdater.instance = new ContractStatusUpdater();
    }
    return ContractStatusUpdater.instance;
  }

  /**
   * Check if contracts need status updates (rate-limited to once per hour)
   */
  public async checkAndUpdateContracts(): Promise<void> {
    const now = Date.now();
    
    // Rate limiting - only run once per hour
    if (now - this.lastUpdateTime < this.UPDATE_INTERVAL) {
      return;
    }

    try {
      console.log("🔍 Checking contracts for automatic status updates...");
      
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
              console.log(`✅ Auto-updated Contract #${contract.orderNumber} to "Finalizat" - ended on ${contractEndDate.toLocaleDateString('ro-RO')}`);
              updatedCount++;
            } catch (error) {
              console.error(`❌ Failed to update Contract #${contract.orderNumber}:`, error);
            }
          }
        }
      }

      if (updatedCount > 0) {
        console.log(`📋 Contract status update completed: ${updatedCount} contracts updated to "Finalizat"`);
      }

      this.lastUpdateTime = now;
    } catch (error) {
      console.error("❌ Error during contract status update:", error);
    }
  }

  /**
   * Force update contracts immediately (ignoring rate limit)
   */
  public async forceUpdate(): Promise<number> {
    try {
      console.log("🔧 Forcing contract status update...");
      
      const contracts = await storage.getContracts();
      const currentDate = new Date();
      let updatedCount = 0;

      for (const contract of contracts) {
        if (contract.status?.statusCode === 'signed' && contract.endDate) {
          const contractEndDate = new Date(contract.endDate);
          
          if (currentDate > contractEndDate) {
            try {
              await storage.updateContractStatusById(contract.id, 4);
              console.log(`✅ Force-updated Contract #${contract.orderNumber} to "Finalizat"`);
              updatedCount++;
            } catch (error) {
              console.error(`❌ Failed to force-update Contract #${contract.orderNumber}:`, error);
            }
          }
        }
      }

      this.lastUpdateTime = Date.now();
      return updatedCount;
    } catch (error) {
      console.error("❌ Error during forced contract status update:", error);
      return 0;
    }
  }
}

// Export singleton instance
export const contractStatusUpdater = ContractStatusUpdater.getInstance();