export type GeoJsonCoord = [lng: number, lat: number];

export type GeoJsonPoint = {
  type: "Point";
  coordinates: GeoJsonCoord;
};

export type GeoJsonLine = {
  type: "LineString";
  coordinates: GeoJsonCoord[];
};

export type GeoJsonArea = {
  type: "Polygon";
  coordinates: GeoJsonCoord[][];
};

export type GeoJsonMultiPolygon = {
  type: "MultiPolygon";
  coordinates: GeoJsonCoord[][][];
};

export type GeoJsonCoords =
  | GeoJsonPoint
  | GeoJsonLine
  | GeoJsonArea
  | GeoJsonMultiPolygon;

export type GeoJsonFeature<T = Record<string, string | undefined>> = {
  type: "Feature";
  id: string;
  geometry: GeoJsonCoords;
  properties: T;
};

export type GeoJson<T = Record<string, string | undefined>> = {
  type: "FeatureCollection";
  features: GeoJsonFeature<T>[];
};
