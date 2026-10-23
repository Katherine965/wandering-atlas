"use client";

import { geoEquirectangular, geoPath } from "d3-geo";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  CanvasTexture,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  Quaternion,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type {
  TravelGeoFeatureCollection,
  TravelGlobeRotation,
} from "../travel-geometry";

type TravelCopperGlobeSurfaceProps = {
  countryGeoJson: TravelGeoFeatureCollection | null;
  initialRotation: TravelGlobeRotation;
  landmassGeoJson: TravelGeoFeatureCollection | null;
  onReadyChange: (isReady: boolean) => void;
  showCountryBorders: boolean;
  showOutline: boolean;
};

export type TravelCopperGlobeSurfaceHandle = {
  updateRotation: (rotation: TravelGlobeRotation) => void;
};

const SURFACE_TEXTURE_WIDTH = 1024;
const SURFACE_TEXTURE_HEIGHT = SURFACE_TEXTURE_WIDTH / 2;
const GLOBE_Y_AXIS = new Vector3(0, 1, 0);
const GLOBE_X_AXIS = new Vector3(1, 0, 0);

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function paintGeography(
  canvas: HTMLCanvasElement,
  landmassGeoJson: TravelGeoFeatureCollection | null,
  oceanColor: string,
  landColor: string,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  context.fillStyle = oceanColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (!landmassGeoJson) return;

  const projection = geoEquirectangular()
    .translate([canvas.width / 2, canvas.height / 2])
    .scale(canvas.width / (2 * Math.PI))
    .precision(0.35);
  const path = geoPath(projection, context);

  context.beginPath();
  path(landmassGeoJson);
  context.fillStyle = landColor;
  context.fill();
}

function paintGeographicDetails(
  canvas: HTMLCanvasElement,
  landmassGeoJson: TravelGeoFeatureCollection | null,
  countryGeoJson: TravelGeoFeatureCollection | null,
  showOutline: boolean,
  showCountryBorders: boolean,
) {
  const context = canvas.getContext("2d");
  if (!context || (!showOutline && !showCountryBorders)) return;

  const projection = geoEquirectangular()
    .translate([canvas.width / 2, canvas.height / 2])
    .scale(canvas.width / (2 * Math.PI))
    .precision(0.35);
  const path = geoPath(projection, context);

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  if (showCountryBorders && countryGeoJson) {
    context.beginPath();
    path(countryGeoJson);
    context.strokeStyle = "rgba(73, 42, 28, 0.3)";
    context.lineWidth = 0.46;
    context.stroke();
  }
  if (showOutline && landmassGeoJson) {
    context.beginPath();
    path(landmassGeoJson);
    context.strokeStyle = "rgba(68, 37, 24, 0.44)";
    context.lineWidth = 0.72;
    context.stroke();
  }
  context.restore();
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function paintBrushedWear(
  canvas: HTMLCanvasElement,
  seed: number,
  roughnessOnly = false,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const random = createSeededRandom(seed);
  context.save();

  // Fine directional wear reads as handled metal without producing stains.
  context.globalCompositeOperation = roughnessOnly ? "multiply" : "screen";
  context.lineCap = "round";
  for (let index = 0; index < 96; index += 1) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const length = 3 + random() * 15;
    const angle = (random() - 0.5) * 0.42;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    context.strokeStyle = roughnessOnly
      ? `rgba(92, 92, 92, ${0.008 + random() * 0.014})`
      : `rgba(246, 198, 143, ${0.018 + random() * 0.025})`;
    context.lineWidth = 0.22 + random() * 0.42;
    context.stroke();
  }
  context.restore();
}

function paintCopperColorSurface(
  canvas: HTMLCanvasElement,
  landmassGeoJson: TravelGeoFeatureCollection | null,
  countryGeoJson: TravelGeoFeatureCollection | null,
  showOutline: boolean,
  showCountryBorders: boolean,
) {
  paintGeography(canvas, landmassGeoJson, "#895f48", "#c9906a");
  paintBrushedWear(canvas, 3187);
  paintGeographicDetails(
    canvas,
    landmassGeoJson,
    countryGeoJson,
    showOutline,
    showCountryBorders,
  );
}

