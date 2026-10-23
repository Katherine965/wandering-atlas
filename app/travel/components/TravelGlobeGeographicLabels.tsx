import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import type { TravelGlobeLabelStyle } from "../themes/types";
import type { TravelProjectedPoint } from "../travel-geometry";
import { TRAVEL_GLOBE_GEOGRAPHIC_LABELS } from "../travel-globe-labels";

type TravelGlobeLabelProjection = TravelProjectedPoint & {
  opacity: number;
};

type TravelGlobeGeographicLabelsProps = {
  projectCoordinates: (coordinates: {
    latitude: number;
    longitude: number;
  }) => TravelGlobeLabelProjection;
  style: TravelGlobeLabelStyle;
};

type TravelGlobeLabelElements = {
  bottom: SVGTSpanElement | null;
  text: SVGTextElement | null;
  top: SVGTSpanElement | null;
};

export type TravelGlobeGeographicLabelsHandle = {
  updateProjectedPoints: (
    projectCoordinates: TravelGlobeGeographicLabelsProps["projectCoordinates"],
  ) => void;
};

export const TravelGlobeGeographicLabels = forwardRef<
  TravelGlobeGeographicLabelsHandle,
  TravelGlobeGeographicLabelsProps
>(function TravelGlobeGeographicLabels({
  projectCoordinates,
  style,
}, ref) {
  const labelRefs = useRef(new Map<string, TravelGlobeLabelElements>());

  function updateLabelRef(
    id: string,
    key: keyof TravelGlobeLabelElements,
    element: SVGTextElement | SVGTSpanElement | null,
  ) {
    const current = labelRefs.current.get(id) ?? {
      bottom: null,
      text: null,
      top: null,
    };
    if (key === "text") current.text = element as SVGTextElement | null;
    else if (key === "top") current.top = element as SVGTSpanElement | null;
    else current.bottom = element as SVGTSpanElement | null;
    labelRefs.current.set(id, current);
  }

  useImperativeHandle(ref, () => ({
    updateProjectedPoints(nextProjectCoordinates) {
      for (const label of TRAVEL_GLOBE_GEOGRAPHIC_LABELS) {
        const elements = labelRefs.current.get(label.id);
        if (!elements?.text) continue;

        const projected = nextProjectCoordinates(label);
        elements.text.style.display = projected.visible ? "" : "none";
        if (!projected.visible) continue;

        const x = String(projected.x);
        const y = String(projected.y);
        elements.text.setAttribute("x", x);
        elements.text.setAttribute("y", y);
        elements.text.setAttribute("opacity", String(style.opacity * projected.opacity));
        elements.top?.setAttribute("x", x);
        elements.top?.setAttribute("y", String(projected.y - style.fontSize * 0.55));
        elements.bottom?.setAttribute("x", x);
        elements.bottom?.setAttribute("y", String(projected.y + style.fontSize * 0.55));
      }
    },
  }), [style.fontSize, style.opacity]);

  return (
    <g
      aria-hidden="true"
      className="travel-globe-geographic-labels"
      clipPath="url(#travel-globe-sphere-clip)"
    >
      {TRAVEL_GLOBE_GEOGRAPHIC_LABELS.map((label) => {
        const projected = projectCoordinates(label);
        return (
          <text
            className="travel-globe-geographic-label"
            dominantBaseline="central"
            fill={style.color}
            filter={style.filter}
            fontSize={style.fontSize}
            fontWeight={style.fontWeight}
            key={label.id}
            letterSpacing={style.letterSpacing}
            opacity={style.opacity * projected.opacity}
            ref={(element) => updateLabelRef(label.id, "text", element)}
            style={{ display: projected.visible ? undefined : "none" }}
            textAnchor="middle"
            x={projected.x}
            y={projected.y}
          >
            <tspan
              ref={(element) => updateLabelRef(label.id, "top", element)}
              x={projected.x}
              y={projected.y - style.fontSize * 0.55}
            >
              {label.lines[0]}
            </tspan>
            <tspan
              ref={(element) => updateLabelRef(label.id, "bottom", element)}
              x={projected.x}
              y={projected.y + style.fontSize * 0.55}
            >
              {label.lines[1]}
            </tspan>
          </text>
        );
      })}
    </g>
  );
});
