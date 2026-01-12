import { Root } from "@radix-ui/react-label";
import type * as React from "react";
import { cn } from "@/web/lib/utils";

function Label({ className, ...props }: React.ComponentProps<typeof Root>) {
	return (
		<Root
			data-slot="label"
			className={cn(
				"flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
