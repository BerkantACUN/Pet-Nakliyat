import { z } from "zod";
import { turkishPhoneRegex } from "./auth";

const ROLES = ["customer", "transporter", "sitter", "vet"] as const;

export const onboardingSchema = z.object({
  phone: z
    .string()
    .transform((v) => v.replace(/[\s\-().]/g, ""))
    .pipe(
      z
        .string()
        .regex(
          turkishPhoneRegex,
          "Geçerli bir Türkiye cep telefonu numarası gir (örn. 0532 123 45 67)",
        ),
    ),
  city: z
    .string()
    .min(2, "Şehir adı en az 2 karakter")
    .max(40, "Şehir adı çok uzun"),
  defaultRole: z.enum(ROLES, { message: "Bir rol seç" }),
  marketingConsent: z.boolean(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
