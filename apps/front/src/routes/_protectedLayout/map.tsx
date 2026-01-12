import CampaignSelector from "@/web/components/ui/map/campaign-selector";
import GeocoderControl from "@/web/components/ui/map/geocoder-control";
import SearchHistory from "@/web/components/ui/map/search-history";
import ThemeSelector, {
	type MapTheme,
} from "@/web/components/ui/map/theme-selector";
import TimeRangeSelector from "@/web/components/ui/map/timerange-selector";
import YouAreHere from "@/web/components/ui/map/you-are-here";
import { type TimeRange, useMapLocations } from "@/web/hooks/useAnalytics";
import { useCampaignsList } from "@/web/hooks/useCampaigns";
import { useDebouncedViewport } from "@/web/hooks/useDebouncedViewport";
import { useMapAnalytics } from "@/web/hooks/useMapAnalytics";
import { useMapTheme } from "@/web/hooks/useMapTheme";
import { useVisibleStates } from "@/web/hooks/useVisibleStates";
import { matchFeatureToCount } from "@/web/lib/map/analytics-aggregator";
import { brStatesLayer, highlightBRStateLayer } from "@/web/lib/map/br-states";
import {
	citiesLayer,
	highlightCityLayer,
	highlightUSACityLayer,
	usaCitiesLayer,
} from "@/web/lib/map/map-styles";
import { highlightUSStateLayer, usStatesLayer } from "@/web/lib/map/us-states";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";
import { createFileRoute } from "@tanstack/react-router";
import {
	Layer,
	Map,
	type MapRef,
	Marker,
	Popup,
	Source,
} from "@vis.gl/react-maplibre";
import type { ExpressionSpecification, MapLayerMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/_protectedLayout/map")({
	component: MapPage,
});

