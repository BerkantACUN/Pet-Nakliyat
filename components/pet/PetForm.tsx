"use client";

import { forwardRef, useState, useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, X, Clock, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { petSchema, type PetInput } from "@/lib/validations/pet";
import {
  createPetAction,
  updatePetAction,
} from "@/app/(panel)/musteri/petlerim/actions";
import { cn } from "@/lib/utils";
import type { Pet, Species, FoodType } from "@/lib/supabase/types";

const SPECIES_OPTIONS: Array<{ value: Species; emoji: string; label: string }> = [
  { value: "dog", emoji: "🐶", label: "Köpek" },
  { value: "cat", emoji: "🐱", label: "Kedi" },
  { value: "bird", emoji: "🐦", label: "Kuş" },
  { value: "rabbit", emoji: "🐰", label: "Tavşan" },
  { value: "other", emoji: "🐾", label: "Diğer" },
];

const FOOD_TYPE_OPTIONS: Array<{ value: FoodType; label: string }> = [
  { value: "dry", label: "Kuru mama" },
  { value: "wet", label: "Yaş mama" },
  { value: "raw", label: "Çiğ et / barf" },
  { value: "home_cooked", label: "Ev yemeği" },
  { value: "mixed", label: "Karışık" },
  { value: "other", label: "Diğer" },
];

interface PetFormProps {
  pet?: Pet;
  onSuccess?: () => void;
}

export function PetForm({ pet, onSuccess }: PetFormProps) {
  const [pending, startTransition] = useTransition();
  const [openAdvanced, setOpenAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    control,
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
      foodBrand: pet?.food_brand ?? "",
      foodType: (pet?.food_type ?? "") as PetInput["foodType"],
      feedingTimes: pet?.feeding_times ?? [],
      toiletTimes: pet?.toilet_times ?? [],
      medications: pet?.medications ?? "",
      isNeutered: pet?.is_neutered ?? false,
      isVaccinated: pet?.is_vaccinated ?? false,
      vetContact: pet?.vet_contact ?? "",
      emergencyContact: pet?.emergency_contact ?? "",
    },
  });

  const selected = watch("species");

  const feedingTimesField = useFieldArray<PetInput>({
    control,
    // @ts-expect-error: react-hook-form doesn't know about string array
    name: "feedingTimes",
  });
  const toiletTimesField = useFieldArray<PetInput>({
    control,
    // @ts-expect-error: react-hook-form doesn't know about string array
    name: "toiletTimes",
  });

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
                <span className="text-xl" aria-hidden>
                  {o.emoji}
                </span>
                <span className="text-[10px]">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Field id="name" label="İsim" error={errors.name?.message} {...register("name")} />
      <Field
        id="breed"
        label="Cins (opsiyonel)"
        error={errors.breed?.message}
        {...register("breed")}
      />

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

      <Checkboxes>
        <Toggle
          label="Kısırlaştırıldı"
          {...register("isNeutered")}
        />
        <Toggle
          label="Aşıları tam"
          {...register("isVaccinated")}
        />
      </Checkboxes>

      <div className="space-y-1.5">
        <Label htmlFor="specialNotes" className="text-[12px] text-gravel">
          Özel notlar (mizaç, alerjiler, vb.)
        </Label>
        <Textarea
          id="specialNotes"
          rows={2}
          aria-invalid={!!errors.specialNotes}
          {...register("specialNotes")}
        />
        {errors.specialNotes?.message ? (
          <p className="text-[12px] text-danger">
            {errors.specialNotes.message}
          </p>
        ) : null}
      </div>

      {/* Detaylı bakım — collapsible */}
      <div className="rounded-2xl border border-chalk bg-powder/30">
        <button
          type="button"
          onClick={() => setOpenAdvanced((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-[13px] font-medium">
            🍽️ Bakım detayları{" "}
            <span className="text-gravel">
              (mama, saatler, ilaç)
            </span>
          </span>
          <span className="text-gravel">{openAdvanced ? "−" : "+"}</span>
        </button>
        {openAdvanced ? (
          <div className="space-y-4 border-t border-chalk px-4 py-4">
            {/* Mama */}
            <div className="grid grid-cols-2 gap-3">
              <Field
                id="foodBrand"
                label="Mama markası"
                placeholder="Royal Canin, Hill's…"
                error={errors.foodBrand?.message}
                {...register("foodBrand")}
              />
              <div className="space-y-1.5">
                <Label htmlFor="foodType" className="text-[12px] text-gravel">
                  Mama türü
                </Label>
                <select
                  id="foodType"
                  className="w-full rounded-input border border-chalk bg-white px-3 py-2 text-[14px] outline-none focus-visible:border-signal"
                  {...register("foodType")}
                >
                  <option value="">Seç…</option>
                  {FOOD_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Yemek saatleri */}
            <TimeListField
              label="Yemek saatleri"
              icon={<Clock className="size-3.5" />}
              fields={feedingTimesField.fields}
              append={() => feedingTimesField.append("08:00" as never)}
              remove={feedingTimesField.remove}
              control={control}
              name="feedingTimes"
            />

            {/* Tuvalet saatleri */}
            <TimeListField
              label="Tuvalet saatleri"
              icon={<Droplet className="size-3.5" />}
              fields={toiletTimesField.fields}
              append={() => toiletTimesField.append("07:30" as never)}
              remove={toiletTimesField.remove}
              control={control}
              name="toiletTimes"
            />

            {/* İlaçlar */}
            <div className="space-y-1.5">
              <Label
                htmlFor="medications"
                className="text-[12px] text-gravel"
              >
                İlaçları / tedavisi
              </Label>
              <Textarea
                id="medications"
                rows={2}
                placeholder="Örn: günde 1 kez sabah, kalp damlası…"
                aria-invalid={!!errors.medications}
                {...register("medications")}
              />
            </div>

            <Field
              id="vetContact"
              label="Veteriner iletişim"
              placeholder="Dr. Ayşe — 0530…"
              error={errors.vetContact?.message}
              {...register("vetContact")}
            />
            <Field
              id="emergencyContact"
              label="Acil durum kişi"
              placeholder="Yakın bir tanıdığın adı + telefonu"
              error={errors.emergencyContact?.message}
              {...register("emergencyContact")}
            />
          </div>
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

function Checkboxes({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

const Toggle = forwardRef<
  HTMLInputElement,
  { label: string } & React.InputHTMLAttributes<HTMLInputElement>
>(function ToggleInner({ label, ...rest }, ref) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-chalk bg-white px-3 py-2.5 text-[13px] hover:bg-powder">
      <input
        type="checkbox"
        ref={ref}
        className="size-4 accent-obsidian"
        {...rest}
      />
      {label}
    </label>
  );
});

interface TimeListFieldProps {
  label: string;
  icon: React.ReactNode;
  fields: Array<{ id: string }>;
  append: () => void;
  remove: (index: number) => void;
  control: ReturnType<typeof useForm<PetInput>>["control"];
  name: "feedingTimes" | "toiletTimes";
}

function TimeListField({
  label,
  icon,
  fields,
  append,
  remove,
  control,
  name,
}: TimeListFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] text-gravel">
          {icon} {label}
        </div>
        <button
          type="button"
          onClick={append}
          className="inline-flex items-center gap-1 text-[12px] text-signal hover:underline"
        >
          <Plus className="size-3" /> Ekle
        </button>
      </div>
      {fields.length === 0 ? (
        <p className="text-[11px] text-gravel">
          Henüz {label.toLowerCase()} eklemedin.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="inline-flex items-center gap-1 rounded-full border border-chalk bg-white px-2.5 py-1.5"
            >
              <Controller
                control={control}
                name={`${name}.${idx}` as `feedingTimes.${number}` | `toiletTimes.${number}`}
                render={({ field: f }) => (
                  <input
                    type="time"
                    value={f.value as string}
                    onChange={f.onChange}
                    className="bg-transparent text-[12px] outline-none"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                aria-label="Kaldır"
                className="text-gravel hover:text-danger"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
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
