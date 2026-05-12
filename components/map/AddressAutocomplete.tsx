"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchAddress, type GeoSuggestion } from "@/lib/mapbox/geocoding";
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

export function AddressAutocomplete({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value?.address ?? "");
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const debounced = useDebounce(query, 280);
  const ignoreNextFetchRef = useRef(false);

  useEffect(() => {
    if (ignoreNextFetchRef.current) {
      ignoreNextFetchRef.current = false;
      return;
    }
    if (!debounced || debounced.length < 3) {
      setSuggestions([]);
      setFetchError(null);
      return;
    }
    let aborted = false;
    const ctrl = new AbortController();
    setLoading(true);
    setFetchError(null);
    searchAddress(debounced, { signal: ctrl.signal, limit: 5 })
      .then((res) => {
        if (!aborted) {
          setSuggestions(res);
          setOpen(true);
        }
      })
      .catch((err: unknown) => {
        if (aborted) return;
        const msg = err instanceof Error ? err.message : "Adres aranamadı";
        setFetchError(
          msg.includes("token")
            ? "Mapbox anahtarı eksik. Yöneticine bildir."
            : msg,
        );
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });
    return () => {
      aborted = true;
      ctrl.abort();
    };
  }, [debounced]);

  function pick(s: GeoSuggestion) {
    ignoreNextFetchRef.current = true;
    setQuery(s.place_name);
    setSuggestions([]);
    setOpen(false);
    onChange({
      address: s.place_name,
      lat: s.center[1],
      lng: s.center[0],
      city: s.city,
    });
  }

  function clear() {
    setQuery("");
    setSuggestions([]);
    onChange(null);
  }

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
          placeholder={placeholder ?? "Adres veya semt ara…"}
          aria-invalid={!!error}
          aria-expanded={open}
          aria-autocomplete="list"
          className="pl-9 pr-9"
          onFocus={() => suggestions.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          onChange={(e) => {
            setQuery(e.target.value);
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

      {open && suggestions.length > 0 ? (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-chalk bg-white shadow-[0_12px_40px_-12px_rgba(17,17,17,0.18)]"
        >
          {suggestions.map((s) => (
            <li
              key={s.id}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
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

      {fetchError ? (
        <p className="text-[12px] text-danger">{fetchError}</p>
      ) : null}
      {error ? <p className="text-[12px] text-danger">{error}</p> : null}
    </div>
  );
}
