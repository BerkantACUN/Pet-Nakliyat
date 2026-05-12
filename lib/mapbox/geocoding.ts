/**
 * Mapbox Geocoding v6 — adres → koordinat.
 * https://docs.mapbox.com/api/search/geocoding-v6/
 */

export interface GeoSuggestion {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  city: string | null;
  country: string | null;
}

interface MapboxV6Feature {
  id: string;
  type: string;
  properties: {
    full_address?: string;
    place_formatted?: string;
    name?: string;
    context?: {
      place?: { name: string };
      region?: { name: string };
      country?: { name: string };
    };
    coordinates?: { longitude: number; latitude: number };
  };
}

interface MapboxV6Response {
  features?: MapboxV6Feature[];
}

const ENDPOINT = "https://api.mapbox.com/search/geocode/v6/forward";

export async function searchAddress(
  query: string,
  opts: { signal?: AbortSignal; limit?: number; proximityIstanbul?: boolean } = {},
): Promise<GeoSuggestion[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    throw new Error("Mapbox token tanımlı değil");
  }
  if (!query.trim()) return [];

  const url = new URL(ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(opts.limit ?? 5));
  url.searchParams.set("language", "tr");
  url.searchParams.set("country", "TR");
  if (opts.proximityIstanbul) {
    url.searchParams.set("proximity", "28.9784,41.0082");
  }
  url.searchParams.set("access_token", token);

  const res = await fetch(url, { signal: opts.signal });
  if (!res.ok) throw new Error(`Mapbox geocoding hatası (${res.status})`);
  const data = (await res.json()) as MapboxV6Response;

  return (data.features ?? []).map((f) => ({
    id: f.id,
    place_name:
      f.properties.full_address ??
      f.properties.place_formatted ??
      f.properties.name ??
      "",
    center:
      f.properties.coordinates
        ? [f.properties.coordinates.longitude, f.properties.coordinates.latitude]
        : [0, 0],
    city:
      f.properties.context?.place?.name ??
      f.properties.context?.region?.name ??
      null,
    country: f.properties.context?.country?.name ?? null,
  }));
}
