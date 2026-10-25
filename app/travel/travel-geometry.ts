import { geoEquirectangular, geoPath } from "d3-geo";
import type { FeatureCollection, MultiPolygon, Polygon, Position } from "geojson";
import type { TravelCoordinates } from "./travel-storage";

export const TRAVEL_VIEWBOX_WIDTH = 1672;
export const TRAVEL_VIEWBOX_HEIGHT = 941;

export const TRAVEL_ATLAS_BOUNDS = {
  left: 208,
  top: 162,
  width: 1256,
  height: 628,
} as const;

export const TRAVEL_GLOBE_GEOMETRY = {
  centerX: TRAVEL_VIEWBOX_WIDTH / 2,
  centerY: TRAVEL_ATLAS_BOUNDS.top + TRAVEL_ATLAS_BOUNDS.height / 2,
  diameter: 485,
} as const;

export type TravelGlobeRotation = [number, number, number];

export const TRAVEL_GLOBE_INITIAL_ROTATION: TravelGlobeRotation = [-10, -18, 0];

export type TravelMapPoint = { x: number; y: number };
export type TravelProjectedPoint = TravelMapPoint & { visible: boolean };
export type TravelGeoPath = { id: string; path: string };
export type TravelProjectedBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};
export type TravelCountryPath = TravelGeoPath & {
  bounds: TravelProjectedBounds;
  focusPath: string;
  longitudeCenter: number;
  name: string;
};
export type TravelAtlasTransform = {
  scale: number;
  scaleY: number;
  translateX: number;
  translateY: number;
};
export type TravelGeoGeometry = Polygon | MultiPolygon;
export type TravelGeoFeatureCollection = FeatureCollection<
  TravelGeoGeometry,
  Record<string, unknown>
>;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function projectAtlasCoordinates({
  latitude,
  longitude,
}: TravelCoordinates, longitudeCenter?: number): TravelProjectedPoint {
  const projectedLongitude = longitudeCenter === undefined
    ? longitude
    : unwrapLongitude(longitude, longitudeCenter);

  return {
    x: TRAVEL_ATLAS_BOUNDS.left
      + ((projectedLongitude + 180) / 360) * TRAVEL_ATLAS_BOUNDS.width,
    y: TRAVEL_ATLAS_BOUNDS.top
      + ((90 - clamp(latitude, -90, 90)) / 180) * TRAVEL_ATLAS_BOUNDS.height,
    visible: true,
  };
}

export function unprojectAtlasPoint(point: TravelMapPoint): TravelCoordinates {
  return {
    longitude: clamp(
      ((point.x - TRAVEL_ATLAS_BOUNDS.left) / TRAVEL_ATLAS_BOUNDS.width) * 360 - 180,
      -180,
      180,
    ),
    latitude: clamp(
      90 - ((point.y - TRAVEL_ATLAS_BOUNDS.top) / TRAVEL_ATLAS_BOUNDS.height) * 180,
      -90,
      90,
    ),
  };
}

function normalizeLongitude(longitude: number) {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
}

function unwrapLongitude(longitude: number, center: number) {
  return center + normalizeLongitude(longitude - center);
}

const WORLD_ATLAS_PROJECTION = geoEquirectangular()
  .scale(TRAVEL_ATLAS_BOUNDS.width / (2 * Math.PI))
  .translate([
    TRAVEL_ATLAS_BOUNDS.left + TRAVEL_ATLAS_BOUNDS.width / 2,
    TRAVEL_ATLAS_BOUNDS.top + TRAVEL_ATLAS_BOUNDS.height / 2,
  ])
  .clipExtent([
    [TRAVEL_ATLAS_BOUNDS.left, TRAVEL_ATLAS_BOUNDS.top],
    [
      TRAVEL_ATLAS_BOUNDS.left + TRAVEL_ATLAS_BOUNDS.width,
      TRAVEL_ATLAS_BOUNDS.top + TRAVEL_ATLAS_BOUNDS.height,
    ],
  ]);
const WORLD_ATLAS_PATH = geoPath(WORLD_ATLAS_PROJECTION);

