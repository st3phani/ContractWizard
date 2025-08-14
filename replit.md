# Contract Manager - Replit Configuration

## Overview
Contract Manager v1.0.0 is a full-stack web application designed for comprehensive management of contracts, beneficiaries (now referred to as partners), and contract templates. It offers robust features for creating, viewing, and managing contract documents, including reliable PDF generation with optimized Romanian language support and email functionality. The project aims to provide a streamlined solution for contract lifecycle management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Technologies
- **Frontend**: React 18 with TypeScript, Radix UI (shadcn/ui), Tailwind CSS, TanStack Query, Wouter, React Hook Form with Zod, Vite.
- **Backend**: Node.js with Express.js, TypeScript, Drizzle ORM, PostgreSQL (Neon Database).
- **PDF Generation**: jsPDF with custom Romanian character encoding.

### Recent Changes (August 14, 2025)
- **Contract Form Fix**: Resolved "Generate Contract" button validation issue by adjusting Zod schema validation for address field in individual beneficiaries
- **Form Validation**: Improved form validation user experience with better error messaging and field focus handling
- **UI Enhancement**: Added editable address field in contract form for individual partners to ensure complete beneficiary data

### Data Model
- **Entities**: Contract Templates, Beneficiaries (Partners), Contracts, User Profiles.
- **Schema**: Centralized definitions in `shared/schema.ts` with Drizzle ORM for type-safe operations.
- **Database**: PostgreSQL with Neon Database for serverless deployment.

### Key Features
- **Contract Management**: CRUD operations for contracts, including status tracking (draft, sent, signed, completed).
- **Template System**: Reusable contract templates with placeholder and conditional logic (`{{#if isCompany}}`).
- **Partner Management**: CRUD operations for contract recipients (formerly beneficiaries).
- **User Profile**: Administrator profile management with persistent storage.
- **Digital Signing**: Secure digital signing process with unique tokens, IP tracking, and audit trails.
- **Email Integration**: Direct email sending of contracts for signing, and automated notifications upon signing.
- **PDF Generation**: Robust PDF output with consistent styling, digital signature display, and dynamic content.
- **System Settings**: Configurable application settings (language, currency, date format) stored in the database.
- **Dashboard**: Overview of recent contracts and statistics.
- **UI/UX**: Consistent design using Radix UI, shadcn/ui, and Tailwind CSS. Sticky navigation, color-coded action buttons, and responsive layouts.

### System Design Choices
- **State Management**: TanStack Query for efficient server state management.
- **Form Validation**: Zod for schema validation integrated with React Hook Form.
- **Build Process**: Vite for frontend, ESBuild for backend.
- **Data Persistence**: Drizzle ORM with PostgreSQL ensuring type safety and robust data handling.
- **Modularity**: Separation of frontend, backend, and shared code.
- **Cron Jobs**: Scheduled tasks for contract status updates and maintenance.

## External Dependencies

- **Radix UI**: UI component library.
- **TanStack Query**: Server state management.
- **React Hook Form**: Form management.
- **Zod**: Schema validation.
- **Tailwind CSS**: Styling framework.
- **Wouter**: Client-side routing.
- **Drizzle ORM**: Database ORM.
- **Neon Database**: Serverless PostgreSQL provider.
- **Express.js**: Backend web framework.
- **jsPDF**: Client-side PDF generation.
- **Nodemailer**: Email sending (for development testing).