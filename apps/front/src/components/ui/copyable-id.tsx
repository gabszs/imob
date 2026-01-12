import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyableIdProps {
	id: string;
	displayValue?: string;
	onCopy?: (id: string) => void;
	className?: string;
}

export const CopyableId = ({
	id,
	displayValue,
	onCopy,
	className,
}: CopyableIdProps) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigator.clipboard.writeText(id);
		setCopied(true);
		if (onCopy) {
			onCopy(id);
		}
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div
			className={`flex w-fit max-w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-all hover:bg-accent hover:shadow-[0_0_0_1px_hsl(var(--border))] ${className || ""}`}
			onClick={handleCopy}
			title="Click to copy ID"
		>
			<span className="truncate text-sm">{displayValue || id}</span>
			<button
				type="button"
				onClick={handleCopy}
				className="flex-shrink-0 rounded-md p-0.5 transition-colors hover:bg-muted"
				title="Copy ID"
			>
				{copied ? (
					<Check className="h-3 w-3 text-green-500" />
				) : (
					<Copy className="h-3 w-3 text-muted-foreground" />
				)}
			</button>
		</div>
	);
};
