export type LocationSource = 'browser' | 'fallback' | 'manual' | 'preset';

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  label: string;
  source: LocationSource;
  timezone: string;
}

export interface SimulationTime {
  date: Date;
  mode: 'live' | 'manual';
  playbackSpeed: number;
}

export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface SolarSnapshot {
  altitude: number;
  azimuth: number;
  declination: number;
  rightAscension: number;
  daylight: boolean;
  daylightLabel: string;
  subsolarLatitude: number;
  subsolarLongitude: number;
  sunVector: Vector3Tuple;
  sunrise: Date | null;
  sunset: Date | null;
}

export type SceneMode = 'orbit' | 'observer' | 'sun' | 'terminator';

export interface SurfaceFocus {
  latitude: number;
  longitude: number;
  cameraDistance: number;
  suggestedZoom: number;
  source: 'globe-center' | 'observer';
}

export type ZoomAction = 'in' | 'out' | 'reset';

export interface ZoomIntent {
  id: number;
  action: ZoomAction;
}

export interface SceneState {
  cameraMode: SceneMode;
  selectedMarker: string | null;
  showPanel: boolean;
}
