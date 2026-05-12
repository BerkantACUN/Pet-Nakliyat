/**
 * Mapbox Directions API — driving profile, mesafe km.
 * https://docs.mapbox.com/api/navigation/directions/
 */

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][]; // polyline as [lng, lat] coords (geometry=geojson)
}

interface MapboxRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry?: { type: "LineString"; coordinates: [number, number][] };
}

interface MapboxResponse {
  routes?: MapboxRoute[];
}

const ENDPOINT = "https://api.mapbox.com/directions/v5/mapbox/driving";

export async function getRoute(
  from: [number, number], // [lng, lat]
  to: [number, number],
  opts: { signal?: AbortSignal } = {},
): Promise<RouteResult> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) throw new Error("Mapbox token tanımlı değil");

  const coords = `${from[0]},${from[1]};${to[0]},${to[1]}`;
  const url = new URL(`${ENDPOINT}/${coords}`);
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("overview", "simplified");
  url.searchParams.set("language", "tr");
  url.searchParams.set("access_token", token);

  const res = await fetch(url, { signal: opts.signal });
  if (!res.ok) throw new Error(`Mapbox directions hatası (${res.status})`);
  const data = (await res.json()) as MapboxResponse;

  const route = data.routes?.[0];
  if (!route) throw new Error("Rota bulunamadı");

  return {
    distanceKm: Math.round((route.distance / 1000) * 10) / 10,
    durationMin: Math.round(route.duration / 60),
    geometry: route.geometry?.coordinates ?? [from, to],
  };
}
