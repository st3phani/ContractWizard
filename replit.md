# Contract Manager - Replit Configuration

## Overview

Contract Manager v1.0.0 is a production-ready full-stack web application for managing contracts, beneficiaries, and contract templates. It provides a comprehensive interface for creating, viewing, and managing contract documents with reliable PDF generation and email functionality. The PDF generation system is now fully optimized for Romanian language support with proper character encoding.

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
Four main entities:
1. **Contract Templates** - Reusable contract templates with placeholder fields
2. **Beneficiaries** - Contract recipients with contact information
3. **Contracts** - Contract instances linking templates and beneficiaries
4. **User Profiles** - Administrator profile information with personal details

### API Endpoints
- `/api/contract-templates` - CRUD operations for contract templates
- `/api/beneficiaries` - CRUD operations for beneficiaries
- `/api/contracts` - CRUD operations for contracts
- `/api/contracts/stats` - Contract statistics dashboard
- `/api/user-profile` - GET/PUT operations for administrator profile management

### Frontend Pages
- **Dashboard** - Overview with statistics and recent contracts
- **Contract Form** - Create new contracts with beneficiary information
- **Templates** - Manage contract templates
- **Beneficiaries** - Manage beneficiary database with CRUD operations
- **Profile** - Administrator profile management with form validation and database persistence
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

### PDF Generation Dependencies
- **jsPDF**: Client-side PDF generation library (v1.0.0 optimized)
- **Custom Romanian Character Encoding**: Production-ready solution for ă, â, î, ș, ț

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
├── utils/           # Utility functions (PDF generation, etc.)
├── migrations/      # Database migrations
└── dist/           # Build output
```

## Changelog

```
Changelog:

