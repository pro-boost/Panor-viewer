// Type definitions for scene data and related interfaces

/**
 * Position in 3D space
 */
export interface Position {
  x: number;
  y: number;
  z: number;
}

/**
 * 2D position for panorama positioning
 */
export interface PanoPosition {
  x: number;
  y: number;
}

/**
 * View parameters for scene initialization
 */
export interface ViewParameters {
  yaw: number;
  pitch: number;
  fov: number;
}

/**
 * Hotspot link to another scene
 */
export interface LinkHotspot {
  yaw: number;
  pitch: number;
  target: string;
  distance?: number;
  type?: string;
  rotation?: number;
}

/**
 * Scene data structure
 */
export interface SceneData {
  id: string;
  name: string;
  floor: number;
  position: Position;
  initialViewParameters: ViewParameters;
  linkHotspots: LinkHotspot[];
  initialYaw: number; // Absolute orientation in degrees
  northOffset?: number; // Optional: offset from true north in degrees
  panoPos?: PanoPosition;
  imageUrl?: string; // URL to the panorama image
  // Optional fields for Marzipano configuration
  levels?: Array<{ width: number }>;
  faceSize?: number;
  orientation?: {
    w: number;
    x: number;
    y: number;
    z: number;
  };
}

/**
 * Logo configuration
 */
export interface LogoConfig {
  image?: string;
  position?: string;
  size?: string;
}

/**
 * Configuration data containing all scenes
 */
export interface ConfigData {
  scenes: SceneData[];
  projectId?: string;
  projectName?: string;
  logo?: LogoConfig;
}

/**
 * Scene information with Marzipano scene object
 */
export interface SceneInfo {
  data: SceneData;
  scene: any; // Marzipano scene object
  hotspotElements: HTMLElement[];
  loaded: boolean;
}
