import { ChevronDown } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export interface DropdownOption<T = string> {
	value: T;
	label: string;
	icon?: React.ReactNode;
	component: React.FC<{}>;
}

interface DropdownProps<T = string> {
	options: DropdownOption<T>[];
	value: T;
	onChange: (value: T) => void;
	className?: string;
	buttonClassName?: string;
	menuClassName?: string;
}

export function Dropdown<T extends string = string>({
	options,
	value,
	onChange,
	className = "",
	buttonClassName = "",
	menuClassName = "",
}: DropdownProps<T>) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selectedOption = options.find((opt) => opt.value === value);

	const handleSelect = (optionValue: T) => {
		onChange(optionValue);
		setIsOpen(false);
	};

	return (
		<div className={`relative ${className}`} ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`button-dropdown flex items-center gap-2 rounded-lg border border-[#121925] bg-[#272E36] px-4 py-2 transition-colors hover:bg-dark-hover ${buttonClassName}`}
			>
				{selectedOption?.icon}
				<span className="font-medium text-sm">{selectedOption?.label}</span>
				<ChevronDown className="ml-[126px]" />
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div
					className={`absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-lg border border-[#121925] bg-[#272E36] shadow-lg ${menuClassName}`}
				>
					{options.map((option) => (
						<button
							key={option.value}
							onClick={() => handleSelect(option.value)}
							className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-dark-hover ${
								value === option.value ? "bg-dark-hover" : ""
							}`}
						>
							{option.icon}
							<span>{option.label}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default Dropdown;
