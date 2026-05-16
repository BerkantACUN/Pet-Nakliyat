"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { enableTransporterAction } from "@/app/(panel)/profil/actions";

export function EnableTransporterButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await enableTransporterAction();
      if (!result.ok) {
        toast.error(result.error ?? "Açılamadı");
        return;
      }
      toast.success("Taşıyıcı modu açıldı 🐾");
      router.refresh();
      router.push("/sozlesme");
    });
  }

  return (
    <Button
      variant="pill"
      size="lg"
      onClick={onClick}
      disabled={pending}
      className="w-full"
    >
      {pending ? "Açılıyor…" : "Taşıyıcı modunu aç"}
    </Button>
  );
}
