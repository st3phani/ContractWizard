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
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  cnp: text("cnp"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  templateId: integer("template_id").notNull(),
  beneficiaryId: integer("beneficiary_id").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("RON"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  status: text("status").notNull().default("draft"), // draft, sent, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sentAt: timestamp("sent_at"),
  completedAt: timestamp("completed_at"),
});

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertBeneficiarySchema = createInsertSchema(beneficiaries).omit({
  id: true,
  createdAt: true,
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
