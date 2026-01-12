import { sha256Hash } from "../../../common/utils";
import { BaseCapiService } from "../../platforms/common/baseService";
import { mapEventToPlatform } from "../../platforms/common/eventMapping";
import type { CapiCredentials, ValidationResult } from "../../platforms/common/interface";
import type { EventMessage, Trace } from "../../platforms/common/types";

export class FacebookCapiService extends BaseCapiService {
	constructor() {
		super("Facebook", "https://graph.facebook.com/v19.0");
	}

	validateEvent(eventName: string, clickId: string | null): ValidationResult {
		// Facebook allows custom events, doesn't require click_id
		return { valid: true };
	}

	async buildPayload(
		eventData: EventMessage,
		trace: Trace,
		credentials: CapiCredentials,
		sendTestEvents: boolean,
	): Promise<Record<string, unknown>> {
		// Map event name to Facebook-specific name
		const eventMapping = mapEventToPlatform(eventData.name, "facebook");
		const mappedEventName = eventMapping.eventName;

		// Convert created_at from SQL format to Unix timestamp in seconds
		const event_time = this.convertTimestampToSeconds(eventData.created_at);

		const metadata = eventData.metadata || {};

		// Build user_data object
		const user_data: Record<string, unknown> = {};

		// Hash email and phone if provided (Facebook requires SHA-256 hashing)
		if (metadata.email) {
			user_data.em = await sha256Hash(metadata.email);
		}

		if (metadata.phone_number) {
			user_data.ph = await sha256Hash(metadata.phone_number);
		}

		// Hash additional PII fields (Facebook user identification fields)
		// Priority: metadata → trace → skip
		const postalCode = metadata.postal_code || trace.postal_code;
		if (postalCode) {
			user_data.zp = await sha256Hash(postalCode.toLowerCase());
		}

		if (metadata.birth_date) {
			user_data.dob = await sha256Hash(metadata.birth_date);
		}

		if (metadata.first_name) {
			user_data.fn = await sha256Hash(
				metadata.first_name
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, ""),
			);
		}

		if (metadata.last_name) {
			user_data.ln = await sha256Hash(
				metadata.last_name
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, ""),
			);
		}

		const city = metadata.city || trace.city;
		if (city) {
			user_data.ct = await sha256Hash(
				city
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, ""),
			);
		}

		const region = metadata.region || trace.region;
		if (region) {
			user_data.st = await sha256Hash(region.toLowerCase());
		}

		// Add Facebook Click ID (fbc) if available in trace
		// Format: fb.1.<timestamp>.<click_id>
		if (trace.click_id) {
			const timestamp = Math.floor(Date.now() / 1000);
			user_data.fbc = `fb.1.${timestamp}.${trace.click_id}`;
		}

		// Add Facebook Browser Pixel (fbp) - plain text, not hashed
		if (metadata.fbp) {
			user_data.fbp = metadata.fbp;
		}

		// Add Facebook Login ID - plain text, not hashed
		if (metadata.fb_login_id) {
			user_data.fb_login_id = metadata.fb_login_id;
		}

		// Add external ID - priority: metadata > trace.user_id
		if (metadata.external_id || trace.user_id) {
			user_data.external_id = metadata.external_id || trace.user_id;
		}

		// Add client IP and user agent
		if (trace.client_ip || metadata.ip_address) {
			user_data.client_ip_address = trace.client_ip || metadata.ip_address;
		}

		if (trace.user_agent || metadata.user_agent) {
			user_data.client_user_agent = trace.user_agent || metadata.user_agent;
		}

		// Build custom_data object
		const custom_data: Record<string, unknown> = {};

		if (metadata.currency) {
			custom_data.currency = metadata.currency;
		}

		if (metadata.value !== undefined) {
			custom_data.value = metadata.value;
		}

		if (metadata.item_count !== undefined) {
			custom_data.num_items = metadata.item_count;
		}

		if (metadata.content_ids && Array.isArray(metadata.content_ids)) {
			custom_data.content_ids = metadata.content_ids;
		}

		if (metadata.content_type) {
			custom_data.content_type = metadata.content_type;
		}

		// Build the event data object
		const eventDataPayload: Record<string, unknown> = {
			event_name: mappedEventName,
			event_time: event_time,
			action_source: metadata.action_source ? metadata.action_source.toLowerCase() : "website",
		};

		// Add event_source_url if page_url exists
		if (metadata.page_url) {
			eventDataPayload.event_source_url = metadata.page_url;
		}

		// Generate event_id (unique identifier for deduplication)
		eventDataPayload.event_id = `${mappedEventName}_${eventData.trace_id}_${event_time}`;

		// Add user_data if not empty
		if (Object.keys(user_data).length > 0) {
			eventDataPayload.user_data = user_data;
		}

		// Add custom_data if not empty
		if (Object.keys(custom_data).length > 0) {
			eventDataPayload.custom_data = custom_data;
		}

		// Build final payload
		const payloadBase: Record<string, unknown> = {
			data: [eventDataPayload],
		};

		// Add test_event_code only if sendTestEvents is true AND testId exists
		if (sendTestEvents && credentials.testId) {
			payloadBase.test_event_code = credentials.testId;
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
			console.warn(`[Facebook] Event skipped: ${validation.reason}`);
			return null;
		}

		// Build payload
		const payload = await this.buildPayload(eventData, trace, credentials, sendTestEvents);

		// Apply exclusions (none defined) and remove null fields
		const cleanedPayload = this.preparePayload(payload, eventData.name);

		console.log("Sending to Facebook:", JSON.stringify(cleanedPayload, null, 2));

		// Facebook uses Graph API format: /v19.0/{pixel_id}/events
		const url = `${this.baseUrl}/${credentials.pixelId}/events`;

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
				console.error("Facebook API error:", {
					data,
					status: response.status,
					pixelId: credentials.pixelId,
					authorization: `Bearer ${credentials.apiKey}`,
				});
			} else {
				console.log("Facebook API success:", {
					data,
					status: response.status,
					pixelId: credentials.pixelId,
					authorization: `Bearer ${credentials.apiKey}`,
				});
			}

			return cleanedPayload;
		} catch (err) {
			console.error("Fetch to Facebook failed:", err);
			throw err;
		}
	}
}

