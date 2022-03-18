import type { Coord } from "../types";

type Home = { lat: number; lon: number; city: string; country: string };

const FALLBACK: Coord = [-41.2835, 174.7427];

// singleton requet, should fire immediately
export const homeLocationPromise = fetch("https://3.kyle.kiwi")
  .then((r): Promise<Home> => r.json())
  .then((res): Coord => [res.lat, res.lon])
  .catch(() => FALLBACK);
