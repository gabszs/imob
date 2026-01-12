import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/web/lib/auth-helpers";
import { honoClient } from "@/web/lib/hono-client";

export type TimeRange = "30min" | "day" | "week" | "month" | "90days";

export interface UTMAnalysisPoint {
	hour: string;
	utm_source: string;
	count: number;
}

export interface UTMAnalysisResponse {
	time_range: TimeRange;
	start_time: string;
	end_time: string;
	total_records: number;
	data: UTMAnalysisPoint[];
}

export interface LocationAnalysisPoint {
	hour: string;
	country: string;
	city: string;
	count: number;
}

export interface LocationAnalysisResponse {
	time_range: TimeRange;
	start_time: string;
	end_time: string;
	total_records: number;
	data: LocationAnalysisPoint[];
}

export interface MapLocationPoint {
	country: string;
	city: string;
	latitude: number;
	longitude: number;
	count: number;
}

export interface MapLocationsResponse {
	time_range: TimeRange;
	start_time: string;
	end_time: string;
	total_locations: number;
	data: MapLocationPoint[];
}

// Query keys factory
export const analyticsKeys = {
	all: ["analytics"] as const,
	utm: (campaignId: string, timeRange: TimeRange) =>
		[...analyticsKeys.all, "utm", campaignId, timeRange] as const,
	location: (
		campaignId: string,
		timeRange: TimeRange,
		filters?: { city?: string[]; country?: string[] },
	) =>
		[...analyticsKeys.all, "location", campaignId, timeRange, filters] as const,
	map: (campaignId: string, timeRange: TimeRange) =>
		[...analyticsKeys.all, "map", campaignId, timeRange] as const,
};

/**
 * Hook to fetch UTM source analysis by hour
 */
export function useUTMAnalysis(
	campaignId: string,
	timeRange: TimeRange = "day",
) {
	return useQuery<UTMAnalysisResponse>({
		queryKey: analyticsKeys.utm(campaignId, timeRange),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.analytics["utm-by-hour"].$get(
				{
					query: {
						campaign_id: campaignId,
						time_range: timeRange,
					},
				},
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to fetch UTM analysis");
			}

			return res.json();
		},
		enabled: !!campaignId,
		refetchInterval: 30000, // Refresh every 30 seconds
		staleTime: 1000 * 30, // Consider data stale after 30 seconds
	});
}

/**
 * Hook to fetch location analysis by hour
 */
export function useLocationAnalysis(
	campaignId: string,
	timeRange: TimeRange = "day",
	filters?: { city?: string[]; country?: string[] },
) {
	return useQuery<LocationAnalysisResponse>({
		queryKey: analyticsKeys.location(campaignId, timeRange, filters),
		queryFn: async () => {
			const headers = await getAuthHeaders();

			// Build query params
			const queryParams: Record<string, string> = {
				campaign_id: campaignId,
				time_range: timeRange,
			};

			// Add filters as comma-separated values
			if (filters?.city && filters.city.length > 0) {
				queryParams.city = filters.city.join(",");
			}
			if (filters?.country && filters.country.length > 0) {
				queryParams.country = filters.country.join(",");
			}

			const res = await honoClient.v1.analytics["location-by-hour"].$get(
				{ query: queryParams },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to fetch location analysis");
			}

			return res.json();
		},
		enabled: !!campaignId,
		refetchInterval: 30000, // Refresh every 30 seconds
		staleTime: 1000 * 30, // Consider data stale after 30 seconds
	});
}

/**
 * Hook to fetch map locations
 */
export function useMapLocations(
	campaignId: string,
	timeRange: TimeRange = "day",
) {
	return useQuery<MapLocationsResponse>({
		queryKey: analyticsKeys.map(campaignId, timeRange),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.analytics["map-locations"].$get(
				{
					query: {
						campaign_id: campaignId,
						time_range: timeRange,
						min_count: "1",
					},
				},
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to fetch map locations");
			}

			return res.json();
		},
		enabled: !!campaignId,
		refetchInterval: 30000, // Refresh every 30 seconds
		staleTime: 1000 * 30, // Consider data stale after 30 seconds
	});
}
