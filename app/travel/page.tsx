"use client";

import Image from "@/app/components/Image";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Flag, MapPin, X } from "lucide-react";
import { listEntries } from "./travel-data-source";
import { TravelAtlasStage } from "./components/TravelAtlasStage";
import { TravelButton } from "./components/TravelButton";
import { TravelHeader } from "./components/TravelHeader";
import { TravelLegend } from "./components/TravelLegend";
import { TravelLightbox } from "./components/TravelLightbox";
import { TravelGlobe } from "./components/TravelGlobe";
import { TravelMap } from "./components/TravelMap";
import {
  TravelMapDetailToggle,
  type TravelMapDetailMode,
} from "./components/TravelMapDetailToggle";
import { TravelPostcard, type PostcardTab } from "./components/TravelPostcard";
import { TravelTimeline } from "./components/TravelTimeline";
import { TravelZoomControl } from "./components/TravelZoomControl";
import { getTravelTheme } from "./themes/registry";
import type { TravelThemeId } from "./themes/types";
import { useTravelTheme } from "./themes/use-travel-theme";
import { createAtlasPaths, createCountryAtlasPath, createCountryAtlasPaths, createCountryFocusTransform, getCountryDisplayName, getCountryIdForName, projectAtlasCoordinates, unprojectAtlasPoint, TRAVEL_ATLAS_BOUNDS, TRAVEL_GLOBE_INITIAL_ROTATION, TRAVEL_VIEWBOX_HEIGHT, TRAVEL_VIEWBOX_WIDTH, type TravelCountryPath, type TravelGeoFeatureCollection, type TravelGeoPath, type TravelGlobeRotation } from "./travel-geometry";
import type { TravelEntry, TravelImage, TravelPhoto } from "./travel-storage";
import {
  clampTravelYear,
  createTravelYearRange,
  filterTravelEntries,
  getDefaultFocusedYear,
  getTravelYearRange,
  type TravelTimeMode,
  type TravelTimeState,
} from "./travel-time";

type TravelLocale = "en" | "zh";
type TravelMapView = "atlas" | "globe";
type AtlasScope =
  | { kind: "world" }
  | { kind: "country"; countryId: string; countryName: string };

const TRAVEL_UI_COPY = {
  en: {
    title: "Wandering Atlas",
    subtitle: "A PERSONAL TRAVEL ARCHIVE",
    atlasView: "Atlas View",
    globeView: "Globe View",
    journey: "Journey",
    location: "Location",
    markPlace: "Mark a Place",
    beginJourney: "Begin a Journey",
    openArchive: "Open the Archive",
    toolsUnavailable: "Display only — unavailable in the read-only candidate",
    photos: "Photos",
    notes: "Notes",
    details: "Details",
    date: "Date",
    rating: "Rating",
    place: "Location",
    noPhotos: "No photographs yet",
    openScrapbook: "Open full scrapbook",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    previousYear: "Previous year",
    nextYear: "Next year",
    timeline: "Travel timeline",
    allYears: "All Years",
    yearMode: "Year",
    backToWorld: "Back to World",
    exploreCountry: "Explore",
  },
  zh: {
    title: "漫游图志",
    subtitle: "个人旅行档案",
    atlasView: "平面图志",
    globeView: "地球视图",
    journey: "旅程",
    location: "地点",
    markPlace: "标记地点",
    beginJourney: "开启旅程",
    openArchive: "翻阅档案",
    toolsUnavailable: "仅展示 — 只读版本暂不可用",
    photos: "照片",
    notes: "随记",
    details: "详情",
    date: "日期",
    rating: "评分",
    place: "地点",
    noPhotos: "尚无照片",
    openScrapbook: "翻阅完整影集",
    zoomIn: "放大地图",
    zoomOut: "缩小地图",
    previousYear: "上一年份",
    nextYear: "下一年份",
    timeline: "旅行时间轴",
    allYears: "全部年份",
    yearMode: "年份",
    backToWorld: "返回世界地图",
    exploreCountry: "探索",
  },
} as const;

const VIEWBOX_WIDTH = TRAVEL_VIEWBOX_WIDTH;
const VIEWBOX_HEIGHT = TRAVEL_VIEWBOX_HEIGHT;
const MAP_BOUNDS = TRAVEL_ATLAS_BOUNDS;
const MAP_ZOOM_MIN = 0.75;
const MAP_ZOOM_DEFAULT = 1;
const MAP_ZOOM_MAX = 2.75;
const MAP_ZOOM_STEP = 0.25;
const MAP_CENTER_X = MAP_BOUNDS.left + MAP_BOUNDS.width / 2;
const MAP_CENTER_Y = MAP_BOUNDS.top + MAP_BOUNDS.height / 2;
const CURATED_PLACES = listEntries();
const LocalWorkspace = __ATLAS_LOCAL__ ? lazy(() => import("./components/TravelLocalWorkspace")) : null;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatYearMonth(year?: number, month?: number) {
  if (year === undefined) return "";
  return month === undefined ? String(year) : `${year}-${String(month).padStart(2, "0")}`;
}

