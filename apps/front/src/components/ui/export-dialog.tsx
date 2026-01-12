import { Check, Copy, Download } from "lucide-react";
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
import * as DropdownMenu from "@/web/components/ui/dropdown-menu";

interface ExportDialogProps {
	isOpen: boolean;
	selectedCount: number;
	onOpenChange: (open: boolean) => void;
	onDownload: (format: "json" | "csv") => void;
	onCopy: (format: "json" | "csv") => void;
	getPreview: (format: "json" | "csv") => string;
}

export const ExportDialog = ({
	isOpen,
	selectedCount,
	onOpenChange,
	onDownload,
	onCopy,
	getPreview,
}: ExportDialogProps) => {
	const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
	const [isPreviewCopied, setIsPreviewCopied] = useState(false);

	const handleCopyPreview = () => {
		const preview = getPreview(exportFormat);
		navigator.clipboard.writeText(preview);
		setIsPreviewCopied(true);
		setTimeout(() => setIsPreviewCopied(false), 2000);
	};

	const handleCopyExport = () => {
		onCopy(exportFormat);
		onOpenChange(false);
	};

	const handleDownloadExport = () => {
		onDownload(exportFormat);
		onOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Export Events</DialogTitle>
					<DialogDescription>
						Export {selectedCount} selected event
						{selectedCount !== 1 ? "s" : ""}
					</DialogDescription>
				</DialogHeader>

				<div className="max-h-[60vh] space-y-4 overflow-y-auto pr-4">
					{/* Format Selector Dropdown */}
					<div className="space-y-2">
						<label className="font-medium text-sm">Format:</label>
						<DropdownMenu.DropdownMenu>
							<DropdownMenu.DropdownMenuTrigger asChild>
								<button
									type="button"
									className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 font-medium text-sm transition-colors hover:border-gray-300 hover:bg-accent hover:shadow-sm dark:hover:border-gray-600"
								>
									<span>{exportFormat.toUpperCase()}</span>
									<svg
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 14l-7 7m0 0l-7-7m7 7V3"
										/>
									</svg>
								</button>
							</DropdownMenu.DropdownMenuTrigger>
							<DropdownMenu.DropdownMenuContent align="start">
								<DropdownMenu.DropdownMenuItem
									onClick={() => setExportFormat("json")}
								>
									JSON
								</DropdownMenu.DropdownMenuItem>
								<DropdownMenu.DropdownMenuItem
									onClick={() => setExportFormat("csv")}
								>
									CSV
								</DropdownMenu.DropdownMenuItem>
							</DropdownMenu.DropdownMenuContent>
						</DropdownMenu.DropdownMenu>
					</div>

					{/* Export Preview */}
					<div className="space-y-2">
						<label className="font-medium text-sm">Export Preview:</label>
						<div
							className="relative overflow-auto rounded-md border border-border bg-white p-3 font-mono text-xs dark:bg-slate-950"
							style={{ height: "250px" }}
						>
							<button
								type="button"
								onClick={handleCopyPreview}
								className="absolute top-2 right-2 z-10 rounded-md bg-gray-100 p-1.5 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
								title="Copy preview to clipboard"
							>
								{isPreviewCopied ? (
									<Check className="h-4 w-4 text-green-500" />
								) : (
									<Copy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
								)}
							</button>
							<pre className="whitespace-pre text-gray-900 dark:text-gray-100">
								{getPreview(exportFormat)}
							</pre>
						</div>
					</div>
				</div>

				<DialogFooter className="-mx-6 -mb-6 -ml-6 flex justify-start gap-2 px-6 py-4">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="shadow-sm hover:border-gray-300 hover:shadow-md dark:hover:border-gray-600"
					>
						Cancel
					</Button>
					<Button
						variant="outline"
						onClick={handleCopyExport}
						className="gap-2 shadow-sm hover:border-gray-300 hover:shadow-md dark:hover:border-gray-600"
					>
						<Copy className="h-4 w-4" />
						Copy to Clipboard
					</Button>
					<Button
						onClick={handleDownloadExport}
						className="bg-blue-500 shadow-sm hover:bg-blue-600 hover:shadow-md"
					>
						<Download className="mr-2 h-4 w-4" />
						Download
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
