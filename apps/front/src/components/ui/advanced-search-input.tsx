/**
 * Advanced Search Input Component
 *
 * Provides a search input with multi-stage filter building
 * Similar to the MCP Gateway command filter input
 */

import { Check, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/web/lib/utils";

interface FilterSuggestion {
	type: "field" | "operator" | "value" | "next-step" | "search";
	text: string;
	display: string;
	description: string;
	hint?: string;
}

interface AdvancedSearchInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (value: string) => void;
	onFilterComplete?: (filter: {
		field: string;
		operator: string;
		value: string;
	}) => void;
	placeholder?: string;
	dynamicFieldValues?: Record<string, string[]>;
}

const FILTER_FIELDS = [
	{ name: "tokens", description: "Filter by token count (input + output)" },
	{ name: "city", description: "Filter by city" },
	{ name: "region", description: "Filter by region" },
	{ name: "device", description: "Filter by device" },
	{ name: "browser", description: "Filter by browser" },
	{ name: "operating system", description: "Filter by operating system" },
];

const NUMERIC_OPERATORS = [
	{ op: ">", desc: "greater than" },
	{ op: "<", desc: "less than" },
	{ op: "=", desc: "equals" },
	{ op: ">=", desc: "greater or equal" },
	{ op: "<=", desc: "less or equal" },
];

const STRING_OPERATORS = [
	{ op: "equals", desc: "exact match" },
	{ op: "does not equals", desc: "not equal" },
];

const FIELD_VALUES: Record<string, string[]> = {
	city: ["São Paulo", "Rio de Janeiro", "Curitiba", "Fortaleza", "Recife"],
	region: [],
	device: [],
	browser: [],
	"operating system": [],
};

function parseFilter(
	input: string,
): { field: string; operator: string; value: string } | null {
	const fieldMatch = input.match(
		/^(tokens|city|region|device|browser|operating\s+system)\s+/i,
	);
	if (!fieldMatch) return null;

	const field = fieldMatch[1]?.toLowerCase();
	const afterField = input.slice(fieldMatch[0]?.length ?? 0);

	const operatorPattern =
		/^(>=|<=|>|<|=|==|equals|does not equals|contains)\s+/i;
	const operatorMatch = afterField.match(operatorPattern);
	if (!operatorMatch) return null;

	const operator = operatorMatch[1]?.toLowerCase();
	const value = afterField.slice(operatorMatch[0]?.length ?? 0).trim();

	if (!value) return null;

	return { field: field || "", operator: operator || "", value };
}

function getAutocompleteSuggestions(
	input: string,
	dynamicFieldValues?: Record<string, string[]>,
): FilterSuggestion[] {
	const text = input;

	// Stage 1: Field suggestions
	if (!text || !text.includes(" ")) {
		const lowerText = text.toLowerCase();
		const matchingFields = FILTER_FIELDS.filter((field) =>
			field.name.startsWith(lowerText),
		);

		// Check for exact match
		const exactMatch = matchingFields.find((field) => field.name === lowerText);

		if (exactMatch) {
			return [
				{
					type: "field",
					text: `${exactMatch.name} `,
					display: exactMatch.name,
					description: exactMatch.description,
					hint: "Tab",
				},
				{
					type: "next-step",
					text: `${exactMatch.name} `,
					display: "Add operator...",
					description: "Continue building filter",
					hint: "Space or Tab",
				},
				{
					type: "search",
					text: exactMatch.name,
					display: `Search for "${exactMatch.name}"`,
					description: "Search logs for this text",
					hint: "Enter",
				},
			];
		}

		// Partial matches
		return matchingFields.map((field) => ({
			type: "field" as const,
			text: `${field.name} `,
			display: field.name,
			description: field.description,
			hint: "Tab",
		}));
	}

	// Try to parse field
	const fieldMatch = text.match(
		/^(tokens|city|region|device|browser|operating\s+system)\s*/i,
	);
	if (!fieldMatch) return [];

	const field = fieldMatch[1]?.toLowerCase().trim();
	if (!field) return [];

	const afterField = text.slice(fieldMatch[0]?.length ?? 0);

	// Stage 2: Operator suggestions
	const operatorPattern =
		/^(>=|<=|>|<|=|==|equals|does not equals|contains)\s*/i;
	const operatorMatch = afterField.match(operatorPattern);

	if (!operatorMatch) {
		// Suggest operators
		const isNumericField = field === "duration" || field === "tokens";
		const operators = isNumericField ? NUMERIC_OPERATORS : STRING_OPERATORS;

		const partialOp = afterField.trim().toLowerCase();
		const filtered = partialOp
			? operators.filter(({ op }) => op.toLowerCase().startsWith(partialOp))
			: operators;

		return filtered.map(({ op, desc }) => ({
			type: "operator" as const,
			text: `${field} ${op} `,
			display: op,
			description: desc,
			hint: "Tab",
		}));
	}

	const operator = operatorMatch[1]?.toLowerCase();
	const afterOperator = afterField.slice(operatorMatch[0]?.length ?? 0);

	// Stage 3: Value suggestions
	// Merge dynamic values with static values, with dynamic values first
	const staticValues = FIELD_VALUES[field] || [];
	const dynamicValues = dynamicFieldValues?.[field] || [];
	const uniqueValues = Array.from(new Set([...dynamicValues, ...staticValues]));
	const values = uniqueValues;

	if (!afterOperator) {
		// Show value suggestions
		return values.map((value) => ({
			type: "value" as const,
			text: `${field} ${operator} ${value}`,
			display: value,
			description: `Filter by ${field}`,
			hint: "Tab",
		}));
	}

	// Filter values by partial input
	const partialValue = afterOperator.toLowerCase();
	const filtered = values.filter((v) =>
		v.toLowerCase().startsWith(partialValue),
	);

	return filtered.map((value) => ({
		type: "value" as const,
		text: `${field} ${operator} ${value}`,
		display: value,
		description: `Filter by ${field}`,
		hint: "Tab",
	}));
}

