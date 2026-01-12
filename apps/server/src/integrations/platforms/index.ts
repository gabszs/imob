// Export all platforms

export { Facebook } from "../facebook/service";
export { Kwai } from "../kwai/service";
export { Pinterest } from "../pinterest/service";
export { Reddit } from "../reddit/service";
export { TikTok } from "../tiktok/service";
export type {
	CapiCredentials,
	ICapiService,
	ValidationResult,
} from "./common/interface";

// Export common types and interfaces
export type {
	EventMessage,
	EventMetadata,
	Platform,
	Trace,
} from "./common/types";
export { PlatformService } from "./service";
