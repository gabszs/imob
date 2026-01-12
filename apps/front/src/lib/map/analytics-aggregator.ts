import type { MapLocationPoint } from "@/web/hooks/useAnalytics";
import { extractStateFromCityName, normalizeStateName } from "./state-mappings";

export interface AggregatedAnalyticsData {
	stateCountsMap: Map<string, number>;
	cityCountsMap: Map<string, number>;
}

/**
 * Aggregate city-level data to state level
 * @param data - Array of map location points from API
 * @returns Map of state name to total count
 */
export function aggregateCityDataByState(
	data: MapLocationPoint[],
): Map<string, number> {
	const stateCountsMap = new Map<string, number>();

	for (const point of data) {
		// Try to extract state from city name (format: "City, ST")
		const state = extractStateFromCityName(point.city);

		if (state) {
			const normalizedState = normalizeStateName(state);
			const currentCount = stateCountsMap.get(normalizedState) || 0;
			stateCountsMap.set(normalizedState, currentCount + point.count);
		}
	}

	return stateCountsMap;
}

/**
 * Build efficient lookup maps for both state and city level data
 * @param data - Array of map location points from API
 * @param zoom - Current zoom level
 * @returns Object with stateCountsMap and cityCountsMap for efficient lookup
 */
export function buildAnalyticsLookup(
	data: MapLocationPoint[],
	zoom: number,
): AggregatedAnalyticsData {
	const cityCountsMap = new Map<string, number>();
	const stateCountsMap = new Map<string, number>();

	console.log("[buildAnalyticsLookup] Processing", data.length, "data points");

	for (const point of data) {
		// Build city-level lookup (use just the city name, without state)
		const cityParts = point.city.split(",").map((p) => p.trim());
		const pureCityName = cityParts[0];
		const normalizedCityName = normalizeStateName(pureCityName);

		// Store with normalized name for consistent lookup
		const existingCityCount = cityCountsMap.get(normalizedCityName) || 0;
		cityCountsMap.set(normalizedCityName, existingCityCount + point.count);

		// Build state-level lookup
		const state = extractStateFromCityName(point.city);
		if (state) {
			const normalizedState = normalizeStateName(state);
			const existingStateCount = stateCountsMap.get(normalizedState) || 0;
			stateCountsMap.set(normalizedState, existingStateCount + point.count);

			console.log(
				`[buildAnalyticsLookup] City: "${point.city}" -> State: "${state}" -> Normalized: "${normalizedState}" -> Count: ${point.count}`,
			);
		} else {
			console.log(
				`[buildAnalyticsLookup] No state found for city: "${point.city}"`,
			);
		}
	}

	console.log(
		"[buildAnalyticsLookup] State counts map:",
		Array.from(stateCountsMap.entries()),
	);
	console.log(
		"[buildAnalyticsLookup] City counts map:",
		Array.from(cityCountsMap.entries()).slice(0, 10),
	);

	return {
		stateCountsMap,
		cityCountsMap,
	};
}

/**
 * Match a GeoJSON feature to a count from analytics data
 * @param feature - GeoJSON feature from map layer
 * @param analyticsData - Map of location name to count
 * @returns Count for the feature, or undefined if not found
 */
export function matchFeatureToCount(
	feature: { properties: Record<string, unknown> },
	analyticsData: Map<string, number>,
): number | undefined {
	// Try various property names that might contain the location name
	const possibleNames = [
		feature.properties.name,
		feature.properties.Estado,
		feature.properties.SIGLA,
		feature.properties.city,
	].filter((name): name is string => typeof name === "string");

	console.log(
		"[matchFeatureToCount] Trying to match feature with properties:",
		feature.properties,
	);
	console.log("[matchFeatureToCount] Possible names:", possibleNames);

	for (const name of possibleNames) {
		const normalizedName = normalizeStateName(name);
		const count = analyticsData.get(normalizedName);
		console.log(
			`[matchFeatureToCount] Trying "${name}" -> "${normalizedName}" -> ${count !== undefined ? `Found: ${count}` : "Not found"}`,
		);
		if (count !== undefined) {
			return count;
		}
	}

	console.log("[matchFeatureToCount] No match found");
	return undefined;
}
