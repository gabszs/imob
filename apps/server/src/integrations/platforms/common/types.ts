// Common types for all CAPI integrations
import { type EventMetadata } from "../../../features/events/schemas";
import { type Trace } from "../../../features/traces/schemas";

export interface EventMessage {
	id?: string;
	trace_id: string;
	user_id?: string;
	name: string;
	campaign_id?: string;
	created_at: string;
	payload: Record<string, unknown>;
	metadata?: EventMetadata;
}

export type Platform = "facebook" | "tiktok" | "reddit" | "pinterest" | "kwai";

export type { EventMetadata, Trace };
