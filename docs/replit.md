# Overview

Log & Ledger is a global accounting application built for web, Android, and iOS platforms. It's designed as a professional, multi-company accounting system supporting 15+ languages including RTL languages like Arabic. The application features offline-first architecture with cloud synchronization, multi-currency support, flexible taxation systems, and comprehensive financial management capabilities. Built with React/TypeScript frontend, Express.js backend, and PostgreSQL database using Drizzle ORM.

## Recent Updates (September 2025)

### Mobile Responsiveness Implementation
- **Complete mobile responsive design**: Eliminated horizontal overflow on all mobile devices (320px-414px widths)
- **CSS Architecture**: Implemented comprehensive responsive utilities with mobile-first approach
- **Dialog Responsiveness**: Fixed modal and dialog sizing to properly fit mobile viewports
- **Safe CSS Practices**: Refined CSS to avoid aggressive global rules that could break components
- **Testing**: Verified responsive behavior on iPhone 13 viewport (414x896) across all pages and dialogs

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as build tool
- **Styling**: Tailwind CSS with shadcn/ui component library following Material Design principles
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom CSS variables supporting light/dark/auto modes with system preference detection
- **Internationalization**: Multi-language support for 15 languages with RTL/LTR text direction handling
- **Component Architecture**: Modular shadcn/ui components with custom business logic components

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express-session for authentication state
- **Authentication**: Email/password based with bcrypt password hashing
- **API Design**: RESTful endpoints with JSON responses
- **Error Handling**: Centralized error handling with validation using Zod schemas
- **Middleware**: Request logging, authentication guards, and CORS handling

## Database Design
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema Management**: Drizzle migrations with TypeScript schema definitions
- **Multi-tenancy**: Company-based data isolation with foreign key relationships
- **Key Entities**: Companies, Users, Accounts (Chart of Accounts), with role-based access control

## Authentication & Authorization
- **Session-based Authentication**: Server-side sessions with HTTP-only cookies
- **Role System**: Four user roles (owner, accountant, sales, viewer) with permission matrix
- **Multi-company Support**: Users can belong to and switch between multiple companies
- **Security**: Password hashing with bcrypt, session timeouts, and secure cookie configuration

## Offline-First Strategy
- **Client Storage**: IndexedDB for web, native local storage for mobile
- **Sync Architecture**: Background synchronization with conflict resolution using last-write-wins
- **Data Merging**: Two-way sync between local encrypted storage and cloud database
- **Audit Trail**: Complete change tracking for conflict resolution and compliance

## Business Logic Architecture
- **Multi-currency**: Base currency with exchange rate tracking for international transactions
- **Tax Engine**: Flexible global tax configuration supporting VAT, Sales Tax, Corporate Tax, and custom rates
- **Chart of Accounts**: Hierarchical account structure with configurable account types and subtypes
- **Document Management**: File attachments with OCR integration for automated data extraction

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database for cloud storage and scalability
- **Session Store**: In-memory session storage (production should use Redis or database-backed sessions)
- **File Storage**: Local file system (should be replaced with cloud storage like AWS S3 for production)

## Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Type System**: TypeScript for type safety across frontend and backend
- **Database ORM**: Drizzle with PostgreSQL dialect for type-safe database operations
- **Validation**: Zod for runtime type validation and schema definition

## UI Framework
- **Component Library**: Radix UI primitives with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Icons**: Lucide React for consistent iconography
- **Charts**: Recharts for financial data visualization
- **Forms**: React Hook Form with Zod validation for form management

## Planned Integrations
- **Email Service**: SendGrid for transactional emails and notifications
- **Payment Processing**: Stripe for subscription management and payment processing
- **Advertising**: AdMob for mobile banner ads and web sidebar advertisements
- **OCR Service**: Planned integration for automatic invoice and receipt data extraction
- **Cloud Backup**: Automated backup service integration for data protection