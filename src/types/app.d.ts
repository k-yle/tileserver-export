export type BBox = [
  minLng: number,
  minLat: number,
  maxLng: nunber,
  maxLat: number
];

export type Coord = [lat: number, lng: number];

export type MapSelection = { layers: ELI[]; bbox: BBox };

export type PermaLink = { x: number; y: number; z: number; layers: string[] };
