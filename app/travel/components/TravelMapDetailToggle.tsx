"use client";

import type { AvailableTravelTheme } from "../themes/types";
import { TravelButton } from "./TravelButton";

export type TravelMapDetailMode = "outline" | "borders";

type TravelMapDetailToggleProps = {
  enabled: Record<TravelMapDetailMode, boolean>;
  independent: boolean;
  value: TravelMapDetailMode;
  onChange: (value: TravelMapDetailMode) => void;
  onToggle: (value: TravelMapDetailMode) => void;
  theme: AvailableTravelTheme;
};

const MAP_DETAIL_OPTIONS = [
  { value: "outline", label: "Outline" },
  { value: "borders", label: "Borders" },
] as const;

export function TravelMapDetailToggle({
  enabled,
  independent,
  onChange,
  onToggle,
  theme,
  value,
}: TravelMapDetailToggleProps) {
  return (
    <div
      className={`travel-map-detail-toggle${independent ? " is-independent" : ""}`}
      role="group"
      aria-label="Map detail"
    >
      {MAP_DETAIL_OPTIONS.map((option) => {
        const isActive = independent ? enabled[option.value] : value === option.value;
        if (independent) {
          return (
            <TravelButton
              aria-pressed={isActive}
              className={`travel-map-detail-button${isActive ? " is-active" : ""}`}
              frame="sm"
              key={option.value}
              onClick={() => onToggle(option.value)}
              theme={theme}
            >
              {option.label}
            </TravelButton>
          );
        }

        return (
          <button
            type="button"
            key={option.value}
            className={isActive ? "is-active" : ""}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
          >
            <span className="travel-type-label" lang="en">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
