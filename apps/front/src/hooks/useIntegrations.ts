import { getAuthHeaders } from "@/web/lib/auth-helpers";
import { honoClient } from "@/web/lib/hono-client";
import {
    type CreateInput,
    Integration,
    UpdateInput,
    WithOptimistic,
} from "@/web/types/backend.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Re-export for convenience
export { type Integration };

// Type aliases for this hook
export type IntegrationCreate = CreateInput<Integration>;
export type IntegrationUpdate = UpdateInput<Integration>;
export type IntegrationWithOptimistic = WithOptimistic<Integration>;

// Query keys factory
export const integrationKeys = {
	all: ["integrations"] as const,
	lists: () => [...integrationKeys.all, "list"] as const,
	detail: (id: string) => [...integrationKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch all integrations
 */
export function useIntegrationsList() {
	return useQuery({
		queryKey: integrationKeys.lists(),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.integrations.$get({}, { headers });

			if (!res.ok) {
				throw new Error("Failed to fetch integrations");
			}

			const data = await res.json();
			return data.data as Integration[];
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Hook to upload an image for integration
 */
export function useUploadIntegrationImage() {
	return useMutation({
		mutationFn: async ({
			file,
			filename,
		}: {
			file: File;
			filename: string;
		}) => {
			const session = await import("@/web/lib/auth-client").then((m) =>
				m.authClient.getSession(),
			);
			if (!session?.data?.session?.token) {
				throw new Error("Not authenticated");
			}

			// Rename the file before uploading
			const renamedFile = new File([file], filename, { type: file.type });

			const headers = {
				Authorization: `Bearer ${session.data.session.token}`,
			};

			const res = await honoClient.v1.integrations["upload-image"].$post(
				{
					form: {
						name: renamedFile, // Server expects 'name' field, not 'file'
					},
				},
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error(
					(error as any).message || "Failed to upload integration image",
				);
			}

			const data = await res.json();
			return data.data as { file_key: string };
		},

		onError: (err) => {
			toast.error(`Failed to upload image: ${err.message}`);
		},
	});
}

/**
 * Hook to create a new integration with optimistic updates
 */
export function useCreateIntegration() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (integrationData: IntegrationCreate) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.integrations.$post(
				{ json: integrationData },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error(
					(error as any).message || "Failed to create integration",
				);
			}

			const data = await res.json();
			return data.data as Integration;
		},

		// Optimistic update
		onMutate: async (newIntegration) => {
			await queryClient.cancelQueries({ queryKey: integrationKeys.all });

			const previousIntegrations = queryClient.getQueryData<Integration[]>(
				integrationKeys.lists(),
			);

			queryClient.setQueryData<Integration[]>(
				integrationKeys.lists(),
				(old) => [
					...(old ?? []),
					{
						id: `temp-${Date.now()}`,
						createdAt: new Date(),
						updatedAt: new Date(),
						...newIntegration,
						imageKey: newIntegration.imageKey || null,
						optimistic: true,
					} as IntegrationWithOptimistic,
				],
			);

			return { previousIntegrations };
		},

		onSuccess: () => {
			toast.success("Integration created successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousIntegrations) {
				queryClient.setQueryData(
					integrationKeys.lists(),
					context.previousIntegrations,
				);
			}
			toast.error(`Failed to create integration: ${err.message}`);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: integrationKeys.all });
		},
	});
}

/**
 * Hook to update an integration with optimistic updates
 */
export function useUpdateIntegration() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: IntegrationUpdate;
		}) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.integrations[":id"].$put(
				{ param: { id }, json: data },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error(
					(error as any).message || "Failed to update integration",
				);
			}

			return (await res.json()) as Integration;
		},

		// Optimistic update
		onMutate: async (updated) => {
			await queryClient.cancelQueries({ queryKey: integrationKeys.all });

			const previousIntegrations = queryClient.getQueryData<Integration[]>(
				integrationKeys.lists(),
			);

			queryClient.setQueryData<Integration[]>(integrationKeys.lists(), (old) =>
				old?.map((integration) =>
					integration.id === updated.id
						? { ...integration, ...updated.data }
						: integration,
				),
			);

			return { previousIntegrations };
		},

		onSuccess: () => {
			toast.success("Integration updated successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousIntegrations) {
				queryClient.setQueryData(
					integrationKeys.lists(),
					context.previousIntegrations,
				);
			}
			toast.error(`Failed to update integration: ${err.message}`);
		},

		onSettled: (_, __, variables) => {
			queryClient.invalidateQueries({ queryKey: integrationKeys.all });
			queryClient.invalidateQueries({
				queryKey: integrationKeys.detail(variables.id),
			});
		},
	});
}

/**
 * Hook to delete an integration with optimistic updates
 */
export function useDeleteIntegration() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.integrations[":id"].$delete(
				{ param: { id } },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to delete integration");
			}
		},

		// Optimistic update
		onMutate: async (deletedId) => {
			await queryClient.cancelQueries({ queryKey: integrationKeys.all });

			const previousIntegrations = queryClient.getQueryData<Integration[]>(
				integrationKeys.lists(),
			);

			queryClient.setQueryData<Integration[]>(integrationKeys.lists(), (old) =>
				old?.filter((integration) => integration.id !== deletedId),
			);

			return { previousIntegrations };
		},

		onSuccess: () => {
			toast.success("Integration deleted successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousIntegrations) {
				queryClient.setQueryData(
					integrationKeys.lists(),
					context.previousIntegrations,
				);
			}
			toast.error(`Failed to delete integration: ${err.message}`);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: integrationKeys.all });
		},
	});
}
