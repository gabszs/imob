import { BaseCapiService, type EventExclusionRules } from "../../platforms/common/baseService";
import { mapEventToPlatform } from "../../platforms/common/eventMapping";
import { type CapiCredentials, ValidationResult } from "../../platforms/common/interface";
import { type EventMessage, Trace } from "../../platforms/common/types";

function isValidUUID(uuid: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(uuid);
}

/**
 * Reddit CAPI Field Exclusion Rules
 *
 * Defines which fields to exclude from the payload for each event type.
 * Supports nested paths using dot notation (e.g., "data.events.metadata.item_count")
 * Arrays are automatically handled - rules apply to all array items
 *
 * Event Support Matrix (based on API testing):
 * - PageVisit: BLOCKS item_count, value, currency in metadata
 * - ViewContent: BLOCKS item_count, value, currency in metadata
 * - Search: BLOCKS item_count, value, currency in metadata
 * - AddToCart: Accepts ALL metadata fields (no exclusions)
 * - AddToWishlist: Accepts ALL metadata fields (no exclusions)
 * - Purchase: Accepts ALL metadata fields (no exclusions)
 * - Lead: BLOCKS item_count in metadata
 * - SignUp: BLOCKS item_count in metadata
 * - Custom events: Accept all metadata fields (not listed here)
 *
 * Note: Reddit payload structure is data.events[].metadata
 * The removeFields method automatically handles the events array
 */
const REDDIT_EXCLUSION_RULES: EventExclusionRules = {
	PageVisit: [
		"data.events.metadata.item_count",
		"data.events.metadata.value",
		"data.events.metadata.currency",
	],
	ViewContent: [
		"data.events.metadata.item_count",
		"data.events.metadata.value",
		"data.events.metadata.currency",
	],
	Search: [
		"data.events.metadata.item_count",
		"data.events.metadata.value",
		"data.events.metadata.currency",
	],
	SignUp: ["data.events.metadata.item_count"],
	Lead: ["data.events.metadata.item_count"],
	// AddToCart, AddToWishlist, Purchase: no exclusions needed
};

export class RedditCapiService extends BaseCapiService {
	constructor() {
		super("Reddit", "https://ads-api.reddit.com/api/v3/pixels");
		// Set exclusion rules for Reddit
		this.exclusionRules = REDDIT_EXCLUSION_RULES;
	}

	validateEvent(eventName: string, clickId: string | null): ValidationResult {
		// Reddit allows custom events, doesn't require click_id
		return { valid: true };
	}

	async buildPayload(
		eventData: EventMessage,
		trace: Trace,
		credentials: CapiCredentials,
		sendTestEvents: boolean,
	): Promise<Record<string, unknown>> {
		// Convert created_at from SQL format "YYYY-MM-DD HH:MM:SS.mmm" to Unix timestamp in milliseconds
		const event_at = this.convertTimestampToMillis(eventData.created_at);

		// Determine UUID: prefer payload.user_id if valid UUID, otherwise trace_id
		let uuid = eventData.trace_id;
		let external_id: any;
		if (eventData.payload.user_id && isValidUUID(String(eventData.payload.user_id))) {
			uuid = String(eventData.payload.user_id);
			external_id = String(eventData.payload.user_id);
		}

		const metadata = eventData.metadata || {};

		// Map event name to Reddit-specific name and determine if it should be custom
		const eventMapping = mapEventToPlatform(eventData.name, "reddit");

		// Reddit-specific: Some standard events must be sent as CUSTOM because Reddit doesn't support them natively
		const FORCE_CUSTOM_EVENTS = ["InitCheckout"];
		const forceCustom = FORCE_CUSTOM_EVENTS.includes(eventMapping.eventName);

		// Determine tracking type: use CUSTOM if event is custom, has no platform mapping, or is forced custom
		const shouldBeCustom = eventMapping.isCustom || !eventMapping.hasPlatformMapping || forceCustom;

		const trackingType = shouldBeCustom
			? {
					tracking_type: "CUSTOM" as const,
					custom_event_name: eventMapping.eventName,
				}
			: {
					tracking_type: eventMapping.eventName,
				};

		// Build screen_dimensions if available in metadata
		const screenDimensions =
			metadata.screen_width && metadata.screen_height
				? {
						width: metadata.screen_width,
						height: metadata.screen_height,
					}
				: null;

		const payload = {
			data: {
				// Include test_id only if sendTestEvents is true AND testId exists
				...(sendTestEvents && credentials.testId && { test_id: credentials.testId }),
				events: [
					{
						// Include click_id only if exists in trace
						...(trace.click_id && { click_id: trace.click_id }),
						event_at: event_at,
						// Priority: metadata.action_source > "WEBSITE" (default)
						action_source: (metadata.action_source || "WEBSITE") as string,
						type: trackingType,
						user: {
							// Priority: metadata > trace > null
							uuid,
							external_id,
							ip_address: metadata.ip_address || trace.client_ip || null,
							user_agent: metadata.user_agent || trace.user_agent || null,
							// Only from metadata (not in trace)
							email: metadata.email || null,
							phone_number: metadata.phone_number || null,
							// Not available in our system
							idfa: null,
							aaid: null,
							// Only if both dimensions are present
							screen_dimensions: screenDimensions,
						},
						metadata: {
							// All from metadata only
							currency: metadata.currency || null,
							value: metadata.value || null,
							conversion_id: null,
							item_count: metadata.item_count || null,
							products: null, // Not supported yet
						},
					},
				],
			},
		};

		return payload;
	}

	async sendEvent(
		credentials: CapiCredentials,
		eventData: EventMessage,
		trace: Trace,
		sendTestEvents: boolean,
	): Promise<unknown> {
		// Validate event for this platform
		const validation = this.validateEvent(eventData.name, trace.click_id);
		if (!validation.valid) {
			console.warn(`[Reddit] Event skipped: ${validation.reason}`);
			return null;
		}

		// Build payload
		const payload = await this.buildPayload(eventData, trace, credentials, sendTestEvents);

		// Apply exclusions and remove null fields
		const cleanedPayload = this.preparePayload(payload, eventData.name);

		console.log("Sending to Reddit:", JSON.stringify(cleanedPayload, null, 2));

		const url = `${this.baseUrl}/${credentials.pixelId}/conversion_events`;

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${credentials.apiKey}`,
				},
				body: JSON.stringify(cleanedPayload),
			});

			const data = await response.json();
			if (!response.ok) {
				console.error("Reddit API error:", data);
			} else {
				console.log("Reddit API success:", data);
			}

			return cleanedPayload;
		} catch (err) {
			console.error("Fetch to Reddit failed:", err);
			throw err;
		}
	}
}
