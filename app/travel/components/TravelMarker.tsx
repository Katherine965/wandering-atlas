"use client";

import Image from "@/app/components/Image";
import type { TravelEntryType } from "../travel-storage";
import type { AvailableTravelTheme } from "../themes/types";

export function TravelMarker({
  assetOverride,
  theme,
  type,
}: {
  assetOverride?: string;
  theme: AvailableTravelTheme;
  type: TravelEntryType;
}) {
  const markerAsset = assetOverride ?? theme.assets.markers?.[type];

  return (
    <span className={`travel-marker-art is-${type}`} aria-hidden="true">
      {markerAsset ? (
        <Image src={markerAsset} alt="" fill sizes="72px" />
      ) : type === "journey" ? (
        <svg className="travel-marker-hud" viewBox="0 0 48 48">
          <path className="travel-marker-hud-pole" d="M16 8v32" />
          <path className="travel-marker-hud-flag" d="M17 10c7-4 11 4 19-.5v16c-8 4.5-12-3.5-19 .5z" />
        </svg>
      ) : (
        <svg className="travel-marker-hud" viewBox="0 0 48 48">
          <circle className="travel-marker-hud-ring" cx="24" cy="24" r="18" />
          <path className="travel-marker-hud-star" d="m24 5 5.2 13.8 14.8.7-11.6 9.3L36.3 43 24 35 11.7 43l3.9-14.2L4 19.5l14.8-.7z" />
          <circle className="travel-marker-hud-node" cx="24" cy="24" r="3.2" />
        </svg>
      )}
    </span>
  );
}
