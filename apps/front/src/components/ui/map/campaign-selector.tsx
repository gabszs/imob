import { useControl } from "@vis.gl/react-maplibre";
import type { IControl, Map } from "maplibre-gl";
import { useCallback, useEffect } from "react";
import type { Campaign } from "@/web/hooks/useCampaigns";

interface CampaignSelectorProps {
	campaigns: Campaign[];
	selectedCampaignId: string;
	onCampaignChange: (campaignId: string) => void;
	position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

class CampaignSelectorControl implements IControl {
	private _container?: HTMLDivElement;
	private _select?: HTMLSelectElement;
	private _campaigns: Campaign[];
	private _selectedCampaignId: string;
	private _onChange: (campaignId: string) => void;

	constructor(
		campaigns: Campaign[],
		selectedCampaignId: string,
		onChange: (campaignId: string) => void,
	) {
		this._campaigns = campaigns;
		this._selectedCampaignId = selectedCampaignId;
		this._onChange = onChange;
	}

	onAdd(_map: Map): HTMLElement {
		this._container = document.createElement("div");
		this._container.className = "maplibregl-ctrl maplibregl-ctrl-group";
		this._container.style.background = "#f5f5f5";
		this._container.style.padding = "5px";

		this._select = document.createElement("select");
		this._select.style.border = "none";
		this._select.style.fontSize = "12px";
		this._select.style.cursor = "pointer";
		this._select.style.background = "#f5f5f5";
		this._select.style.color = "#333";
		this._select.style.width = "150px";
		this._select.value = this._selectedCampaignId;

		// Add placeholder option
		if (this._campaigns.length === 0) {
			const option = document.createElement("option");
			option.value = "";
			option.textContent = "Nenhuma campanha";
			option.disabled = true;
			this._select.appendChild(option);
		}

		// Add campaign options
		this._campaigns.forEach((campaign) => {
			const option = document.createElement("option");
			option.value = campaign.id;
			option.textContent = campaign.name;
			this._select!.appendChild(option);
		});

		this._select.addEventListener("change", (e) => {
			const target = e.target as HTMLSelectElement;
			this._onChange(target.value);
		});

		this._container.appendChild(this._select);
		return this._container;
	}

	onRemove(): void {
		this._container?.parentNode?.removeChild(this._container);
	}

	updateCampaigns(campaigns: Campaign[], selectedCampaignId: string): void {
		this._campaigns = campaigns;
		this._selectedCampaignId = selectedCampaignId;
		if (this._select) {
			// Clear existing options
			this._select.innerHTML = "";

			// Add placeholder if no campaigns
			if (campaigns.length === 0) {
				const option = document.createElement("option");
				option.value = "";
				option.textContent = "Nenhuma campanha";
				option.disabled = true;
				this._select.appendChild(option);
			}

			// Add campaign options
			campaigns.forEach((campaign) => {
				const option = document.createElement("option");
				option.value = campaign.id;
				option.textContent = campaign.name;
				this._select!.appendChild(option);
			});

			this._select.value = selectedCampaignId;
		}
	}
}

export default function CampaignSelector({
	campaigns,
	selectedCampaignId,
	onCampaignChange,
	position = "top-right",
}: CampaignSelectorProps) {
	const control = useCallback(
		() =>
			new CampaignSelectorControl(
				campaigns,
				selectedCampaignId,
				onCampaignChange,
			),
		[],
	);

	const ctrl = useControl(control, { position });

	useEffect(() => {
		if (ctrl && "updateCampaigns" in ctrl) {
			(ctrl as CampaignSelectorControl).updateCampaigns(
				campaigns,
				selectedCampaignId,
			);
		}
	}, [ctrl, campaigns, selectedCampaignId]);

	return null;
}
