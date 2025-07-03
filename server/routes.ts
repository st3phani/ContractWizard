import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContractSchema, insertBeneficiarySchema, insertContractTemplateSchema } from "@shared/schema";
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
  
  // Replace placeholders with actual data
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (typeof value === 'object' && value !== null) {
      // Handle nested objects
      Object.keys(value).forEach(subKey => {
        const placeholder = `{{${key}.${subKey}}}`;
        populated = populated.replace(new RegExp(placeholder, 'g'), value[subKey] || '');
      });
    } else {
      const placeholder = `{{${key}}}`;
      populated = populated.replace(new RegExp(placeholder, 'g'), value || '');
    }
  });
  
  // Replace current date
  populated = populated.replace(/{{currentDate}}/g, new Date().toLocaleDateString('ro-RO'));
  
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
      
      // Generate order number
      const orderNumber = generateOrderNumber();
      
      // Validate contract data
      const validatedContract = insertContractSchema.parse({
        ...contractData,
        orderNumber,
        beneficiaryId: beneficiary.id
      });
      
      const contract = await storage.createContract(validatedContract);
      res.json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
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
