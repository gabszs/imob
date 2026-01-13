import { sha256Hash } from "../../../common/utils";
import { BaseCapiService, type EventExclusionRules } from "../../platforms/common/baseService";
import { mapEventToPlatform } from "../../platforms/common/eventMapping";
import { type CapiCredentials, ValidationResult } from "../../platforms/common/interface";
import { type EventMessage, Trace } from "../../platforms/common/types";

/**
 * TikTok CAPI Field Exclusion Rules
 *
 * Defines which fields to exclude from the payload for each event type.
 * Supports nested paths using dot notation (e.g., "data.properties.value")
 * Arrays are automatically handled - rules apply to all array items
 *
 * Event Support Matrix:
 * - Add exclusion rules here as needed based on TikTok API testing
 *
 * Note: TikTok payload structure is data[].properties
 * The removeFields method automatically handles the data array
 */
const TIKTOK_EXCLUSION_RULES: EventExclusionRules = {
	// Add TikTok-specific exclusion rules here as needed
	// Example: PageVisit: ["data.properties.value", "data.properties.currency"],
};

export class TikTokCapiService extends BaseCapiService {
	constructor() {
		super("TikTok", "https://business-api.tiktok.com/open_api/v1.3/event/track/");
		// Set exclusion rules for TikTok
		this.exclusionRules = TIKTOK_EXCLUSION_RULES;
	}

	validateEvent(eventName: string, clickId: string | null): ValidationResult {
		// TikTok allows custom events, doesn't require click_id
		return { valid: true };
	}

	async buildPayload(
		eventData: EventMessage,
		trace: Trace,
		credentials: CapiCredentials,
		sendTestEvents: boolean,
	): Promise<Record<string, unknown>> {
		// Map event name to TikTok-specific name
		const eventMapping = mapEventToPlatform(eventData.name, "tiktok");
		const mappedEventName = eventMapping.eventName;

		const metadata = eventData.metadata || {};

		// Convert created_at from SQL format to Unix timestamp in seconds
		const event_time = this.convertTimestampToSeconds(eventData.created_at);

		// Build properties object
		const properties: Record<string, unknown> = {};

		if (metadata.content_type) {
			properties.content_type = metadata.content_type;
		}

		if (metadata.value !== undefined) {
			properties.value = metadata.value;
		}

		if (metadata.currency) {
			properties.currency = metadata.currency;
		}

		// Build contents array with detailed product information
		// Priority: use contents array if provided, otherwise build from content_ids
		if (metadata.contents && Array.isArray(metadata.contents)) {
			// Use provided contents array (already in correct format)
			properties.contents = metadata.contents;
		} else if (metadata.content_ids && Array.isArray(metadata.content_ids)) {
			// Build contents from content_ids array
			properties.contents = metadata.content_ids.map((content_id: string) => ({
				content_id,
				quantity: metadata.quantity || 1,
				price: metadata.value || 0,
			}));
		}

		// Build user object with hashed email and phone
		const user: Record<string, unknown> = {};

		// Hash email and phone if provided
		if (metadata.email) {
			user.email = await sha256Hash(metadata.email);
		}

		if (metadata.phone_number) {
			user.phone = await sha256Hash(metadata.phone_number);
		}

		// Hash first_name and last_name if provided
		if (metadata.first_name) {
			user.first_name = await sha256Hash(metadata.first_name.toLowerCase().trim());
		}

		if (metadata.last_name) {
			user.last_name = await sha256Hash(metadata.last_name.toLowerCase().trim());
		}

		// External ID with fallback to trace_id
		// Priority: metadata.external_id > eventData.trace_id
		const externalId = metadata.external_id || eventData.trace_id;
		if (externalId) {
			user.external_id = await sha256Hash(externalId);
		}

		// Location fields with fallback to trace
		// Priority: metadata > trace
		const zipCode = metadata.zip_code || trace.postal_code;
		if (zipCode) {
			user.zip_code = await sha256Hash(zipCode);
		}

		const city = metadata.city || trace.city;
		if (city) {
			user.city = city.toLowerCase().trim();
		}

		const state = metadata.state || trace.region;
		if (state) {
			user.state = state.toLowerCase().trim();
		}

		const country = metadata.country || trace.country;
		if (country) {
			user.country = country.toLowerCase().trim();
		}

		// Add other user fields from metadata
		if (metadata.ttp) {
			user.ttp = metadata.ttp;
		}

		if (metadata.idfa) {
			user.idfa = metadata.idfa;
		}

		if (metadata.idfv) {
			user.idfv = metadata.idfv;
		}

		if (metadata.att_status) {
			user.att_status = metadata.att_status;
		}

		// Add IP and user agent from trace
		if (trace.client_ip) {
			user.ip = trace.client_ip;
		}

		if (trace.user_agent) {
			user.user_agent = trace.user_agent;
		}

		// Build page object
		const page: Record<string, unknown> = {};

		// Priority: metadata.page_url > trace.final_url
		const pageUrl = metadata.page_url || trace.final_url;
		if (pageUrl) {
			page.url = pageUrl;
		}

		if (metadata.page_referrer) {
			page.referrer = metadata.page_referrer;
		}

		// Build the event data object
		const eventDataObj: Record<string, unknown> = {
			event: mappedEventName,
			event_time: event_time,
			partner_agent: "traki.io",
		};

		// Add properties if not empty
		if (Object.keys(properties).length > 0) {
			eventDataObj.properties = properties;
		}

		// Add user if not empty
		if (Object.keys(user).length > 0) {
			eventDataObj.user = user;
		}

		// Add page if not empty
		if (Object.keys(page).length > 0) {
			eventDataObj.page = page;
		}

		// Add ttclid (click_id) only if exists
		if (trace.click_id) {
			user.ttclid = trace.click_id;
		}

		// Build final payload
		const payload: Record<string, unknown> = {
			event_source: "web",
			event_source_id: credentials.pixelId,
			data: [eventDataObj],
		};

		// Add test_event_code only if sendTestEvents is true AND testId exists
		if (sendTestEvents && credentials.testId) {
			payload.test_event_code = credentials.testId;
		}

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
			console.warn(`[TikTok] Event skipped: ${validation.reason}`);
			return null;
		}

		// Build payload
		const payload = await this.buildPayload(eventData, trace, credentials, sendTestEvents);

		// Apply exclusions and remove null fields
		const cleanedPayload = this.preparePayload(payload, eventData.name);

		console.log("Sending to TikTok:", JSON.stringify(cleanedPayload, null, 2));

		try {
			const response = await fetch(this.baseUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Access-Token": credentials.apiKey,
				},
				body: JSON.stringify(cleanedPayload),
			});

			const data = await response.json();
			if (!response.ok) {
				console.error("TikTok API error:", data);
			} else {
				console.log("TikTok API success:", data);
			}

			return cleanedPayload;
		} catch (err) {
			console.error("Fetch to TikTok failed:", err);
			throw err;
		}
	}
}
