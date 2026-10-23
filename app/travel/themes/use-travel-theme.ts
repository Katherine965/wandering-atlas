"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_TRAVEL_THEME_ID,
  isAvailableTravelThemeId,
} from "./registry";
import type { TravelThemeId } from "./types";

const TRAVEL_THEME_STORAGE_KEY = "wandering-atlas-theme";
const TRAVEL_THEME_CHANGE_EVENT = "wandering-atlas-theme-change";

function getTravelThemeSnapshot(): TravelThemeId {
  try {
    const storedTheme = window.localStorage.getItem(TRAVEL_THEME_STORAGE_KEY);
    return isAvailableTravelThemeId(storedTheme) ? storedTheme : DEFAULT_TRAVEL_THEME_ID;
  } catch {
    return DEFAULT_TRAVEL_THEME_ID;
  }
}

function subscribeToTravelTheme(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === TRAVEL_THEME_STORAGE_KEY) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(TRAVEL_THEME_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(TRAVEL_THEME_CHANGE_EVENT, onStoreChange);
  };
}

function storeTravelTheme(theme: TravelThemeId) {
  if (!isAvailableTravelThemeId(theme)) return;

  try {
    window.localStorage.setItem(TRAVEL_THEME_STORAGE_KEY, theme);
  } catch {
    // The in-memory selection still works when local storage is unavailable.
  }
  window.dispatchEvent(new Event(TRAVEL_THEME_CHANGE_EVENT));
}

export function useTravelTheme() {
  const theme = useSyncExternalStore(
    subscribeToTravelTheme,
    getTravelThemeSnapshot,
    () => DEFAULT_TRAVEL_THEME_ID,
  );

  return [theme, storeTravelTheme] as const;
}
