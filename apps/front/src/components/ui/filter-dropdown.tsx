import { Search } from "lucide-react";
import type { ReactNode } from "react";
import * as DropdownMenu from "@/web/components/ui/dropdown-menu";

interface FilterDropdownProps {
	icon: ReactNode;
	label: string;
	options: string[];
	selectedValues: string[];
	searchValue: string;
	matchType: "exact" | "contains";
	onSearchChange: (value: string) => void;
	onMatchTypeChange: (type: "exact" | "contains") => void;
	onOptionChange: (option: string, checked: boolean) => void;
}

export const FilterDropdown = ({
	icon,
	label,
	options,
	selectedValues,
	searchValue,
	matchType,
	onSearchChange,
	onMatchTypeChange,
	onOptionChange,
}: FilterDropdownProps) => {
	const filteredOptions = options.filter((option) =>
		option.toLowerCase().includes(searchValue.toLowerCase()),
	);

	return (
		<DropdownMenu.DropdownMenuSub>
			<DropdownMenu.DropdownMenuSubTrigger className="font-normal hover:bg-gray-400">
				{icon}
				<span className="ml-2">{label}</span>
			</DropdownMenu.DropdownMenuSubTrigger>
			<DropdownMenu.DropdownMenuPortal>
				<DropdownMenu.DropdownMenuSubContent className="w-64 p-0">
					{/* Search header */}
					<div className="flex items-center gap-3 px-2 py-3">
						<Search className="h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							value={searchValue}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder={`Search ${label.toLowerCase()}...`}
							className="flex-1 border-0 bg-transparent p-0 font-medium text-foreground text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0"
							style={{ backgroundColor: "transparent" }}
						/>
					</div>
					{/* Separator */}
					<div className="border-border border-b" />

					{/* Match type */}
					<div className="p-3">
						<div className="mb-1.5 font-medium text-foreground text-xs">
							Match type
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => onMatchTypeChange("exact")}
								className={`flex-1 rounded-md border px-3 py-1.5 font-medium text-xs transition-colors ${
									matchType === "exact"
										? "border-gray-300 bg-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
										: "border-border bg-background text-foreground hover:border-gray-300 hover:bg-accent hover:shadow-sm dark:hover:border-gray-600"
								}`}
							>
								Equals
							</button>
							<button
								type="button"
								onClick={() => onMatchTypeChange("contains")}
								className={`flex-1 rounded-md border px-3 py-1.5 font-medium text-xs transition-colors ${
									matchType === "contains"
										? "border-gray-300 bg-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
										: "border-border bg-background text-foreground hover:border-gray-300 hover:bg-accent hover:shadow-sm dark:hover:border-gray-600"
								}`}
							>
								Does not equals
							</button>
						</div>
					</div>

					{/* Separator */}
					<div className="border-border border-b" />

					{/* Options with checkboxes */}
					<div className="space-y-1 p-3">
						{filteredOptions.length === 0 ? (
							<div className="py-2 text-muted-foreground text-xs">
								No options found
							</div>
						) : (
							filteredOptions.map((option) => (
								<label
									key={option}
									className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-400"
								>
									<input
										type="checkbox"
										checked={selectedValues.includes(option)}
										onChange={(e) => onOptionChange(option, e.target.checked)}
										className="h-4 w-4 rounded-md border border-gray-300"
									/>
									<span className="text-sm">{option}</span>
								</label>
							))
						)}
					</div>
				</DropdownMenu.DropdownMenuSubContent>
			</DropdownMenu.DropdownMenuPortal>
		</DropdownMenu.DropdownMenuSub>
	);
};
