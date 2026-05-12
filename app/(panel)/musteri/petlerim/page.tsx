import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PetCard } from "@/components/pet/PetCard";
import { PetSheet } from "@/components/pet/PetSheet";
import type { Pet } from "@/lib/supabase/types";

export const metadata = { title: "Petlerim · Patiyolu" };

export default async function PetlerimPage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();
  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const list = (pets ?? []) as Pet[];

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            tüylü kadron
          </span>
          <h1 className="font-display text-[28px] leading-tight">Petlerim</h1>
        </div>
        <PetSheet
          trigger={
            <Button variant="pill" size="sm">
              <Plus className="size-3.5" /> Ekle
            </Button>
          }
        />
      </header>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-chalk bg-powder p-6 text-center">
          <div className="text-3xl" aria-hidden>🐾</div>
          <p className="mt-3 text-[14px] text-gravel">
            Henüz pet eklemedin. Tüylü dostunu tanıyalım.
          </p>
          <PetSheet
            trigger={
              <Button variant="pill" size="sm" className="mt-4">
                <Plus className="size-3.5" /> İlk peti ekle
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <PetCardWithSheet key={p.id} pet={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PetCardWithSheet({ pet }: { pet: Pet }) {
  // Sheet, edit butonuna sarılı olarak gelmesi gerekir; PetCard'a slot olarak ver.
  // Basitleştirmek için: PetCard'ın edit butonu açık olduğunda kullanıcıya sheet aç.
  // Şu an PetCard onEdit ile basit callback alır, ama burada Sheet trigger'lamamız lazım.
  return (
    <PetSheet
      pet={pet}
      trigger={
        <div className="cursor-pointer">
          <PetCard pet={pet} />
        </div>
      }
    />
  );
}
