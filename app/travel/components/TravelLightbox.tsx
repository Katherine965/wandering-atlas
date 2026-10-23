"use client";

import Image from "@/app/components/Image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { AvailableTravelTheme } from "../themes/types";
import type { TravelEntry, TravelPhoto } from "../travel-storage";

type TravelLightboxProps = {
  activeIndex: number;
  entry: TravelEntry;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  photos: TravelPhoto[];
  theme: AvailableTravelTheme;
};

export function TravelLightbox({
  activeIndex,
  entry,
  onClose,
  onNext,
  onPrevious,
  photos,
  theme,
}: TravelLightboxProps) {
  const photo = photos[activeIndex];
  if (!photo) return null;

  return (
    <div
      className="travel-lightbox"
      data-travel-theme={theme.id}
      role="dialog"
      aria-modal="true"
      aria-label={`${entry.city} photo gallery`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="travel-lightbox-topbar">
        <span>{activeIndex + 1} / {photos.length}</span>
        <button type="button" onClick={onClose} aria-label="Close photo gallery">
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      <button
        className="travel-lightbox-control travel-lightbox-previous"
        type="button"
        onClick={onPrevious}
        aria-label="Previous photo"
      >
        <ChevronLeft size={28} aria-hidden="true" />
      </button>

      <div className="travel-lightbox-figure">
        <Image
          src={photo.src}
          alt={photo.caption || `${entry.city} travel photo`}
          fill
          unoptimized
          sizes="100vw"
          priority
          style={{ objectFit: "contain" }}
        />
        {photo.caption && <p>{photo.caption}</p>}
      </div>

      <button
        className="travel-lightbox-control travel-lightbox-next"
        type="button"
        onClick={onNext}
        aria-label="Next photo"
      >
        <ChevronRight size={28} aria-hidden="true" />
      </button>
    </div>
  );
}
