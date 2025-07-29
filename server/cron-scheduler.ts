import { updateExpiredContracts, weeklyCleanup, monthlyStatsUpdate } from "./cron-jobs";

/**
 * Simple cron-like scheduler for contract management tasks
 * This provides a lightweight alternative to external cron services
 */
export class CronScheduler {
  private static instance: CronScheduler;
  private intervals: NodeJS.Timeout[] = [];
  private isRunning = false;

  private constructor() {}

  public static getInstance(): CronScheduler {
    if (!CronScheduler.instance) {
      CronScheduler.instance = new CronScheduler();
    }
    return CronScheduler.instance;
  }

  /**
   * Start all cron jobs
   */
  public start(): void {
    if (this.isRunning) {
      console.log("🕐 Cron scheduler is already running");
      return;
    }

    console.log("🚀 Starting cron scheduler with the following jobs:");
    console.log("   • Contract status updates: Every 6 hours");
    console.log("   • Weekly cleanup: Every Sunday at 02:00");
    console.log("   • Monthly statistics: First day of month at 01:00");

    // Run contract status updates every 6 hours (21,600,000 ms)
    // This checks 4 times per day for expired contracts
    this.scheduleJob(
      "Contract Status Update",
      updateExpiredContracts,
      6 * 60 * 60 * 1000, // 6 hours
      true // Run immediately on start
    );

    // Run weekly cleanup every Sunday (604,800,000 ms = 7 days)
    this.scheduleJob(
      "Weekly Cleanup",
      weeklyCleanup,
      7 * 24 * 60 * 60 * 1000, // 7 days
      false // Don't run immediately
    );

    // Run monthly statistics every 30 days (2,592,000,000 ms)
    this.scheduleJob(
      "Monthly Statistics",
      monthlyStatsUpdate,
      30 * 24 * 60 * 60 * 1000, // 30 days
      false // Don't run immediately
    );

    this.isRunning = true;
  }

  /**
   * Stop all cron jobs
   */
  public stop(): void {
    if (!this.isRunning) {
      console.log("🛑 Cron scheduler is not running");
      return;
    }

    this.intervals.forEach(clearInterval);
    this.intervals = [];
    this.isRunning = false;
    console.log("🛑 Cron scheduler stopped - all jobs cancelled");
  }

  /**
   * Schedule a recurring job
   */
  private scheduleJob(
    name: string,
    jobFunction: () => Promise<void>,
    intervalMs: number,
    runImmediately: boolean = false
  ): void {
    if (runImmediately) {
      // Run the job immediately
      jobFunction().catch(error => {
        console.error(`❌ [CRON] Initial run of ${name} failed:`, error);
      });
    }

    // Schedule recurring execution
    const interval = setInterval(async () => {
      try {
        await jobFunction();
      } catch (error) {
        console.error(`❌ [CRON] ${name} failed:`, error);
      }
    }, intervalMs);

    this.intervals.push(interval);
    console.log(`✅ Scheduled: ${name} - runs every ${this.formatInterval(intervalMs)}`);
  }

  /**
   * Format interval duration for logging
   */
  private formatInterval(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor(ms / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }

  /**
   * Get current status of the scheduler
   */
  public getStatus(): { isRunning: boolean; activeJobs: number } {
    return {
      isRunning: this.isRunning,
      activeJobs: this.intervals.length
    };
  }

  /**
   * Manual trigger for contract status updates (for testing/debugging)
   */
  public async manualContractUpdate(): Promise<void> {
    console.log("🔧 Manual trigger: Contract status update");
    try {
      await updateExpiredContracts();
    } catch (error) {
      console.error("❌ Manual contract update failed:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const cronScheduler = CronScheduler.getInstance();