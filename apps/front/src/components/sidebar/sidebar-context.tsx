import { createContext, type ReactNode, useContext, useState } from "react";

interface SidebarContext{ type
	isExpanded: boolean;
	setIsExpanded: (expanded: boolean) => void;
	toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
	const [isExpanded, setIsExpanded] = useState(true);

	const toggle = () => setIsExpanded((prev) => !prev);

	return (
		<SidebarContext.Provider value={{ isExpanded, setIsExpanded, toggle }}>
			{children}
		</SidebarContext.Provider>
	);
}

export function useSidebar() {
	const context = useContext(SidebarContext);
	if (context === undefined) {
		throw new Error("useSidebar must be used within a SidebarProvider");
	}
	return context;
}