// { // root object
//   "data": [ // data (array of objects)
//     { // event object
//       "event_name": "checkout", // event_name (string)
//       "event_time": 1765491079, // event_time (int64)
//       "action_source": "app_ios", // action_source (string)
//       "event_id": "eventid0001", // event_id (string)
//       "event_source_url": "https://example.com", // event_source_url (string)
//       "app_id": "app_id_example", // app_id (string)
//       "app_name": "app_name_example", // app_name (string)
//       "app_version": "1.0.0", // app_version (string)
//       "device_brand": "Apple", // device_brand (string)
//       "device_carrier": "Verizon", // device_carrier (string)
//       "device_model": "iPhone12", // device_model (string)
//       "device_type": "mobile", // device_type (string)
//       "language": "en-US", // language (string)
//       "opt_out": true, // opt_out (boolean)
//       "os_version": "15.0", // os_version (string)
//       "partner_name": "partner_example", // partner_name (string)
//       "wifi": true, // wifi (boolean)
//       "user_data": { // user_data (object)
//         "em": ["411e44ce1261728ffd2c0686e44e3fffe413c0e2c5adc498bc7da883d476b9c8"], // em (array of strings | hashed)
//         "hashed_maids": ["411e44ce1261728ffd2c0686e44e3fffe413c0e2c5adc498bc7da883d476b9c8"], // hashed_maids (array of strings | hashed)
//         "client_ip_address": "192.0.2.1", // client_ip_address (string)
//         "client_user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)", // client_user_agent (string)
//         "external_id": ["47cdfeaae42f13f279752cd35f1217a7b7362e2e885297294f2ec8fe4b7a7d83"], // external_id (array of strings | hashed)
//         "fn": ["47cdfeaae42f13f279752cd35f1217a7b7362e2e885297294f2ec8fe4b7a7d83"], // fn (array of strings | hashed)
//         "ln": ["47cdfeaae42f13f279752cd35f1217a7b7362e2e885297294f2ec8fe4b7a7d83"], // ln (array of strings | hashed)
//         "ph": ["47cdfeaae42f13f279752cd35f1217a7b7362e2e885297294f2ec8fe4b7a7d83"], // ph (array of strings | hashed)
//         "ct": ["47cdfeaae42f13f279752cd35f1217a7b7362e2e885297294f2ec8fe4b7a7d83"], // ct (array of strings | hashed)
//         "st": ["47cdfeaae42f13f279752cd35f1217a7b7362e2e885297294f2ec8fe4b7a7d83"], // st (array of strings | hashed)
//         "country": ["47cdfeaae42f13f279752cd35f1217a7b7362e2e885297294f2ec8fe4b7a7d83"], // country (array of strings | hashed)
//         "zp": ["47cdfeaae42f13f279752cd35f1217a7b7362e2e885297294f2ec8fe4b7a7d83"], // zp (array of strings | hashed)
//         "db": ["47cdfeaae42f13f279752cd35f1217a7b7362e2e885297294f2ec8fe4b7a7d83"], // db (array of strings | hashed)
//         "ge": ["47cdfeaae42f13f279752cd35f1217a7b7362e2e885297294f2ec8fe4b7a7d83"], // ge (array of strings | hashed)
//         "click_id": "clickid_example", // click_id (string)
//         "partner_id": "partnerid_example" // partner_id (string)
//       }, // end user_data
//       "custom_data": { // custom_data (object)
//         "content_ids": ["product1", "product2"], // content_ids (array of strings)
//         "contents": [ // contents (array of objects)
//           { // content object
//             "id": "product1", // contents.id (string)
//             "item_price": "10.00", // contents.item_price (string)
//             "quantity": 2 // contents.quantity (int64)
//           }, // end content object
//           { // content object
//             "id": "product2", // contents.id (string)
//             "item_price": "20.00", // contents.item_price (string)
//             "quantity": 1 // contents.quantity (int64)
//           } // end content object
//         ], // end contents
//         "currency": "USD", // currency (string)
//         "order_id": "order123", // order_id (string)
//         "value": "30.00", // value (string)
//         "num_items": 3, // num_items (int64)
//         "content_brand": "brand_example", // content_brand (string)
//         "content_category": "category_example", // content_category (string)
//         "content_name": "name_example", // content_name (string)
//         "np": "np_example", // np (string)
//         "opt_out_type": "opt_out_example", // opt_out_type (string)
//         "search_string": "search_example" // search_string (string)
//       } // end custom_data
//     } // end event object
//   ] // end data
// } // end root object
