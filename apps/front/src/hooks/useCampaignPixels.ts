import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthHeaders } from "@/web/lib/auth-helpers";
import { honoClient } from "@/web/lib/hono-client";

export interface CampaignPixel {
	id: string;
	campaignId: string;
	pixelId: string;
	eventName: string | null;
	sendTestEvents: boolean;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	optimistic?: boolean; // For UI feedback
}

export interface CampaignPixelCreate {
	campaignId: string;
	pixelId: string;
	eventName?: string | null;
	sendTestEvents?: boolean;
	isActive?: boolean;
}

export interface CampaignPixelUpdate {
	campaignId?: string;
	pixelId?: string;
	eventName?: string | null;
	sendTestEvents?: boolean;
	isActive?: boolean;
}

// Query keys factory
export const campaignPixelKeys = {
	all: ["campaignPixels"] as const,
	lists: () => [...campaignPixelKeys.all, "list"] as const,
	byCampaign: (campaignId: string) =>
		[...campaignPixelKeys.all, "campaign", campaignId] as const,
	detail: (id: string) => [...campaignPixelKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch all campaign pixels
 */
export function useCampaignPixelsList() {
	return useQuery({
		queryKey: campaignPixelKeys.lists(),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1["campaign-pixels"].$get({}, { headers });

			if (!res.ok) {
				throw new Error("Failed to fetch campaign pixels");
			}

			const data = await res.json();
			return data.data as CampaignPixel[];
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Hook to fetch campaign pixels for a specific campaign
 */
export function useCampaignPixelsByCampaign(campaignId: string) {
	return useQuery({
		queryKey: campaignPixelKeys.byCampaign(campaignId),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1["campaign-pixels"].$get({}, { headers });

			if (!res.ok) {
				throw new Error("Failed to fetch campaign pixels");
			}

			const data = await res.json();
			const allPixels = data.data as CampaignPixel[];

			// Filter by campaign ID
			return allPixels.filter((pixel) => pixel.campaignId === campaignId);
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Hook to create a new campaign pixel with optimistic updates
 */
export function useCreateCampaignPixel() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (pixelData: CampaignPixelCreate) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1["campaign-pixels"].$post(
				{ json: pixelData },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error(
					(error as any).message || "Failed to create campaign pixel",
				);
			}

			const data = await res.json();
			return data.data as CampaignPixel;
		},

		// Optimistic update
		onMutate: async (newPixel) => {
			await queryClient.cancelQueries({ queryKey: campaignPixelKeys.all });

			const previousPixels = queryClient.getQueryData<CampaignPixel[]>(
				campaignPixelKeys.lists(),
			);
			const previousCampaignPixels = queryClient.getQueryData<CampaignPixel[]>(
				campaignPixelKeys.byCampaign(newPixel.campaignId),
			);

			const optimisticPixel = {
				id: `temp-${Date.now()}`,
				createdAt: new Date(),
				updatedAt: new Date(),
				eventName: null,
				sendTestEvents: false,
				isActive: true,
				...newPixel,
				optimistic: true,
			} as CampaignPixel;

			// Update both lists
			queryClient.setQueryData<CampaignPixel[]>(
				campaignPixelKeys.lists(),
				(old) => [...(old ?? []), optimisticPixel],
			);
			queryClient.setQueryData<CampaignPixel[]>(
				campaignPixelKeys.byCampaign(newPixel.campaignId),
				(old) => [...(old ?? []), optimisticPixel],
			);

			return {
				previousPixels,
				previousCampaignPixels,
				campaignId: newPixel.campaignId,
			};
		},

		onSuccess: () => {
			toast.success("Pixel added to campaign successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousPixels) {
				queryClient.setQueryData(
					campaignPixelKeys.lists(),
					context.previousPixels,
				);
			}
			if (context?.previousCampaignPixels && context?.campaignId) {
				queryClient.setQueryData(
					campaignPixelKeys.byCampaign(context.campaignId),
					context.previousCampaignPixels,
				);
			}
			toast.error(`Failed to add pixel: ${err.message}`);
		},

		onSettled: (_, __, variables) => {
			queryClient.invalidateQueries({ queryKey: campaignPixelKeys.all });
			queryClient.invalidateQueries({
				queryKey: campaignPixelKeys.byCampaign(variables.campaignId),
			});
		},
	});
}

/**
 * Hook to update a campaign pixel with optimistic updates
 */
export function useUpdateCampaignPixel() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: CampaignPixelUpdate;
		}) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1["campaign-pixels"][":id"].$put(
				{ param: { id }, json: data },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error(
					(error as any).message || "Failed to update campaign pixel",
				);
			}

			return res.json() as Promise<CampaignPixel>;
		},

		// Optimistic update
		onMutate: async (updated) => {
			await queryClient.cancelQueries({ queryKey: campaignPixelKeys.all });

			const previousPixels = queryClient.getQueryData<CampaignPixel[]>(
				campaignPixelKeys.lists(),
			);

			// Get the current pixel to know its campaign ID
			const currentPixel = previousPixels?.find((p) => p.id === updated.id);
			const campaignId = currentPixel?.campaignId;

			const previousCampaignPixels = campaignId
				? queryClient.getQueryData<CampaignPixel[]>(
						campaignPixelKeys.byCampaign(campaignId),
					)
				: undefined;

			const updateFn = (old?: CampaignPixel[]) =>
				old?.map((pixel) =>
					pixel.id === updated.id ? { ...pixel, ...updated.data } : pixel,
				);

			queryClient.setQueryData<CampaignPixel[]>(
				campaignPixelKeys.lists(),
				updateFn,
			);
			if (campaignId) {
				queryClient.setQueryData<CampaignPixel[]>(
					campaignPixelKeys.byCampaign(campaignId),
					updateFn,
				);
			}

			return { previousPixels, previousCampaignPixels, campaignId };
		},

		onSuccess: () => {
			toast.success("Campaign pixel updated successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousPixels) {
				queryClient.setQueryData(
					campaignPixelKeys.lists(),
					context.previousPixels,
				);
			}
			if (context?.previousCampaignPixels && context?.campaignId) {
				queryClient.setQueryData(
					campaignPixelKeys.byCampaign(context.campaignId),
					context.previousCampaignPixels,
				);
			}
			toast.error(`Failed to update campaign pixel: ${err.message}`);
		},

		onSettled: (_, __, variables) => {
			queryClient.invalidateQueries({ queryKey: campaignPixelKeys.all });
			queryClient.invalidateQueries({
				queryKey: campaignPixelKeys.detail(variables.id),
			});
		},
	});
}

