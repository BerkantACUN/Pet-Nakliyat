"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { petSchema, type PetInput } from "@/lib/validations/pet";
import type { ActionResult } from "@/app/(auth)/actions";
import type { FoodType } from "@/lib/supabase/types";

function flattenZodError(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function buildPayload(input: PetInput) {
  return {
    name: input.name,
    species: input.species,
    breed: input.breed || null,
    weight_kg: input.weightKg ?? null,
    age_years: input.ageYears ?? null,
    special_notes: input.specialNotes || null,
    food_brand: input.foodBrand || null,
    food_type: (input.foodType ? (input.foodType as FoodType) : null),
    feeding_times: input.feedingTimes ?? [],
    toilet_times: input.toiletTimes ?? [],
    medications: input.medications || null,
    is_neutered: input.isNeutered ?? false,
    is_vaccinated: input.isVaccinated ?? false,
    vet_contact: input.vetContact || null,
    emergency_contact: input.emergencyContact || null,
  };
}

export async function createPetAction(
  input: PetInput,
): Promise<ActionResult> {
  const parsed = petSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZodError(parsed.error) };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { error } = await supabase.from("pets").insert({
    owner_id: user.id,
    ...buildPayload(parsed.data),
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/musteri/petlerim");
  revalidatePath("/musteri/ilan-olustur");
  return { ok: true };
}

export async function updatePetAction(
  id: string,
  input: PetInput,
): Promise<ActionResult> {
  const parsed = petSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZodError(parsed.error) };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("pets")
    .update(buildPayload(parsed.data))
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/musteri/petlerim");
  return { ok: true };
}

export async function deletePetAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("pets").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/musteri/petlerim");
  return { ok: true };
}
