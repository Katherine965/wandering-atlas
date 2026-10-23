"use client";

import Image from "@/app/components/Image";
import { useEffect, useId, useRef, useState } from "react";
import { getTravelTheme, TRAVEL_THEME_REGISTRY } from "../themes/registry";
import type { TravelThemeId } from "../themes/types";

type TravelThemeSwitcherProps = {
  locale: "en" | "zh";
  theme: TravelThemeId;
  onThemeChange: (theme: TravelThemeId) => void;
};

export function TravelThemeSwitcher({
  locale,
  theme,
  onThemeChange,
}: TravelThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const gradientId = `${menuId.replaceAll(":", "")}-brass`;
  const rubyId = `${menuId.replaceAll(":", "")}-ruby`;
  const energyId = `${menuId.replaceAll(":", "")}-energy`;
  const stringLightId = `${menuId.replaceAll(":", "")}-string-light`;
  const activeTheme = getTravelTheme(theme);
  const changeLabel = locale === "zh" ? "切换图鉴" : "Change Atlas";
  const selectorLabel = locale === "zh" ? "选择图鉴主题" : "Choose atlas theme";
  const selectedLabel = locale === "zh" ? "已选择" : "Selected";
  const availableLabel = locale === "zh" ? "可用" : "Available";
  const comingSoonLabel = locale === "zh" ? "即将开放" : "Coming soon";

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape, true);
    };
  }, [isOpen]);

  return (
    <div
      className={`travel-theme-switcher${isOpen ? " is-open" : ""}`}
      data-theme={theme}
      ref={rootRef}
    >
      <button
        ref={triggerRef}
        type="button"
        className="travel-theme-trigger"
        aria-label={changeLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((current) => !current)}
      >
        {activeTheme.renderers.switcher === "asset" && activeTheme.assets.switcher ? (
          <Image
            src={activeTheme.assets.switcher}
            alt=""
            fill
            sizes="64px"
            aria-hidden="true"
            className="travel-theme-switcher-art"
          />
        ) : activeTheme.renderers.switcher === "string-light" ? (
          <svg className="travel-theme-string-light" viewBox="0 0 64 64" aria-hidden="true">
            <defs>
              <radialGradient id={stringLightId} cx="38%" cy="30%" r="70%">
                <stop offset="0" stopColor="#fff1d1" />
                <stop offset="0.22" stopColor="#ff7a58" />
                <stop offset="0.58" stopColor="#ef1f22" />
                <stop offset="1" stopColor="#650307" />
              </radialGradient>
            </defs>
            <path className="travel-theme-string-wire" d="M3 15c13 7 21-7 34 1 8 5 15 2 24-4" />
            <path className="travel-theme-string-socket" d="m24 13 14 2-1.5 11-11.8-1.7z" />
            <path className="travel-theme-string-filament" d="m29 29 4.4 7 4.2-5" />
            <path className="travel-theme-string-bulb-glow" d="M32.4 23.4c10.2 0 16.4 8.1 13.7 17.1-2.2 7.4-8.4 13.8-13.7 19.5-5.5-5.9-11.7-12.1-13.7-19.5-2.6-9 3.6-17.1 13.7-17.1Z" />
            <path className="travel-theme-string-bulb" d="M32.4 25.7c8.5 0 13.7 6.6 11.4 14.2-1.8 6.2-7 11.7-11.4 16.4-4.6-4.9-9.7-10.2-11.4-16.4-2.2-7.6 3-14.2 11.4-14.2Z" fill={`url(#${stringLightId})`} />
            <path className="travel-theme-string-shine" d="M27.5 31.5c-2.1 2.3-2.7 5.5-1.5 8.8" />
          </svg>
        ) : activeTheme.renderers.switcher === "energy-core" ? (
          <svg className="travel-theme-energy" viewBox="0 0 64 64" aria-hidden="true">
            <defs>
              <radialGradient id={energyId} cx="42%" cy="38%" r="62%">
                <stop offset="0" stopColor="#efffff" />
                <stop offset="0.25" stopColor="#64efff" />
                <stop offset="0.62" stopColor="#00a9c8" />
                <stop offset="1" stopColor="#00354b" />
              </radialGradient>
            </defs>
            <circle className="travel-theme-energy-halo" cx="32" cy="32" r="25" />
            <circle className="travel-theme-energy-ring is-outer" cx="32" cy="32" r="21" />
            <path className="travel-theme-energy-ring is-segmented" d="M32 7a25 25 0 0 1 21.6 12.5M57 32a25 25 0 0 1-12.5 21.6M32 57A25 25 0 0 1 10.4 44.5M7 32A25 25 0 0 1 19.5 10.4" />
            <path className="travel-theme-energy-diamond" d="m32 13 9.5 19L32 51l-9.5-19z" />
            <circle className="travel-theme-energy-core" cx="32" cy="32" r="8.5" fill={`url(#${energyId})`} />
            <circle className="travel-theme-energy-highlight" cx="29.2" cy="28.8" r="2.2" />
          </svg>
        ) : (
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <defs>
              <radialGradient id={gradientId} cx="38%" cy="30%" r="72%">
                <stop offset="0" stopColor="#f0cc76" />
                <stop offset="0.42" stopColor="#b8751d" />
                <stop offset="1" stopColor="#5c2c0c" />
              </radialGradient>
              <radialGradient id={rubyId} cx="36%" cy="28%" r="72%">
                <stop offset="0" stopColor="#ffb0a0" />
                <stop offset="0.24" stopColor="#c83b32" />
                <stop offset="0.72" stopColor="#7c120f" />
                <stop offset="1" stopColor="#3c0807" />
              </radialGradient>
            </defs>
            <g className="travel-theme-compass">
              <path d="M32 2.5 37 8l7.2-1.2 2.5 7 7 2.5-1.2 7.2 5.5 5-5.5 5 1.2 7.2-7 2.5-2.5 7L37 49.9 32 55.5l-5-5.6-7.2 1.3-2.5-7.1-7-2.5 1.2-7.1-5.5-5 5.5-5-1.2-7.2 7-2.5 2.5-7L27 8z" fill={`url(#${gradientId})`} stroke="#482006" strokeWidth="2" />
              <circle cx="32" cy="29.5" r="19" fill="#5b3517" stroke="#e1b85b" strokeWidth="1.6" />
              <circle cx="32" cy="29.5" r="15.8" fill="#d19a45" opacity=".24" stroke="#321405" strokeWidth="1" />
              <path d="m32 11.5 4.3 13.7 13.7 4.3-13.7 4.3L32 47.5l-4.3-13.7L14 29.5l13.7-4.3z" fill="#e3b55d" stroke="#5b2808" strokeLinejoin="round" strokeWidth="1.25" />
              <path d="m32 14.5 1.9 12.9 12.9 2.1-12.9 2.1L32 44.5l-2.1-12.9L17 29.5l12.9-2.1z" fill="#754010" opacity=".72" />
              <circle className="travel-theme-ruby-glow" cx="32" cy="29.5" r="8.4" fill="#6d0d0b" opacity=".38" />
              <circle className="travel-theme-ruby" cx="32" cy="29.5" r="6.5" fill={`url(#${rubyId})`} stroke="#3d0907" strokeWidth="1.4" />
              <circle cx="29.7" cy="27.1" r="1.65" fill="#ffd2bc" opacity=".76" />
            </g>
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="travel-theme-menu" id={menuId} role="menu" aria-label={selectorLabel}>
          <p>{selectorLabel}</p>
          <div>
            {TRAVEL_THEME_REGISTRY.map((option) => (
              <button
                type="button"
                role="menuitemradio"
                key={option.id}
                className={option.id === theme ? "is-selected" : ""}
                disabled={!option.available}
                aria-checked={option.id === theme}
                onClick={() => {
                  onThemeChange(option.id);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <span>{locale === "zh" ? option.labelZh : option.label}</span>
                <small>
                  {option.available
                    ? (option.id === theme ? selectedLabel : availableLabel)
                    : comingSoonLabel}
                </small>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
