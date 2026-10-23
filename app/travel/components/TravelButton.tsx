"use client";

import Image from "@/app/components/Image";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { AvailableTravelTheme } from "../themes/types";

type TravelButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  frame?: "sm" | "md" | "lg";
  frameAsset?: "button" | "legend";
  icon?: ReactNode;
  theme: AvailableTravelTheme;
};

export function TravelButton({
  children,
  className = "",
  frame = "md",
  frameAsset = "button",
  icon,
  theme,
  type = "button",
  ...buttonProps
}: TravelButtonProps) {
  const frameSource = frameAsset === "legend"
    ? theme.assets.toolButtonFrames?.[frame]
      ?? theme.assets.buttonFrames?.[frame]
      ?? theme.assets.legendFrame
    : theme.assets.buttonFrames?.[frame];

  return (
    <button
      {...buttonProps}
      type={type}
      className={`travel-button travel-button-${frame} parchment-button parchment-button-${frame}${className ? ` ${className}` : ""}`}
    >
      {frameSource && (
        <Image
          src={frameSource}
          alt=""
          fill
          sizes="220px"
          aria-hidden="true"
          className="parchment-button-frame"
        />
      )}
      <span className="travel-button-label parchment-button-label">
        {icon}
        <span className="travel-control-label">{children}</span>
      </span>
    </button>
  );
}
