export interface Vessel {
  id: string;
  name: string;
  imo: string;
  mmsi?: string;
  type: string;
  status: string;
  speed: number; // knots
  course: number; // degrees
  lat: number;
  lng: number;
  destination?: string;
  eta?: string;
  lastUpdate: string;
  flag: string;
  length?: number;
  width?: number;
}

export interface TrackingHistory {
  timestamp: string;
  lat: number;
  lng: number;
}
