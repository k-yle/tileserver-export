import type { Coord } from "../types";

export async function geocode([lat, lng]: Coord): Promise<string> {
  const request = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  );
  const geocodingResult = await request.json();
  return geocodingResult.name || geocodingResult.display_name || "Unknown";
}