function formatEntryDate(entry: TravelEntry) {
  const start = formatYearMonth(entry.startYear ?? entry.year, entry.startMonth) || entry.date || "";
  if (entry.type === "journey") return start;
  const end = formatYearMonth(entry.endYear, entry.endMonth);
  return `${start || "Unknown start"} — ${end || "Present"}`;
}

function groupLocationPhotos(photos: TravelPhoto[]) {
  const groups = new Map<string, TravelPhoto[]>();
  for (const photo of photos) {
    const key = photo.year !== undefined && photo.month !== undefined
      ? `${photo.year}-${String(photo.month).padStart(2, "0")}`
      : "Unsorted";
    const group = groups.get(key) ?? [];
    group.push(photo);
    groups.set(key, group);
  }
  return [...groups.entries()].sort(([first], [second]) => {
    if (first === "Unsorted") return 1;
    if (second === "Unsorted") return -1;
    return first.localeCompare(second);
  });
}

function travelImagesMatch(first: TravelImage, second: TravelImage) {
  return first.storageKey === second.storageKey || first.src === second.src;
}

function getSortedTravelPhotos(entry: TravelEntry) {
  return [...entry.photos].sort((first, second) => first.order - second.order);
}

function getTravelGalleryPhotos(entry: TravelEntry) {
  const photos = getSortedTravelPhotos(entry);
  if (!entry.coverImage || photos.some((photo) => travelImagesMatch(photo, entry.coverImage!))) {
    return photos;
  }

  return [{ ...entry.coverImage, caption: "", order: 0 }, ...photos];
}

function getDefaultPostcardPhotoIndex(entry: TravelEntry) {
  if (!entry.coverImage) return 0;
  const coverIndex = getTravelGalleryPhotos(entry)
    .findIndex((photo) => travelImagesMatch(photo, entry.coverImage!));
  return coverIndex >= 0 ? coverIndex : 0;
}

function formatCoordinate(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
}

function getMapTransform(zoom: number) {
  const centerX = (MAP_CENTER_X / VIEWBOX_WIDTH) * 100;
  const centerY = (MAP_CENTER_Y / VIEWBOX_HEIGHT) * 100;
  return `translate(${centerX}%, ${centerY}%) scale(${zoom}) translate(${-centerX}%, ${-centerY}%)`;
}

