"use client";

import Image from "@/app/components/Image";
import { CalendarDays, MapPin, Star, X } from "lucide-react";
import { useState } from "react";
import type { AvailableTravelTheme } from "../themes/types";
import type { TravelEntry, TravelPhoto } from "../travel-storage";

export type PostcardTab = "photos" | "notes" | "details";

type TravelPostcardCopy = {
  date: string;
  details: string;
  journey: string;
  location: string;
  noPhotos: string;
  notes: string;
  openScrapbook: string;
  photos: string;
  place: string;
  rating: string;
};

type TravelPostcardProps = {
  dateText: string;
  entry: TravelEntry;
  galleryPhotos: TravelPhoto[];
  hasScrapbookPhotos: boolean;
  onClose: () => void;
  onOpenPhoto: () => void;
  onOpenScrapbook: () => void;
  onPhotoSelect: (index: number) => void;
  onTabChange: (tab: PostcardTab) => void;
  photoIndex: number;
  tab: PostcardTab;
  theme: AvailableTravelTheme;
  ui: TravelPostcardCopy;
};

export function TravelPostcard({
  dateText,
  entry,
  galleryPhotos,
  hasScrapbookPhotos,
  onClose,
  onOpenPhoto,
  onOpenScrapbook,
  onPhotoSelect,
  onTabChange,
  photoIndex,
  tab,
  theme,
  ui,
}: TravelPostcardProps) {
  const [photoOrientations, setPhotoOrientations] = useState<Record<string, "landscape" | "portrait">>({});
  const selectedPhoto = galleryPhotos[photoIndex] ?? null;
  const isPortraitPhoto = selectedPhoto
    ? photoOrientations[selectedPhoto.src] === "portrait"
    : false;
  const portraitPhotoStyle = theme.visuals.postcard.portraitPhoto;
  const usePortraitTreatment = isPortraitPhoto && portraitPhotoStyle.fit === "contain";
  const isHudPostcard = theme.renderers.postcard === "hud";
  const locationText = [entry.city, entry.region, entry.country].filter(Boolean).join(", ");
  const displayedDate = dateText && dateText !== "—" ? dateText : "";
  const displayedRating = entry.rating !== undefined
    ? `${entry.rating} / 5`
    : "";

  return (
    <aside
      className="travel-postcard"
      data-postcard-tab={tab}
      role="dialog"
      aria-modal="false"
      aria-live="polite"
      aria-labelledby="travel-postcard-title"
      onMouseDown={(event) => event.stopPropagation()}
    >
      {theme.assets.postcardFrame && (
        <Image
          src={theme.assets.postcardFrame}
          alt=""
          fill
          priority
          sizes={"24vw"}
          aria-hidden="true"
          className="travel-postcard-frame"
        />
      )}
      {isHudPostcard && (
        <span className="travel-postcard-hud-frame" aria-hidden="true" />
      )}
      <button
        type="button"
        className="travel-postcard-close"
        onClick={onClose}
        aria-label={`Close ${entry.city} postcard`}
      >
        <X size={14} aria-hidden="true" />
      </button>

      <div className="travel-postcard-interior">
      <header className="travel-postcard-heading">
        <p>{[entry.country, entry.region, ui[entry.type]].filter(Boolean).join(" · ")}</p>
        <h2 id="travel-postcard-title">{entry.city}</h2>
      </header>
      <div className="travel-postcard-tabs" role="tablist" aria-label={`${entry.city} postcard sections`}>
        {(["photos", "notes", "details"] as const).map((nextTab) => (
          <button
            key={nextTab}
            type="button"
            role="tab"
            aria-selected={tab === nextTab}
            className={tab === nextTab ? "is-active" : ""}
            onClick={() => {
              if (nextTab === "details" && hasScrapbookPhotos) {
                onOpenScrapbook();
                return;
              }
              onTabChange(nextTab);
            }}
          >
            {ui[nextTab]}
          </button>
        ))}
      </div>
      <div className="travel-postcard-main-photo">
        {selectedPhoto ? (
          <button
            type="button"
            className={usePortraitTreatment ? "is-portrait" : undefined}
            onClick={onOpenPhoto}
            aria-label={`Open full image for ${entry.city}`}
          >
            {usePortraitTreatment && portraitPhotoStyle.backdrop !== "none" && (
              <Image
                src={selectedPhoto.src}
                alt=""
                fill
                unoptimized
                sizes="22vw"
                aria-hidden="true"
                className="travel-postcard-main-photo-backdrop"
              />
            )}
            <Image
              src={selectedPhoto.src}
              alt={selectedPhoto.caption || `${entry.city} travel photograph`}
              fill
              unoptimized
              sizes="22vw"
              priority
              className="travel-postcard-main-photo-image"
              style={{ objectFit: usePortraitTreatment ? portraitPhotoStyle.fit : "cover" }}
              onLoad={(event) => {
                const orientation = event.currentTarget.naturalHeight > event.currentTarget.naturalWidth
                  ? "portrait"
                  : "landscape";
                setPhotoOrientations((current) => current[selectedPhoto.src] === orientation
                  ? current
                  : { ...current, [selectedPhoto.src]: orientation });
              }}
            />
          </button>
        ) : (
          <span>{ui.noPhotos}</span>
        )}
      </div>
      <div className="travel-postcard-thumbnails" aria-label={`${entry.city} photographs`}>
        {galleryPhotos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            className={index === photoIndex ? "is-active" : ""}
            onClick={() => onPhotoSelect(index)}
            aria-label={`Show photo ${index + 1} of ${entry.city}`}
            aria-pressed={index === photoIndex}
          >
            <Image
              src={photo.src}
              alt={photo.caption || `${entry.city} travel photograph ${index + 1}`}
              fill
              unoptimized
              sizes="80px"
            />
          </button>
        ))}
      </div>
      <div className="travel-postcard-content" role="tabpanel">
        {tab === "photos" && selectedPhoto?.caption && <p>{selectedPhoto.caption}</p>}
        {tab === "notes" && entry.memory && <p>{entry.memory}</p>}
        {tab === "details" && (
          <div className="travel-postcard-details">
            {entry.tags.length > 0 && <p>{entry.tags.map((tag) => `#${tag}`).join("  ")}</p>}
          </div>
        )}
      </div>
      <dl className="travel-postcard-metadata">
        {displayedDate && <div className="travel-postcard-date">
          <dt>
            {isHudPostcard && <CalendarDays className="travel-postcard-metadata-icon" aria-hidden="true" />}
            <span>{ui.date}</span>
          </dt>
          <dd>{displayedDate}</dd>
        </div>}
        {displayedRating && <div className="travel-postcard-rating">
          <dt>
            {isHudPostcard && <Star className="travel-postcard-metadata-icon" aria-hidden="true" />}
            <span>{ui.rating}</span>
          </dt>
          <dd aria-label={entry.rating !== undefined ? `${entry.rating} out of 5` : undefined}>
            {displayedRating}
          </dd>
        </div>}
        <div className="travel-postcard-location">
          <dt>
            {isHudPostcard && <MapPin className="travel-postcard-metadata-icon" aria-hidden="true" />}
            <span>{ui.place}</span>
          </dt>
          <dd>{locationText}</dd>
        </div>
      </dl>
      </div>
      {theme.assets.postcardOverlay && (
        <Image
          src={theme.assets.postcardOverlay}
          alt=""
          fill
          sizes="24vw"
          aria-hidden="true"
          className="travel-postcard-overlay"
        />
      )}
    </aside>
  );
}
