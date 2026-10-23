"use client";

import type { TravelBrandLayout, TravelThemeId } from "../themes/types";
import { TravelThemeSwitcher } from "./TravelThemeSwitcher";

type TravelHeaderProps = {
  brandLayout: TravelBrandLayout;
  locale: "en" | "zh";
  onThemeChange: (theme: TravelThemeId) => void;
  subtitle: string;
  theme: TravelThemeId;
  title: string;
};

export function TravelHeader({
  brandLayout,
  locale,
  onThemeChange,
  subtitle,
  theme,
  title,
}: TravelHeaderProps) {
  return (
    <div className="travel-atlas-title-group" data-brand-layout={brandLayout}>
      <div className="travel-brand-cluster">
        <TravelThemeSwitcher locale={locale} theme={theme} onThemeChange={onThemeChange} />
        <header className="travel-atlas-header">
          <h1 lang={locale === "zh" ? "zh-CN" : "en"}>
            <span className="travel-type-label">{title}</span>
          </h1>
          <p>{subtitle}</p>
        </header>
      </div>
    </div>
  );
}
