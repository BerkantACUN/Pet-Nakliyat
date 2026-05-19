"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { enableCustomerAction } from "@/app/(panel)/profil/actions";

export function EnableCustomerButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await enableCustomerAction();
      if (!result.ok) {
        toast.error(result.error ?? "Açılamadı");
        return;
      }
      toast.success("Müşteri modu açıldı 🐾");
      router.refresh();
      router.push("/musteri");
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
      {pending ? "Açılıyor…" : "Müşteri modunu aç"}
    </Button>
  );
}
