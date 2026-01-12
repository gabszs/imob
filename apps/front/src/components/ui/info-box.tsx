import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface InfoBoxProps {
	label: string;
	value: string | object;
	onCopy?: (value: string) => void;
	inline?: boolean;
}

export const InfoBox = ({
	label,
	value,
	onCopy,
	inline = false,
}: InfoBoxProps) => {
	const [isCopied, setIsCopied] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const isEmpty =
		!value || (typeof value === "object" && Object.keys(value).length === 0);
	const textValue =
		typeof value === "object" ? JSON.stringify(value, null, 2) : value;

	const handleCopy = () => {
		navigator.clipboard.writeText(textValue);
		setIsCopied(true);
		onCopy?.(textValue);
		setTimeout(() => setIsCopied(false), 2000);
	};

	if (inline) {
		return (
			<div
				className="group relative cursor-pointer rounded-md border border-border p-2 transition-all"
				style={{ backgroundColor: "hsl(var(--background))" }}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={handleCopy}
			>
				<label className="mb-1 block pl-1 font-semibold text-foreground text-xs">
					{label}
				</label>
				<div className="break-all pr-8 pl-1 font-mono text-muted-foreground text-xs">
					{textValue}
				</div>
				{isHovered && (
					<button
						type="button"
						onClick={handleCopy}
						className="absolute top-1/2 right-2 z-10 -translate-y-1/2 transform cursor-pointer rounded-md p-1 transition-all"
						style={{ backgroundColor: "hsl(var(--accent))" }}
						title="Copy to clipboard"
					>
						{isCopied ? (
							<Check className="h-4 w-4 text-green-500" />
						) : (
							<Copy
								className="h-4 w-4"
								style={{ color: "hsl(var(--muted-foreground))" }}
							/>
						)}
					</button>
				)}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-1">
			<label className="font-semibold text-foreground text-xs">{label}</label>
			<div
				className="relative cursor-pointer break-all rounded-md border border-border p-2 font-mono text-xs"
				style={{
					backgroundColor: "hsl(var(--background))",
					color: "hsl(var(--muted-foreground))",
				}}
				onClick={handleCopy}
			>
				{!isEmpty && (
					<button
						type="button"
						onClick={handleCopy}
						className="absolute top-1 right-2 z-10 cursor-pointer rounded-md p-1.5 transition-all"
						style={{ backgroundColor: "hsl(var(--accent))" }}
						title="Copy to clipboard"
					>
						{isCopied ? (
							<Check className="h-4 w-4 text-green-500" />
						) : (
							<Copy
								className="h-4 w-4"
								style={{ color: "hsl(var(--muted-foreground))" }}
							/>
						)}
					</button>
				)}
				<div className={isEmpty ? "" : "pr-8"}>{textValue}</div>
			</div>
		</div>
	);
};
