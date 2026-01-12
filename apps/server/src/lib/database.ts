import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { models } from "../db/models";

export type Database = DrizzleD1Database<typeof models>;
let db: Database | null = null;

export function getDb(bindingDb?: D1Database): Database {
	if (!db) {
		if (!bindingDb) {
			throw new Error("Database not initialized and no D1Database binding provided");
		}
		db = drizzle(bindingDb, { schema: models, logger: false });
	}
	return db;
}
