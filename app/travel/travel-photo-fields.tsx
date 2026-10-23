"use client";

/* Local browser previews; no remote upload client or authentication. */

import {
  useState,
  type ChangeEvent,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from "react";
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Images, X } from "lucide-react";
import {
  MAX_TRAVEL_IMAGE_BYTES,
  MAX_TRAVEL_IMAGE_LONG_EDGE,
  TRAVEL_IMAGE_ACCEPT,
} from "./travel-image-config";
import {
  TravelImageError,
  prepareTravelImage,
  releaseTravelImagePreview,
  type TravelImageDraft,
} from "./travel-image-upload";

type TravelPhotoFieldsProps = {
  cover: TravelImageDraft | null;
  photos: TravelImageDraft[];
  maxPhotos: number;
  showPhotoDates?: boolean;
  disabled?: boolean;
  onCoverChange: (cover: TravelImageDraft | null) => void;
  onPhotosChange: Dispatch<SetStateAction<TravelImageDraft[]>>;
  onBusyChange: (isBusy: boolean) => void;
  onDraftChange: () => void;
};

function imageErrorMessage(error: unknown) {
  return error instanceof TravelImageError
    ? error.message
    : "The browser could not prepare this image.";
}

function fileIdentity(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function formattedImageSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function TravelPhotoFields({
  cover,
  photos,
  maxPhotos,
  showPhotoDates = false,
  disabled = false,
  onCoverChange,
  onPhotosChange,
  onBusyChange,
  onDraftChange,
}: TravelPhotoFieldsProps) {
  const [isPreparing, setIsPreparing] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [photoErrors, setPhotoErrors] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const controlsDisabled = disabled || isPreparing;

  function setPreparing(nextValue: boolean) {
    setIsPreparing(nextValue);
    onBusyChange(nextValue);
  }

  async function prepareCover(files: FileList | File[]) {
    const file = Array.from(files)[0];
    if (!file || controlsDisabled) return;

    setPreparing(true);
    setCoverError(null);
    onDraftChange();
    try {
      const nextCover = await prepareTravelImage(file);
      releaseTravelImagePreview(cover);
      onCoverChange(nextCover);
    } catch (error) {
      console.error("Failed to prepare Travel cover image:", error);
      setCoverError(imageErrorMessage(error));
    } finally {
      setPreparing(false);
    }
  }

  async function preparePhotos(files: FileList | File[]) {
    if (controlsDisabled) return;

    const existingFiles = new Set(photos.flatMap((photo) => (
      photo.kind === "new" ? [fileIdentity(photo.file)] : []
    )));
    const incomingFiles = Array.from(files).filter((file) => !existingFiles.has(fileIdentity(file)));
    const availableSlots = maxPhotos - photos.length;
    const selectedFiles = incomingFiles.slice(0, availableSlots);
    const nextErrors: string[] = [];

    if (incomingFiles.length < Array.from(files).length) {
      nextErrors.push("Duplicate photos were skipped.");
    }
    if (incomingFiles.length > availableSlots) {
      nextErrors.push(`This gallery supports up to ${maxPhotos} travel photos.`);
    }
    if (selectedFiles.length === 0) {
      setPhotoErrors(nextErrors);
      return;
    }

    setPreparing(true);
    setPhotoErrors(nextErrors);
    onDraftChange();
    const results = await Promise.allSettled(selectedFiles.map((file) => prepareTravelImage(file)));
    const prepared: TravelImageDraft[] = [];

    results.forEach((result) => {
      if (result.status === "fulfilled") prepared.push(result.value);
      else {
        console.error("Failed to prepare Travel photo:", result.reason);
        nextErrors.push(imageErrorMessage(result.reason));
      }
    });

    if (prepared.length > 0) {
      onPhotosChange((currentPhotos) => {
        const currentFileIds = new Set(currentPhotos.flatMap((photo) => (
          photo.kind === "new" ? [fileIdentity(photo.file)] : []
        )));
        const remainingSlots = maxPhotos - currentPhotos.length;
        const additions = prepared
          .filter((photo) => photo.kind === "new" && !currentFileIds.has(fileIdentity(photo.file)))
          .slice(0, remainingSlots);
        return additions.length > 0 ? [...currentPhotos, ...additions] : currentPhotos;
      });
    }
    setPhotoErrors([...nextErrors]);
    setPreparing(false);
  }

  function removeCover() {
    releaseTravelImagePreview(cover);
    onCoverChange(null);
    setCoverError(null);
    onDraftChange();
  }

  function removePhoto(id: string) {
    const removed = photos.find((photo) => photo.id === id);
    releaseTravelImagePreview(removed);
    onPhotosChange(photos.filter((photo) => photo.id !== id));
    setPhotoErrors([]);
    onDraftChange();
  }

  function movePhoto(id: string, direction: -1 | 1) {
    const currentIndex = photos.findIndex((photo) => photo.id === id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= photos.length) return;

    const nextPhotos = [...photos];
    const [movedPhoto] = nextPhotos.splice(currentIndex, 1);
    nextPhotos.splice(nextIndex, 0, movedPhoto);
    onPhotosChange(nextPhotos);
    onDraftChange();
  }

  function updatePhoto(id: string, patch: Partial<TravelImageDraft>) {
    onPhotosChange((current) => current.map((photo) => (
      photo.id === id ? { ...photo, ...patch } as TravelImageDraft : photo
    )));
    onDraftChange();
  }

  function promoteToCover(id: string) {
    const nextCover = photos.find((photo) => photo.id === id);
    if (!nextCover) return;
    releaseTravelImagePreview(cover);
    onCoverChange(nextCover);
    onPhotosChange((current) => current.filter((photo) => photo.id !== id));
    onDraftChange();
  }

  function reorderPhoto(activeId: string, overId: string) {
    if (activeId === overId) return;
    const fromIndex = photos.findIndex((photo) => photo.id === activeId);
    const toIndex = photos.findIndex((photo) => photo.id === overId);
    if (fromIndex < 0 || toIndex < 0) return;

    const nextPhotos = [...photos];
    const [movedPhoto] = nextPhotos.splice(fromIndex, 1);
    nextPhotos.splice(toIndex, 0, movedPhoto);
    onPhotosChange(nextPhotos);
    onDraftChange();
  }

  function handlePhotoDrop(event: DragEvent<HTMLElement>, overId?: string) {
    event.preventDefault();
    event.stopPropagation();

    if (overId && draggingId) {
      reorderPhoto(draggingId, overId);
      setDraggingId(null);
      return;
    }

    if (event.dataTransfer.files.length > 0) void preparePhotos(event.dataTransfer.files);
  }

  function resetInput(event: ChangeEvent<HTMLInputElement>) {
    event.currentTarget.value = "";
  }

  return (
    <div className="travel-photo-fields">
      <section className={`travel-upload-section travel-cover-upload${cover ? " has-preview" : ""}`}>
        <div className="travel-upload-heading">
          <div>
            <span>Cover Image</span>
            <small>One photograph for the postcard</small>
          </div>
          {cover && (
            <button type="button" onClick={removeCover} disabled={controlsDisabled}>
              <X size={12} aria-hidden="true" /> Remove
            </button>
          )}
        </div>

        {cover ? (
          <div
            className={`travel-cover-preview is-${cover.status}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void prepareCover(event.dataTransfer.files);
            }}
          >
            <img src={cover.previewUrl} alt={`Preview of ${cover.originalName}`} />
            <div className="travel-cover-preview-copy">
              <strong>{cover.originalName}</strong>
              <span>
                {cover.width} × {cover.height}px
                {cover.kind === "new" ? ` · ${formattedImageSize(cover.file.size)}` : " · saved"}
              </span>
              <label>
                Replace photograph
                <input
                  type="file"
                  accept={TRAVEL_IMAGE_ACCEPT}
                  disabled={controlsDisabled}
                  onChange={(event) => {
                    void prepareCover(event.target.files ?? []);
                    resetInput(event);
                  }}
                />
              </label>
            </div>
            {cover.status === "uploading" && (
              <div className="travel-upload-progress" aria-label={`Uploading ${cover.originalName}: ${cover.progress}%`}>
                <span style={{ width: `${cover.progress}%` }} />
              </div>
            )}
            {cover.error && <p className="travel-image-item-error">{cover.error}</p>}
          </div>
        ) : (
          <label
            className="travel-upload-note"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void prepareCover(event.dataTransfer.files);
            }}
          >
            <ImagePlus size={18} aria-hidden="true" />
            <strong>{isPreparing ? "Preparing photograph…" : "Drop one image here"}</strong>
            <small>or choose a file</small>
            <input
              type="file"
              accept={TRAVEL_IMAGE_ACCEPT}
              disabled={controlsDisabled}
              onChange={(event) => {
                void prepareCover(event.target.files ?? []);
                resetInput(event);
              }}
            />
          </label>
        )}
        {coverError && <p className="travel-upload-error" role="alert">{coverError}</p>}
      </section>

      <section className={`travel-upload-section travel-photos-upload${photos.length ? " has-preview" : ""}`}>
        <div className="travel-upload-heading">
          <div>
            <span>Travel Photos</span>
            <small>{photos.length} / {maxPhotos} arranged for the scrapbook</small>
          </div>
        </div>

        <label
          className="travel-upload-note travel-photo-dropzone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handlePhotoDrop(event)}
        >
          <Images size={18} aria-hidden="true" />
          <strong>{isPreparing ? "Preparing photographs…" : photos.length ? "Add more photographs" : "Drop photos here"}</strong>
          <small>or choose multiple files</small>
          <input
            type="file"
            accept={TRAVEL_IMAGE_ACCEPT}
            multiple
            disabled={controlsDisabled || photos.length >= maxPhotos}
            onChange={(event) => {
              void preparePhotos(event.target.files ?? []);
              resetInput(event);
            }}
          />
        </label>

        {photos.length > 0 && (
          <>
            <div className="travel-photo-strip" aria-label="Travel photos in scrapbook order">
              {photos.map((photo, index) => (
                <article
                  className={`travel-photo-preview is-${photo.status}${draggingId === photo.id ? " is-dragging" : ""}`}
                  key={photo.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handlePhotoDrop(event, photo.id)}
                >
                  <img src={photo.previewUrl} alt={`Travel photo ${index + 1}: ${photo.originalName}`} />
                  <span className="travel-photo-order">{String(index + 1).padStart(2, "0")}</span>
                  <button
                    className="travel-photo-remove"
                    type="button"
                    disabled={controlsDisabled}
                    onClick={() => removePhoto(photo.id)}
                    aria-label={`Remove ${photo.originalName}`}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                  <button
                    className="travel-photo-drag"
                    type="button"
                    draggable={!controlsDisabled}
                    disabled={controlsDisabled}
                    onDragStart={(event) => {
                      setDraggingId(photo.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", photo.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    aria-label={`Drag ${photo.originalName} to reorder`}
                    title="Drag to reorder"
                  >
                    <GripVertical size={13} aria-hidden="true" />
                  </button>
                  <div className="travel-photo-move-buttons">
                    <button
                      type="button"
                      disabled={controlsDisabled || index === 0}
                      onClick={() => movePhoto(photo.id, -1)}
                      aria-label={`Move ${photo.originalName} earlier`}
                    >
                      <ArrowLeft size={11} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={controlsDisabled || index === photos.length - 1}
                      onClick={() => movePhoto(photo.id, 1)}
                      aria-label={`Move ${photo.originalName} later`}
                    >
                      <ArrowRight size={11} aria-hidden="true" />
                    </button>
                  </div>
                  {photo.status === "uploading" && (
                    <div className="travel-upload-progress" aria-label={`Uploading ${photo.originalName}: ${photo.progress}%`}>
                      <span style={{ width: `${photo.progress}%` }} />
                    </div>
                  )}
                  {photo.error && <span className="travel-photo-error-mark" title={photo.error}>!</span>}
                </article>
              ))}
            </div>
            <div className="travel-photo-metadata-list">
              {photos.map((photo, index) => (
                <div className="travel-photo-metadata" key={photo.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <input
                    type="text"
                    value={photo.caption}
                    maxLength={500}
                    placeholder="Photo caption"
                    disabled={controlsDisabled}
                    onChange={(event) => updatePhoto(photo.id, { caption: event.target.value })}
                    aria-label={`Caption for photo ${index + 1}`}
                  />
                  {showPhotoDates && (
                    <>
                      <input
                        type="number"
                        min="0"
                        max="9999"
                        placeholder="Year"
                        value={photo.year ?? ""}
                        disabled={controlsDisabled}
                        onChange={(event) => updatePhoto(photo.id, {
                          year: event.target.value ? Number(event.target.value) : undefined,
                        })}
                        aria-label={`Year for photo ${index + 1}`}
                      />
                      <select
                        value={photo.month ?? ""}
                        disabled={controlsDisabled}
                        onChange={(event) => updatePhoto(photo.id, {
                          month: event.target.value ? Number(event.target.value) : undefined,
                        })}
                        aria-label={`Month for photo ${index + 1}`}
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, month) => (
                          <option key={month + 1} value={month + 1}>{String(month + 1).padStart(2, "0")}</option>
                        ))}
                      </select>
                    </>
                  )}
                  <button type="button" disabled={controlsDisabled} onClick={() => promoteToCover(photo.id)}>
                    Use as cover
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {photoErrors.length > 0 && (
          <div className="travel-upload-error" role="alert">
            {photoErrors.map((error) => <p key={error}>{error}</p>)}
          </div>
        )}
      </section>

      <p className="travel-upload-limits">
        JPEG, PNG or WebP · {MAX_TRAVEL_IMAGE_BYTES / 1024 / 1024} MB each · images over {MAX_TRAVEL_IMAGE_LONG_EDGE}px are gently resized
      </p>
    </div>
  );
}
