"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { petSchema, type PetInput } from "@/lib/validations/pet";
import type { ActionResult } from "@/app/(auth)/actions";

function flattenZodError(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
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

  const { breed, weightKg, ageYears, specialNotes, ...rest } = parsed.data;
  const { error } = await supabase.from("pets").insert({
    owner_id: user.id,
    ...rest,
    breed: breed || null,
    weight_kg: weightKg ?? null,
    age_years: ageYears ?? null,
    special_notes: specialNotes || null,
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
  const { breed, weightKg, ageYears, specialNotes, ...rest } = parsed.data;
  const { error } = await supabase
    .from("pets")
    .update({
      ...rest,
      breed: breed || null,
      weight_kg: weightKg ?? null,
      age_years: ageYears ?? null,
      special_notes: specialNotes || null,
    })
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
