import sample from "../../data/sample-travel.json" with { type: "json" };
import { normalizeTravelEntry, type TravelEntry } from "./travel-storage.ts";
function entries(): TravelEntry[] { return sample.places.map((record) => { const entry = normalizeTravelEntry(record); if (!entry) throw new Error("Invalid sample travel entry"); return entry; }); }
/** Local JSON only. Returns independent display records; no persistence or write capability. */
export function listEntries(): TravelEntry[] { return entries(); }
export function getEntry(id: string): TravelEntry | null { return entries().find(entry => entry.id === id) ?? null; }
