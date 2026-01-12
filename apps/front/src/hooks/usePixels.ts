import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthHeaders } from "@/web/lib/auth-helpers";
import { honoClient } from "@/web/lib/hono-client";

export type PlatformType =
	| "kwai"
	| "tiktok"
	| "reddit"
	| "facebook"
	| "pinterest";

export type PixelActivationStatus =
	| "queued"
	| "running"
	| "paused"
	| "errored"
	| "terminated"
	| "complete"
	| "waiting"
	| "waitingForPause"
	| "unknown";

export interface PixelActivationError {
	name: string;
	message: string;
}

export interface PixelActivation {
	id: string;
	status: PixelActivationStatus;
	error?: PixelActivationError;
	output?: unknown;
}

export interface Pixel {
	id: string;
	name: string;
	userId: string;
	platform: string;
	apiKey: string;
	pixelId: string;
	testId: string | null;
	isActive: boolean;
	activationWorkflowStatus: PixelActivationStatus | null;
	createdAt: Date;
	updatedAt: Date;
	optimistic?: boolean; // Para UI feedback
}

export interface PixelCreate {
	name: string;
	platform: string;
	apiKey: string;
	pixelId: string;
	testId?: string | null;
	isActive: boolean;
}

export interface PixelUpdate {
	name?: string;
	platform?: string;
	apiKey?: string;
	pixelId?: string;
	testId?: string | null;
	isActive?: boolean;
}

// Query keys factory
export const pixelKeys = {
	all: ["pixels"] as const,
	lists: () => [...pixelKeys.all, "list"] as const,
	detail: (id: string) => [...pixelKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch all pixels
 */
export function usePixelsList() {
	return useQuery({
		queryKey: pixelKeys.lists(),
		queryFn: async () => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.pixels.$get({}, { headers });

			if (!res.ok) {
				throw new Error("Failed to fetch pixels");
			}

			const data = await res.json();
			return data.data as Pixel[];
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Hook to create a new pixel with optimistic updates
 */
export function useCreatePixel() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (pixelData: PixelCreate) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.pixels.$post(
				{ json: pixelData },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error((error as any).message || "Failed to create pixel");
			}

			const data = await res.json();
			return data.data as Pixel;
		},

		// Optimistic update
		onMutate: async (newPixel) => {
			await queryClient.cancelQueries({ queryKey: pixelKeys.all });

			const previousPixels = queryClient.getQueryData<Pixel[]>(
				pixelKeys.lists(),
			);

			queryClient.setQueryData<Pixel[]>(pixelKeys.lists(), (old) => [
				...(old ?? []),
				{
					id: `temp-${Date.now()}`,
					userId: "",
					createdAt: new Date(),
					updatedAt: new Date(),
					...newPixel,
					testId: newPixel.testId || null,
					optimistic: true,
				} as Pixel,
			]);

			return { previousPixels };
		},

		onSuccess: () => {
			toast.success("Pixel created successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousPixels) {
				queryClient.setQueryData(pixelKeys.lists(), context.previousPixels);
			}
			toast.error(`Failed to create pixel: ${err.message}`);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: pixelKeys.all });
		},
	});
}

/**
 * Hook to update a pixel with optimistic updates
 */
export function useUpdatePixel() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: PixelUpdate }) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.pixels[":id"].$put(
				{ param: { id }, json: data },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error((error as any).message || "Failed to update pixel");
			}

			return res.json() as Promise<Pixel>;
		},

		// Optimistic update
		onMutate: async (updated) => {
			await queryClient.cancelQueries({ queryKey: pixelKeys.all });

			const previousPixels = queryClient.getQueryData<Pixel[]>(
				pixelKeys.lists(),
			);

			queryClient.setQueryData<Pixel[]>(pixelKeys.lists(), (old) =>
				old?.map((pixel) =>
					pixel.id === updated.id ? { ...pixel, ...updated.data } : pixel,
				),
			);

			return { previousPixels };
		},

		onSuccess: () => {
			toast.success("Pixel updated successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousPixels) {
				queryClient.setQueryData(pixelKeys.lists(), context.previousPixels);
			}
			toast.error(`Failed to update pixel: ${err.message}`);
		},

		onSettled: (_, __, variables) => {
			queryClient.invalidateQueries({ queryKey: pixelKeys.all });
			queryClient.invalidateQueries({
				queryKey: pixelKeys.detail(variables.id),
			});
		},
	});
}

/**
 * Hook to delete a pixel with optimistic updates
 */
export function useDeletePixel() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.pixels[":id"].$delete(
				{ param: { id } },
				{ headers },
			);

			if (!res.ok) {
				throw new Error("Failed to delete pixel");
			}
		},

		// Optimistic update
		onMutate: async (deletedId) => {
			await queryClient.cancelQueries({ queryKey: pixelKeys.all });

			const previousPixels = queryClient.getQueryData<Pixel[]>(
				pixelKeys.lists(),
			);

			queryClient.setQueryData<Pixel[]>(pixelKeys.lists(), (old) =>
				old?.filter((pixel) => pixel.id !== deletedId),
			);

			return { previousPixels };
		},

		onSuccess: () => {
			toast.success("Pixel deleted successfully");
		},

		onError: (err, _variables, context) => {
			if (context?.previousPixels) {
				queryClient.setQueryData(pixelKeys.lists(), context.previousPixels);
			}
			toast.error(`Failed to delete pixel: ${err.message}`);
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: pixelKeys.all });
		},
	});
}

/**
 * Hook to activate a pixel and get its status
 */
export function useActivatePixel() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (pixelId: string) => {
			const headers = await getAuthHeaders();
			const res = await honoClient.v1.pixels[":id"].activate.$get(
				{ param: { id: pixelId } },
				{ headers },
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error((error as any).message || "Failed to activate pixel");
			}

			const data = await res.json();
			return { pixelId, activation: data as PixelActivation };
		},

		onSuccess: (data) => {
			// Atualizar o cache com o novo status
			queryClient.setQueryData<Pixel[]>(pixelKeys.lists(), (old) =>
				old?.map((pixel) =>
					pixel.id === data.pixelId
						? { ...pixel, activationWorkflowStatus: data.activation.status }
						: pixel,
				),
			);
			toast.success("Pixel activation started");
		},

		onError: (err) => {
			toast.error(`Failed to activate pixel: ${err.message}`);
		},
	});
}
