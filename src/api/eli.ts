import whichPolygon from "which-polygon";
import type { BBox, ELI, GeoJson } from "../types";

const isValid = (x: ELI) =>
  (x.type === "tms" ||
    (x.type === "wms" && x.available_projections?.includes("EPSG:3857"))) &&
  !x.url.includes("{apikey}");

/** if true, we only return worldwide layers */
type ELIQuery = (bbox: BBox | true) => ELI[];

async function getELIQuerier(): Promise<ELIQuery> {
  const geojson: GeoJson<ELI> = await fetch(
    "https://osmlab.github.io/editor-layer-index/imagery.geojson"
  ).then((r) => r.json());

  const world = geojson.features
    .filter((x) => !x.geometry)
    .map((x) => x.properties)
    .filter(isValid);

  const nonWorld: GeoJson<ELI> = {
    features: geojson.features.filter((x) => x.geometry),
    type: "FeatureCollection",
  };

  const query = whichPolygon<ELI>(nonWorld);

  // the returned function is called on every query
  return (bbox) => {
    if (bbox === true) return world;

    const local = query.bbox(bbox);
    return [...local.filter(isValid), ...world];
  };
}

/**
 * A cached querier function to get local imagery from ELI
 */
export const eliQueryPromise = getELIQuerier().catch(console.error);
