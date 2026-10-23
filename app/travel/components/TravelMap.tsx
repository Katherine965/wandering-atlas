"use client";

import { useMemo, type CSSProperties, type MouseEventHandler } from "react";
import type { AvailableTravelTheme } from "../themes/types";
import type { TravelCoordinates, TravelEntry } from "../travel-storage";
import type {
  TravelCountryPath,
  TravelGeoPath,
  TravelProjectedPoint,
} from "../travel-geometry";
import { TravelMarkerLayer } from "./TravelMarkerLayer";

export type LandmassPath = TravelGeoPath;

type TravelMapProps = {
  countryInteractionEnabled: boolean;
  countryPaths: TravelCountryPath[];
  isCountryFocus: boolean;
  isSuspended?: boolean;
  landmassPaths: LandmassPath[];
  mapScopeStyle: CSSProperties;
  mapStyle: CSSProperties;
  mapVisualScale: number;
  onCountrySelect: (countryId: string) => void;
  onMapClick: MouseEventHandler<HTMLDivElement>;
  onPlaceSelect: (place: TravelEntry) => void;
  places: TravelEntry[];
  projectCoordinates: (coordinates: TravelCoordinates) => TravelProjectedPoint;
  selectedCountryId: string | null;
  selectedId: string | null;
  showCountryBorders: boolean;
  showOutline: boolean;
  theme: AvailableTravelTheme;
  viewBoxHeight: number;
  viewBoxWidth: number;
};

