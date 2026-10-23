import type { AvailableTravelTheme } from "./types";

export const cyberTheme = {
  "id": "cyber",
  "label": "Cyber",
  "labelZh": "赛博",
  "available": true,
  "brandLayout": "left",
  "capabilities": {
    "globe": true,
    "mapDetail": true
  },
  "rootClassName": "travel-theme-cyber",
  "renderers": {
    "button": "hud",
    "legend": "hud",
    "map": "neon",
    "marker": "hud",
    "postcard": "hud",
    "switcher": "energy-core",
    "timeline": "hud",
    "zoom": "hud"
  },
  "visuals": {
    "globe": {
      "labels": {
        "color": "#77ecf7",
        "filter": "drop-shadow(0 0 2px rgba(45, 225, 249, .65))",
        "fontSize": 13.5,
        "fontWeight": 600,
        "letterSpacing": 2.8,
        "opacity": 0.55
      },
      "material": "crystalline",
      "surface": {
        "atmosphereEdge": "rgba(0, 83, 108, .06)",
        "atmosphereHighlight": "rgba(92, 235, 247, .12)",
        "coastGlowInnerOpacity": 0.52,
        "coastGlowInnerStroke": "rgba(61, 229, 246, .82)",
        "coastGlowInnerWidth": 2.8,
        "coastGlowOuterOpacity": 0.28,
        "coastGlowOuterStroke": "rgba(13, 175, 210, .62)",
        "coastGlowOuterWidth": 7,
        "coastStroke": "rgba(197, 253, 255, .92)",
        "coastStrokeWidth": 0.72,
        "countryStroke": "rgba(83, 226, 244, .24)",
        "countryStrokeWidth": 0.32,
        "haloBright": "rgba(82, 239, 250, .5)",
        "haloDistantFilter": "blur(14px)",
        "haloDistantOpacity": 0.72,
        "haloDim": "rgba(10, 107, 137, .03)",
        "haloMid": "rgba(35, 205, 229, .2)",
        "haloNearFilter": "blur(3.5px)",
        "haloNearOpacity": 0.84,
        "landBloomFill": "rgba(26, 207, 225, .24)",
        "landBloomFilter": "blur(2px) drop-shadow(0 0 3px rgba(21, 199, 222, .38))",
        "landBloomOpacity": 0.24,
        "landFill": "#073542",
        "landFilter": "drop-shadow(0 0 2px rgba(42, 219, 238, .32))",
        "landLight": "rgba(173, 249, 250, .06)",
        "landTextureBlendMode": "normal",
        "landTextureFilter": "saturate(.84) contrast(1.2) brightness(.7)",
        "landTextureOpacity": 0.84,
        "oceanEdge": "#000408",
        "oceanHighlight": "#042a34",
        "oceanMid": "#001218",
        "oceanTextureBlendMode": "normal",
        "oceanTextureFilter": "saturate(.9) contrast(1.18) brightness(.64)",
        "oceanTextureOpacity": 0.92,
        "reflectionEdge": "rgba(55, 222, 238, .08)",
        "rimBright": "rgba(173, 251, 252, .46)",
        "rimDim": "rgba(17, 126, 153, .04)",
        "rimLightFilter": "blur(.4px)",
        "rimLightOpacity": 0.22,
        "rimLightStrokeWidth": 0.4,
        "rimMid": "rgba(58, 218, 232, .18)",
        "rimStroke": "rgba(51, 205, 224, .14)",
        "rimStrokeWidth": 0.26,
        "shadow": "rgba(0, 2, 8, .7)"
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
      "location": 0.62
    },
    "postcard": {
      "portraitPhoto": {
        "backdrop": "cool-blur",
        "fit": "contain"
      }
    },
    "timeline": {
      "frame": "hud",
      "layout": {
        "labelOffsetCqw": 0.8,
        "hudTrackInsetCqw": 1.25,
        "pointDiameterPx": 9,
        "selectedSizePx": 38,
        "trackYPercent": 52
      },
      "point": "hud",
      "structure": "v2"
    }
  },
  "assets": {
    "background": "/travel/themes/cyber/cyber-background.png",
    "globe": {
      "landTexture": "/travel/themes/cyber/ui/globe_land.jpeg",
      "oceanTexture": "/travel/themes/cyber/ui/globe_ocean.jpeg"
    }
  }
} as const satisfies AvailableTravelTheme;
