# BellePoule Modern - Agent Instructions

## Project Overview

BellePoule Modern is an Electron desktop application for fencing tournament management. It uses React 19 + TypeScript 5 for the frontend, SQLite via sql.js for data storage, and Webpack 5 for bundling.

**Version:** v1.0.1 Build #203+  
**Last Updated:** February 2026

## Build & Development Commands

```bash
# Start the application (build + run)
npm start

# Development mode with hot reload
npm run dev

# Build all code
npm run build

# Build main process only
npm run build:main

# Build renderer process only
npm run build:renderer

# Packaging
npm run package           # Package for current platform
npm run package:win       # Windows
npm run package:mac       # macOS
npm run package:mac-arm   # macOS ARM64
npm run package:linux     # Linux

# Unit Testing (Vitest)
npm test                  # Run tests in watch mode
npm run test:run          # Run tests once
npm run test:coverage     # Run tests with coverage
npx vitest run path/to/file.test.ts  # Run single test file

# E2E Testing (Playwright)
npm run test:e2e          # Run E2E tests headless
npm run test:e2e:ui       # Run E2E tests with UI
npm run test:e2e:headed   # Run E2E tests headed (visible browser)

# Linting & Formatting
npm run lint              # Check for linting errors
npm run lint:fix          # Fix linting errors
npm run format            # Format all files with Prettier
npm run format:check      # Check formatting without fixing
```

## Code Style Guidelines

### TypeScript & React

- **Functional components** only (no class components)
- **TypeScript strict mode** - always type props and returns
- **Interfaces** for component props, types for data models
- **React.FC** typing for components: `const Component: React.FC<Props> = () => {}`

### Naming Conventions

- **Components**: PascalCase (`CompetitionList.tsx`)
- **Utilities**: camelCase (`poolCalculations.ts`)
- **Types/Interfaces**: PascalCase (`Fencer`, `Competition`)
- **Enums**: PascalCase with UPPER_CASE values (`Weapon.EPEE`)
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE

### Import Patterns

```typescript
// React imports first
import React, { useState, useEffect } from 'react';

// Third-party libraries
import { v4 as uuidv4 } from 'uuid';

// Shared types and utilities (use relative paths)
import { Competition, Fencer } from '../../shared/types';
import { calculatePoolResults } from '../../shared/utils/poolCalculations';

// Local components
import CompetitionList from './components/CompetitionList';
```

### File Organization

```
src/
├── main/           # Electron main process
├── renderer/       # React frontend
│   ├── components/ # React components
│   ├── hooks/      # Custom React hooks
│   └── styles/     # CSS files
├── features/       # Feature-based modules (NEW)
│   ├── competition/# Competition CRUD + store
│   ├── pools/      # Pool management + store
│   ├── bracket/    # Elimination bracket + store
│   └── analytics/  # Statistics + store
├── shared/         # Code shared between processes
│   ├── types/      # TypeScript definitions
│   ├── utils/      # Business logic
│   │   ├── poolCalculations.ts
│   │   ├── bulkImport.ts         # CSV/Excel import
│   │   ├── tournamentTemplates.ts # Competition templates
│   │   └── errorLogger.ts        # Error tracking
│   └── services/   # Shared services
│       ├── cloudSyncService.ts   # Cloud backup
│       ├── notificationService.ts # Notifications
│       ├── performanceService.ts # Caching & monitoring
│       └── refereeManager.ts     # Referee management
├── database/       # SQLite operations
├── e2e/            # E2E tests (Playwright)
│   ├── app.spec.ts
│   ├── competition.spec.ts
│   ├── pools.spec.ts
│   └── accessibility.spec.ts
└── *.test.ts       # Unit tests
```

src/
├── main/ # Electron main process
├── renderer/ # React frontend
│ ├── components/ # React components
│ └── styles/ # CSS files
├── shared/ # Code shared between processes
│ ├── types/ # TypeScript definitions
│ └── utils/ # Business logic
│ ├── poolCalculations.ts
│ ├── bulkImport.ts # CSV/Excel import
│ ├── tournamentTemplates.ts # Competition templates
│ └── errorLogger.ts # Error tracking
├── database/ # SQLite operations
└── \*.test.ts # Unit tests

````

## Architecture Patterns

### Electron IPC

