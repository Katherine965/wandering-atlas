import { cyberTheme } from "./cyber.ts";
import { deepSeaTheme } from "./deep-sea.ts";
import { fairyTaleTheme } from "./fairy-tale.ts";
import { iceWorldTheme } from "./ice-world.ts";
import { parchmentTheme } from "./parchment.ts";
import type { AvailableTravelTheme, TravelThemeId } from "./types.ts";
export const TRAVEL_THEME_REGISTRY: readonly AvailableTravelTheme[] = [parchmentTheme, cyberTheme, deepSeaTheme, iceWorldTheme, fairyTaleTheme];
export const DEFAULT_TRAVEL_THEME_ID: TravelThemeId = "parchment";
export function getTravelTheme(id: string | null | undefined): AvailableTravelTheme { return TRAVEL_THEME_REGISTRY.find(t => t.id === id) ?? parchmentTheme; }
export function isAvailableTravelThemeId(id: string | null): id is TravelThemeId { return TRAVEL_THEME_REGISTRY.some(t => t.id === id); }
