import type { AvailableTravelTheme } from "./types";

export const deepSeaTheme = {
  "id": "deep-sea",
  "label": "Deep Sea",
  "labelZh": "深海",
  "available": true,
  "brandLayout": "left",
  "capabilities": {
    "globe": true,
    "mapDetail": true
  },
  "rootClassName": "travel-theme-deep-sea",
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
        "color": "#b9edf0",
        "filter": "drop-shadow(0 0 1.2px rgba(87, 214, 222, .2))",
        "fontSize": 14.5,
        "fontWeight": 600,
        "letterSpacing": 2.6,
        "opacity": 0.4
      },
      "material": "crystalline"
    },
    "markerScale": {
      "journey": 0.5,
      "location": 0.5
    },
    "postcard": {
      "portraitPhoto": {
        "backdrop": "cool-blur",
        "fit": "contain"
      }
    },
    "timeline": {
      "frame": "asset",
      "point": "asset",
      "structure": "v2"
    }
  },
  "assets": {
    "background": "/travel/themes/deep-sea/background.png",
    "globe": {
      "landTexture": "/travel/themes/deep-sea/ui/globe_land.jpeg",
      "oceanTexture": "/travel/themes/deep-sea/ui/globe_ocean.jpeg"
    },
    "landTexture": "/travel/themes/deep-sea/ui/land-texture.png",
    "buttonFrames": {
      "sm": "/travel/themes/deep-sea/ui/buttonFrames-sm.png",
      "md": "/travel/themes/deep-sea/ui/buttonFrames-sm.png",
      "lg": "/travel/themes/deep-sea/ui/buttonFrames-sm.png"
    },
    "toolButtonFrames": {
      "sm": "/travel/themes/deep-sea/ui/buttonFrames-sm.png",
      "md": "/travel/themes/deep-sea/ui/buttonFrames-sm.png",
      "lg": "/travel/themes/deep-sea/ui/buttonFrames-sm.png"
    },
    "legendFrame": "/travel/themes/deep-sea/ui/legendFrame.png",
    "markers": {
      "journey": "/travel/themes/deep-sea/ui/markers-journey.png",
      "location": "/travel/themes/deep-sea/ui/markers-location.png"
    },
    "postcardFrame": "/travel/themes/deep-sea/ui/postcardFrame.png",
    "switcher": "/travel/themes/deep-sea/ui/switcher.png",
    "timeline": {
      "frame": "/travel/themes/deep-sea/ui/timeline.jpeg",
      "next": "/travel/themes/deep-sea/ui/timeline-next.png",
      "point": "/travel/themes/deep-sea/ui/pearl_org.jpeg",
      "previous": "/travel/themes/deep-sea/ui/timeline-previous.png",
      "track": "/travel/themes/deep-sea/ui/timeline.jpeg"
    },
    "zoomControl": "/travel/themes/deep-sea/ui/zoomControl.png"
  }
} as const satisfies AvailableTravelTheme;