export function TravelMap({
  countryInteractionEnabled,
  countryPaths,
  isCountryFocus,
  isSuspended = false,
  landmassPaths,
  mapScopeStyle,
  mapStyle,
  mapVisualScale,
  onCountrySelect,
  onMapClick,
  onPlaceSelect,
  places,
  projectCoordinates,
  selectedCountryId,
  selectedId,
  showCountryBorders,
  showOutline,
  theme,
  viewBoxHeight,
  viewBoxWidth,
}: TravelMapProps) {
  const isDeepSeaMap = theme.id === "deep-sea";
  const selectedCountryPath = isCountryFocus
    ? null
    : countryPaths.find((country) => country.id === selectedCountryId);
  const focusTextureBounds = isCountryFocus ? countryPaths[0]?.bounds : null;
  const textureX = focusTextureBounds?.minX ?? 0;
  const textureY = focusTextureBounds?.minY ?? 0;
  const textureWidth = focusTextureBounds
    ? focusTextureBounds.maxX - focusTextureBounds.minX
    : viewBoxWidth;
  const textureHeight = focusTextureBounds
    ? focusTextureBounds.maxY - focusTextureBounds.minY
    : viewBoxHeight;
  const combinedLandmassPath = useMemo(
    () => landmassPaths.map((landmass) => landmass.path).join(" "),
    [landmassPaths],
  );
  const cyberGlowDeviation = 2.5 / Math.max(mapVisualScale, 0.01);
  const definitionSuffix = isCountryFocus ? "-focus" : "";
  const cyberGlowId = `travel-map-cyber-glow${definitionSuffix}`;
  const deepSeaLandFillId = `travel-map-deep-sea-land-fill${definitionSuffix}`;
  const deepSeaFrostFillId = `travel-map-deep-sea-frost-fill${definitionSuffix}`;
  const deepSeaEurasiaShadeId = `travel-map-deep-sea-eurasia-shade${definitionSuffix}`;
  const deepSeaAntarcticaShadeId = `travel-map-deep-sea-antarctica-shade${definitionSuffix}`;
  const deepSeaLandHaloId = `travel-map-deep-sea-land-halo${definitionSuffix}`;
  const deepSeaInnerGlowId = `travel-map-deep-sea-inner-glow${definitionSuffix}`;
  const deepSeaCoastBloomId = `travel-map-deep-sea-coast-bloom${definitionSuffix}`;
  const materialClipId = `travel-map-material-land-clip${definitionSuffix}`;

  return (
    <div
      className={`travel-atlas-map${isCountryFocus ? " is-country-focus" : ""}${isSuspended ? " is-suspended-world" : ""}`}
      role={isSuspended ? undefined : "group"}
      aria-hidden={isSuspended || undefined}
      aria-label={isSuspended ? undefined : "Interactive travel map with visited city markers"}
      onClick={onMapClick}
    >
      <div className="travel-map-zoom-layer" style={mapStyle}>
        <div className="travel-map-scope-layer" style={mapScopeStyle}>
        <svg
          className={`travel-landmass-map${landmassPaths.length > 0 ? " is-ready" : ""}${countryInteractionEnabled ? " has-country-interaction" : ""}`}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden={countryInteractionEnabled ? undefined : true}
          aria-label={countryInteractionEnabled ? "Select a country to explore" : undefined}
        >
        <defs>
          {theme.renderers.map === "ink" && (
            <filter id={`travel-map-ink${definitionSuffix}`} x="-3%" y="-4%" width="106%" height="108%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.004 0.075"
                numOctaves="2"
                seed="17"
                result="paperNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="paperNoise"
                scale="0.7"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          )}
          {theme.renderers.map === "neon" && (
            <filter id={cyberGlowId} x="-10%" y="-12%" width="120%" height="124%">
              <feGaussianBlur stdDeviation={cyberGlowDeviation} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
          {isDeepSeaMap && (
            <>
              <linearGradient
                id={deepSeaLandFillId}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={viewBoxHeight}
              >
                <stop offset="0" stopColor="#d6fbf8" stopOpacity=".24" />
                <stop offset=".42" stopColor="#7ddbe3" stopOpacity=".18" />
                <stop offset=".76" stopColor="#3d9db4" stopOpacity=".12" />
                <stop offset="1" stopColor="#1d617d" stopOpacity=".07" />
              </linearGradient>
              <radialGradient
                id={deepSeaFrostFillId}
                gradientUnits="userSpaceOnUse"
                cx={viewBoxWidth * 0.46}
                cy={viewBoxHeight * 0.38}
                r={viewBoxWidth * 0.54}
              >
                <stop offset="0" stopColor="#f0ffff" stopOpacity=".3" />
                <stop offset=".38" stopColor="#a7edf0" stopOpacity=".16" />
                <stop offset=".76" stopColor="#50b7c9" stopOpacity=".07" />
                <stop offset="1" stopColor="#1d5872" stopOpacity=".01" />
              </radialGradient>
              <radialGradient
                id={deepSeaEurasiaShadeId}
                gradientUnits="userSpaceOnUse"
                cx={viewBoxWidth * 0.74}
                cy={viewBoxHeight * 0.25}
                r={viewBoxWidth * 0.22}
                gradientTransform={`translate(0 ${viewBoxHeight * 0.1125}) scale(1 .55)`}
              >
                <stop offset="0" stopColor="#00182d" stopOpacity=".78" />
                <stop offset=".56" stopColor="#00344d" stopOpacity=".42" />
                <stop offset="1" stopColor="#064b62" stopOpacity="0" />
              </radialGradient>
              <linearGradient
                id={deepSeaAntarcticaShadeId}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={viewBoxHeight}
              >
                <stop offset=".68" stopColor="#063b53" stopOpacity="0" />
                <stop offset=".8" stopColor="#01273e" stopOpacity=".48" />
                <stop offset="1" stopColor="#001326" stopOpacity=".82" />
              </linearGradient>
              <filter
                id={deepSeaLandHaloId}
                x="-10%"
                y="-16%"
                width="120%"
                height="132%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="10.5" result="landBlur" />
                <feColorMatrix
                  in="landBlur"
                  type="matrix"
                  values="0 0 0 0 .24  0 0 0 0 .72  0 0 0 0 .88  0 0 0 .22 0"
                />
              </filter>
              <filter
                id={deepSeaInnerGlowId}
                x="-4%"
                y="-6%"
                width="108%"
                height="112%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="softFill" />
                <feComposite in="softFill" in2="SourceGraphic" operator="in" result="innerFill" />
                <feColorMatrix
                  in="innerFill"
                  type="matrix"
                  values="0 0 0 0 .5  0 0 0 0 .9  0 0 0 0 .97  0 0 0 .36 0"
                  result="pearlFill"
                />
                <feMerge>
                  <feMergeNode in="pearlFill" />
                </feMerge>
              </filter>
              <filter
                id={deepSeaCoastBloomId}
                x="-12%"
                y="-16%"
                width="124%"
                height="132%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.8" result="wideBlur" />
                <feColorMatrix
                  in="wideBlur"
                  type="matrix"
                  values="0 0 0 0 .28  0 0 0 0 .8  0 0 0 0 .96  0 0 0 .34 0"
                  result="wideGlow"
                />
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.35" result="closeBlur" />
                <feColorMatrix
                  in="closeBlur"
                  type="matrix"
                  values="0 0 0 0 .58  0 0 0 0 .94  0 0 0 0 1  0 0 0 .58 0"
                  result="closeGlow"
                />
                <feMerge>
                  <feMergeNode in="wideGlow" />
                  <feMergeNode in="closeGlow" />
                </feMerge>
              </filter>
            </>
          )}
          {theme.assets.landTexture && (
            <clipPath id={materialClipId} clipPathUnits="userSpaceOnUse">
              <path d={combinedLandmassPath} />
            </clipPath>
          )}
        </defs>
          {theme.renderers.map === "neon" ? (
          <>
            <g className="travel-map-cyber-layer is-fill">
              <path d={combinedLandmassPath} />
            </g>
            {showCountryBorders && (
              <g className="travel-map-cyber-countries">
                {countryPaths.map((country) => <path key={country.id} d={country.path} />)}
              </g>
            )}
            <g
              className="travel-map-cyber-layer is-glow"
              style={{ filter: `url(#${cyberGlowId})` }}
            >
              <path d={combinedLandmassPath} />
            </g>
            <g className="travel-map-cyber-layer is-main">
              <path d={combinedLandmassPath} />
            </g>
            <g className="travel-map-cyber-layer is-core">
              <path d={combinedLandmassPath} />
            </g>
          </>
        ) : theme.renderers.map === "investigation" ? (
          <>
            {isDeepSeaMap && (
              <g
                className="travel-map-deep-sea-land-halo"
                style={{ filter: `url(#${deepSeaLandHaloId})` }}
              >
                <path d={combinedLandmassPath} />
              </g>
            )}
            <g className="travel-map-investigation-land">
              <path
                d={combinedLandmassPath}
                style={isDeepSeaMap ? { fill: `url(#${deepSeaLandFillId})` } : undefined}
              />
            </g>
            {theme.assets.landTexture && (
              <g
                className={`travel-map-material-texture${isDeepSeaMap ? " travel-map-deep-sea-texture" : ""}`}
                clipPath={`url(#${materialClipId})`}
              >
                <image
                  className={`travel-map-material-texture-body${isDeepSeaMap ? " travel-map-deep-sea-texture-body" : ""}`}
                  href={theme.assets.landTexture}
                  x={textureX}
                  y={textureY}
                  width={textureWidth}
                  height={textureHeight}
                  preserveAspectRatio="xMidYMid slice"
                />
                {isDeepSeaMap && (
                  <image
                    className="travel-map-deep-sea-texture-shimmer"
                    href={theme.assets.landTexture}
                    x={textureX}
                    y={textureY}
                    width={textureWidth}
                    height={textureHeight}
                    preserveAspectRatio="xMidYMid slice"
                  />
                )}
              </g>
            )}
            {isDeepSeaMap && (
              <>
                <g
                  className="travel-map-deep-sea-local-shade"
                  clipPath={`url(#${materialClipId})`}
                >
                  <rect
                    className="is-eurasia"
                    x="0"
                    y="0"
                    width={viewBoxWidth}
                    height={viewBoxHeight}
                    fill={`url(#${deepSeaEurasiaShadeId})`}
                  />
                  <rect
                    className="is-antarctica"
                    x="0"
                    y="0"
                    width={viewBoxWidth}
                    height={viewBoxHeight}
                    fill={`url(#${deepSeaAntarcticaShadeId})`}
                  />
                </g>
                <g
                  className="travel-map-deep-sea-inner-glow"
                  style={{ filter: `url(#${deepSeaInnerGlowId})` }}
                >
                  <path
                    d={combinedLandmassPath}
                    style={{ fill: `url(#${deepSeaFrostFillId})` }}
                  />
                </g>
              </>
            )}
            {isDeepSeaMap && (
              <g
                className="travel-map-deep-sea-coast-bloom"
                style={{ filter: `url(#${deepSeaCoastBloomId})` }}
              >
                <path d={combinedLandmassPath} />
              </g>
            )}
            {showCountryBorders && (
              <g className="travel-map-investigation-countries">
                {countryPaths.map((country) => <path key={country.id} d={country.path} />)}
              </g>
            )}
            <g className="travel-map-investigation-coastline">
              <path d={combinedLandmassPath} />
            </g>
            {isDeepSeaMap && (
              <g className="travel-map-deep-sea-coast-core">
                <path d={combinedLandmassPath} />
              </g>
            )}
          </>
        ) : (
          <>
            <g className={`travel-map-ink-land${showOutline ? "" : " is-outline-hidden"}`}>
              <path d={combinedLandmassPath} />
            </g>
            {theme.id === "parchment" && showCountryBorders && (
              <g className="travel-map-ink-countries">
                {countryPaths.map((country) => <path key={country.id} d={country.path} />)}
              </g>
            )}
          </>
          )}

          {selectedCountryPath && (
            <g className="travel-country-selection" aria-hidden="true">
              <path d={selectedCountryPath.focusPath} />
            </g>
          )}

          {countryInteractionEnabled && (
            <g className="travel-country-interaction">
              {countryPaths.map((country) => (
                <path
                  key={`hit-${country.id}`}
                  className="travel-country-hit"
                  d={country.focusPath}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${country.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onCountrySelect(country.id);
                    event.currentTarget.blur();
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    event.stopPropagation();
                    onCountrySelect(country.id);
                  }}
                />
              ))}
            </g>
          )}
        </svg>

          <TravelMarkerLayer
            onPlaceSelect={onPlaceSelect}
            places={places}
            projectCoordinates={projectCoordinates}
            selectedId={selectedId}
            theme={theme}
            viewBoxHeight={viewBoxHeight}
            viewBoxWidth={viewBoxWidth}
          />
        </div>
      </div>
    </div>
  );
}
