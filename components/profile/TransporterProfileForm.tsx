"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateTransporterProfileAction,
  type TransporterProfileInput,
} from "@/app/(panel)/profil/actions";

interface TransporterProfileFormProps {
  defaults: TransporterProfileInput;
}

export function TransporterProfileForm({
  defaults,
}: TransporterProfileFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<TransporterProfileInput>({ defaultValues: defaults });

  function onSubmit(data: TransporterProfileInput) {
    startTransition(async () => {
      const result = await updateTransporterProfileAction(data);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [k, v] of Object.entries(result.fieldErrors)) {
            setError(k as keyof TransporterProfileInput, { message: v });
          }
        }
        toast.error(result.error ?? "Güncellenemedi");
        return;
      }
      toast.success("Taşıyıcı profili güncellendi");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="displayName" className="text-[12px] text-gravel">
          Görünen ad
        </Label>
        <Input
          id="displayName"
          aria-invalid={!!errors.displayName}
          {...register("displayName")}
        />
        {errors.displayName?.message ? (
          <p className="text-[12px] text-danger">{errors.displayName.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio" className="text-[12px] text-gravel">
          Kısa tanıtım (opsiyonel)
        </Label>
        <Textarea
          id="bio"
          rows={3}
          placeholder="Örn. 8 yıl tecrübeli, klimalı van, hayvanseverim."
          {...register("bio")}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="companyName" className="text-[12px] text-gravel">
            Şirket adı (opsiyonel)
          </Label>
          <Input id="companyName" {...register("companyName")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vehicleType" className="text-[12px] text-gravel">
            Araç tipi
          </Label>
          <select
            id="vehicleType"
            className="h-9 w-full rounded-input border border-chalk bg-white px-3 text-[14px]"
            {...register("vehicleType")}
          >
            <option value="">Seç…</option>
            <option value="car">Otomobil</option>
            <option value="van">Van / minibüs</option>
            <option value="truck">Kamyon</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="plate" className="text-[12px] text-gravel">
            Plaka
          </Label>
          <Input
            id="plate"
            placeholder="34 ABC 123"
            {...register("plate")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="serviceCities" className="text-[12px] text-gravel">
            Hizmet şehirleri (virgülle)
          </Label>
          <Input
            id="serviceCities"
            placeholder="İstanbul, Ankara, İzmir"
            {...register("serviceCities")}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="baseRatePerKm" className="text-[12px] text-gravel">
            Km başına ücret (₺)
          </Label>
          <Input
            id="baseRatePerKm"
            type="number"
            step="0.5"
            aria-invalid={!!errors.baseRatePerKm}
            {...register("baseRatePerKm", { valueAsNumber: true })}
          />
          {errors.baseRatePerKm?.message ? (
            <p className="text-[12px] text-danger">
              {errors.baseRatePerKm.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="minCharge" className="text-[12px] text-gravel">
            Minimum ücret (₺)
          </Label>
          <Input
            id="minCharge"
            type="number"
            step="50"
            aria-invalid={!!errors.minCharge}
            {...register("minCharge", { valueAsNumber: true })}
          />
          {errors.minCharge?.message ? (
            <p className="text-[12px] text-danger">
              {errors.minCharge.message}
            </p>
          ) : null}
        </div>
      </div>

      <Button type="submit" variant="pill" size="lg" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Taşıyıcı bilgilerini kaydet"}
      </Button>
    </form>
  );
}
