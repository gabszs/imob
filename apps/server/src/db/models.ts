import * as authModels from "./authModels";

export * from "drizzle-orm";
export * from "./authModels";

export const models = {
	...authModels,
} as const;
