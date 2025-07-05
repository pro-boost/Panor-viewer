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
 * Info hotspot (POI) data structure
 */
export interface InfoHotspot {
  id: string;
  yaw: number;
  pitch: number;
  title: string;
  description?: string;
  type: 'info';
  sceneId: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * POI with associated files
 */
export interface POIWithFiles extends InfoHotspot {
  files?: File[];
  imageUrls?: string[]; // Blob URLs for display
}

/**
 * File data stored in IndexedDB
 */
export interface POIFile {
  id: string;
  poiId: string;
  name: string;
  type: string;
  size: number;
  data: Blob;
  createdAt: Date;
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
  infoHotspots?: InfoHotspot[]; // POI hotspots
  northOffset?: number; // Optional: offset from true north in degrees
  panoPos?: PanoPosition;
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
 * Configuration data containing all scenes
 */
export interface ConfigData {
  scenes: SceneData[];
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
