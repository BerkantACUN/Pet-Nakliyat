import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { ListingForm } from "@/components/listings/ListingForm";
import type { Pet } from "@/lib/supabase/types";

export const metadata = { title: "Yeni ilan · Patiyolu" };

export default async function IlanOlusturPage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();
  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          yeni nakliyat
        </span>
        <h1 className="font-display text-[28px] leading-tight">
          İlan oluştur
        </h1>
        <p className="mt-1 text-[13px] text-gravel">
          Sözleşmeli taşıyıcılardan teklif almaya başla.
        </p>
      </header>
      <ListingForm pets={(pets ?? []) as Pet[]} />
    </div>
  );
}
