export const TRAVEL_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const TRAVEL_IMAGE_ACCEPT = TRAVEL_IMAGE_TYPES.join(",");
export const MAX_TRAVEL_IMAGE_BYTES = 12 * 1024 * 1024;
export const MAX_TRAVEL_IMAGE_LONG_EDGE = 2560;
export const JOURNEY_MAX_PHOTOS = 20;
export const LOCATION_MAX_PHOTOS = 100;
export const MAX_TRAVEL_PHOTOS = JOURNEY_MAX_PHOTOS;

export function getTravelPhotoLimit(type: "journey" | "location") {
  return type === "location" ? LOCATION_MAX_PHOTOS : JOURNEY_MAX_PHOTOS;
}

export type TravelImageMimeType = (typeof TRAVEL_IMAGE_TYPES)[number];

export function isTravelImageMimeType(value: string): value is TravelImageMimeType {
  return (TRAVEL_IMAGE_TYPES as readonly string[]).includes(value);
}
