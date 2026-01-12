import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthHeaders } from "@/web/lib/auth-helpers";
import { honoClient } from "@/web/lib/hono-client";

export interface Trace {
	id: string;
	created_at: string;
	campaign_id: string;
	clarity_session_id: string | null;
	clarity_project_id: string | null;
	clarity_user_id: string | null;
	api_key_id: string;
	user_id?: string | null;
	final_url: string;
	click_id: string | null;
	utm_source: string | null;
	utm_medium: string | null;
	utm_campaign: string | null;
	utm_term: string | null;
	utm_content: string | null;
	client_ip: string | null;
	country: string | null;
	continent: string | null;
	region_code: string | null;
	region: string | null;
	city: string | null;
	postal_code: string | null;
	timezone: string | null;
	latitude: number | null;
	longitude: number | null;
	host: string | null;
	colo: string | null;
	asn: string | null;
	as_organization: string | null;
	cf_ray: string | null;
	user_agent: string | null;
	verified_bot_category: string | null;
	accept_language: string | null;
	sec_ch_ua: string | null;
	sec_ch_ua_platform: string | null;
	sec_fetch_mode: string | null;
	sec_fetch_user: string | null;
	sec_ch_ua_mobile: string | null;
	optimistic?: boolean; // For UI feedback
}

export interface TraceCreate {
	created_at?: string;
	campaign_id: string;
	user_id?: string | null;
	final_url?: string | null;
	utm_source?: string | null;
	utm_medium?: string | null;
	utm_campaign?: string | null;
	utm_term?: string | null;
	utm_content?: string | null;
	client_ip?: string | null;
	country?: string | null;
	continent?: string | null;
	region_code?: string | null;
	region?: string | null;
	city?: string | null;
	postal_code?: string | null;
	timezone?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	host?: string | null;
	colo?: string | null;
	asn?: string | null;
	as_organization?: string | null;
	user_agent?: string | null;
	verified_bot_category?: string | null;
	accept_language?: string | null;
	sec_ch_ua?: string | null;
	sec_ch_ua_platform?: string | null;
	sec_fetch_mode?: string | null;
	sec_fetch_user?: string | null;
	sec_ch_ua_mobile?: string | null;
	click_id?: string | null;
}

export interface TracesListParams {
	limit?: number;
	offset?: number;
	ordering?: string;
}

export interface TracesFilters {
	city?: string[];
	country?: string[];
	browser?: string[];
	os?: string[];
	campaign?: string[];
	utm_source?: string[];
}

// Query keys factory
export const traceKeys = {
	all: ["traces"] as const,
	lists: () => [...traceKeys.all, "list"] as const,
	list: (params?: TracesListParams, filters?: TracesFilters) => {
		const { ordering, ...restParams } = params || {};
		return [...traceKeys.lists(), restParams, filters] as const;
	},
	detail: (id: string) => [...traceKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch traces with pagination and filters
 */
export function useTracesList(
	params?: TracesListParams,
	filters?: TracesFilters,
) {
	return useQuery({
		queryKey: traceKeys.list(params, filters),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const queryParams: Record<string, string | number> = {};

			// Map limit/offset to page/page_size
			if (params?.limit !== undefined) {
				queryParams.page_size = params.limit;
			}
			if (params?.offset !== undefined) {
				const limit = params.limit || 20;
				const page = Math.floor(params.offset / limit) + 1;
				queryParams.page = page;
			}
			if (params?.ordering) {
				queryParams.ordering = params.ordering;
			}

			// Add filters as comma-separated values
			if (filters?.city && filters.city.length > 0) {
				queryParams.city = filters.city.join(",");
			}
			if (filters?.country && filters.country.length > 0) {
				queryParams.country = filters.country.join(",");
			}
			if (filters?.browser && filters.browser.length > 0) {
				queryParams.browser = filters.browser.join(",");
			}
			if (filters?.os && filters.os.length > 0) {
				queryParams.os = filters.os.join(",");
			}
			if (filters?.campaign && filters.campaign.length > 0) {
				queryParams.campaign = filters.campaign.join(",");
			}
			if (filters?.utm_source && filters.utm_source.length > 0) {
				queryParams.utm_source = filters.utm_source.join(",");
			}

			const res = await honoClient.v1.traces.$get(
				{ query: queryParams as any },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to fetch traces");
			}

			const result = await res.json();

			// Handle API response format
			let responseData = result;
			if (
				result.data &&
				typeof result.data === "object" &&
				"data" in result.data
			) {
				responseData = result.data;
			}

			// Return the data array
			if (Array.isArray(responseData.data)) {
				return responseData.data as Trace[];
			}

			if (Array.isArray(responseData)) {
				return responseData as Trace[];
			}

			return [];
		},
		staleTime: 1000 * 60, // 1 minute
	});
}

/**
 * Hook to fetch a single trace by ID
 */
export function useTrace(id: string) {
	return useQuery({
		queryKey: traceKeys.detail(id),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.traces[":id"].$get(
				{ param: { id } },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to fetch trace");
			}

			const data = await res.json();
			return data as Trace;
		},
		enabled: !!id,
	});
}

/**
 * Hook to create a new trace
 */
export function useCreateTrace() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (traceData: TraceCreate) => {
			const headers = await getAuthHeaders();

			// Convert undefined to null for nullable fields, but omit created_at if undefined
			const payload: Record<string, string | number | null> = {};
			for (const [key, value] of Object.entries(traceData)) {
				// Skip created_at if it's undefined or empty
				if (key === "created_at" && (value === undefined || value === "")) {
					continue;
				}
				// Convert other fields: undefined or empty string becomes null
				payload[key] = value === undefined || value === "" ? null : value;
			}

			const res = await honoClient.v1.traces.$post(
				{ json: payload as any },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error((error as any).message || "Failed to create trace");
			}

			const result = await res.json();
			return result.data.trace as Trace;
		},

		onSuccess: () => {
			toast.success("Trace created successfully");
			// Invalidate all trace queries
			queryClient.invalidateQueries({ queryKey: traceKeys.all });
		},

		onError: (err) => {
			toast.error(`Failed to create trace: ${err.message}`);
		},
	});
}

/**
 * Hook to delete a trace
 */
export function useDeleteTrace() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.traces[":id"].$delete(
				{ param: { id } },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to delete trace");
			}
		},

		onSuccess: () => {
			toast.success("Trace deleted successfully");
			// Invalidate all trace queries
			queryClient.invalidateQueries({ queryKey: traceKeys.all });
		},

		onError: (err) => {
			toast.error(`Failed to delete trace: ${err.message}`);
		},
	});
}
