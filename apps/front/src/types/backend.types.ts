/**
 * Centralized imports of backend types from schemas
 * This file re-exports types from the backend to avoid duplication
 */

// Domains (from cloaker feature)
export {
    DomainNoChanges,
    DomainNotFound, type Domain
} from "@/server/cloaker/features/domains/schemas";
// API Keys
export {
    ApiKeyNoChanges,
    ApiKeyNotFound, type ApiKey
} from "@/server/features/apiKeys/schemas";
// Campaign Pixels
export {
    CampaignPixelNoChanges,
    CampaignPixelNotFound, type CampaignPixel
} from "@/server/features/campaignPixels/schemas";
// Campaigns
export {
    CampaignNoChanges,
    CampaignNotFound, type Campaign
} from "@/server/features/campaigns/schemas";

// Events
export {
    EventMetadata,
    EventNoChanges,
    EventNotFound,
    OutputEvent,
    OutputEventMetadata, type Event
} from "@/server/features/events/schemas";

// Integrations
export {
    IntegrationNoChanges,
    IntegrationNotFound, type Integration
} from "@/server/features/integrations/schemas";

// Pixels
export {
    PixelNoChanges,
    PixelNotFound, type Pixel
} from "@/server/features/pixels/schemas";

// Traces
export {
    TraceInput,
    TraceNoChanges,
    TraceNotFound,
    TraceUpdate, type Trace
} from "@/server/features/traces/schemas";

/**
 * Utility types for CRUD operations
 */

// Helper to create "Create" type (omit id, createdAt, updatedAt)
export type CreateInput<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

// Helper to create "Update" type (partial of CreateInput)
export type UpdateInput<T> = Partial<CreateInput<T>>;

// Helper to add optimistic flag for optimistic updates
export type WithOptimistic<T> = T & { optimistic?: boolean };
