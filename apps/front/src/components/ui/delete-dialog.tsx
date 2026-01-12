import { Check, Copy } from "lucide-react";
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

interface DeleteDialogProps {
	isOpen: boolean;
	selectedCount: number;
	selectedEventIds: string[];
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export const DeleteDialog = ({
	isOpen,
	selectedCount,
	selectedEventIds,
	onOpenChange,
	onConfirm,
}: DeleteDialogProps) => {
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const handleCopyId = (eventId: string) => {
		navigator.clipboard.writeText(eventId);
		setCopiedId(eventId);
		setTimeout(() => setCopiedId(null), 2000);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Are you sure?</DialogTitle>
					<DialogDescription>
						This will permanently delete{" "}
						{selectedCount > 1 ? `${selectedCount} events` : "this event"}. This
						action cannot be undone.
					</DialogDescription>
				</DialogHeader>

				{/* Events to delete list */}
				{selectedEventIds.length > 0 && (
					<div>
						<div className="mb-2 font-medium text-foreground text-sm">
							{selectedCount > 1
								? `${selectedCount} events to delete:`
								: "Event to delete:"}
						</div>
						<div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-gray-300 bg-muted/30 p-1 dark:border-gray-600">
							{selectedEventIds.map((eventId) => (
								<div
									key={eventId}
									className="group flex items-center justify-between gap-2 rounded px-2 py-1 transition-colors hover:bg-muted/50"
								>
									<span className="break-all font-mono text-muted-foreground text-xs">
										{eventId}
									</span>
									<button
										type="button"
										onClick={() => handleCopyId(eventId)}
										className="flex-shrink-0 rounded border border-transparent p-1 transition-all hover:border-border hover:bg-accent"
										title="Copy ID"
									>
										{copiedId === eventId ? (
											<Check className="h-3 w-3 text-green-500" />
										) : (
											<Copy className="h-3 w-3 text-muted-foreground" />
										)}
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={onConfirm} className="bg-red-500 hover:bg-red-600">
						Delete {selectedCount > 1 ? `${selectedCount} Events` : "Event"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
