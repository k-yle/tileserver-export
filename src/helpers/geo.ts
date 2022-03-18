import type { LatLngBounds } from "leaflet";
import type { BBox } from "which-polygon";

const { log, cos, tan, floor, ceil, PI: π } = Math;

export const toBBox = (bounds: LatLngBounds): BBox =>
  bounds.toBBoxString().split(",").map(Number) as BBox;

const degToRad = (deg: number) => deg * (π / 180);

export function latLngToXYZ(
  lat: number,
  lng: number,
  z: number
): [x: number, y: number, z: number] {
  const x = floor(((lng + 180) / 360) * 2 ** z);
  const y = floor(
    ((1 - log(tan(degToRad(lat)) + 1 / cos(degToRad(lat))) / π) / 2) * 2 ** z
  );
  return [x, y, z];
}

// based on https://github.com/andrewharvey/osm-editor-layer-index-qgis/blob/63366ac/index.js#L64-L68
export function convertTileUrl(url: string) {
  return url.replace("{zoom}", "{z}").replace(/{switch:([^,}]+)[^}]*}/, "$1");
}

function toMercartor(x: number, y: number, z: number): [x: number, y: number] {
  const resolution = (2 * π * 6378137) / 256 / 2 ** z;
  const mercX = x * resolution - (2 * π * 6378137) / 2;
  const mercY = y * resolution - (2 * π * 6378137) / 2;
  return [mercX, mercY];
}

function tmsToWmtsBBox(x: number, tmsY: number, z: number) {
  const y = 2 ** z - tmsY - 1;
  const [xMin, yMin] = toMercartor(x * 256, y * 256, z);
  const [xMax, yMax] = toMercartor((x + 1) * 256, (y + 1) * 256, z);
  return [xMin, yMin, xMax, yMax].join(",");
}

export function populateTileUrl(url: string, x: number, y: number, z: number) {
  if (url.match(/{(bbox|proj|wkid)}/)) {
    // it's wmts

    const proj = "EPSG:3857";
    const bbox = tmsToWmtsBBox(x, y, z);

    return url
      .replace("{bbox}", bbox)
      .replace("{width}", "256")
      .replace("{height}", "256")
      .replace("{wkid}", proj.replace("EPSG:", ""))
      .replace("{proj}", proj);
  }

  return url
    .replace("{x}", `${x}`)
    .replace("{y}", `${y}`)
    .replace("{z}", `${z}`);
}

export type TileDimesion = {
  zoom: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  xCount: number;
  yCount: number;
  width: number;
  height: number;
  tiles: number;
};

export function getTileDimensions(
  zoom: number,
  bbox: BBox
): TileDimesion | null {
  const [minLng, minLat, maxLng, maxLat] = bbox;

  const tilePx = 256;

  const [x1, y1] = latLngToXYZ(minLat, minLng, zoom);
  const [x2, y2] = latLngToXYZ(maxLat, maxLng, zoom);

  const minX = x1 < x2 ? x1 : x2;
  const minY = y1 < y2 ? y1 : y2;
  const maxX = x1 > x2 ? x1 : x2;
  const maxY = y1 > y2 ? y1 : y2;

  const [xCount, yCount] = [maxX - minX, maxY - minY];

  // this zoom level is too way too small, the bbox is completely within one tile.
  if (xCount < 1 || yCount < 1 || (xCount === 1 && yCount === 1)) return null;

  return {
    zoom,
    minX,
    maxX,
    minY,
    maxY,
    xCount,
    yCount,
    width: ceil(xCount * tilePx),
    height: ceil(yCount * tilePx),
    tiles: xCount * yCount,
  };
}
