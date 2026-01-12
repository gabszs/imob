import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthHeaders } from "@/web/lib/auth-helpers";
import { honoClient } from "@/web/lib/hono-client";

export interface Campaign {
	id: string;
	name: string;
	link: string;
	socialMediaCampaignId: string | null;
	isActive: boolean;
	eventReplication: boolean;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
	optimistic?: boolean; // For UI feedback
}

export interface CampaignCreate {
	name: string;
	link: string;
	socialMediaCampaignId?: string | null;
	isActive?: boolean;
	eventReplication?: boolean;
}

export interface CampaignUpdate {
	name?: string;
	link?: string;
	socialMediaCampaignId?: string | null;
	isActive?: boolean;
	eventReplication?: boolean;
}

// Query keys factory
export const campaignKeys = {
	all: ["campaigns"] as const,
	lists: () => [...campaignKeys.all, "list"] as const,
	detail: (id: string) => [...campaignKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch all campaigns
 */
export function useCampaignsList() {
	return useQuery({
		queryKey: campaignKeys.lists(),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.campaigns.$get({}, { headers });

			if (!res.ok) {
				throw new Error("Failed to fetch campaigns");
			}

			const data = await res.json();
			return data.data as Campaign[];
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Hook to create a new campaign with optimistic updates
 */
export function useCreateCampaign() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (campaignData: CampaignCreate) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.campaigns.$post(
				{ json: campaignData },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error((error as any).message || "Failed to create campaign");
			}

			const data = await res.json();
			return data.data as Campaign;
		},

		// Optimistic update
		onMutate: async (newCampaign) => {
			await queryClient.cancelQueries({ queryKey: campaignKeys.all });

			const previousCampaigns = queryClient.getQueryData<Campaign[]>(
				campaignKeys.lists(),
			);

			queryClient.setQueryData<Campaign[]>(campaignKeys.lists(), (old) => [
				...(old ?? []),
				{
					id: `temp-${Date.now()}`,
					userId: "",
					createdAt: new Date(),
					updatedAt: new Date(),
					socialMediaCampaignId: null,
					isActive: true,
					eventReplication: false,
					...newCampaign,
					optimistic: true,
				} as Campaign,
			]);

			return { previousCampaigns };
		},

		onSuccess: () => {
			toast.success("Campaign created successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousCampaigns) {
				queryClient.setQueryData(
					campaignKeys.lists(),
					context.previousCampaigns,
				);
			}
			toast.error(`Failed to create campaign: ${err.message}`);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: campaignKeys.all });
		},
	});
}

/**
 * Hook to update a campaign with optimistic updates
 */
export function useUpdateCampaign() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: CampaignUpdate }) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.campaigns[":id"].$put(
				{ param: { id }, json: data },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error((error as any).message || "Failed to update campaign");
			}

			return res.json() as Promise<Campaign>;
		},

		// Optimistic update
		onMutate: async (updated) => {
			await queryClient.cancelQueries({ queryKey: campaignKeys.all });

			const previousCampaigns = queryClient.getQueryData<Campaign[]>(
				campaignKeys.lists(),
			);

			queryClient.setQueryData<Campaign[]>(campaignKeys.lists(), (old) =>
				old?.map((campaign) =>
					campaign.id === updated.id
						? { ...campaign, ...updated.data }
						: campaign,
				),
			);

			return { previousCampaigns };
		},

		onSuccess: () => {
			toast.success("Campaign updated successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousCampaigns) {
				queryClient.setQueryData(
					campaignKeys.lists(),
					context.previousCampaigns,
				);
			}
			toast.error(`Failed to update campaign: ${err.message}`);
		},

		onSettled: (_, __, variables) => {
			queryClient.invalidateQueries({ queryKey: campaignKeys.all });
			queryClient.invalidateQueries({
				queryKey: campaignKeys.detail(variables.id),
			});
		},
	});
}

/**
 * Hook to delete a campaign with optimistic updates
 */
export function useDeleteCampaign() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.campaigns[":id"].$delete(
				{ param: { id } },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to delete campaign");
			}
		},

		// Optimistic update
		onMutate: async (deletedId) => {
			await queryClient.cancelQueries({ queryKey: campaignKeys.all });

			const previousCampaigns = queryClient.getQueryData<Campaign[]>(
				campaignKeys.lists(),
			);

			queryClient.setQueryData<Campaign[]>(campaignKeys.lists(), (old) =>
				old?.filter((campaign) => campaign.id !== deletedId),
			);

			return { previousCampaigns };
		},

		onSuccess: () => {
			toast.success("Campaign deleted successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousCampaigns) {
				queryClient.setQueryData(
					campaignKeys.lists(),
					context.previousCampaigns,
				);
			}
			toast.error(`Failed to delete campaign: ${err.message}`);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: campaignKeys.all });
		},
	});
}
