import { z } from "zod";

export const turkishPhoneRegex = /^(\+90|0)?5\d{9}$/;

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "En az 2 karakter olmalı")
      .max(80, "En fazla 80 karakter")
      .regex(/^[\p{L}\s\-']+$/u, "Sadece harf, boşluk ve tire kullan"),
    email: z.string().email("Geçerli bir e-posta gir"),
    password: z
      .string()
      .min(8, "En az 8 karakter")
      .regex(/[A-Za-z]/, "En az bir harf içermeli")
      .regex(/\d/, "En az bir rakam içermeli"),
    passwordConfirm: z.string(),
    kvkkConsent: z.boolean().refine((v) => v === true, {
      message: "KVKK aydınlatmasını onaylamadan devam edemezsin",
    }),
    marketingConsent: z.boolean(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Şifreler aynı değil",
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email("Geçerli bir e-posta gir"),
  password: z.string().min(1, "Şifre gerekli"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const resetPasswordRequestSchema = z.object({
  email: z.string().email("Geçerli bir e-posta gir"),
});

export type ResetPasswordRequestInput = z.infer<
  typeof resetPasswordRequestSchema
>;

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "En az 8 karakter")
      .regex(/[A-Za-z]/, "En az bir harf içermeli")
      .regex(/\d/, "En az bir rakam içermeli"),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Şifreler aynı değil",
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
