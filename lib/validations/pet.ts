import { z } from "zod";

const SPECIES = ["dog", "cat", "bird", "rabbit", "other"] as const;

export const petSchema = z.object({
  name: z.string().min(1, "İsim gerekli").max(40, "En fazla 40 karakter"),
  species: z.enum(SPECIES, { message: "Tür seç" }),
  breed: z.string().max(60).optional().or(z.literal("")),
  weightKg: z
    .number({ message: "Sayı gir" })
    .min(0.1, "0.1 kg'dan fazla olmalı")
    .max(120, "120 kg'dan fazla olamaz")
    .optional(),
  ageYears: z
    .number({ message: "Sayı gir" })
    .min(0, "0'dan küçük olamaz")
    .max(40, "40'tan fazla olamaz")
    .optional(),
  specialNotes: z.string().max(500, "En fazla 500 karakter").optional().or(z.literal("")),
});

export type PetInput = z.infer<typeof petSchema>;
