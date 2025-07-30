import { 
  contracts, 
  contractTemplates, 
  parteneri,
  companySettings,
  systemSettings,
  userProfiles,
  contractStatuses,
  type Contract, 
  type ContractTemplate, 
  type Beneficiary,
  type CompanySettings,
  type SystemSettings,
  type UserProfile,
  type ContractStatus,
  type InsertContract, 
  type InsertContractTemplate, 
  type InsertBeneficiary,
  type InsertCompanySettings,
  type InsertSystemSettings,
  type InsertUserProfile,
  type InsertContractStatus,
  type ContractWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { saveSettingsToCache, loadSettingsFromCache, type SystemSettingsCache } from "./settings-cache";

export interface IStorage {
  // Contract Templates
  getContractTemplates(): Promise<ContractTemplate[]>;
  getContractTemplate(id: number): Promise<ContractTemplate | undefined>;
  createContractTemplate(template: InsertContractTemplate): Promise<ContractTemplate>;
  updateContractTemplate(id: number, template: Partial<InsertContractTemplate>): Promise<ContractTemplate | undefined>;
  deleteContractTemplate(id: number): Promise<boolean>;

  // Parteneries
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
    signedContracts: number;
    completedContracts: number;
    reservedContracts: number;
  }>;

  // Company Settings
  getCompanySettings(): Promise<CompanySettings | undefined>;
  updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings>;

  // System Settings
  getSystemSettings(): Promise<SystemSettings | undefined>;
  updateSystemSettings(settings: InsertSystemSettings): Promise<SystemSettings>;

  // User Profile
  getUserProfile(): Promise<UserProfile | undefined>;
  updateUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }>;

  // Contract Statuses
  getContractStatuses(): Promise<ContractStatus[]>;
  getContractStatus(id: number): Promise<ContractStatus | undefined>;
  createContractStatus(status: InsertContractStatus): Promise<ContractStatus>;
  updateContractStatus(id: number, status: InsertContractStatus): Promise<ContractStatus | undefined>;
  deleteContractStatus(id: number): Promise<boolean>;

  // Contract Signing
  getContractBySigningToken(token: string): Promise<ContractWithDetails | undefined>;
  signContract(id: number, signData: { signedBy: string; signedAt: Date }): Promise<Contract>;
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

  // System Settings - Key-Value approach for MemStorage compatibility
  async getSystemSettings(): Promise<any> {
    // Return default system settings for MemStorage in backward-compatible format
    return {
      id: 1,
      language: "ro",
      currency: "RON",
      dateFormat: "dd/mm/yyyy",
      autoBackup: true,
      updatedAt: new Date()
    };
  }

  async updateSystemSettings(settings: any): Promise<any> {
    // Return updated settings for MemStorage in backward-compatible format
    return {
      id: 1,
      language: settings.language ?? "ro",
      currency: settings.currency ?? "RON", 
      dateFormat: settings.dateFormat ?? "dd/mm/yyyy",
      autoBackup: settings.autoBackup ?? true,
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
  }

  // User Profile
  async getUserProfile(): Promise<UserProfile | undefined> {
    return {
      id: 1,
      firstName: "Administrator",
      lastName: "Sistem",
      email: "admin@example.com",
      phone: "0700000000",
      role: "administrator",
      password: "admin123",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    return {
      id: 1,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      role: profile.role || "administrator",
      password: "admin123",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateUserPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    // For MemStorage, just validate current password is "admin123"
    if (currentPassword !== "admin123") {
      return { success: false, message: "Current password is incorrect" };
    }
    return { success: true, message: "Password updated successfully" };
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
în calitate de partener,

S-a încheiat prezentul contract având următoarele clauze:

Art. 1 - Obiectul contractului
Prestatorul se obligă să execute pentru partener serviciile prevăzute în anexa care face parte integrantă din prezentul contract.

Art. 2 - Durata contractului
Prezentul contract se încheie pe perioada: {{contract.startDate}} - {{contract.endDate}}

Art. 3 - Valoarea contractului
Valoarea totală a contractului este de {{contract.value}} {{contract.currency}}, TVA inclus.

Art. 4 - Obligațiile părților
Părțile își asumă obligațiile prevăzute în legislația în vigoare și în prezentul contract.


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

  // Parteneries
  async getBeneficiaries(): Promise<Beneficiary[]> {
    return Array.from(this.parteneri.values());
  }

  async getBeneficiary(id: number): Promise<Beneficiary | undefined> {
    return this.parteneri.get(id);
  }

  async getBeneficiaryByEmail(email: string): Promise<Beneficiary | undefined> {
    return Array.from(this.parteneri.values()).find(b => b.email === email);
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
      isCompany: beneficiary.isCompany ?? false,
      createdAt: new Date()
    };
    this.parteneri.set(id, newBeneficiary);
    return newBeneficiary;
  }

  async updateBeneficiary(id: number, beneficiary: Partial<InsertBeneficiary>): Promise<Beneficiary | undefined> {
    const existing = this.parteneri.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...beneficiary };
    this.parteneri.set(id, updated);
    return updated;
  }

  async deleteBeneficiary(id: number): Promise<boolean> {
    return this.parteneri.delete(id);
  }

  // Contracts
  async getContracts(): Promise<ContractWithDetails[]> {
    const contractsArray = Array.from(this.contracts.values());
    const contractsWithDetails: ContractWithDetails[] = [];
    
    for (const contract of contractsArray) {
      const template = contract.templateId ? this.contractTemplates.get(contract.templateId) : null;
      const beneficiary = contract.beneficiaryId ? this.parteneri.get(contract.beneficiaryId) : null;
      
      // Handle reserved contracts with null template/beneficiary
      if (row.contract_statuses === "reserved") {
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
    const beneficiary = contract.beneficiaryId ? this.parteneri.get(contract.beneficiaryId) : null;
    
    // Handle reserved contracts
    if (row.contract_statuses === "reserved") {
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
    const beneficiary = contract.beneficiaryId ? this.parteneri.get(contract.beneficiaryId) : null;
    
    // Handle reserved contracts
    if (row.contract_statuses === "reserved") {
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
    const beneficiary = this.parteneri.get(contractData.beneficiaryId);
    
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
    const beneficiary = this.parteneri.get(updated.beneficiaryId || 0);
    
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
    signedContracts: number;
    completedContracts: number;
    reservedContracts: number;
  }> {
    const contracts = Array.from(this.contracts.values());
    
    return {
      totalContracts: contracts.length,
      pendingContracts: contracts.filter(c => c.status === "draft").length,
      signedContracts: contracts.filter(c => c.status === "signed").length,
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
    const beneficiariesList = await db.select().from(parteneri);
    return beneficiariesList;
  }

  async getBeneficiary(id: number): Promise<Beneficiary | undefined> {
    const [beneficiary] = await db.select().from(parteneri).where(eq(parteneri.id, id));
    return beneficiary || undefined;
  }

  async getBeneficiaryByEmail(email: string): Promise<Beneficiary | undefined> {
    const [beneficiary] = await db.select().from(parteneri).where(eq(parteneri.email, email));
    return beneficiary || undefined;
  }

  async createBeneficiary(beneficiary: InsertBeneficiary): Promise<Beneficiary> {
    const [newBeneficiary] = await db
      .insert(parteneri)
      .values(beneficiary)
      .returning();
    return newBeneficiary;
  }

  async updateBeneficiary(id: number, beneficiary: Partial<InsertBeneficiary>): Promise<Beneficiary | undefined> {
    const [updated] = await db
      .update(beneficiaries)
      .set(beneficiary)
      .where(eq(parteneri.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteBeneficiary(id: number): Promise<boolean> {
    const result = await db.delete(beneficiaries).where(eq(parteneri.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getContracts(): Promise<ContractWithDetails[]> {
    try {
      const result = await db
        .select()
        .from(contracts)
        .leftJoin(contractTemplates, eq(contracts.templateId, contractTemplates.id))
        .leftJoin(parteneri, eq(contracts.beneficiaryId, parteneri.id))
        .leftJoin(contractStatuses, eq(contracts.statusId, contractStatuses.id))
        .orderBy(desc(contracts.id));

      // Get company settings once for all contracts
      const companySettings = await this.getCompanySettings();

      return result.map(row => {
        const contract = row.contracts;
        
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
            isCompany: false,
            createdAt: new Date()
          };
          return {
            ...contract,
            template: row.contract_templates || mockTemplate,
            beneficiary: row.beneficiaries || mockBeneficiary,
            status: row.contract_statuses || null,
            provider: companySettings,
          };
        }
        
        return {
          ...contract,
          template: row.contract_templates || null,
          beneficiary: row.beneficiaries || null,
          status: row.contract_statuses || null,
          provider: companySettings,
        };
      });
    } catch (error) {
      console.error("Error getting contracts:", error);
      return [];
    }
  }

  async getContract(id: number): Promise<ContractWithDetails | undefined> {
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, id),
      with: {
        template: true,
        beneficiary: true,
        status: true,
      },
    });
    
    if (!contract) return undefined;
    
    // Get company settings for provider data
    const companySettings = await this.getCompanySettings();
    
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
        isCompany: false,
        createdAt: new Date()
      };
      return {
        ...contract,
        template: contract.template || mockTemplate,
        beneficiary: contract.beneficiaries || mockBeneficiary,
        status: row.contract_statuses,
        provider: companySettings
      } as ContractWithDetails;
    }
    
    return {
      ...contract,
      provider: companySettings
    } as ContractWithDetails;
  }

  async getContractByOrderNumber(orderNumber: number): Promise<ContractWithDetails | undefined> {
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.orderNumber, orderNumber),
      with: {
        template: true,
        beneficiary: true,
        status: true,
      },
    });
    
    if (!contract) return undefined;
    
    // Get company settings for provider data
    const companySettings = await this.getCompanySettings();
    
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
        isCompany: false,
        createdAt: new Date()
      };
      return {
        ...contract,
        template: contract.template || mockTemplate,
        beneficiary: contract.beneficiaries || mockBeneficiary,
        status: row.contract_statuses,
        provider: companySettings
      } as ContractWithDetails;
    }
    
    return {
      ...contract,
      provider: companySettings
    } as ContractWithDetails;
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

  async updateContractStatusById(contractId: number, statusId: number): Promise<Contract | undefined> {
    try {
      const [updated] = await db
        .update(contracts)
        .set({ statusId: statusId })
        .where(eq(contracts.id, contractId))
        .returning();

      return updated || undefined;
    } catch (error) {
      console.error("Error updating contract status:", error);
      throw error;
    }
  }

  async getContractStats(): Promise<{
    totalContracts: number;
    pendingContracts: number;
    signedContracts: number;
    completedContracts: number;
    reservedContracts: number;
  }> {
    const allContracts = await db.select().from(contracts);
    
    return {
      totalContracts: allContracts.length,
      pendingContracts: allContracts.filter(c => c.statusId === 1).length,
      signedContracts: allContracts.filter(c => c.statusId === 3).length,
      completedContracts: allContracts.filter(c => c.statusId === 4).length,
      reservedContracts: allContracts.filter(c => c.statusId === 2).length,
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
        statusId: 2,
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
      isCompany: false, 
      createdAt: new Date() 
    };

    return {
      ...reservedContract,
      template: mockTemplate,
      beneficiary: mockBeneficiary,
      provider: companySettings
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

  // System Settings - Key-Value approach with JSON cache
  async getSystemSettings(): Promise<any> {
    try {
      // Try loading from cache first for faster response
      const cachedSettings = loadSettingsFromCache();
      if (cachedSettings) {
        console.log('📄 Using cached system settings');
        return cachedSettings;
      }

      console.log('📄 Loading system settings from database');
      const settings = await db.select({
        configId: systemSettings.configId,
        path: systemSettings.path,
        value: systemSettings.value,
        updatedAt: systemSettings.updatedAt
      }).from(systemSettings);
      
      // Convert key-value pairs to object format for backward compatibility
      const settingsObject: any = {
        id: 1, // Keep for compatibility
        updatedAt: '2025-07-30 00:00:00' // Default value
      };
      
      let latestTimestamp: string = '';
      
      settings.forEach(setting => {
        const key = setting.path.replace('system_', '');
        if (key === 'autoBackup') {
          settingsObject[key] = setting.value === 'TRUE';
        } else {
          settingsObject[key] = setting.value;
        }
        
        // Track the latest timestamp - now it's already formatted as string from DB
        if (setting.updatedAt) {
          if (!latestTimestamp || setting.updatedAt > latestTimestamp) {
            latestTimestamp = setting.updatedAt;
          }
        }
      });
      
      // Set the formatted timestamp as string
      if (latestTimestamp) {
        settingsObject.updatedAt = latestTimestamp;
      }

      // Save to cache for next time
      saveSettingsToCache(settingsObject as SystemSettingsCache);
      
      return settingsObject;
    } catch (error) {
      console.error('Error getting system settings:', error);
      return undefined;
    }
  }

  async updateSystemSettings(settingsData: any): Promise<any> {
    try {
      const updatePromises = [];
      
      const currentDateTime = sql`to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')`;
      
      // Update each setting individually
      if (settingsData.language !== undefined) {
        updatePromises.push(
          db.update(systemSettings)
            .set({ value: settingsData.language, updatedAt: currentDateTime })
            .where(eq(systemSettings.path, 'system_language'))
        );
      }
      
      if (settingsData.currency !== undefined) {
        updatePromises.push(
          db.update(systemSettings)
            .set({ value: settingsData.currency, updatedAt: currentDateTime })
            .where(eq(systemSettings.path, 'system_currency'))
        );
      }
      
      if (settingsData.dateFormat !== undefined) {
        updatePromises.push(
          db.update(systemSettings)
            .set({ value: settingsData.dateFormat, updatedAt: currentDateTime })
            .where(eq(systemSettings.path, 'system_dateFormat'))
        );
      }
      
      if (settingsData.autoBackup !== undefined) {
        updatePromises.push(
          db.update(systemSettings)
            .set({ value: settingsData.autoBackup ? 'TRUE' : 'FALSE', updatedAt: currentDateTime })
            .where(eq(systemSettings.path, 'system_autoBackup'))
        );
      }
      
      await Promise.all(updatePromises);
      
      // Get fresh settings from database (bypass cache)
      console.log('📄 System settings updated - refreshing cache');
      const freshSettings = await this.getFreshSystemSettingsFromDB();
      
      // Update cache with fresh data
      saveSettingsToCache(freshSettings as SystemSettingsCache);
      
      return freshSettings;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  // Helper method to get fresh settings from DB (for cache refresh)
  private async getFreshSystemSettingsFromDB(): Promise<any> {
    const settings = await db.select({
      configId: systemSettings.configId,
      path: systemSettings.path,
      value: systemSettings.value,
      updatedAt: systemSettings.updatedAt
    }).from(systemSettings);
    
    const settingsObject: any = {
      id: 1,
      updatedAt: '2025-07-30 00:00:00'
    };
    
    let latestTimestamp: string = '';
    
    settings.forEach(setting => {
      const key = setting.path.replace('system_', '');
      if (key === 'autoBackup') {
        settingsObject[key] = setting.value === 'TRUE';
      } else {
        settingsObject[key] = setting.value;
      }
      
      if (setting.updatedAt) {
        if (!latestTimestamp || setting.updatedAt > latestTimestamp) {
          latestTimestamp = setting.updatedAt;
        }
      }
    });
    
    if (latestTimestamp) {
      settingsObject.updatedAt = latestTimestamp;
    }
    
    return settingsObject;
  }

  // User Profile
  async getUserProfile(): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).limit(1);
    return profile || undefined;
  }

  async updateUserProfile(profileData: InsertUserProfile): Promise<UserProfile> {
    // Check if profile exists
    const existing = await this.getUserProfile();
    
    if (existing) {
      // Update existing profile
      const [updated] = await db
        .update(userProfiles)
        .set({ ...profileData, updatedAt: new Date() })
        .where(eq(userProfiles.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new profile
      const [created] = await db
        .insert(userProfiles)
        .values(profileData)
        .returning();
      return created;
    }
  }

  async updateUserPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.getUserProfile();
    
    if (!existing) {
      return { success: false, message: "User profile not found" };
    }

    // Check if current password matches
    if (existing.password !== currentPassword) {
      return { success: false, message: "Current password is incorrect" };
    }

    // Update password
    await db
      .update(userProfiles)
      .set({ password: newPassword, updatedAt: new Date() })
      .where(eq(userProfiles.id, existing.id));

    return { success: true, message: "Password updated successfully" };
  }

  // Contract Statuses
  async getContractStatuses(): Promise<ContractStatus[]> {
    const statuses = await db.select().from(contractStatuses).orderBy(contractStatuses.id);
    return statuses;
  }

  async getContractStatus(id: number): Promise<ContractStatus | undefined> {
    const [status] = await db.select().from(contractStatuses).where(eq(contractStatuses.id, id));
    return status || undefined;
  }

  async createContractStatus(statusData: InsertContractStatus): Promise<ContractStatus> {
    const [newStatus] = await db
      .insert(contractStatuses)
      .values(statusData)
      .returning();
    return newStatus;
  }

  async updateContractStatus(id: number, statusData: InsertContractStatus): Promise<ContractStatus | undefined> {
    const [updated] = await db
      .update(contractStatuses)
      .set({ ...statusData, updatedAt: new Date() })
      .where(eq(contractStatuses.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteContractStatus(id: number): Promise<boolean> {
    const result = await db.delete(contractStatuses).where(eq(contractStatuses.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getContractBySignedToken(token: string): Promise<ContractWithDetails | undefined> {
    try {
      const result = await db
        .select()
        .from(contracts)
        .leftJoin(contractTemplates, eq(contracts.templateId, contractTemplates.id))
        .leftJoin(parteneri, eq(contracts.beneficiaryId, parteneri.id))
        .leftJoin(contractStatuses, eq(contracts.statusId, contractStatuses.id))
        .where(eq(contracts.signedToken, token));

      if (result.length === 0) {
        return undefined;
      }

      // Get company settings for provider data
      const companySettings = await this.getCompanySettings();

      const row = result[0];
      return {
        ...row.contracts,
        template: row.contract_templates || null,
        beneficiary: row.beneficiaries || null,
        status: row.contract_statuses || null,
        provider: companySettings,
      };
    } catch (error) {
      console.error("Error getting contract by signed token:", error);
      return undefined;
    }
  }

  async getContractBySigningToken(token: string): Promise<ContractWithDetails | undefined> {
    try {
      const result = await db
        .select()
        .from(contracts)
        .leftJoin(contractTemplates, eq(contracts.templateId, contractTemplates.id))
        .leftJoin(parteneri, eq(contracts.beneficiaryId, parteneri.id))
        .leftJoin(contractStatuses, eq(contracts.statusId, contractStatuses.id))
        .where(eq(contracts.signingToken, token));

      if (result.length === 0) {
        return undefined;
      }

      // Get company settings for provider data
      const companySettings = await this.getCompanySettings();

      const row = result[0];
      return {
        ...row.contracts,
        template: row.contract_templates || null,
        beneficiary: row.beneficiaries || null,
        status: row.contract_statuses || null,
        provider: companySettings,
      };
    } catch (error) {
      console.error("Error getting contract by signing token:", error);
      return undefined;
    }
  }

  async signContract(id: number, signData: { signedBy: string; signedAt: Date; signedIp?: string }): Promise<Contract> {
    try {
      // Generate unique signed token
      const { nanoid } = await import('nanoid');
      const signedToken = nanoid(32);

      const [updated] = await db
        .update(contracts)
        .set({
          signedBy: signData.signedBy,
          signedAt: signData.signedAt,
          signedIp: signData.signedIp,
          signedToken: signedToken,
          statusId: 3, // Change status to "signed" (Semnat)
        })
        .where(eq(contracts.id, id))
        .returning();

      return updated;
    } catch (error) {
      console.error("Error signing contract:", error);
      throw error;
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
în calitate de partener,

S-a încheiat prezentul contract având următoarele clauze:

Art. 1 - Obiectul contractului
Prestatorul se obligă să execute pentru partener serviciile prevăzute în anexa care face parte integrantă din prezentul contract.

Art. 2 - Durata contractului
Prezentul contract se încheie pe perioada: {{contract.startDate}} - {{contract.endDate}}

Art. 3 - Valoarea contractului
Valoarea totală a contractului este de {{contract.value}} {{contract.currency}}, TVA inclus.

Art. 4 - Obligațiile părților
Părțile își asumă obligațiile prevăzute în legislația în vigoare și în prezentul contract.


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
