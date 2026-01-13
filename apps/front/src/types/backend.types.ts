/**
 * Centralized imports of backend types from schemas
 * This file re-exports types from the backend to avoid duplication
 */

// Domains (from cloaker feature)
export {
	type Domain,
	DomainNoChanges,
	DomainNotFound,
} from "@/server/cloaker/features/domains/schemas";
// API Keys
export {
	type ApiKey,
	ApiKeyNoChanges,
	ApiKeyNotFound,
} from "@/server/features/apiKeys/schemas";
// Campaign Pixels
export {
	type CampaignPixel,
	CampaignPixelNoChanges,
	CampaignPixelNotFound,
} from "@/server/features/campaignPixels/schemas";
// Campaigns
export {
	type Campaign,
	CampaignNoChanges,
	CampaignNotFound,
} from "@/server/features/campaigns/schemas";

// Events
export {
	type Event,
	EventMetadata,
	EventNoChanges,
	EventNotFound,
	OutputEvent,
	OutputEventMetadata,
} from "@/server/features/events/schemas";

// Integrations
export {
	type Integration,
	IntegrationNoChanges,
	IntegrationNotFound,
} from "@/server/features/integrations/schemas";

// Pixels
export {
	type Pixel,
	PixelNoChanges,
	PixelNotFound,
} from "@/server/features/pixels/schemas";

// Traces
export {
	type Trace,
	TraceInput,
	TraceNoChanges,
	TraceNotFound,
	TraceUpdate,
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
