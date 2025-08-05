# Shared Package

Shared TypeScript interfaces and schemas for AI News Platform.

## Features

- Common TypeScript types and interfaces
- Generated TypeScript types from OpenAPI specification
- Validation helpers for enum types
- Shared between frontend and backend packages

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode compilation
- `npm run clean` - Remove dist directory
- `npm run type-check` - Type checking without compilation
- `npm run lint` - Lint TypeScript files
- `npm run generate-types` - Generate types from OpenAPI specification

## Usage

```typescript
import { 
  PoliticalPerspective, 
  WritingTone, 
  BaseUserPreferences 
} from '@ai-news-platform/shared';

// Generated API types
import type { components } from '@ai-news-platform/shared';
type User = components['schemas']['User'];
```

## Type Generation

Types are automatically generated from the OpenAPI specification:

```bash
npm run generate-types
```

This reads the OpenAPI spec at `../api-spec/openapi.yaml` and generates TypeScript types in `src/generated/api-types.ts`.