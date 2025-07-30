import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendContractEmail, testEmailConnection, sendSignedContractNotification } from "./email";
import { getEmailLogs, clearEmailLogs, getLatestEmails } from "./email-log";
import { contractStatusUpdater } from "./contract-status-updater";
import { insertContractSchema, insertBeneficiarySchema, insertContractTemplateSchema, insertCompanySettingsSchema, insertSystemSettingsSchema, insertUserProfileSchema, insertContractStatusSchema, contractSigningSchema, updateSystemSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";

// Helper function to generate sequential order numbers
async function generateOrderNumber(): Promise<number> {
  const contracts = await storage.getContracts();
  const maxOrderNumber = contracts.reduce((max, contract) => {
    const orderNum = contract.orderNumber || 0;
    return Math.max(max, orderNum);
  }, 0);
  return maxOrderNumber + 1;
}

// Helper function to populate contract template with conditional logic
function populateContractTemplate(template: string, data: any): string {
  let populated = template;
  
  // Process conditional blocks first
  if (data.beneficiary) {
    const isCompany = data.beneficiary.isCompany;
    
    // Process {{#if isCompany}} blocks
    const companyIfRegex = /\{\{#if\s+isCompany\}\}([\s\S]*?)\{\{\/if\}\}/g;
    populated = populated.replace(companyIfRegex, (match, content) => {
      return isCompany ? content : '';
    });
    
    // Process {{#if isIndividual}} blocks
    const individualIfRegex = /\{\{#if\s+isIndividual\}\}([\s\S]*?)\{\{\/if\}\}/g;
    populated = populated.replace(individualIfRegex, (match, content) => {
      return !isCompany ? content : '';
    });
    
    // Process {{#unless isCompany}} blocks (opposite of isCompany)
    const unlessCompanyRegex = /\{\{#unless\s+isCompany\}\}([\s\S]*?)\{\{\/unless\}\}/g;
    populated = populated.replace(unlessCompanyRegex, (match, content) => {
      return !isCompany ? content : '';
    });
    
    // Process {{#unless isIndividual}} blocks (opposite of isIndividual) 
    const unlessIndividualRegex = /\{\{#unless\s+isIndividual\}\}([\s\S]*?)\{\{\/unless\}\}/g;
    populated = populated.replace(unlessIndividualRegex, (match, content) => {
      return isCompany ? content : '';
    });
  }
  
  // Provider fields
  if (data.provider) {
    populated = populated.replace(/\{\{provider\.name\}\}/g, data.provider.name || '');
    populated = populated.replace(/\{\{provider\.address\}\}/g, data.provider.address || '');
    populated = populated.replace(/\{\{provider\.cui\}\}/g, data.provider.cui || '');
    populated = populated.replace(/\{\{provider\.registrationNumber\}\}/g, data.provider.registrationNumber || '');
    populated = populated.replace(/\{\{provider\.legalRepresentative\}\}/g, data.provider.legalRepresentative || '');
    populated = populated.replace(/\{\{provider\.phone\}\}/g, data.provider.phone || '');
    populated = populated.replace(/\{\{provider\.email\}\}/g, data.provider.email || '');
  }
  
  // Partenery fields
  if (data.beneficiary) {
    populated = populated.replace(/\{\{beneficiary\.name\}\}/g, data.beneficiary.name || '');
    populated = populated.replace(/\{\{beneficiary\.email\}\}/g, data.beneficiary.email || '');
    populated = populated.replace(/\{\{beneficiary\.phone\}\}/g, data.beneficiary.phone || '');
    populated = populated.replace(/\{\{beneficiary\.address\}\}/g, data.beneficiary.address || '');
    populated = populated.replace(/\{\{beneficiary\.cnp\}\}/g, data.beneficiary.cnp || '');
    // Company fields for beneficiary
    populated = populated.replace(/\{\{beneficiary\.companyName\}\}/g, data.beneficiary.companyName || '');
    populated = populated.replace(/\{\{beneficiary\.companyAddress\}\}/g, data.beneficiary.companyAddress || '');
    populated = populated.replace(/\{\{beneficiary\.companyCui\}\}/g, data.beneficiary.companyCui || '');
    populated = populated.replace(/\{\{beneficiary\.companyRegistrationNumber\}\}/g, data.beneficiary.companyRegistrationNumber || '');
    populated = populated.replace(/\{\{beneficiary\.companyLegalRepresentative\}\}/g, data.beneficiary.name || '');
  }
  
  // Contract fields
  if (data.contract) {
    populated = populated.replace(/\{\{contract\.value\}\}/g, data.contract.value || '');
    populated = populated.replace(/\{\{contract\.currency\}\}/g, data.contract.currency || 'RON');
    populated = populated.replace(/\{\{contract\.startDate\}\}/g, data.contract.startDate || '');
    populated = populated.replace(/\{\{contract\.endDate\}\}/g, data.contract.endDate || '');

  }
  
  // Order number and current date
  populated = populated.replace(/\{\{orderNumber\}\}/g, data.orderNumber || '');
  populated = populated.replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString('ro-RO'));
  
  return populated;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Contract Templates
  app.get("/api/contract-templates", async (req, res) => {
    try {
      const templates = await storage.getContractTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contract templates" });
    }
  });

  app.get("/api/contract-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getContractTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Contract template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contract template" });
    }
  });

  app.post("/api/contract-templates", async (req, res) => {
    try {
      const templateData = insertContractTemplateSchema.parse(req.body);
      const template = await storage.createContractTemplate(templateData);
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contract template" });
    }
  });

  app.patch("/api/contract-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const templateData = insertContractTemplateSchema.partial().parse(req.body);
      const updatedTemplate = await storage.updateContractTemplate(id, templateData);
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Contract template not found" });
      }
      res.json(updatedTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update contract template" });
    }
  });

  app.delete("/api/contract-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContractTemplate(id);
      if (!deleted) {
        return res.status(404).json({ message: "Contract template not found" });
      }
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contract template" });
    }
  });

  // Parteneries
  app.get("/api/beneficiaries", async (req, res) => {
    try {
      const beneficiaries = await storage.getBeneficiaries();
      res.json(beneficiaries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch beneficiaries" });
    }
  });

  app.get("/api/beneficiaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const beneficiary = await storage.getBeneficiary(id);
      if (!beneficiary) {
        return res.status(404).json({ message: "Partenery not found" });
      }
      res.json(beneficiary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch beneficiary" });
    }
  });

  app.post("/api/beneficiaries", async (req, res) => {
    try {
      console.log("Received data:", req.body);
      const beneficiaryData = insertBeneficiarySchema.parse(req.body);
      console.log("Parsed data:", beneficiaryData);
      
      // Check if beneficiary already exists
      const existing = await storage.getBeneficiaryByEmail(beneficiaryData.email);
      if (existing) {
        return res.json(existing);
      }
      
      const beneficiary = await storage.createBeneficiary(beneficiaryData);
      res.json(beneficiary);
    } catch (error) {
      console.error("Error creating beneficiary:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid beneficiary data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create beneficiary" });
    }
  });

  app.put("/api/beneficiaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const beneficiaryData = req.body;
      const updatedPartenery = await storage.updateBeneficiary(id, beneficiaryData);
      if (!updatedPartenery) {
        return res.status(404).json({ message: "Partenery not found" });
      }
      res.json(updatedPartenery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid beneficiary data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update beneficiary" });
    }
  });

  app.delete("/api/beneficiaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBeneficiary(id);
      if (!deleted) {
        return res.status(404).json({ message: "Partenery not found" });
      }
      res.json({ message: "Partenery deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete beneficiary" });
    }
  });

  // Contract stats (must be before /:id route)
  app.get("/api/contracts/stats", async (req, res) => {
    try {
      const stats = await storage.getContractStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching contract stats:", error);
      res.status(500).json({ message: "Failed to fetch contract stats" });
    }
  });

  // Contracts
  app.get("/api/contracts", async (req, res) => {
    try {
      // Check for contract status updates when loading contracts
      await contractStatusUpdater.checkAndUpdateContracts();
      
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get("/api/contracts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contract = await storage.getContract(id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.post("/api/contracts", async (req, res) => {
    try {
      const { beneficiaryData, contractData } = req.body;
      
      // Validate beneficiary data
      const validatedBeneficiary = insertBeneficiarySchema.parse(beneficiaryData);
      
      // Create or get beneficiary
      let beneficiary = await storage.getBeneficiaryByEmail(validatedBeneficiary.email);
      if (!beneficiary) {
        beneficiary = await storage.createBeneficiary(validatedBeneficiary);
      }
      
      // Get company settings for auto-population
      const companySettings = await storage.getCompanySettings();
      
      // Generate order number
      const orderNumber = await generateOrderNumber();
      
      // Validate contract data with company info
      const validatedContract = insertContractSchema.parse({
        ...contractData,
        orderNumber,
        beneficiaryId: beneficiary.id,
        value: contractData.value || null,
        startDate: contractData.startDate ? new Date(contractData.startDate) : null,
        endDate: contractData.endDate ? new Date(contractData.endDate) : null,
        // Auto-populate provider/company data
        providerName: companySettings?.name || "Compania Mea SRL",
        providerAddress: companySettings?.address || "Str. Principală nr. 123, București, România",
        providerPhone: companySettings?.phone || "+40 21 123 4567",
        providerEmail: companySettings?.email || "contact@compania-mea.ro",
        providerCui: companySettings?.cui || "RO12345678",
        providerRegistrationNumber: companySettings?.registrationNumber || "J40/1234/2023",
        providerLegalRepresentative: companySettings?.legalRepresentative || "Ion Popescu",
      });
      
      // Pass custom created date if provided
      const customCreatedDate = contractData.createdDate;
      const contract = await storage.createContract(validatedContract);
      res.json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Contract validation errors:", error.errors);
        console.log("Contract data received:", req.body);
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      console.log("Contract creation error:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  app.put("/api/contracts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { beneficiaryData, contractData } = req.body;
      console.log("Full UPDATE request body:", JSON.stringify(req.body, null, 2));
      
      // Validate beneficiary data
      const validatedBeneficiary = insertBeneficiarySchema.parse(beneficiaryData);
      
      // Update or create beneficiary
      let beneficiary = await storage.getBeneficiaryByEmail(validatedBeneficiary.email);
      if (!beneficiary) {
        beneficiary = await storage.createBeneficiary(validatedBeneficiary);
      } else {
        // Update existing beneficiary
        beneficiary = await storage.updateBeneficiary(beneficiary.id, validatedBeneficiary) || beneficiary;
      }
      
      // Get company settings for auto-population
      const companySettings = await storage.getCompanySettings();
      
      // Get existing contract to preserve orderNumber
      const existingContract = await storage.getContract(id);
      if (!existingContract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Prepare update data without full validation (we're updating, not creating)
      const updateData = {
        templateId: contractData.templateId,
        beneficiaryId: beneficiary.id,
        value: contractData.value ? String(contractData.value) : null,
        currency: contractData.currency || "RON",
        startDate: contractData.startDate ? new Date(contractData.startDate) : null,
        endDate: contractData.endDate ? new Date(contractData.endDate) : null,

        createdAt: contractData.createdDate ? new Date(contractData.createdDate) : existingContract.createdAt,
        // Change status from "reserved" to "draft" (In Așteptare) when updating
        statusId: existingContract.statusId === 2 ? 1 : existingContract.statusId,
      };
      
      // Debug log the update data
      console.log("Update data being sent to database:", JSON.stringify(updateData, null, 2));
      
      // Update the contract
      console.log("Calling storage.updateContract with ID:", id, "and data:", updateData);
      const contract = await storage.updateContract(id, updateData);
      console.log("Result from storage.updateContract:", contract);
      
      if (!contract) {
        console.log("Contract update failed - contract not found");
        return res.status(404).json({ message: "Contract not found" });
      }
      
      console.log("Contract update successful, returning:", contract);
      res.json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Contract update validation errors:", error.errors);
        console.log("Contract data received:", req.body);
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      console.log("Contract update error:", error);
      res.status(500).json({ message: "Failed to update contract" });
    }
  });

  app.delete("/api/contracts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContract(id);
      if (!deleted) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json({ message: "Contract deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contract" });
    }
  });

  // Contract preview
  app.get("/api/contracts/:id/preview", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contract ID" });
      }
      
      const contract = await storage.getContract(id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      if (!contract.template) {
        return res.status(400).json({ message: "Contract has no template" });
      }
      
      if (!contract.template.content) {
        return res.status(400).json({ message: "Template has no content" });
      }
      
      // Get company settings for the latest provider data
      const companySettings = await storage.getCompanySettings();
      
      const populationData = {
        orderNumber: contract.orderNumber || 0,
        currentDate: new Date().toLocaleDateString('ro-RO'),
        beneficiary: contract.beneficiary || {},
        contract: {
          startDate: contract.startDate?.toLocaleDateString('ro-RO') || '',
          endDate: contract.endDate?.toLocaleDateString('ro-RO') || '',
          value: contract.value || '',
          currency: contract.currency || 'RON',
        },
        provider: {
          name: contract.provider?.name || '',
          address: contract.provider?.address || '',
          phone: contract.provider?.phone || '',
          email: contract.provider?.email || '',
          cui: contract.provider?.cui || '',
          registrationNumber: contract.provider?.registrationNumber || '',
          legalRepresentative: contract.provider?.legalRepresentative || '',
        }
      };
      
      console.log('Contract ID:', id);
      console.log('Contract found:', !!contract);
      console.log('Template content:', contract.template.content);
      console.log('Population data:', JSON.stringify(populationData, null, 2));
      
      const populatedContent = populateContractTemplate(contract.template.content, populationData);
      
      console.log('Populated result:', populatedContent);
      
      res.json({ content: populatedContent });
    } catch (error) {
      console.error('Preview error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to generate contract preview: ${errorMessage}` });
    }
  });

  // Contract PDF download
  app.get("/api/contracts/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contract = await storage.getContract(id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const { populateTemplate, generatePDF } = await import('../utils/pdfGenerator');
      
      if (!contract.template?.content || !contract.beneficiary) {
        return res.status(400).json({ message: "Contract template or beneficiary data missing" });
      }

      const populatedContent = populateTemplate(contract.template.content, {
        orderNumber: contract.orderNumber,
        currentDate: new Date().toLocaleDateString('ro-RO'),
        beneficiary: {
          name: contract.beneficiary.name,
          email: contract.beneficiary.email,
          phone: contract.beneficiary.phone || '',
          address: contract.beneficiary.address || '',
          cnp: contract.beneficiary.cnp || '',
          companyName: contract.beneficiary.companyName || '',
          companyAddress: contract.beneficiary.companyAddress || '',
          companyCui: contract.beneficiary.companyCui || '',
          companyRegistrationNumber: contract.beneficiary.companyRegistrationNumber || '',
          companyLegalRepresentative: contract.beneficiary.name || '',
          isCompany: contract.beneficiary.isCompany
        },
        contract: {
          startDate: contract.startDate?.toLocaleDateString('ro-RO') || '',
          endDate: contract.endDate?.toLocaleDateString('ro-RO') || '',
          value: contract.value || '',
          currency: contract.currency || '',
          notes: contract.notes || '',
        },
        provider: {
          name: contract.provider?.name || '',
          address: contract.provider?.address || '',
          phone: contract.provider?.phone || '',
          email: contract.provider?.email || '',
          cui: contract.provider?.cui || '',
          registrationNumber: contract.provider?.registrationNumber || '',
          legalRepresentative: contract.provider?.legalRepresentative || '',
        }
      });
      
      const pdfBuffer = generatePDF(populatedContent, contract);
      
      // Generate filename based on contract status
      let filename: string;
      if (contract.status?.statusCode === 'signed' && contract.signedToken) {
        filename = `CTR_${contract.orderNumber}_${contract.signedToken}.pdf`;
      } else {
        filename = `contract-${contract.orderNumber}.pdf`;
      }
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ message: "Nu s-a putut genera PDF-ul" });
    }
  });

  // Company Settings
  app.get("/api/company-settings", async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company settings" });
    }
  });

  app.put("/api/company-settings", async (req, res) => {
    try {
      const validatedSettings = insertCompanySettingsSchema.parse(req.body);
      const settings = await storage.updateCompanySettings(validatedSettings);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company settings" });
    }
  });

  // Reserve contract
  app.post("/api/contracts/reserve", async (req, res) => {
    try {
      const { contractData } = req.body;
      const companySettings = await storage.getCompanySettings();
      if (!companySettings) {
        return res.status(400).json({ message: "Company settings not configured" });
      }

      const orderNumber = await storage.getNextOrderNumber();
      const customCreatedDate = contractData?.createdDate;
      const contract = await storage.reserveContract(orderNumber, companySettings, customCreatedDate);
      res.json(contract);
    } catch (error) {
      console.error("Reserve contract error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send contract email
  app.post("/api/contracts/:id/email", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { recipient, subject, message, attachPDF } = req.body;
      
      const contractToEmail = await storage.getContract(id);
      if (!contractToEmail) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Generate signing token if not exists
      let signingToken = contractToEmail.signingToken;
      if (!signingToken) {
        signingToken = nanoid(32);
        await storage.updateContract(id, { 
          signingToken: signingToken 
        });
      }
      
      // Log signing link for debugging
      console.log(`🔗 CONTRACT SIGNING LINK: https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/sign-contract/${signingToken}`);
      
      // Send actual email using nodemailer
      await sendContractEmail({
        to: recipient,
        subject,
        message,
        contract: {
          ...contractToEmail,
          signingToken: signingToken
        }
      });
      
      // Update contract status to "sent"
      await storage.updateContract(id, { 
        statusId: 5, 
        sentAt: new Date() 
      });
      
      res.json({ 
        message: "Email sent successfully",
        testingMode: process.env.NODE_ENV === 'development',
        note: "În modul de dezvoltare, email-urile sunt logged în consolă și fișier"
      });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Test email connection
  app.get("/api/email/test", async (req, res) => {
    try {
      const isReady = await testEmailConnection();
      res.json({ 
        status: isReady ? 'ready' : 'error',
        testingMode: process.env.NODE_ENV === 'development',
        message: isReady ? 'Email system is ready (Development Mode - Console Logging)' : 'Email system has errors'
      });
    } catch (error) {
      res.status(500).json({ message: "Email test failed" });
    }
  });

  // Get email logs for testing
  app.get("/api/email/logs", async (req, res) => {
    try {
      const logs = getLatestEmails(20);
      res.json({
        logs,
        total: logs.length,
        testingMode: process.env.NODE_ENV === 'development'
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email logs" });
    }
  });

  // Clear email logs
  app.delete("/api/email/logs", async (req, res) => {
    try {
      clearEmailLogs();
      res.json({ message: "Email logs cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear email logs" });
    }
  });

  // Contract status management routes
  app.get("/api/cron/status", (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          isRunning: true,
          type: "on-demand",
          updateInterval: "1 hour rate limit"
        },
        message: "Contract status updater is active (on-demand mode)"
      });
    } catch (error) {
      console.error("Error getting status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/cron/trigger/contracts", async (req, res) => {
    try {
      const updatedCount = await contractStatusUpdater.forceUpdate();
      res.json({
        success: true,
        message: `Contract status update completed successfully. Updated ${updatedCount} contracts.`
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

  // Get contract for signing (public endpoint)
  app.get("/api/contracts/sign/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const contract = await storage.getContractBySigningToken(token);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found or invalid signing link" });
      }

      if (contract.signedAt) {
        return res.status(400).json({ message: "Contract has already been signed" });
      }

      res.json(contract);
    } catch (error) {
      console.error("Get contract for signing error:", error);
      res.status(500).json({ message: "Failed to get contract" });
    }
  });

  // Get signed contract by signed token (public endpoint)
  app.get("/api/contracts/signed/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const contract = await storage.getContractBySignedToken(token);
      
      if (!contract) {
        return res.status(404).json({ message: "Signed contract not found" });
      }

      // Auto-update contract status to "completed" (Finalizat) when contract period has ended
      // Only update if contract is currently "signed" and past the end date
      if (contract.status?.statusCode === 'signed' && contract.endDate) {
        const currentDate = new Date();
        const contractEndDate = new Date(contract.endDate);
        
        // Check if current date is past the contract end date
        if (currentDate > contractEndDate) {
          try {
            await storage.updateContractStatusById(contract.id, 4); // Status ID 4 = "completed" (Finalizat)
            console.log(`✅ Contract #${contract.orderNumber} status automatically updated to "Finalizat" - contract period ended on ${contractEndDate.toLocaleDateString('ro-RO')}`);
            
            // Get the updated contract with new status
            const updatedContract = await storage.getContract(contract.id);
            if (updatedContract) {
              return res.json(updatedContract);
            }
          } catch (updateError) {
            console.error("Failed to auto-update contract status:", updateError);
            // Return original contract if status update fails
          }
        }
      }

      res.json(contract);
    } catch (error) {
      console.error("Get signed contract error:", error);
      res.status(500).json({ message: "Failed to get signed contract" });
    }
  });

  // Sign contract (public endpoint)
  app.post("/api/contracts/sign/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const validation = contractSigningSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid signing data",
          errors: validation.error.issues 
        });
      }

      const contract = await storage.getContractBySigningToken(token);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found or invalid signing link" });
      }

      if (contract.signedAt) {
        return res.status(400).json({ message: "Contract has already been signed" });
      }

      // Get client IP address
      const clientIp = req.ip || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress ||
                      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                      'Unknown';

      // Sign the contract
      await storage.signContract(contract.id, {
        signedBy: validation.data.signedBy,
        signedAt: new Date(),
        signedIp: clientIp
      });

      // Get the complete signed contract with all relations
      const signedContract = await storage.getContract(contract.id);
      if (!signedContract) {
        return res.status(500).json({ message: "Failed to retrieve signed contract" });
      }

      // Send email notifications after successful signing
      try {
        // Get user profile for admin email
        const userProfile = await storage.getUserProfile();
        const adminEmail = userProfile?.email || 'admin@contractmanager.ro';

        // Send confirmation email to beneficiary
        await sendSignedContractNotification({
          contract: signedContract,
          recipientType: 'beneficiary'
        });

        // Send notification email to administrator
        await sendSignedContractNotification({
          contract: signedContract,
          recipientType: 'administrator',
          adminEmail: adminEmail
        });

        console.log('✅ Signed contract notifications sent to beneficiary and administrator');
      } catch (emailError) {
        console.error('❌ Failed to send signed contract notifications:', emailError);
        // Don't fail the signing process if email fails
      }

      res.json({ 
        message: "Contract signed successfully",
        contract: signedContract
      });
    } catch (error) {
      console.error("Sign contract error:", error);
      res.status(500).json({ message: "Failed to sign contract" });
    }
  });

  // System settings routes
  app.get("/api/system-settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      // Force non-ISO format to prevent TanStack Query auto-parsing
      const response = {
        ...settings,
        updatedAt: typeof settings?.updatedAt === 'string' 
          ? settings.updatedAt 
          : '2025-07-30 00:00:00'
      };
      res.json(response);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ error: "Failed to fetch system settings" });
    }
  });

  app.put("/api/system-settings", async (req, res) => {
    try {
      // Use the custom schema that accepts the old format
      const validatedData = updateSystemSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateSystemSettings(validatedData);
      // Force non-ISO format to prevent TanStack Query auto-parsing  
      const response = {
        ...updatedSettings,
        updatedAt: typeof updatedSettings?.updatedAt === 'string' 
          ? updatedSettings.updatedAt 
          : '2025-07-30 00:00:00'
      };
      res.json(response);
    } catch (error) {
      console.error("Error updating system settings:", error);
      res.status(500).json({ error: "Failed to update system settings" });
    }
  });



  // User Profiles
  app.get("/api/user-profile", async (req, res) => {
    try {
      const profile = await storage.getUserProfile();
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put("/api/user-profile", async (req, res) => {
    try {
      const result = insertUserProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid profile data", errors: result.error.issues });
      }
      
      const profile = await storage.updateUserProfile(result.data);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  app.put("/api/user-profile/password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      const result = await storage.updateUserPassword(currentPassword, newPassword);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Contract Statuses routes
  app.get("/api/contract-statuses", async (req, res) => {
    try {
      const statuses = await storage.getContractStatuses();
      res.json(statuses);
    } catch (error) {
      console.error("Error fetching contract statuses:", error);
      res.status(500).json({ error: "Failed to fetch contract statuses" });
    }
  });

  app.post("/api/contract-statuses", async (req, res) => {
    try {
      const validatedData = insertContractStatusSchema.parse(req.body);
      const status = await storage.createContractStatus(validatedData);
      res.json(status);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status data", errors: error.errors });
      }
      console.error("Error creating contract status:", error);
      res.status(500).json({ error: "Failed to create contract status" });
    }
  });

  app.put("/api/contract-statuses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertContractStatusSchema.parse(req.body);
      const status = await storage.updateContractStatus(id, validatedData);
      if (!status) {
        return res.status(404).json({ message: "Contract status not found" });
      }
      res.json(status);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status data", errors: error.errors });
      }
      console.error("Error updating contract status:", error);
      res.status(500).json({ error: "Failed to update contract status" });
    }
  });

  app.delete("/api/contract-statuses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContractStatus(id);
      if (!deleted) {
        return res.status(404).json({ message: "Contract status not found" });
      }
      res.json({ message: "Contract status deleted successfully" });
    } catch (error) {
      console.error("Error deleting contract status:", error);
      res.status(500).json({ error: "Failed to delete contract status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
