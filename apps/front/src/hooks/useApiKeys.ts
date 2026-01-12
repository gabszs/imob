import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthHeaders } from "@/web/lib/auth-helpers";
import { honoClient } from "@/web/lib/hono-client";

export interface ApiKey {
	id: string;
	name: string;
	key: string;
	type: string;
	isActive: boolean;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
	optimistic?: boolean; // For UI feedback
}

export interface ApiKeyCreate {
	name: string;
	type: string;
	isActive: boolean;
}

export interface ApiKeyUpdate {
	name?: string;
	type?: string;
	isActive?: boolean;
}

// Query keys factory
export const apiKeyKeys = {
	all: ["apiKeys"] as const,
	lists: () => [...apiKeyKeys.all, "list"] as const,
	detail: (id: string) => [...apiKeyKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch all API keys
 */
export function useApiKeysList() {
	return useQuery({
		queryKey: apiKeyKeys.lists(),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1["api-keys"].$get({}, { headers });

			if (!res.ok) {
				throw new Error("Failed to fetch API keys");
			}

			const data = await res.json();
			return data.data as ApiKey[];
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Hook to create a new API key with optimistic updates
 */
export function useCreateApiKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (apiKeyData: ApiKeyCreate) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1["api-keys"].$post(
				{ json: apiKeyData },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error((error as any).message || "Failed to create API key");
			}

			const data = await res.json();
			return data.data as ApiKey;
		},

		// Optimistic update
		onMutate: async (newApiKey) => {
			await queryClient.cancelQueries({ queryKey: apiKeyKeys.all });

			const previousApiKeys = queryClient.getQueryData<ApiKey[]>(
				apiKeyKeys.lists(),
			);

			queryClient.setQueryData<ApiKey[]>(apiKeyKeys.lists(), (old) => [
				...(old ?? []),
				{
					id: `temp-${Date.now()}`,
					key: "***",
					userId: "",
					createdAt: new Date(),
					updatedAt: new Date(),
					...newApiKey,
					optimistic: true,
				} as ApiKey,
			]);

			return { previousApiKeys };
		},

		onSuccess: () => {
			toast.success("API key created successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousApiKeys) {
				queryClient.setQueryData(apiKeyKeys.lists(), context.previousApiKeys);
			}
			toast.error(`Failed to create API key: ${err.message}`);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
		},
	});
}

/**
 * Hook to update an API key with optimistic updates
 */
export function useUpdateApiKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: ApiKeyUpdate }) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1["api-keys"][":id"].$put(
				{ param: { id }, json: data },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error((error as any).message || "Failed to update API key");
			}

			const responseData = await res.json();
			return responseData as ApiKey;
		},

		// Optimistic update
		onMutate: async (updated) => {
			await queryClient.cancelQueries({ queryKey: apiKeyKeys.all });

			const previousApiKeys = queryClient.getQueryData<ApiKey[]>(
				apiKeyKeys.lists(),
			);

			queryClient.setQueryData<ApiKey[]>(apiKeyKeys.lists(), (old) =>
				old?.map((apiKey) =>
					apiKey.id === updated.id ? { ...apiKey, ...updated.data } : apiKey,
				),
			);

			return { previousApiKeys };
		},

		onSuccess: () => {
			toast.success("API key updated successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousApiKeys) {
				queryClient.setQueryData(apiKeyKeys.lists(), context.previousApiKeys);
			}
			toast.error(`Failed to update API key: ${err.message}`);
		},

		onSettled: (_, __, variables) => {
			queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
			queryClient.invalidateQueries({
				queryKey: apiKeyKeys.detail(variables.id),
			});
		},
	});
}

/**
 * Hook to delete an API key with optimistic updates
 */
export function useDeleteApiKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1["api-keys"][":id"].$delete(
				{ param: { id } },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to delete API key");
			}
		},

		// Optimistic update
		onMutate: async (deletedId) => {
			await queryClient.cancelQueries({ queryKey: apiKeyKeys.all });

			const previousApiKeys = queryClient.getQueryData<ApiKey[]>(
				apiKeyKeys.lists(),
			);

			queryClient.setQueryData<ApiKey[]>(apiKeyKeys.lists(), (old) =>
				old?.filter((apiKey) => apiKey.id !== deletedId),
			);

			return { previousApiKeys };
		},

		onSuccess: () => {
			toast.success("API key deleted successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousApiKeys) {
				queryClient.setQueryData(apiKeyKeys.lists(), context.previousApiKeys);
			}
			toast.error(`Failed to delete API key: ${err.message}`);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
		},
	});
}
