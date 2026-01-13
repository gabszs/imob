import { useControl } from "@vis.gl/react-maplibre";
import type { IControl, Map } from "maplibre-gl";
import { useCallback } from "react";
import type { TimeRange } from "@/web/hooks/useAnalytics";

interface TimeRangeSelectorProps {
	timeRange: TimeRange;
	onTimeRangeChange: (timeRange: TimeRange) => void;
	position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

class TimeRangeSelectorControl implements IControl {
	private _container?: HTMLDivElement;
	private _select?: HTMLSelectElement;
	private _timeRange: TimeRange;
	private _onChange: (timeRange: TimeRange) => void;

	constructor(timeRange: TimeRange, onChange: (timeRange: TimeRange) => void) {
		this._timeRange = timeRange;
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
		this._select.value = this._timeRange;

		const timeRanges: { value: TimeRange; label: string }[] = [
			{ value: "30min", label: "Últimos 30 min" },
			{ value: "day", label: "Últimas 24h" },
			{ value: "week", label: "Últimos 7 dias" },
			{ value: "month", label: "Últimos 30 dias" },
			{ value: "90days", label: "Últimos 90 dias" },
		];

		timeRanges.forEach(({ value, label }) => {
			const option = document.createElement("option");
			option.value = value;
			option.textContent = label;
			this._select!.appendChild(option);
		});

		this._select.addEventListener("change", (e) => {
			const target = e.target as HTMLSelectElement;
			this._onChange(target.value as TimeRange);
		});

		this._container.appendChild(this._select);
		return this._container;
	}

	onRemove(): void {
		this._container?.parentNode?.removeChild(this._container);
	}

	updateTimeRange(timeRange: TimeRange): void {
		this._timeRange = timeRange;
		if (this._select) {
			this._select.value = timeRange;
		}
	}
}

export default function TimeRangeSelector({
	timeRange,
	onTimeRangeChange,
	position = "top-right",
}: TimeRangeSelectorProps) {
	const control = useCallback(
		() => new TimeRangeSelectorControl(timeRange, onTimeRangeChange),
		[timeRange, onTimeRangeChange],
	);

	useControl(control, { position });

	return null;
}
