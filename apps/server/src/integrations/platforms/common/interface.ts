// Base interface for all CAPI services
import { type EventMessage, type Trace } from "./types";

export interface CapiCredentials {
	apiKey: string;
	pixelId: string;
	testId?: string | null;
}

export interface ValidationResult {
	valid: boolean;
	reason?: string;
}

export interface ICapiService {
	/**
	 * Sends an event to the platform's Conversion API
	 * @param credentials - Platform-specific credentials
	 * @param eventData - Event data to send
	 * @param trace - Associated trace data
	 * @param sendTestEvents - Whether to enable test mode
	 */
	sendEvent(
		credentials: CapiCredentials,
		eventData: EventMessage,
		trace: Trace,
		sendTestEvents: boolean,
	): Promise<unknown>;

	/**
	 * Validates if an event can be sent to this platform
	 */
	validateEvent(eventName: string, clickId: string | null): ValidationResult;

	/**
	 * Builds the platform-specific payload
	 */
	buildPayload(
		eventData: EventMessage,
		trace: Trace,
		credentials: CapiCredentials,
		sendTestEvents: boolean,
	): Promise<Record<string, unknown>>;
}
