import { 
  contracts, 
  contractTemplates, 
  beneficiaries,
  companySettings,
  systemSettings,
  type Contract, 
  type ContractTemplate, 
  type Beneficiary,
  type CompanySettings,
  type SystemSettings,
  type InsertContract, 
  type InsertContractTemplate, 
  type InsertBeneficiary,
  type InsertCompanySettings,
  type InsertSystemSettings,
  type ContractWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Contract Templates
  getContractTemplates(): Promise<ContractTemplate[]>;
  getContractTemplate(id: number): Promise<ContractTemplate | undefined>;
  createContractTemplate(template: InsertContractTemplate): Promise<ContractTemplate>;
  updateContractTemplate(id: number, template: Partial<InsertContractTemplate>): Promise<ContractTemplate | undefined>;
  deleteContractTemplate(id: number): Promise<boolean>;

  // Beneficiaries
  getBeneficiaries(): Promise<Beneficiary[]>;
  getBeneficiary(id: number): Promise<Beneficiary | undefined>;
  getBeneficiaryByEmail(email: string): Promise<Beneficiary | undefined>;
  createBeneficiary(beneficiary: InsertBeneficiary): Promise<Beneficiary>;
  updateBeneficiary(id: number, beneficiary: Partial<InsertBeneficiary>): Promise<Beneficiary | undefined>;
  deleteBeneficiary(id: number): Promise<boolean>;

  // Contracts
  getContracts(): Promise<ContractWithDetails[]>;
  getContract(id: number): Promise<ContractWithDetails | undefined>;
  getContractByOrderNumber(orderNumber: number): Promise<ContractWithDetails | undefined>;
  createContract(contract: InsertContract): Promise<ContractWithDetails>;
  updateContract(id: number, contract: any): Promise<ContractWithDetails | undefined>;
  deleteContract(id: number): Promise<boolean>;
  
  // Reserve Contract
  reserveContract(orderNumber: number, companySettings: CompanySettings): Promise<ContractWithDetails>;
  getNextOrderNumber(): Promise<number>;
  
  // Stats
  getContractStats(): Promise<{
    totalContracts: number;
    pendingContracts: number;
    sentContracts: number;
    completedContracts: number;
    reservedContracts: number;
  }>;

  // Company Settings
  getCompanySettings(): Promise<CompanySettings | undefined>;
  updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings>;

  // System Settings
  getSystemSettings(): Promise<SystemSettings | undefined>;
  updateSystemSettings(settings: InsertSystemSettings): Promise<SystemSettings>;


}

export class MemStorage implements IStorage {
  // Company Settings
  async getCompanySettings(): Promise<CompanySettings | undefined> {
    // Return default company settings for MemStorage
    return {
      id: 1,
      name: "Compania Mea SRL",
      address: "Str. Principală nr. 123, București, România",
      phone: "+40 21 123 4567",
      email: "contact@compania-mea.ro",
      cui: "RO12345678",
      registrationNumber: "J40/1234/2023",
      legalRepresentative: "Ion Popescu",
      updatedAt: new Date()
    };
  }

  async updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    // Return updated settings for MemStorage
    return {
      id: 1,
      ...settings,
      updatedAt: new Date()
    };
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSettings | undefined> {
    // Return default system settings for MemStorage
    return {
      id: 1,
      language: "ro",
      currency: "RON",
      dateFormat: "dd/mm/yyyy",
      autoBackup: true,
      updatedAt: new Date()
    };
  }

  async updateSystemSettings(settings: InsertSystemSettings): Promise<SystemSettings> {
    // Return updated settings for MemStorage
    return {
      id: 1,
      language: settings.language ?? "ro",
      currency: settings.currency ?? "RON", 
      dateFormat: settings.dateFormat ?? "dd/mm/yyyy",
      autoBackup: settings.autoBackup ?? true,
      updatedAt: new Date()
    };
  }
  private contractTemplates: Map<number, ContractTemplate>;
  private beneficiaries: Map<number, Beneficiary>;
  private contracts: Map<number, Contract>;
  private currentTemplateId: number;
  private currentBeneficiaryId: number;
  private currentContractId: number;

