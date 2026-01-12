"use client";
import { useUpdate } from "@reactuses/core";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import type * as React from "react";
import { DateRange, OnSelectHandler } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type SafeOmit<T, Key extends keyof T> = Pick<T, Exclude<keyof T, Key>>;
//
export function DatePicker({
	children,
	onOpenChange,
	...config
}: SafeOmit<
	{ onOpenChange?: (open: boolean) => void } & (React.ComponentProps<
		typeof Calendar
	> & { mode: "range"; required: true }),
	"mode" | "required"
> &
	React.PropsWithChildren) {
	return (
		<Popover onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar {...config} mode="range" required={true} />
			</PopoverContent>
		</Popover>
	);
}
