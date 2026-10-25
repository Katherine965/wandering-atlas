"use client";

import {
  geoContains,
  geoDistance,
  geoGraticule,
  geoOrthographic,
  geoPath,
  type GeoProjection,
} from "d3-geo";
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { lazy, Suspense, useEffect, useEffectEvent, useRef, useState } from "react";
import type {
  AvailableTravelTheme,
  TravelGlobeMaterial,
  TravelGlobeSurfaceStyle,
  TravelGlobeTextureLayout,
} from "../themes/types";
import type { TravelEntry } from "../travel-storage";
import {
  getCountryId,
  TRAVEL_GLOBE_GEOMETRY,
  TRAVEL_VIEWBOX_HEIGHT,
  TRAVEL_VIEWBOX_WIDTH,
  type TravelGeoFeatureCollection,
  type TravelGlobeRotation,
  type TravelProjectedPoint,
} from "../travel-geometry";
import type { TravelCopperGlobeSurfaceHandle } from "./TravelCopperGlobeSurface";
import type { TravelFairyFeltGlobeSurfaceHandle } from "./TravelFairyFeltGlobeSurface";
import {
  TravelGlobeGeographicLabels,
  type TravelGlobeGeographicLabelsHandle,
} from "./TravelGlobeGeographicLabels";
import {
  TravelMarkerLayer,
  type TravelMarkerLayerHandle,
} from "./TravelMarkerLayer";

// Mobile's SVG projection never needs to download or initialize Three.js surfaces.
const TravelCopperGlobeSurface = lazy(() => import("./TravelCopperGlobeSurface").then(module => ({ default: module.TravelCopperGlobeSurface })));
const TravelFairyFeltGlobeSurface = lazy(() => import("./TravelFairyFeltGlobeSurface").then(module => ({ default: module.TravelFairyFeltGlobeSurface })));

type GlobeDragState = {
  pointerId: number;
  startRotation: [number, number, number];
  startX: number;
  startY: number;
};

type TravelGlobeProps = {
  ariaLabel: string;
  countryGeoJson: TravelGeoFeatureCollection | null;
  initialRotation: TravelGlobeRotation;
  landmassGeoJson: TravelGeoFeatureCollection | null;
  material: TravelGlobeMaterial;
  mobile?: boolean;
  onCountrySelect?: (countryId: string) => void;
  selectedCountryId?: string | null;
  onBackgroundClick: () => void;
  onPlaceSelect: (place: TravelEntry) => void;
  onRotationCommit: (rotation: TravelGlobeRotation) => void;
  places: TravelEntry[];
  selectedId: string | null;
  showCountryBorders: boolean;
  showOutline: boolean;
  theme: AvailableTravelTheme;
};

const GLOBE_AUTO_ROTATION_DEGREES_PER_SECOND = 2.4;
const GLOBE_AUTO_ROTATION_MAX_DELTA_MS = 64;
const GLOBE_AUTO_ROTATION_RESUME_DELAY_MS = 2000;
const GLOBE_DRAG_SENSITIVITY = 0.22;
const GLOBE_DRAG_THRESHOLD = 3;
const GLOBE_LABEL_FADE_START_RADIANS = 45 * Math.PI / 180;
const GLOBE_MAX_LATITUDE_ROTATION = 75;
const GLOBE_PROJECTION_PRECISION = 0.8;
const GLOBE_SPHERE = { type: "Sphere" } as const;