  constructor() {
    this.contractTemplates = new Map();
    this.beneficiaries = new Map();
    this.contracts = new Map();
    this.currentTemplateId = 1;
    this.currentBeneficiaryId = 1;
    this.currentContractId = 1;

    // Initialize with default templates
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    const defaultTemplates = [
      {
        name: "Contract de Servicii",
        content: `CONTRACT DE SERVICII

Nr. {{orderNumber}} din {{currentDate}}

Între:

PRESTATOR: [Numele Companiei], cu sediul în [Adresa Companiei], 
înregistrată la Registrul Comerțului sub nr. [Nr. Registrul Comerțului], 
CIF [CIF Companie], reprezentată legal prin [Reprezentant Legal], 
în calitate de prestator,

și

BENEFICIAR: {{beneficiary.name}}, 
domiciliat în {{beneficiary.address}}, 
CNP/CUI: {{beneficiary.cnp}}, 
în calitate de beneficiar,

S-a încheiat prezentul contract având următoarele clauze:

Art. 1 - Obiectul contractului
Prestatorul se obligă să execute pentru beneficiar serviciile prevăzute în anexa care face parte integrantă din prezentul contract.

Art. 2 - Durata contractului
Prezentul contract se încheie pe perioada: {{contract.startDate}} - {{contract.endDate}}

Art. 3 - Valoarea contractului
Valoarea totală a contractului este de {{contract.value}} {{contract.currency}}, TVA inclus.

Art. 4 - Obligațiile părților
Părțile își asumă obligațiile prevăzute în legislația în vigoare și în prezentul contract.

{{contract.notes}}

PRESTATOR                    BENEFICIAR
_________________           _________________`,
        fields: JSON.stringify([
          { name: "beneficiary.name", type: "text", required: true },
          { name: "beneficiary.address", type: "textarea", required: true },
          { name: "beneficiary.cnp", type: "text", required: true },
          { name: "contract.value", type: "number", required: true },
          { name: "contract.currency", type: "select", options: ["RON", "EUR", "USD"], required: true },
          { name: "contract.startDate", type: "date", required: true },
          { name: "contract.endDate", type: "date", required: true },
          { name: "contract.notes", type: "textarea", required: false }
        ]),
        createdAt: new Date()
      }
    ];

    defaultTemplates.forEach(template => {
      const id = this.currentTemplateId++;
      this.contractTemplates.set(id, { ...template, id });
    });
  }

  // Contract Templates
  async getContractTemplates(): Promise<ContractTemplate[]> {
    return Array.from(this.contractTemplates.values());
  }

  async getContractTemplate(id: number): Promise<ContractTemplate | undefined> {
    return this.contractTemplates.get(id);
  }

  async createContractTemplate(template: InsertContractTemplate): Promise<ContractTemplate> {
    const id = this.currentTemplateId++;
    const newTemplate: ContractTemplate = {
      ...template,
      id,
      createdAt: new Date()
    };
    this.contractTemplates.set(id, newTemplate);
    return newTemplate;
  }

