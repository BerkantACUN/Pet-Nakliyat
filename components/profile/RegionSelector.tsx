"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { REGION_OPTIONS, type Region } from "@/lib/turkey-regions";
import { updateRegionAction } from "@/app/(panel)/profil/actions";

interface RegionSelectorProps {
  current: Region | null;
  suggested?: Region | null;
}

export function RegionSelector({ current, suggested }: RegionSelectorProps) {
  const router = useRouter();
  const [region, setRegion] = useState<Region | "">(current ?? "");
  const [pending, startTransition] = useTransition();

  function save(value: Region) {
    startTransition(async () => {
      const r = await updateRegionAction({ region: value });
      if (!r.ok) {
        toast.error(r.error ?? "Bölge kaydedilemedi");
        return;
      }
      toast.success("Bölgen kaydedildi 📍");
      setRegion(value);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor="region"
        className="flex items-center gap-1.5 text-[12px] text-gravel"
      >
        <MapPin className="size-3.5" /> Bölgen
      </label>
      <select
        id="region"
        value={region}
        onChange={(e) => {
          const v = e.target.value as Region;
          if (v) save(v);
        }}
        disabled={pending}
        className="w-full rounded-input border border-chalk bg-white px-3 py-2 text-[14px] outline-none focus-visible:border-signal disabled:opacity-60"
      >
        <option value="" disabled>
          Bölge seç…
        </option>
        {REGION_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {suggested && !current ? (
        <button
          type="button"
          onClick={() => save(suggested)}
          disabled={pending}
          className="text-[12px] text-signal hover:underline disabled:opacity-60"
        >
          Şehrine göre öner: {REGION_OPTIONS.find((o) => o.value === suggested)?.label} →
        </button>
      ) : null}
    </div>
  );
}
