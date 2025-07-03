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
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Centralized schema definitions in `shared/schema.ts`
- **Migrations**: Drizzle migrations in `./migrations` directory

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
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```