function getGlobeSurfaceStyle(surface?: TravelGlobeSurfaceStyle): CSSProperties {
  if (!surface) return {};

  return {
    "--travel-globe-ocean-highlight": surface.oceanHighlight,
    "--travel-globe-ocean-mid": surface.oceanMid,
    "--travel-globe-ocean-edge": surface.oceanEdge,
    "--travel-globe-ocean-texture-opacity": surface.oceanTextureOpacity,
    "--travel-globe-ocean-texture-blend-mode": surface.oceanTextureBlendMode,
    "--travel-globe-ocean-texture-filter": surface.oceanTextureFilter,
    "--travel-globe-atmosphere-highlight": surface.atmosphereHighlight,
    "--travel-globe-atmosphere-edge": surface.atmosphereEdge,
    "--travel-globe-halo-dim": surface.haloDim,
    "--travel-globe-halo-mid": surface.haloMid,
    "--travel-globe-halo-bright": surface.haloBright,
    "--travel-globe-halo-distant-opacity": surface.haloDistantOpacity,
    "--travel-globe-halo-distant-filter": surface.haloDistantFilter,
    "--travel-globe-halo-near-opacity": surface.haloNearOpacity,
    "--travel-globe-halo-near-filter": surface.haloNearFilter,
    "--travel-globe-reflection-edge": surface.reflectionEdge,
    "--travel-globe-land-fill": surface.landFill,
    "--travel-globe-land-light": surface.landLight,
    "--travel-globe-land-bloom-fill": surface.landBloomFill,
    "--travel-globe-land-bloom-opacity": surface.landBloomOpacity,
    "--travel-globe-land-bloom-filter": surface.landBloomFilter,
    "--travel-globe-country-stroke": surface.countryStroke,
    "--travel-globe-country-stroke-width": surface.countryStrokeWidth,
    "--travel-globe-graticule-stroke": surface.graticuleStroke,
    "--travel-globe-graticule-stroke-width": surface.graticuleStrokeWidth,
    "--travel-globe-graticule-opacity": surface.graticuleOpacity,
    "--travel-globe-coast-glow-outer-stroke": surface.coastGlowOuterStroke,
    "--travel-globe-coast-glow-outer-opacity": surface.coastGlowOuterOpacity,
    "--travel-globe-coast-glow-outer-width": surface.coastGlowOuterWidth,
    "--travel-globe-coast-glow-inner-stroke": surface.coastGlowInnerStroke,
    "--travel-globe-coast-glow-inner-opacity": surface.coastGlowInnerOpacity,
    "--travel-globe-coast-glow-inner-width": surface.coastGlowInnerWidth,
    "--travel-globe-coast-stroke": surface.coastStroke,
    "--travel-globe-coast-stroke-width": surface.coastStrokeWidth,
    "--travel-globe-rim-stroke": surface.rimStroke,
    "--travel-globe-rim-stroke-width": surface.rimStrokeWidth,
    "--travel-globe-rim-dim": surface.rimDim,
    "--travel-globe-rim-mid": surface.rimMid,
    "--travel-globe-rim-bright": surface.rimBright,
    "--travel-globe-rim-light-opacity": surface.rimLightOpacity,
    "--travel-globe-rim-light-filter": surface.rimLightFilter,
    "--travel-globe-rim-light-stroke-width": surface.rimLightStrokeWidth,
    "--travel-globe-shadow": surface.shadow,
    "--travel-globe-texture-opacity": surface.landTextureOpacity,
    "--travel-globe-texture-blend-mode": surface.landTextureBlendMode,
    "--travel-globe-texture-filter": surface.landTextureFilter,
    "--travel-globe-land-filter": surface.landFilter,
  } as CSSProperties;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeLongitude(value: number) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function getLabelEdgeOpacity(angularDistance: number) {
  const horizon = Math.PI / 2;
  if (angularDistance <= GLOBE_LABEL_FADE_START_RADIANS) return 1;
  if (angularDistance >= horizon) return 0;

  const progress = (horizon - angularDistance)
    / (horizon - GLOBE_LABEL_FADE_START_RADIANS);
  return progress * progress;
}

function createGlobeProjection(rotation: [number, number, number]): GeoProjection {
  return geoOrthographic()
    .translate([TRAVEL_GLOBE_GEOMETRY.centerX, TRAVEL_GLOBE_GEOMETRY.centerY])
    .scale(TRAVEL_GLOBE_GEOMETRY.diameter / 2)
    .clipAngle(90)
    .precision(GLOBE_PROJECTION_PRECISION)
    .rotate(rotation);
}

function createTexturePattern(
  rotation: TravelGlobeRotation,
  layout?: TravelGlobeTextureLayout,
) {
  const diameter = TRAVEL_GLOBE_GEOMETRY.diameter;
  const offsetX = Math.sin(rotation[0] * Math.PI / 180)
    * diameter * (layout?.horizontalTravelRatio ?? 0.18);
  const offsetY = Math.sin(rotation[1] * Math.PI / 180) * diameter * 0.06;

  if (layout) {
    const height = diameter * (layout.coverageScale ?? 1);
    const width = height * layout.aspectRatio;
    return {
      height,
      width,
      x: TRAVEL_GLOBE_GEOMETRY.centerX - width / 2 + offsetX,
      y: TRAVEL_GLOBE_GEOMETRY.centerY - height / 2 + offsetY,
    };
  }

  return {
    height: diameter * 1.25,
    width: diameter * 2,
    x: TRAVEL_GLOBE_GEOMETRY.centerX - diameter + offsetX,
    y: TRAVEL_GLOBE_GEOMETRY.centerY - diameter * 0.625 + offsetY,
  };
}

function setPathData(
  elements: Array<SVGPathElement | null>,
  pathData: string | undefined,
) {
  for (const element of elements) {
    if (!element) continue;
    if (pathData) element.setAttribute("d", pathData);
    else element.removeAttribute("d");
  }
}

function setTexturePosition(
  element: SVGImageElement | null,
  pattern: ReturnType<typeof createTexturePattern>,
) {
  if (!element) return;
  element.setAttribute("x", String(pattern.x));
  element.setAttribute("y", String(pattern.y));
}

class TravelGlobeRenderer {
  readonly path: ReturnType<typeof geoPath>;
  readonly projection: GeoProjection;
  readonly spherePath: string | undefined;
  rotation: TravelGlobeRotation;
  rotationDirty = false;
  targetRotation: TravelGlobeRotation;

  constructor(initialRotation: TravelGlobeRotation) {
    this.projection = createGlobeProjection(initialRotation);
    this.path = geoPath(this.projection);
    this.spherePath = this.path(GLOBE_SPHERE) ?? undefined;
    this.rotation = initialRotation;
    this.targetRotation = initialRotation;
  }

  applyRotation(rotation: TravelGlobeRotation) {
    this.rotation = rotation;
    this.targetRotation = rotation;
    this.rotationDirty = false;
    this.projection.rotate(rotation);
  }

  applyTargetRotation() {
    this.applyRotation(this.targetRotation);
  }

  setTargetRotation(rotation: TravelGlobeRotation) {
    this.targetRotation = rotation;
    this.rotationDirty = true;
  }
}

export function TravelGlobe({
  ariaLabel,
  countryGeoJson,
  initialRotation,
  landmassGeoJson,
  material,
  mobile = false,
  onCountrySelect,
  selectedCountryId = null,
  onBackgroundClick,
  onPlaceSelect,
  onRotationCommit,
  places,
  selectedId,
  showCountryBorders,
  showOutline,
  theme,
}: TravelGlobeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCopperSurfaceReady, setIsCopperSurfaceReady] = useState(false);
  const [isFairyFeltDebug, setIsFairyFeltDebug] = useState(false);
  const [isFairyFeltSurfaceReady, setIsFairyFeltSurfaceReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mobileZoom, setMobileZoom] = useState(1);
  const mobileZoomRef = useRef(1);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const scheduleRenderRef = useRef<(() => void) | null>(null);
  const [renderer] = useState(() => new TravelGlobeRenderer(initialRotation));
  const dragRef = useRef<GlobeDragState | null>(null);
  const previousFrameRef = useRef<number | null>(null);
  const resumeAutoRotationAtRef = useRef(0);
  const suppressClickRef = useRef(false);
  const onRotationCommitRef = useRef(onRotationCommit);
  const markerLayerRef = useRef<TravelMarkerLayerHandle | null>(null);
  const geographicLabelsRef = useRef<TravelGlobeGeographicLabelsHandle | null>(null);
  const copperSurfaceRef = useRef<TravelCopperGlobeSurfaceHandle | null>(null);
  const fairyFeltSurfaceRef = useRef<TravelFairyFeltGlobeSurfaceHandle | null>(null);
  const landGeometryRef = useRef<SVGPathElement | null>(null);
  const countriesRef = useRef<SVGPathElement | null>(null);
  const graticulePathRef = useRef<SVGPathElement | null>(null);
  const interactionSvgRef = useRef<SVGSVGElement | null>(null);
  const selectedCountryRef = useRef<SVGPathElement | null>(null);
  const landTextureRef = useRef<SVGImageElement | null>(null);
  const oceanTextureRef = useRef<SVGImageElement | null>(null);
  const projection = renderer.projection;
  const path = renderer.path;

  const textureLayout = theme.visuals.globe?.textureLayout;
  const globeLandTexture = mobile ? undefined : theme.assets.globe?.landTexture;
  const globeOceanTexture = mobile ? undefined : theme.assets.globe?.oceanTexture;
  const globeSurfaceStyle = mobile ? {} : getGlobeSurfaceStyle(theme.visuals.globe?.surface);
  const surface = theme.visuals.globe?.surface;
  const isTextureOnly = !mobile && theme.visuals.globe?.renderMode === "texture-only";
  const isProceduralCopper = !mobile && theme.id === "parchment";
  const isFairyFelt = !mobile && theme.id === "fairy-tale";
  const useDetailedFairyFelt = isFairyFelt && !prefersReducedMotion;
  const useProceduralCopper = isProceduralCopper && isCopperSurfaceReady;
  const useProceduralFairyFelt = isFairyFelt && isFairyFeltSurfaceReady;
  const graticuleStepDegrees = mobile ? 30 : surface?.graticuleStepDegrees ?? 10;
  const hasGraticule = mobile || !isTextureOnly
    && Boolean(surface?.graticuleStroke);
  const hasLandBloom = !mobile && !isTextureOnly
    && (surface?.landBloomOpacity ?? (material === "crystalline" ? 0.3 : 0)) > 0;
  const hasCoastGlowOuter = !mobile && !isTextureOnly
    && (surface?.coastGlowOuterOpacity ?? 0) > 0;
  const hasCoastGlowInner = !mobile && !isTextureOnly
    && (surface?.coastGlowInnerOpacity ?? 0) > 0;
  const graticuleGeometry = geoGraticule()
    .step([graticuleStepDegrees, graticuleStepDegrees])();
  const spherePath = renderer.spherePath;
  const graticulePath = hasGraticule
    ? path(graticuleGeometry) ?? undefined
    : undefined;
  const landPath = landmassGeoJson ? path(landmassGeoJson) ?? undefined : undefined;
  const countryPath = !isTextureOnly && !useProceduralCopper
    && showCountryBorders && countryGeoJson
    ? path(countryGeoJson) ?? undefined
    : undefined;
  const selectedCountry = mobile && selectedCountryId
    ? countryGeoJson?.features.find((feature, index) => getCountryId(feature.properties, index) === selectedCountryId)
    : undefined;
  const selectedCountryPath = selectedCountry ? path(selectedCountry) ?? undefined : undefined;
  const globeCenter = projection.invert?.([
    TRAVEL_GLOBE_GEOMETRY.centerX,
    TRAVEL_GLOBE_GEOMETRY.centerY,
  ]) ?? [10, 18];
  const globeRadius = TRAVEL_GLOBE_GEOMETRY.diameter / 2;
  const getFairyLandReliefTransform = (scale: number) => (
    `translate(${TRAVEL_GLOBE_GEOMETRY.centerX} ${TRAVEL_GLOBE_GEOMETRY.centerY}) `
    + `scale(${scale}) `
    + `translate(${-TRAVEL_GLOBE_GEOMETRY.centerX} ${-TRAVEL_GLOBE_GEOMETRY.centerY})`
  );
  const landMaterialPattern = createTexturePattern(
    renderer.rotation,
    textureLayout?.land,
  );
  const oceanMaterialPattern = createTexturePattern(
    renderer.rotation,
    textureLayout?.ocean,
  );

  const renderRotation = useEffectEvent((nextRotation: TravelGlobeRotation) => {
    projection.rotate(nextRotation);
    copperSurfaceRef.current?.updateRotation(nextRotation);
    fairyFeltSurfaceRef.current?.updateRotation(nextRotation);

    const nextLandPath = landmassGeoJson && landGeometryRef.current
      ? path(landmassGeoJson) ?? undefined
      : undefined;
    setPathData([landGeometryRef.current], nextLandPath);

    const nextCountryPath = countryGeoJson && countriesRef.current
      ? path(countryGeoJson) ?? undefined
      : undefined;
    setPathData([countriesRef.current], nextCountryPath);

    const nextGraticulePath = graticulePathRef.current
      ? path(graticuleGeometry) ?? undefined
      : undefined;
    setPathData([graticulePathRef.current], nextGraticulePath);
    setPathData([selectedCountryRef.current], selectedCountry ? path(selectedCountry) ?? undefined : undefined);

    if (globeOceanTexture) {
      setTexturePosition(
        oceanTextureRef.current,
        createTexturePattern(nextRotation, textureLayout?.ocean),
      );
    }
    if (globeLandTexture) {
      setTexturePosition(
        landTextureRef.current,
        createTexturePattern(nextRotation, textureLayout?.land),
      );
    }

    const nextGlobeCenter = projection.invert?.([
      TRAVEL_GLOBE_GEOMETRY.centerX,
      TRAVEL_GLOBE_GEOMETRY.centerY,
    ]) ?? [10, 18];

    markerLayerRef.current?.updateProjectedPoints(({ latitude, longitude }) => {
      const projected = projection([longitude, latitude]);
      const visible = Boolean(projected)
        && geoDistance([longitude, latitude], nextGlobeCenter) < Math.PI / 2 - 1e-6;
      const projectionScale = useProceduralFairyFelt ? 1.04 : 1;

      return {
        x: projected
          ? TRAVEL_GLOBE_GEOMETRY.centerX
            + (projected[0] - TRAVEL_GLOBE_GEOMETRY.centerX) * projectionScale
          : TRAVEL_GLOBE_GEOMETRY.centerX,
        y: projected
          ? TRAVEL_GLOBE_GEOMETRY.centerY
            + (projected[1] - TRAVEL_GLOBE_GEOMETRY.centerY) * projectionScale
          : TRAVEL_GLOBE_GEOMETRY.centerY,
        visible,
      };
    });

    geographicLabelsRef.current?.updateProjectedPoints(({ latitude, longitude }) => {
      const projected = projection([longitude, latitude]);
      const angularDistance = geoDistance([longitude, latitude], nextGlobeCenter);
      const visible = Boolean(projected) && angularDistance < Math.PI / 2 - 1e-6;

      return {
        x: projected?.[0] ?? TRAVEL_GLOBE_GEOMETRY.centerX,
        y: projected?.[1] ?? TRAVEL_GLOBE_GEOMETRY.centerY,
        visible,
        opacity: visible ? getLabelEdgeOpacity(angularDistance) : 0,
      };
    });
  });

  useEffect(() => {
    onRotationCommitRef.current = onRotationCommit;
  }, [onRotationCommit]);

  useEffect(() => () => {
    onRotationCommitRef.current(renderer.rotation);
  }, [renderer]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!mobile) return;
    const svg = interactionSvgRef.current;
    if (!svg) return;
    // Keep pinch gestures on the globe instead of also zooming the browser viewport.
    // Single taps remain native clicks for country selection.
    const preventViewportPinch = (event: TouchEvent) => {
      if (event.touches.length > 1 && event.cancelable) event.preventDefault();
    };
    svg.addEventListener("touchstart", preventViewportPinch, { passive: false });
    svg.addEventListener("touchmove", preventViewportPinch, { passive: false });
    return () => {
      svg.removeEventListener("touchstart", preventViewportPinch);
      svg.removeEventListener("touchmove", preventViewportPinch);
    };
  }, [mobile]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const isDebug = isFairyFelt
        && process.env.NODE_ENV !== "production"
        && new URLSearchParams(window.location.search).get("feltDebug") === "1";
      setIsFairyFeltDebug(isDebug);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isFairyFelt]);

  useEffect(() => {
    previousFrameRef.current = null;
    let animationFrame: number | null = null;

    function scheduleAnimationFrame() {
      if (animationFrame === null && document.visibilityState === "visible") {
        animationFrame = window.requestAnimationFrame(animate);
      }
    }

    function handleVisibilityChange() {
      previousFrameRef.current = null;
      if (document.visibilityState === "hidden") {
        if (animationFrame !== null) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        return;
      }

      scheduleAnimationFrame();
    }

    function animate(timestamp: number) {
      animationFrame = null;
      const previousTimestamp = previousFrameRef.current;
      previousFrameRef.current = timestamp;
      let nextRotation = renderer.rotation;
      let shouldRender = renderer.rotationDirty;

      if (
        !mobile
        && !prefersReducedMotion
        && !isFairyFeltDebug
        && previousTimestamp !== null
        && dragRef.current === null
        && timestamp >= resumeAutoRotationAtRef.current
      ) {
        const deltaMs = Math.min(
          Math.max(timestamp - previousTimestamp, 0),
          GLOBE_AUTO_ROTATION_MAX_DELTA_MS,
        );

        if (deltaMs > 0) {
          nextRotation = [
            normalizeLongitude(
              nextRotation[0]
                + deltaMs * GLOBE_AUTO_ROTATION_DEGREES_PER_SECOND / 1000,
            ),
            nextRotation[1],
            nextRotation[2],
          ];
          shouldRender = true;
        }
      } else if (renderer.rotationDirty) {
        nextRotation = renderer.targetRotation;
      }

      if (shouldRender) {
        renderer.applyRotation(nextRotation);
        renderRotation(nextRotation);
      }

      if (!mobile) scheduleAnimationFrame();
    }

    scheduleRenderRef.current = scheduleAnimationFrame;
    document.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleAnimationFrame();

    return () => {
      scheduleRenderRef.current = null;
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      previousFrameRef.current = null;
    };
  }, [isFairyFeltDebug, mobile, prefersReducedMotion, renderer]);

  function projectCoordinates({ latitude, longitude }: NonNullable<TravelEntry["coordinates"]>): TravelProjectedPoint {
    const projected = projection([longitude, latitude]);
    const visible = Boolean(projected)
      && geoDistance([longitude, latitude], globeCenter) < Math.PI / 2 - 1e-6;
    const projectionScale = useProceduralFairyFelt ? 1.04 : 1;

    return {
      x: projected
        ? TRAVEL_GLOBE_GEOMETRY.centerX
          + (projected[0] - TRAVEL_GLOBE_GEOMETRY.centerX) * projectionScale
        : TRAVEL_GLOBE_GEOMETRY.centerX,
      y: projected
        ? TRAVEL_GLOBE_GEOMETRY.centerY
          + (projected[1] - TRAVEL_GLOBE_GEOMETRY.centerY) * projectionScale
        : TRAVEL_GLOBE_GEOMETRY.centerY,
      visible,
    };
  }

  function projectLabelCoordinates({ latitude, longitude }: {
    latitude: number;
    longitude: number;
  }) {
    const projected = projection([longitude, latitude]);
    const angularDistance = geoDistance([longitude, latitude], globeCenter);
    const visible = Boolean(projected) && angularDistance < Math.PI / 2 - 1e-6;

    return {
      x: projected?.[0] ?? TRAVEL_GLOBE_GEOMETRY.centerX,
      y: projected?.[1] ?? TRAVEL_GLOBE_GEOMETRY.centerY,
      visible,
      opacity: visible ? getLabelEdgeOpacity(angularDistance) : 0,
    };
  }

  function handlePointerDown(event: ReactPointerEvent<SVGPathElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    if (mobile) {
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointersRef.current.size === 2) {
        const [a, b] = [...pointersRef.current.values()];
        pinchRef.current = { distance: Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1), zoom: mobileZoomRef.current };
        dragRef.current = null;
        suppressClickRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }
    }

    resumeAutoRotationAtRef.current = Number.POSITIVE_INFINITY;
    previousFrameRef.current = null;
    suppressClickRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startRotation: renderer.rotation,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<SVGPathElement>) {
    if (mobile && pointersRef.current.has(event.pointerId)) {
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pinchRef.current && pointersRef.current.size === 2) {
        const [a, b] = [...pointersRef.current.values()];
        const zoom = clamp(pinchRef.current.zoom * Math.hypot(a.x - b.x, a.y - b.y) / pinchRef.current.distance, 1, 1.6);
        mobileZoomRef.current = zoom;
        setMobileZoom(zoom);
        return;
      }
    }
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.hypot(deltaX, deltaY) >= GLOBE_DRAG_THRESHOLD) {
      suppressClickRef.current = true;
    }

    renderer.setTargetRotation([
      normalizeLongitude(drag.startRotation[0] + deltaX * GLOBE_DRAG_SENSITIVITY / (mobile ? mobileZoomRef.current : 1)),
      clamp(
        drag.startRotation[1] - deltaY * GLOBE_DRAG_SENSITIVITY / (mobile ? mobileZoomRef.current : 1),
        -GLOBE_MAX_LATITUDE_ROTATION,
        GLOBE_MAX_LATITUDE_ROTATION,
      ),
      0,
    ]);
    scheduleRenderRef.current?.();
  }

  function finishDrag(event: ReactPointerEvent<SVGPathElement>) {
    if (mobile && pointersRef.current.has(event.pointerId)) {
      pointersRef.current.delete(event.pointerId);
      if (pinchRef.current) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        pinchRef.current = null;
        const remaining = [...pointersRef.current.entries()][0];
        dragRef.current = remaining ? {
          pointerId: remaining[0], startX: remaining[1].x, startY: remaining[1].y, startRotation: renderer.rotation,
        } : null;
        setIsDragging(Boolean(remaining));
        return;
      }
    }
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    // Flush the last pointer movement before going idle; there is no mobile RAF loop.
    if (mobile) scheduleRenderRef.current?.();
    else renderer.applyTargetRotation();
    resumeAutoRotationAtRef.current = performance.now() + GLOBE_AUTO_ROTATION_RESUME_DELAY_MS;
    previousFrameRef.current = null;
    setIsDragging(false);
  }

  function handleBackgroundClick(event: ReactMouseEvent<SVGPathElement>) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onBackgroundClick();
    if (mobile && onCountrySelect && countryGeoJson) {
      const svg = event.currentTarget.ownerSVGElement;
      const matrix = svg?.getScreenCTM();
      if (!svg || !matrix) return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const coordinates = projection.invert?.([point.x, point.y]);
      if (!coordinates) return;
      const index = countryGeoJson.features.findIndex(feature => geoContains(feature, coordinates));
      if (index >= 0) {
        const id = getCountryId(countryGeoJson.features[index].properties, index);
        onCountrySelect(id === "TWN" ? "CHN" : id);
      }
    }
  }

  return (
    <div
      className={`travel-globe-map${isDragging ? " is-dragging" : ""}${isFairyFeltDebug ? " is-fairy-felt-debug" : ""}`}
      data-globe-material={material}
      data-globe-render-mode={mobile ? "mobile-lite" : theme.visuals.globe?.renderMode ?? "themed"}
      data-globe-surface={useProceduralFairyFelt ? "needle-felt-geometry" : "svg"}
      style={{ ...globeSurfaceStyle, "--travel-marker-scale": 1, "--travel-globe-zoom": mobile ? mobileZoom : 1 } as CSSProperties}
      role="group"
      aria-label={ariaLabel}
    >
      <div className="travel-globe-content">
      {mobile && <div className="travel-mobile-globe-sphere" aria-hidden="true" />}
      <Suspense fallback={null}>
      {isProceduralCopper && (
        <TravelCopperGlobeSurface
          countryGeoJson={countryGeoJson}
          initialRotation={initialRotation}
          landmassGeoJson={landmassGeoJson}
          onReadyChange={setIsCopperSurfaceReady}
          ref={copperSurfaceRef}
          showCountryBorders={showCountryBorders}
          showOutline={showOutline}
        />
      )}
      {isFairyFelt && globeLandTexture && globeOceanTexture && (
        <TravelFairyFeltGlobeSurface
          countryGeoJson={countryGeoJson}
          initialRotation={initialRotation}
          landTextureUrl={globeLandTexture}
          landmassGeoJson={landmassGeoJson}
          oceanTextureUrl={globeOceanTexture}
          onReadyChange={setIsFairyFeltSurfaceReady}
          prefersReducedMotion={prefersReducedMotion}
          ref={fairyFeltSurfaceRef}
          showCountryBorders={showCountryBorders}
          showOutline={showOutline}
        />
      )}
      </Suspense>
      {!mobile && (
      <svg
        aria-hidden="true"
        className="travel-globe-svg travel-globe-static-backdrop"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${TRAVEL_VIEWBOX_WIDTH} ${TRAVEL_VIEWBOX_HEIGHT}`}
      >
        <defs>
          <radialGradient id="travel-globe-ocean" cx="34%" cy="28%" r="72%">
            <stop className="travel-globe-ocean-stop is-highlight" offset="0" />
            <stop className="travel-globe-ocean-stop is-mid" offset=".56" />
            <stop className="travel-globe-ocean-stop is-edge" offset="1" />
          </radialGradient>
          <linearGradient id="travel-globe-halo-light" x1="0" y1="0" x2="1" y2="1">
            <stop className="travel-globe-halo-stop is-dim" offset="0" />
            <stop className="travel-globe-halo-stop is-bright" offset=".28" />
            <stop className="travel-globe-halo-stop is-mid" offset=".58" />
            <stop className="travel-globe-halo-stop is-bright" offset=".84" />
            <stop className="travel-globe-halo-stop is-dim" offset="1" />
          </linearGradient>
        </defs>
        {!isTextureOnly && (
          <>
            <ellipse
              className="travel-globe-shadow"
              cx={TRAVEL_GLOBE_GEOMETRY.centerX}
              cy={TRAVEL_GLOBE_GEOMETRY.centerY + globeRadius * 1.08}
              rx={globeRadius * 0.82}
              ry={globeRadius * 0.09}
            />
            <ellipse
              className="travel-globe-halo is-distant"
              cx={TRAVEL_GLOBE_GEOMETRY.centerX - globeRadius * 0.045}
              cy={TRAVEL_GLOBE_GEOMETRY.centerY - globeRadius * 0.035}
              rx={globeRadius * 1.04}
              ry={globeRadius * 1.035}
            />
            <ellipse
              className="travel-globe-halo is-near"
              cx={TRAVEL_GLOBE_GEOMETRY.centerX - globeRadius * 0.018}
              cy={TRAVEL_GLOBE_GEOMETRY.centerY - globeRadius * 0.022}
              rx={globeRadius * 1.014}
              ry={globeRadius * 1.012}
            />
            {!useProceduralCopper && !useProceduralFairyFelt && (
              <path className="travel-globe-ocean" d={spherePath} />
            )}
          </>
        )}
      </svg>
      )}

      <svg
        aria-hidden="true"
        className="travel-globe-svg travel-globe-rotating-geography"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${TRAVEL_VIEWBOX_WIDTH} ${TRAVEL_VIEWBOX_HEIGHT}`}
      >
        <defs>
          {spherePath && (
            <clipPath id="travel-globe-sphere-clip" clipPathUnits="userSpaceOnUse">
              <path d={spherePath} />
            </clipPath>
          )}
          {landPath && (
            <>
              <path id="travel-globe-land-geometry" d={landPath} ref={landGeometryRef} />
              <clipPath id="travel-globe-land-clip" clipPathUnits="userSpaceOnUse">
                <use href="#travel-globe-land-geometry" />
              </clipPath>
            </>
          )}
          {isFairyFelt && (
            <>
              <linearGradient
                id="travel-globe-fairy-land-light"
                x1="12%"
                x2="88%"
                y1="8%"
                y2="92%"
              >
                <stop offset="0" stopColor="rgba(255, 255, 246, .25)" />
                <stop offset=".42" stopColor="rgba(255, 248, 232, .055)" />
                <stop offset=".72" stopColor="rgba(183, 153, 169, .025)" />
                <stop offset="1" stopColor="rgba(137, 111, 142, .1)" />
              </linearGradient>
              <linearGradient
                id="travel-globe-fairy-fiber-light"
                x1="8%"
                x2="92%"
                y1="6%"
                y2="94%"
              >
                <stop offset="0" stopColor="rgba(255, 252, 235, .78)" />
                <stop offset=".48" stopColor="rgba(255, 247, 228, .52)" />
                <stop offset="1" stopColor="rgba(230, 215, 218, .28)" />
              </linearGradient>
            </>
          )}
          {hasCoastGlowOuter && (
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height={TRAVEL_GLOBE_GEOMETRY.diameter + 64}
              id="travel-globe-coast-glow-outer"
              width={TRAVEL_GLOBE_GEOMETRY.diameter + 64}
              x={TRAVEL_GLOBE_GEOMETRY.centerX - globeRadius - 32}
              y={TRAVEL_GLOBE_GEOMETRY.centerY - globeRadius - 32}
            >
              <feGaussianBlur stdDeviation="5.5" />
            </filter>
          )}
          {hasCoastGlowInner && (
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height={TRAVEL_GLOBE_GEOMETRY.diameter + 64}
              id="travel-globe-coast-glow-inner"
              width={TRAVEL_GLOBE_GEOMETRY.diameter + 64}
              x={TRAVEL_GLOBE_GEOMETRY.centerX - globeRadius - 32}
              y={TRAVEL_GLOBE_GEOMETRY.centerY - globeRadius - 32}
            >
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
          )}
        </defs>

        {!useProceduralFairyFelt && globeOceanTexture && (
          <g clipPath="url(#travel-globe-sphere-clip)">
            <image
              className="travel-globe-ocean-texture"
              href={globeOceanTexture}
              preserveAspectRatio="xMidYMid slice"
              ref={oceanTextureRef}
              {...oceanMaterialPattern}
            />
          </g>
        )}
        {isFairyFelt && !useProceduralFairyFelt && landPath && (
          <g
            className="travel-globe-fairy-land-relief"
            clipPath="url(#travel-globe-sphere-clip)"
          >
            {useDetailedFairyFelt && (
              <use
                className="travel-globe-fairy-land-shell is-outer"
                href="#travel-globe-land-geometry"
                transform={getFairyLandReliefTransform(1.02)}
              />
            )}
            <use
              className="travel-globe-fairy-land-shell is-inner"
              href="#travel-globe-land-geometry"
              transform={getFairyLandReliefTransform(1.01)}
            />
          </g>
        )}
        {!useProceduralCopper && !isFairyFelt && hasLandBloom && landPath && (
          <use className="travel-globe-land-bloom" href="#travel-globe-land-geometry" />
        )}
        {isFairyFelt && !useProceduralFairyFelt && landPath && (
          <use
            className="travel-globe-fairy-land-edge-shadow"
            clipPath="url(#travel-globe-sphere-clip)"
            href="#travel-globe-land-geometry"
          />
        )}
        {landPath && !useProceduralFairyFelt && (
          <g className="travel-globe-land-stack" clipPath="url(#travel-globe-land-clip)">
            {!isTextureOnly && !useProceduralCopper && (
              <use className="travel-globe-land" href="#travel-globe-land-geometry" />
            )}
            {globeLandTexture ? (
              <image
                className="travel-globe-land-texture"
                href={globeLandTexture}
                preserveAspectRatio="xMidYMid slice"
                ref={landTextureRef}
                {...landMaterialPattern}
              />
            ) : !mobile && theme.assets.landTexture ? (
              <image
                className="travel-globe-land-texture"
                height={TRAVEL_GLOBE_GEOMETRY.diameter}
                href={theme.assets.landTexture}
                preserveAspectRatio="xMidYMid slice"
                width={TRAVEL_GLOBE_GEOMETRY.diameter}
                x={TRAVEL_GLOBE_GEOMETRY.centerX - globeRadius}
                y={TRAVEL_GLOBE_GEOMETRY.centerY - globeRadius}
              />
            ) : null}
            {!mobile && !isTextureOnly && !useProceduralCopper && (
              <use className="travel-globe-land-light" href="#travel-globe-land-geometry" />
            )}
          </g>
        )}
        {useDetailedFairyFelt && !useProceduralFairyFelt && landPath && (
          <use
            className="travel-globe-fairy-land-fibers"
            clipPath="url(#travel-globe-sphere-clip)"
            href="#travel-globe-land-geometry"
          />
        )}
        {!useProceduralFairyFelt && hasGraticule && graticulePath && (
          <path
            className="travel-globe-graticule"
            clipPath="url(#travel-globe-sphere-clip)"
            d={graticulePath}
            ref={graticulePathRef}
          />
        )}
        {!useProceduralCopper && !useProceduralFairyFelt
          && showOutline && hasCoastGlowOuter && landPath && (
          <use
            className="travel-globe-coastline-glow is-outer"
            filter="url(#travel-globe-coast-glow-outer)"
            href="#travel-globe-land-geometry"
          />
        )}
        {!useProceduralCopper && !useProceduralFairyFelt
          && showOutline && hasCoastGlowInner && landPath && (
          <use
            className="travel-globe-coastline-glow is-inner"
            filter="url(#travel-globe-coast-glow-inner)"
            href="#travel-globe-land-geometry"
          />
        )}
        {!isTextureOnly && !useProceduralCopper && !useProceduralFairyFelt
          && showCountryBorders && countryPath && (
          <path className="travel-globe-countries" d={countryPath} ref={countriesRef} />
        )}
        {mobile && selectedCountryPath && <path className="travel-globe-selected-country" d={selectedCountryPath} ref={selectedCountryRef} />}
        {!isTextureOnly && !useProceduralCopper && !useProceduralFairyFelt
          && showOutline && landPath && (
          <use className="travel-globe-coastline" href="#travel-globe-land-geometry" />
        )}
        {!mobile && !isTextureOnly && theme.visuals.globe?.labels && (
          <TravelGlobeGeographicLabels
            projectCoordinates={projectLabelCoordinates}
            ref={geographicLabelsRef}
            style={theme.visuals.globe.labels}
          />
        )}
      </svg>

      {!mobile && !isTextureOnly && !useProceduralCopper && !useProceduralFairyFelt && (
        <svg
          aria-hidden="true"
          className="travel-globe-svg travel-globe-static-foreground"
          preserveAspectRatio="xMidYMid meet"
          viewBox={`0 0 ${TRAVEL_VIEWBOX_WIDTH} ${TRAVEL_VIEWBOX_HEIGHT}`}
        >
          <defs>
            <radialGradient id="travel-globe-atmosphere" cx="31%" cy="24%" r="78%">
              <stop className="travel-globe-atmosphere-stop is-highlight" offset="0" />
              <stop className="travel-globe-atmosphere-stop is-edge" offset="1" />
            </radialGradient>
            <linearGradient id="travel-globe-reflection" x1="0" y1="0" x2="0" y2="1">
              <stop className="travel-globe-reflection-stop is-clear" offset=".54" />
              <stop className="travel-globe-reflection-stop is-edge" offset="1" />
            </linearGradient>
            <linearGradient id="travel-globe-rim-light" x1="0" y1="0" x2=".88" y2="1">
              <stop className="travel-globe-rim-stop is-dim" offset="0" />
              <stop className="travel-globe-rim-stop is-bright" offset=".22" />
              <stop className="travel-globe-rim-stop is-mid" offset=".55" />
              <stop className="travel-globe-rim-stop is-bright" offset=".8" />
              <stop className="travel-globe-rim-stop is-dim" offset="1" />
            </linearGradient>
          </defs>
          <path className="travel-globe-reflection" d={spherePath} />
          <path className="travel-globe-atmosphere" d={spherePath} />
          <path className="travel-globe-rim" d={spherePath} />
          <path className="travel-globe-rim-light" d={spherePath} />
        </svg>
      )}

      <svg
        aria-hidden="true"
        className="travel-globe-svg travel-globe-interaction"
        ref={interactionSvgRef}
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${TRAVEL_VIEWBOX_WIDTH} ${TRAVEL_VIEWBOX_HEIGHT}`}
      >
        <path
          className="travel-globe-hit-surface"
          d={spherePath}
          onClick={handleBackgroundClick}
          onPointerCancel={finishDrag}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          transform={useProceduralFairyFelt
            ? getFairyLandReliefTransform(1.06)
            : undefined}
        />
      </svg>

      <TravelMarkerLayer
        onPlaceSelect={onPlaceSelect}
        places={places}
        projectCoordinates={projectCoordinates}
        ref={markerLayerRef}
        selectedId={selectedId}
        theme={theme}
        viewBoxHeight={TRAVEL_VIEWBOX_HEIGHT}
        viewBoxWidth={TRAVEL_VIEWBOX_WIDTH}
      />
      </div>
      {mobile && selectedCountry && <span className="travel-mobile-country-label" role="status">{String(selectedCountry.properties?.NAME ?? selectedCountryId)}</span>}
    </div>
  );
}
