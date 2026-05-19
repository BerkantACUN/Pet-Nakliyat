import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { TransporterProfileForm } from "@/components/profile/TransporterProfileForm";
import { EnableTransporterButton } from "@/components/profile/EnableTransporterButton";
import { EnableCustomerButton } from "@/components/profile/EnableCustomerButton";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { BioEditor } from "@/components/profile/BioEditor";
import { PostComposer } from "@/components/posts/PostComposer";
import { PostCard, type PostCardData } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Profil — Patiyolu" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const isCustomer = user.roles.includes("customer");
  const isTransporter = user.roles.includes("transporter");

  const { data: tp } = isTransporter
    ? await supabase
        .from("transporter_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: fullProfile } = await supabase
    .from("profiles")
    .select("bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data: rawPosts } = await supabase
    .from("posts")
    .select("id, author_id, body, image_url, like_count, comment_count, created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const myLikes = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", user.id)
    .in("post_id", (rawPosts ?? []).map((p) => p.id));

  const likedSet = new Set((myLikes.data ?? []).map((l) => l.post_id));

  const posts: PostCardData[] = (rawPosts ?? []).map((p) => ({
    id: p.id,
    author_id: p.author_id,
    body: p.body,
    image_url: p.image_url,
    like_count: p.like_count,
    comment_count: p.comment_count,
    created_at: p.created_at,
    author: {
      full_name: user.profile!.full_name,
      avatar_url: fullProfile?.avatar_url ?? user.profile!.avatar_url,
    },
    liked_by_me: likedSet.has(p.id),
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          Hesap
        </span>
        <h1 className="font-display text-[28px] leading-tight">Profil</h1>
        <p className="text-[13px] text-gravel">
          Adın, iletişim bilgilerin ve rollerin.
        </p>
      </header>

      <section className="rounded-3xl border border-chalk bg-white p-5 space-y-5">
        <AvatarUploader
          avatarUrl={fullProfile?.avatar_url ?? user.profile!.avatar_url}
          name={user.profile!.full_name}
        />
        <BioEditor defaultBio={fullProfile?.bio ?? ""} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[18px]">Paylaşımların</h2>
        <PostComposer
          authorName={user.profile!.full_name}
          avatarUrl={fullProfile?.avatar_url ?? user.profile!.avatar_url}
        />
        {posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} currentUserId={user.id} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-chalk bg-white p-5">
        <h2 className="mb-4 font-display text-[18px]">Kişisel bilgiler</h2>
        <ProfileForm
          defaults={{
            fullName: user.profile!.full_name,
            city: user.profile!.city ?? "",
            phone: user.profile!.phone ?? "",
          }}
        />
      </section>

      <section className="rounded-3xl border border-chalk bg-white p-5">
        <h2 className="mb-1 font-display text-[18px]">Rollerin</h2>
        <p className="mb-4 text-[12px] text-gravel">
          Aktif olan rollere göre paneline farklı sekmeler eklenir.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <RoleTile
            label="Müşteri"
            emoji="🐾"
            active={isCustomer}
            description="Petini taşıt, ilan aç."
          />
          <RoleTile
            label="Taşıyıcı"
            emoji="🚐"
            active={isTransporter}
            description="Pet taşı, gelir kazan."
          />
        </div>
        <div className="mt-4 grid gap-2">
          {!isCustomer ? <EnableCustomerButton /> : null}
          {!isTransporter ? <EnableTransporterButton /> : null}
        </div>
      </section>

      {isTransporter ? (
        <section className="rounded-3xl border border-chalk bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-display text-[18px]">Taşıyıcı bilgileri</h2>
            {tp ? (
              <Button
                variant="pill-ghost"
                size="sm"
                render={<Link href={`/tasiyicilar/${tp.slug}`} />}
              >
                Public profil ↗
              </Button>
            ) : null}
          </div>
          {tp ? (
            <TransporterProfileForm
              defaults={{
                displayName: tp.display_name,
                bio: tp.bio ?? "",
                companyName: tp.company_name ?? "",
                vehicleType: tp.vehicle_type ?? undefined,
                plate: tp.plate ?? "",
                serviceCities: (tp.service_cities ?? []).join(", "),
                baseRatePerKm: Number(tp.base_rate_per_km),
                minCharge: Number(tp.min_charge),
              }}
            />
          ) : (
            <div className="rounded-2xl bg-powder/40 p-4">
              <p className="text-[13px] text-gravel">
                Taşıyıcı profilin henüz hazır değil. Aşağıdaki butona basarak
                varsayılan profili oluştur, sonra sözleşme + KYC adımlarına geç.
              </p>
              <div className="mt-3">
                <EnableTransporterButton />
              </div>
            </div>
          )}
        </section>
      ) : null}

      <section className="rounded-3xl border border-chalk bg-white p-5 text-[13px] text-gravel">
        <p>
          <strong className="text-obsidian">E-posta:</strong>{" "}
          {user.email ?? "—"}
        </p>
        <p className="mt-1">
          <strong className="text-obsidian">Üye olduğun:</strong>{" "}
          {new Date(user.profile!.created_at).toLocaleDateString("tr-TR")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="pill-outline"
            size="sm"
            render={<Link href="/ayarlar" />}
          >
            Ayarlar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/sifre-sifirla" />}
          >
            Şifre sıfırla
          </Button>
        </div>
      </section>
    </div>
  );
}

interface RoleTileProps {
  label: string;
  emoji: string;
  active: boolean;
  description: string;
}

function RoleTile({ label, emoji, active, description }: RoleTileProps) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        active ? "border-paw bg-paw/10" : "border-chalk bg-powder/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[20px]" aria-hidden>
          {emoji}
        </span>
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.12em] ${
            active ? "text-paw" : "text-gravel"
          }`}
        >
          {active ? "aktif" : "kapalı"}
        </span>
      </div>
      <div className="mt-2 font-display text-[16px] leading-tight">{label}</div>
      <p className="text-[12px] text-gravel">{description}</p>
    </div>
  );
}
