import { db } from "../db";
import { contractLoggerActionCodes } from "@shared/schema";

const actionCodes = [
  { actionCode: "contract_reserved", actionName: "Contract Reserved", description: "Contract has been reserved" },
  { actionCode: "contract_created", actionName: "Contract Created", description: "Contract has been created" },
  { actionCode: "contract_edited", actionName: "Contract Edited", description: "Contract has been edited" },
  { actionCode: "contract_sent_for_signing", actionName: "Contract Sent for Signing", description: "Contract has been sent for signing" },
  { actionCode: "signing_page_viewed", actionName: "Signing Page Viewed", description: "Contract signing page has been viewed" },
  { actionCode: "contract_preview_accessed", actionName: "Contract Preview Accessed", description: "Contract preview has been accessed" },
  { actionCode: "contract_signed", actionName: "Contract Signed", description: "Contract has been signed" },
  { actionCode: "signed_contract_sent", actionName: "Signed Contract Sent", description: "Signed contract notifications have been sent" },
  { actionCode: "signed_contract_page_viewed", actionName: "Signed Contract Page Viewed", description: "Signed contract page has been viewed" },
  { actionCode: "contract_pdf_downloaded", actionName: "Contract PDF Downloaded", description: "Contract PDF has been downloaded" }
];

export async function initializeContractLoggerActionCodes() {
  try {
    console.log("🔧 Initializing contract logger action codes...");
    
    // Check if action codes already exist
    const existingCodes = await db.select().from(contractLoggerActionCodes);
    
    if (existingCodes.length === 0) {
      // Insert all action codes
      await db.insert(contractLoggerActionCodes).values(actionCodes);
      console.log("✅ Contract logger action codes initialized successfully");
    } else {
      console.log("📋 Contract logger action codes already exist");
    }
  } catch (error) {
    console.error("❌ Failed to initialize contract logger action codes:", error);
  }
}