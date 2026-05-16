"use client";

import { useState, type ReactElement } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BidForm } from "./BidForm";

interface BidSheetProps {
  listingId: string;
  estMin: number;
  estMax: number;
  trigger: ReactElement;
}

export function BidSheet({ listingId, estMin, estMax, trigger }: BidSheetProps) {
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
            Teklif at 📨
          </SheetTitle>
        </SheetHeader>
        <div className="px-1 pb-6">
          <BidForm
            listingId={listingId}
            estMin={estMin}
            estMax={estMax}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
