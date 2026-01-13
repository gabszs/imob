import { sha256Hash } from "../../../common/utils";
import { BaseCapiService, type EventExclusionRules } from "../../platforms/common/baseService";
import { mapEventToPlatform } from "../../platforms/common/eventMapping";
import { type CapiCredentials, type ValidationResult } from "../../platforms/common/interface";
import { type EventMessage, type Trace } from "../../platforms/common/types";

/**
 * Kwai CAPI Field Exclusion Rules
 *
 * Defines which fields to exclude from the payload for each event type.
 * Supports nested paths using dot notation.
 *
 * Event Support Matrix (based on API requirements):
 * - PageView: Only sends basic required fields (access_token, pixelId, clickid, event_name, is_attributed, mmpcode, pixelSdkVersion, trackFlag)
 * - ViewContent: Only sends basic required fields (same as PageView)
 * - Other events: Send all available fields including user_data, value, currency, etc.
 *
 * For PageView and ViewContent, we exclude all optional/enrichment fields:
 * - event_time, event_id (timestamps and deduplication)
 * - order_id, value, currency (conversion fields)
 * - user_data (all user matching fields)
 * - action_source, content_ids, num_items (product/action fields)
 * - event_source_url, referrer, utm_* (tracking fields)
 * - All advanced/sector-specific fields
 */
const KWAI_EXCLUSION_RULES: EventExclusionRules = {
	// EVENT_CONTENT_VIEW: [
	// 	"event_time",
	// 	"event_id",
	// 	"order_id",
	// 	"value",
	// 	"currency",
	// 	"user_data",
	// 	"action_source",
	// 	"content_ids",
	// 	"num_items",
	// 	"event_source_url",
	// 	"referrer",
	// 	"utm_source",
	// 	"utm_medium",
	// 	"utm_campaign",
	// 	"utm_term",
	// 	"utm_content",
	// 	"user_tags_age",
	// 	"user_tags_insurance",
	// 	"weighted_purchase_amount",
	// 	"action_reason",
	// 	"key_action_category",
	// 	"key_action_threshold",
	// 	"description",
	// 	"content_name",
	// 	"content_category",
	// 	"search_string",
	// 	"status",
	// ],
	// ViewContent: [
	// 	"event_time",
	// 	"event_id",
	// 	"order_id",
	// 	"value",
	// 	"currency",
	// 	"user_data",
	// 	"action_source",
	// 	"content_ids",
	// 	"num_items",
	// 	"event_source_url",
	// 	"referrer",
	// 	"utm_source",
	// 	"utm_medium",
	// 	"utm_campaign",
	// 	"utm_term",
	// 	"utm_content",
	// 	"user_tags_age",
	// 	"user_tags_insurance",
	// 	"weighted_purchase_amount",
	// 	"action_reason",
	// 	"key_action_category",
	// 	"key_action_threshold",
	// 	"description",
	// 	"content_name",
	// 	"content_category",
	// 	"search_string",
	// 	"status",
	// ],
	// Other events: no exclusions (send all available data)
};

export class KwaiCapiService extends BaseCapiService {
	constructor() {
		super("Kwai", "https://www.adsnebula.com/log/common/api");
		// Set exclusion rules for Kwai
		this.exclusionRules = KWAI_EXCLUSION_RULES;
	}

	validateEvent(eventName: string, clickId: string | null): ValidationResult {
		// Kwai does NOT support custom events - check if event has platform mapping
		const eventMapping = mapEventToPlatform(eventName, "kwai");

		if (eventMapping.isCustom || !eventMapping.hasPlatformMapping) {
			return {
				valid: false,
				reason: `Kwai does not support custom events. Event "${eventName}" has no Kwai mapping.`,
			};
		}

		// Kwai is the ONLY platform that requires click_id
		// Note: actual click_id validation happens in sendEvent where we have access to testId
		// This just validates event type, actual click_id check is done later
		return { valid: true };
	}

