import type { TravelImage, TravelPhoto } from "./travel-storage";
import {
  MAX_TRAVEL_IMAGE_BYTES,
  MAX_TRAVEL_IMAGE_LONG_EDGE,
  isTravelImageMimeType,
} from "./travel-image-config";

export type TravelImageRole = "cover" | "photo";
export type TravelImageDraftStatus = "ready" | "uploading" | "uploaded" | "error";

export type PreparedTravelImage = {
  kind: "new";
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  originalName: string;
  originalSize: number;
  progress: number;
  status: TravelImageDraftStatus;
  error: string | null;
  caption: string;
  year?: number;
  month?: number;
};

export type PersistedTravelImageDraft = {
  kind: "persisted";
  id: string;
  previewUrl: string;
  width: number;
  height: number;
  originalName: string;
  progress: number;
  status: "uploaded";
  error: null;
  caption: string;
  year?: number;
  month?: number;
  image: TravelImage;
};

export type TravelImageDraft = PreparedTravelImage | PersistedTravelImageDraft;


type PrepareTravelImageOptions = {
  preserveOriginal?: boolean;
};


export class TravelImageError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code = "IMAGE_ERROR", status?: number) {
    super(message);
    this.name = "TravelImageError";
    this.code = code;
    this.status = status;
  }
}


function createImageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `travel-image-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatFileSize(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

function validateTravelImage(file: File) {
  if (!isTravelImageMimeType(file.type)) {
    const isHeic = file.type === "image/heic"
      || file.type === "image/heif"
      || /\.hei[cf]$/i.test(file.name);
    throw new TravelImageError(
      isHeic
        ? `${file.name}: HEIC is not supported yet. Export it as JPEG, PNG, or WebP.`
        : `${file.name}: choose a JPEG, PNG, or WebP image.`,
      "INVALID_IMAGE_TYPE",
    );
  }

  if (file.size > MAX_TRAVEL_IMAGE_BYTES) {
    throw new TravelImageError(
      `${file.name}: ${formatFileSize(file.size)} exceeds the 12 MB limit.`,
      "FILE_TOO_LARGE",
    );
  }
}

async function decodeImageWithElement(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const image = new window.Image();
  image.decoding = "async";
  image.src = objectUrl;

  try {
    await image.decode();
    return {
      source: image as CanvasImageSource,
      width: image.naturalWidth,
      height: image.naturalHeight,
      cleanup: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

async function decodeImage(file: File) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap as CanvasImageSource,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      // Safari support for ImageBitmap options varies; the image element path also honors EXIF.
    }
  }

  return decodeImageWithElement(file);
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob>((resolve, reject) => {
    const quality = type === "image/png" ? undefined : 0.9;
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new TravelImageError("The browser could not prepare this image.", "IMAGE_PREPARATION_FAILED"));
    }, type, quality);
  });
}

async function prepareFileForWeb(file: File, options: PrepareTravelImageOptions) {
  let decoded: Awaited<ReturnType<typeof decodeImage>>;
  try {
    decoded = await decodeImage(file);
  } catch (error) {
    console.error("Failed to decode Travel image:", error);
    throw new TravelImageError(
      `${file.name}: the browser could not read this image.`,
      "IMAGE_DECODE_FAILED",
    );
  }

  try {
    if (options.preserveOriginal) {
      return { file, width: decoded.width, height: decoded.height };
    }

    const longEdge = Math.max(decoded.width, decoded.height);
    if (longEdge <= MAX_TRAVEL_IMAGE_LONG_EDGE) {
      return { file, width: decoded.width, height: decoded.height };
    }

    const scale = MAX_TRAVEL_IMAGE_LONG_EDGE / longEdge;
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new TravelImageError("The browser could not prepare this image.", "IMAGE_PREPARATION_FAILED");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(decoded.source, 0, 0, width, height);
    const blob = await canvasToBlob(canvas, file.type);
    const preparedFile = new File([blob], file.name, {
      type: file.type,
      lastModified: file.lastModified,
    });

    return { file: preparedFile, width, height };
  } finally {
    decoded.cleanup();
  }
}

export async function prepareTravelImage(
  file: File,
  options: PrepareTravelImageOptions = {},
): Promise<PreparedTravelImage> {
  validateTravelImage(file);
  const prepared = await prepareFileForWeb(file, options);

  return {
    kind: "new",
    id: createImageId(),
    file: prepared.file,
    previewUrl: URL.createObjectURL(prepared.file),
    width: prepared.width,
    height: prepared.height,
    originalName: file.name,
    originalSize: file.size,
    progress: 0,
    status: "ready",
    error: null,
    caption: "",
  };
}

export function createPersistedTravelImageDraft(
  image: TravelImage,
  metadata?: Pick<TravelPhoto, "caption" | "year" | "month">,
): PersistedTravelImageDraft {
  return {
    kind: "persisted",
    id: image.id,
    previewUrl: image.src,
    width: image.width,
    height: image.height,
    originalName: metadata?.caption || "Saved photograph",
    progress: 100,
    status: "uploaded",
    error: null,
    caption: metadata?.caption ?? "",
    ...(metadata?.year !== undefined ? { year: metadata.year } : {}),
    ...(metadata?.month !== undefined ? { month: metadata.month } : {}),
    image,
  };
}

export function releaseTravelImagePreview(image: TravelImageDraft | null | undefined) {
  if (image?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(image.previewUrl);
}