function ringToFocusedAtlasPath(ring: Position[], longitudeCenter: number) {
  if (ring.length === 0) return "";

  const path = ring.map((position, index) => {
    const [longitude, latitude] = position;
    const point = projectAtlasCoordinates({ longitude, latitude }, longitudeCenter);
    return `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }).join(" ");

  return `${path} Z`;
}

function geometryToAtlasPath(geometry: TravelGeoGeometry) {
  // d3-geo clips and closes antimeridian segments without dropping polygon rings.
  return WORLD_ATLAS_PATH(geometry) ?? "";
}

function geometryToFocusedAtlasPath(
  geometry: TravelGeoGeometry,
  longitudeCenter: number,
) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons
    .flatMap((polygon) => polygon.map((ring) => (
      ringToFocusedAtlasPath(ring, longitudeCenter)
    )))
    .filter(Boolean)
    .join(" ");
}

function getGeometryPositions(geometry: TravelGeoGeometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.flatMap((polygon) => polygon.flatMap((ring) => ring));
}

function getCompactLongitudeCenter(geometry: TravelGeoGeometry) {
  const longitudes = getGeometryPositions(geometry)
    .map(([longitude]) => ((longitude % 360) + 360) % 360)
    .sort((first, second) => first - second);

  if (longitudes.length < 2) return normalizeLongitude(longitudes[0] ?? 0);

  let largestGap = -1;
  let arcStart = longitudes[0];
  for (let index = 0; index < longitudes.length; index += 1) {
    const current = longitudes[index];
    const next = index === longitudes.length - 1
      ? longitudes[0] + 360
      : longitudes[index + 1];
    const gap = next - current;
    if (gap > largestGap) {
      largestGap = gap;
      arcStart = next % 360;
    }
  }

  return normalizeLongitude(arcStart + (360 - largestGap) / 2);
}

function getProjectedBounds(geometry: TravelGeoGeometry, longitudeCenter: number) {
  const bounds: TravelProjectedBounds = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };

  for (const [longitude, latitude] of getGeometryPositions(geometry)) {
    const point = projectAtlasCoordinates({ longitude, latitude }, longitudeCenter);
    bounds.minX = Math.min(bounds.minX, point.x);
    bounds.minY = Math.min(bounds.minY, point.y);
    bounds.maxX = Math.max(bounds.maxX, point.x);
    bounds.maxY = Math.max(bounds.maxY, point.y);
  }

  return bounds;
}

function getFeatureId(
  properties: Record<string, unknown> | null,
  index: number,
  fallback: string,
) {
  const candidate = properties?.iso_a3
    ?? properties?.ISO_A3
    ?? properties?.adm0_a3
    ?? properties?.ADM0_A3
    ?? properties?.name
    ?? properties?.NAME;
  return `${typeof candidate === "string" ? candidate : fallback}-${index}`;
}

export function createAtlasPaths(
  geoJson: TravelGeoFeatureCollection,
  fallback: string,
): TravelGeoPath[] {
  return geoJson.features.map((feature, index) => ({
    id: getFeatureId(feature.properties, index, fallback),
    path: geometryToAtlasPath(feature.geometry),
  }));
}

export function getCountryId(properties: Record<string, unknown> | null, index: number) {
  const candidates = [
    properties?.ISO_A3,
    properties?.ADM0_A3,
    properties?.iso_a3,
    properties?.adm0_a3,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate && candidate !== "-99") return candidate;
  }

  const name = properties?.NAME ?? properties?.name;
  if (typeof name === "string" && name) {
    return name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  return `COUNTRY-${index}`;
}

function getCountryName(properties: Record<string, unknown> | null, index: number) {
  const candidate = properties?.NAME ?? properties?.name;
  return typeof candidate === "string" && candidate ? candidate : `Country ${index + 1}`;
}

function combineCountryGeometries(geometries: TravelGeoGeometry[]): TravelGeoGeometry {
  if (geometries.length === 1) return geometries[0];
  return {
    type: "MultiPolygon",
    coordinates: geometries.flatMap((geometry) => (
      geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates
    )),
  };
}

export function createCountryAtlasPaths(
  geoJson: TravelGeoFeatureCollection,
): TravelCountryPath[] {
  const taiwanFeature = geoJson.features.find((feature, index) => (
    getCountryId(feature.properties, index) === "TWN"
  ));

  return geoJson.features.flatMap((feature, index) => {
    const id = getCountryId(feature.properties, index);
    if (id === "TWN") return [];

    const geometry = combineCountryGeometries([
      feature.geometry,
      ...(id === "CHN" && taiwanFeature ? [taiwanFeature.geometry] : []),
    ]);
    const longitudeCenter = getCompactLongitudeCenter(geometry);
    return {
      id,
      name: getCountryName(feature.properties, index),
      path: geometryToAtlasPath(geometry),
      focusPath: geometryToFocusedAtlasPath(geometry, longitudeCenter),
      bounds: getProjectedBounds(geometry, longitudeCenter),
      longitudeCenter,
    };
  });
}

export function createCountryAtlasPath(
  geoJson: TravelGeoFeatureCollection,
  countryId: string,
): TravelCountryPath | null {
  const countryFeatureIndex = geoJson.features.findIndex((feature, index) => (
    getCountryId(feature.properties, index) === countryId
  ));
  if (countryFeatureIndex < 0 || countryId === "TWN") return null;

  const countryFeature = geoJson.features[countryFeatureIndex];
  const taiwanFeature = countryId === "CHN"
    ? geoJson.features.find((feature, index) => (
      getCountryId(feature.properties, index) === "TWN"
    ))
    : undefined;
  const geometry = combineCountryGeometries([
    countryFeature.geometry,
    ...(taiwanFeature ? [taiwanFeature.geometry] : []),
  ]);
  const longitudeCenter = getCompactLongitudeCenter(geometry);

  return {
    id: countryId,
    name: getCountryName(countryFeature.properties, countryFeatureIndex),
    path: geometryToAtlasPath(geometry),
    focusPath: geometryToFocusedAtlasPath(geometry, longitudeCenter),
    bounds: getProjectedBounds(geometry, longitudeCenter),
    longitudeCenter,
  };
}

export function createCountryFocusTransform(
  bounds: TravelProjectedBounds,
  paddingRatio = 0.1,
): TravelAtlasTransform {
  const normalizedPadding = clamp(paddingRatio, 0.08, 0.12);
  const width = Math.max(bounds.maxX - bounds.minX, 1);
  const height = Math.max(bounds.maxY - bounds.minY, 1);
  const availableWidth = TRAVEL_ATLAS_BOUNDS.width * (1 - normalizedPadding * 2);
  const availableHeight = TRAVEL_ATLAS_BOUNDS.height * (1 - normalizedPadding * 2);
  const scale = Math.min(
    availableWidth / width,
    availableHeight / height,
  );
  const sourceCenterX = (bounds.minX + bounds.maxX) / 2;
  const sourceCenterY = (bounds.minY + bounds.maxY) / 2;
  const targetCenterX = TRAVEL_ATLAS_BOUNDS.left + TRAVEL_ATLAS_BOUNDS.width / 2;
  const targetCenterY = TRAVEL_ATLAS_BOUNDS.top + TRAVEL_ATLAS_BOUNDS.height / 2;

  return {
    scale,
    scaleY: scale,
    translateX: targetCenterX - sourceCenterX * scale,
    translateY: targetCenterY - sourceCenterY * scale,
  };
}

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  "cote d ivoire": "CIV",
  "czech republic": "CZE",
  "democratic republic of the congo": "COD",
  "ivory coast": "CIV",
  "north korea": "PRK",
  "republic of korea": "KOR",
  "russian federation": "RUS",
  "south korea": "KOR",
  "hong kong": "CHN",
  "macao": "CHN",
  "macau": "CHN",
  "taiwan": "CHN",
  "turkiye": "TUR",
  "united states": "USA",
  "united states of america": "USA",
  "us": "USA",
  "usa": "USA",
};

function normalizeCountryName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/^the /, "");
}

export function getCountryIdForName(name: string, countries: TravelCountryPath[]) {
  const normalizedName = normalizeCountryName(name);
  const aliasId = COUNTRY_NAME_ALIASES[normalizedName];
  if (aliasId && countries.some((country) => country.id === aliasId)) return aliasId;
  return countries.find((country) => normalizeCountryName(country.name) === normalizedName)?.id ?? null;
}

const ZH_COUNTRY_NAMES: Record<string, string> = {
  CHN: "中国",
  RUS: "俄罗斯",
  TUR: "土耳其",
  USA: "美国",
};

export function getCountryDisplayName(country: TravelCountryPath, locale: "en" | "zh") {
  if (locale === "zh") return ZH_COUNTRY_NAMES[country.id] ?? country.name;
  return country.id === "USA" ? "United States" : country.name;
}