- **Database operations** stay in main process
- **Use preload script** for secure IPC bridge
- **Type-safe interfaces** for all IPC communication
- **Async/await** for all IPC calls

### React Patterns
- **Zustand for global state** - Primary state management with stores per feature
- **Hooks for local state** (useState, useEffect) for component-level state
- **Component composition** over inheritance
- **Prop drilling** acceptable for this scale
- **Error boundaries** for error handling

### State Management with Zustand
```typescript
// Import from feature stores
import { useCompetitionStore } from '../../features/competition/hooks/useCompetitionStore';
import { usePoolStore } from '../../features/pools/hooks/usePoolStore';

// Use in components
const { competitions, loadCompetitions } = useCompetitionStore();
````

**Zustand Store Pattern:**

- Each feature has its own store in `features/{feature}/hooks/use{Feature}Store.ts`
- Stores use Immer for immutable mutations
- Persist middleware for local storage
- DevTools middleware for Redux DevTools integration

### Feature-Based Architecture

```typescript
// Import from features
import { CompetitionList, useCompetitionStore } from '../../features/competition';
import { PoolView, usePoolStore } from '../../features/pools';
```

### Database Patterns

- **SQLite with sql.js** for portability
- **UUID primary keys** for all entities
- **Async operations** with proper error handling
- **Transaction safety** for multi-table operations

## CSS & Styling

- **CSS custom properties** for theming
- **BEM-like class naming** (`.component__element--modifier`)
- **Utility classes** for common patterns
- **French UI text** (application is in French)

## Error Handling

- **Try-catch blocks** around async operations
- **Console.error** for development logging
- **Error states** in React components
- **User-friendly messages** in French
- **IPC error handling** between processes

## Localization

- **Primary language**: French
- **Supported languages**: French (fr), English (en), Breton (br), Spanish (es), German (de)
- All UI text, error messages, and user-facing content should be in French
- Translation files in `src/renderer/locales/{lang}.json`
- Date formatting uses French locale (`'fr-FR'`)
- Comments may be in French or English

## Security Considerations

- **Preload script** is the secure bridge between main and renderer
- Never expose Node.js APIs directly to renderer
- Validate all data coming from renderer process
- Use contextIsolation in Electron configuration

## Development Guidelines

### When Adding Features

1. Define TypeScript interfaces first
2. Create React components with proper typing
3. Add database operations in main process
4. Implement IPC communication if needed
5. Add French UI text and error messages

### Code Quality

- **ESLint + Prettier** configured - run before committing
- **Tests** - Write tests for utilities and business logic
- Follow existing code style
- Use TypeScript for type safety
- Write self-documenting code with clear variable names

### Testing Guidelines

- Place test files next to source files: `*.test.ts`
- Test utilities and business logic thoroughly
- Use descriptive test names
- Test edge cases and error conditions

## Recently Implemented Features (Feb 2026)

### New Components & Services

- **RefereeManager** (`src/shared/services/refereeManager.ts`) - Advanced referee assignment with conflict detection
- **LiveDashboard** (`src/renderer/components/LiveDashboard.tsx`) - Public-facing real-time display
- **NotificationService** (`src/shared/services/notificationService.ts`) - Browser notifications & webhooks
- **CloudSyncService** (`src/shared/services/cloudSyncService.ts`) - Multi-provider cloud backup with encryption
- **PerformanceService** (`src/shared/services/performanceService.ts`) - Caching, virtual lists, monitoring
- **FencerPhoto** (`src/renderer/components/FencerPhoto.tsx`) - Photo management with drag-drop upload

### State Management Migration

- Zustand stores created for all features (competition, pools, bracket, analytics)
- Immer middleware for immutable mutations
- Persist middleware for local storage
- DevTools integration for debugging

### Testing Infrastructure

- Playwright configured for E2E testing
- Test files in `e2e/` directory
- Multi-browser support (Chrome, Firefox, Safari)
- Mobile testing support (Pixel 5, iPhone 12)

## Common Pitfalls to Avoid

- Don't import Node.js modules in renderer process
- Don't bypass the preload script for IPC
- Don't mix French and English in UI text
- Don't forget to handle async operations properly
- Don't ignore TypeScript strict mode errors
- Use relative imports (../../shared) not path aliases (@shared)
- Don't use console.log in production code (use proper logging service instead)

```

```
