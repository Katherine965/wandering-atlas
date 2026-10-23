import Image from "@/app/components/Image";
import type { CSSProperties, ReactNode } from "react";
import type { AvailableTravelTheme } from "../themes/types";

type TravelAtlasStageProps = {
  ariaLabel: string;
  children: ReactNode;
  hasSelection: boolean;
  theme: AvailableTravelTheme;
};

export function TravelAtlasStage({
  ariaLabel,
  children,
  hasSelection,
  theme,
}: TravelAtlasStageProps) {
  const stageStyle = {
    "--travel-owner-edit-image": theme.id === "fairy-tale" ? 'url("/travel/themes/fairy-tale/ui/owner-edit-frame.png")' : undefined,
    "--travel-background-image": `url("${theme.assets.background}")`,
  } as CSSProperties;

  return (
    <section
      className={`travel-atlas-stage ${theme.rootClassName}${hasSelection ? " has-selection" : ""}`}
      data-travel-theme={theme.id}
      style={stageStyle}
      aria-label={ariaLabel}
    >
      <div className="travel-theme-background" aria-hidden="true" />
      {theme.assets.mapFrame && (
        <div className="travel-map-frame" aria-hidden="true">
          <Image
            src={theme.assets.mapFrame}
            alt=""
            fill
            priority
            sizes="80vw"
            className="travel-map-frame-image"
          />
        </div>
      )}
      {children}
    </section>
  );
}
