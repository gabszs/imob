import type { MapRef } from "@vis.gl/react-maplibre";
import { type RefObject, useEffect, useState } from "react";
import type { ViewportState } from "./useDebouncedViewport";

export interface VisibleStates {
	brStates: string[];
	usStates: string[];
}

/**
 * Extract visible state names from map viewport using MapLibre's queryRenderedFeatures
 * @param mapRef - Reference to the MapLibre map instance
 * @param zoom - Current zoom level
 * @param debouncedViewport - Debounced viewport state
 * @returns Object with arrays of visible BR and US state names
 */
export function useVisibleStates(
	mapRef: RefObject<MapRef>,
	zoom: number,
	debouncedViewport: ViewportState,
): VisibleStates {
	const [visibleStates, setVisibleStates] = useState<VisibleStates>({
		brStates: [],
		usStates: [],
	});

	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;

		// Only query visible states at low zoom (when state layers are visible)
		const showStates = zoom <= 6;
		if (!showStates) {
			setVisibleStates({ brStates: [], usStates: [] });
			return;
		}

		try {
			const brStates: string[] = [];
			const usStates: string[] = [];

			// Query BR state features
			const brFeatures = map.queryRenderedFeatures(undefined, {
				layers: ["br-states"],
			});

			for (const feature of brFeatures) {
				const stateName =
					feature.properties?.Estado || feature.properties?.SIGLA;
				if (stateName && !brStates.includes(stateName)) {
					brStates.push(stateName);
				}
			}

			// Query US state features
			const usFeatures = map.queryRenderedFeatures(undefined, {
				layers: ["us-states"],
			});

			for (const feature of usFeatures) {
				const stateName = feature.properties?.name;
				if (stateName && !usStates.includes(stateName)) {
					usStates.push(stateName);
				}
			}

			setVisibleStates({ brStates, usStates });
		} catch (error) {
			console.error("Error querying visible states:", error);
			setVisibleStates({ brStates: [], usStates: [] });
		}
	}, [mapRef, zoom, debouncedViewport]);

	return visibleStates;
}