export function AdvancedSearchInput({
	value,
	onChange,
	onSubmit,
	onFilterComplete,
	placeholder = "Search or filter: error, tokens > 150, client is claude-code, city is São Paulo...",
	dynamicFieldValues,
}: AdvancedSearchInputProps) {
	const [showAutocomplete, setShowAutocomplete] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const lastParsedFilterRef = useRef<string | null>(null);

	const isValid = value.trim().length > 0;
	const suggestions = getAutocompleteSuggestions(value, dynamicFieldValues);
	const parsedFilter = parseFilter(value);

	// Detect when a filter is complete and call the callback
	useEffect(() => {
		if (parsedFilter && lastParsedFilterRef.current !== value) {
			lastParsedFilterRef.current = value;
			onFilterComplete?.(parsedFilter);
			// Clear the input after filter is complete
			onChange("");
			setShowAutocomplete(false);
		}
	}, [parsedFilter, value, onFilterComplete, onChange]);

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && isValid) {
			e.preventDefault();
			onSubmit(value);
			setShowAutocomplete(false);
		} else if (e.key === "Escape") {
			e.preventDefault();
			if (showAutocomplete) {
				setShowAutocomplete(false);
			} else {
				onChange("");
			}
		} else if (
			e.key === "ArrowDown" &&
			showAutocomplete &&
			suggestions.length > 0
		) {
			e.preventDefault();
			setSelectedIndex((prev) =>
				prev < suggestions.length - 1 ? prev + 1 : prev,
			);
		} else if (
			e.key === "ArrowUp" &&
			showAutocomplete &&
			suggestions.length > 0
		) {
			e.preventDefault();
			setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
		} else if (e.key === "Tab" && showAutocomplete && suggestions.length > 0) {
			e.preventDefault();
			const suggestion = suggestions[selectedIndex];
			if (suggestion) {
				// If it's a complete filter (value stage), add it directly without showing in input
				if (suggestion.type === "value") {
					onFilterComplete?.(
						parseFilter(suggestion.text) || {
							field: "",
							operator: "",
							value: "",
						},
					);
					onChange("");
					setShowAutocomplete(false);
				} else {
					// For field and operator stages, show in input
					onChange(suggestion.text);
					setShowAutocomplete(true);
					setSelectedIndex(0);
					inputRef.current?.focus();
				}
			}
		}
	};

	// Scroll selected item into view
	useEffect(() => {
		if (!listRef.current || selectedIndex < 0) return;

		const selectedElement = listRef.current.children[selectedIndex];
		if (selectedElement instanceof HTMLElement) {
			selectedElement.scrollIntoView({
				block: "nearest",
				behavior: "smooth",
			});
		}
	}, [selectedIndex]);

	// Close autocomplete when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setShowAutocomplete(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={containerRef} className="relative flex-1">
			{/* Input */}
			<div
				className={cn(
					"flex items-center gap-2 rounded-lg border-2 px-3 py-2",
					"transition-colors",
					showAutocomplete
						? "border-blue-500 dark:border-blue-400"
						: "border-border",
					"focus-within:border-blue-500 dark:focus-within:border-blue-400",
				)}
				style={{
					backgroundColor: "var(--input-bg, #F9F8F6)",
				}}
			>
				<Search className="h-4 w-4 shrink-0 text-muted-foreground" />

				<input
					ref={inputRef}
					type="text"
					value={value}
					onChange={(e) => {
						onChange(e.target.value);
						setShowAutocomplete(true);
						setSelectedIndex(0);
					}}
					onKeyDown={handleKeyDown}
					onFocus={() => setShowAutocomplete(true)}
					placeholder={placeholder}
					className="flex-1 text-foreground text-sm outline-none"
					style={{
						backgroundColor: "transparent",
						color: "inherit",
					}}
					aria-label="Search logs"
					aria-expanded={showAutocomplete && suggestions.length > 0}
				/>
				<style>{`
          input::placeholder {
            color: #999999;
            opacity: 1;
          }
          input::-webkit-input-placeholder {
            color: #999999;
            opacity: 1;
          }
          input::-moz-placeholder {
            color: #999999;
            opacity: 1;
          }
          input:-ms-input-placeholder {
            color: #999999;
            opacity: 1;
          }
          :root {
            --input-bg: #F9F8F6;
            --dropdown-bg: #F9F8F6;
            --footer-bg: #F5F5F6;
            --highlight-bg: #E9EFFF;
          }
          :root.dark {
            --input-bg: #242424;
            --dropdown-bg: #242424;
            --footer-bg: #1a1a1a;
            --highlight-bg: #2a2a4a;
          }
        `}</style>

				{/* Validation status */}
				{isValid && (
					<>
						<span className="shrink-0 whitespace-nowrap text-muted-foreground text-xs">
							Press Enter
						</span>
						<Check className="h-4 w-4 shrink-0 text-green-600" />
					</>
				)}
			</div>

			{/* Autocomplete Dropdown */}
			{showAutocomplete && suggestions.length > 0 && (
				<div
					className={cn(
						"absolute z-50 mt-1 w-full",
						"rounded-md border border-border shadow-lg",
						"max-h-[400px] overflow-y-auto",
						"fade-in-0 zoom-in-95 animate-in duration-150",
					)}
					style={{
						backgroundColor: "var(--dropdown-bg, #F9F8F6)",
					}}
				>
					{/* Suggestions */}
					<div ref={listRef} role="listbox">
						{suggestions.map((suggestion, index) => (
							<button
								key={`${suggestion.text}-${index}`}
								type="button"
								className={cn(
									"w-full px-2 py-1 text-left",
									"flex items-center gap-2",
									"cursor-pointer transition-colors",
									"focus:outline-none",
									index === selectedIndex
										? "border-l-2 text-foreground"
										: "border-transparent border-l-2",
								)}
								style={
									index === selectedIndex
										? {
												backgroundColor: "var(--highlight-bg, #E9EFFF)",
												borderLeftColor: "#5320AA",
											}
										: {}
								}
								onClick={() => {
									// If it's a complete filter (value stage), add it directly without showing in input
									if (suggestion.type === "value") {
										onFilterComplete?.(
											parseFilter(suggestion.text) || {
												field: "",
												operator: "",
												value: "",
											},
										);
										onChange("");
										setShowAutocomplete(false);
									} else {
										// For field and operator stages, show in input
										onChange(suggestion.text);
										setShowAutocomplete(true);
										setSelectedIndex(0);
										inputRef.current?.focus();
									}
								}}
								onMouseEnter={() => setSelectedIndex(index)}
								role="option"
								aria-selected={index === selectedIndex}
							>
								<div className="min-w-0 flex-1">
									<div className="truncate font-medium text-xs leading-tight">
										{suggestion.display}
									</div>
									<div className="truncate text-muted-foreground text-xs">
										{suggestion.description}
									</div>
								</div>
								{index === selectedIndex && suggestion.hint && (
									<kbd className="ml-auto shrink-0 rounded border border-border bg-background px-1 py-0.5 text-xs">
										{suggestion.hint}
									</kbd>
								)}
							</button>
						))}
					</div>

					{/* Footer with keyboard hints */}
					<div
						className="sticky bottom-0 border-border border-t px-3 py-2 text-muted-foreground text-xs"
						style={{ backgroundColor: "var(--footer-bg, #F5F5F6)" }}
					>
						<kbd className="rounded border border-border bg-background px-1.5 py-0.5">
							Tab
						</kbd>{" "}
						to select •{" "}
						<kbd className="rounded border border-border bg-background px-1.5 py-0.5">
							Enter
						</kbd>{" "}
						to search •{" "}
						<kbd className="rounded border border-border bg-background px-1.5 py-0.5">
							Esc
						</kbd>{" "}
						to close
					</div>
				</div>
			)}
		</div>
	);
}
