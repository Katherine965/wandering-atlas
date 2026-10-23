"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from "react";
import type { AvailableTravelTheme } from "../themes/types";
import type { TravelCoordinates, TravelEntry } from "../travel-storage";
import type { TravelProjectedPoint } from "../travel-geometry";
import { TravelMarker } from "./TravelMarker";

type TravelMarkerLayerProps = {
  onPlaceSelect: (place: TravelEntry) => void;
  places: TravelEntry[];
  projectCoordinates: (coordinates: TravelCoordinates) => TravelProjectedPoint;
  selectedId: string | null;
  theme: AvailableTravelTheme;
  viewBoxHeight: number;
  viewBoxWidth: number;
};

export type TravelMarkerLayerHandle = {
  updateProjectedPoints: (
    projectCoordinates: (coordinates: TravelCoordinates) => TravelProjectedPoint,
  ) => void;
};

function setMarkerPosition(
  element: HTMLElement | null | undefined,
  point: TravelProjectedPoint,
  viewBoxHeight: number,
  viewBoxWidth: number,
) {
  if (!element) return;

  element.hidden = !point.visible;
  if (!point.visible) return;

  element.style.left = `${(point.x / viewBoxWidth) * 100}%`;
  element.style.top = `${(point.y / viewBoxHeight) * 100}%`;
}

export const TravelMarkerLayer = forwardRef<
  TravelMarkerLayerHandle,
  TravelMarkerLayerProps
>(function TravelMarkerLayer({
  onPlaceSelect,
  places,
  projectCoordinates,
  selectedId,
  theme,
  viewBoxHeight,
  viewBoxWidth,
}, ref) {
  const markerRefs = useRef(new Map<string, HTMLButtonElement>());

  useImperativeHandle(ref, () => ({
    updateProjectedPoints(nextProjectCoordinates) {
      for (const place of places) {
        if (!place.coordinates) continue;
        setMarkerPosition(
          markerRefs.current.get(place.id),
          nextProjectCoordinates(place.coordinates),
          viewBoxHeight,
          viewBoxWidth,
        );
      }


    },
  }), [places, viewBoxHeight, viewBoxWidth]);

  return (
    <>
      {places.map((place) => {
        if (!place.coordinates) return null;
        const point = projectCoordinates(place.coordinates);
        const isSelected = place.id === selectedId;
        return (
          <button
            className={`travel-marker${isSelected ? " is-selected" : ""}${place.type === "location" ? " is-location" : ""}`}
            hidden={!point.visible}
            key={place.id}
            ref={(element) => {
              if (element) markerRefs.current.set(place.id, element);
              else markerRefs.current.delete(place.id);
            }}
            type="button"
            style={{
              left: `${(point.x / viewBoxWidth) * 100}%`,
              top: `${(point.y / viewBoxHeight) * 100}%`,
              "--travel-marker-visual-scale": theme.visuals.markerScale[place.type],
            } as CSSProperties}
            onClick={(event) => {
              event.stopPropagation();
              onPlaceSelect(place);
            }}
            aria-label={[`Open ${place.city}`, place.country].filter(Boolean).join(", ")}
            aria-pressed={isSelected}
          >
            <TravelMarker theme={theme} type={place.type} />
            <span className="travel-marker-label">{place.city}</span>
          </button>
        );
      })}


    </>
  );
});
