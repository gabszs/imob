import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type SortDirection = "asc" | "desc";

interface SortHeaderProps {
	field: string;
	label: string;
	isActive: boolean;
	sortDirection?: SortDirection;
	onClick: () => void;
}

export const SortHeader = ({
	label,
	isActive,
	sortDirection = "asc",
	onClick,
}: SortHeaderProps) => {
	let Icon;

	if (!isActive) {
		Icon = ArrowUpDown;
	} else if (sortDirection === "asc") {
		Icon = ArrowUp;
	} else {
		Icon = ArrowDown;
	}

	return (
		<button
			type="button"
			onClick={onClick}
			className="group flex w-full cursor-pointer items-center gap-1 text-left transition-colors hover:bg-muted hover:text-foreground"
		>
			{label}
			<Icon
				className={`h-4 w-4 ${isActive ? "text-foreground" : "text-muted-foreground"} group-hover:text-foreground`}
			/>
		</button>
	);
};
