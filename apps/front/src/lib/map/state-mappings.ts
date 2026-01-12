/**
 * Mapping from IBGE state code (first 2 digits of IBGE city code) to state abbreviation
 */
export const IBGE_TO_STATE: Record<string, string> = {
	"11": "RO",
	"12": "AC",
	"13": "AM",
	"14": "RR",
	"15": "PA",
	"16": "AP",
	"17": "TO",
	"21": "MA",
	"22": "PI",
	"23": "CE",
	"24": "RN",
	"25": "PB",
	"26": "PE",
	"27": "AL",
	"28": "SE",
	"29": "BA",
	"31": "MG",
	"32": "ES",
	"33": "RJ",
	"35": "SP",
	"41": "PR",
	"42": "SC",
	"43": "RS",
	"50": "MS",
	"51": "MT",
	"52": "GO",
	"53": "DF",
};

/**
 * US state full names to abbreviations
 */
export const US_STATE_NAMES: Record<string, string> = {
	Alabama: "AL",
	Alaska: "AK",
	Arizona: "AZ",
	Arkansas: "AR",
	California: "CA",
	Colorado: "CO",
	Connecticut: "CT",
	Delaware: "DE",
	Florida: "FL",
	Georgia: "GA",
	Hawaii: "HI",
	Idaho: "ID",
	Illinois: "IL",
	Indiana: "IN",
	Iowa: "IA",
	Kansas: "KS",
	Kentucky: "KY",
	Louisiana: "LA",
	Maine: "ME",
	Maryland: "MD",
	Massachusetts: "MA",
	Michigan: "MI",
	Minnesota: "MN",
	Mississippi: "MS",
	Missouri: "MO",
	Montana: "MT",
	Nebraska: "NE",
	Nevada: "NV",
	"New Hampshire": "NH",
	"New Jersey": "NJ",
	"New Mexico": "NM",
	"New York": "NY",
	"North Carolina": "NC",
	"North Dakota": "ND",
	Ohio: "OH",
	Oklahoma: "OK",
	Oregon: "OR",
	Pennsylvania: "PA",
	"Rhode Island": "RI",
	"South Carolina": "SC",
	"South Dakota": "SD",
	Tennessee: "TN",
	Texas: "TX",
	Utah: "UT",
	Vermont: "VT",
	Virginia: "VA",
	Washington: "WA",
	"West Virginia": "WV",
	Wisconsin: "WI",
	Wyoming: "WY",
};

/**
 * Extract state abbreviation from a Brazilian city name with IBGE code
 * @param ibgeCode - IBGE code of the city (e.g., "3550308" for São Paulo)
 * @returns State abbreviation (e.g., "SP") or undefined if not found
 */
export function getStateFromIBGE(ibgeCode: string): string | undefined {
	const stateCode = ibgeCode.substring(0, 2);
	return IBGE_TO_STATE[stateCode];
}

/**
 * Extract state from a city name in format "City, State"
 * @param cityName - City name in format "City, ST" (e.g., "São Paulo, SP" or "New York")
 * @param defaultState - Optional default state if parsing fails
 * @returns State abbreviation or defaultState
 */
export function extractStateFromCityName(
	cityName: string,
	defaultState?: string,
): string | undefined {
	// Try to parse "City, ST" format
	const parts = cityName.split(",").map((p) => p.trim());
	if (parts.length === 2) {
		return parts[1];
	}
	return defaultState;
}

/**
 * Normalize state name to handle variations (accents, case, etc.)
 * @param stateName - State name to normalize
 * @returns Normalized state name
 */
export function normalizeStateName(stateName: string): string {
	return stateName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Remove accents
		.trim()
		.toUpperCase();
}
