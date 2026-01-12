/**
 * StatusDot Component
 *
 * Small colored dot for indicating status with optional pulse animation.
 *
 * @example
 * ```tsx
 * <StatusDot variant="success" animate={true} aria-label="Detected" />
 * <StatusDot variant="neutral" aria-label="Not detected" />
 * ```
 */

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/web/lib/utils";

const statusDotVariants = cva("h-2 w-2 rounded-full", {
	variants: {
		variant: {
			success: "bg-green-600 dark:bg-green-500",
			neutral: "bg-gray-400 dark:bg-gray-500",
		},
		animate: {
			true: "motion-safe:animate-pulse",
			false: "",
		},
	},
	defaultVariants: {
		variant: "neutral",
		animate: false,
	},
});

export interface StatusDotProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof statusDotVariants> {
	/**
	 * Optional accessible label for screen readers
	 * If provided, removes aria-hidden
	 */
	"aria-label"?: string;
}

/**
 * StatusDot Component
 *
 * A small colored dot for indicating status with consistent styling.
 * Use aria-label to provide accessible status information.
 */
const StatusDot = React.forwardRef<
	HTMLSpanElement | HTMLDivElement,
	StatusDotProps
>(({ className, variant, animate, "aria-label": ariaLabel, ...props }, ref) => {
	if (ariaLabel) {
		return (
			<div
				ref={ref as React.Ref<HTMLDivElement>}
				role="img"
				className={cn(statusDotVariants({ variant, animate, className }))}
				aria-label={ariaLabel}
				{...props}
			/>
		);
	}

	return (
		<span
			ref={ref as React.Ref<HTMLSpanElement>}
			className={cn(statusDotVariants({ variant, animate, className }))}
			aria-hidden="true"
			{...props}
		/>
	);
});
StatusDot.displayName = "StatusDot";

export { StatusDot, statusDotVariants };