/**
 * Hook to delete a campaign pixel with optimistic updates
 */
export function useDeleteCampaignPixel() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1["campaign-pixels"][":id"].$delete(
				{ param: { id } },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to delete campaign pixel");
			}
		},

		// Optimistic update
		onMutate: async (deletedId) => {
			await queryClient.cancelQueries({ queryKey: campaignPixelKeys.all });

			const previousPixels = queryClient.getQueryData<CampaignPixel[]>(
				campaignPixelKeys.lists(),
			);

			// Get the pixel to know its campaign ID
			const deletedPixel = previousPixels?.find((p) => p.id === deletedId);
			const campaignId = deletedPixel?.campaignId;

			const previousCampaignPixels = campaignId
				? queryClient.getQueryData<CampaignPixel[]>(
						campaignPixelKeys.byCampaign(campaignId),
					)
				: undefined;

			const filterFn = (old?: CampaignPixel[]) =>
				old?.filter((pixel) => pixel.id !== deletedId);

			queryClient.setQueryData<CampaignPixel[]>(
				campaignPixelKeys.lists(),
				filterFn,
			);
			if (campaignId) {
				queryClient.setQueryData<CampaignPixel[]>(
					campaignPixelKeys.byCampaign(campaignId),
					filterFn,
				);
			}

			return { previousPixels, previousCampaignPixels, campaignId };
		},

		onSuccess: () => {
			toast.success("Campaign pixel deleted successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousPixels) {
				queryClient.setQueryData(
					campaignPixelKeys.lists(),
					context.previousPixels,
				);
			}
			if (context?.previousCampaignPixels && context?.campaignId) {
				queryClient.setQueryData(
					campaignPixelKeys.byCampaign(context.campaignId),
					context.previousCampaignPixels,
				);
			}
			toast.error(`Failed to delete campaign pixel: ${err.message}`);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: campaignPixelKeys.all });
		},
	});
}
