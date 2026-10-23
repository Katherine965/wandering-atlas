import Image from "@/app/components/Image";
import type { AvailableTravelTheme } from "../themes/types";
import { TravelMarker } from "./TravelMarker";

type TravelLegendProps = {
  journeyLabel: string;
  locale: "en" | "zh";
  locationLabel: string;
  theme: AvailableTravelTheme;
};

export function TravelLegend({ journeyLabel, locale, locationLabel, theme }: TravelLegendProps) {
  return (
    <aside
      className="travel-map-legend"
      lang={locale === "zh" ? "zh-CN" : "en"}
      aria-label="Map legend"
    >
      {theme.assets.legendFrame && (
        <Image
          src={theme.assets.legendFrame}
          alt=""
          fill
          sizes="180px"
          aria-hidden="true"
          className="travel-map-legend-frame"
        />
      )}
      <div>
        <TravelMarker
          assetOverride={theme.assets.legendMarkers?.journey}
          theme={theme}
          type="journey"
        />
        <span className="travel-legend-label">
          <span className="travel-type-label">{journeyLabel}</span>
        </span>
      </div>
      <div>
        <TravelMarker
          assetOverride={theme.assets.legendMarkers?.location}
          theme={theme}
          type="location"
        />
        <span className="travel-legend-label">
          <span className="travel-type-label">{locationLabel}</span>
        </span>
      </div>
    </aside>
  );
}
