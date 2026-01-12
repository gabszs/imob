import { useUpdate } from "@reactuses/core";
import { mapValues } from "es-toolkit";
import * as _ from "lodash";
import { isEqual } from "lodash";
import * as fp from "lodash/fp";
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import * as React from "react";
import {
	type DayButton,
	DayPicker,
	getDefaultClassNames,
} from "react-day-picker";
import styled from "styled-components";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseDate } from "@/utility/tableHelpers";

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	captionLayout = "label",
	buttonVariant = "ghost",
	formatters,
	components,
	onDayMouseEnter,
	...props
}: React.ComponentProps<typeof DayPicker> & {
	buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
	const defaultClassNames = getDefaultClassNames();
	const [hover, setHover] = React.useState<Date>();

	return (
		<>
			<DayPicker
				showOutsideDays={showOutsideDays}
				disabled={{ after: parseDate() }}
				className={cn(
					"group/calendar bg-background p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
					String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
					String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
					className,
				)}
				captionLayout={captionLayout}
				formatters={{
					formatMonthDropdown: (date) =>
						date.toLocaleString("default", { month: "short" }),
					...formatters,
				}}
				classNames={{
					root: cn("w-fit", defaultClassNames.root),
					months: cn(
						"relative flex flex-col gap-4 md:flex-row",
						defaultClassNames.months,
					),
					month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
					nav: cn(
						"absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
						defaultClassNames.nav,
					),
					button_previous: cn(
						buttonVariants({ variant: buttonVariant }),
						"h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
						defaultClassNames.button_previous,
					),
					button_next: cn(
						buttonVariants({ variant: buttonVariant }),
						"h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
						defaultClassNames.button_next,
					),
					month_caption: cn(
						"flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
						defaultClassNames.month_caption,
					),
					dropdowns: cn(
						"flex h-[--cell-size] w-full items-center justify-center gap-1.5 font-medium text-sm",
						defaultClassNames.dropdowns,
					),
					dropdown_root: cn(
						"relative rounded-md border border-input shadow-xs has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50",
						defaultClassNames.dropdown_root,
					),
					dropdown: cn(
						"absolute inset-0 bg-popover opacity-0",
						defaultClassNames.dropdown,
					),
					caption_label: cn(
						"select-none font-medium",
						captionLayout === "label"
							? "text-sm"
							: "flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
						defaultClassNames.caption_label,
					),
					table: "w-full border-collapse",
					weekdays: cn("flex", defaultClassNames.weekdays),
					weekday: cn(
						"flex-1 select-none rounded-md font-normal text-[0.8rem] text-muted-foreground",
						defaultClassNames.weekday,
					),
					week: cn("mt-2 flex w-full", defaultClassNames.week),
					week_number_header: cn(
						"w-[--cell-size] select-none",
						defaultClassNames.week_number_header,
					),
					week_number: cn(
						"select-none text-[0.8rem] text-muted-foreground",
						defaultClassNames.week_number,
					),
					day: cn(
						"relative",
						"aspect-square",
						"h-full",
						"w-full",
						"select-none",
						"p-0",
						"text-center",
						"[&:first-child[data-selected=true]_button]:rounded-l-md",
						"[&:last-child[data-selected=true]_button]:rounded-r-md",
						defaultClassNames.day,
					),
					range_start: cn(
						"rounded-l-md bg-accent",
						defaultClassNames.range_start,
					),
					range_middle: cn("rounded-none", defaultClassNames.range_middle),
					range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
					today: cn(
						// "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
						defaultClassNames.today,
					),
					outside: cn(
						"text-muted-foreground aria-selected:text-muted-foreground",
						defaultClassNames.outside,
					),
					disabled: cn(
						"text-muted-foreground opacity-50",
						defaultClassNames.disabled,
					),
					hidden: cn("invisible", defaultClassNames.hidden),
					...classNames,
				}}
				components={{
					Root: ({ className, rootRef, ...props }) => {
						return (
							<div
								data-slot="calendar"
								ref={rootRef}
								className={cn(className)}
								{...props}
							/>
						);
					},
					Chevron: ({ className, orientation, ...props }) => {
						if (orientation === "left") {
							return (
								<ChevronLeftIcon
									className={cn("size-4", className)}
									{...props}
								/>
							);
						}

						if (orientation === "right") {
							return (
								<ChevronRightIcon
									className={cn("size-4", className)}
									{...props}
								/>
							);
						}

						return (
							<ChevronDownIcon className={cn("size-4", className)} {...props} />
						);
					},
					DayButton: (config) => (
						<CalendarDayButton
							preview={!!props?.modifiers?.preview}
							{...config}
						/>
					),
					WeekNumber: ({ children, ...props }) => {
						return (
							<td {...props}>
								<div className="flex size-[--cell-size] items-center justify-center text-center">
									{children}
								</div>
							</td>
						);
					},
					...components,
				}}
				onDayMouseEnter={(date) => {
					if (isEqual(date, hover)) return;
					setHover(date);
				}}
				{...props}
				modifiers={{
					...props.modifiers,
					hover: (date) => isEqual(date, hover),
					preview: (date) => !!isAllowingPreview(date),
				}}
			/>
		</>
	);

	function isAllowingPreview(date: Date) {
		if (!props.modifiers?.preview) return;
		if (props.mode !== "range") return;
		if (!props.selected?.from) return;

		if (!hover) return;
		const differences = {
			hover: hover.getTime() - props.selected?.from.getTime(),
			date: date.getTime() - props.selected?.from.getTime(),
		};

		if (differences.hover > 0 !== differences.date > 0) return;

		differences.hover = Math.abs(differences.hover);
		differences.date = Math.abs(differences.date);

		const difference = differences.hover - differences.date;

		return difference > 0 && difference < differences.hover;
	}
}

