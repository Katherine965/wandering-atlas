"use client";

import { geoEquirectangular, geoPath } from "d3-geo";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  Object3D,
  OrthographicCamera,
  Quaternion,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import type {
  TravelGeoFeatureCollection,
  TravelGlobeRotation,
} from "../travel-geometry";

type TravelFairyFeltGlobeSurfaceProps = {
  countryGeoJson: TravelGeoFeatureCollection | null;
  initialRotation: TravelGlobeRotation;
  landTextureUrl: string;
  landmassGeoJson: TravelGeoFeatureCollection | null;
  oceanTextureUrl: string;
  onReadyChange: (isReady: boolean) => void;
  prefersReducedMotion: boolean;
  showCountryBorders: boolean;
  showOutline: boolean;
};

export type TravelFairyFeltGlobeSurfaceHandle = {
  updateRotation: (rotation: TravelGlobeRotation) => void;
};

type FeltQuality = "detailed" | "reduced";
type FeltFiberKind = "land" | "ocean" | "coast";
type FeltRenderStage = "base" | "relief" | "fibers" | "final";
type FeltFiberConfig = {
  count: number;
  lengthMax: number;
  lengthMin: number;
  tilt: number;
  widthMax: number;
  widthMin: number;
};

const SURFACE_TEXTURE_WIDTH = 1024;
const SURFACE_TEXTURE_HEIGHT = SURFACE_TEXTURE_WIDTH / 2;
const DETAILED_SPHERE_SEGMENTS = { width: 192, height: 128 };
const REDUCED_SPHERE_SEGMENTS = { width: 128, height: 80 };
const LAND_RELIEF_HEIGHT = 0.04;
const GLOBE_Y_AXIS = new Vector3(0, 1, 0);
const GLOBE_X_AXIS = new Vector3(1, 0, 0);
const FIBER_CONFIG: Record<FeltQuality, Record<FeltFiberKind, FeltFiberConfig>> = {
  detailed: {
    land: {
      count: 3200,
      lengthMin: 0.0038,
      lengthMax: 0.0065,
      tilt: 0.062,
      widthMin: 0.00066,
      widthMax: 0.00094,
    },
    ocean: {
      count: 650,
      lengthMin: 0.0012,
      lengthMax: 0.0022,
      tilt: 0.035,
      widthMin: 0.00054,
      widthMax: 0.00074,
    },
    coast: {
      count: 800,
      lengthMin: 0.0048,
      lengthMax: 0.0082,
      tilt: 0.068,
      widthMin: 0.00068,
      widthMax: 0.00096,
    },
  },
  reduced: {
    land: {
      count: 850,
      lengthMin: 0.0035,
      lengthMax: 0.0058,
      tilt: 0.055,
      widthMin: 0.00072,
      widthMax: 0.00098,
    },
    ocean: {
      count: 250,
      lengthMin: 0.0012,
      lengthMax: 0.0021,
      tilt: 0.032,
      widthMin: 0.0006,
      widthMax: 0.0008,
    },
    coast: {
      count: 180,
      lengthMin: 0.0042,
      lengthMax: 0.007,
      tilt: 0.06,
      widthMin: 0.00078,
      widthMax: 0.00102,
    },
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const progress = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function createProjection(width: number, height: number) {
  return geoEquirectangular()
    .translate([width / 2, height / 2])
    .scale(width / (2 * Math.PI))
    .precision(0.3);
}

function paintLandPath(
  context: CanvasRenderingContext2D,
  landmassGeoJson: TravelGeoFeatureCollection,
) {
  const path = geoPath(
    createProjection(context.canvas.width, context.canvas.height),
    context,
  );
  context.beginPath();
  path(landmassGeoJson);
}

function createLandMask(landmassGeoJson: TravelGeoFeatureCollection) {
  const binaryCanvas = createCanvas(SURFACE_TEXTURE_WIDTH, SURFACE_TEXTURE_HEIGHT);
  const binaryContext = binaryCanvas.getContext("2d");
  if (!binaryContext) throw new Error("Unable to create felt land mask.");

  binaryContext.fillStyle = "#000";
  binaryContext.fillRect(0, 0, binaryCanvas.width, binaryCanvas.height);
  paintLandPath(binaryContext, landmassGeoJson);
  binaryContext.fillStyle = "#fff";
  binaryContext.fill();

  const softCanvas = createCanvas(SURFACE_TEXTURE_WIDTH, SURFACE_TEXTURE_HEIGHT);
  const softContext = softCanvas.getContext("2d", { willReadFrequently: true });
  if (!softContext) throw new Error("Unable to soften felt land mask.");

  softContext.fillStyle = "#000";
  softContext.fillRect(0, 0, softCanvas.width, softCanvas.height);
  softContext.filter = "blur(2.6px)";
  for (const offset of [-softCanvas.width, 0, softCanvas.width]) {
    softContext.drawImage(binaryCanvas, offset, 0);
  }
  softContext.filter = "none";

  return {
    canvas: softCanvas,
    data: softContext.getImageData(0, 0, softCanvas.width, softCanvas.height).data,
  };
}

function sampleMask(
  mask: Uint8ClampedArray,
  width: number,
  height: number,
  u: number,
  v: number,
) {
  const wrappedU = ((u % 1) + 1) % 1;
  const x = Math.min(Math.floor(wrappedU * width), width - 1);
  const y = clamp(Math.floor((1 - v) * height), 0, height - 1);
  return mask[(y * width + x) * 4] / 255;
}

function getReliefAmount(maskValue: number, normal?: Vector3) {
  if (!normal) return smoothstep(0.1, 0.9, maskValue);
  const edgeWeight = 1 - clamp(Math.abs(maskValue - 0.5) * 2, 0, 1);
  const irregularity = (
    Math.sin(normal.x * 91 + normal.y * 57 + normal.z * 73)
    + Math.sin(normal.x * 43 - normal.y * 79 + normal.z * 31) * 0.5
  ) * 0.035 * edgeWeight;
  return smoothstep(0.1, 0.9, clamp(maskValue + irregularity, 0, 1));
}

function createDisplacedSphereGeometry(
  mask: Uint8ClampedArray,
  quality: FeltQuality,
  reliefHeight: number,
) {
  const segments = quality === "detailed"
    ? DETAILED_SPHERE_SEGMENTS
    : REDUCED_SPHERE_SEGMENTS;
  const geometry = new SphereGeometry(1, segments.width, segments.height);
  const positions = geometry.attributes.position;
  const uvs = geometry.attributes.uv;
  const normal = new Vector3();

  for (let index = 0; index < positions.count; index += 1) {
    normal.fromBufferAttribute(positions, index).normalize();
    const maskValue = sampleMask(
      mask,
      SURFACE_TEXTURE_WIDTH,
      SURFACE_TEXTURE_HEIGHT,
      uvs.getX(index),
      uvs.getY(index),
    );
    const radius = 1 + reliefHeight * getReliefAmount(maskValue, normal);
    positions.setXYZ(index, normal.x * radius, normal.y * radius, normal.z * radius);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load felt texture: ${url}`));
    image.src = url;
  });
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
) {
  const scale = Math.max(
    context.canvas.width / image.naturalWidth,
    context.canvas.height / image.naturalHeight,
  );
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(
    image,
    (context.canvas.width - width) / 2,
    (context.canvas.height - height) / 2,
    width,
    height,
  );
}

function paintSurfaceTexture(
  canvas: HTMLCanvasElement,
  oceanImage: HTMLImageElement,
  landImage: HTMLImageElement,
  landmassGeoJson: TravelGeoFeatureCollection,
  countryGeoJson: TravelGeoFeatureCollection | null,
  showOutline: boolean,
  showCountryBorders: boolean,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  drawCover(context, oceanImage);
  context.fillStyle = "rgba(255, 183, 210, 0.46)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.save();
  paintLandPath(context, landmassGeoJson);
  context.clip();
  drawCover(context, landImage);
  context.fillStyle = "rgba(255, 250, 240, 0.62)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();

  const projection = createProjection(canvas.width, canvas.height);
  const path = geoPath(projection, context);
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  if (showCountryBorders && countryGeoJson) {
    context.beginPath();
    path(countryGeoJson);
    context.strokeStyle = "rgba(128, 88, 116, 0.22)";
    context.lineWidth = 0.52;
    context.stroke();
  }
  if (showOutline) {
    context.beginPath();
    path(landmassGeoJson);
    context.strokeStyle = "rgba(255, 255, 250, 0.62)";
    context.lineWidth = 0.7;
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

function spherePointToUv(point: Vector3) {
  const phi = Math.acos(clamp(point.y, -1, 1));
  let theta = Math.atan2(point.z, -point.x);
  if (theta < 0) theta += Math.PI * 2;
  return { u: theta / (Math.PI * 2), v: 1 - phi / Math.PI };
}

function acceptsFiber(kind: FeltFiberKind, maskValue: number) {
  if (kind === "land") return maskValue >= 0.72;
  if (kind === "ocean") return maskValue <= 0.12;
  return maskValue > 0.28 && maskValue < 0.72;
}

function createFiberMesh(
  kind: FeltFiberKind,
  quality: FeltQuality,
  geometry: BoxGeometry,
  material: MeshBasicMaterial,
  mask: Uint8ClampedArray,
  reliefHeight: number,
  seed: number,
) {
  const config = FIBER_CONFIG[quality][kind];
  const mesh = new InstancedMesh(geometry, material, config.count);
  const random = createSeededRandom(seed);
  const instance = new Object3D();
  const normal = new Vector3();
  const tangent = new Vector3();
  const base = new Vector3();
  const surfaceRotation = new Quaternion();
  const tiltRotation = new Quaternion();
  let fiberCount = 0;

  for (
    let attempt = 0;
    fiberCount < config.count && attempt < config.count * 42;
    attempt += 1
  ) {
    const y = random() * 2 - 1;
    const angle = random() * Math.PI * 2;
    const radiusAtY = Math.sqrt(Math.max(1 - y * y, 0));
    normal.set(
      radiusAtY * Math.cos(angle),
      y,
      radiusAtY * Math.sin(angle),
    ).normalize();
    const uv = spherePointToUv(normal);
    const maskValue = sampleMask(
      mask,
      SURFACE_TEXTURE_WIDTH,
      SURFACE_TEXTURE_HEIGHT,
      uv.u,
      uv.v,
    );
    if (!acceptsFiber(kind, maskValue)) continue;

    const relief = getReliefAmount(maskValue, normal);
    const baseRadius = 1 + reliefHeight * relief - 0.0015;
    base.copy(normal).multiplyScalar(baseRadius);
    tangent.set(-normal.z, 0, normal.x);
    if (tangent.lengthSq() < 1e-5) tangent.set(1, 0, 0);
    tangent.normalize();

    surfaceRotation.setFromUnitVectors(GLOBE_Y_AXIS, normal);
    tiltRotation.setFromAxisAngle(
      tangent,
      (random() * 2 - 1) * config.tilt,
    );
    instance.position.copy(base);
    instance.quaternion.copy(tiltRotation).multiply(surfaceRotation);
    instance.scale.set(
      config.widthMin + random() * (config.widthMax - config.widthMin),
      config.lengthMin + random() * (config.lengthMax - config.lengthMin),
      config.widthMin + random() * (config.widthMax - config.widthMin),
    );
    instance.updateMatrix();
    mesh.setMatrixAt(fiberCount, instance.matrix);
    fiberCount += 1;
  }

  mesh.count = fiberCount;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  return { count: fiberCount, mesh };
}

function applyRotation(group: Group, rotation: TravelGlobeRotation) {
  const longitude = new Quaternion().setFromAxisAngle(
    GLOBE_Y_AXIS,
    (rotation[0] - 90) * Math.PI / 180,
  );
  const latitude = new Quaternion().setFromAxisAngle(
    GLOBE_X_AXIS,
    -rotation[1] * Math.PI / 180,
  );
  group.quaternion.copy(latitude.multiply(longitude));
}

function getFeltQuality(prefersReducedMotion: boolean): FeltQuality {
  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
  if (
    prefersReducedMotion
    || (navigatorWithMemory.deviceMemory ?? 8) < 4
    || navigator.hardwareConcurrency < 6
  ) {
    return "reduced";
  }
  return "detailed";
}

function getFeltRenderStage(): FeltRenderStage {
  if (process.env.NODE_ENV === "production") return "final";
  const params = new URLSearchParams(window.location.search);
  if (params.get("feltDebug") !== "1") return "final";
  const stage = params.get("feltStage");
  return stage === "base" || stage === "relief" || stage === "fibers"
    ? stage
    : "final";
}

export const TravelFairyFeltGlobeSurface = forwardRef<
  TravelFairyFeltGlobeSurfaceHandle,
  TravelFairyFeltGlobeSurfaceProps
>(function TravelFairyFeltGlobeSurface({
  countryGeoJson,
  initialRotation,
  landTextureUrl,
  landmassGeoJson,
  oceanTextureUrl,
  onReadyChange,
  prefersReducedMotion,
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
    const targetCanvas = canvasRef.current;
    const targetLandmass = landmassGeoJson;
    if (!targetCanvas || !targetLandmass) {
      onReadyChange(false);
      return;
    }
    const renderCanvas = targetCanvas;
    const landmass = targetLandmass;

    let disposed = false;
    let disposeResources = () => {};
    onReadyChange(false);

    async function initialize() {
      const startedAt = performance.now();
      const [landImage, oceanImage] = await Promise.all([
        loadImage(landTextureUrl),
        loadImage(oceanTextureUrl),
      ]);
      if (disposed) return;
      const buildStartedAt = performance.now();

      let renderer: WebGLRenderer;
      try {
        renderer = new WebGLRenderer({
          alpha: true,
          antialias: true,
          canvas: renderCanvas,
          powerPreference: "high-performance",
        });
      } catch {
        onReadyChange(false);
        return;
      }

      const quality = getFeltQuality(prefersReducedMotion);
      const renderStage = getFeltRenderStage();
      const hasRelief = renderStage === "relief" || renderStage === "final";
      const hasFibers = renderStage === "fibers" || renderStage === "final";
      const reliefHeight = hasRelief ? LAND_RELIEF_HEIGHT : 0;
      const landMask = createLandMask(landmass);
      const surfaceCanvas = createCanvas(SURFACE_TEXTURE_WIDTH, SURFACE_TEXTURE_HEIGHT);
      paintSurfaceTexture(
        surfaceCanvas,
        oceanImage,
        landImage,
        landmass,
        detailRef.current.countryGeoJson,
        detailRef.current.showOutline,
        detailRef.current.showCountryBorders,
      );

      renderer.setClearColor(new Color(0x000000), 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === "detailed" ? 2 : 1.35));
      renderer.outputColorSpace = SRGBColorSpace;
      renderer.shadowMap.enabled = false;
      renderer.toneMapping = NeutralToneMapping;
      renderer.toneMappingExposure = 1;

      const scene = new Scene();
      const camera = new OrthographicCamera(-1.1, 1.1, 1.1, -1.1, 0.1, 100);
      camera.position.set(0, 0, 4);

      const surfaceMap = new CanvasTexture(surfaceCanvas);
      surfaceMap.colorSpace = SRGBColorSpace;
      surfaceMap.wrapS = RepeatWrapping;
      surfaceMap.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      surfaceMap.needsUpdate = true;

      const globeGeometry = createDisplacedSphereGeometry(
        landMask.data,
        quality,
        reliefHeight,
      );
      const globeMaterial = new MeshStandardMaterial({
        bumpMap: surfaceMap,
        bumpScale: hasRelief ? 0.0018 : 0,
        emissive: 0xffffff,
        emissiveIntensity: 0.06,
        emissiveMap: surfaceMap,
        map: surfaceMap,
        metalness: 0,
        roughness: 0.98,
      });
      const globe = new Mesh(globeGeometry, globeMaterial);

      let fiberGeometry: BoxGeometry | null = null;
      let landFibers: ReturnType<typeof createFiberMesh> | null = null;
      let oceanFibers: ReturnType<typeof createFiberMesh> | null = null;
      let coastFibers: ReturnType<typeof createFiberMesh> | null = null;
      const landFiberMaterial = new MeshBasicMaterial({
        color: 0xfff8ea,
        depthWrite: true,
        opacity: 1,
        toneMapped: false,
        transparent: false,
      });
      const oceanFiberMaterial = new MeshBasicMaterial({
        color: 0xf4bbd3,
        depthWrite: true,
        opacity: 1,
        toneMapped: false,
        transparent: false,
      });
      const coastFiberMaterial = new MeshBasicMaterial({
        color: 0xfffbf2,
        depthWrite: true,
        opacity: 1,
        toneMapped: false,
        transparent: false,
      });
      if (hasFibers) {
        fiberGeometry = new BoxGeometry(1, 1, 1);
        fiberGeometry.translate(0, 0.5, 0);
        landFibers = createFiberMesh(
          "land",
          quality,
          fiberGeometry,
          landFiberMaterial,
          landMask.data,
          reliefHeight,
          3197,
        );
        oceanFibers = createFiberMesh(
          "ocean",
          quality,
          fiberGeometry,
          oceanFiberMaterial,
          landMask.data,
          reliefHeight,
          8821,
        );
        coastFibers = createFiberMesh(
          "coast",
          quality,
          fiberGeometry,
          coastFiberMaterial,
          landMask.data,
          reliefHeight,
          5413,
        );
      }

      const globeGroup = new Group();
      globeGroup.add(globe);
      if (landFibers && oceanFibers && coastFibers) {
        globeGroup.add(landFibers.mesh, oceanFibers.mesh, coastFibers.mesh);
      }
      scene.add(globeGroup);

      const hemisphere = new HemisphereLight(0xfffbf8, 0xf6e4ec, 1.48);
      const keyLight = new DirectionalLight(0xfffaf5, 1.16);
      keyLight.position.set(-3.6, 4.5, 5.6);
      const fillLight = new DirectionalLight(0xffe7f0, 0.36);
      fillLight.position.set(3.4, -1.4, 3.2);
      scene.add(hemisphere, keyLight, fillLight);

      const render = (rotation: TravelGlobeRotation) => {
        const renderStartedAt = performance.now();
        const width = Math.max(Math.round(renderCanvas.clientWidth), 1);
        const height = Math.max(Math.round(renderCanvas.clientHeight), 1);
        const aspect = width / height;
        renderer.setSize(width, height, false);
        camera.left = -1.1 * aspect;
        camera.right = 1.1 * aspect;
        camera.updateProjectionMatrix();
        applyRotation(globeGroup, rotation);
        renderer.render(scene, camera);
        renderCanvas.dataset.lastRenderMs = (performance.now() - renderStartedAt).toFixed(2);
      };
      renderRef.current = render;
      repaintRef.current = () => {
        paintSurfaceTexture(
          surfaceCanvas,
          oceanImage,
          landImage,
          landmass,
          detailRef.current.countryGeoJson,
          detailRef.current.showOutline,
          detailRef.current.showCountryBorders,
        );
        surfaceMap.needsUpdate = true;
        render(rotationRef.current);
      };
      render(rotationRef.current);

      const fiberCount = (landFibers?.count ?? 0)
        + (oceanFibers?.count ?? 0)
        + (coastFibers?.count ?? 0);
      renderCanvas.dataset.feltStage = renderStage;
      renderCanvas.dataset.feltQuality = quality;
      renderCanvas.dataset.fiberCount = String(fiberCount);
      renderCanvas.dataset.landFiberCount = String(landFibers?.count ?? 0);
      renderCanvas.dataset.oceanFiberCount = String(oceanFibers?.count ?? 0);
      renderCanvas.dataset.coastFiberCount = String(coastFibers?.count ?? 0);
      renderCanvas.dataset.fiberShadows = "off";
      renderCanvas.dataset.fiberTransparency = "opaque";
      renderCanvas.dataset.outputColorSpace = "srgb";
      renderCanvas.dataset.toneMapping = "neutral";
      renderCanvas.dataset.initMs = (performance.now() - startedAt).toFixed(1);
      renderCanvas.dataset.buildMs = (performance.now() - buildStartedAt).toFixed(1);
      renderCanvas.dataset.drawCalls = String(renderer.info.render.calls);
      renderCanvas.dataset.triangles = String(renderer.info.render.triangles);
      renderCanvas.dataset.sphereVertices = String(globeGeometry.attributes.position.count);
      renderCanvas.dataset.landReliefPercent = String(reliefHeight * 100);
      onReadyChange(true);

      const resizeObserver = new ResizeObserver(() => render(rotationRef.current));
      resizeObserver.observe(renderCanvas);

      disposeResources = () => {
        resizeObserver.disconnect();
        repaintRef.current = null;
        renderRef.current = null;
        globeGeometry.dispose();
        globeMaterial.dispose();
        fiberGeometry?.dispose();
        landFiberMaterial.dispose();
        oceanFiberMaterial.dispose();
        coastFiberMaterial.dispose();
        surfaceMap.dispose();
        renderer.dispose();
      };
    }

    void initialize().catch(() => {
      if (!disposed) onReadyChange(false);
    });

    return () => {
      disposed = true;
      disposeResources();
      repaintRef.current = null;
      renderRef.current = null;
      onReadyChange(false);
    };
  }, [
    landTextureUrl,
    landmassGeoJson,
    oceanTextureUrl,
    onReadyChange,
    prefersReducedMotion,
  ]);

  return (
    <canvas
      aria-hidden="true"
      className="travel-fairy-felt-globe-surface"
      ref={canvasRef}
    />
  );
});
