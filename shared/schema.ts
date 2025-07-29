import { pgTable, text, serial, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contractTemplates = pgTable("contract_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  fields: text("fields").notNull(), // JSON string of field definitions
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const beneficiaries = pgTable("beneficiaries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  cnp: text("cnp"),
  // Company fields (optional for companies)
  companyName: text("company_name"), 
  companyAddress: text("company_address"),
  companyCui: text("company_cui"),
  companyRegistrationNumber: text("company_registration_number"),
  companyLegalRepresentative: text("company_legal_representative"),
  isCompany: boolean("is_company").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  cui: text("cui").notNull(),
  registrationNumber: text("registration_number").notNull(),
  legalRepresentative: text("legal_representative").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  language: text("language").notNull().default("ro"),
  currency: text("currency").notNull().default("RON"),
  dateFormat: text("date_format").notNull().default("dd/mm/yyyy"),
  autoBackup: boolean("auto_backup").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  role: text("role").notNull().default("administrator"),
  password: text("password").notNull().default("admin123"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});



export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  orderNumber: integer("order_number").notNull().unique(),
  templateId: integer("template_id"),
  beneficiaryId: integer("beneficiary_id"),
  value: decimal("value", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("RON"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  status: text("status").notNull().default("draft"), // draft, reserved, signed, completed
  // Provider/Company details (auto-filled from settings)
  providerName: text("provider_name"),
  providerAddress: text("provider_address"),
  providerPhone: text("provider_phone"),
  providerEmail: text("provider_email"),
  providerCui: text("provider_cui"),
  providerRegistrationNumber: text("provider_registration_number"),
  providerLegalRepresentative: text("provider_legal_representative"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sentAt: timestamp("sent_at"),
  completedAt: timestamp("completed_at"),
});

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});



export const insertBeneficiarySchema = createInsertSchema(beneficiaries).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Numele este obligatoriu"),
  email: z.string().email("Email-ul trebuie să fie valid").min(1, "Email-ul este obligatoriu"),
  phone: z.string().min(1, "Telefonul este obligatoriu"),
  address: z.string().optional(),
  cnp: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyCui: z.string().optional(),
  companyRegistrationNumber: z.string().optional(),
  companyLegalRepresentative: z.string().optional(),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  updatedAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  completedAt: true,
}).extend({
  templateId: z.number().min(1, "Template-ul este obligatoriu"),
  beneficiaryId: z.number().min(1, "Beneficiarul este obligatoriu"),
  value: z.union([z.string(), z.number()]).optional().nullable(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
});

export type ContractTemplate = typeof contractTemplates.$inferSelect;
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;

export type Beneficiary = typeof beneficiaries.$inferSelect;
export type InsertBeneficiary = z.infer<typeof insertBeneficiarySchema>;

export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;



export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

// Relations
export const contractTemplatesRelations = relations(contractTemplates, ({ many }) => ({
  contracts: many(contracts),
}));

export const beneficiariesRelations = relations(beneficiaries, ({ many }) => ({
  contracts: many(contracts),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
  }),
  beneficiary: one(beneficiaries, {
    fields: [contracts.beneficiaryId],
    references: [beneficiaries.id],
  }),
}));

export type ContractWithDetails = Contract & {
  template: ContractTemplate;
  beneficiary: Beneficiary;
};