	async buildPayload(
		eventData: EventMessage,
		trace: Trace,
		credentials: CapiCredentials,
		sendTestEvents: boolean,
	): Promise<Record<string, unknown>> {
		// Map event name to Kwai-specific name (validation ensures it exists)
		const eventMapping = mapEventToPlatform(eventData.name, "kwai");
		const mappedEventName = eventMapping.eventName;

		const metadata = eventData.metadata || {};

		// Convert created_at from SQL format to Unix timestamp in milliseconds
		const event_time = this.convertTimestampToMillis(eventData.created_at);

		// Generate unique event_id for deduplication (format: evt_YYYYMMDD_eventName_traceId_timestamp)
		const dateStr = new Date(event_time).toISOString().split("T")[0].replace(/-/g, "");
		const event_id = `evt_${dateStr}_${mappedEventName}_${eventData.trace_id}_${event_time}`;

		// Determine click_id: use testId in test mode, otherwise prefer from trace/payload
		// Note: click_id validation is done in sendEvent before calling buildPayload
		let clickid = "";
		if (sendTestEvents && credentials.testId) {
			// Test mode: always use testId
			clickid = credentials.testId;
		} else {
			// Production mode: use real click_id from trace or payload
			clickid = trace.click_id || String(eventData.payload.clickid || "");
		}

		// Build user_data object with hashed PII
		const user_data: Record<string, unknown> = {};

		// em: Email (hashed SHA-256, normalized: lowercase, trim)
		// Priority: metadata.email > payload.email
		const email =
			metadata.email || (eventData.payload.email ? String(eventData.payload.email) : null);
		if (email) {
			user_data.em = await sha256Hash(email);
		}

		// ph: Phone number (hashed SHA-256, E.164 format recommended)
		// Priority: metadata.phone_number > payload.phone_number > payload.phone
		const phone =
			metadata.phone_number ||
			(eventData.payload.phone_number ? String(eventData.payload.phone_number) : null) ||
			(eventData.payload.phone ? String(eventData.payload.phone) : null);
		if (phone) {
			user_data.ph = await sha256Hash(phone);
		}

		// fn: First name (hashed SHA-256)
		// Priority: metadata.first_name > payload.first_name > payload.firstName
		const firstName =
			metadata.first_name ||
			(eventData.payload.first_name ? String(eventData.payload.first_name) : null) ||
			(eventData.payload.firstName ? String(eventData.payload.firstName) : null);
		if (firstName) {
			user_data.fn = await sha256Hash(firstName);
		}

		// ln: Last name (hashed SHA-256)
		// Priority: metadata.last_name > payload.last_name > payload.lastName
		const lastName =
			metadata.last_name ||
			(eventData.payload.last_name ? String(eventData.payload.last_name) : null) ||
			(eventData.payload.lastName ? String(eventData.payload.lastName) : null);
		if (lastName) {
			user_data.ln = await sha256Hash(lastName);
		}

		// ct: City (hashed SHA-256)
		// Priority: metadata.city > payload.city > trace.city
		const city =
			metadata.city ||
			(eventData.payload.city ? String(eventData.payload.city) : null) ||
			trace.city;
		if (city) {
			user_data.ct = await sha256Hash(city);
		}

		// st: State/Province (hashed SHA-256)
		// Priority: metadata.region > metadata.state > payload.region > payload.state > trace.region
		const region =
			metadata.region ||
			metadata.state ||
			(eventData.payload.region ? String(eventData.payload.region) : null) ||
			(eventData.payload.state ? String(eventData.payload.state) : null) ||
			trace.region;
		if (region) {
			user_data.st = await sha256Hash(region);
		}

		// zp: Postal code/ZIP (hashed SHA-256)
		// Priority: metadata.postal_code > metadata.zip_code > payload.postal_code > payload.zip_code > payload.zipcode > trace.postal_code
		const postalCode =
			metadata.postal_code ||
			metadata.zip_code ||
			(eventData.payload.postal_code ? String(eventData.payload.postal_code) : null) ||
			(eventData.payload.zip_code ? String(eventData.payload.zip_code) : null) ||
			(eventData.payload.zipcode ? String(eventData.payload.zipcode) : null) ||
			trace.postal_code;
		if (postalCode) {
			user_data.zp = await sha256Hash(postalCode);
		}

		// country: Country code (NOT hashed, ISO 3166-1 alpha-2)
		// Priority: metadata.country > payload.country > trace.country
		const country =
			metadata.country ||
			(eventData.payload.country ? String(eventData.payload.country) : null) ||
			trace.country;
		if (country) {
			user_data.country = country;
		}

		// external_id: Unique user ID from CRM or app (optional hashing recommended)
		// Priority: metadata.external_id > payload.external_id > payload.user_id
		const externalId =
			metadata.external_id ||
			(eventData.payload.external_id ? String(eventData.payload.external_id) : null) ||
			(eventData.payload.user_id ? String(eventData.payload.user_id) : null);
		if (externalId) {
			user_data.external_id = externalId;
		}

		// ge: Gender (hashed SHA-256, optional, normalized to m/f)
		// Priority: metadata.user_gender > payload.gender > payload.ge
		const genderRaw =
			metadata.user_gender ||
			(eventData.payload.gender ? String(eventData.payload.gender) : null) ||
			(eventData.payload.ge ? String(eventData.payload.ge) : null);
		if (genderRaw) {
			// Normalize to m/f
			const normalizedGender = genderRaw.toLowerCase().startsWith("m") ? "m" : "f";
			user_data.ge = await sha256Hash(normalizedGender);
		}

		// db: Date of birth (hashed SHA-256, YYYYMMDD format)
		// Priority: metadata.birth_date (ISO) > payload.date_of_birth > payload.dob > payload.db
		let dobFormatted: string | null = null;
		if (metadata.birth_date) {
			// Convert ISO date (YYYY-MM-DD) to YYYYMMDD
			dobFormatted = metadata.birth_date.replace(/-/g, "");
		} else if (eventData.payload.date_of_birth) {
			dobFormatted = String(eventData.payload.date_of_birth);
		} else if (eventData.payload.dob) {
			dobFormatted = String(eventData.payload.dob);
		} else if (eventData.payload.db) {
			dobFormatted = String(eventData.payload.db);
		}
		if (dobFormatted) {
			user_data.db = await sha256Hash(dobFormatted);
		}

		// client_ip_address: IP address (NOT hashed, for geo-matching)
		// Priority: metadata.ip_address > trace.client_ip > payload.ip_address > payload.ip
		const ipAddress =
			metadata.ip_address ||
			trace.client_ip ||
			(eventData.payload.ip_address ? String(eventData.payload.ip_address) : null) ||
			(eventData.payload.ip ? String(eventData.payload.ip) : null);
		if (ipAddress) {
			user_data.client_ip_address = ipAddress;
		}

		// client_user_agent: User agent (NOT hashed, for device matching)
		// Priority: metadata.user_agent > trace.user_agent > payload.user_agent
		const userAgent =
			metadata.user_agent ||
			trace.user_agent ||
			(eventData.payload.user_agent ? String(eventData.payload.user_agent) : null);
		if (userAgent) {
			user_data.client_user_agent = userAgent;
		}

		// Build base payload with required fields
		const payloadBase: Record<string, unknown> = {
			// Required fields
			access_token: credentials.apiKey,
			pixelId: credentials.pixelId,
			clickid: clickid,
			event_name: mappedEventName,

			// Recommended fields
			is_attributed: 1,
			mmpcode: "PL",
			pixelSdkVersion: "9.9.9",
			trackFlag: sendTestEvents,

			// Timestamp (milliseconds)
			event_time: event_time,

			// Deduplication
			event_id: event_id,
		};

		// Add order_id if available in payload or metadata
		// Priority: payload.order_id > payload.orderId > payload.transaction_id
		const orderId = eventData.payload.order_id
			? String(eventData.payload.order_id)
			: eventData.payload.orderId
				? String(eventData.payload.orderId)
				: eventData.payload.transaction_id
					? String(eventData.payload.transaction_id)
					: null;
		if (orderId) {
			payloadBase.order_id = orderId;
		}

		// Add value and currency for conversion events (value must be string with 2 decimals)
		// Priority: metadata > payload for value and currency
		const value =
			metadata.value !== undefined
				? metadata.value
				: eventData.payload.value !== undefined
					? Number(eventData.payload.value)
					: null;
		const currency =
			metadata.currency || (eventData.payload.currency ? String(eventData.payload.currency) : null);

		if (value !== null && currency) {
			payloadBase.value = typeof value === "number" ? value.toFixed(2) : String(value);
			payloadBase.currency = currency;
		}

		// Add user_data if not empty
		if (Object.keys(user_data).length > 0) {
			payloadBase.user_data = user_data;
		}

		// Add action_source (WEBSITE or APP)
		// Priority: metadata.action_source > payload.action_source > "WEBSITE" (default)
		const actionSource =
			metadata.action_source ||
			(eventData.payload.action_source ? String(eventData.payload.action_source) : null);
		if (actionSource) {
			payloadBase.action_source = actionSource;
		}

		// Add product data (content_ids and num_items)
		// Priority: metadata.content_ids > payload.content_ids > payload.product_ids
		const contentIds =
			metadata.content_ids && Array.isArray(metadata.content_ids)
				? metadata.content_ids
				: eventData.payload.content_ids && Array.isArray(eventData.payload.content_ids)
					? eventData.payload.content_ids
					: eventData.payload.product_ids && Array.isArray(eventData.payload.product_ids)
						? eventData.payload.product_ids
						: null;
		if (contentIds) {
			payloadBase.content_ids = contentIds;
		}

		// Priority: metadata.item_count > payload.item_count > payload.num_items > payload.quantity
		const itemCount =
			metadata.item_count !== undefined
				? metadata.item_count
				: eventData.payload.item_count !== undefined
					? Number(eventData.payload.item_count)
					: eventData.payload.num_items !== undefined
						? Number(eventData.payload.num_items)
						: eventData.payload.quantity !== undefined
							? Number(eventData.payload.quantity)
							: null;
		if (itemCount !== null) {
			payloadBase.num_items = itemCount;
		}

		// Add page URL (event_source_url)
		// Priority: metadata.page_url > payload.page_url > payload.url > trace.final_url
		const pageUrl =
			metadata.page_url ||
			(eventData.payload.page_url ? String(eventData.payload.page_url) : null) ||
			(eventData.payload.url ? String(eventData.payload.url) : null) ||
			trace.final_url;
		if (pageUrl) {
			payloadBase.event_source_url = pageUrl;
		}

		// Add referrer URL
		// Priority: metadata.page_referrer > payload.referrer > payload.page_referrer
		const referrer =
			metadata.page_referrer ||
			(eventData.payload.referrer ? String(eventData.payload.referrer) : null) ||
			(eventData.payload.page_referrer ? String(eventData.payload.page_referrer) : null);
		if (referrer) {
			payloadBase.referrer = referrer;
		}

		// Add UTM parameters from trace (for campaign tracking)
		if (trace.utm_source) {
			payloadBase.utm_source = trace.utm_source;
		}
		if (trace.utm_medium) {
			payloadBase.utm_medium = trace.utm_medium;
		}
		if (trace.utm_campaign) {
			payloadBase.utm_campaign = trace.utm_campaign;
		}
		if (trace.utm_term) {
			payloadBase.utm_term = trace.utm_term;
		}
		if (trace.utm_content) {
			payloadBase.utm_content = trace.utm_content;
		}

		// Add advanced fields for specific sectors (insurance, finance)
		if (eventData.payload.user_tags_age) {
			payloadBase.user_tags_age = Number(eventData.payload.user_tags_age);
		}

		if (eventData.payload.user_tags_insurance !== undefined) {
			payloadBase.user_tags_insurance = Number(eventData.payload.user_tags_insurance);
		}

		if (eventData.payload.weighted_purchase_amount !== undefined) {
			payloadBase.weighted_purchase_amount = Number(eventData.payload.weighted_purchase_amount);
		}

		if (eventData.payload.action_reason !== undefined) {
			payloadBase.action_reason = Number(eventData.payload.action_reason);
		}

		if (eventData.payload.key_action_category !== undefined) {
			payloadBase.key_action_category = Number(eventData.payload.key_action_category);
		}

		if (eventData.payload.key_action_threshold !== undefined) {
			payloadBase.key_action_threshold = Number(eventData.payload.key_action_threshold);
		}

		// Add custom event properties from payload (for additional context)
		// These can be used for custom reporting in Kwai
		if (eventData.payload.description) {
			payloadBase.description = String(eventData.payload.description);
		}

		if (eventData.payload.content_name) {
			payloadBase.content_name = String(eventData.payload.content_name);
		}

		if (eventData.payload.content_category) {
			payloadBase.content_category = String(eventData.payload.content_category);
		}

		if (eventData.payload.search_string) {
			payloadBase.search_string = String(eventData.payload.search_string);
		}

		if (eventData.payload.status) {
			payloadBase.status = String(eventData.payload.status);
		}

		return payloadBase;
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
			console.warn(`[Kwai] Event skipped: ${validation.reason}`);
			return null;
		}

