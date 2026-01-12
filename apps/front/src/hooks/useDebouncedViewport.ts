import { useEffect, useState } from "react";

export interface ViewportState {
	zoom: number;
	bounds?: {
		north: number;
		south: number;
		east: number;
		west: number;
	} | null;
}

/**
 * Debounce viewport changes to prevent excessive API calls
 * @param viewport - Current viewport state (zoom and bounds)
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 * @returns Debounced viewport state
 */
export function useDebouncedViewport(
	viewport: ViewportState,
	delay = 500,
): ViewportState {
	const [debouncedViewport, setDebouncedViewport] =
		useState<ViewportState>(viewport);

	useEffect(() => {
		// Only update if there's a significant change
		const hasSignificantZoomChange =
			Math.abs(viewport.zoom - debouncedViewport.zoom) >= 0.5;

		const hasSignificantBoundsChange = (): boolean => {
			if (!viewport.bounds || !debouncedViewport.bounds) {
				return viewport.bounds !== debouncedViewport.bounds;
			}

			const latDiff = Math.abs(
				viewport.bounds.north - debouncedViewport.bounds.north,
			);
			const lngDiff = Math.abs(
				viewport.bounds.east - debouncedViewport.bounds.east,
			);

			// Consider it significant if moved more than 10% of viewport size
			const latThreshold =
				Math.abs(viewport.bounds.north - viewport.bounds.south) * 0.1;
			const lngThreshold =
				Math.abs(viewport.bounds.east - viewport.bounds.west) * 0.1;

			return latDiff > latThreshold || lngDiff > lngThreshold;
		};

		if (hasSignificantZoomChange || hasSignificantBoundsChange()) {
			const handler = setTimeout(() => {
				setDebouncedViewport(viewport);
			}, delay);

			return () => {
				clearTimeout(handler);
			};
		}
	}, [viewport, delay, debouncedViewport]);

	return debouncedViewport;
}
