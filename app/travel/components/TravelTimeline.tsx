"use client";

import Image from "@/app/components/Image";
import { useEffect, useRef } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, TouchEvent as ReactTouchEvent } from "react";
import type { AvailableTravelTheme } from "../themes/types";
import type { TravelTimeMode } from "../travel-time";

const LEGACY_TRACK_INSET_PERCENT = 5;
const LEGACY_VISIBLE_YEAR_COUNT = 9;
const SCROLL_SETTLE_DELAY_MS = 140;

type TravelTimelineProps = {
  allYearsLabel: string;
  focusedYear: number;
  mode: TravelTimeMode;
  mobile?: boolean;
  nextLabel: string;
  onFocusedYearChange: (year: number) => void;
  onModeChange: (mode: TravelTimeMode) => void;
  previousLabel: string;
  theme: AvailableTravelTheme;
  timelineLabel: string;
  yearModeLabel: string;
  years: number[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getVisibleYears(years: number[], focusedYear: number, count: number) {
  if (years.length <= count) return years;

  const focusedIndex = Math.max(years.indexOf(focusedYear), 0);
  const halfWindow = Math.floor(count / 2);
  const start = clamp(
    focusedIndex - halfWindow,
    0,
    years.length - count,
  );
  return years.slice(start, start + count);
}

export function TravelTimeline({
  allYearsLabel,
  focusedYear,
  mode,
  mobile = false,
  nextLabel,
  onFocusedYearChange,
  onModeChange,
  previousLabel,
  theme,
  timelineLabel,
  yearModeLabel,
  years,
}: TravelTimelineProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{x: number; y: number} | null>(null);
  const scrollSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollSequenceRef = useRef(0);
  const settledScrollSequenceRef = useRef(-1);
  const internalFocusedYearRef = useRef<number | null>(null);
  const timelineAssets = theme.assets.timeline;
  const frameAsset = timelineAssets?.frame;
  const pointAsset = timelineAssets?.point;
  const selectedAsset = timelineAssets?.selected ?? timelineAssets?.active;
  const timelineVisuals = theme.visuals.timeline;
  const timelineLayout = timelineVisuals.layout;
  const usesAssetFrame = timelineVisuals.frame === "asset" && Boolean(frameAsset);
  const usesAssetPoint = timelineVisuals.point === "asset" && Boolean(pointAsset);
  const isTimelineV2 = timelineVisuals.structure === "v2";
  const visibleYears = mobile ? getVisibleYears(years, focusedYear, 3) : years;
  const timelineStyle = {
    ...(mobile ? { "--timeline-mobile-selection": (Math.max(visibleYears.indexOf(focusedYear), 0) + .5) / Math.max(visibleYears.length, 1) } : {}),
    ...(frameAsset ? { "--timeline-frame-image": `url("${frameAsset}")` } : {}),
    ...(timelineLayout?.trackYPercent !== undefined
      ? { "--timeline-track-y": `${timelineLayout.trackYPercent}%` }
      : {}),
    ...(timelineLayout?.labelOffsetCqw !== undefined
      ? { "--timeline-label-offset": `${timelineLayout.labelOffsetCqw}cqw` }
      : {}),
    ...(timelineLayout?.pointDiameterPx !== undefined
      ? { "--timeline-point-size": `${timelineLayout.pointDiameterPx}px` }
      : {}),
    ...(timelineLayout?.pointImageScale !== undefined
      ? { "--timeline-point-image-scale": timelineLayout.pointImageScale }
      : {}),
    ...(timelineLayout?.pointImageOffsetYPx !== undefined
      ? { "--timeline-point-image-offset-y": `${timelineLayout.pointImageOffsetYPx}px` }
      : {}),
    ...(timelineLayout?.selectedSizePx !== undefined
      ? { "--timeline-selected-size": `${timelineLayout.selectedSizePx}px` }
      : {}),
    ...(timelineLayout?.selectedImageScale !== undefined
      ? { "--timeline-selected-image-scale": timelineLayout.selectedImageScale }
      : {}),
    ...(timelineLayout?.selectedImageOffsetYPx !== undefined
      ? { "--timeline-selected-image-offset-y": `${timelineLayout.selectedImageOffsetYPx}px` }
      : {}),
    ...(timelineLayout?.arrowImageScale !== undefined
      ? { "--timeline-arrow-image-scale": timelineLayout.arrowImageScale }
      : {}),
    ...(timelineLayout?.arrowSizeCqw !== undefined
      ? { "--timeline-arrow-size": `${timelineLayout.arrowSizeCqw}cqw` }
      : {}),
    ...(timelineLayout?.previousArrowImageScale !== undefined
      ? { "--timeline-previous-arrow-image-scale": timelineLayout.previousArrowImageScale }
      : {}),
    ...(timelineLayout?.nextArrowImageScale !== undefined
      ? { "--timeline-next-arrow-image-scale": timelineLayout.nextArrowImageScale }
      : {}),
    ...(timelineLayout?.arrowYcqw !== undefined
      ? { "--timeline-arrow-y": `${timelineLayout.arrowYcqw}cqw` }
      : {}),
    ...(timelineLayout?.frameScaleY !== undefined
      ? { "--timeline-frame-scale-y": timelineLayout.frameScaleY }
      : {}),
    ...(timelineLayout?.hudTrackInsetCqw !== undefined
      ? { "--timeline-hud-track-inset": `${timelineLayout.hudTrackInsetCqw}cqw` }
      : {}),
    ...(timelineLayout?.frameSlices
      ? {
          "--timeline-frame-natural-width": `${timelineLayout.frameSlices.naturalWidthCqw}cqw`,
          "--timeline-frame-endcap-width": `${timelineLayout.frameSlices.endcapWidthCqw}cqw`,
          "--timeline-frame-stretch-width": `${timelineLayout.frameSlices.stretchWidthCqw}cqw`,
          "--timeline-frame-center-width": `${timelineLayout.frameSlices.centerWidthCqw}cqw`,
          "--timeline-frame-stretch-background-width": `${timelineLayout.frameSlices.stretchBackgroundWidthCqw}cqw`,
        }
      : {}),
  } as CSSProperties;
  const minYear = years[0] ?? focusedYear;
  const maxYear = years.at(-1) ?? focusedYear;
  const legacyYears = getVisibleYears(years, focusedYear, mobile ? 3 : LEGACY_VISIBLE_YEAR_COUNT);
  const legacyActiveIndex = legacyYears.indexOf(focusedYear);
  const getLegacyPosition = (index: number) => legacyYears.length <= 1
    ? 50
    : LEGACY_TRACK_INSET_PERCENT
      + (index / (legacyYears.length - 1)) * (100 - LEGACY_TRACK_INSET_PERCENT * 2);
  const legacyActivePosition = legacyActiveIndex < 0 ? 50 : getLegacyPosition(legacyActiveIndex);

  function getScrollMetrics() {
    const viewport = viewportRef.current;
    const yearCell = viewport?.querySelector<HTMLElement>(".travel-timeline-year-cell");
    if (!viewport || !yearCell) return null;
    return { viewport, spacing: yearCell.getBoundingClientRect().width };
  }

  function getScrollBehavior(): ScrollBehavior {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  function scrollToYear(year: number, behavior: ScrollBehavior) {
    if (mobile) return;
    const metrics = getScrollMetrics();
    if (!metrics) return;
    const yearIndex = clamp(year - minYear, 0, years.length - 1);
    metrics.viewport.scrollTo({ left: yearIndex * metrics.spacing, behavior });
  }

  function commitCenteredYear(scrollSequence: number) {
    if (settledScrollSequenceRef.current === scrollSequence) return;
    settledScrollSequenceRef.current = scrollSequence;

    const metrics = getScrollMetrics();
    if (!metrics) return;
    const yearIndex = clamp(
      Math.round(metrics.viewport.scrollLeft / metrics.spacing),
      0,
      years.length - 1,
    );
    const year = years[yearIndex];
    if (year === undefined) return;

    if (year !== focusedYear) {
      internalFocusedYearRef.current = year;
      onFocusedYearChange(year);
    }
  }

  function settleScroll(scrollSequence: number) {
    if (settledScrollSequenceRef.current === scrollSequence) return;
    if (scrollSettleTimerRef.current !== null) {
      clearTimeout(scrollSettleTimerRef.current);
      scrollSettleTimerRef.current = null;
    }
    commitCenteredYear(scrollSequence);
  }

  function scheduleScrollCommit() {
    const scrollSequence = ++scrollSequenceRef.current;
    if (scrollSettleTimerRef.current !== null) clearTimeout(scrollSettleTimerRef.current);
    scrollSettleTimerRef.current = setTimeout(() => {
      scrollSettleTimerRef.current = null;
      settleScroll(scrollSequence);
    }, SCROLL_SETTLE_DELAY_MS);
  }

  function focusYear(year: number) {
    const nextYear = clamp(year, minYear, maxYear);
    if (nextYear !== focusedYear) {
      if (isTimelineV2 && !mobile) internalFocusedYearRef.current = nextYear;
      onFocusedYearChange(nextYear);
    }
    if (isTimelineV2) scrollToYear(nextYear, getScrollBehavior());
  }

  function handleTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStartRef.current = mobile && event.touches.length === 1 ? {x: touch.clientX, y: touch.clientY} : null;
  }

  function handleTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!mobile || !start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) >= 32 && Math.abs(dx) > Math.abs(dy) * 1.2) focusYear(focusedYear + (dx < 0 ? 1 : -1));
  }

  function handleViewportKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    focusYear(focusedYear + (event.key === "ArrowLeft" ? -1 : 1));
  }

  useEffect(() => {
    if (!isTimelineV2 || mobile) {
      internalFocusedYearRef.current = null;
      if (scrollSettleTimerRef.current !== null) {
        clearTimeout(scrollSettleTimerRef.current);
        scrollSettleTimerRef.current = null;
      }
      settledScrollSequenceRef.current = scrollSequenceRef.current;
      return;
    }
    if (internalFocusedYearRef.current === focusedYear) {
      internalFocusedYearRef.current = null;
      return;
    }
    internalFocusedYearRef.current = null;

    const animationFrame = window.requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      const yearCell = viewport?.querySelector<HTMLElement>(".travel-timeline-year-cell");
      if (!viewport || !yearCell) return;
      const yearIndex = clamp(focusedYear - minYear, 0, years.length - 1);
      viewport.scrollTo({
        left: yearIndex * yearCell.getBoundingClientRect().width,
        behavior: "auto",
      });
    });
    return () => window.cancelAnimationFrame(animationFrame);
  }, [focusedYear, isTimelineV2, mobile, minYear, years.length]);

  useEffect(() => {
    if (!isTimelineV2 || mobile) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || Math.abs(event.deltaY) < 1) return;
      event.preventDefault();
      viewport.scrollLeft += event.deltaY;
    };
    const handleScrollEnd = () => {
      settleScroll(scrollSequenceRef.current);
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    viewport.addEventListener("scrollend", handleScrollEnd);
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
      viewport.removeEventListener("scrollend", handleScrollEnd);
    };
  });

  useEffect(() => () => {
    if (scrollSettleTimerRef.current !== null) clearTimeout(scrollSettleTimerRef.current);
  }, []);

  const modeControl = (
    <button
      type="button"
      className="travel-timeline-mode"
      aria-label={mode === "all"
        ? `${allYearsLabel}. ${yearModeLabel} ${focusedYear}`
        : `${yearModeLabel} ${focusedYear}. ${allYearsLabel}`}
      aria-pressed={mode === "year"}
      onClick={() => onModeChange(mode === "all" ? "year" : "all")}
    >
      {mode === "all" ? allYearsLabel : yearModeLabel}
    </button>
  );

  if (isTimelineV2) {
    return (
      <section
        className={`travel-timeline is-v2 is-mode-${mode}${mobile ? " is-mobile" : ""}`}
        aria-label={timelineLabel}
        style={timelineStyle}
      >
        <button
          type="button"
          className="travel-timeline-control is-previous"
          onClick={() => focusYear(focusedYear - 1)}
          disabled={focusedYear <= minYear}
          aria-label={previousLabel}
        >
          {timelineAssets?.previous
            ? <Image src={timelineAssets.previous} alt="" fill sizes="64px" aria-hidden="true" />
            : <span className="travel-timeline-arrow" aria-hidden="true">‹</span>}
        </button>

        <div className="travel-timeline-v2-frame">
          <span
            className={`travel-timeline-v2-frame-art is-${usesAssetFrame ? "asset" : "hud"}`}
            aria-hidden="true"
          >
            {usesAssetFrame ? (
              <>
                <span className="travel-timeline-v2-frame-slice is-left-endcap" />
                <span className="travel-timeline-v2-frame-slice is-left-stretch" />
                <span className="travel-timeline-v2-frame-slice is-center" />
                <span className="travel-timeline-v2-frame-slice is-right-stretch" />
                <span className="travel-timeline-v2-frame-slice is-right-endcap" />
              </>
            ) : <span className="travel-timeline-v2-frame-hud-track" />}
          </span>
          {modeControl}
          <div
            ref={viewportRef}
            className="travel-timeline-viewport"
            tabIndex={0}
            aria-label={`${timelineLabel}: ${focusedYear}`}
            onKeyDown={handleViewportKeyDown}
            onScroll={mobile ? undefined : scheduleScrollCommit}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => { touchStartRef.current = null; }}
          >
            <div className="travel-timeline-year-strip">
              <span className="travel-timeline-year-spacer" aria-hidden="true" />
              {visibleYears.map((year) => (
                <span className="travel-timeline-year-cell" key={year}>
                  <button
                    type="button"
                    className={year === focusedYear ? "is-focused" : ""}
                    aria-label={String(year)}
                    aria-pressed={year === focusedYear}
                    onClick={() => focusYear(year)}
                  >
                    <span
                      className={`travel-timeline-point is-${usesAssetPoint ? "asset" : "hud"}`}
                      aria-hidden="true"
                    >
                      {usesAssetPoint && pointAsset
                        ? <Image src={pointAsset} alt="" fill sizes="32px" />
                        : <span className="travel-timeline-point-core" />}
                    </span>
                    <span className="travel-timeline-year-label">{year}</span>
                  </button>
                </span>
              ))}
              <span className="travel-timeline-year-spacer" aria-hidden="true" />
            </div>
          </div>
          <span
            className={`travel-timeline-selection${selectedAsset ? " has-asset" : ""}`}
            aria-hidden="true"
          >
            {selectedAsset
              ? <Image src={selectedAsset} alt="" fill sizes="72px" />
              : <span className="travel-timeline-energy-core" />}
          </span>
        </div>

        <button
          type="button"
          className="travel-timeline-control is-next"
          onClick={() => focusYear(focusedYear + 1)}
          disabled={focusedYear >= maxYear}
          aria-label={nextLabel}
        >
          {timelineAssets?.next
            ? <Image src={timelineAssets.next} alt="" fill sizes="64px" aria-hidden="true" />
            : <span className="travel-timeline-arrow" aria-hidden="true">›</span>}
        </button>
      </section>
    );
  }

  return (
    <section className={`travel-timeline is-legacy is-mode-${mode}`} aria-label={timelineLabel}>
      {modeControl}
      {theme.assets.timelineShell && (
        <Image
          src={theme.assets.timelineShell}
          alt=""
          fill
          sizes="64vw"
          aria-hidden="true"
          className="travel-timeline-shell"
        />
      )}
      <button
        type="button"
        className="travel-timeline-control is-previous"
        onClick={() => focusYear(focusedYear - 1)}
        disabled={focusedYear <= minYear}
        aria-label={previousLabel}
      >
        {timelineAssets?.previous
          ? <Image src={timelineAssets.previous} alt="" fill sizes="64px" aria-hidden="true" />
          : <span className="travel-timeline-arrow" aria-hidden="true">‹</span>}
      </button>
      <div className="travel-timeline-track-region">
        {timelineAssets?.track ? (
          <Image
            src={timelineAssets.track}
            alt=""
            width={2172}
            height={724}
            sizes="44vw"
            aria-hidden="true"
            className="travel-timeline-track"
          />
        ) : (
          <span className="travel-timeline-track is-hud" aria-hidden="true" />
        )}
        <span
          className="travel-timeline-active"
          style={{ "--timeline-active-left": `${legacyActivePosition}%` } as CSSProperties}
          aria-hidden="true"
        >
          {timelineAssets?.active
            ? <Image src={timelineAssets.active} alt="" fill sizes="72px" />
            : <span className="travel-timeline-energy-core" />}
        </span>
        <div className="travel-timeline-years">
          {legacyYears.map((year, index) => (
            <button
              type="button"
              key={year}
              className={year === focusedYear ? "is-active" : ""}
              style={{ "--timeline-year-left": `${getLegacyPosition(index)}%` } as CSSProperties}
              onClick={() => focusYear(year)}
              aria-pressed={year === focusedYear}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="travel-timeline-control is-next"
        onClick={() => focusYear(focusedYear + 1)}
        disabled={focusedYear >= maxYear}
        aria-label={nextLabel}
      >
        {timelineAssets?.next
          ? <Image src={timelineAssets.next} alt="" fill sizes="64px" aria-hidden="true" />
          : <span className="travel-timeline-arrow" aria-hidden="true">›</span>}
      </button>
    </section>
  );
}
