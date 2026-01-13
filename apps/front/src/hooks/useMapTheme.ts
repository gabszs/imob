import { useEffect, useState } from "react";
import type { MapTheme } from "@/web/components/ui/map/theme-selector";
import { useTheme } from "@/web/lib/theme-provider";

/**
 * Hook para gerenciar o tema do mapa com sincronização automática
 * baseada no tema do site (dark -> dark, light -> bright)
 */
export function useMapTheme() {
	const { theme: siteTheme } = useTheme();

	// Determinar o tema efetivo do site (resolvendo "system")
	const getEffectiveSiteTheme = (): "dark" | "light" => {
		if (siteTheme === "system") {
			return window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		}
		return siteTheme;
	};

	// Mapear tema do site para tema do mapa
	const getMapThemeFromSiteTheme = (
		effectiveTheme: "dark" | "light",
	): MapTheme => {
		return effectiveTheme === "dark" ? "dark" : "bright";
	};

	const effectiveSiteTheme = getEffectiveSiteTheme();
	const [mapTheme, setMapThemeState] = useState<MapTheme>(
		getMapThemeFromSiteTheme(effectiveSiteTheme),
	);

	// Sincronizar tema do mapa quando o tema do site mudar
	useEffect(() => {
		const newMapTheme = getMapThemeFromSiteTheme(effectiveSiteTheme);
		setMapThemeState(newMapTheme);
	}, [effectiveSiteTheme]);

	return {
		mapTheme,
		setMapTheme: setMapThemeState,
	};
}