		// Kwai is the ONLY platform that requires click_id
		// Check if we have click_id from trace OR testId in test mode
		const hasClickId = trace.click_id || (sendTestEvents && credentials.testId);
		if (!hasClickId) {
			console.warn(
				`[Kwai] Event skipped: click_id is required but not found (trace.click_id: ${trace.click_id}, sendTestEvents: ${sendTestEvents}, testId: ${credentials.testId || "not set"})`,
			);
			return null;
		}

		// Build payload
		let payload: Record<string, unknown>;
		try {
			payload = await this.buildPayload(eventData, trace, credentials, sendTestEvents);
		} catch (err) {
			console.warn(`[Kwai] ${err}`);
			return null;
		}

		// Apply exclusions and remove null fields
		const cleanedPayload = this.preparePayload(payload, eventData.name);

		console.log("Sending to Kwai:", JSON.stringify(cleanedPayload, null, 2));
		console.log("URL:", this.baseUrl);

		try {
			const response = await fetch(this.baseUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(cleanedPayload),
			});

			const data = await response.json();
			if (!response.ok) {
				console.error("Kwai API error:", data);
			} else {
				console.log("Kwai API success:", data);
			}

			return cleanedPayload;
		} catch (err) {
			console.error("Fetch to Kwai failed:", err);
			throw err;
		}
	}
}
