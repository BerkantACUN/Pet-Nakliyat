import { z } from "zod";

const URGENCIES = ["standard", "express", "sameday"] as const;
const CARRIER_PROVIDED = ["customer", "transporter", "none"] as const;
const TEMPERATURE = ["cool", "normal", "warm"] as const;

const addressSchema = z.object({
  address: z.string().min(3, "Adres gerekli"),
  lat: z.number(),
  lng: z.number(),
  city: z.string().nullable(),
});

export const listingDraftSchema = z.object({
  petId: z.string().uuid("Pet seç"),
  pickup: addressSchema,
  dropoff: addressSchema,
  scheduledAt: z
    .string()
    .min(1, "Tarih gerekli")
    .refine(
      (v) => {
        const d = new Date(v);
        return !Number.isNaN(d.getTime()) && d.getTime() > Date.now() - 60_000;
      },
      "Geçmiş tarih seçilemez",
    ),
  urgency: z.enum(URGENCIES, { message: "Acillik seç" }),
  notes: z.string().max(800, "En fazla 800 karakter").optional().or(z.literal("")),
  careNotes: z
    .string()
    .max(1000, "En fazla 1000 karakter")
    .optional()
    .or(z.literal("")),
  feedingDuringTransit: z.boolean().optional(),
  carrierProvided: z.enum(CARRIER_PROVIDED).optional().or(z.literal("")),
  temperaturePreference: z.enum(TEMPERATURE).optional().or(z.literal("")),
});

export type ListingDraftInput = z.infer<typeof listingDraftSchema>;
