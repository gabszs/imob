// Base abstract class for all CAPI services
import { convertToUnixTimestamp, sha256Hash } from "../../../common/utils";
import { mapEventNameToPlatform } from "./eventMapping";
import type { CapiCredentials, ICapiService, ValidationResult } from "./interface";
import type { EventMessage, Platform, Trace } from "./types";

/**
 * Field exclusion rules for events
 * Maps event name to array of field paths to exclude
 * Supports nested paths using dot notation (e.g., "metadata.phone", "user.email")
 */
export type EventExclusionRules = {
	[eventName: string]: string[];
};

export abstract class BaseCapiService implements ICapiService {
	protected readonly platformName: string;
	protected readonly baseUrl: string;

	/**
	 * Optional exclusion rules for events
	 * If defined, fields matching these paths will be removed for specific events
	 */
	protected exclusionRules?: EventExclusionRules;

	constructor(platformName: string, baseUrl: string) {
		this.platformName = platformName;
		this.baseUrl = baseUrl;
	}

	// Abstract methods - must be implemented by each platform
	abstract sendEvent(
		credentials: CapiCredentials,
		eventData: EventMessage,
		trace: Trace,
		sendTestEvents: boolean,
	): Promise<unknown>;

	abstract buildPayload(
		eventData: EventMessage,
		trace: Trace,
		credentials: CapiCredentials,
		sendTestEvents: boolean,
	): Promise<Record<string, unknown>>;

	abstract validateEvent(eventName: string, clickId: string | null): ValidationResult;

	// Shared utility methods available to all platforms
	protected async hashEmail(email: string): Promise<string> {
		return sha256Hash(email);
	}

	protected async hashPhone(phone: string): Promise<string> {
		return sha256Hash(phone);
	}

	/**
	 * Checks if an object is empty (no keys) or an array is empty
	 */
	private isEmpty(value: unknown): boolean {
		if (Array.isArray(value)) {
			return value.length === 0;
		}
		if (typeof value === "object" && value !== null) {
			return Object.keys(value).length === 0;
		}
		return false;
	}

	/**
	 * Removes null, undefined fields and empty objects/arrays recursively
	 * @param obj - Object to clean
	 * @returns Object without null/undefined fields and empty objects/arrays
	 */
	protected removeNullFields<T>(obj: T): T {
		if (obj === null || obj === undefined) {
			return obj;
		}

		if (Array.isArray(obj)) {
			const cleaned = obj
				.map((item) => this.removeNullFields(item))
				.filter((item) => {
					// Remove null/undefined items
					if (item === null || item === undefined) return false;
					// Remove empty objects/arrays
					if (this.isEmpty(item)) return false;
					return true;
				});
			return cleaned as T;
		}

		if (typeof obj === "object") {
			const result: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(obj)) {
				// Skip null/undefined
				if (value === null || value === undefined) {
					continue;
				}

				// Recursively clean nested values
				const cleanedValue = this.removeNullFields(value);

				// Skip if cleaned value became null/undefined
				if (cleanedValue === null || cleanedValue === undefined) {
					continue;
				}

				// Skip empty objects/arrays after cleaning
				if (this.isEmpty(cleanedValue)) {
					continue;
				}

				result[key] = cleanedValue;
			}
			return result as T;
		}

