# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `yarn dev` - Start development server on port 8083 with Turbopack
- `yarn start` - Start production server on port 8083

### Build
- `yarn build` - Build the application for production
- `next build` - Alternative build command

### Code Quality
- `yarn lint` - Run ESLint on src files
- `yarn lint:fix` - Fix ESLint issues automatically
- `yarn fm:check` - Check code formatting with Prettier
- `yarn fm:fix` - Fix code formatting with Prettier
- `yarn fix:all` - Run both lint:fix and fm:fix

### TypeScript
- `yarn tsc:watch` - Run TypeScript compiler in watch mode
- `tsc --noEmit` - Type check without emitting files

### Clean & Reset
- `yarn clean` - Remove node_modules, .next, out, dist, build
- `yarn re:dev` - Clean, install, and start dev server

## Architecture

### Core Framework
- **Next.js 15** with App Router architecture
- **TypeScript** with strict type checking
- **Material-UI v7** as the primary UI framework
- **React 19** with React Hook Form for form management

### Authentication
- JWT-based authentication system (`src/auth/context/jwt/`)
- Role-based access control with predefined roles:
  - ADMINISTRADOR, TI, COORDINADOR_DE_SERVICIOS
  - ASESOR_INMOBILIARIO, MARKETING, ADMINISTRADOR_DE_EMPRESA
- Auth guards for protected routes (`src/auth/guard/`)

### State Management
- SWR for server state management
- React Context for authentication and settings
- Form state managed by React Hook Form with Zod validation

### Project Structure
- `src/app/` - Next.js App Router pages
- `src/actions/` - Server actions for data fetching
- `src/components/` - Reusable UI components
- `src/sections/` - Page-specific components
- `src/types/` - TypeScript type definitions
- `src/auth/` - Authentication system
- `src/layouts/` - Layout components with navigation
- `src/theme/` - Material-UI theme configuration

### Key Features
- Real estate management system with properties, clients, owners
- Role-based navigation (`src/layouts/nav-config-dashboard.tsx`)
- Multi-language support (Spanish primary)
- File management system
- Cash flow management
- Commission calculations

### Styling
- Material-UI with custom theme configuration
- CSS-in-JS with emotion
- Responsive design patterns
- Custom component library in `src/components/`

### Form Handling
- React Hook Form with Zod schema validation
- Custom form components in `src/components/hook-form/`
- Consistent form patterns across the application

### Data Flow
- Server actions in `src/actions/` for API calls
- SWR hooks for data fetching and caching
- Type-safe API responses with TypeScript

### Development Guidelines
- Use existing component patterns from `src/components/`
- Follow Material-UI theming conventions
- Implement proper TypeScript types for all new features
- Use role-based access control for sensitive features
- Follow the established folder structure for new components