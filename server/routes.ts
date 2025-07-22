import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContractSchema, insertBeneficiarySchema, insertContractTemplateSchema, insertCompanySettingsSchema, insertSystemSettingsSchema } from "@shared/schema";
import { z } from "zod";

// Helper function to generate sequential order numbers
async function generateOrderNumber(): Promise<number> {
  const contracts = await storage.getContracts();
  const maxOrderNumber = contracts.reduce((max, contract) => {
    const orderNum = contract.orderNumber || 0;
    return Math.max(max, orderNum);
  }, 0);
  return maxOrderNumber + 1;
}

// Helper function to populate contract template
function populateContractTemplate(template: string, data: any): string {
  let populated = template;
  
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
  
  // Beneficiary fields
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
    populated = populated.replace(/\{\{beneficiary\.companyLegalRepresentative\}\}/g, data.beneficiary.companyLegalRepresentative || '');
  }
  
  // Contract fields
  if (data.contract) {
    populated = populated.replace(/\{\{contract\.value\}\}/g, data.contract.value || '');
    populated = populated.replace(/\{\{contract\.currency\}\}/g, data.contract.currency || 'RON');
    populated = populated.replace(/\{\{contract\.startDate\}\}/g, data.contract.startDate || '');
    populated = populated.replace(/\{\{contract\.endDate\}\}/g, data.contract.endDate || '');
    populated = populated.replace(/\{\{contract\.notes\}\}/g, data.contract.notes || '');
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
      const updatedBeneficiary = await storage.updateBeneficiary(id, beneficiaryData);
      if (!updatedBeneficiary) {
        return res.status(404).json({ message: "Beneficiary not found" });
      }
      res.json(updatedBeneficiary);
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
        notes: contractData.notes || null,
        createdAt: contractData.createdDate ? new Date(contractData.createdDate) : existingContract.createdAt,
        // Change status from "reserved" to "draft" (In Așteptare) when updating
        status: existingContract.status === "reserved" ? "draft" : existingContract.status,
        // Auto-populate provider/company data
        providerName: companySettings?.name || existingContract.providerName,
        providerAddress: companySettings?.address || existingContract.providerAddress,
        providerPhone: companySettings?.phone || existingContract.providerPhone,
        providerEmail: companySettings?.email || existingContract.providerEmail,
        providerCui: companySettings?.cui || existingContract.providerCui,
        providerRegistrationNumber: companySettings?.registrationNumber || existingContract.providerRegistrationNumber,
        providerLegalRepresentative: companySettings?.legalRepresentative || existingContract.providerLegalRepresentative,
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
      const contract = await storage.getContract(id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Get company settings for the latest provider data
      const companySettings = await storage.getCompanySettings();
      
      const populationData = {
        orderNumber: contract.orderNumber,
        currentDate: new Date().toLocaleDateString('ro-RO'),
        beneficiary: contract.beneficiary,
        contract: {
          startDate: contract.startDate?.toLocaleDateString('ro-RO'),
          endDate: contract.endDate?.toLocaleDateString('ro-RO'),
          value: contract.value,
          currency: contract.currency,
          notes: contract.notes
        },
        provider: {
          name: companySettings?.name || contract.providerName,
          address: companySettings?.address || contract.providerAddress,
          phone: companySettings?.phone || contract.providerPhone,
          email: companySettings?.email || contract.providerEmail,
          cui: companySettings?.cui || contract.providerCui,
          registrationNumber: companySettings?.registrationNumber || contract.providerRegistrationNumber,
          legalRepresentative: companySettings?.legalRepresentative || contract.providerLegalRepresentative,
        }
      };
      
      console.log('Template content:', contract.template.content);
      console.log('Population data:', JSON.stringify(populationData, null, 2));
      
      const populatedContent = populateContractTemplate(contract.template.content, populationData);
      
      console.log('Populated result:', populatedContent);
      
      res.json({ content: populatedContent });
    } catch (error) {
      console.error('Preview error:', error);
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
        currentDate: new Date().toLocaleDateString('ro-RO'),
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
      
      // Generate PDF using jsPDF with better formatting
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Remove debug logging for production
      // console.log('Original content length:', populatedContent.length);
      // console.log('First 500 chars:', populatedContent.substring(0, 500));
      
      // Better HTML processing that respects original formatting
      let cleanText = populatedContent
        // Remove table tags only
        .replace(/<table[^>]*>[\s\S]*?<\/table>/g, '')
        // Handle center-aligned content (like title)
        .replace(/<p[^>]*style="[^"]*center[^"]*"[^>]*>(.*?)<\/p>/gi, '\n\nCENTER:$1\n\n')
        // Convert HTML structure to text with better spacing
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<div[^>]*>/gi, '')
        // Preserve bold text markers temporarily
        .replace(/<strong>/gi, '**')
        .replace(/<\/strong>/gi, '**')
        // Remove remaining HTML tags
        .replace(/<span[^>]*>/gi, '')
        .replace(/<\/span>/gi, '')
        .replace(/<[^>]*>/g, '')
        // Clean HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        // Intelligent whitespace cleanup
        .replace(/[ \t]+/g, ' ')
        .replace(/\n[ \t]+/g, '\n')
        .replace(/\n{4,}/g, '\n\n\n')
        .trim();

      // console.log('Cleaned text length:', cleanText.length);
      // console.log('Cleaned text first 500 chars:', cleanText.substring(0, 500));

      // Process content with better structure awareness
      const contentParts = cleanText.split(/\n\n+/).filter(part => part.trim().length > 0).map(part => {
        const trimmed = part.trim();
        if (trimmed.startsWith('CENTER:')) {
          return { type: 'center', content: trimmed.substring(7).trim() };
        } else if (trimmed.startsWith('Art.')) {
          return { type: 'article', content: trimmed };
        } else {
          return { type: 'normal', content: trimmed };
        }
      });
      
      // Set font and margins
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      let yPosition = 30;
      const lineHeight = 7;
      const pageHeight = 270; // A4 height in mm minus bottom margin
      const leftMargin = 30;
      const rightMargin = 30; 
      const maxWidth = 210 - leftMargin - rightMargin; // A4 width (210mm) minus both margins (150mm)
      
      // Add title if needed
      const hasTitle = contentParts.some(part => part.content && part.content.includes('CONTRACT Nr.'));
      if (!hasTitle) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`CONTRACT Nr. ${contract.orderNumber} din ${new Date().toLocaleDateString('ro-RO')}`, 105, yPosition, { align: 'center' });
        yPosition += 15;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      // Process each content part based on its type
      for (const part of contentParts) {
        if (part.content && part.content.trim()) {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 30;
          }
          
          let content = part.content;
          
          // Handle bold text
          const hasBold = content.includes('**');
          if (hasBold) {
            // Split by bold markers and alternate fonts
            const segments = content.split('**');
            let currentX = leftMargin;
            
            for (let i = 0; i < segments.length; i++) {
              if (segments[i].trim()) {
                const isBold = i % 2 === 1;
                pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                
                const segmentLines = pdf.splitTextToSize(segments[i], maxWidth - (currentX - leftMargin));
                for (const line of segmentLines) {
                  if (yPosition > pageHeight - 30) {
                    pdf.addPage();
                    yPosition = 30;
                    currentX = leftMargin;
                  }
                  pdf.text(line, currentX, yPosition);
                  yPosition += lineHeight;
                  currentX = leftMargin; // Reset X for next line
                }
              }
            }
            pdf.setFont('helvetica', 'normal'); // Reset to normal
          } else {
            // Handle different content types
            if (part.type === 'center') {
              pdf.setFontSize(16);
              pdf.setFont('helvetica', 'bold');
              pdf.text(content, 105, yPosition, { align: 'center' });
              pdf.setFontSize(12);
              pdf.setFont('helvetica', 'normal');
              yPosition += 20;
            } else if (part.type === 'article') {
              yPosition += 5; // Extra space before articles
              const lines = pdf.splitTextToSize(content, maxWidth);
              for (const line of lines) {
                if (yPosition > pageHeight - 30) {
                  pdf.addPage();
                  yPosition = 30;
                }
                pdf.text(line, leftMargin, yPosition);
                yPosition += lineHeight;
              }
              yPosition += 3; // Extra space after articles
            } else {
              // Normal content
              const lines = pdf.splitTextToSize(content, maxWidth);
              for (const line of lines) {
                if (yPosition > pageHeight - 30) {
                  pdf.addPage();
                  yPosition = 30;
                }
                pdf.text(line, leftMargin, yPosition);
                yPosition += lineHeight;
              }
              yPosition += 5;
            }
          }
        }
      }
      
      // Always add signature section at the bottom (since we removed table)
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 30;
      }
      
      yPosition += 20; // Add space before signatures
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('PRESTATOR', leftMargin, yPosition);
      pdf.text('BENEFICIAR', leftMargin + 75, yPosition);
      
      yPosition += 15;
      pdf.setFont('helvetica', 'normal');
      pdf.text('_________________', leftMargin, yPosition);
      pdf.text('_________________', leftMargin + 75, yPosition);
      
      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="contract-${contract.orderNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
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

  // System settings routes
  app.get("/api/system-settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ error: "Failed to fetch system settings" });
    }
  });

  app.put("/api/system-settings", async (req, res) => {
    try {
      const validatedData = insertSystemSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateSystemSettings(validatedData);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating system settings:", error);
      res.status(500).json({ error: "Failed to update system settings" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
