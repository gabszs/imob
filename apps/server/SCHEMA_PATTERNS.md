# Backend Schema Organization Patterns

This document describes the standard patterns for organizing types and schemas in the backend codebase.

## Overview

The backend follows a feature-based architecture where each feature has its own folder containing:
- `schemas.ts` - Zod schemas and TypeScript type definitions
- `repository.ts` - Data access layer
- `service.ts` - Business logic
- `routes.ts` - API endpoints

## Schema Pattern by Data Source

### 1. SQL-Backed Features (Using D1/SQLite)

For features backed by Drizzle ORM tables, **ALWAYS use `createSelectSchema`**:

```typescript
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { myTable } from "../../db/myTable";

// Main schema from database table
export const mySchema = createSelectSchema(myTable).openapi("MyEntity");

// Export TypeScript type
export type MyEntity = z.infer<typeof mySchema>;

// Derived schemas for API operations
export const myCreateSchema = mySchema
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .openapi("MyEntityCreate");

export const myUpdateSchema = myCreateSchema
  .partial()
  .openapi("MyEntityUpdate");

// Response schemas
export const mySuccessSchema = z
  .object({
    message: z.string(),
    data: mySchema,
    metadata: searchOptionsSchema.nullable(),
  })
  .openapi("MyEntitySuccess");

export const myListSuccessSchema = mySuccessSchema
  .extend({
    data: z.array(mySchema),
  })
  .openapi("MyEntityListSuccess");

// Error schemas
export const myNotFoundSchema = createNotFoundSchema("my-entity");
export type MyEntityNotFound = z.infer<typeof myNotFoundSchema>;

export const myNoChangesSchema = createNoChangesSchema("my-entity");
export type MyEntityNoChanges = z.infer<typeof myNoChangesSchema>;
```

**Current SQL-backed features:**
- `campaigns` - [campaigns/schemas.ts](src/features/campaigns/schemas.ts)
- `apiKeys` - [apiKeys/schemas.ts](src/features/apiKeys/schemas.ts)
- `pixels` - [pixels/schemas.ts](src/features/pixels/schemas.ts)
- `integrations` - [integrations/schemas.ts](src/features/integrations/schemas.ts)
- `campaignPixels` - [campaignPixels/schemas.ts](src/features/campaignPixels/schemas.ts)

### 2. ClickHouse-Backed Features

For features using ClickHouse (not Drizzle ORM), use **manual Zod schemas**:

```typescript
import { z } from "zod";

// Manual schema definition
export const myClickHouseSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  user_id: z.uuid(),
  // ... other fields
});

export type MyClickHouseEntity = z.infer<typeof myClickHouseSchema>;
```

**Current ClickHouse-backed features:**
- `events` - [events/schemas.ts](src/features/events/schemas.ts)
- `traces` - [traces/traceSchemas.ts](src/features/traces/traceSchemas.ts)

### 3. Computed/Analytics Features

For features that compute data or don't map directly to a table, use **manual Zod schemas**:

```typescript
import { z } from "zod";

export const analyticsQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  // ... query parameters
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
```

**Current computed features:**
- `analytics` - [analytics/schemas.ts](src/features/analytics/schemas.ts)

## Type Export Rules

### ✅ DO:

1. **Always export the main type** from the schema file:
   ```typescript
   export const mySchema = createSelectSchema(myTable);
   export type MyEntity = z.infer<typeof mySchema>;
   ```

2. **Export types for derived schemas** when they're used across files:
   ```typescript
   export const myNotFoundSchema = createNotFoundSchema("my-entity");
   export type MyEntityNotFound = z.infer<typeof myNotFoundSchema>;
   ```

3. **Import types from their feature's schema file**:
   ```typescript
   import { type MyEntity } from "../myFeature/schemas";
   ```

### ❌ DON'T:

1. **Don't create inline type definitions** in route or service files:
   ```typescript
   // ❌ Bad - inline type definition
   type ApiKey = z.infer<typeof apiKeySchema>;

   // ✅ Good - import from schema
   import { type ApiKey } from "../apiKeys/schemas";
   ```

2. **Don't duplicate type definitions** across multiple files

3. **Don't create types outside their feature folder** unless they're truly shared types

## Shared Types Location

Shared types that don't belong to a specific feature should be placed in:

- **`/lib/`** - Library utilities (e.g., `User` in `lib/filters.ts`)
- **`/common/services/`** - Base service types (e.g., `Filters` in `common/services/baseService.ts`)
- **`/common/repository/`** - Repository interfaces (e.g., `IRepository`)
- **`/types.ts`** - Global application types (e.g., `AppContext`)

## Helper Functions

Use shared helper functions from `common/schemas/baseSchemas.ts`:

```typescript
import {
  createNotFoundSchema,
  createNoChangesSchema,
  searchOptionsSchema,
  uuidIdParamSchema,
} from "../../common/schemas/baseSchemas";
```

## Migration Checklist

When adding a new SQL-backed feature:

- [ ] Create database table in `/db/`
- [ ] Create feature folder in `/features/`
- [ ] Create `schemas.ts` using `createSelectSchema`
- [ ] Export main type: `export type MyEntity = z.infer<typeof mySchema>`
- [ ] Create derived schemas for Create/Update operations
- [ ] Create response and error schemas
- [ ] Export all necessary types
- [ ] Create repository, service, and routes files
- [ ] Import types from schemas (never redefine inline)

## Examples

See these files for reference implementations:
- [campaigns/schemas.ts](src/features/campaigns/schemas.ts) - Complete SQL-backed example
- [events/schemas.ts](src/features/events/schemas.ts) - ClickHouse manual schema example
- [analytics/schemas.ts](src/features/analytics/schemas.ts) - Computed data example
