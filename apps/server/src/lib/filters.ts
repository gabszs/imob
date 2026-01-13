import { type Filters } from "../common/services/baseService";

export interface User {
	id: string;
	role: string;
	userId?: string;
}

/**
 * Generates filters for services that use SQL (D1)
 * Field: userId
 */
export function getSqlFilters(user: User): Filters {
	return user.role !== "admin" ? { userId: user.id } : {};
}
