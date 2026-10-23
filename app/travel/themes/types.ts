import type { TravelEntryType } from "../travel-storage";

export type TravelThemeId =
  | "parchment"
  | "cyber"
  | "deep-sea"
  | "ice-world"
  | "fairy-tale";

export type TravelBrandLayout = "left" | "center";

export type TravelGlobeMaterial = "antique" | "crystalline";

export type TravelGlobeRenderMode = "texture-only" | "themed";

export type TravelGlobeTextureLayout = {
  aspectRatio: number;
  coverageScale?: number;
  horizontalTravelRatio: number;
};

export type TravelGlobeLabelStyle = {
  color: string;
  filter?: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  opacity: number;
};

export type TravelGlobeSurfaceStyle = {
  atmosphereEdge?: string;
  atmosphereHighlight?: string;
  coastStroke?: string;
  coastStrokeWidth?: number;
  coastGlowInnerOpacity?: number;
  coastGlowInnerStroke?: string;
  coastGlowInnerWidth?: number;
  coastGlowOuterOpacity?: number;
  coastGlowOuterStroke?: string;
  coastGlowOuterWidth?: number;
  countryStroke?: string;
  countryStrokeWidth?: number;
  graticuleOpacity?: number;
  graticuleStepDegrees?: number;
  graticuleStroke?: string;
  graticuleStrokeWidth?: number;
  haloBright?: string;
  haloDistantFilter?: string;
  haloDistantOpacity?: number;
  haloDim?: string;
  haloMid?: string;
  haloNearFilter?: string;
  haloNearOpacity?: number;
  landBloomFill?: string;
  landBloomFilter?: string;
  landBloomOpacity?: number;
  landFill?: string;
  landFilter?: string;
  landLight?: string;
  landTextureBlendMode?: string;
  landTextureFilter?: string;
  landTextureOpacity?: number;
  oceanEdge?: string;
  oceanHighlight?: string;
  oceanMid?: string;
  oceanTextureBlendMode?: string;
  oceanTextureFilter?: string;
  oceanTextureOpacity?: number;
  reflectionEdge?: string;
  rimBright?: string;
  rimDim?: string;
  rimLightFilter?: string;
  rimLightOpacity?: number;
  rimLightStrokeWidth?: number;
  rimMid?: string;
  rimStroke?: string;
  rimStrokeWidth?: number;
  shadow?: string;
};

export type TravelTimelineFrameSlices = {
  centerWidthCqw: number;
  endcapWidthCqw: number;
  naturalWidthCqw: number;
  stretchBackgroundWidthCqw: number;
  stretchWidthCqw: number;
};

export type TravelTimelineVisuals = {
  frame: "asset" | "hud";
  layout?: {
    arrowImageScale?: number;
    arrowSizeCqw?: number;
    arrowYcqw?: number;
    frameScaleY?: number;
    frameSlices?: TravelTimelineFrameSlices;
    hudTrackInsetCqw?: number;
    labelOffsetCqw?: number;
    nextArrowImageScale?: number;
    pointDiameterPx?: number;
    pointImageOffsetYPx?: number;
    pointImageScale?: number;
    previousArrowImageScale?: number;
    selectedImageOffsetYPx?: number;
    selectedImageScale?: number;
    selectedSizePx?: number;
    trackYPercent?: number;
  };
  point: "asset" | "hud";
  structure: "v2";
};

export type TravelThemeAssets = {
  background: string;
  buttonFrames?: Record<"sm" | "md" | "lg", string>;
  globe?: {
    landTexture?: string;
    oceanTexture?: string;
  };
  legendFrame?: string;
  legendMarkers?: Record<TravelEntryType, string>;
  landTexture?: string;
  mapFrame?: string;
  mapViewButtons?: {
    atlas: string;
    globe: string;
  };
  markers?: Record<TravelEntryType, string>;
  postcardFrame?: string;
  postcardOverlay?: string;
  switcher?: string;
  timelineShell?: string;
  toolButtonFrames?: Record<"sm" | "md" | "lg", string>;
  timeline?: {
    active?: string;
    frame?: string;
    next?: string;
    point?: string;
    previous?: string;
    selected?: string;
    track?: string;
  };
  zoomControl?: string;
};

export type TravelThemeRenderers = {
  button: "asset" | "hud";
  legend: "asset" | "hud";
  map: "ink" | "investigation" | "neon";
  marker: "asset" | "hud";
  postcard: "asset" | "hud";
  switcher: "asset" | "compass" | "energy-core" | "string-light";
  timeline: "asset" | "hud";
  zoom: "asset" | "hud";
};

export type TravelThemeVisuals = {
  globe?: {
    labels: TravelGlobeLabelStyle;
    material: TravelGlobeMaterial;
    renderMode?: TravelGlobeRenderMode;
    surface?: TravelGlobeSurfaceStyle;
    textureLayout?: {
      land?: TravelGlobeTextureLayout;
      ocean?: TravelGlobeTextureLayout;
    };
  };
  markerScale: Record<TravelEntryType, number>;
  postcard: {
    portraitPhoto: {
      backdrop: "cool-blur" | "none" | "warm-blur";
      fit: "cover" | "contain";
    };
  };
  timeline: TravelTimelineVisuals;
};

export type TravelThemeCapabilities = {
  globe: boolean;
  mapDetail: boolean;
};

type TravelThemeMetadata = {
  id: TravelThemeId;
  label: string;
  labelZh: string;
};

export type AvailableTravelTheme = TravelThemeMetadata & {
  available: true;
  brandLayout: TravelBrandLayout;
  capabilities: TravelThemeCapabilities;
  rootClassName: string;
  assets: TravelThemeAssets;
  renderers: TravelThemeRenderers;
  visuals: TravelThemeVisuals;
};

export type TravelThemeDefinition = AvailableTravelTheme;