export default function TravelPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [atlasScope, setAtlasScope] = useState<AtlasScope>({ kind: "world" });
  const [worldLandmassGeoJson, setWorldLandmassGeoJson] = useState<TravelGeoFeatureCollection | null>(null);
  const [worldCountryGeoJson, setWorldCountryGeoJson] = useState<TravelGeoFeatureCollection | null>(null);
  const [worldLandmassPaths, setWorldLandmassPaths] = useState<TravelGeoPath[]>([]);
  const [worldCountryPaths, setWorldCountryPaths] = useState<TravelCountryPath[]>([]);
  const [countryDetailCache, setCountryDetailCache] = useState(
    () => new Map<string, TravelCountryPath>(),
  );
  const [isScrapbookOpen, setIsScrapbookOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [postcardPhotoIndex, setPostcardPhotoIndex] = useState(0);
  const [postcardTab, setPostcardTab] = useState<PostcardTab>("photos");
  const [travelLocale, setTravelLocale] = useState<TravelLocale>("en");
  const [travelThemeId, setTravelThemeId] = useTravelTheme();
  const [mapView, setMapView] = useState<TravelMapView>("atlas");
  const [globeRotation, setGlobeRotation] = useState<TravelGlobeRotation>(
    TRAVEL_GLOBE_INITIAL_ROTATION,
  );
  const [mapDetail, setMapDetail] = useState<TravelMapDetailMode>("borders");
  const [parchmentMapDetail, setParchmentMapDetail] = useState<
    Record<TravelMapDetailMode, boolean>
  >({ outline: true, borders: true });
  const [travelTime, setTravelTime] = useState<TravelTimeState>(() => ({
    mode: "all",
    focusedYear: getDefaultFocusedYear(CURATED_PLACES),
  }));
  const [mapZoom, setMapZoom] = useState(MAP_ZOOM_DEFAULT);
  const [isReturningToWorld, setIsReturningToWorld] = useState(false);
  const countryDetailGeoJsonRef = useRef<TravelGeoFeatureCollection | null>(null);
  const countryDetailRequestRef = useRef<Promise<TravelGeoFeatureCollection> | null>(null);
  const returnToWorldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [places, setPlaces] = useState(CURATED_PLACES);
  const [localReady, setLocalReady] = useState(false);
  const [localEditing, setLocalEditing] = useState(false);
  const [localRequest, setLocalRequest] = useState<{type:"journey"|"location"|"archive"|"edit";key:number;id?:string}|null>(null);
  const [localPicking, setLocalPicking] = useState(false);
  const [localPoint, setLocalPoint] = useState<{latitude:number;longitude:number;key:number}|null>(null);
  const receiveArchive = useCallback((archive:{places:TravelEntry[]}) => { setPlaces(archive.places); }, []);
  const receiveReady = useCallback((ready:boolean) => setLocalReady(ready), []);
  function openLocalTool(type:"journey"|"location"|"archive") { if (!localReady) return; if (type !== "archive") { closeSelectedPlace(); setMapView("atlas"); setAtlasScope({kind:"world"}); setSelectedCountryId(null); setTravelTime(t=>({...t,mode:"all"})); } setLocalRequest({type,key:Date.now()}); }
  const travelYearRange = getTravelYearRange(places);
  const timelineYears = createTravelYearRange(travelYearRange);
  const effectiveTravelTime = {
    ...travelTime,
    focusedYear: clampTravelYear(travelTime.focusedYear, travelYearRange),
  };
  const timelineFilteredPlaces = filterTravelEntries(places, effectiveTravelTime);
  const focusedCountry = atlasScope.kind === "country"
    ? countryDetailCache.get(atlasScope.countryId) ?? null
    : null;
  const visiblePlaces = focusedCountry
    ? timelineFilteredPlaces.filter((place) => (
      getCountryIdForName(place.country, worldCountryPaths) === focusedCountry.id
    ))
    : timelineFilteredPlaces;
  const selectedPlace = places.find((place) => place.id === selectedId);
  const selectedPhotos = selectedPlace ? getSortedTravelPhotos(selectedPlace) : [];
  const selectedGalleryPhotos: TravelPhoto[] = selectedPlace ? getTravelGalleryPhotos(selectedPlace) : [];
  const selectedPhotoCount = selectedGalleryPhotos.length;
  const selectedPhotoGroups = selectedPlace?.type === "location"
    ? groupLocationPhotos(selectedPhotos)
    : [];
  const countryFocusTransform = focusedCountry
    ? createCountryFocusTransform(focusedCountry.bounds)
    : { scale: 1, scaleY: 1, translateX: 0, translateY: 0 };
  const mapStyle = {
    "--travel-marker-scale-x": 1 / (mapZoom * countryFocusTransform.scale),
    "--travel-marker-scale-y": 1 / (mapZoom * countryFocusTransform.scaleY),
    "--travel-focus-outline-stroke-width": `${0.8 / (mapZoom * countryFocusTransform.scale)}px`,
    "--travel-cyber-country-stroke-width": `${0.42 / (mapZoom * countryFocusTransform.scale)}px`,
    "--travel-cyber-glow-stroke-width": `${2.2 / (mapZoom * countryFocusTransform.scale)}px`,
    "--travel-cyber-main-stroke-width": `${0.75 / (mapZoom * countryFocusTransform.scale)}px`,
    "--travel-cyber-core-stroke-width": `${0.16 / (mapZoom * countryFocusTransform.scale)}px`,
    transform: getMapTransform(mapZoom),
    ...(isReturningToWorld ? { transition: "none" } : {}),
  } as React.CSSProperties;
  const mapScopeStyle = {
    transform: `translate(${(countryFocusTransform.translateX / VIEWBOX_WIDTH) * 100}%, ${(countryFocusTransform.translateY / VIEWBOX_HEIGHT) * 100}%) scale(${countryFocusTransform.scale}, ${countryFocusTransform.scaleY})`,
    ...(isReturningToWorld ? { transition: "none" } : {}),
  } as React.CSSProperties;
  const worldMapStyle = focusedCountry ? {
    "--travel-marker-scale-x": 1,
    "--travel-marker-scale-y": 1,
    "--travel-focus-outline-stroke-width": "0.8px",
    "--travel-cyber-country-stroke-width": "0.42px",
    "--travel-cyber-glow-stroke-width": "2.2px",
    "--travel-cyber-main-stroke-width": "0.75px",
    "--travel-cyber-core-stroke-width": "0.16px",
    transform: getMapTransform(MAP_ZOOM_DEFAULT),
    transition: "none",
  } as React.CSSProperties : mapStyle;
  const worldMapScopeStyle = {
    transform: "translate(0%, 0%) scale(1, 1)",
    ...(isReturningToWorld || focusedCountry ? { transition: "none" } : {}),
  } as React.CSSProperties;
  const scopedCountryPaths = focusedCountry
    ? [{ ...focusedCountry, path: focusedCountry.focusPath }]
    : worldCountryPaths;
  const scopedLandmassPaths: TravelGeoPath[] = focusedCountry
    ? scopedCountryPaths
    : worldLandmassPaths;
  const projectMapCoordinates = focusedCountry
    ? (coordinates: NonNullable<TravelEntry["coordinates"]>) => (
      projectAtlasCoordinates(coordinates, focusedCountry.longitudeCenter)
    )
    : projectAtlasCoordinates;
  const selectedAtlasCountry = worldCountryPaths.find(
    (country) => country.id === selectedCountryId,
  ) ?? null;
  const selectedFocusCountry = selectedCountryId === null
    ? null
    : countryDetailCache.get(selectedCountryId) ?? null;
  const travelTheme = getTravelTheme(travelThemeId);
  const globeVisuals = travelTheme.visuals.globe;
  const supportsGlobe = travelTheme.capabilities.globe && globeVisuals !== undefined;
  const activeMapView: TravelMapView = mapView === "globe" && supportsGlobe ? "globe" : "atlas";
  const canUseGlobe = supportsGlobe;
  const supportsMapDetail = travelTheme.capabilities.mapDetail;
  const usesIndependentMapDetail = travelTheme.id === "parchment";
  const visibleMapDetail = usesIndependentMapDetail
    ? parchmentMapDetail
    : { outline: mapDetail === "outline", borders: mapDetail === "borders" };
  const showMapOutline = !supportsMapDetail || !usesIndependentMapDetail
    || parchmentMapDetail.outline;
  const showMapBorders = !supportsMapDetail
    || (usesIndependentMapDetail ? parchmentMapDetail.borders : mapDetail === "borders");
  const ui = TRAVEL_UI_COPY[travelLocale];

  useEffect(() => {
    const controller = new AbortController();

    fetch("/data/travel-world-countries-50m.geojson", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load the travel country boundaries.");
        return response.json() as Promise<TravelGeoFeatureCollection>;
      })
      .then((geoJson) => {
        setWorldCountryGeoJson(geoJson);
        setWorldCountryPaths(createCountryAtlasPaths(geoJson));
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setWorldCountryGeoJson(null);
          setWorldCountryPaths([]);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/data/travel-world-landmass-50m.geojson", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load the travel landmass geometry.");
        return response.json() as Promise<TravelGeoFeatureCollection>;
      })
      .then((geoJson) => {
        setWorldLandmassGeoJson(geoJson);
        setWorldLandmassPaths(createAtlasPaths(geoJson, "landmass"));
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setWorldLandmassGeoJson(null);
          setWorldLandmassPaths([]);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (selectedCountryId === null || countryDetailCache.has(selectedCountryId)) return;

    let isCurrentSelection = true;
    const loadCountryDetails = async () => {
      let geoJson = countryDetailGeoJsonRef.current;
      if (!geoJson) {
        countryDetailRequestRef.current ??= fetch("/data/travel-country-detail-10m.geojson")
          .then((response) => {
            if (!response.ok) throw new Error("Unable to load detailed country boundaries.");
            return response.json() as Promise<TravelGeoFeatureCollection>;
          });
        geoJson = await countryDetailRequestRef.current;
        countryDetailGeoJsonRef.current = geoJson;
      }

      const country = createCountryAtlasPath(geoJson, selectedCountryId);
      if (!country) return;
      if (isCurrentSelection) {
        setCountryDetailCache((current) => {
          if (current.has(selectedCountryId)) return current;
          const next = new Map(current);
          next.set(selectedCountryId, country);
          return next;
        });
      }
    };

    loadCountryDetails().catch(() => {
      countryDetailRequestRef.current = null;
    });

    return () => {
      isCurrentSelection = false;
    };
  }, [countryDetailCache, selectedCountryId]);

  useEffect(() => () => {
    if (returnToWorldTimerRef.current) clearTimeout(returnToWorldTimerRef.current);
  }, []);

  useEffect(() => {
    if (atlasScope.kind !== "country") return;

    const handleCountryFocusEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setAtlasScope({ kind: "world" });
      setSelectedCountryId(null);
      setMapZoom(MAP_ZOOM_DEFAULT);
    };

    document.addEventListener("keydown", handleCountryFocusEscape);
    return () => document.removeEventListener("keydown", handleCountryFocusEscape);
  }, [atlasScope.kind]);

  useEffect(() => {
    if (!selectedPlace && !isScrapbookOpen && activePhotoIndex === null) return;

    const handleGalleryKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (activePhotoIndex !== null) setActivePhotoIndex(null);
        else if (isScrapbookOpen) setIsScrapbookOpen(false);
        else setSelectedId(null);
      }
      if (activePhotoIndex !== null && event.key === "ArrowLeft") {
        setActivePhotoIndex((current) => current === null
          ? null
          : (current - 1 + selectedPhotoCount) % selectedPhotoCount);
      }
      if (activePhotoIndex !== null && event.key === "ArrowRight") {
        setActivePhotoIndex((current) => current === null
          ? null
          : (current + 1) % selectedPhotoCount);
      }
    };

    document.addEventListener("keydown", handleGalleryKeys);
    return () => document.removeEventListener("keydown", handleGalleryKeys);
  }, [activePhotoIndex, isScrapbookOpen, selectedPhotoCount, selectedPlace]);

  useEffect(() => {
    if (!isScrapbookOpen && activePhotoIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activePhotoIndex, isScrapbookOpen]);

  function showPreviousPhoto() {
    setActivePhotoIndex((current) => current === null
      ? null
      : (current - 1 + selectedGalleryPhotos.length) % selectedGalleryPhotos.length);
  }

  function showNextPhoto() {
    setActivePhotoIndex((current) => current === null
      ? null
      : (current + 1) % selectedGalleryPhotos.length);
  }

  function closeSelectedPlace() {
    setActivePhotoIndex(null);
    setIsScrapbookOpen(false);
    setSelectedId(null);
    setPostcardPhotoIndex(0);
    setPostcardTab("photos");
  }

  function returnToWorld() {
    closeSelectedPlace();
    setIsReturningToWorld(true);
    setAtlasScope({ kind: "world" });
    setSelectedCountryId(null);
    setMapZoom(MAP_ZOOM_DEFAULT);
    if (returnToWorldTimerRef.current) clearTimeout(returnToWorldTimerRef.current);
    returnToWorldTimerRef.current = setTimeout(() => {
      setIsReturningToWorld(false);
      returnToWorldTimerRef.current = null;
    }, 80);
  }

  function handleCountrySelect(countryId: string) {
    if (false || atlasScope.kind !== "world") return;
    if (selectedPlace) closeSelectedPlace();
    setSelectedCountryId(countryId);
  }

  function exploreSelectedCountry() {
    if (!selectedAtlasCountry || !selectedFocusCountry) return;
    closeSelectedPlace();
    setAtlasScope({
      kind: "country",
      countryId: selectedAtlasCountry.id,
      countryName: selectedAtlasCountry.name,
    });
    setMapZoom(MAP_ZOOM_DEFAULT);
  }

  function handleMapViewChange(view: TravelMapView) {
    if (view === "globe") returnToWorld();
    setMapView(view);
  }

  function handlePlaceSelect(place: TravelEntry) {
    if (__ATLAS_LOCAL__ && localEditing) { closeSelectedPlace(); setLocalRequest({type:"edit",id:place.id,key:Date.now()}); return; }
    setActivePhotoIndex(null);
    setIsScrapbookOpen(false);

    setSelectedId(place.id);
    setPostcardPhotoIndex(getDefaultPostcardPhotoIndex(place));
    setPostcardTab("photos");
  }

  function handleTravelThemeChange(themeId: TravelThemeId) {
    const nextTheme = getTravelTheme(themeId);
    if (!nextTheme.capabilities.globe || !nextTheme.visuals.globe) {
      setMapView("atlas");
    }
    setTravelThemeId(themeId);
  }

  function handleGlobeBackgroundClick() {
    if (selectedPlace) closeSelectedPlace();
  }

  function adjustMapZoom(direction: -1 | 1) {
    setMapZoom((current) => clamp(
      Number((current + direction * MAP_ZOOM_STEP).toFixed(2)),
      MAP_ZOOM_MIN,
      MAP_ZOOM_MAX,
    ));
  }

  function handleFocusedYearChange(focusedYear: number) {
    const nextTimeState = {
      ...effectiveTravelTime,
      focusedYear: clampTravelYear(focusedYear, travelYearRange),
    };
    if (
      selectedId !== null
      && !filterTravelEntries(places, nextTimeState).some((place) => place.id === selectedId)
    ) closeSelectedPlace();
    setTravelTime(nextTimeState);
  }

  function handleTimeModeChange(mode: TravelTimeMode) {
    const nextTimeState = { ...effectiveTravelTime, mode };
    if (
      selectedId !== null
      && !filterTravelEntries(places, nextTimeState).some((place) => place.id === selectedId)
    ) closeSelectedPlace();
    setTravelTime(nextTimeState);
  }

  function handleMapClick(event: React.MouseEvent<HTMLDivElement>) {
 if (__ATLAS_LOCAL__ && localPicking) {
 const bounds = event.currentTarget.getBoundingClientRect();
 const x=(event.clientX-bounds.left)/bounds.width*VIEWBOX_WIDTH, y=(event.clientY-bounds.top)/bounds.height*VIEWBOX_HEIGHT;
 if(x<MAP_BOUNDS.left||x>MAP_BOUNDS.left+MAP_BOUNDS.width||y<MAP_BOUNDS.top||y>MAP_BOUNDS.top+MAP_BOUNDS.height)return;
 setLocalPoint({...unprojectAtlasPoint({x,y}),key:Date.now()});setLocalPicking(false);return;
 }
 const target = event.target as Element;
 if (target.closest("button, [data-country-hit]")) return;
 closeSelectedPlace();
 setSelectedCountryId(null);
 }

  return (
    <main className={`travel-atlas-shell ${travelTheme.rootClassName}-shell`}>

      <TravelAtlasStage
        ariaLabel="Wandering Atlas"
        hasSelection={Boolean(selectedPlace)}
        theme={travelTheme}
      >
      {LocalWorkspace && <Suspense fallback={null}><LocalWorkspace locale={travelLocale} entries={places} editing={localEditing} onReady={receiveReady} onArchive={receiveArchive} onSelect={setSelectedId} request={localRequest} onPicking={setLocalPicking} point={localPoint}/></Suspense>}
        <TravelHeader
          brandLayout={travelTheme.brandLayout}
          locale={travelLocale}
          theme={travelThemeId}
          title={ui.title}
          subtitle={ui.subtitle}
          onThemeChange={handleTravelThemeChange}
        />

        <div className="travel-toolbar" lang={travelLocale === "zh" ? "zh-CN" : "en"}>
          <div className="travel-view-controls" aria-label="Map view">
            {travelTheme.assets.mapViewButtons ? (
              <>
                <button
                  type="button"
                  className="travel-view-image-button is-atlas"
                  aria-label={ui.atlasView}
                  aria-pressed={activeMapView === "atlas"}
                  onClick={() => handleMapViewChange("atlas")}
                >
                  <Image
                    src={travelTheme.assets.mapViewButtons.atlas}
                    alt=""
                    fill
                    sizes="180px"
                    aria-hidden="true"
                  />
                </button>
                <button
                  type="button"
                  className="travel-view-image-button is-globe"
                  aria-label={ui.globeView}
                  aria-pressed={activeMapView === "globe"}
                  disabled={!canUseGlobe}
                  onClick={() => handleMapViewChange("globe")}
                  title={!supportsGlobe
                    ? "Globe view is not available for this theme"
                    : undefined}
                >
                  <Image
                    src={travelTheme.assets.mapViewButtons.globe}
                    alt=""
                    fill
                    sizes="180px"
                    aria-hidden="true"
                  />
                </button>
              </>
            ) : (
              <>
                <TravelButton
                  theme={travelTheme}
                  frame="md"
                  frameAsset="button"
                  aria-pressed={activeMapView === "atlas"}
                  onClick={() => handleMapViewChange("atlas")}
                >
                  {ui.atlasView}
                </TravelButton>
                <TravelButton
                  theme={travelTheme}
                  frame="md"
                  frameAsset="button"
                  aria-pressed={activeMapView === "globe"}
                  disabled={!canUseGlobe}
                  onClick={() => handleMapViewChange("globe")}
                  title={!supportsGlobe
                    ? "Globe view is not available for this theme"
                    : undefined}
                >
                  {ui.globeView}
                </TravelButton>
              </>
            )}
          </div>

          <div className="travel-locale-switch" aria-label="Travel interface language">
            <button
              type="button"
              className={travelLocale === "en" ? "is-active" : ""}
              onClick={() => setTravelLocale("en")}
              aria-pressed={travelLocale === "en"}
            >
              EN
            </button>
            <span aria-hidden="true">|</span>
            <button
              type="button"
              className={travelLocale === "zh" ? "is-active" : ""}
              onClick={() => setTravelLocale("zh")}
              aria-pressed={travelLocale === "zh"}
            >
              中文
            </button>
          </div>

          <nav className="travel-explorer-tools" aria-label="Explorer tools">
            <TravelButton
              theme={travelTheme}
              frame="md"
              frameAsset="legend"
              className="travel-tool-location"
              icon={<MapPin className="travel-button-icon" aria-hidden="true" />}
              aria-disabled={!__ATLAS_LOCAL__ || !localReady || !localEditing}
              tabIndex={__ATLAS_LOCAL__ && localReady && localEditing ? 0 : -1}
              title={!__ATLAS_LOCAL__ || !localEditing ? ui.toolsUnavailable : undefined}
              onClick={__ATLAS_LOCAL__ && localReady && localEditing ? () => openLocalTool("location") : undefined}
            >
              {ui.markPlace}
            </TravelButton>
            <TravelButton
              theme={travelTheme}
              frame="md"
              frameAsset="legend"
              className={`travel-tool-journey${localEditing ? " is-active" : ""}`}
              aria-pressed={localEditing}
              icon={<Flag className="travel-button-icon" aria-hidden="true" />}
              aria-disabled={!__ATLAS_LOCAL__ || !localReady}
              tabIndex={__ATLAS_LOCAL__ && localReady ? 0 : -1}
              title={!__ATLAS_LOCAL__ ? ui.toolsUnavailable : undefined}
              onClick={__ATLAS_LOCAL__ && localReady ? () => { if (localEditing) { setLocalEditing(false); setLocalPicking(false); } else { setLocalEditing(true); } } : undefined}
            >
              {ui.beginJourney}
            </TravelButton>
            <TravelButton
              theme={travelTheme}
              frame="lg"
              frameAsset="legend"
              className="travel-tool-archive"
              icon={<BookOpen className="travel-button-icon" aria-hidden="true" />}
              aria-disabled={!__ATLAS_LOCAL__ || !localReady}
              tabIndex={__ATLAS_LOCAL__ ? 0 : -1}
              title={__ATLAS_LOCAL__ ? undefined : ui.toolsUnavailable}
              onClick={__ATLAS_LOCAL__ ? () => openLocalTool("archive") : undefined}
            >
              {ui.openArchive}
            </TravelButton>
          </nav>
        </div>

        {activeMapView === "globe" && globeVisuals ? (
          <TravelGlobe
            ariaLabel={ui.globeView}
            countryGeoJson={worldCountryGeoJson}
            landmassGeoJson={worldLandmassGeoJson}
            material={globeVisuals.material}
            onBackgroundClick={handleGlobeBackgroundClick}
            onPlaceSelect={handlePlaceSelect}
            onRotationCommit={setGlobeRotation}
            places={visiblePlaces}
            initialRotation={globeRotation}
            selectedId={selectedId}
            showCountryBorders={showMapBorders}
            showOutline={showMapOutline}
            theme={travelTheme}
          />
        ) : (
          <>
            <TravelMap
              countryInteractionEnabled={!focusedCountry && !localPicking}
              countryPaths={worldCountryPaths}
              isCountryFocus={false}
              isSuspended={Boolean(focusedCountry)}
              landmassPaths={worldLandmassPaths}
              mapScopeStyle={worldMapScopeStyle}
              mapStyle={worldMapStyle}
              mapVisualScale={focusedCountry ? MAP_ZOOM_DEFAULT : mapZoom}
              onCountrySelect={handleCountrySelect}
              onMapClick={handleMapClick}
              onPlaceSelect={handlePlaceSelect}
              places={timelineFilteredPlaces}
              projectCoordinates={projectAtlasCoordinates}
              selectedCountryId={selectedCountryId}
              selectedId={selectedId}
              showCountryBorders={showMapBorders}
              showOutline={showMapOutline}
              theme={travelTheme}
              viewBoxHeight={VIEWBOX_HEIGHT}
              viewBoxWidth={VIEWBOX_WIDTH}
            />
            {focusedCountry && (
              <TravelMap
                countryInteractionEnabled={false}
                countryPaths={scopedCountryPaths}
                isCountryFocus
                landmassPaths={scopedLandmassPaths}
                mapScopeStyle={mapScopeStyle}
                mapStyle={mapStyle}
                mapVisualScale={mapZoom * countryFocusTransform.scale}
                onCountrySelect={handleCountrySelect}
                onMapClick={handleMapClick}
                onPlaceSelect={handlePlaceSelect}
                places={visiblePlaces}
                projectCoordinates={projectMapCoordinates}
                selectedCountryId={selectedCountryId}
                selectedId={selectedId}
                showCountryBorders={showMapBorders}
                showOutline={showMapOutline}
                theme={travelTheme}
                viewBoxHeight={VIEWBOX_HEIGHT}
                viewBoxWidth={VIEWBOX_WIDTH}
              />
            )}
          </>
        )}

        {activeMapView === "atlas" && (
          atlasScope.kind === "country" ? (
            <TravelButton
              className="travel-country-scope-control"
              frame="md"
              frameAsset="button"
              theme={travelTheme}
              onClick={returnToWorld}
            >
              ← {ui.backToWorld}
            </TravelButton>
          ) : selectedAtlasCountry ? (
            <TravelButton
              className="travel-country-scope-control"
              frame="md"
              frameAsset="button"
              theme={travelTheme}
              disabled={!selectedFocusCountry}
              onClick={exploreSelectedCountry}
            >
              {travelLocale === "zh"
                ? `${ui.exploreCountry}${getCountryDisplayName(selectedAtlasCountry, travelLocale)} →`
                : `${ui.exploreCountry} ${getCountryDisplayName(selectedAtlasCountry, travelLocale)} →`}
            </TravelButton>
          ) : null
        )}

        <div className="travel-atlas-patina" aria-hidden="true" />





        <TravelZoomControl
          canZoomIn={activeMapView === "atlas" && mapZoom < MAP_ZOOM_MAX}
          canZoomOut={activeMapView === "atlas" && mapZoom > MAP_ZOOM_MIN}
          onZoomIn={() => adjustMapZoom(1)}
          onZoomOut={() => adjustMapZoom(-1)}
          theme={travelTheme}
          zoomInLabel={ui.zoomIn}
          zoomOutLabel={ui.zoomOut}
        />

        <div className="travel-map-reference-tools">
          <TravelLegend
            journeyLabel={ui.journey}
            locale={travelLocale}
            locationLabel={ui.location}
            theme={travelTheme}
          />

          {supportsMapDetail && (
            <TravelMapDetailToggle
              enabled={visibleMapDetail}
              independent={usesIndependentMapDetail}
              value={mapDetail}
              onChange={setMapDetail}
              onToggle={(detail) => setParchmentMapDetail((current) => ({
                ...current,
                [detail]: !current[detail],
              }))}
              theme={travelTheme}
            />
          )}
        </div>



        <TravelTimeline
          years={timelineYears}
          focusedYear={effectiveTravelTime.focusedYear}
          mode={effectiveTravelTime.mode}
          onFocusedYearChange={handleFocusedYearChange}
          onModeChange={handleTimeModeChange}
          previousLabel={ui.previousYear}
          nextLabel={ui.nextYear}
          timelineLabel={ui.timeline}
          allYearsLabel={ui.allYears}
          yearModeLabel={ui.yearMode}
          theme={travelTheme}
        />

        {selectedPlace && !isScrapbookOpen && (
          <TravelPostcard
            dateText={formatEntryDate(selectedPlace) || "—"}
            entry={selectedPlace}
            galleryPhotos={selectedGalleryPhotos}
            hasScrapbookPhotos={selectedPhotos.length > 0}
            onClose={closeSelectedPlace}
            onOpenPhoto={() => setActivePhotoIndex(postcardPhotoIndex)}
            onOpenScrapbook={() => setIsScrapbookOpen(true)}
            onPhotoSelect={setPostcardPhotoIndex}
            onTabChange={setPostcardTab}
            photoIndex={postcardPhotoIndex}
            tab={postcardTab}
            theme={travelTheme}
            ui={ui}
          />
        )}

        {selectedPlace && isScrapbookOpen && (
          <div
            className="travel-scrapbook-layer"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsScrapbookOpen(false);
            }}
          >
            <section
              className="travel-scrapbook"
              role="dialog"
              aria-modal="true"
              aria-labelledby="travel-scrapbook-title"
            >
              <header className="travel-scrapbook-header">
                <button type="button" onClick={() => setIsScrapbookOpen(false)}>
                  <ArrowLeft size={15} aria-hidden="true" />
                  Back to postcard
                </button>
                <div>
                  <p>{[selectedPlace.country, selectedPlace.region, `${selectedPlace.type} notes`].filter(Boolean).join(" · ")}</p>
                  <h2 id="travel-scrapbook-title">{selectedPlace.city}</h2>
                  <span>
                    {selectedPlace.type === "location"
                      ? "Photographs grouped by the month they belong to."
                      : "A small collection from one chapter of the atlas."}
                  </span>
                </div>
                <button
                  className="travel-scrapbook-close"
                  type="button"
                  onClick={closeSelectedPlace}
                  aria-label="Close memories and return to the atlas"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </header>

              <div className={`travel-scrapbook-grid is-${selectedPlace.type}`}>
                {selectedPlace.type === "location" && selectedPlace.memory && (
                  <blockquote className="travel-scrapbook-note travel-scrapbook-note-intro">
                    “{selectedPlace.memory}”
                  </blockquote>
                )}

                {selectedPlace.type === "location" ? selectedPhotoGroups.map(([label, photos]) => (
                  <section className="travel-location-photo-group" key={label}>
                    <h3>{label}</h3>
                    <div className="travel-location-photo-grid">
                      {photos.map((photo) => {
                        const index = selectedGalleryPhotos.findIndex((candidate) => candidate.id === photo.id);
                        const isPortrait = photo.height > photo.width;
                        return (
                          <figure
                            className={`travel-scrapbook-photo${isPortrait ? " is-portrait" : ""}`}
                            key={photo.id}
                          >
                            <button
                              type="button"
                              onClick={() => setActivePhotoIndex(index)}
                              aria-label={`Open photo ${index + 1}: ${photo.caption || selectedPlace.city}`}
                            >
                              <span className="travel-scrapbook-image">
                                {isPortrait && (
                                  <Image
                                    src={photo.src}
                                    alt=""
                                    fill
                                    unoptimized
                                    sizes="(max-width: 600px) 82vw, (max-width: 1100px) 44vw, 32vw"
                                    aria-hidden="true"
                                    className="travel-scrapbook-image-backdrop"
                                  />
                                )}
                                <Image
                                  src={photo.src}
                                  alt={photo.caption || `${selectedPlace.city} travel photo ${index + 1}`}
                                  fill
                                  unoptimized
                                  sizes="(max-width: 600px) 82vw, (max-width: 1100px) 44vw, 32vw"
                                  className="travel-scrapbook-image-main"
                                />
                              </span>
                            </button>
                            <figcaption>
                              <span>{String(photo.order).padStart(2, "0")}</span>
                              {photo.caption}
                            </figcaption>
                          </figure>
                        );
                      })}
                    </div>
                  </section>
                )) : selectedPhotos.map((photo, index) => {
                  const galleryIndex = selectedGalleryPhotos.findIndex((candidate) => candidate.id === photo.id);
                  const isPortrait = photo.height > photo.width;
                  return (
                  <figure
                    className={`travel-scrapbook-photo${isPortrait ? " is-portrait" : ""}`}
                    key={photo.id}
                  >
                    <button
                      type="button"
                      onClick={() => setActivePhotoIndex(galleryIndex)}
                      aria-label={`Open photo ${index + 1}: ${photo.caption || selectedPlace.city}`}
                    >
                      <span className="travel-scrapbook-image">
                        {isPortrait && (
                          <Image
                            src={photo.src}
                            alt=""
                            fill
                            unoptimized
                            sizes="(max-width: 600px) 82vw, (max-width: 1100px) 44vw, 32vw"
                            aria-hidden="true"
                            className="travel-scrapbook-image-backdrop"
                          />
                        )}
                        <Image
                          src={photo.src}
                          alt={photo.caption || `${selectedPlace.city} travel photo ${index + 1}`}
                          fill
                          unoptimized
                          sizes="(max-width: 600px) 82vw, (max-width: 1100px) 44vw, 32vw"
                          className="travel-scrapbook-image-main"
                          onError={(event) => {
                            console.error(
                              "Failed to render Travel photo URL:",
                              event.currentTarget.currentSrc || photo.src,
                            );
                          }}
                        />
                      </span>
                    </button>
                    <figcaption>
                      <span>{String(photo.order).padStart(2, "0")}</span>
                      {photo.caption}
                    </figcaption>
                  </figure>
                  );
                })}

                {selectedPlace.type === "location" && selectedPlace.coordinates && (
                  <div className="travel-scrapbook-note travel-scrapbook-note-end" aria-hidden="true">
                    <span>{formatCoordinate(selectedPlace.coordinates.latitude, "N", "S")}</span>
                    <i />
                    <span>{formatCoordinate(selectedPlace.coordinates.longitude, "E", "W")}</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activePhotoIndex !== null && selectedPlace && selectedGalleryPhotos[activePhotoIndex] && (
          <TravelLightbox
            activeIndex={activePhotoIndex}
            entry={selectedPlace}
            onClose={() => setActivePhotoIndex(null)}
            onNext={showNextPhoto}
            onPrevious={showPreviousPhoto}
            photos={selectedGalleryPhotos}
            theme={travelTheme}
          />
        )}


      </TravelAtlasStage>
    </main>
  );
}
