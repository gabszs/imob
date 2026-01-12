import { Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/web/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/web/components/ui/dialog";
import { Input } from "@/web/components/ui/input";

interface DeleteConfirmDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	itemName: string;
	itemType: string;
	isDeleting?: boolean;
}

export const DeleteConfirmDialog = ({
	isOpen,
	onOpenChange,
	onConfirm,
	itemName,
	itemType,
	isDeleting = false,
}: DeleteConfirmDialogProps) => {
	const [confirmation, setConfirmation] = useState("");
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(itemName);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setConfirmation("");
			setIsCopied(false);
		}
		onOpenChange(open);
	};

	const handleConfirm = () => {
		onConfirm();
		setConfirmation("");
		setIsCopied(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-base">Delete {itemType}</DialogTitle>
					<DialogDescription className="space-y-2 text-xs">
						<div>
							Are you sure you want to delete this {itemType.toLowerCase()}?
						</div>
						<div className="font-medium text-red-500">
							This can not be undone.
						</div>
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-4">
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-sm">
							<span className="text-muted-foreground">Type</span>
							<div
								className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-xs hover:bg-muted"
								onClick={handleCopy}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										handleCopy();
									}
								}}
								role="button"
								tabIndex={0}
								title="Click to copy"
							>
								<span>{itemName}</span>
								{isCopied ? (
									<span className="font-bold text-green-500">✓</span>
								) : (
									<Copy className="h-3 w-3 text-muted-foreground" />
								)}
							</div>
							<span className="text-muted-foreground">to confirm.</span>
						</div>

						<Input
							value={confirmation}
							onChange={(e) => setConfirmation(e.target.value)}
							placeholder={`Enter ${itemType.toLowerCase()} name`}
							className="font-mono"
							autoComplete="off"
							autoCorrect="off"
							spellCheck="false"
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isDeleting}
					>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={isDeleting || confirmation !== itemName}
						className={
							confirmation === itemName
								? "bg-red-500 hover:bg-red-600"
								: "cursor-not-allowed opacity-50"
						}
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