function MapPage() {
	const [hoverInfoBR, setHoverInfoBR] = useState<{
		longitude: number;
		latitude: number;
		cityName: string;
		pureName?: string; // Nome sem estado, para usar no filtro
		count?: number; // Analytics count
	} | null>(null);

	const [hoverInfoUS, setHoverInfoUS] = useState<{
		longitude: number;
		latitude: number;
		cityName: string;
		count?: number; // Analytics count
	} | null>(null);

	const [zoom, setZoom] = useState(2.5);
	const { mapTheme, setMapTheme } = useMapTheme();
	const [searchHistory, setSearchHistory] = useState<string[]>([]);

	// Analytics state
	const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
	const [analyticsTimeRange, setAnalyticsTimeRange] =
		useState<TimeRange>("week");
	const mapRef = useRef<MapRef>(null);

	// Fetch campaigns using TanStack Query hook
	const { data: campaigns = [] } = useCampaignsList();

	// Auto-select first campaign on load
	useEffect(() => {
		if (campaigns.length > 0 && !selectedCampaignId) {
			// Try to restore last selected campaign from localStorage
			const lastSelectedCampaignId = localStorage.getItem(
				"lastSelectedCampaignId",
			);

			// If we have a last selected campaign and it still exists, use it
			if (
				lastSelectedCampaignId &&
				campaigns.some((c) => c.id === lastSelectedCampaignId)
			) {
				console.log(
					"[MapPage] Restored campaign from localStorage:",
					lastSelectedCampaignId,
				);
				setSelectedCampaignId(lastSelectedCampaignId);
			} else {
				// Otherwise, default to the first campaign
				console.log("[MapPage] Auto-selected first campaign:", campaigns[0].id);
				setSelectedCampaignId(campaigns[0].id);
			}
		}
	}, [campaigns, selectedCampaignId]);

	// Save selected campaign to localStorage whenever it changes
	useEffect(() => {
		if (selectedCampaignId) {
			localStorage.setItem("lastSelectedCampaignId", selectedCampaignId);
		}
	}, [selectedCampaignId]);

	// Fetch map pins using TanStack Query hook
	const { data: mapPinsData } = useMapLocations(
		selectedCampaignId || "",
		analyticsTimeRange,
	);
	const mapPins = mapPinsData?.data || [];

	// Debounced viewport and visible states
	const debouncedViewport = useDebouncedViewport({ zoom, bounds: null });
	const visibleStates = useVisibleStates(mapRef, zoom, debouncedViewport);

	// Fetch and aggregate analytics data
	const { aggregatedData, isLoading } = useMapAnalytics({
		campaignId: selectedCampaignId || null,
		timeRange: analyticsTimeRange,
		zoom,
		visibleStates,
	});

	const selectedCity = (hoverInfoBR && hoverInfoBR.cityName) || "";
	const selectedCityPure =
		(hoverInfoBR && hoverInfoBR.pureName) || selectedCity;

	// Filtro para cidades do Brasil (usa 'name')
	const filterBRCities: ExpressionSpecification = useMemo(
		() => ["in", selectedCityPure || "N/A", ["get", "name"]],
		[selectedCityPure],
	);

	// Filtro para estados do Brasil (usa 'Estado')
	const filterBRStates: ExpressionSpecification = useMemo(
		() => ["in", selectedCity || "N/A", ["get", "Estado"]],
		[selectedCity],
	);

	const selectedUSACity = (hoverInfoUS && hoverInfoUS.cityName) || "";

	// Filtro para condados dos EUA (usa 'name')
	const filterUSCounties: ExpressionSpecification = useMemo(
		() => ["in", selectedUSACity || "N/A", ["get", "name"]],
		[selectedUSACity],
	);

	// Filtro para estados dos EUA (usa 'name')
	const filterUSStates: ExpressionSpecification = useMemo(
		() => ["in", selectedUSACity || "N/A", ["get", "name"]],
		[selectedUSACity],
	);

	// Mostrar cidades apenas se zoom > 6
	const showCities = zoom > 6;

	const onHover = useCallback(
		(event: MapLayerMouseEvent) => {
			const feature = event.features && event.features[0];
			if (!feature) return;

			// Verifica qual camada foi clicada
			const layerId = feature.layer?.id;

			console.log(
				"[MapPage] onHover - layerId:",
				layerId,
				"aggregatedData:",
				aggregatedData,
			);

			// Verifica se é estado do Brasil (zoom baixo)
			if (layerId === "br-states") {
				const stateName =
					feature.properties.Estado || feature.properties.SIGLA || "";

				console.log(
					"[MapPage] BR State hover - stateName:",
					stateName,
					"has aggregatedData:",
					!!aggregatedData,
				);

				// Lookup count from analytics data
				const count = aggregatedData
					? matchFeatureToCount(feature, aggregatedData.stateCountsMap)
					: undefined;

				console.log("[MapPage] BR State count:", count);

				setHoverInfoBR({
					longitude: event.lngLat.lng,
					latitude: event.lngLat.lat,
					cityName: stateName,
					count,
				});
				setHoverInfoUS(null);
			}
			// Verifica se é cidade do Brasil (zoom alto)
			else if (layerId === "cities") {
				// Mapeia código IBGE para sigla do estado (primeiros 2 dígitos)
				const stateMap: Record<string, string> = {
					"11": "RO",
					"12": "AC",
					"13": "AM",
					"14": "RR",
					"15": "PA",
					"16": "AP",
					"17": "TO",
					"21": "MA",
					"22": "PI",
					"23": "CE",
					"24": "RN",
					"25": "PB",
					"26": "PE",
					"27": "AL",
					"28": "SE",
					"29": "BA",
					"31": "MG",
					"32": "ES",
					"33": "RJ",
					"35": "SP",
					"41": "PR",
					"42": "SC",
					"43": "RS",
					"50": "MS",
					"51": "MT",
					"52": "GO",
					"53": "DF",
				};
				const stateCode = feature.properties.id?.substring(0, 2);
				const stateName = stateMap[stateCode] || "";
				const pureCityName = feature.properties.name;
				const cityName = pureCityName + (stateName ? `, ${stateName}` : "");

				// Lookup count from analytics data (city level)
				const count = aggregatedData
					? matchFeatureToCount(feature, aggregatedData.cityCountsMap)
					: undefined;

				setHoverInfoBR({
					longitude: event.lngLat.lng,
					latitude: event.lngLat.lat,
					cityName: cityName,
					pureName: pureCityName,
					count,
				});
				setHoverInfoUS(null);
			}
			// Verifica se é estado dos EUA (zoom baixo)
			else if (layerId === "us-states") {
				const stateName = feature.properties.name || "";

				// Lookup count from analytics data
				const count = aggregatedData
					? matchFeatureToCount(feature, aggregatedData.stateCountsMap)
					: undefined;

				setHoverInfoUS({
					longitude: event.lngLat.lng,
					latitude: event.lngLat.lat,
					cityName: stateName,
					count,
				});
				setHoverInfoBR(null);
			}
			// Verifica se é condado dos EUA (zoom alto)
			else if (layerId === "usa-cities") {
				// Lookup count from analytics data (city level)
				const count = aggregatedData
					? matchFeatureToCount(feature, aggregatedData.cityCountsMap)
					: undefined;

				setHoverInfoUS({
					longitude: event.lngLat.lng,
					latitude: event.lngLat.lat,
					cityName: feature.properties.name,
					count,
				});
				setHoverInfoBR(null);
			}
		},
		[aggregatedData],
	);

	const onMove = useCallback((evt: { viewState: { zoom: number } }) => {
		setZoom(evt.viewState.zoom);
	}, []);

	const getThemeUrl = (theme: MapTheme) =>
		`https://tiles.openfreemap.org/styles/${theme}`;

	// Carregar histórico do localStorage
	useEffect(() => {
		const saved = localStorage.getItem("searchHistory");
		if (saved) {
			setSearchHistory(JSON.parse(saved));
		}
	}, []);

	// Adicionar ao histórico quando houver resultado de busca
	const handleGeocoderResult = useCallback(
		(evt: { result?: { place_name?: string } }) => {
			const result = evt.result;
			if (result?.place_name) {
				const placeName = result.place_name;
				setSearchHistory((prev) => {
					const newHistory = [
						placeName,
						...prev.filter((item) => item !== placeName),
					].slice(0, 5);
					localStorage.setItem("searchHistory", JSON.stringify(newHistory));
					return newHistory;
				});
			}
		},
		[],
	);

	// Selecionar do histórico
	const handleHistorySelect = useCallback((location: string) => {
		// Trigger search programmatically
		const geocoderInput = document.querySelector(
			".maplibregl-ctrl-geocoder input",
		) as HTMLInputElement;
		if (geocoderInput) {
			geocoderInput.value = location;
			geocoderInput.dispatchEvent(new Event("input", { bubbles: true }));
			// Trigger enter key
			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
			});
			geocoderInput.dispatchEvent(enterEvent);
		}
	}, []);

	return (
		<div className="relative h-screen w-full">
			<Map
				ref={mapRef}
				initialViewState={{
					longitude: -60,
					latitude: 10,
					zoom: 2.5,
				}}
				mapStyle={getThemeUrl(mapTheme)}
				onMouseMove={onHover}
				onMove={onMove}
				interactiveLayerIds={
					showCities ? ["cities", "usa-cities"] : ["br-states", "us-states"]
				}
			>
				<GeocoderControl
					position="top-left"
					minLength={2}
					placeholder="Buscar localização..."
					showResultsWhileTyping={true}
					onResult={handleGeocoderResult}
				/>
				<SearchHistory
					history={searchHistory}
					onSelect={handleHistorySelect}
					position="top-left"
				/>
				<TimeRangeSelector
					timeRange={analyticsTimeRange}
					onTimeRangeChange={setAnalyticsTimeRange}
					position="top-right"
				/>
				<CampaignSelector
					campaigns={campaigns}
					selectedCampaignId={selectedCampaignId}
					onCampaignChange={setSelectedCampaignId}
					position="top-right"
				/>
				<ThemeSelector
					theme={mapTheme}
					onThemeChange={setMapTheme}
					position="top-right"
				/>
				<YouAreHere />

				{/* Estados do Brasil (zoom baixo) */}
				{!showCities && (
					<Source
						id="br-states"
						type="geojson"
						data="https://raw.githubusercontent.com/giuliano-macedo/geodata-br-states/main/geojson/br_states.json"
					>
						<Layer {...brStatesLayer} />
						<Layer {...highlightBRStateLayer} filter={filterBRStates} />
					</Source>
				)}

				{/* Cidades do Brasil (zoom alto) */}
				{showCities && (
					<Source
						id="cities"
						type="geojson"
						data="https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-100-mun.json"
						generateId={true}
					>
						<Layer {...citiesLayer} minzoom={6} maxzoom={24} />
						<Layer
							{...highlightCityLayer}
							filter={filterBRCities}
							minzoom={6}
							maxzoom={24}
						/>
					</Source>
				)}

				{/* Estados dos EUA (zoom baixo) */}
				{!showCities && (
					<Source
						id="us-states"
						type="geojson"
						data="https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
					>
						<Layer {...usStatesLayer} />
						<Layer {...highlightUSStateLayer} filter={filterUSStates} />
					</Source>
				)}

				{/* Condados dos EUA (zoom alto) */}
				{showCities && (
					<Source
						id="usa-cities"
						type="geojson"
						data="https://raw.githubusercontent.com/visgl/deck.gl-data/refs/heads/master/examples/arc/counties.json"
						generateId={true}
					>
						<Layer {...usaCitiesLayer} minzoom={6} maxzoom={24} />
						<Layer
							{...highlightUSACityLayer}
							filter={filterUSCounties}
							minzoom={6}
							maxzoom={24}
						/>
					</Source>
				)}

				{selectedCity && (
					<Popup
						longitude={hoverInfoBR!.longitude}
						latitude={hoverInfoBR!.latitude}
						offset={[0, -10] as [number, number]}
						closeButton={false}
						className="city-info"
					>
						<div className="space-y-1">
							<div className="font-semibold">{selectedCity}</div>
							{hoverInfoBR?.count !== undefined && (
								<div className="text-muted-foreground text-sm">
									Visitas: {hoverInfoBR.count.toLocaleString()}
								</div>
							)}
							{isLoading && (
								<div className="text-muted-foreground text-xs">
									Carregando...
								</div>
							)}
						</div>
					</Popup>
				)}

				{selectedUSACity && (
					<Popup
						longitude={hoverInfoUS!.longitude}
						latitude={hoverInfoUS!.latitude}
						offset={[0, -10] as [number, number]}
						closeButton={false}
						className="usa-city-info"
					>
						<div className="space-y-1">
							<div className="font-semibold">{selectedUSACity}</div>
							{hoverInfoUS?.count !== undefined && (
								<div className="text-muted-foreground text-sm">
									Visitas: {hoverInfoUS.count.toLocaleString()}
								</div>
							)}
							{isLoading && (
								<div className="text-muted-foreground text-xs">
									Carregando...
								</div>
							)}
						</div>
					</Popup>
				)}

				{/* Map pins - Fixed markers with visit counts */}
				{mapPins.map((pin, index) => (
					<Marker
						key={`${pin.city}-${pin.latitude}-${pin.longitude}-${index}`}
						longitude={pin.longitude}
						latitude={pin.latitude}
					>
						<div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-600 font-bold text-white text-xs shadow-lg transition-colors hover:bg-blue-700">
							{pin.count}
						</div>
					</Marker>
				))}
			</Map>
		</div>
	);
}