interface RGB {
	red: number;
	green: number;
	blue: number;
}
function color(input: string) {
	const color = parse(input);

	return {
		opacity(level: number) {},
	};

	function parse(input: string): RGB {
		const [red, green, blue] = _.chain(input)
			.split("")
			.chunk(2)
			.map(fp.join(""))
			.map(fp.parseInt(16))
			.value();
		return { red, green, blue };
	}
}

const CalendarDayButtonItem = styled(Button)`
`;

function CalendarDayButton({
	className,
	day,
	modifiers,
	preview,
	...props
}: React.ComponentProps<typeof DayButton> & { preview: boolean }) {
	const defaultClassNames = getDefaultClassNames();

	const ref = React.useRef<HTMLButtonElement>(null);
	React.useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);

	return (
		<CalendarDayButtonItem
			ref={ref}
			variant="ghost"
			size="icon"
			data-day={day.date.toLocaleDateString()}
			data-selected-single={modifiers.selected && isNotRange()}
			data-range-start={modifiers.range_start}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			className={cn(
				"data-[selected-single=true]:bg-primary",
				"data-[selected-single=true]:text-primary-foreground",

				"data-[range-middle=true]:border-[var(--scroll-bar)]",
				"data-[range-middle=true]:text-[var(--scroll-bar)]",
				"data-[range-middle=true]:border data-[range-middle=true]:border-[#3b82f6]",
				// #0f1117
				"data-[range-start=true]:bg-[var(--scroll-bar)]",
				"data-[range-start=true]:text-primary-foreground",
				"data-[range-end=true]:bg-[var(--scroll-bar)]",
				"data-[range-end=true]:text-primary-foreground",
				"group-data-[focused=true]/day:border-ring",
				"group-data-[focused=true]/day:ring-ring/50",
				"flex",
				"aspect-square",
				"h-auto",
				"w-full",
				"min-w-[--cell-size]",
				"flex-col",
				"gap-1",
				"font-normal",
				"leading-none",
				"data-[range-end=true]:rounded-md",
				"data-[range-middle=true]:rounded-none",
				"data-[range-start=true]:rounded-md",
				"group-data-[focused=true]/day:relative",
				"group-data-[focused=true]/day:z-10",
				"group-data-[focused=true]/day:ring-[3px]",
				"[&>span]:text-xs",
				"[&>span]:opacity-70",
				"z-[2] transition-transform hover:z-[100] hover:scale-[1.2]",
				defaultClassNames.day,
				modifiers.preview &&
					isNotRange() &&
					"rounded-none border-[var(--scroll-bar)] border-y",
				preview && modifiers.hover && "border border-[var(--scroll-bar)]",
				className,
			)}
			{...props}
		/>
	);

	function isNotRange() {
		return (
			!modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
		);
	}
}

export { Calendar, CalendarDayButton };
