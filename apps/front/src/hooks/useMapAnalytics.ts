import { type TimeRange, useMapLocations } from "@/web/hooks/useAnalytics";
import {
    type AggregatedAnalyticsData,
    buildAnalyticsLookup,
} from "@/web/lib/map/analytics-aggregator";
import { useMemo } from "react";
import { type VisibleStates } from "./useVisibleStates";

export interface UseMapAnalyticsOptions {
	campaignId: string | null;
	timeRange: TimeRange;
	zoom: number;
	visibleStates: VisibleStates;
}

export interface UseMapAnalyticsResult {
	aggregatedData: AggregatedAnalyticsData | null;
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
}

/**
 * Hook for fetching and processing map analytics data based on zoom level
 * @param options - Configuration options
 * @returns Aggregated analytics data and query states
 */
export function useMapAnalytics({
	campaignId,
	timeRange,
	zoom,
	visibleStates,
}: UseMapAnalyticsOptions): UseMapAnalyticsResult {
	console.log("[useMapAnalytics] Called with:", {
		campaignId,
		timeRange,
		zoom,
		visibleStates,
	});

	// Fetch analytics data using TanStack Query hook
	console.log(
		"[useMapAnalytics] Query enabled?",
		!!campaignId,
		"campaignId:",
		campaignId,
	);

	const query = useMapLocations(campaignId || "", timeRange);

	// Process raw data into aggregated lookup maps
	const aggregatedData = useMemo(() => {
		if (!query.data) return null;
		console.log("[useMapAnalytics] Processing data:", query.data);
		const result = buildAnalyticsLookup(query.data.data, zoom);
		console.log("[useMapAnalytics] Aggregated result:", result);
		return result;
	}, [query.data, zoom]);

	console.log("[useMapAnalytics] Query state:", {
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		hasData: !!query.data,
		aggregatedData,
	});

	return {
		aggregatedData,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
}
