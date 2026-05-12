"use client";

import { useTransition } from "react";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deletePetAction } from "@/app/(panel)/musteri/petlerim/actions";
import type { Pet } from "@/lib/supabase/types";

const SPECIES_EMOJI: Record<Pet["species"], string> = {
  dog: "🐶",
  cat: "🐱",
  bird: "🐦",
  rabbit: "🐰",
  other: "🐾",
};

interface PetCardProps {
  pet: Pet;
  onEdit?: () => void;
}

export function PetCard({ pet, onEdit }: PetCardProps) {
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm(`${pet.name}'i silmek istediğine emin misin?`)) return;
    startTransition(async () => {
      const result = await deletePetAction(pet.id);
      if (!result.ok) {
        toast.error(result.error ?? "Silinemedi");
        return;
      }
      toast.success(`${pet.name} silindi`);
    });
  }

  return (
    <article className="flex items-center gap-3 rounded-2xl border border-chalk bg-white p-4">
      <div className="grid size-14 place-items-center rounded-2xl bg-paw/20 text-2xl">
        {SPECIES_EMOJI[pet.species]}
      </div>
      <div className="flex-1">
        <div className="font-display text-[18px] leading-tight">{pet.name}</div>
        <div className="text-[12px] text-gravel">
          {[pet.breed, pet.weight_kg ? `${pet.weight_kg} kg` : null, pet.age_years ? `${pet.age_years} yaş` : null]
            .filter(Boolean)
            .join(" · ") || "Detay eklenmedi"}
        </div>
      </div>
      <div className="flex gap-1">
        {onEdit ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            aria-label={`${pet.name}'i düzenle`}
          >
            <Pencil className="size-4" />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={pending}
          onClick={onDelete}
          className="text-danger hover:bg-danger/10"
          aria-label={`${pet.name}'i sil`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </article>
  );
}
