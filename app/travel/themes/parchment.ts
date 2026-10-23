import type { AvailableTravelTheme } from "./types";

export const parchmentTheme = {
  "id": "parchment",
  "label": "Parchment",
  "labelZh": "羊皮纸",
  "available": true,
  "brandLayout": "center",
  "capabilities": {
    "globe": true,
    "mapDetail": true
  },
  "rootClassName": "travel-theme-parchment",
  "renderers": {
    "button": "asset",
    "legend": "asset",
    "map": "ink",
    "marker": "asset",
    "postcard": "asset",
    "switcher": "compass",
    "timeline": "asset",
    "zoom": "asset"
  },
  "visuals": {
    "globe": {
      "labels": {
        "color": "#e8c18f",
        "filter": "drop-shadow(0 1px 1px rgba(54, 29, 18, .72))",
        "fontSize": 14.5,
        "fontWeight": 600,
        "letterSpacing": 2.1,
        "opacity": 0.62
      },
      "material": "antique",
      "surface": {
        "coastStroke": "rgba(54, 25, 8, .82)",
        "coastStrokeWidth": 0.88,
        "countryStroke": "rgba(77, 39, 15, .52)",
        "countryStrokeWidth": 0.46,
        "shadow": "rgba(43, 20, 5, .46)"
      }
    },
    "markerScale": {
      "journey": 0.82,
      "location": 0.82
    },
    "postcard": {
      "portraitPhoto": {
        "backdrop": "warm-blur",
        "fit": "contain"
      }
    },
    "timeline": {
      "frame": "hud",
      "layout": {
        "labelOffsetCqw": 0.82,
        "pointDiameterPx": 10,
        "selectedSizePx": 38,
        "trackYPercent": 52
      },
      "point": "hud",
      "structure": "v2"
    }
  },
  "assets": {
    "background": "/travel/themes/parchment/parchment-background.png",
    "globe": {},
    "buttonFrames": {
      "sm": "/travel/themes/parchment/ui/button-frame-sm.png",
      "md": "/travel/themes/parchment/ui/button-frame-md.png",
      "lg": "/travel/themes/parchment/ui/button-frame-lg.png"
    },
    "legendFrame": "/travel/themes/parchment/ui/legend-frame.png",
    "markers": {
      "journey": "/travel/themes/parchment/ui/marker-journey.png",
      "location": "/travel/themes/parchment/ui/marker-location.png"
    },
    "postcardFrame": "/travel/themes/parchment/ui/postcard-frame.png",
    "timeline": {
      "active": "/travel/themes/parchment/ui/timeline-active.png",
      "next": "/travel/themes/parchment/ui/timeline-next.png",
      "previous": "/travel/themes/parchment/ui/timeline-prev.png",
      "track": "/travel/themes/parchment/ui/timeline-track.png"
    },
    "zoomControl": "/travel/themes/parchment/ui/zoom-control.png"
  }
} as const satisfies AvailableTravelTheme;