  async updateContractTemplate(id: number, template: Partial<InsertContractTemplate>): Promise<ContractTemplate | undefined> {
    const existing = this.contractTemplates.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...template };
    this.contractTemplates.set(id, updated);
    return updated;
  }

  async deleteContractTemplate(id: number): Promise<boolean> {
    return this.contractTemplates.delete(id);
  }

  // Beneficiaries
  async getBeneficiaries(): Promise<Beneficiary[]> {
    return Array.from(this.beneficiaries.values());
  }

  async getBeneficiary(id: number): Promise<Beneficiary | undefined> {
    return this.beneficiaries.get(id);
  }

  async getBeneficiaryByEmail(email: string): Promise<Beneficiary | undefined> {
    return Array.from(this.beneficiaries.values()).find(b => b.email === email);
  }

  async createBeneficiary(beneficiary: InsertBeneficiary): Promise<Beneficiary> {
    const id = this.currentBeneficiaryId++;
    const newBeneficiary: Beneficiary = {
      ...beneficiary,
      id,
      phone: beneficiary.phone ?? null,
      address: beneficiary.address ?? null,
      cnp: beneficiary.cnp ?? null,
      companyName: beneficiary.companyName ?? null,
      companyAddress: beneficiary.companyAddress ?? null,
      companyCui: beneficiary.companyCui ?? null,
      companyRegistrationNumber: beneficiary.companyRegistrationNumber ?? null,
      companyLegalRepresentative: beneficiary.companyLegalRepresentative ?? null,
      isCompany: beneficiary.isCompany ?? false,
      createdAt: new Date()
    };
    this.beneficiaries.set(id, newBeneficiary);
    return newBeneficiary;
  }

  async updateBeneficiary(id: number, beneficiary: Partial<InsertBeneficiary>): Promise<Beneficiary | undefined> {
    const existing = this.beneficiaries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...beneficiary };
    this.beneficiaries.set(id, updated);
    return updated;
  }

  async deleteBeneficiary(id: number): Promise<boolean> {
    return this.beneficiaries.delete(id);
  }

  // Contracts
  async getContracts(): Promise<ContractWithDetails[]> {
    const contractsArray = Array.from(this.contracts.values());
    const contractsWithDetails: ContractWithDetails[] = [];
    
    for (const contract of contractsArray) {
      const template = contract.templateId ? this.contractTemplates.get(contract.templateId) : null;
      const beneficiary = contract.beneficiaryId ? this.beneficiaries.get(contract.beneficiaryId) : null;
      
      // Handle reserved contracts with null template/beneficiary
      if (contract.status === "reserved") {
        const mockTemplate: ContractTemplate = {
          id: 0,
          name: "Template Rezervat",
          content: "",
          fields: "[]",
          createdAt: new Date()
        };
        const mockBeneficiary: Beneficiary = {
          id: 0,
          name: "Rezervat",
          email: "",
          phone: null,
          address: null,
          cnp: null,
          companyName: null,
          companyAddress: null,
          companyCui: null,
          companyRegistrationNumber: null,
          companyLegalRepresentative: null,
          isCompany: false,
          createdAt: new Date()
        };
        contractsWithDetails.push({
          ...contract,
          template: mockTemplate,
          beneficiary: mockBeneficiary
        });
      } else if (template && beneficiary) {
        contractsWithDetails.push({
          ...contract,
          template,
          beneficiary
        });
      }
    }
    
    return contractsWithDetails.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getContract(id: number): Promise<ContractWithDetails | undefined> {
    const contract = this.contracts.get(id);
    if (!contract) return undefined;
    
    const template = contract.templateId ? this.contractTemplates.get(contract.templateId) : null;
    const beneficiary = contract.beneficiaryId ? this.beneficiaries.get(contract.beneficiaryId) : null;
    
    // Handle reserved contracts
    if (contract.status === "reserved") {
      const mockTemplate: ContractTemplate = {
        id: 0,
        name: "Template Rezervat",
        content: "",
        fields: "[]",
        createdAt: new Date()
      };
      const mockBeneficiary: Beneficiary = {
        id: 0,
        name: "Rezervat",
        email: "",
        phone: null,
        address: null,
        cnp: null,
        companyName: null,
        companyAddress: null,
        companyCui: null,
        companyRegistrationNumber: null,
        companyLegalRepresentative: null,
        isCompany: false,
        createdAt: new Date()
      };
      return {
        ...contract,
        template: mockTemplate,
        beneficiary: mockBeneficiary
      };
    }
    
    if (!template || !beneficiary) return undefined;
    
    return {
      ...contract,
      template,
      beneficiary
    };
  }

  async getContractByOrderNumber(orderNumber: number): Promise<ContractWithDetails | undefined> {
    const contract = Array.from(this.contracts.values()).find(c => c.orderNumber === orderNumber);
    if (!contract) return undefined;
    
    const template = contract.templateId ? this.contractTemplates.get(contract.templateId) : null;
    const beneficiary = contract.beneficiaryId ? this.beneficiaries.get(contract.beneficiaryId) : null;
    
    // Handle reserved contracts
    if (contract.status === "reserved") {
      const mockTemplate: ContractTemplate = {
        id: 0,
        name: "Template Rezervat",
        content: "",
        fields: "[]",
        createdAt: new Date()
      };
      const mockBeneficiary: Beneficiary = {
        id: 0,
        name: "Rezervat",
        email: "",
        phone: null,
        address: null,
        cnp: null,
        companyName: null,
        companyAddress: null,
        companyCui: null,
        companyRegistrationNumber: null,
        companyLegalRepresentative: null,
        isCompany: false,
        createdAt: new Date()
      };
      return {
        ...contract,
        template: mockTemplate,
        beneficiary: mockBeneficiary
      };
    }
    
    if (!template || !beneficiary) return undefined;
    
    return {
      ...contract,
      template,
      beneficiary
    };
  }

  async createContract(contractData: InsertContract, customCreatedDate?: string): Promise<ContractWithDetails> {
    const id = this.currentContractId++;
    const createdAt = customCreatedDate ? new Date(customCreatedDate) : new Date();
    
    const newContract: Contract = {
      id,
      orderNumber: contractData.orderNumber,
      templateId: contractData.templateId,
      beneficiaryId: contractData.beneficiaryId,
      value: contractData.value ? String(contractData.value) : null,
      currency: contractData.currency ?? "RON",
      startDate: contractData.startDate ?? null,
      endDate: contractData.endDate ?? null,
      notes: contractData.notes ?? null,
      status: contractData.status ?? "draft",
      providerName: null,
      providerAddress: null,
      providerPhone: null,
      providerEmail: null,
      providerCui: null,
      providerRegistrationNumber: null,
      providerLegalRepresentative: null,
      createdAt,
      sentAt: null,
      completedAt: null
    };
    this.contracts.set(id, newContract);
    
    const template = this.contractTemplates.get(contractData.templateId);
    const beneficiary = this.beneficiaries.get(contractData.beneficiaryId);
    
    if (!template || !beneficiary) {
      throw new Error("Template or beneficiary not found");
    }
    
    return {
      ...newContract,
      template,
      beneficiary
    };
  }

  async updateContract(id: number, contractData: any): Promise<ContractWithDetails | undefined> {
    const existing = this.contracts.get(id);
    if (!existing) return undefined;
    
    // Process the data to ensure compatibility
    const processedData = {
      ...contractData,
      value: typeof contractData.value === 'number' ? String(contractData.value) : contractData.value
    };
    
    const updated = { ...existing, ...processedData };
    this.contracts.set(id, updated);
    
    const template = this.contractTemplates.get(updated.templateId || 0);
    const beneficiary = this.beneficiaries.get(updated.beneficiaryId || 0);
    
    if (!template || !beneficiary) return undefined;
    
    return {
      ...updated,
      template,
      beneficiary
    };
  }

  async deleteContract(id: number): Promise<boolean> {
    return this.contracts.delete(id);
  }

  async getContractStats(): Promise<{
    totalContracts: number;
    pendingContracts: number;
    sentContracts: number;
    completedContracts: number;
    reservedContracts: number;
  }> {
    const contracts = Array.from(this.contracts.values());
    
    return {
      totalContracts: contracts.length,
      pendingContracts: contracts.filter(c => c.status === "draft").length,
      sentContracts: contracts.filter(c => c.status === "sent").length,
      completedContracts: contracts.filter(c => c.status === "completed").length,
      reservedContracts: contracts.filter(c => c.status === "reserved").length
    };
  }

  async getNextOrderNumber(): Promise<number> {
    const contracts = Array.from(this.contracts.values());
    const maxOrderNumber = contracts.reduce((max, contract) => Math.max(max, contract.orderNumber), 0);
    return maxOrderNumber + 1;
  }

  async reserveContract(orderNumber: number, companySettings: CompanySettings, customCreatedDate?: string): Promise<ContractWithDetails> {
    const id = this.currentContractId++;
    const createdAt = customCreatedDate ? new Date(customCreatedDate) : new Date();
    
    const reservedContract: Contract = {
      id,
      orderNumber,
      templateId: null,
      beneficiaryId: null,
      value: null,
      currency: "RON",
      startDate: null,
      endDate: null,
      notes: null,
      status: "reserved",
      providerName: companySettings.name,
      providerAddress: companySettings.address,
      providerPhone: companySettings.phone,
      providerEmail: companySettings.email,
      providerCui: companySettings.cui,
      providerRegistrationNumber: companySettings.registrationNumber,
      providerLegalRepresentative: companySettings.legalRepresentative,
      createdAt,
      sentAt: null,
      completedAt: null
    };
    
    this.contracts.set(id, reservedContract);
    
    // Create mock template and beneficiary for reserved contract
    const mockTemplate: ContractTemplate = { 
      id: 0, 
      name: "Contract Rezervat", 
      content: "", 
      fields: "", 
      createdAt: new Date() 
    };
    const mockBeneficiary: Beneficiary = { 
      id: 0, 
      name: "Rezervat", 
      email: "", 
      phone: null, 
      address: null, 
      cnp: null, 
      companyName: null, 
      companyAddress: null, 
      companyCui: null, 
      companyRegistrationNumber: null, 
      companyLegalRepresentative: null, 
      isCompany: false, 
      createdAt: new Date() 
    };
    
    return {
      ...reservedContract,
      template: mockTemplate,
      beneficiary: mockBeneficiary
    };
  }


}

