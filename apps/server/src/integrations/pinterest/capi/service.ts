import { sha256Hash } from "../../../common/utils";
import { BaseCapiService } from "../../platforms/common/baseService";
import { mapEventToPlatform } from "../../platforms/common/eventMapping";
import type { CapiCredentials, ValidationResult } from "../../platforms/common/interface";
import type { EventMessage, Trace } from "../../platforms/common/types";

/**
 * Extract device and app information from user agent and trace data
 */
function extractDeviceInfo(
	userAgent: string | null,
	trace: Trace,
): {
	device_brand?: string;
	device_model?: string;
	device_type?: string;
	os_version?: string;
	app_name?: string;
	app_version?: string;
	language?: string;
	wifi?: boolean;
} {
	const info: Record<string, string | boolean> = {};

	if (!userAgent) return info;

	const ua = userAgent.toLowerCase();

	// Device Type
	if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
		info.device_type = "mobile";
	} else if (ua.includes("tablet") || ua.includes("ipad")) {
		info.device_type = "tablet";
	} else {
		info.device_type = "web";
	}

	// Device Brand & Model (Android)
	const androidMatch = userAgent.match(/android[^;]*;\s*([^)]+)\)/i);
	if (androidMatch) {
		const deviceInfo = androidMatch[1].trim();
		const parts = deviceInfo.split(/\s+/);
		if (parts.length > 0) {
			info.device_brand = parts[0]; // First part is usually the brand
			if (parts.length > 1) {
				info.device_model = parts.slice(1).join(" ");
			}
		}
	}

	// Device Brand & Model (iOS)
	if (ua.includes("iphone")) {
		info.device_brand = "Apple";
		const iphoneMatch = userAgent.match(/iPhone(\d+[,\d]*)/);
		info.device_model = iphoneMatch ? `iPhone${iphoneMatch[1]}` : "iPhone";
	} else if (ua.includes("ipad")) {
		info.device_brand = "Apple";
		info.device_model = "iPad";
	}

	// OS Version (Android)
	const androidVersion = userAgent.match(/Android\s+([\d.]+)/i);
	if (androidVersion) {
		info.os_version = androidVersion[1];
	}

	// OS Version (iOS)
	const iosVersion = userAgent.match(/OS\s+([\d_]+)/i);
	if (iosVersion) {
		info.os_version = iosVersion[1].replace(/_/g, ".");
	}

	// App Name & Version (look for common patterns)
	// Example: "Kwai_Pro/10.11.10.102500"
	const appMatch = userAgent.match(/([A-Za-z_]+)\/([\d.]+)/);
	if (appMatch && !appMatch[1].match(/mozilla|chrome|safari|version|applewebkit/i)) {
		info.app_name = appMatch[1];
		info.app_version = appMatch[2];
	}

	// Language from trace (Pinterest expects ISO 639-1: 2-letter code only, e.g., "en", "pt")
	if (trace.accept_language) {
		const langMatch = trace.accept_language.match(/^([a-z]{2})/i);
		if (langMatch) {
			info.language = langMatch[1].toLowerCase();
		}
	}

	// WiFi detection (NetType/WIFI in user agent)
	if (ua.includes("nettype/wifi") || ua.includes("wifi")) {
		info.wifi = true;
	}

	return info;
}

export class PinterestCapiService extends BaseCapiService {
	constructor() {
		super("Pinterest", "https://api.pinterest.com/v5/ad_accounts");
	}

	validateEvent(eventName: string, clickId: string | null): ValidationResult {
		// Pinterest allows custom events, doesn't require click_id
		return { valid: true };
	}