		return obj;
	}

	/**
	 * Removes specific fields from an object using dot notation paths
	 * Supports nested paths like "metadata.phone" or "user.email"
	 * Automatically handles arrays - applies removal to all array items
	 * @param obj - Object to modify
	 * @param paths - Array of dot-notation paths to remove
	 * @returns Modified object
	 */
	protected removeFields<T extends Record<string, unknown>>(obj: T, paths: string[]): T {
		const cloned = structuredClone(obj);

		for (const path of paths) {
			const parts = path.split(".");
			this.removeFieldRecursive(cloned, parts, 0);
		}

		return cloned;
	}

	/**
	 * Recursively removes a field from an object, handling arrays automatically
	 */
	// biome-ignore lint/suspicious/noExplicitAny: Need dynamic navigation through nested structures
	private removeFieldRecursive(current: any, parts: string[], index: number): void {
		if (!current || typeof current !== "object") {
			return;
		}

		// If we're at the last part, remove the field
		if (index === parts.length - 1) {
			if (Array.isArray(current)) {
				// Remove from all array items
				for (const item of current) {
					if (item && typeof item === "object") {
						delete item[parts[index]];
					}
				}
			} else {
				// Remove from object
				delete current[parts[index]];
			}
			return;
		}

		// Navigate deeper
		const nextKey = parts[index];
		const next = current[nextKey];

		if (Array.isArray(next)) {
			// Apply to all array items
			for (const item of next) {
				this.removeFieldRecursive(item, parts, index + 1);
			}
		} else if (next && typeof next === "object") {
			// Navigate into object
			this.removeFieldRecursive(next, parts, index + 1);
		}
	}

	/**
	 * @deprecated Use removeNullFields instead
	 */
	protected cleanPayload<T>(payload: T): T {
		return this.removeNullFields(payload);
	}

	protected convertTimestampToSeconds(timestamp: string): number {
		return Math.floor(convertToUnixTimestamp(timestamp) / 1000);
	}

	protected convertTimestampToMillis(timestamp: string): number {
		return convertToUnixTimestamp(timestamp);
	}

	protected async request<T>(
		url: string,
		headers: Record<string, string>,
		body: unknown,
		method = "POST",
	): Promise<T> {
		try {
			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					...headers,
				},
				body: JSON.stringify(body),
			});

			const data = await response.json();

			if (!response.ok) {
				console.error(`[${this.platformName}] API error:`, data);
				throw new Error(`${this.platformName} API Error: ${response.status}`);
			}

			console.log(`[${this.platformName}] API success:`, data);
			return data;
		} catch (err) {
			console.error(`[${this.platformName}] Fetch failed:`, err);
			throw err;
		}
	}

	protected extractUserData(eventData: EventMessage, trace: Trace): Record<string, unknown> {
		return {
			ip_address: eventData.metadata?.ip_address || trace.client_ip || null,
			user_agent: eventData.metadata?.user_agent || trace.user_agent || null,
		};
	}

	protected extractCustomData(eventData: EventMessage): Record<string, unknown> {
		const metadata = eventData.metadata || {};
		return {
			currency: metadata.currency || null,
			value: metadata.value || null,
			item_count: metadata.item_count || null,
			content_ids: metadata.content_ids || null,
			content_type: metadata.content_type || null,
		};
	}

	/**
	 * Applies exclusion rules and removes null fields from payload
	 * This is the main method to prepare a payload before sending to CAPI
	 *
	 * Steps (in order):
	 * 1. Apply event-specific field exclusions (if defined in exclusionRules)
	 * 2. Remove all null/undefined fields recursively
	 * 3. Remove empty objects and arrays recursively
	 *
	 * Note: If removing fields leaves a sub-object empty, that sub-object will be removed
	 *
	 * @param payload - The payload from buildPayload()
	 * @param eventName - Raw event name (before mapping, e.g., "PAGEVIEW")
	 * @returns Cleaned and filtered payload
	 *
	 * @example
	 * ```typescript
	 * // In platform's sendEvent() method:
	 * const payload = await this.buildPayload(eventData, trace, credentials, sendTestEvents);
	 * const cleanedPayload = this.preparePayload(payload, eventData.name);
	 * // Use cleanedPayload in fetch()
	 * ```
	 */
	protected preparePayload(
		payload: Record<string, unknown>,
		eventName: string,
	): Record<string, unknown> {
		let result = payload;

		// Apply exclusion rules if defined
		if (this.exclusionRules) {
			// Map event name to platform-specific name
			const mappedEventName = mapEventNameToPlatform(
				eventName,
				this.platformName.toLowerCase() as Platform,
			);

			// Get exclusion paths for this event
			const exclusionPaths = this.exclusionRules[mappedEventName];

			if (exclusionPaths && exclusionPaths.length > 0) {
				result = this.removeFields(result, exclusionPaths);
				console.log(
					`[${this.platformName}] Applied exclusions for "${mappedEventName}": [${exclusionPaths.join(", ")}]`,
				);
			}
		}

		// Remove null/undefined fields
		result = this.removeNullFields(result);

		return result;
	}
}
