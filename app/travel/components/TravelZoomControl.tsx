"use client";

import Image from "@/app/components/Image";
import type { AvailableTravelTheme } from "../themes/types";

type TravelZoomControlProps = {
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  theme: AvailableTravelTheme;
  zoomInLabel: string;
  zoomOutLabel: string;
};

export function TravelZoomControl({
  canZoomIn,
  canZoomOut,
  onZoomIn,
  onZoomOut,
  theme,
  zoomInLabel,
  zoomOutLabel,
}: TravelZoomControlProps) {
  return (
    <div className="travel-zoom-controls" aria-label="Map zoom controls">
      {theme.assets.zoomControl && (
        <Image src={theme.assets.zoomControl} alt="" fill sizes="80px" aria-hidden="true" />
      )}
      <button type="button" onClick={onZoomIn} disabled={!canZoomIn} aria-label={zoomInLabel}>
        {theme.renderers.zoom === "hud" && <span aria-hidden="true">+</span>}
      </button>
      <button type="button" onClick={onZoomOut} disabled={!canZoomOut} aria-label={zoomOutLabel}>
        {theme.renderers.zoom === "hud" && <span aria-hidden="true">−</span>}
      </button>
    </div>
  );
}
