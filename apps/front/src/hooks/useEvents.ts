import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthHeaders } from "@/web/lib/auth-helpers";
import { honoClient } from "@/web/lib/hono-client";

export interface Event {
	trace_id: string;
	id: string;
	name: string;
	campaign_id?: string;
	user_id?: string | null;
	created_at: string;
	payload: Record<string, unknown> | null;
	metadata?: Record<string, unknown> | null;
	optimistic?: boolean; // For UI feedback
}

export interface EventCreate {
	trace_id: string;
	name: string;
	campaign_id?: string;
	user_id?: string | null;
	created_at?: string;
	payload?: Record<string, unknown> | null;
	metadata?: Record<string, unknown> | null;
}

export interface EventsListParams {
	page?: number;
	page_size?: number;
	ordering?: string;
}

export interface EventsFilters {
	name?: string[];
	trace_id?: string[];
}

export interface EventsListResponse {
	data: Event[];
	total: number;
	page: number;
	page_size: number;
	total_pages: number;
}

// Query keys factory
export const eventKeys = {
	all: ["events"] as const,
	lists: () => [...eventKeys.all, "list"] as const,
	list: (params: EventsListParams, filters?: EventsFilters) =>
		[...eventKeys.lists(), params, filters] as const,
	detail: (id: string) => [...eventKeys.all, "detail", id] as const,
	byTraceId: (traceId: string) =>
		[...eventKeys.all, "byTraceId", traceId] as const,
};

/**
 * Hook to fetch paginated events with filters
 */
export function useEventsList(
	params: EventsListParams = {},
	filters?: EventsFilters,
) {
	return useQuery({
		queryKey: eventKeys.list(params, filters),
		queryFn: async () => {
			const headers = await getAuthHeaders();

			// Build query params
			const queryParams: Record<string, string | number> = {};
			if (params.page) queryParams.page = params.page;
			if (params.page_size) queryParams.page_size = params.page_size;
			if (params.ordering) queryParams.ordering = params.ordering;

			// Add filters as comma-separated values
			if (filters?.name && filters.name.length > 0) {
				queryParams.name = filters.name.join(",");
			}
			if (filters?.trace_id && filters.trace_id.length > 0) {
				queryParams.trace_id = filters.trace_id.join(",");
			}

			const res = await honoClient.v1.events.$get(
				{ query: queryParams as any },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to fetch events");
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

			const data = Array.isArray(responseData.data) ? responseData.data : [];
			const metadata = responseData.metadata || {};
			const page = metadata.page || params.page || 1;
			const page_size = metadata.page_size || params.page_size || 20;
			const total = data.length;
			const total_pages = Math.ceil(total / page_size);

			return {
				data: data as Event[],
				total,
				page,
				page_size,
				total_pages,
			};
		},
		staleTime: 1000 * 60, // 1 minute
	});
}

/**
 * Hook to fetch a single event by ID
 */
export function useEvent(id: string) {
	return useQuery({
		queryKey: eventKeys.detail(id),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.events[":id"].$get(
				{ param: { id } },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to fetch event");
			}

			const data = await res.json();
			return data as Event;
		},
		enabled: !!id,
	});
}

/**
 * Hook to fetch events by trace ID
 */
export function useEventsByTraceId(traceId: string) {
	return useQuery({
		queryKey: eventKeys.byTraceId(traceId),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.events.$get(
				{ query: { trace_id: traceId } as any },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to fetch events by trace ID");
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

			const data = Array.isArray(responseData.data) ? responseData.data : [];
			return data as Event[];
		},
		enabled: !!traceId,
		staleTime: 1000 * 60, // 1 minute
	});
}

/**
 * Hook to create a new event with optimistic updates
 */
export function useCreateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (eventData: EventCreate) => {
			const headers = await getAuthHeaders();

			// Convert undefined to null for nullable fields, but omit created_at if undefined
			const payload: Record<string, string | Record<string, unknown> | null> =
				{};
			for (const [key, value] of Object.entries(eventData)) {
				// Skip created_at if it's undefined or empty
				if (key === "created_at" && (value === undefined || value === "")) {
					continue;
				}
				// Convert other fields: undefined or empty string becomes null
				payload[key] = value === undefined || value === "" ? null : value;
			}

			const res = await honoClient.v1.events.$post(
				{ json: payload as any },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error((error as any).message || "Failed to create event");
			}

			const result = await res.json();
			return result.data.event as Event;
		},

		onSuccess: () => {
			toast.success("Event created successfully");
			// Invalidate all event queries
			queryClient.invalidateQueries({ queryKey: eventKeys.all });
		},

		onError: (err) => {
			toast.error(`Failed to create event: ${err.message}`);
		},
	});
}

/**
 * Hook to delete an event with optimistic updates
 */
export function useDeleteEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.events[":id"].$delete(
				{ param: { id } },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to delete event");
			}
		},

		onSuccess: (_, id) => {
			toast.success("Event deleted successfully");

			// Remove from all list queries without refetching
			queryClient.setQueriesData(
				{ queryKey: eventKeys.lists() },
				(oldData: EventsListResponse | undefined) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						data: oldData.data.filter((event) => event.id !== id),
						total: oldData.total - 1,
					};
				},
			);

			// Remove from detail query
			queryClient.removeQueries({
				queryKey: eventKeys.detail(id),
			});
		},

		onError: (err) => {
			toast.error(`Failed to delete event: ${err.message}`);
		},
	});
}