export class DatabaseStorage implements IStorage {
  async getContractTemplates(): Promise<ContractTemplate[]> {
    const templates = await db.select().from(contractTemplates);
    return templates;
  }

  async getContractTemplate(id: number): Promise<ContractTemplate | undefined> {
    const [template] = await db.select().from(contractTemplates).where(eq(contractTemplates.id, id));
    return template || undefined;
  }

  async createContractTemplate(template: InsertContractTemplate): Promise<ContractTemplate> {
    const [newTemplate] = await db
      .insert(contractTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async updateContractTemplate(id: number, template: Partial<InsertContractTemplate>): Promise<ContractTemplate | undefined> {
    const [updated] = await db
      .update(contractTemplates)
      .set(template)
      .where(eq(contractTemplates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteContractTemplate(id: number): Promise<boolean> {
    const result = await db.delete(contractTemplates).where(eq(contractTemplates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getBeneficiaries(): Promise<Beneficiary[]> {
    const beneficiariesList = await db.select().from(beneficiaries);
    return beneficiariesList;
  }

  async getBeneficiary(id: number): Promise<Beneficiary | undefined> {
    const [beneficiary] = await db.select().from(beneficiaries).where(eq(beneficiaries.id, id));
    return beneficiary || undefined;
  }

  async getBeneficiaryByEmail(email: string): Promise<Beneficiary | undefined> {
    const [beneficiary] = await db.select().from(beneficiaries).where(eq(beneficiaries.email, email));
    return beneficiary || undefined;
  }

  async createBeneficiary(beneficiary: InsertBeneficiary): Promise<Beneficiary> {
    const [newBeneficiary] = await db
      .insert(beneficiaries)
      .values(beneficiary)
      .returning();
    return newBeneficiary;
  }

  async updateBeneficiary(id: number, beneficiary: Partial<InsertBeneficiary>): Promise<Beneficiary | undefined> {
    const [updated] = await db
      .update(beneficiaries)
      .set(beneficiary)
      .where(eq(beneficiaries.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteBeneficiary(id: number): Promise<boolean> {
    const result = await db.delete(beneficiaries).where(eq(beneficiaries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getContracts(): Promise<ContractWithDetails[]> {
    const contractsWithDetails = await db.query.contracts.findMany({
      with: {
        template: true,
        beneficiary: true,
      },
      orderBy: (contracts, { desc }) => [desc(contracts.id)],
    });
    
    // Handle reserved contracts with beneficiaryId = 0 and templateId = 0
    return contractsWithDetails.map(contract => {
      if (contract.beneficiaryId === 0 || contract.templateId === 0) {
        const mockTemplate: ContractTemplate = {
          id: 0,
          name: "Template Rezervat",
          content: "",
          fields: "[]",
          createdAt: new Date()
        };
        const mockBeneficiary: Beneficiary = {
          id: 0,
          name: "Rezervat",
          email: "",
          phone: null,
          address: null,
          cnp: null,
          companyName: null,
          companyAddress: null,
          companyCui: null,
          companyRegistrationNumber: null,
          companyLegalRepresentative: null,
          isCompany: false,
          createdAt: new Date()
        };
        return {
          ...contract,
          template: contract.template || mockTemplate,
          beneficiary: contract.beneficiary || mockBeneficiary
        };
      }
      return contract;
    });
  }

  async getContract(id: number): Promise<ContractWithDetails | undefined> {
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, id),
      with: {
        template: true,
        beneficiary: true,
      },
    });
    
    if (!contract) return undefined;
    
    // Handle reserved contracts with beneficiaryId = 0 or templateId = 0
    if (contract.beneficiaryId === 0 || contract.templateId === 0) {
      const mockTemplate: ContractTemplate = {
        id: 0,
        name: "Template Rezervat",
        content: "",
        fields: "[]",
        createdAt: new Date()
      };
      const mockBeneficiary: Beneficiary = {
        id: 0,
        name: "Rezervat",
        email: "",
        phone: null,
        address: null,
        cnp: null,
        companyName: null,
        companyAddress: null,
        companyCui: null,
        companyRegistrationNumber: null,
        companyLegalRepresentative: null,
        isCompany: false,
        createdAt: new Date()
      };
      return {
        ...contract,
        template: contract.template || mockTemplate,
        beneficiary: contract.beneficiary || mockBeneficiary
      };
    }
    
    return contract;
  }

  async getContractByOrderNumber(orderNumber: number): Promise<ContractWithDetails | undefined> {
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.orderNumber, orderNumber),
      with: {
        template: true,
        beneficiary: true,
      },
    });
    
    if (!contract) return undefined;
    
    // Handle reserved contracts with beneficiaryId = 0 or templateId = 0
    if (contract.beneficiaryId === 0 || contract.templateId === 0) {
      const mockTemplate: ContractTemplate = {
        id: 0,
        name: "Template Rezervat",
        content: "",
        fields: "[]",
        createdAt: new Date()
      };
      const mockBeneficiary: Beneficiary = {
        id: 0,
        name: "Rezervat",
        email: "",
        phone: null,
        address: null,
        cnp: null,
        companyName: null,
        companyAddress: null,
        companyCui: null,
        companyRegistrationNumber: null,
        companyLegalRepresentative: null,
        isCompany: false,
        createdAt: new Date()
      };
      return {
        ...contract,
        template: contract.template || mockTemplate,
        beneficiary: contract.beneficiary || mockBeneficiary
      };
    }
    
    return contract;
  }

  async createContract(contractData: InsertContract): Promise<ContractWithDetails> {
    const processedData = {
      ...contractData,
      value: typeof contractData.value === 'number' ? String(contractData.value) : contractData.value
    };
    
    const [newContract] = await db
      .insert(contracts)
      .values(processedData)
      .returning();

    const contractWithDetails = await this.getContract(newContract.id);
    if (!contractWithDetails) {
      throw new Error("Failed to retrieve created contract");
    }
    
    return contractWithDetails;
  }

  async updateContract(id: number, contractData: any): Promise<ContractWithDetails | undefined> {
    // Process the data to ensure compatibility
    const processedData = {
      ...contractData,
      value: typeof contractData.value === 'number' ? String(contractData.value) : contractData.value
    };
    
    console.log("DatabaseStorage updateContract - processing data:", processedData);
    
    const [updated] = await db
      .update(contracts)
      .set(processedData)
      .where(eq(contracts.id, id))
      .returning();
    
    console.log("DatabaseStorage updateContract - updated result:", updated);
    
    if (!updated) {
      console.log("DatabaseStorage updateContract - no contract updated");
      return undefined;
    }
    
    const result = await this.getContract(id);
    console.log("DatabaseStorage updateContract - final result:", result);
    return result;
  }

  async deleteContract(id: number): Promise<boolean> {
    const result = await db.delete(contracts).where(eq(contracts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getContractStats(): Promise<{
    totalContracts: number;
    pendingContracts: number;
    sentContracts: number;
    completedContracts: number;
    reservedContracts: number;
  }> {
    const allContracts = await db.select().from(contracts);
    
    return {
      totalContracts: allContracts.length,
      pendingContracts: allContracts.filter(c => c.status === "draft").length,
      sentContracts: allContracts.filter(c => c.status === "sent").length,
      completedContracts: allContracts.filter(c => c.status === "completed").length,
      reservedContracts: allContracts.filter(c => c.status === "reserved").length,
    };
  }

  async getNextOrderNumber(): Promise<number> {
    const allContracts = await db.select().from(contracts);
    const maxOrderNumber = allContracts.reduce((max, contract) => Math.max(max, contract.orderNumber), 0);
    return maxOrderNumber + 1;
  }

  async reserveContract(orderNumber: number, companySettings: CompanySettings, customCreatedDate?: string): Promise<ContractWithDetails> {
    const createdAt = customCreatedDate ? new Date(customCreatedDate) : new Date();

    const [reservedContract] = await db
      .insert(contracts)
      .values({
        orderNumber,
        templateId: 0,
        beneficiaryId: 0,
        value: null,
        currency: "RON",
        startDate: null,
        endDate: null,
        notes: null,
        status: "reserved",
        providerName: companySettings.name,
        providerAddress: companySettings.address,
        providerPhone: companySettings.phone,
        providerEmail: companySettings.email,
        providerCui: companySettings.cui,
        providerRegistrationNumber: companySettings.registrationNumber,
        providerLegalRepresentative: companySettings.legalRepresentative,
        createdAt,
      })
      .returning();

    // Create mock template and beneficiary for display
    const mockTemplate: ContractTemplate = { 
      id: 0, 
      name: "Contract Rezervat", 
      content: "", 
      fields: "", 
      createdAt: new Date() 
    };
    const mockBeneficiary: Beneficiary = { 
      id: 0, 
      name: "Rezervat", 
      email: "", 
      phone: null, 
      address: null, 
      cnp: null, 
      companyName: null, 
      companyAddress: null, 
      companyCui: null, 
      companyRegistrationNumber: null, 
      companyLegalRepresentative: null, 
      isCompany: false, 
      createdAt: new Date() 
    };

    return {
      ...reservedContract,
      template: mockTemplate,
      beneficiary: mockBeneficiary
    };
  }

  async getCompanySettings(): Promise<CompanySettings | undefined> {
    const [settings] = await db.select().from(companySettings).limit(1);
    return settings || undefined;
  }

  async updateCompanySettings(settingsData: InsertCompanySettings): Promise<CompanySettings> {
    // Check if settings exist
    const existing = await this.getCompanySettings();
    
    if (existing) {
      // Update existing settings
      const [updated] = await db
        .update(companySettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(companySettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [created] = await db
        .insert(companySettings)
        .values(settingsData)
        .returning();
      return created;
    }
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSettings | undefined> {
    const [settings] = await db.select().from(systemSettings).limit(1);
    
    if (!settings) {
      // Create default settings if none exist
      const [created] = await db
        .insert(systemSettings)
        .values({
          language: "ro",
          currency: "RON",
          dateFormat: "dd/mm/yyyy",
          autoBackup: true,
          updatedAt: new Date()
        })
        .returning();
      return created;
    }
    
    return settings;
  }

  async updateSystemSettings(settingsData: InsertSystemSettings): Promise<SystemSettings> {
    // Check if settings exist
    const existing = await this.getSystemSettings();
    
    if (existing) {
      // Update existing settings
      const [updated] = await db
        .update(systemSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(systemSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [created] = await db
        .insert(systemSettings)
        .values(settingsData)
        .returning();
      return created;
    }
  }


}

// Initialize database storage with default templates
const initializeDatabase = async () => {
  try {
    // Check if we already have templates
    const existingTemplates = await db.select().from(contractTemplates);
    
    if (existingTemplates.length === 0) {
      // Add default template
      await db.insert(contractTemplates).values({
        name: "Contract de Servicii",
        content: `CONTRACT DE SERVICII

Nr. {{orderNumber}} din {{currentDate}}

Între:

PRESTATOR: [Numele Companiei], cu sediul în [Adresa Companiei], 
înregistrată la Registrul Comerțului sub nr. [Nr. Registrul Comerțului], 
CIF [CIF Companie], reprezentată legal prin [Reprezentant Legal], 
în calitate de prestator,

și

BENEFICIAR: {{beneficiary.name}}, 
domiciliat în {{beneficiary.address}}, 
CNP/CUI: {{beneficiary.cnp}}, 
în calitate de beneficiar,

S-a încheiat prezentul contract având următoarele clauze:

Art. 1 - Obiectul contractului
Prestatorul se obligă să execute pentru beneficiar serviciile prevăzute în anexa care face parte integrantă din prezentul contract.

Art. 2 - Durata contractului
Prezentul contract se încheie pe perioada: {{contract.startDate}} - {{contract.endDate}}

Art. 3 - Valoarea contractului
Valoarea totală a contractului este de {{contract.value}} {{contract.currency}}, TVA inclus.

Art. 4 - Obligațiile părților
Părțile își asumă obligațiile prevăzute în legislația în vigoare și în prezentul contract.

{{contract.notes}}

PRESTATOR                    BENEFICIAR
_________________           _________________`,
        fields: JSON.stringify([
          { name: "beneficiary.name", type: "text", required: true },
          { name: "beneficiary.address", type: "textarea", required: true },
          { name: "beneficiary.cnp", type: "text", required: true },
          { name: "contract.value", type: "number", required: true },
          { name: "contract.currency", type: "select", options: ["RON", "EUR", "USD"], required: true },
          { name: "contract.startDate", type: "date", required: true },
          { name: "contract.endDate", type: "date", required: true },
          { name: "contract.notes", type: "textarea", required: false }
        ])
      });
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
};

export const storage = new DatabaseStorage();

// Initialize database on startup
initializeDatabase();
