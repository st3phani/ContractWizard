import { storage } from "./storage";

/**
 * Automatic contract status updater service
 * Updates signed contracts to "completed" status when their end date has passed
 */
export class ContractStatusUpdater {
  private static instance: ContractStatusUpdater;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): ContractStatusUpdater {
    if (!ContractStatusUpdater.instance) {
      ContractStatusUpdater.instance = new ContractStatusUpdater();
    }
    return ContractStatusUpdater.instance;
  }

  /**
   * Start the automatic status updater
   * Runs every hour to check for contracts that need status updates
   */
  public start(): void {
    if (this.intervalId) {
      console.log("Contract status updater is already running");
      return;
    }

    console.log("🕐 Starting automatic contract status updater service");
    
    // Run immediately on start
    this.checkAndUpdateContracts();
    
    // Then run every hour (3600000 ms)
    this.intervalId = setInterval(() => {
      this.checkAndUpdateContracts();
    }, 3600000);
  }

  /**
   * Stop the automatic status updater
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("🛑 Contract status updater service stopped");
    }
  }

  /**
   * Check all signed contracts and update to completed if past end date
   */
  private async checkAndUpdateContracts(): Promise<void> {
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
      } else {
        console.log("📋 No contracts needed status updates");
      }
    } catch (error) {
      console.error("❌ Error during automatic contract status update:", error);
    }
  }

  /**
   * Manual trigger for status updates (for debugging/testing)
   */
  public async manualUpdate(): Promise<void> {
    console.log("🔧 Manual contract status update triggered");
    await this.checkAndUpdateContracts();
  }
}

// Export singleton instance
export const contractStatusUpdater = ContractStatusUpdater.getInstance();