import type { TravelEntry } from "./travel-storage";

export type TravelTimeMode = "all" | "year";

export type TravelTimeState = {
  mode: TravelTimeMode;
  focusedYear: number;
};

export type TravelYearRange = {
  minYear: number;
  maxYear: number;
};

const YEAR_RANGE_BUFFER = 5;

function getEntryStartYear(entry: TravelEntry) {
  return entry.startYear ?? entry.year;
}

function getMeaningfulYears(entries: TravelEntry[]) {
  return entries.flatMap((entry) => {
    const startYear = getEntryStartYear(entry);
    return [startYear, entry.endYear].filter((year): year is number => year !== undefined);
  });
}

export function getDefaultFocusedYear(entries: TravelEntry[], currentYear = new Date().getFullYear()) {
  const years = getMeaningfulYears(entries);
  return years.length > 0 ? Math.max(...years) : currentYear;
}

export function getTravelYearRange(
  entries: TravelEntry[],
  currentYear = new Date().getFullYear(),
): TravelYearRange {
  const years = getMeaningfulYears(entries);
  if (years.length === 0) {
    return {
      minYear: currentYear - YEAR_RANGE_BUFFER,
      maxYear: currentYear + YEAR_RANGE_BUFFER,
    };
  }

  return {
    minYear: Math.min(currentYear, ...years) - YEAR_RANGE_BUFFER,
    maxYear: Math.max(currentYear, ...years) + YEAR_RANGE_BUFFER,
  };
}

export function createTravelYearRange({ minYear, maxYear }: TravelYearRange) {
  return Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index);
}

export function clampTravelYear(year: number, { minYear, maxYear }: TravelYearRange) {
  return Math.min(Math.max(year, minYear), maxYear);
}

export function isTravelEntryVisible(entry: TravelEntry, timeState: TravelTimeState) {
  if (timeState.mode === "all") return true;

  const startYear = getEntryStartYear(entry);
  if (startYear === undefined) return false;

  if (entry.type === "journey") return startYear === timeState.focusedYear;
  if (entry.endYear === undefined) return startYear <= timeState.focusedYear;

  return startYear <= timeState.focusedYear && timeState.focusedYear <= entry.endYear;
}

export function filterTravelEntries(entries: TravelEntry[], timeState: TravelTimeState) {
  return timeState.mode === "all"
    ? entries
    : entries.filter((entry) => isTravelEntryVisible(entry, timeState));
}
