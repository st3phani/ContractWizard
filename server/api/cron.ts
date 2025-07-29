import { Router } from "express";
import { cronScheduler } from "../cron-scheduler";

const router = Router();

/**
 * Get cron scheduler status
 */
router.get("/status", (req, res) => {
  try {
    const status = cronScheduler.getStatus();
    res.json({
      success: true,
      data: status,
      message: status.isRunning ? "Cron scheduler is running" : "Cron scheduler is stopped"
    });
  } catch (error) {
    console.error("Error getting cron status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cron status",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Manually trigger contract status update (for testing)
 */
router.post("/trigger/contracts", async (req, res) => {
  try {
    await cronScheduler.manualContractUpdate();
    res.json({
      success: true,
      message: "Contract status update completed successfully"
    });
  } catch (error) {
    console.error("Manual contract update failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contract statuses",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Stop cron scheduler
 */
router.post("/stop", (req, res) => {
  try {
    cronScheduler.stop();
    res.json({
      success: true,
      message: "Cron scheduler stopped successfully"
    });
  } catch (error) {
    console.error("Error stopping cron scheduler:", error);
    res.status(500).json({
      success: false,
      message: "Failed to stop cron scheduler",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Start cron scheduler
 */
router.post("/start", (req, res) => {
  try {
    cronScheduler.start();
    res.json({
      success: true,
      message: "Cron scheduler started successfully"
    });
  } catch (error) {
    console.error("Error starting cron scheduler:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start cron scheduler",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export { router as cronRouter };