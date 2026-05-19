import { z } from "zod";

const SPECIES = ["dog", "cat", "bird", "rabbit", "other"] as const;
const FOOD_TYPES = [
  "dry",
  "wet",
  "raw",
  "home_cooked",
  "mixed",
  "other",
] as const;

const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;

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
  foodBrand: z
    .string()
    .max(120, "En fazla 120 karakter")
    .optional()
    .or(z.literal("")),
  foodType: z.enum(FOOD_TYPES).optional().or(z.literal("")),
  feedingTimes: z
    .array(z.string().regex(timeRegex, "Saat formatı: HH:MM"))
    .max(8, "En fazla 8 öğün")
    .optional(),
  toiletTimes: z
    .array(z.string().regex(timeRegex, "Saat formatı: HH:MM"))
    .max(8, "En fazla 8 zaman")
    .optional(),
  medications: z
    .string()
    .max(500, "En fazla 500 karakter")
    .optional()
    .or(z.literal("")),
  isNeutered: z.boolean().optional(),
  isVaccinated: z.boolean().optional(),
  vetContact: z
    .string()
    .max(200, "En fazla 200 karakter")
    .optional()
    .or(z.literal("")),
  emergencyContact: z
    .string()
    .max(200, "En fazla 200 karakter")
    .optional()
    .or(z.literal("")),
});

export type PetInput = z.infer<typeof petSchema>;
