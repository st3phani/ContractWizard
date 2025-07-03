import { 
  contracts, 
  contractTemplates, 
  beneficiaries,
  type Contract, 
  type ContractTemplate, 
  type Beneficiary,
  type InsertContract, 
  type InsertContractTemplate, 
  type InsertBeneficiary,
  type ContractWithDetails
} from "@shared/schema";

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
  getContractByOrderNumber(orderNumber: string): Promise<ContractWithDetails | undefined>;
  createContract(contract: InsertContract): Promise<ContractWithDetails>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<ContractWithDetails | undefined>;
  deleteContract(id: number): Promise<boolean>;
  
  // Stats
  getContractStats(): Promise<{
    totalContracts: number;
    pendingContracts: number;
    sentContracts: number;
    completedContracts: number;
  }>;
}

export class MemStorage implements IStorage {
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

BENEFICIAR: {{beneficiary.fullName}}, 
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
          { name: "beneficiary.fullName", type: "text", required: true },
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
      createdAt: new Date(),
      address: beneficiary.address ?? null,
      phone: beneficiary.phone ?? null,
      cnp: beneficiary.cnp ?? null
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
      const template = this.contractTemplates.get(contract.templateId);
      const beneficiary = this.beneficiaries.get(contract.beneficiaryId);
      
      if (template && beneficiary) {
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
    
    const template = this.contractTemplates.get(contract.templateId);
    const beneficiary = this.beneficiaries.get(contract.beneficiaryId);
    
    if (!template || !beneficiary) return undefined;
    
    return {
      ...contract,
      template,
      beneficiary
    };
  }

  async getContractByOrderNumber(orderNumber: string): Promise<ContractWithDetails | undefined> {
    const contract = Array.from(this.contracts.values()).find(c => c.orderNumber === orderNumber);
    if (!contract) return undefined;
    
    const template = this.contractTemplates.get(contract.templateId);
    const beneficiary = this.beneficiaries.get(contract.beneficiaryId);
    
    if (!template || !beneficiary) return undefined;
    
    return {
      ...contract,
      template,
      beneficiary
    };
  }

  async createContract(contractData: InsertContract): Promise<ContractWithDetails> {
    const id = this.currentContractId++;
    const newContract: Contract = {
      id,
      orderNumber: contractData.orderNumber,
      templateId: contractData.templateId,
      beneficiaryId: contractData.beneficiaryId,
      value: contractData.value ?? null,
      currency: contractData.currency ?? "RON",
      startDate: contractData.startDate ?? null,
      endDate: contractData.endDate ?? null,
      notes: contractData.notes ?? null,
      status: contractData.status ?? "draft",
      createdAt: new Date(),
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

  async updateContract(id: number, contractData: Partial<Contract>): Promise<ContractWithDetails | undefined> {
    const existing = this.contracts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...contractData };
    this.contracts.set(id, updated);
    
    const template = this.contractTemplates.get(updated.templateId);
    const beneficiary = this.beneficiaries.get(updated.beneficiaryId);
    
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
  }> {
    const contracts = Array.from(this.contracts.values());
    
    return {
      totalContracts: contracts.length,
      pendingContracts: contracts.filter(c => c.status === "draft").length,
      sentContracts: contracts.filter(c => c.status === "sent").length,
      completedContracts: contracts.filter(c => c.status === "completed").length
    };
  }
}

export const storage = new MemStorage();
