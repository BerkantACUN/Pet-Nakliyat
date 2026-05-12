"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { petSchema, type PetInput } from "@/lib/validations/pet";
import { createPetAction, updatePetAction } from "@/app/(panel)/musteri/petlerim/actions";
import { cn } from "@/lib/utils";
import type { Pet, Species } from "@/lib/supabase/types";

const SPECIES_OPTIONS: Array<{ value: Species; emoji: string; label: string }> = [
  { value: "dog", emoji: "🐶", label: "Köpek" },
  { value: "cat", emoji: "🐱", label: "Kedi" },
  { value: "bird", emoji: "🐦", label: "Kuş" },
  { value: "rabbit", emoji: "🐰", label: "Tavşan" },
  { value: "other", emoji: "🐾", label: "Diğer" },
];

interface PetFormProps {
  pet?: Pet;
  onSuccess?: () => void;
}

export function PetForm({ pet, onSuccess }: PetFormProps) {
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<PetInput>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: pet?.name ?? "",
      species: pet?.species ?? "dog",
      breed: pet?.breed ?? "",
      weightKg: pet?.weight_kg ?? undefined,
      ageYears: pet?.age_years ?? undefined,
      specialNotes: pet?.special_notes ?? "",
    },
  });

  const selected = watch("species");

  function onSubmit(data: PetInput) {
    startTransition(async () => {
      const result = pet
        ? await updatePetAction(pet.id, data)
        : await createPetAction(data);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [key, msg] of Object.entries(result.fieldErrors)) {
            setError(key as keyof PetInput, { message: msg });
          }
        }
        toast.error(result.error ?? "Form'da hata var");
        return;
      }
      toast.success(pet ? "Pet güncellendi" : "Pet eklendi");
      onSuccess?.();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <div className="mb-2 text-[12px] text-gravel">Tür</div>
        <div className="grid grid-cols-5 gap-2">
          {SPECIES_OPTIONS.map((o) => {
            const active = selected === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() =>
                  setValue("species", o.value, { shouldValidate: true })
                }
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border bg-white p-2 transition",
                  active
                    ? "border-obsidian shadow-[inset_0_0_0_1px_var(--color-obsidian)]"
                    : "border-chalk hover:border-fog",
                )}
              >
                <span className="text-xl" aria-hidden>{o.emoji}</span>
                <span className="text-[10px]">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Field id="name" label="İsim" error={errors.name?.message} {...register("name")} />
      <Field id="breed" label="Cins (opsiyonel)" error={errors.breed?.message} {...register("breed")} />

      <div className="grid grid-cols-2 gap-3">
        <Field
          id="weightKg"
          label="Ağırlık (kg)"
          type="number"
          step="0.1"
          inputMode="decimal"
          error={errors.weightKg?.message}
          {...register("weightKg", { valueAsNumber: true })}
        />
        <Field
          id="ageYears"
          label="Yaş"
          type="number"
          step="0.5"
          inputMode="decimal"
          error={errors.ageYears?.message}
          {...register("ageYears", { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="specialNotes" className="text-[12px] text-gravel">
          Özel notlar (sağlık, mizaç, ilaç vb.)
        </Label>
        <Textarea
          id="specialNotes"
          rows={3}
          aria-invalid={!!errors.specialNotes}
          {...register("specialNotes")}
        />
        {errors.specialNotes?.message ? (
          <p className="text-[12px] text-danger">{errors.specialNotes.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="pill"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Kaydediliyor…" : pet ? "Güncelle" : "Pet ekle"}
      </Button>
    </form>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

const Field = (() => {
  function FieldInner({ id, label, error, ...rest }: FieldProps) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-[12px] text-gravel">
          {label}
        </Label>
        <Input id={id} aria-invalid={!!error} {...rest} />
        {error ? <p className="text-[12px] text-danger">{error}</p> : null}
      </div>
    );
  }
  FieldInner.displayName = "PetField";
  return FieldInner;
})();