	async buildPayload(
		eventData: EventMessage,
		trace: Trace,
		credentials: CapiCredentials,
		sendTestEvents: boolean,
	): Promise<Record<string, unknown>> {
		/**
		 * Pinterest CAPI Payload Structure
		 *
		 * This method builds a comprehensive payload with enriched data from multiple sources:
		 *
		 * Data Priority:
		 * - user_data: metadata > trace > inferred from user_agent > not included
		 * - custom_data: metadata > payload > not included
		 * - device/app fields: metadata > inferred from user_agent/trace > not included
		 *
		 * Key enrichments:
		 * - PII fields (email, phone, name, address) are hashed with SHA-256 in array format
		 * - Device info (brand, model, type, OS version) extracted from user_agent
		 * - App info (name, version) extracted from user_agent
		 * - Network info (wifi) inferred from user_agent
		 * - Geo data (city, region, country, postal_code) from trace
		 *
		 * Custom Events:
		 * - Pinterest supports custom events via event_name="custom"
		 * - Native Pinterest events: page_visit, search, add_to_cart, add_to_wishlist, checkout, lead, signup
		 * - All other events are sent as custom (InitCheckout, PendingPurchase, etc.)
		 */

		// Pinterest uses pixelId as the Ad Account ID
		if (!credentials.pixelId) {
			throw new Error(
				"[Pinterest] Missing pixelId. Please add the Pinterest Ad Account ID (numeric) to pixelId field.",
			);
		}

		// Convert created_at from SQL format to Unix timestamp in seconds
		const event_time = this.convertTimestampToSeconds(eventData.created_at);

		// Map event name to Pinterest-specific name
		const eventMapping = mapEventToPlatform(eventData.name, "pinterest");

		// Pinterest-specific: Some standard events must be sent as CUSTOM because Pinterest doesn't support them natively
		// Only these events have native Pinterest support and should NOT be sent as custom:
		// - page_visit, search, add_to_cart, add_to_wishlist, checkout, lead, signup
		// All others (including InitCheckout, PendingPurchase, etc.) should be sent as custom
		const FORCE_CUSTOM_EVENTS = ["InitCheckout", "PendingPurchase"];
		const forceCustom = FORCE_CUSTOM_EVENTS.includes(eventData.name);

		// Determine if event should be custom: event is custom, has no platform mapping, or is forced custom
		const shouldBeCustom = eventMapping.isCustom || !eventMapping.hasPlatformMapping || forceCustom;

		// For custom events, use "custom" as event_name
		const mappedEventName = shouldBeCustom ? "custom" : eventMapping.eventName;

		const metadata = eventData.metadata || {};

		// Build user_data object
		const user_data: Record<string, unknown> = {};

		// Hash email if provided (Pinterest requires array format)
		if (metadata.email) {
			user_data.em = [await sha256Hash(metadata.email)];
		}

		// Hash phone number if provided (Pinterest requires array format)
		if (metadata.phone_number) {
			user_data.ph = [await sha256Hash(metadata.phone_number)];
		}

		// Hash external_id (user_id) if provided, otherwise use trace_id
		const externalId = eventData.payload.user_id || eventData.trace_id;
		if (externalId) {
			user_data.external_id = [await sha256Hash(String(externalId))];
		}

		// Hash mobile advertising ID if provided (idfa or gaid)
		if (metadata.idfa || metadata.gaid) {
			const maid = metadata.idfa || metadata.gaid;
			user_data.hashed_maids = [await sha256Hash(String(maid))];
		}

		// Hash additional PII fields if provided
		// Priority: metadata → trace → skip
		if (metadata.first_name) {
			user_data.fn = [
				await sha256Hash(
					metadata.first_name
						.toLowerCase()
						.normalize("NFD")
						.replace(/[\u0300-\u036f]/g, ""),
				),
			];
		}

		if (metadata.last_name) {
			user_data.ln = [
				await sha256Hash(
					metadata.last_name
						.toLowerCase()
						.normalize("NFD")
						.replace(/[\u0300-\u036f]/g, ""),
				),
			];
		}

		const city = metadata.city || trace.city;
		if (city) {
			user_data.ct = [
				await sha256Hash(
					city
						.toLowerCase()
						.normalize("NFD")
						.replace(/[\u0300-\u036f]/g, ""),
				),
			];
		}

		const region = metadata.region || trace.region;
		if (region) {
			user_data.st = [await sha256Hash(region.toLowerCase())];
		}

		const country = metadata.country || trace.country;
		if (country) {
			user_data.country = [await sha256Hash(country.toLowerCase())];
		}

		const postalCode = metadata.postal_code || trace.postal_code;
		if (postalCode) {
			user_data.zp = [await sha256Hash(String(postalCode).toLowerCase())];
		}

		if (metadata.birth_date) {
			user_data.db = [await sha256Hash(metadata.birth_date)];
		}

		const gender = (metadata as any).gender;
		if (gender) {
			user_data.ge = [await sha256Hash(String(gender).toLowerCase())];
		}

		// Add client IP and user agent (not hashed)
		// Priority: metadata > trace > not included
		if (metadata.ip_address || trace.client_ip) {
			user_data.client_ip_address = metadata.ip_address || trace.client_ip;
		}

		if (metadata.user_agent || trace.user_agent) {
			user_data.client_user_agent = metadata.user_agent || trace.user_agent;
		}

		// Add click_id if available (not hashed)
		if (trace.click_id) {
			user_data.click_id = trace.click_id;
		}

		// Add partner_id if available (not hashed)
		const partnerId = (metadata as any).partner_id;
		if (partnerId) {
			user_data.partner_id = partnerId;
		}

		// Build custom_data object
		const custom_data: Record<string, unknown> = {};

		// All from metadata or payload
		if (metadata.currency) {
			custom_data.currency = metadata.currency;
		}

		if (metadata.value !== undefined) {
			custom_data.value = String(metadata.value);
		}

		if (eventData.payload.order_id) {
			custom_data.order_id = String(eventData.payload.order_id);
		}

		// Build contents array with detailed product information
		// Priority: use payload.contents if provided, otherwise build from payload.content_ids or metadata.content_ids
		if (eventData.payload.contents && Array.isArray(eventData.payload.contents)) {
			// Use provided contents array (already in correct format)
			custom_data.contents = eventData.payload.contents;
			// Extract content_ids from contents if not already provided
			if (!eventData.payload.content_ids) {
				custom_data.content_ids = eventData.payload.contents.map((item: any) => item.id);
			} else {
				custom_data.content_ids = eventData.payload.content_ids;
			}
		} else if (eventData.payload.content_ids && Array.isArray(eventData.payload.content_ids)) {
			// Only content_ids provided, add them directly
			custom_data.content_ids = eventData.payload.content_ids;
			// Optionally build contents from content_ids if we have price/quantity info
			const itemPrice = (metadata as any).item_price || metadata.value;
			const quantity = (metadata as any).quantity || metadata.item_count || 1;
			if (itemPrice !== undefined) {
				custom_data.contents = eventData.payload.content_ids.map((content_id: string) => ({
					id: content_id,
					item_price: String(itemPrice),
					quantity: quantity,
				}));
			}
		} else if (metadata.content_ids && Array.isArray(metadata.content_ids)) {
			// Fallback to metadata.content_ids
			custom_data.content_ids = metadata.content_ids;
		}

		if (metadata.item_count !== undefined) {
			custom_data.num_items = metadata.item_count;
		}

		// Additional custom_data fields from metadata
		const searchString = (metadata as any).search_string;
		if (searchString) {
			custom_data.search_string = searchString;
		}

		const contentName = (metadata as any).content_name;
		if (contentName) {
			custom_data.content_name = contentName;
		}

		const contentCategory = (metadata as any).content_category;
		if (contentCategory) {
			custom_data.content_category = contentCategory;
		}

		const contentBrand = (metadata as any).content_brand;
		if (contentBrand) {
			custom_data.content_brand = contentBrand;
		}

		// Extract device/app information from user agent and trace
		const userAgent = metadata.user_agent || trace.user_agent;
		const deviceInfo = extractDeviceInfo(userAgent, trace);

		// Build event data object
		const eventDataObj: Record<string, unknown> = {
			event_name: mappedEventName,
			// Priority: metadata.action_source > "web" (default)
			action_source: (metadata.action_source || "web") as string,
			event_time: event_time,
			event_id: `evt_${mappedEventName}_${eventData.trace_id}_${event_time}`,
			opt_out: false,
		};

		// Add event_source_url if available
		// Priority: trace.final_url > metadata.page_url > not included
		if (trace.final_url || metadata.page_url) {
			eventDataObj.event_source_url = trace.final_url || metadata.page_url;
		}

		// Add device/app/network fields (only if they exist in metadata or can be inferred)
		// Priority: metadata > inferred from trace/user_agent > not included
		const appId = (metadata as any).app_id;
		if (appId) {
			eventDataObj.app_id = appId;
		}

		const appName = (metadata as any).app_name || deviceInfo.app_name;
		if (appName) {
			eventDataObj.app_name = appName;
		}

		const appVersion = (metadata as any).app_version || deviceInfo.app_version;
		if (appVersion) {
			eventDataObj.app_version = appVersion;
		}

		const deviceBrand = (metadata as any).device_brand || deviceInfo.device_brand;
		if (deviceBrand) {
			eventDataObj.device_brand = deviceBrand;
		}

		const deviceCarrier = (metadata as any).device_carrier;
		if (deviceCarrier) {
			eventDataObj.device_carrier = deviceCarrier;
		}

		const deviceModel = (metadata as any).device_model || deviceInfo.device_model;
		if (deviceModel) {
			eventDataObj.device_model = deviceModel;
		}

		const deviceType = (metadata as any).device_type || deviceInfo.device_type;
		if (deviceType) {
			eventDataObj.device_type = deviceType;
		}

		const osVersion = (metadata as any).os_version || deviceInfo.os_version;
		if (osVersion) {
			eventDataObj.os_version = osVersion;
		}

		const language = (metadata as any).language || deviceInfo.language;
		if (language) {
			// Pinterest expects ISO 639-1 (2-letter code only, e.g., "en", "pt")
			// Convert "en-US" -> "en", "pt-BR" -> "pt"
			const languageCode = String(language).split("-")[0].toLowerCase();
			if (languageCode.length === 2) {
				eventDataObj.language = languageCode;
			}
		}

		const wifi = (metadata as any).wifi !== undefined ? (metadata as any).wifi : deviceInfo.wifi;
		if (wifi !== undefined) {
			eventDataObj.wifi = wifi;
		}

		const partnerName = (metadata as any).partner_name;
		if (partnerName) {
			eventDataObj.partner_name = partnerName;
		}

		// Add user_data if not empty
		if (Object.keys(user_data).length > 0) {
			eventDataObj.user_data = user_data;
		}

		// Add custom_data if not empty
		if (Object.keys(custom_data).length > 0) {
			eventDataObj.custom_data = custom_data;
		}

		const payload = {
			data: [eventDataObj],
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
			console.warn(`[Pinterest] Event skipped: ${validation.reason}`);
			return null;
		}

		let payload: Record<string, unknown>;
		try {
			// Build payload
			payload = await this.buildPayload(eventData, trace, credentials, sendTestEvents);
		} catch (err) {
			console.error(`[Pinterest] ${err}`);
			return null;
		}

		// Apply exclusions and remove null fields
		const cleanedPayload = this.preparePayload(payload, eventData.name);

		// Add test mode as query parameter if enabled
		const url = sendTestEvents
			? `${this.baseUrl}/${credentials.pixelId}/events?test=true`
			: `${this.baseUrl}/${credentials.pixelId}/events`;

		console.log("[Pinterest] Using URL:", url);
		console.log("[Pinterest] Ad Account ID (pixelId):", credentials.pixelId);
		console.log("Sending to Pinterest:", JSON.stringify(cleanedPayload, null, 2));

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${credentials.apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(cleanedPayload),
			});

			const data = await response.json();
			if (!response.ok) {
				console.error("Pinterest API error:", data);
			} else {
				console.log("Pinterest API success:", data);
			}

			return cleanedPayload;
		} catch (err) {
			console.error("Fetch to Pinterest failed:", err);
			throw err;
		}
	}
}
