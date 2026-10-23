export type TravelCoordinates = {
  longitude: number;
  latitude: number;
};

export type TravelEntryType = "journey" | "location";

export type TravelImage = {
  id: string;
  src: string;
  storageKey: string;
  width: number;
  height: number;
  mimeType?: string;
  size?: number;
};

export type TravelPhoto = TravelImage & {
  caption: string;
  order: number;
  year?: number;
  month?: number;
  featured?: boolean;
};

export type TravelEntry = {
  id: string;
  type: TravelEntryType;
  city: string;
  country: string;
  region?: string;
  date?: string;
  year?: number;
  startYear?: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
  coordinates: TravelCoordinates | null;
  coverImage: TravelImage | null;
  memory: string;
  rating?: number;
  photos: TravelPhoto[];
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
};

function createLegacyImageId(prefix: string, src: string, index = 0) {
  const slug = src
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(-48) || "image";

  return `${prefix}-${index + 1}-${slug}`;
}

function normalizeTravelImage(value: unknown, prefix: string, index = 0): TravelImage | null {
  if (typeof value === "string" && value) {
    return {
      id: createLegacyImageId(prefix, value, index),
      src: value,
      storageKey: value.replace(/^\/+/, ""),
      width: 0,
      height: 0,
    };
  }

  if (!value || typeof value !== "object") return null;

  const image = value as Partial<TravelImage>;
  if (typeof image.src !== "string" || !image.src) return null;

  return {
    id: typeof image.id === "string" && image.id
      ? image.id
      : createLegacyImageId(prefix, image.src, index),
    src: image.src,
    storageKey: typeof image.storageKey === "string" && image.storageKey
      ? image.storageKey
      : image.src.replace(/^\/+/, ""),
    width: Number.isFinite(image.width) ? Number(image.width) : 0,
    height: Number.isFinite(image.height) ? Number(image.height) : 0,
    ...(typeof image.mimeType === "string" ? { mimeType: image.mimeType } : {}),
    ...(Number.isFinite(image.size) ? { size: Number(image.size) } : {}),
  };
}

export function normalizeTravelEntry(value: unknown): TravelEntry | null {
  if (!value || typeof value !== "object") return null;

  const entry = value as Partial<TravelEntry>;
  const isEntry = Boolean(
    typeof entry.id === "string"
    && typeof entry.city === "string"
    && typeof entry.country === "string"
    && typeof entry.memory === "string"
    && (
      entry.coordinates === null
      || (
        entry.coordinates
        && Number.isFinite(entry.coordinates.latitude)
        && Number.isFinite(entry.coordinates.longitude)
      )
    ),
  );

  if (!isEntry) return null;

  const rawPhotos = (entry as { photos?: unknown }).photos;
  const photos = Array.isArray(rawPhotos)
    ? rawPhotos.flatMap((photo, index) => {
      const image = normalizeTravelImage(photo, `${entry.id}-photo`, index);
      if (!image) return [];
      const metadata = photo && typeof photo === "object"
        ? photo as Partial<TravelPhoto>
        : {};

      return [{
        ...image,
        caption: typeof metadata.caption === "string" ? metadata.caption : "",
        order: Number.isFinite(metadata.order) ? Number(metadata.order) : index + 1,
        ...(Number.isInteger(metadata.year) ? { year: Number(metadata.year) } : {}),
        ...(Number.isInteger(metadata.month) && Number(metadata.month) >= 1 && Number(metadata.month) <= 12
          ? { month: Number(metadata.month) }
          : {}),
        ...(metadata.featured === true ? { featured: true } : {}),
      }];
    })
    : [];

  const rawCoverImage = (entry as { coverImage?: unknown }).coverImage;
  const startYear = Number.isInteger(entry.startYear)
    ? Number(entry.startYear)
    : Number.isInteger(entry.year) ? Number(entry.year) : undefined;
  const startMonth = Number.isInteger(entry.startMonth)
    && Number(entry.startMonth) >= 1
    && Number(entry.startMonth) <= 12
    ? Number(entry.startMonth)
    : undefined;
  const endYear = Number.isInteger(entry.endYear) ? Number(entry.endYear) : undefined;
  const endMonth = Number.isInteger(entry.endMonth)
    && Number(entry.endMonth) >= 1
    && Number(entry.endMonth) <= 12
    ? Number(entry.endMonth)
    : undefined;

  return {
    id: entry.id!,
    type: entry.type === "location" ? "location" : "journey",
    city: entry.city!,
    country: entry.country!,
    ...(typeof entry.region === "string" && entry.region.trim()
      ? { region: entry.region.trim() }
      : {}),
    ...(typeof entry.date === "string" && entry.date ? { date: entry.date } : {}),
    ...(startYear !== undefined ? { year: startYear, startYear } : {}),
    ...(startMonth !== undefined ? { startMonth } : {}),
    ...(endYear !== undefined ? { endYear } : {}),
    ...(endMonth !== undefined ? { endMonth } : {}),
    coordinates: entry.coordinates
      ? {
          latitude: Number(entry.coordinates.latitude),
          longitude: Number(entry.coordinates.longitude),
        }
      : null,
    coverImage: normalizeTravelImage(rawCoverImage, `${entry.id}-cover`),
    memory: entry.memory!,
    ...(Number.isInteger(entry.rating) && Number(entry.rating) >= 1 && Number(entry.rating) <= 5
      ? { rating: Number(entry.rating) }
      : {}),
    photos,
    tags: Array.isArray(entry.tags)
      ? entry.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    ...(typeof entry.createdAt === "string" ? { createdAt: entry.createdAt } : {}),
    ...(typeof entry.updatedAt === "string" ? { updatedAt: entry.updatedAt } : {}),
  };
}
