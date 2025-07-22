# Contract Manager - Replit Configuration

## Overview

Contract Manager is a full-stack web application for managing contracts, beneficiaries, and contract templates. It provides a comprehensive interface for creating, viewing, and managing contract documents with PDF generation and email functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and build process

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Built-in session handling
- **API Structure**: RESTful API with Express routes

### Data Storage Solutions
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless) - **ACTIVE**
- **Schema**: Centralized schema definitions in `shared/schema.ts` with relations
- **Storage**: DatabaseStorage class replaces MemStorage for persistent data
- **Migrations**: Schema pushed via `npm run db:push`

## Key Components

### Database Schema
Three main entities:
1. **Contract Templates** - Reusable contract templates with placeholder fields
2. **Beneficiaries** - Contract recipients with contact information
3. **Contracts** - Contract instances linking templates and beneficiaries

### API Endpoints
- `/api/contract-templates` - CRUD operations for contract templates
- `/api/beneficiaries` - CRUD operations for beneficiaries
- `/api/contracts` - CRUD operations for contracts
- `/api/contracts/stats` - Contract statistics dashboard

### Frontend Pages
- **Dashboard** - Overview with statistics and recent contracts
- **Contract Form** - Create new contracts with beneficiary information
- **Templates** - Manage contract templates
- **Beneficiaries** - Manage beneficiary database with CRUD operations
- **Settings** - Application configuration and company information
- **Not Found** - 404 error page

### UI Components
- **Sidebar** - Navigation component
- **Contract Table** - Display contracts with filtering and actions
- **Contract Modal** - Preview and manage individual contracts
- **Email Modal** - Send contracts via email
- **Stats Cards** - Display contract statistics

## Data Flow

1. **Contract Creation**: User creates contract through form, selecting template and entering beneficiary data
2. **Template Processing**: Contract templates use placeholder syntax (`{{field}}`) for dynamic content
3. **PDF Generation**: Contracts can be converted to PDF format for download
4. **Email Delivery**: Contracts can be sent via email with PDF attachments
5. **Status Tracking**: Contracts track status (draft, sent, completed) with timestamps

## External Dependencies

### Frontend Dependencies
- **Radix UI**: Comprehensive UI component library
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form validation and handling
- **Zod**: Schema validation
- **Tailwind CSS**: Utility-first CSS framework
- **Wouter**: Lightweight routing library

### Backend Dependencies
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: Serverless PostgreSQL provider
- **Express.js**: Web framework
- **Zod**: Schema validation (shared with frontend)

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Static Assets**: Frontend assets served from `dist/public`

### Environment Configuration
- **Development**: Uses `tsx` for TypeScript execution
- **Production**: Compiled JavaScript execution
- **Database**: Requires `DATABASE_URL` environment variable

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript definitions
├── migrations/      # Database migrations
└── dist/           # Build output
```

## Changelog

```
Changelog:

- July 22, 2025. Fixed PDF generation and formatting - replaced puppeteer with jsPDF for reliable PDF creation without browser dependencies, improved margins and text wrapping to prevent content overflow
- July 22, 2025. Added ID column to beneficiaries table and implemented descending ID sorting for newest-first display
- July 22, 2025. Fixed beneficiary creation for companies by correcting form field mapping and removing duplicate representative fields
- July 22, 2025. Resolved backend API route missing for beneficiary updates (PUT /api/beneficiaries/:id) 
- July 22, 2025. Removed restrictive schema validation that was blocking company beneficiary creation
- July 22, 2025. Added pagination system to Beneficiaries page with configurable items per page (5, 10, 20, 50) and navigation controls
- July 22, 2025. Enhanced Beneficiaries page with search functionality across name, email, company, CNP and CUI fields
- July 22, 2025. Modified Beneficiaries display to show company name instead of address, and both CNP/CUI in single column
- July 22, 2025. Added unique background colors for beneficiary avatars based on name hash with 16-color palette
- July 22, 2025. Improved beneficiary avatar initials to show first letter of first and last name instead of first two characters
- July 22, 2025. Added reserved contracts counter to dashboard stats with purple calendar icon and 5-column layout
- July 22, 2025. Implemented pagination for contract table with configurable items per page (5, 10, 20, 50) and navigation controls
- July 22, 2025. Fixed contract editing functionality by removing strict validation in edit mode that was preventing updates
- July 22, 2025. Added restrictions for reserved contracts - disabled preview, download, and email actions with opaque icons
- July 22, 2025. Modified contract reservation system to not create temporary beneficiaries - reserved contracts now use beneficiary_id = 0 instead
- July 22, 2025. Updated contract sorting to use contract ID in descending order for both dashboard and contracts page
- July 22, 2025. Implemented contract deletion restriction - only the latest contract (highest order number) can be deleted, with disabled/opaque delete button for other contracts
- July 22, 2025. Completed comprehensive contract editing functionality with all data fields saving correctly to PostgreSQL database
- July 22, 2025. Fixed contract date fields (start date and end date) not saving during contract updates by simplifying date processing
- July 22, 2025. Resolved template selection display issue in edit mode by adding proper value binding to Select component
- July 22, 2025. Added automatic status change from "reserved" to "draft" when editing reserved contracts
- July 22, 2025. Enhanced Rich Text Editor (TipTap) with advanced table functionality: insert/delete rows/columns, toggle border, and real-time table detection
- July 22, 2025. Fixed table toolbar visibility issues with state management for accurate cursor position tracking in table elements
- July 22, 2025. Implemented comprehensive table editing capabilities with border removal option for cleaner document formatting
- July 22, 2025. Modified contract order numbering to use sequential integers (1, 2, 3...) instead of complex format strings
- July 22, 2025. Updated database schema to change order_number column from text to integer type
- July 22, 2025. Fixed contract table component to handle integer order numbers and null values gracefully
- July 22, 2025. Implemented system settings with date format configuration that applies to all contract forms
- July 22, 2025. Added system_settings table to database with support for language, currency, date format, and auto backup settings
- July 22, 2025. Created dateUtils library for consistent date formatting across application using configurable formats (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- July 22, 2025. Added API routes for system settings management (/api/system-settings)
- July 22, 2025. Updated contract form to use date format from system settings instead of hardcoded format
- July 22, 2025. Fixed contracts page header to match other pages with consistent styling and added "Contract Nou" button
- July 21, 2025. Created dedicated Contracts page with full CRUD functionality and added to navigation menu
- July 21, 2025. Completed full migration from "fullName" to "name" field across entire application
- July 21, 2025. Fixed database schema - removed old "full_name" column and migrated data to "name" column
- July 21, 2025. Updated all frontend components to use "name" field: contract-table, beneficiary-form-fields, beneficiary-form-modal, templates
- July 21, 2025. Fixed backend storage methods and API mutations to return proper objects instead of Response objects
- July 21, 2025. Updated contract templates in database to use {{beneficiary.name}} instead of {{beneficiary.fullName}}
- July 21, 2025. Made contract fields mandatory with proper validation: "Valoare Contract", "Data Începerii", "Data Încheierii"
- July 21, 2025. Started code refactoring - created reusable BeneficiaryFormFields component to eliminate duplicate beneficiary form code
- July 21, 2025. Created BeneficiaryFormModal component for consistent beneficiary form handling across pages
- July 21, 2025. Uniformized validation across all forms - removed success notifications, error messages under fields, and made labels black
- July 21, 2025. Implemented consistent field validation with red borders and focus management on all forms
- July 21, 2025. Fixed contract template deletion functionality - added DELETE route and mutation
- July 21, 2025. Fixed ContractModal to use backend API instead of local function for proper variable population
- July 21, 2025. Standardized template system to use only {{...}} format for all variables
- July 21, 2025. Fixed contract table to handle deleted templates gracefully
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```