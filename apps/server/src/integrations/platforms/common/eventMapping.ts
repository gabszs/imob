// Event name mapping and validation for CAPI integrations
import { type Platform } from "./types";

// Standard event names (case-insensitive)
const STANDARD_EVENTS = [
	"PAGEVIEW",
	"VIEWCONTENT",
	"SEARCH",
	"ADDTOCART",
	"ADDTOWISHLIST",
	"INITCHECKOUT",
	"PENDINGPURCHASE",
	"PURCHASE",
	"SUBMITFORM",
	"CONTACT",
	"SUBMITAPPLICATION",
	"SIGNUP",
	"SUBSCRIBE",
] as const;

// Event name mapping: Traki standard events to platform-specific event names
const EVENT_NAME_MAPPING: Record<
	string,
	Partial<{
		reddit: string;
		tiktok: string;
		pinterest: string;
		kwai: string;
		facebook: string;
	}>
> = {
	PAGEVIEW: {
		reddit: "PageVisit",
		tiktok: "ViewContent",
		pinterest: "page_visit",
		kwai: "EVENT_CONTENT_VIEW",
		facebook: "PageView",
	},
	VIEWCONTENT: {
		reddit: "ViewContent",
		tiktok: "ViewContent",
		pinterest: "page_visit",
		kwai: "EVENT_CONTENT_VIEW",
		facebook: "ViewContent",
	},
	SEARCH: {
		reddit: "Search",
		tiktok: "Search",
		pinterest: "search",
		kwai: "EVENT_SEARCH",
		facebook: "Search",
	},
	ADDTOCART: {
		reddit: "AddToCart",
		tiktok: "AddToCart",
		pinterest: "add_to_cart",
		kwai: "EVENT_ADD_TO_CART",
		facebook: "AddToCart",
	},
	ADDTOWISHLIST: {
		reddit: "AddToWishlist",
		tiktok: "AddToWishlist",
		pinterest: "add_to_wishlist",
		kwai: "EVENT_ADD_TO_WISHLIST",
		facebook: "AddToWishlist",
	},
	INITCHECKOUT: {
		reddit: "InitCheckout",
		tiktok: "InitiateCheckout",
		pinterest: "checkout",
		kwai: "EVENT_INITIATED_CHECKOUT",
		facebook: "InitiateCheckout",
	},
	PENDINGPURCHASE: {
		tiktok: "PlaceAnOrder",
		pinterest: "checkout",
		kwai: "EVENT_PLACE_ORDER",
		// reddit: "PendingPurchase",
		// facebook: "PendingPurchase",
	},
	PURCHASE: {
		reddit: "Purchase",
		tiktok: "CompletePayment",
		pinterest: "checkout",
		kwai: "EVENT_PURCHASE",
		facebook: "Purchase",
	},
	SUBMITFORM: {
		reddit: "Lead",
		tiktok: "SubmitForm",
		pinterest: "lead",
		kwai: "EVENT_FORM_SUBMIT",
		facebook: "Lead",
	},
	CONTACT: {
		reddit: "Lead",
		tiktok: "Contact",
		pinterest: "lead",
		kwai: "EVENT_CONTACT",
		facebook: "Contact",
	},
	SUBMITAPPLICATION: {
		reddit: "Lead",
		tiktok: "SubmitApplication",
		pinterest: "lead",
		kwai: "EVENT_LOAN_APPLICATION",
		facebook: "SubmitApplication",
	},
	SIGNUP: {
		reddit: "SignUp",
		tiktok: "CompleteRegistration",
		pinterest: "signup",
		kwai: "EVENT_COMPLETE_REGISTRATION",
		facebook: "CompleteRegistration",
	},
	SUBSCRIBE: {
		reddit: "SignUp",
		tiktok: "Subscribe",
		pinterest: "signup",
		kwai: "EVENT_SUBSCRIBE",
		facebook: "Subscribe",
	},
};

// Platform configurations
interface PlatformConfig {
	allowCustomEvents: boolean;
	requireClickId: boolean;
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
	reddit: {
		allowCustomEvents: true,
		requireClickId: false,
	},
	tiktok: {
		allowCustomEvents: true,
		requireClickId: false,
	},
	kwai: {
		allowCustomEvents: false,
		requireClickId: true,
	},
	pinterest: {
		allowCustomEvents: true,
		requireClickId: false,
	},
	facebook: {
		allowCustomEvents: true,
		requireClickId: false,
	},
};

export interface EventMappingResult {
	/** The mapped event name for the platform */
	eventName: string;
	/** Whether this event should be sent as a custom event */
	isCustom: boolean;
	/** Whether the platform has a specific mapping for this event */
	hasPlatformMapping: boolean;
}

export function isStandardEvent(eventName: string): boolean {
	const normalized = eventName.toUpperCase().replace(/[_\s-]/g, "");
	return (STANDARD_EVENTS as readonly string[]).includes(normalized);
}

/**
 * Maps a Traki event name to the platform-specific event name
 * @param eventName - The Traki event name (e.g., "Contact", "Purchase")
 * @param platform - The target platform
 * @returns The platform-specific event name or the original name
 */
export function mapEventNameToPlatform(eventName: string, platform: Platform): string {
	const normalized = eventName.toUpperCase().replace(/[_\s-]/g, "");

	// Check if it's a standard event
	if (isStandardEvent(eventName)) {
		const mapping = EVENT_NAME_MAPPING[normalized];
		if (mapping && mapping[platform]) {
			return mapping[platform];
		}
	}

	return eventName;
}

/**
 * Maps a Traki event name to the platform-specific event name with additional metadata
 * @param eventName - The Traki event name (e.g., "Contact", "Purchase")
 * @param platform - The target platform
 * @returns EventMappingResult with mapped name and custom event flags
 */
export function mapEventToPlatform(eventName: string, platform: Platform): EventMappingResult {
	const normalized = eventName.toUpperCase().replace(/[_\s-]/g, "");
	const isStandard = isStandardEvent(eventName);

	// If not a standard event, it's always custom
	if (!isStandard) {
		return {
			eventName: eventName,
			isCustom: true,
			hasPlatformMapping: false,
		};
	}

	// Check if the platform has a mapping for this standard event
	const mapping = EVENT_NAME_MAPPING[normalized];
	const platformMapping = mapping?.[platform];

	// If standard event but no platform mapping, treat as custom
	if (!platformMapping) {
		return {
			eventName: eventName,
			isCustom: true,
			hasPlatformMapping: false,
		};
	}

	// Standard event with platform mapping
	return {
		eventName: platformMapping,
		isCustom: false,
		hasPlatformMapping: true,
	};
}

export function validateEventForPlatform(
	eventName: string,
	platform: string,
	clickId: string | null,
): { valid: boolean; reason?: string } {
	const config = PLATFORM_CONFIGS[platform];
	if (!config) {
		return { valid: false, reason: `Unknown platform: ${platform}` };
	}

	// Check if event is custom
	const isCustom = !isStandardEvent(eventName);
	if (isCustom && !config.allowCustomEvents) {
		return {
			valid: false,
			reason: `Platform ${platform} does not allow custom events. Event: ${eventName}`,
		};
	}

	// Check if click_id is required
	if (config.requireClickId && !clickId) {
		return {
			valid: false,
			reason: `Platform ${platform} requires click_id but none was provided`,
		};
	}

	return { valid: true };
}
