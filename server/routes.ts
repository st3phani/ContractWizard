import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContractSchema, insertBeneficiarySchema, insertContractTemplateSchema, insertCompanySettingsSchema } from "@shared/schema";
import { z } from "zod";

// Helper function to generate order numbers
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `CNT-${year}-${timestamp}`;
}

// Helper function to populate contract template
function populateContractTemplate(template: string, data: any): string {
  let populated = template;
  
  // Manual replacements with explicit patterns for all provider fields
  if (data.provider) {
    // Provider fields with {{}} format
    populated = populated.replace(/\{\{provider\.name\}\}/g, data.provider.name || '');
    populated = populated.replace(/\{\{provider\.address\}\}/g, data.provider.address || '');
    populated = populated.replace(/\{\{provider\.cui\}\}/g, data.provider.cui || '');
    populated = populated.replace(/\{\{provider\.registrationNumber\}\}/g, data.provider.registrationNumber || '');
    populated = populated.replace(/\{\{provider\.legalRepresentative\}\}/g, data.provider.legalRepresentative || '');
    populated = populated.replace(/\{\{provider\.phone\}\}/g, data.provider.phone || '');
    populated = populated.replace(/\{\{provider\.email\}\}/g, data.provider.email || '');
    
    // Provider fields with [] format (legacy support)
    populated = populated.replace(/\[Numele Companiei\]/g, data.provider.name || '');
    populated = populated.replace(/\[Adresa Companiei\]/g, data.provider.address || '');
    populated = populated.replace(/\[CIF Companie\]/g, data.provider.cui || '');
    populated = populated.replace(/\[Nr\. Registrul Comerțului\]/g, data.provider.registrationNumber || '');
    populated = populated.replace(/\[Reprezentant Legal\]/g, data.provider.legalRepresentative || '');
    populated = populated.replace(/\[Telefon Companie\]/g, data.provider.phone || '');
    populated = populated.replace(/\[Email Companie\]/g, data.provider.email || '');
  }
  
  // Manual replacements for beneficiary fields
  if (data.beneficiary) {
    // Beneficiary fields with {{}} format
    populated = populated.replace(/\{\{beneficiary\.fullName\}\}/g, data.beneficiary.fullName || '');
    populated = populated.replace(/\{\{beneficiary\.email\}\}/g, data.beneficiary.email || '');
    populated = populated.replace(/\{\{beneficiary\.phone\}\}/g, data.beneficiary.phone || '');
    populated = populated.replace(/\{\{beneficiary\.address\}\}/g, data.beneficiary.address || '');
    populated = populated.replace(/\{\{beneficiary\.cnp\}\}/g, data.beneficiary.cnp || '');
    
    // Beneficiary fields with [] format (legacy support)
    populated = populated.replace(/\[Nume Beneficiar\]/g, data.beneficiary.fullName || '');
    populated = populated.replace(/\[Email Beneficiar\]/g, data.beneficiary.email || '');
    populated = populated.replace(/\[Telefon Beneficiar\]/g, data.beneficiary.phone || '');
    populated = populated.replace(/\[Adresa Beneficiar\]/g, data.beneficiary.address || '');
    populated = populated.replace(/\[CNP Beneficiar\]/g, data.beneficiary.cnp || '');
  }
  
  // Manual replacements for contract fields
  if (data.contract) {
    // Contract fields with {{}} format
    populated = populated.replace(/\{\{contract\.value\}\}/g, data.contract.value || '');
    populated = populated.replace(/\{\{contract\.currency\}\}/g, data.contract.currency || 'RON');
    populated = populated.replace(/\{\{contract\.startDate\}\}/g, data.contract.startDate || '');
    populated = populated.replace(/\{\{contract\.endDate\}\}/g, data.contract.endDate || '');
    populated = populated.replace(/\{\{contract\.notes\}\}/g, data.contract.notes || '');
    
    // Contract fields with [] format (legacy support)
    populated = populated.replace(/\[Valoare Contract\]/g, data.contract.value || '');
    populated = populated.replace(/\[Moneda\]/g, data.contract.currency || 'RON');
    populated = populated.replace(/\[Data Start\]/g, data.contract.startDate || '');
    populated = populated.replace(/\[Data Sfârșit\]/g, data.contract.endDate || '');
    populated = populated.replace(/\[Note\]/g, data.contract.notes || '');
  }
  
  // Order number and current date (both formats)
  populated = populated.replace(/\{\{orderNumber\}\}/g, data.orderNumber || '');
  populated = populated.replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString('ro-RO'));
  populated = populated.replace(/\[Număr Comandă\]/g, data.orderNumber || '');
  populated = populated.replace(/\[Data Curentă\]/g, new Date().toLocaleDateString('ro-RO'));
  
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

  // Beneficiaries
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
        return res.status(404).json({ message: "Beneficiary not found" });
      }
      res.json(beneficiary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch beneficiary" });
    }
  });

  app.post("/api/beneficiaries", async (req, res) => {
    try {
      const beneficiaryData = insertBeneficiarySchema.parse(req.body);
      
      // Check if beneficiary already exists
      const existing = await storage.getBeneficiaryByEmail(beneficiaryData.email);
      if (existing) {
        return res.json(existing);
      }
      
      const beneficiary = await storage.createBeneficiary(beneficiaryData);
      res.json(beneficiary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid beneficiary data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create beneficiary" });
    }
  });

  app.delete("/api/beneficiaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBeneficiary(id);
      if (!deleted) {
        return res.status(404).json({ message: "Beneficiary not found" });
      }
      res.json({ message: "Beneficiary deleted successfully" });
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
      res.status(500).json({ message: "Failed to fetch contract stats" });
    }
  });

  // Contracts
  app.get("/api/contracts", async (req, res) => {
    try {
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
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
      const orderNumber = generateOrderNumber();
      
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
      const contractData = req.body;
      
      const contract = await storage.updateContract(id, contractData);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
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
      const contract = await storage.getContract(id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const populatedContent = populateContractTemplate(contract.template.content, {
        orderNumber: contract.orderNumber,
        beneficiary: contract.beneficiary,
        contract: {
          startDate: contract.startDate?.toLocaleDateString('ro-RO'),
          endDate: contract.endDate?.toLocaleDateString('ro-RO'),
          value: contract.value,
          currency: contract.currency,
          notes: contract.notes
        },
        provider: {
          name: contract.providerName,
          address: contract.providerAddress,
          phone: contract.providerPhone,
          email: contract.providerEmail,
          cui: contract.providerCui,
          registrationNumber: contract.providerRegistrationNumber,
          legalRepresentative: contract.providerLegalRepresentative,
        }
      });
      
      res.json({ content: populatedContent });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate contract preview" });
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
      
      const populatedContent = populateContractTemplate(contract.template.content, {
        orderNumber: contract.orderNumber,
        beneficiary: contract.beneficiary,
        contract: {
          startDate: contract.startDate?.toLocaleDateString('ro-RO'),
          endDate: contract.endDate?.toLocaleDateString('ro-RO'),
          value: contract.value,
          currency: contract.currency,
          notes: contract.notes
        },
        provider: {
          name: contract.providerName,
          address: contract.providerAddress,
          phone: contract.providerPhone,
          email: contract.providerEmail,
          cui: contract.providerCui,
          registrationNumber: contract.providerRegistrationNumber,
          legalRepresentative: contract.providerLegalRepresentative,
        }
      });
      
      // For now, return the text content. In a real implementation, 
      // you would use a PDF library like jsPDF or puppeteer
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="contract-${contract.orderNumber}.pdf"`);
      res.send(populatedContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF" });
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

  // Send contract email
  app.post("/api/contracts/:id/email", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { recipient, subject, message, attachPDF } = req.body;
      
      const contractToEmail = await storage.getContract(id);
      if (!contractToEmail) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // In a real implementation, you would use nodemailer here
      // For now, just update the contract status
      await storage.updateContract(id, { 
        status: "sent", 
        sentAt: new Date() 
      });
      
      res.json({ message: "Email sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
