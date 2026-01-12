import { Popup, useMap } from "@vis.gl/react-maplibre";
import { useEffect, useState } from "react";

const middleOfUSA = [-100, 40];

interface LocationResponse {
	status: string;
	country: string;
	countryCode: string;
	region: string;
	regionName: string;
	city: string;
	zip: string;
	lat: number;
	lon: number;
	timezone: string;
	isp: string;
	org: string;
	as: string;
	query: string;
}

async function getLocation() {
	try {
		const response = await fetch("http://ip-api.com/json/");
		const json = (await response.json()) as LocationResponse;
		if (typeof json.lat === "number" && typeof json.lon === "number") {
			return [json.lon, json.lat];
		}
	} catch {}
	return middleOfUSA;
}

export default function YouAreHere() {
	const [popupLocation, setPopupLocation] = useState(middleOfUSA);
	const { current: map } = useMap();

	useEffect(() => {
		if (!map) return;
		(async () => {
			const location = await getLocation();
			if (location !== middleOfUSA) {
				setPopupLocation(location);
				map.flyTo({ center: location, zoom: 8 });
			}
		})();
	}, [map]);

	if (!map) return null;

	return (
		<Popup
			longitude={popupLocation[0]}
			latitude={popupLocation[1]}
			closeButton={false}
			closeOnClick={false}
		>
			<h3>You are approximately here!</h3>
		</Popup>
	);
}
