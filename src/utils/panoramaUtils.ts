import { Position, PanoPosition } from "@/types/scenes";
import { FileURLManager } from "./fileHelpers";

// Check WebGL support with detailed diagnostics
export function checkWebGLSupport(): boolean {
  if (typeof window === "undefined" || !document) {
    return false;
  }
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl") as WebGLRenderingContext) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext);
    if (!gl) {
      console.warn("WebGL not supported: No WebGL context available");
      return false;
    }

    // Check if WebGL is actually working
    const version = gl.getParameter(gl.VERSION);
    if (!version) {
      console.warn("WebGL not working: Cannot get version");
      return false;
    }

    // Test basic WebGL functionality
    try {
      const buffer = gl.createBuffer();
      if (!buffer) {
        console.warn("WebGL not working: Cannot create buffer");
        return false;
      }
      gl.deleteBuffer(buffer);
    } catch (e) {
      console.warn("WebGL not working: Buffer test failed", e);
      return false;
    }

    console.log("WebGL support confirmed:", version);
    return true;
  } catch (e) {
    console.warn("WebGL check failed:", e);
    return false;
  }
}

// Get WebGL diagnostics information
export function getWebGLDiagnostics(): string {
  if (typeof window === "undefined" || !document) {
    return "Not in browser environment";
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl") as WebGLRenderingContext) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext);

    if (!gl) {
      return "WebGL not available";
    }

    const info = {
      version: gl.getParameter(gl.VERSION),
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
    };

    return JSON.stringify(info, null, 2);
  } catch (e) {
    return `WebGL diagnostics failed: ${e}`;
  }
}

// Create ripple effect
export function createRipple(
  x: number,
  y: number,
  container?: HTMLElement | null,
): void {
  const ripple = document.createElement("div");
  ripple.classList.add("touch-ripple");
  ripple.style.left = x + "px";
  ripple.style.top = y + "px";

  const parent = container || document.body;
  parent.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Calculate distance between two positions
export function calculateDistance(
  pos1: Position | PanoPosition,
  pos2: Position | PanoPosition,
): number {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}

// Format floor label
export function formatFloorLabel(floor: number): string {
  if (floor === 0) return "Ground";
  if (floor > 0) return `Level ${floor}`;
  return `Basement ${Math.abs(floor)}`;
}

// Utility to convert yaw/pitch to 2D screen coordinates
export function yawPitchToScreen(
  yaw: number,
  pitch: number,
  width: number,
  height: number,
  fov: number,
): { x: number; y: number } {
  // Equirectangular projection: center is (width/2, height/2)
  // Yaw: 0 is center, positive is right; Pitch: 0 is center, positive is up
  // fov in radians
  const x = width / 2 + (width / fov) * yaw;
  const y = height / 2 - (height / fov) * pitch;
  return { x, y };
}

// Check for panorama images using the new file URL manager
export const checkForPanoramas = async (
  roomVisit: any,
  setImages: Function,
  villaId: string,
) => {
  const panoramaImages = [];
  const imagePromises = [];

  for (let i = 1; i <= roomVisit.nbPano; i++) {
    const paddedNumber = i.toString().padStart(5, "0");
    const imageName = `${paddedNumber}-pano.jpg`;

    // Use the new file URL manager
    const imageUrl = FileURLManager.getPanoramaImageURL(villaId, imageName);

    imagePromises.push(
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ url: imageUrl, exists: true });
        img.onerror = () => resolve({ url: imageUrl, exists: false });
        img.src = imageUrl;
      }),
    );
  }

  const results = await Promise.all(imagePromises);

  // Filter existing images and set them
  const existingImages = results
    .filter((result: any) => result.exists)
    .map((result: any) => result.url);

  setImages(existingImages);
  return existingImages;
};
