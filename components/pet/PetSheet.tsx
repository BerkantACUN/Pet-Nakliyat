"use client";

import { useState, type ReactElement } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PetForm } from "./PetForm";
import type { Pet } from "@/lib/supabase/types";

interface PetSheetProps {
  pet?: Pet;
  trigger: ReactElement;
}

export function PetSheet({ pet, trigger }: PetSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger} />
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-3xl border-chalk bg-eggshell"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display text-[22px]">
            {pet ? `${pet.name} düzenle` : "Yeni pet ekle 🐾"}
          </SheetTitle>
        </SheetHeader>
        <div className="px-1 pb-6">
          <PetForm pet={pet} onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
