import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/web/lib/utils";

const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 font-medium text-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-green-500 text-white dark:bg-green-600 [a&]:hover:bg-green-600 dark:[a&]:hover:bg-green-700",
				secondary:
					"border-transparent bg-yellow-500 text-white dark:bg-yellow-600 [a&]:hover:bg-yellow-600 dark:[a&]:hover:bg-yellow-700",
				destructive:
					"border-transparent bg-red-500 text-white focus-visible:ring-destructive/20 dark:bg-red-600 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-red-600",
				outline:
					"border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 [a&]:hover:bg-gray-200 dark:[a&]:hover:bg-gray-700",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span";

	return (
		<Comp
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
