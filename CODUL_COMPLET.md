# Contract Manager - Cod Complet

## Structura Proiectului

```
contract-manager/
├── client/
│   ├── index.html
│   └── src/
│       ├── components/
│       │   ├── ui/ (componente shadcn/ui)
│       │   ├── sidebar.tsx
│       │   ├── stats-cards.tsx
│       │   ├── contract-table.tsx
│       │   ├── contract-modal.tsx
│       │   └── email-modal.tsx
│       ├── hooks/
│       │   ├── use-toast.ts
│       │   └── use-mobile.tsx
│       ├── lib/
│       │   ├── utils.ts
│       │   └── queryClient.ts
│       ├── pages/
│       │   ├── dashboard.tsx
│       │   ├── contract-form.tsx
│       │   ├── templates.tsx
│       │   ├── beneficiaries.tsx
│       │   ├── settings.tsx
│       │   └── not-found.tsx
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   ├── db.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── drizzle.config.ts
├── components.json
└── replit.md
```

## Fișiere Cheie

### 1. package.json
```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --external:node_modules --target=node18",
    "start": "node dist/index.js",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@neondatabase/serverless": "^0.10.8",
    "@radix-ui/react-accordion": "^1.2.2",
    "@radix-ui/react-alert-dialog": "^1.1.4",
    "@radix-ui/react-aspect-ratio": "^1.1.1",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.2",
    "@radix-ui/react-context-menu": "^2.2.4",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-hover-card": "^1.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-menubar": "^1.1.4",
    "@radix-ui/react-navigation-menu": "^1.2.2",
    "@radix-ui/react-popover": "^1.1.4",
    "@radix-ui/react-progress": "^1.1.1",
    "@radix-ui/react-radio-group": "^1.2.2",
    "@radix-ui/react-scroll-area": "^1.2.1",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-separator": "^1.1.1",
    "@radix-ui/react-slider": "^1.2.1",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-switch": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-toggle": "^1.1.1",
    "@radix-ui/react-toggle-group": "^1.1.1",
    "@radix-ui/react-tooltip": "^1.1.7",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.0.5",
    "@tanstack/react-query": "^5.73.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.4",
    "connect-pg-simple": "^10.1.0",
    "date-fns": "^4.1.0",
    "drizzle-orm": "^0.39.0",
    "drizzle-zod": "^0.6.0",
    "embla-carousel-react": "^8.5.3",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "framer-motion": "^11.15.0",
    "html2canvas": "^1.4.1",
    "input-otp": "^1.4.1",
    "jspdf": "^2.5.2",
    "lucide-react": "^0.469.0",
    "memorystore": "^1.6.7",
    "nanoid": "^5.0.9",
    "next-themes": "^0.4.4",
    "nodemailer": "^6.9.20",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "react": "^18.3.1",
    "react-day-picker": "^9.4.4",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "react-icons": "^5.4.0",
    "react-resizable-panels": "^2.1.10",
    "recharts": "^2.13.3",
    "tailwind-merge": "^2.5.5",
    "tailwindcss": "^3.4.16",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.0.1",
    "vaul": "^1.1.1",
    "wouter": "^3.3.8",
    "ws": "^8.18.0",
    "zod": "^3.24.1",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "^5.0.0",
    "@types/express-session": "^1.18.0",
    "@types/node": "^22.10.2",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/ws": "^8.5.13",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.31.4",
    "esbuild": "^0.24.0",
    "postcss": "^8.5.10",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vite": "^5.4.11"
  }
}
```

### 2. Configurare pentru rulare:

**Pasul 1:** Creează un proiect nou Node.js și copiază toate fișierele
**Pasul 2:** Instalează dependențele: `npm install`
**Pasul 3:** Configurează baza de date PostgreSQL
**Pasul 4:** Setează variabila de mediu `DATABASE_URL`
**Pasul 5:** Rulează migrarea: `npm run db:push`
**Pasul 6:** Pornește aplicația: `npm run dev`

### 3. Fișierele principale ale aplicației:

## A. Schema bazei de date (shared/schema.ts)
```typescript
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

// Schema validations și tipuri...
export const insertContractTemplateSchema = createInsertSchema(contractTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertBeneficiarySchema = createInsertSchema(beneficiaries).omit({
  id: true,
  createdAt: true,
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
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

// Relations pentru queries cu join-uri
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
```

## B. Configurare bază de date (server/db.ts)
```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

## C. Pentru a obține toate fișierele:

**Metoda 1:** Creez un repository GitHub public cu codul
**Metoda 2:** Îți afișez fiecare fișier în continuare
**Metoda 3:** Îți dau instrucțiuni să copiezi manual din interfața Replit

Ce preferi? Să continui cu afișarea tuturor fișierelor sau să încerc o altă metodă?