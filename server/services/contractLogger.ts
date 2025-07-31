import { db } from "../db";
import { contractLoggerHistory, contractLoggerActionCodes } from "@shared/schema";
import type { InsertContractLoggerHistory } from "@shared/schema";

export class ContractLoggerService {
  static async initializeActionCodes() {
    const actionCodes = [
      {
        actionCode: "contract_reserved",
        actionName: "Contract Reserved",
        description: "Contract number was reserved for a new contract"
      },
      {
        actionCode: "contract_created",
        actionName: "Contract Created",
        description: "Contract was successfully created"
      },
      {
        actionCode: "contract_edited",
        actionName: "Contract Edited",
        description: "Contract was modified/updated"
      },
      {
        actionCode: "contract_sent_for_signing",
        actionName: "Contract Sent for Signing",
        description: "Contract was sent to partner for digital signing"
      },
      {
        actionCode: "signing_page_viewed",
        actionName: "Signing Page Viewed",
        description: "Partner accessed the contract signing page"
      },
      {
        actionCode: "contract_preview_accessed",
        actionName: "Contract Preview Accessed",
        description: "Contract preview was viewed"
      },
      {
        actionCode: "contract_signed",
        actionName: "Contract Signed",
        description: "Contract was digitally signed by partner"
      },
      {
        actionCode: "signed_contract_sent",
        actionName: "Signed Contract Sent",
        description: "Signed contract was sent via email"
      },
      {
        actionCode: "signed_contract_page_viewed",
        actionName: "Signed Contract Page Viewed",
        description: "Signed contract page was accessed"
      },
      {
        actionCode: "contract_pdf_downloaded",
        actionName: "Contract PDF Downloaded",
        description: "Contract PDF was downloaded"
      }
    ];

    for (const actionCodeData of actionCodes) {
      try {
        await db.insert(contractLoggerActionCodes)
          .values(actionCodeData)
          .onConflictDoNothing();
      } catch (error) {
        console.log(`Action code ${actionCodeData.actionCode} already exists or error occurred:`, error);
      }
    }
  }

  static async logAction(data: {
    contractId: number;
    partnerId?: number;
    actionCode: string;
    ipAddress?: string;
    userAgent?: string;
    additionalData?: object;
  }) {
    try {
      const logEntry: InsertContractLoggerHistory = {
        contractId: data.contractId,
        partnerId: data.partnerId || null,
        actionCode: data.actionCode,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        additionalData: data.additionalData ? JSON.stringify(data.additionalData) : null,
      };

      const [result] = await db.insert(contractLoggerHistory)
        .values(logEntry)
        .returning();

      console.log(`📊 Contract action logged: ${data.actionCode} for contract ${data.contractId}`);
      return result;
    } catch (error) {
      console.error("Error logging contract action:", error);
      throw error;
    }
  }

  static async getContractHistory(contractId: number) {
    console.log(`🔍 Getting contract history for contract ID: ${contractId}`);
    const result = await db.query.contractLoggerHistory.findMany({
      where: (history, { eq }) => eq(history.contractId, contractId),
      with: {
        partner: true,
        actionCode: true,
      },
      orderBy: (history, { desc }) => [desc(history.createdAt)],
    });
    console.log(`📊 Found ${result.length} history entries for contract ${contractId}`);
    return result;
  }

  static async getAllHistory(limit: number = 100) {
    return await db.query.contractLoggerHistory.findMany({
      with: {
        contract: true,
        partner: true,
        actionCode: true,
      },
      orderBy: (history, { desc }) => [desc(history.createdAt)],
      limit,
    });
  }

  static getClientIP(req: any): string {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           'unknown';
  }

  static getUserAgent(req: any): string {
    return req.headers['user-agent'] || 'unknown';
  }
}