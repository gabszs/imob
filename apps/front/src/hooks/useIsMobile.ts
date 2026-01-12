// src/hooks/useIsMobile.ts
import { useEffect, useState } from "react";

/**
 * Hook para detectar se o dispositivo é mobile
 * @param breakpoint - Largura em pixels para considerar mobile (padrão: 1024px)
 * @returns boolean - true se for mobile, false se for desktop
 */
export function useIsMobile(breakpoint = 1024): boolean {
	const [isMobile, setIsMobile] = useState<boolean>(false);

	useEffect(() => {
		// Função para verificar o tamanho da tela
		const checkMobile = () => {
			setIsMobile(window.innerWidth < breakpoint);
		};

		// Verifica no mount
		checkMobile();

		// Adiciona listener para resize
		window.addEventListener("resize", checkMobile);

		// Cleanup
		return () => window.removeEventListener("resize", checkMobile);
	}, [breakpoint]);

	return isMobile;
}
