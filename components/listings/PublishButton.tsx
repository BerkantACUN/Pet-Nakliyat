"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { publishListingAction } from "@/app/(panel)/musteri/[id]/actions";
import { formatPriceTRY } from "@/lib/utils";
import { LISTING_FEE_TRY } from "@/lib/pricing";

interface PublishButtonProps {
  listingId: string;
}

export function PublishButton({ listingId }: PublishButtonProps) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (
      !confirm(
        `İlanı yayınlamak istediğine emin misin? Yayın ücreti ${formatPriceTRY(
          LISTING_FEE_TRY,
        )}. (Iyzico entegrasyonu bağlanana kadar dev modunda ücretsiz.)`,
      )
    )
      return;
    startTransition(async () => {
      const result = await publishListingAction(listingId);
      if (!result.ok) {
        toast.error(result.error ?? "Yayınlanamadı");
        return;
      }
      toast.success("İlanın yayında 🎉");
    });
  }

  return (
    <Button
      variant="pill"
      size="lg"
      className="w-full"
      disabled={pending}
      onClick={onClick}
    >
      {pending ? "Yayınlanıyor…" : `Yayınla · ${formatPriceTRY(LISTING_FEE_TRY)}`}
    </Button>
  );
}
