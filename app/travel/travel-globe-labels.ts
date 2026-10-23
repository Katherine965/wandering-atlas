export type TravelGlobeGeographicLabel = {
  id: string;
  latitude: number;
  lines: readonly [string, string];
  longitude: number;
};

export const TRAVEL_GLOBE_GEOGRAPHIC_LABELS: readonly TravelGlobeGeographicLabel[] = [
  {
    id: "pacific-ocean",
    latitude: 5,
    lines: ["PACIFIC", "OCEAN"],
    longitude: -155,
  },
  {
    id: "atlantic-ocean",
    latitude: 15,
    lines: ["ATLANTIC", "OCEAN"],
    longitude: -37,
  },
  {
    id: "indian-ocean",
    latitude: -20,
    lines: ["INDIAN", "OCEAN"],
    longitude: 80,
  },
] as const;
