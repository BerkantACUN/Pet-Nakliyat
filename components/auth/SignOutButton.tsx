"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/(auth)/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="lg"
      onClick={() => startTransition(() => signOutAction())}
      disabled={pending}
    >
      <LogOut className="size-4" />
      {pending ? "Çıkılıyor…" : "Çıkış yap"}
    </Button>
  );
}
