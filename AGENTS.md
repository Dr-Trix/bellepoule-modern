# BellePoule Modern - Agent Instructions

## Project Overview
BellePoule Modern is an Electron desktop application for fencing tournament management. It uses React 19 + TypeScript 5 for the frontend, SQLite via sql.js for data storage, and Webpack 5 for bundling.

## Build & Development Commands

### Primary Commands
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
```

### Packaging
```bash
# Package for current platform
npm run package

# Platform-specific packaging
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
```

### Testing
**Note**: No testing framework is currently configured. When adding tests, set up Jest or Vitest and use:
```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- path/to/test    # Run single test file
```

## Code Style Guidelines

### TypeScript & React
- **Functional components** only (no class components)
- **TypeScript strict mode** - always type props and returns
- **Named imports** preferred over default imports
- **Path aliases** use `@shared/*` for shared code
- **Interfaces** for component props, types for data models

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

// Shared types and utilities
import { Competition, Fencer } from '@shared/types';
import { calculatePoolResults } from '@shared/utils/poolCalculations';

// Local components
import CompetitionList from './components/CompetitionList';
```

### File Organization
```
src/
├── main/           # Electron main process
├── renderer/        # React frontend
│   ├── components/  # React components
│   └── styles/      # CSS files
├── shared/          # Code shared between processes
│   ├── types/       # TypeScript definitions
│   └── utils/       # Business logic
└── database/        # SQLite operations
```

## Architecture Patterns

### Electron IPC
- **Database operations** stay in main process
- **Use preload script** for secure IPC bridge
- **Type-safe interfaces** for all IPC communication
- **Async/await** for all IPC calls

### React Patterns
- **Hooks for state management** (useState, useEffect)
- **Component composition** over inheritance
- **Prop drilling** acceptable for this scale
- **Error boundaries** for error handling

### Database Patterns
- **SQLite with sql.js** for portability
- **UUID primary keys** for all entities
- **Async operations** with proper error handling
- **Transaction safety** for multi-table operations

## CSS & Styling
- **CSS custom properties** for theming
- **BEM-like class naming** (`.component__element--modifier`)
- **Mobile-first responsive design**
- **Utility classes** for common patterns
- **French UI text** (application is in French)

## Error Handling
- **Try-catch blocks** around async operations
- **Console.error** for development logging
- **Error states** in React components
- **User-friendly messages** in French
- **IPC error handling** between processes

## Development Guidelines

### When Adding Features
1. Define TypeScript interfaces first
2. Create React components with proper typing
3. Add database operations in main process
4. Implement IPC communication if needed
5. Add French UI text and error messages

### When Modifying Code
- Follow existing patterns and conventions
- Maintain French language consistency
- Update TypeScript types as needed
- Test IPC communication thoroughly

### Code Quality
- No linting/formatting tools configured yet
- Follow existing code style in the meantime
- Use TypeScript for type safety
- Write self-documenting code with clear variable names

## Localization
- **Primary language**: French
- All UI text, error messages, and user-facing content should be in French
- Date formatting should use French locale
- Comments may be in French or English

## Security Considerations
- **Preload script** is the secure bridge between main and renderer
- Never expose Node.js APIs directly to renderer
- Validate all data coming from renderer process
- Use contextIsolation in Electron configuration

## Performance Notes
- **sql.js** runs in memory, consider database size
- **Webpack** optimization for renderer bundle
- **Electron** process management for responsiveness
- **React** optimization for large lists (virtualization if needed)

## Common Pitfalls to Avoid
- Don't import Node.js modules in renderer process
- Don't bypass the preload script for IPC
- Don't mix French and English in UI text
- Don't forget to handle async operations properly
- Don't ignore TypeScript strict mode errors