function createGrainCanvas() {
  const canvas = createCanvas(512, 256);
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const image = context.createImageData(canvas.width, canvas.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const pixel = index / 4;
    const x = pixel % canvas.width;
    const y = Math.floor(pixel / canvas.width);
    const variation = ((x * 13 + y * 3) % 7) - 3;
    const value = 128 + variation;
    image.data[index] = value;
    image.data[index + 1] = value;
    image.data[index + 2] = value;
    image.data[index + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

function applyRotation(mesh: Mesh, rotation: TravelGlobeRotation) {
  const longitude = new Quaternion().setFromAxisAngle(
    GLOBE_Y_AXIS,
    (rotation[0] - 90) * Math.PI / 180,
  );
  const latitude = new Quaternion().setFromAxisAngle(
    GLOBE_X_AXIS,
    -rotation[1] * Math.PI / 180,
  );
  mesh.quaternion.copy(latitude.multiply(longitude));
}

export const TravelCopperGlobeSurface = forwardRef<
  TravelCopperGlobeSurfaceHandle,
  TravelCopperGlobeSurfaceProps
>(function TravelCopperGlobeSurface({
  countryGeoJson,
  initialRotation,
  landmassGeoJson,
  onReadyChange,
  showCountryBorders,
  showOutline,
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detailRef = useRef({ countryGeoJson, showCountryBorders, showOutline });
  const repaintRef = useRef<(() => void) | null>(null);
  const rotationRef = useRef(initialRotation);
  const renderRef = useRef<((rotation: TravelGlobeRotation) => void) | null>(null);

  useImperativeHandle(ref, () => ({
    updateRotation(rotation) {
      rotationRef.current = rotation;
      renderRef.current?.(rotation);
    },
  }), []);

  useEffect(() => {
    detailRef.current = { countryGeoJson, showCountryBorders, showOutline };
    repaintRef.current?.();
  }, [countryGeoJson, showCountryBorders, showOutline]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: "high-performance",
      });
    } catch {
      onReadyChange(false);
      return;
    }
    renderer.setClearColor(new Color(0x000000), 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = NeutralToneMapping;
    renderer.toneMappingExposure = 1;

    const scene = new Scene();
    const camera = new PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const colorCanvas = createCanvas(SURFACE_TEXTURE_WIDTH, SURFACE_TEXTURE_HEIGHT);
    const roughnessCanvas = createCanvas(SURFACE_TEXTURE_WIDTH, SURFACE_TEXTURE_HEIGHT);
    const metalnessCanvas = createCanvas(SURFACE_TEXTURE_WIDTH, SURFACE_TEXTURE_HEIGHT);
    paintCopperColorSurface(
      colorCanvas,
      landmassGeoJson,
      detailRef.current.countryGeoJson,
      detailRef.current.showOutline,
      detailRef.current.showCountryBorders,
    );
    paintGeography(roughnessCanvas, landmassGeoJson, "#d8d8d8", "#c6c6c6");
    paintGeography(metalnessCanvas, landmassGeoJson, "#f2f2f2", "#f7f7f7");
    paintBrushedWear(roughnessCanvas, 3187, true);

    const colorMap = new CanvasTexture(colorCanvas);
    colorMap.colorSpace = SRGBColorSpace;
    const roughnessMap = new CanvasTexture(roughnessCanvas);
    const metalnessMap = new CanvasTexture(metalnessCanvas);
    const bumpMap = new CanvasTexture(createGrainCanvas());
    const textures = [colorMap, roughnessMap, metalnessMap, bumpMap];
    for (const texture of textures) {
      texture.wrapS = RepeatWrapping;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      texture.needsUpdate = true;
    }

    const geometry = new SphereGeometry(1, 96, 64);
    const material = new MeshStandardMaterial({
      bumpMap,
      bumpScale: 0.0028,
      envMapIntensity: 0.68,
      map: colorMap,
      metalness: 0.92,
      metalnessMap,
      roughness: 0.7,
      roughnessMap,
    });
    const globe = new Mesh(geometry, material);
    scene.add(globe);

    const hemisphere = new HemisphereLight(0xffe6bd, 0x76513d, 1.12);
    const keyLight = new DirectionalLight(0xffd8ad, 0.68);
    keyLight.position.set(-3.2, 4.1, 5.2);
    const fillLight = new DirectionalLight(0xd4a17c, 0.3);
    fillLight.position.set(3.5, -1.2, 2.6);
    scene.add(hemisphere, keyLight, fillLight);

    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.12);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();

    const render = (rotation: TravelGlobeRotation) => {
      const width = Math.max(Math.round(canvas.clientWidth), 1);
      const height = Math.max(Math.round(canvas.clientHeight), 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      applyRotation(globe, rotation);
      renderer.render(scene, camera);
    };
    renderRef.current = render;
    repaintRef.current = () => {
      paintCopperColorSurface(
        colorCanvas,
        landmassGeoJson,
        detailRef.current.countryGeoJson,
        detailRef.current.showOutline,
        detailRef.current.showCountryBorders,
      );
      colorMap.needsUpdate = true;
      render(rotationRef.current);
    };
    render(rotationRef.current);
    canvas.dataset.copperSurface = "clean-antique";
    canvas.dataset.metalness = material.metalness.toFixed(2);
    canvas.dataset.roughness = material.roughness.toFixed(2);
    canvas.dataset.envMapIntensity = material.envMapIntensity.toFixed(2);
    canvas.dataset.toneMapping = "neutral";
    onReadyChange(true);

    const resizeObserver = new ResizeObserver(() => render(rotationRef.current));
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      repaintRef.current = null;
      renderRef.current = null;
      environment.dispose();
      geometry.dispose();
      material.dispose();
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
    };
  }, [landmassGeoJson, onReadyChange]);

  return <canvas aria-hidden="true" className="travel-copper-globe-surface" ref={canvasRef} />;
});