- July 29, 2025. **SIGNED CONTRACT PAGE WITH AUTO STATUS UPDATE** - Created signed-contract.tsx page for viewing signed contracts via unique tokens, resolving 404 errors for signed contract links. Added automatic status update to "Finalizat" (completed) when signed contract page is accessed for the first time. Page displays comprehensive contract details, beneficiary information, provider data, signing audit trail, and download functionality.
- July 29, 2025. **EMAIL NOTIFICATION BUG FIX** - Fixed email notification error after contract signing by ensuring complete contract data with all relations (beneficiary, template, status) is retrieved after signing. Added safety checks in email functions to prevent undefined property access. Signing process now gets full contract details before sending notifications.
- July 29, 2025. **CONTRACT SENDING STATUS UPDATE** - Updated contract sending system to use new "Trimis" (sent) status instead of "În Așteptare" when contracts are sent for signing. Added sent status restriction to prevent sending already sent contracts. Updated confirmation dialog and UI components to reflect new "Trimis" status. Status ID 5 now used for sent contracts with yellow badge color.
- July 29, 2025. **SIGNED CONTRACT EMAIL NOTIFICATIONS** - Implemented automatic email system that sends notifications to both beneficiary and administrator after contract signing. Beneficiary receives confirmation email with contract details and signed token access link. Administrator receives notification email with complete signing audit trail including IP address, timestamp, and contract details. Email system integrates with user profile to get admin email address and includes all success page information in structured HTML format.
- July 29, 2025. **ACTION BUTTONS COLOR SYSTEM** - Added distinctive colors for each action button in contracts table and modals. Preview (blue), Edit (green), Download (indigo), Send to Sign (purple), Delete (red). Each action has unique color scheme with matching hover backgrounds. Disabled buttons maintain gray opacity styling for clear visual feedback.
- July 29, 2025. **SIGNED CONTRACT TOKEN SYSTEM** - Added unique token generation for signed contracts separate from signing tokens. Added signedToken field to contracts table, generates 32-character unique token when contract is signed, and displays token on success page. Created API endpoint (/api/contracts/signed/:token) for accessing signed contracts via their unique token. This provides secure access to signed contract details using the generated token. Fixed success page to display actual signed contract data including IP address and signed token.
- July 29, 2025. **IP ADDRESS TRACKING FOR CONTRACT SIGNING** - Added IP address capture and storage when contracts are digitally signed. Added signedIp field to contracts table, updated backend to capture client IP using Express trust proxy configuration, and modified signing process to save IP address alongside signature timestamp and name. Success page now displays IP address for signed contracts, providing audit trail for digital signatures.
- July 29, 2025. **PROVIDER DATA CENTRALIZED** - Eliminated provider fields from contracts table and moved provider data to centralized company settings. All contracts now use provider data from company_settings table instead of storing duplicate provider information in each contract. Updated database schema, storage methods, API routes, and frontend components to use contract.provider from company settings. This improves data consistency and reduces redundancy across the application.
- July 29, 2025. **CONTRACT SIGNING PAGE ENHANCED** - Added contract preview icon with modal on signing page, replaced template name display with contract creation date for better context. Beneficiaries can now preview full contract content before signing and see when contract was originally created.
- July 29, 2025. **DIRECT EMAIL SENDING SYSTEM COMPLETED** - Eliminated email configuration modal - butonul "Trimite la Semnat" now sends emails directly with unique signing links using Replit domain (REPLIT_DEV_DOMAIN). Email system generates tokens automatically, sends to beneficiary email with proper signing URL (https://[domain].replit.dev/sign-contract/[token]), and updates contract status. Console logging shows complete email details including signing link for development testing.
- July 29, 2025. **CONTRACT SIGNING SYSTEM COMPLETED** - Implemented complete digital contract signing system with unique signing tokens, public signing page, and email integration. Added database fields (signedAt, signedBy, signingToken), public API endpoints (/api/contracts/sign/:token), and React signing page accessible without authentication. Email templates now include signing links that direct beneficiaries to secure signing interface with contract preview, beneficiary validation, and digital signature capture. System automatically updates contract status to "signed" upon completion and logs signing details.
- July 29, 2025. **EMAIL TESTING ENVIRONMENT IMPLEMENTED** - Created comprehensive email testing system using nodemailer with console logging and file-based email logs for development. Implemented email-test.tsx component in Settings page, server/email.ts with development transport, API endpoints for email logs management, and detailed documentation. Email system logs all sent emails to console and JSON file, provides testing interface, and works without external dependencies like MailHog.
- July 29, 2025. **EMAIL BUTTON REBRANDING TO SIGNATURE** - Changed email button text from "Trimite contractul prin email" to "Trimite la semnat" and replaced Mail icon with PenTool icon across all components (contract-table.tsx, email-modal.tsx, contract-modal.tsx). Updated titles, aria-labels, and dialog headers to reflect signing focus rather than generic email sending.
- July 29, 2025. **SETTINGS PAGE SECTION REORDERING** - Moved "Gestionare Date" (Data Management) section to bottom of Settings page as the last section. New order: Company Settings, System Settings, Contract Statuses (read-only), Data Management.
- July 29, 2025. **CONTRACT STATUS READ-ONLY MODE** - Removed edit and delete buttons from Contract Status section in Settings page. Eliminated all CRUD functionality including dialog, mutations, handlers, and form state. Contract statuses now display in read-only mode showing only status code, label, and description. Cleaned up imports for Edit, Trash2 icons and Dialog components.
- July 29, 2025. **SETTINGS PAGE CLEANUP** - Removed "Setări Notificări" section from Settings page including notification state, handler function, and entire Card component. Cleaned up Bell icon import. Settings page now focuses on Company Settings, System Settings, and Contract Status management only.
- July 29, 2025. **COMPLETE STICKY NAVIGATION IMPLEMENTATION SUCCESSFUL** - Successfully implemented header and sidebar sticky positioning across all 7 application pages (Dashboard, Contracts, Beneficiaries, Templates, Profile, Settings, Contract Form). All sidebars wrapped in sticky container with h-screen, all headers use Tailwind classes 'sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm' for reliable sticky positioning. Main containers use 'main-container' CSS class (height: 100vh, overflow-y: auto) to properly support sticky behavior. Navigation now fully consistent and functional across entire application - confirmed working by user.
- July 29, 2025. **STATUS MANAGEMENT RESTRICTIONS** - Removed "Adaugă Status" button and functionality from Settings page. Users can now only edit and delete existing contract statuses, preventing creation of new status types to maintain system consistency.
- July 29, 2025. **STATUS COLOR UPDATE** - Modified "În Așteptare" status color to orange (bg-orange-100 text-orange-800) in getStatusColor function. Added compatibility for "pending" and "pandding" status codes to ensure proper color display.
- July 29, 2025. **CONTRACT STATUS MANAGEMENT SYSTEM COMPLETED** - Implemented complete database-driven contract status system with contract_statuses table, API routes, and Settings page management interface. Migrated all 77 existing contracts from hardcoded status strings to status_id relationships. Fixed frontend components to display status from database relations instead of "Necunoscut".
- July 29, 2025. **CONTRACT STATUS UPDATE** - Changed contract status from "Trimise" to "Semnate" (sent to signed) across entire application. Updated schema, backend storage methods, frontend components, and UI labels. Status now correctly reflects beneficiary's signed state rather than just email sent status.
- July 29, 2025. **TEMPLATE MANAGEMENT ENHANCED** - Added "Duplicare" and "Previzualizare" buttons to template actions. Duplicate creates copy with " - Copie" suffix. Preview shows template content with variable detection, conditional logic indicators, and usage information in comprehensive modal.
- July 29, 2025. **CONDITIONAL TEMPLATE SYSTEM** - Implemented conditional logic in contract templates allowing different content for Persoană Fizică vs Persoană Juridică. Added support for {{#if isCompany}}, {{#if isIndividual}}, {{#unless}} blocks in templates. Created comprehensive template with conditions demo and documentation guide.
- July 22, 2025. **REVERTED EU ENTITY CATEGORY** - Reverted implementation of third beneficiary category "Persoană Juridică UE" back to original two-category system (Persoană Fizică / Companie). Database cleaned, schema restored, and all EU-specific fields removed from forms and display logic.
- July 22, 2025. **USER PROFILE MANAGEMENT SYSTEM COMPLETED** - Implemented complete user profile management with PostgreSQL database storage. Added user_profiles table, API routes (/api/user-profile GET/PUT), and fully functional profile page with form validation, loading states, and success/error messaging. Administrator profile data now persists in database and can be updated through the profile page accessible via sidebar dropdown menu.
- July 22, 2025. **ADMINISTRATOR PROFILE MOVED TO SIDEBAR** - Moved administrator profile from header to left sidebar bottom section in same format as menu items. Profile includes avatar with "AD" initials, name, email, and dropdown with Profil/Setări/Deconectare options. Removed profile from dashboard and settings headers for cleaner UI. Settings accessible only through profile dropdown, removed from main navigation menu.
- July 22, 2025. **CONTRACTS PAGE PAGINATION CLEANUP** - Removed items-per-page dropdown from header, keeping only search and status filter. Pagination controls (including items-per-page) now exclusively in footer using paginationUtils.ts for consistency with beneficiaries page.
- July 22, 2025. **CONTRACTS PAGE PAGINATION REFACTOR** - Updated contract-table.tsx to use paginationUtils.ts for consistent pagination across the application. Replaced manual pagination calculations with standardized utility functions, improving code reusability and maintainability.
- July 22, 2025. **PAGINATION UTILITIES REFACTOR** - Extracted pagination logic from Beneficiaries page into reusable paginationUtils.ts. Created comprehensive pagination utilities with validation, page number generation, and standardized pagination interface. Improved code reusability while maintaining all existing functionality.
- July 22, 2025. **PDF GENERATION v1.0.9 STABLE** - Achieved production-ready PDF generation with standardized Arial font family across editor, preview, and PDF output. Complete elimination of font family selection from editor ensures consistent formatting. Clean title formatting, Romanian character encoding, bold text support, and optimal text wrapping maintained. **Status: Production Stable**
- July 22, 2025. **PDF GENERATION v1.0.7 PERFECTED** - Achieved perfect PDF generation with clean title formatting, complete elimination of formatting markers, Romanian character encoding, bold text support, and optimal text wrapping. Title displays cleanly as "CONTRACT Nr. X din DD.MM.YYYY" without asterisks. Text fits perfectly within margins with proper word wrapping. **Status: Production Perfect**
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