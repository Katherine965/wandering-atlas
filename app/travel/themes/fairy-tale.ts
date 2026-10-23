import type { AvailableTravelTheme } from "./types";

export const fairyTaleTheme = {
  "id": "fairy-tale",
  "label": "Fairy Tale",
  "labelZh": "童话",
  "available": true,
  "brandLayout": "center",
  "capabilities": {
    "globe": true,
    "mapDetail": true
  },
  "rootClassName": "travel-theme-fairy-tale",
  "renderers": {
    "button": "asset",
    "legend": "asset",
    "map": "investigation",
    "marker": "asset",
    "postcard": "asset",
    "switcher": "asset",
    "timeline": "asset",
    "zoom": "hud"
  },
  "visuals": {
    "globe": {
      "labels": {
        "color": "#7d3151",
        "filter": "drop-shadow(0 1px 0 rgba(255, 244, 225, .68))",
        "fontSize": 14,
        "fontWeight": 600,
        "letterSpacing": 2.1,
        "opacity": 0.48
      },
      "material": "antique",
      "surface": {
        "atmosphereEdge": "rgba(139, 108, 143, .035)",
        "atmosphereHighlight": "rgba(255, 250, 243, .075)",
        "coastStroke": "rgba(255, 247, 224, .82)",
        "coastStrokeWidth": 0.9,
        "countryStroke": "rgba(129, 78, 111, .24)",
        "countryStrokeWidth": 0.3,
        "haloBright": "rgba(255, 239, 229, .2)",
        "haloDistantFilter": "blur(8px)",
        "haloDistantOpacity": 0.16,
        "haloDim": "rgba(138, 82, 113, .02)",
        "haloMid": "rgba(226, 175, 204, .08)",
        "haloNearFilter": "blur(2px)",
        "haloNearOpacity": 0.14,
        "landBloomFill": "#d8c2ad",
        "landBloomFilter": "none",
        "landBloomOpacity": 0.92,
        "landFill": "#f2e5d3",
        "landLight": "rgba(255, 252, 242, .16)",
        "landTextureBlendMode": "normal",
        "landTextureFilter": "saturate(.68) contrast(.94) brightness(1.035)",
        "landTextureOpacity": 0.88,
        "oceanEdge": "#c4a7bf",
        "oceanHighlight": "#eadce8",
        "oceanMid": "#d8bed2",
        "oceanTextureBlendMode": "normal",
        "oceanTextureFilter": "saturate(.7) contrast(.84) brightness(1.045)",
        "oceanTextureOpacity": 0.76,
        "reflectionEdge": "rgba(255, 250, 239, .035)",
        "rimBright": "rgba(255, 246, 226, .34)",
        "rimDim": "rgba(143, 84, 117, .025)",
        "rimLightFilter": "blur(.3px)",
        "rimLightOpacity": 0.18,
        "rimLightStrokeWidth": 0.36,
        "rimMid": "rgba(244, 211, 225, .12)",
        "rimStroke": "rgba(255, 240, 220, .22)",
        "rimStrokeWidth": 0.32,
        "shadow": "rgba(129, 94, 121, .13)"
      },
      "textureLayout": {
        "land": {
          "aspectRatio": 1.3333333333333333,
          "coverageScale": 1.16,
          "horizontalTravelRatio": 0.1
        },
        "ocean": {
          "aspectRatio": 2,
          "coverageScale": 1.08,
          "horizontalTravelRatio": 0.08
        }
      }
    },
    "markerScale": {
      "journey": 0.47,
      "location": 0.46
    },
    "postcard": {
      "portraitPhoto": {
        "backdrop": "warm-blur",
        "fit": "contain"
      }
    },
    "timeline": {
      "frame": "asset",
      "layout": {
        "arrowImageScale": 1.06,
        "arrowSizeCqw": 3.9,
        "arrowYcqw": 5.62,
        "labelOffsetCqw": 1.04,
        "pointDiameterPx": 15,
        "pointImageScale": 1.82,
        "selectedImageOffsetYPx": -1,
        "selectedImageScale": 0.94,
        "selectedSizePx": 58,
        "trackYPercent": 48.6
      },
      "point": "asset",
      "structure": "v2"
    }
  },
  "assets": {
    "background": "/travel/themes/fairy-tale/background.png",
    "globe": {
      "landTexture": "/travel/themes/fairy-tale/ui/fairy_texture/globe_land.png",
      "oceanTexture": "/travel/themes/fairy-tale/ui/fairy_texture/globe_ocean.png"
    },
    "buttonFrames": {
      "sm": "/travel/themes/fairy-tale/ui/button-frame.png",
      "md": "/travel/themes/fairy-tale/ui/button-frame.png",
      "lg": "/travel/themes/fairy-tale/ui/button-frame.png"
    },
    "toolButtonFrames": {
      "sm": "/travel/themes/fairy-tale/ui/button-frame.png",
      "md": "/travel/themes/fairy-tale/ui/button-frame.png",
      "lg": "/travel/themes/fairy-tale/ui/button-frame.png"
    },
    "landTexture": "/travel/themes/fairy-tale/ui/fairy_texture/globe_land.png",
    "legendFrame": "/travel/themes/fairy-tale/ui/legend-frame.png",
    "legendMarkers": {
      "journey": "/travel/themes/fairy-tale/ui/fairy_texture/journey.png",
      "location": "/travel/themes/fairy-tale/ui/fairy_texture/location.png"
    },
    "markers": {
      "journey": "/travel/themes/fairy-tale/ui/fairy_texture/journey.png",
      "location": "/travel/themes/fairy-tale/ui/fairy_texture/location.png"
    },
    "postcardFrame": "/travel/themes/fairy-tale/ui/postcard-frame.png",
    "switcher": "/travel/themes/fairy-tale/ui/fairy_texture/theme.png",
    "timeline": {
      "frame": "/travel/themes/fairy-tale/ui/fairy_texture/timeline.png",
      "next": "/travel/themes/fairy-tale/ui/fairy_texture/future.png",
      "point": "/travel/themes/fairy-tale/ui/fairy_texture/timeline-spot.png",
      "previous": "/travel/themes/fairy-tale/ui/fairy_texture/ago.png",
      "selected": "/travel/themes/fairy-tale/ui/fairy_texture/theme.png"
    }
  }
} as const satisfies AvailableTravelTheme;
