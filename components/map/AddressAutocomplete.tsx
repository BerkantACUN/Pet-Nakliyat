"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchAddress, type GeoSuggestion } from "@/lib/mapbox/geocoding";
import { searchTrPlaces } from "@/lib/geo/tr-places";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export interface AddressValue {
  address: string;
  lat: number;
  lng: number;
  city: string | null;
}

interface AddressAutocompleteProps {
  id: string;
  label: string;
  value: AddressValue | null;
  onChange: (v: AddressValue | null) => void;
  placeholder?: string;
  error?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function AddressAutocomplete({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value?.address ?? "");
  const [remoteSuggestions, setRemoteSuggestions] = useState<GeoSuggestion[]>(
    [],
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remoteFailed, setRemoteFailed] = useState(false);

  const debounced = useDebounce(query, 280);
  const ignoreNextFetchRef = useRef(false);

  const useFallback = !MAPBOX_TOKEN || remoteFailed;

  // Yerel TR şehir/ilçe arama (anlık, Mapbox key olmasa da çalışır)
  const localSuggestions = useMemo(() => {
    if (!useFallback) return [];
    if (!query || query.trim().length < 2) return [];
    return searchTrPlaces(query.trim(), 8);
  }, [query, useFallback]);

  useEffect(() => {
    if (useFallback) {
      setRemoteSuggestions([]);
      setLoading(false);
      return;
    }
    if (ignoreNextFetchRef.current) {
      ignoreNextFetchRef.current = false;
      return;
    }
    if (!debounced || debounced.length < 3) {
      setRemoteSuggestions([]);
      return;
    }
    let aborted = false;
    const ctrl = new AbortController();
    setLoading(true);
    searchAddress(debounced, { signal: ctrl.signal, limit: 5 })
      .then((res) => {
        if (!aborted) {
          setRemoteSuggestions(res);
          setOpen(true);
        }
      })
      .catch(() => {
        if (!aborted) {
          setRemoteFailed(true);
        }
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });
    return () => {
      aborted = true;
      ctrl.abort();
    };
  }, [debounced, useFallback]);

  function pickRemote(s: GeoSuggestion) {
    ignoreNextFetchRef.current = true;
    setQuery(s.place_name);
    setRemoteSuggestions([]);
    setOpen(false);
    onChange({
      address: s.place_name,
      lat: s.center[1],
      lng: s.center[0],
      city: s.city,
    });
  }

  function pickLocal(p: ReturnType<typeof searchTrPlaces>[number]) {
    setQuery(p.name);
    setOpen(false);
    onChange({
      address: p.name,
      lat: p.lat,
      lng: p.lng,
      city: p.city,
    });
  }

  function clear() {
    setQuery("");
    setRemoteSuggestions([]);
    onChange(null);
  }

  const showList =
    open &&
    (useFallback ? localSuggestions.length > 0 : remoteSuggestions.length > 0);

  return (
    <div className="relative space-y-1.5">
      <Label htmlFor={id} className="text-[12px] text-gravel">
        {label}
      </Label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gravel" />
        <Input
          id={id}
          value={query}
          autoComplete="off"
          placeholder={
            placeholder ?? (useFallback ? "İl veya ilçe yaz…" : "Adres ara…")
          }
          aria-invalid={!!error}
          aria-expanded={open}
          aria-autocomplete="list"
          className="pl-9 pr-9"
          onFocus={() => {
            if (
              (useFallback && localSuggestions.length > 0) ||
              (!useFallback && remoteSuggestions.length > 0)
            ) {
              setOpen(true);
            }
          }}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) onChange(null);
          }}
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-gravel" />
        ) : value ? (
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gravel hover:text-obsidian"
            aria-label="Temizle"
          >
            ✕
          </button>
        ) : null}
      </div>

      {showList ? (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-chalk bg-white shadow-[0_12px_40px_-12px_rgba(17,17,17,0.18)]"
        >
          {useFallback
            ? localSuggestions.map((p) => (
                <li
                  key={p.id}
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickLocal(p);
                  }}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 px-3 py-2 text-[13px] hover:bg-powder",
                  )}
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gravel" />
                  <span className="line-clamp-2">{p.name}</span>
                </li>
              ))
            : remoteSuggestions.map((s) => (
                <li
                  key={s.id}
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickRemote(s);
                  }}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 px-3 py-2 text-[13px] hover:bg-powder",
                  )}
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gravel" />
                  <span className="line-clamp-2">{s.place_name}</span>
                </li>
              ))}
        </ul>
      ) : null}

      {useFallback && query.length >= 2 && localSuggestions.length === 0 ? (
        <p className="text-[11px] text-gravel">
          Eşleşme bulunamadı. İl veya büyük ilçe adı dene (örn. “Kadıköy”).
        </p>
      ) : null}

      {error ? <p className="text-[12px] text-danger">{error}</p> : null}
    </div>
  );
}
