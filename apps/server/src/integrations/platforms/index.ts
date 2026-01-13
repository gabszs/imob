// Export all platforms

export { Facebook } from "../facebook/service";
export { Kwai } from "../kwai/service";
export { Pinterest } from "../pinterest/service";
export { Reddit } from "../reddit/service";
export { TikTok } from "../tiktok/service";
export {
    ICapiService,
    ValidationResult, type CapiCredentials
} from "./common/interface";

// Export common types and interfaces
export {
    EventMetadata,
    Platform,
    Trace, type EventMessage
} from "./common/types";
export { PlatformService } from "./service";

