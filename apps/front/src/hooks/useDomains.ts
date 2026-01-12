import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthHeaders } from "@/web/lib/auth-helpers";
import { honoClient } from "@/web/lib/hono-client";

export interface Domain {
	id: string;
	hostname: string;
	status: string;
	sslStatus: string;
	customHostnameId: string;
	verificationErrors: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
	optimistic?: boolean; // For UI feedback
}

export interface DomainCreate {
	hostname: string;
}

export interface DomainUpdate {
	hostname?: string;
	status?: string;
	sslStatus?: string;
	customHostnameId?: string;
	verificationErrors?: string;
}

// Query keys factory
export const domainKeys = {
	all: ["domains"] as const,
	lists: () => [...domainKeys.all, "list"] as const,
	detail: (id: string) => [...domainKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch all domains
 */
export function useDomainsList() {
	return useQuery({
		queryKey: domainKeys.lists(),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.domains.$get({}, { headers });

			if (!res.ok) {
				throw new Error("Failed to fetch domains");
			}

			const data = await res.json();
			return data.data as Domain[];
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchInterval: 30000, // Auto-refresh every 30 seconds
	});
}

/**
 * Hook to create a new domain with optimistic updates
 */
export function useCreateDomain() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (domainData: DomainCreate) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.domains.$post(
				{ json: domainData },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error((error as any).message || "Failed to create domain");
			}

			const data = await res.json();
			return data.data as Domain;
		},

		// Optimistic update
		onMutate: async (newDomain) => {
			await queryClient.cancelQueries({ queryKey: domainKeys.all });

			const previousDomains = queryClient.getQueryData<Domain[]>(
				domainKeys.lists(),
			);

			queryClient.setQueryData<Domain[]>(domainKeys.lists(), (old) => [
				...(old ?? []),
				{
					id: `temp-${Date.now()}`,
					userId: "",
					createdAt: new Date(),
					updatedAt: new Date(),
					status: "pending",
					sslStatus: "pending",
					customHostnameId: "",
					verificationErrors: "",
					...newDomain,
					optimistic: true,
				} as Domain,
			]);

			return { previousDomains };
		},

		onSuccess: () => {
			toast.success("Domain created successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousDomains) {
				queryClient.setQueryData(domainKeys.lists(), context.previousDomains);
			}
			toast.error(`Failed to create domain: ${err.message}`);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: domainKeys.all });
		},
	});
}

/**
 * Hook to update a domain with optimistic updates
 */
export function useUpdateDomain() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: DomainUpdate }) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.domains[":id"].$put(
				{ param: { id }, json: data },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error((error as any).message || "Failed to update domain");
			}

			const responseData = await res.json();
			return responseData as Domain;
		},

		// Optimistic update
		onMutate: async (updated) => {
			await queryClient.cancelQueries({ queryKey: domainKeys.all });

			const previousDomains = queryClient.getQueryData<Domain[]>(
				domainKeys.lists(),
			);

			queryClient.setQueryData<Domain[]>(domainKeys.lists(), (old) =>
				old?.map((domain) =>
					domain.id === updated.id ? { ...domain, ...updated.data } : domain,
				),
			);

			return { previousDomains };
		},

		onSuccess: () => {
			toast.success("Domain updated successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousDomains) {
				queryClient.setQueryData(domainKeys.lists(), context.previousDomains);
			}

			// Check if it's a "no changes detected" error (422)
			const errorMessage = err.message || "";
			if (
				errorMessage.includes("No changes") ||
				errorMessage.includes("no changes")
			) {
				toast.info("No changes detected - domain status is already up to date");
			} else {
				toast.error(`Failed to update domain: ${err.message}`);
			}
		},

		onSettled: (_, __, variables) => {
			queryClient.invalidateQueries({ queryKey: domainKeys.all });
			queryClient.invalidateQueries({
				queryKey: domainKeys.detail(variables.id),
			});
		},
	});
}

/**
 * Hook to delete a domain with optimistic updates
 */
export function useDeleteDomain() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.domains[":id"].$delete(
				{ param: { id } },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to delete domain");
			}
		},

		// Optimistic update
		onMutate: async (deletedId) => {
			await queryClient.cancelQueries({ queryKey: domainKeys.all });

			const previousDomains = queryClient.getQueryData<Domain[]>(
				domainKeys.lists(),
			);

			queryClient.setQueryData<Domain[]>(domainKeys.lists(), (old) =>
				old?.filter((domain) => domain.id !== deletedId),
			);

			return { previousDomains };
		},

		onSuccess: () => {
			toast.success("Domain deleted successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousDomains) {
				queryClient.setQueryData(domainKeys.lists(), context.previousDomains);
			}
			toast.error(`Failed to delete domain: ${err.message}`);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: domainKeys.all });
		},
	});
}
