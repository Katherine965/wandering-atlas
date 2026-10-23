import type { AvailableTravelTheme } from "./types";

export const iceWorldTheme = {
  "id": "ice-world",
  "label": "Ice World",
  "labelZh": "冰雪世界",
  "available": true,
  "brandLayout": "center",
  "capabilities": {
    "globe": true,
    "mapDetail": true
  },
  "rootClassName": "travel-theme-ice-world",
  "renderers": {
    "button": "asset",
    "legend": "asset",
    "map": "investigation",
    "marker": "asset",
    "postcard": "asset",
    "switcher": "asset",
    "timeline": "asset",
    "zoom": "asset"
  },
  "visuals": {
    "globe": {
      "labels": {
        "color": "#dff6ff",
        "filter": "drop-shadow(0 0 2px rgba(111, 199, 247, .52))",
        "fontSize": 14,
        "fontWeight": 600,
        "letterSpacing": 2.3,
        "opacity": 0.5
      },
      "material": "crystalline",
      "surface": {
        "atmosphereEdge": "rgba(35, 104, 168, .08)",
        "atmosphereHighlight": "rgba(231, 250, 255, .18)",
        "coastGlowInnerOpacity": 0.42,
        "coastGlowInnerStroke": "rgba(132, 218, 255, .72)",
        "coastGlowInnerWidth": 2.4,
        "coastGlowOuterOpacity": 0.2,
        "coastGlowOuterStroke": "rgba(87, 190, 246, .54)",
        "coastGlowOuterWidth": 6.5,
        "coastStroke": "rgba(232, 251, 255, .9)",
        "coastStrokeWidth": 0.66,
        "countryStroke": "rgba(72, 137, 192, .42)",
        "countryStrokeWidth": 0.34,
        "haloBright": "rgba(202, 244, 255, .5)",
        "haloDistantFilter": "blur(13px)",
        "haloDistantOpacity": 0.76,
        "haloDim": "rgba(60, 133, 195, .03)",
        "haloMid": "rgba(120, 207, 247, .2)",
        "haloNearFilter": "blur(3.2px)",
        "haloNearOpacity": 0.86,
        "landBloomFill": "rgba(164, 225, 255, .28)",
        "landBloomFilter": "blur(2px) drop-shadow(0 0 3px rgba(126, 207, 250, .34))",
        "landBloomOpacity": 0.28,
        "landFill": "#7bb5da",
        "landLight": "rgba(255, 255, 255, .08)",
        "landTextureBlendMode": "normal",
        "landTextureFilter": "saturate(.72) contrast(1.16) brightness(.82)",
        "landTextureOpacity": 0.94,
        "oceanEdge": "#020d25",
        "oceanHighlight": "#124b86",
        "oceanMid": "#062a58",
        "oceanTextureBlendMode": "normal",
        "oceanTextureFilter": "saturate(1.04) contrast(1.12) brightness(.72)",
        "oceanTextureOpacity": 0.9,
        "reflectionEdge": "rgba(215, 246, 255, .12)",
        "rimBright": "rgba(235, 253, 255, .54)",
        "rimDim": "rgba(63, 137, 198, .05)",
        "rimLightFilter": "blur(.35px)",
        "rimLightOpacity": 0.24,
        "rimLightStrokeWidth": 0.42,
        "rimMid": "rgba(138, 215, 250, .2)",
        "rimStroke": "rgba(190, 232, 252, .16)",
        "rimStrokeWidth": 0.28,
        "shadow": "rgba(8, 38, 81, .48)"
      },
      "textureLayout": {
        "land": {
          "aspectRatio": 2,
          "coverageScale": 1.18,
          "horizontalTravelRatio": 0.18
        },
        "ocean": {
          "aspectRatio": 2,
          "coverageScale": 1.18,
          "horizontalTravelRatio": 0.18
        }
      }
    },
    "markerScale": {
      "journey": 0.72,
      "location": 0.72
    },
    "postcard": {
      "portraitPhoto": {
        "backdrop": "cool-blur",
        "fit": "contain"
      }
    },
    "timeline": {
      "frame": "asset",
      "layout": {
        "arrowSizeCqw": 3.6,
        "arrowYcqw": 6.38,
        "labelOffsetCqw": 0.9,
        "pointDiameterPx": 27,
        "selectedImageOffsetYPx": 0.8,
        "selectedSizePx": 44,
        "trackYPercent": 48.7
      },
      "point": "asset",
      "structure": "v2"
    }
  },
  "assets": {
    "background": "/travel/themes/ice-world/background.jpeg",
    "globe": {
      "landTexture": "/travel/themes/ice-world/ui/globe_land.jpeg",
      "oceanTexture": "/travel/themes/ice-world/ui/globe_ocean.jpeg"
    },
    "buttonFrames": {
      "sm": "/travel/themes/ice-world/ui/button1.jpeg",
      "md": "/travel/themes/ice-world/ui/button1.jpeg",
      "lg": "/travel/themes/ice-world/ui/button1.jpeg"
    },
    "toolButtonFrames": {
      "sm": "/travel/themes/ice-world/ui/button1.jpeg",
      "md": "/travel/themes/ice-world/ui/button1.jpeg",
      "lg": "/travel/themes/ice-world/ui/button1.jpeg"
    },
    "landTexture": "/travel/themes/ice-world/ui/map-texture.jpeg",
    "legendMarkers": {
      "journey": "/travel/themes/ice-world/ui/journey.jpeg",
      "location": "/travel/themes/ice-world/ui/location.jpeg"
    },
    "markers": {
      "journey": "/travel/themes/ice-world/ui/journey.jpeg",
      "location": "/travel/themes/ice-world/ui/location.jpeg"
    },
    "postcardFrame": "/travel/themes/ice-world/ui/postcard-texture.jpeg",
    "postcardOverlay": "/travel/themes/ice-world/ui/postcard-frame.jpeg",
    "switcher": "/travel/themes/ice-world/ui/theme-change.jpeg",
    "timeline": {
      "active": "/travel/themes/ice-world/ui/timeline-dot.jpeg",
      "frame": "/travel/themes/ice-world/ui/timeline.jpeg",
      "point": "/travel/themes/ice-world/ui/timeline_selected.jpeg",
      "selected": "/travel/themes/ice-world/ui/timeline-dot.jpeg"
    },
    "zoomControl": "/travel/themes/ice-world/ui/zoom.jpeg"
  }
} as const satisfies AvailableTravelTheme;
