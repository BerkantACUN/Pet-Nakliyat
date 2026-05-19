import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, Truck, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chip } from "@/components/marketing/Chip";
import { FollowButton } from "@/components/profile/FollowButton";
import { MessageButton } from "@/components/profile/MessageButton";
import { PostCard, type PostCardData } from "@/components/posts/PostCard";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const VEHICLE_LABEL: Record<string, string> = {
  car: "Otomobil",
  van: "Van / minibüs",
  truck: "Kamyon",
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, bio")
    .eq("id", id)
    .maybeSingle();
  if (!data) return { title: "Profil · Patiyolu" };
  return {
    title: `${data.full_name} · Patiyolu`,
    description: data.bio ?? `${data.full_name} kullanıcısının Patiyolu profili.`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const me = await getUser();

  const { data: stats } = await supabase
    .from("profile_stats")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!stats) notFound();

  const isOwn = me?.id === stats.id;

  // Takip durumu
  let isFollowing = false;
  if (me && !isOwn) {
    const { data: f } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", me.id)
      .eq("following_id", stats.id)
      .maybeSingle();
    isFollowing = !!f;
  }

  // Paylaşımları
  const { data: rawPosts } = await supabase
    .from("posts")
    .select("id, author_id, body, image_url, like_count, comment_count, created_at")
    .eq("author_id", stats.id)
    .order("created_at", { ascending: false })
    .limit(20);

  let likedSet = new Set<string>();
  if (me && rawPosts && rawPosts.length > 0) {
    const likes = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", me.id)
      .in(
        "post_id",
        rawPosts.map((p) => p.id),
      );
    likedSet = new Set((likes.data ?? []).map((l) => l.post_id));
  }

  const posts: PostCardData[] = (rawPosts ?? []).map((p) => ({
    id: p.id,
    author_id: p.author_id,
    body: p.body,
    image_url: p.image_url,
    like_count: p.like_count,
    comment_count: p.comment_count,
    created_at: p.created_at,
    author: {
      full_name: stats.full_name,
      avatar_url: stats.avatar_url,
    },
    liked_by_me: likedSet.has(p.id),
  }));

  // Son yorumlar (taşıyıcıysa)
  type ReviewItem = {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    author_id: string;
    author: { full_name: string | null; avatar_url: string | null } | null;
  };

  let reviews: ReviewItem[] | null = null;
  if (stats.is_transporter) {
    const { data: rawReviews } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, author_id")
      .eq("target_id", stats.id)
      .order("created_at", { ascending: false })
      .limit(8);

    if (rawReviews && rawReviews.length > 0) {
      const authorIds = Array.from(new Set(rawReviews.map((r) => r.author_id)));
      const { data: authors } = await supabase
        .from("public_profiles")
        .select("id, full_name, avatar_url")
        .in("id", authorIds);
      const byId = new Map(
        (authors ?? []).map((a) => [a.id, a] as const),
      );
      reviews = rawReviews.map((r) => ({
        ...r,
        author: byId.get(r.author_id) ?? null,
      }));
    } else {
      reviews = [];
    }
  }

  return (
    <div className="min-h-screen bg-eggshell pb-12">
      {/* Cover */}
      <div
        className="h-32 w-full md:h-44"
        style={{
          background: stats.cover_url
            ? `url(${stats.cover_url}) center/cover`
            : "linear-gradient(135deg, color-mix(in oklch, var(--color-paw) 30%, white), color-mix(in oklch, var(--color-blush) 40%, white))",
        }}
      />

      <div className="mx-auto -mt-12 max-w-2xl px-4">
        <Link
          href="/panel"
          className="mb-3 inline-flex items-center gap-1 text-[12px] text-gravel hover:text-obsidian"
        >
          <ArrowLeft className="size-3.5" /> Panele dön
        </Link>

        <div className="rounded-3xl border border-chalk bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <Avatar className="size-20 border-4 border-eggshell shadow-sm">
              {stats.avatar_url ? (
                <AvatarImage src={stats.avatar_url} alt={stats.full_name} />
              ) : null}
              <AvatarFallback className="bg-paw/20 text-[24px] font-medium text-obsidian">
                {initials(stats.full_name)}
              </AvatarFallback>
            </Avatar>

            {!isOwn && me ? (
              <div className="flex flex-wrap gap-2">
                <FollowButton
                  targetId={stats.id}
                  initialFollowing={isFollowing}
                />
                <MessageButton targetId={stats.id} />
              </div>
            ) : isOwn ? (
              <Link
                href="/profil"
                className="rounded-pill border border-chalk px-4 py-2 text-[12px] font-medium hover:bg-powder"
              >
                Profili düzenle
              </Link>
            ) : null}
          </div>

          <div className="mt-3">
            <h1 className="font-display text-[24px] leading-tight">
              {stats.full_name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-gravel">
              {stats.city ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" /> {stats.city}
                </span>
              ) : null}
              <span>·</span>
              <span>
                {new Date(stats.created_at).toLocaleDateString("tr-TR", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                tarihinden beri
              </span>
            </div>
            {stats.bio ? (
              <p className="mt-3 text-[14px] leading-relaxed text-obsidian/90">
                {stats.bio}
              </p>
            ) : null}
          </div>

          {/* Roller */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stats.is_customer ? (
              <Chip className="bg-powder">🐾 Müşteri</Chip>
            ) : null}
            {stats.is_transporter ? (
              <Chip className="bg-paw/20 border-paw/40">🚐 Taşıyıcı</Chip>
            ) : null}
          </div>

          {/* Takipçi sayıları */}
          <div className="mt-4 flex items-center gap-6 border-t border-chalk pt-4">
            <Stat label="Takipçi" value={stats.followers_count ?? 0} />
            <Stat label="Takip" value={stats.following_count ?? 0} />
            {stats.is_transporter ? (
              <Stat
                label="Tamamlanan"
                value={stats.completed_count ?? 0}
                hint="iş"
              />
            ) : null}
          </div>
        </div>

        {/* Taşıyıcı bilgileri */}
        {stats.is_transporter ? (
          <div className="mt-4 rounded-3xl border border-chalk bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[18px]">Taşıyıcı performansı</h2>
              {stats.transporter_slug ? (
                <Link
                  href={`/tasiyicilar/${stats.transporter_slug}`}
                  className="text-[12px] text-signal hover:underline"
                >
                  Detaylı ilan ↗
                </Link>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <RatingBox
                value={Number(stats.rating_avg ?? 0)}
                count={stats.rating_count ?? 0}
              />
              <MetricBox
                icon={<Truck className="size-4" />}
                label="Tamamlanan"
                value={`${stats.completed_count ?? 0}`}
              />
              <MetricBox
                icon={<Calendar className="size-4" />}
                label="Üyelik"
                value={`${monthsSince(stats.created_at)} ay`}
              />
            </div>
            {stats.service_cities && stats.service_cities.length > 0 ? (
              <div className="mt-4">
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-gravel">
                  Hizmet şehirleri
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {stats.service_cities.map((c: string) => (
                    <Chip key={c} className="bg-powder">
                      📍 {c}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}
            {stats.vehicle_type ? (
              <div className="mt-3">
                <Chip className="bg-powder">
                  🚐 {VEHICLE_LABEL[stats.vehicle_type] ?? stats.vehicle_type}
                </Chip>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Paylaşımlar */}
        {posts.length > 0 ? (
          <div className="mt-4 space-y-3">
            <h2 className="px-1 font-display text-[18px]">Paylaşımlar</h2>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} currentUserId={me?.id ?? null} />
            ))}
          </div>
        ) : null}

        {/* Yorumlar */}
        {stats.is_transporter ? (
          <div className="mt-4 rounded-3xl border border-chalk bg-white p-5">
            <h2 className="mb-3 font-display text-[18px]">
              Yorumlar{" "}
              <span className="text-[12px] text-gravel">
                ({stats.rating_count ?? 0})
              </span>
            </h2>
            {reviews && reviews.length > 0 ? (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="border-b border-chalk pb-3 last:border-b-0 last:pb-0"
                  >
                    <ReviewItem review={r} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-gravel">
                Henüz yorum yok. İlk tamamlanan işten sonra burada görünecek.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function monthsSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24 * 30)));
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div>
      <div className="font-display text-[20px] leading-none">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-gravel">
        {label}
        {hint ? ` ${hint}` : ""}
      </div>
    </div>
  );
}

function RatingBox({ value, count }: { value: number; count: number }) {
  return (
    <div className="rounded-2xl bg-powder/50 p-3 text-center">
      <div className="flex items-center justify-center gap-1 font-display text-[20px] leading-none">
        <Star className="size-4 fill-paw text-paw" />
        {value.toFixed(1)}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-gravel">
        {count} yorum
      </div>
    </div>
  );
}

function MetricBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-powder/50 p-3 text-center">
      <div className="mb-1 flex justify-center text-gravel">{icon}</div>
      <div className="font-display text-[16px] leading-none">{value}</div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-gravel">
        {label}
      </div>
    </div>
  );
}

interface ReviewItemProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    author_id: string;
    author: { full_name: string | null; avatar_url: string | null } | null;
  };
}

function ReviewItem({ review }: ReviewItemProps) {
  const author = review.author;
  const name = author?.full_name ?? "Anonim";
  return (
    <div className="flex items-start gap-3">
      <Link href={`/u/${review.author_id}`}>
        <Avatar className="size-9">
          {author?.avatar_url ? (
            <AvatarImage src={author.avatar_url} alt={name} />
          ) : null}
          <AvatarFallback className="bg-powder text-[11px] font-medium">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <Link
            href={`/u/${review.author_id}`}
            className="text-[13px] font-medium hover:underline"
          >
            {name}
          </Link>
          <div className="flex items-center gap-1 text-[12px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-3 ${
                  i < review.rating
                    ? "fill-paw text-paw"
                    : "text-chalk"
                }`}
              />
            ))}
          </div>
        </div>
        {review.comment ? (
          <p className="mt-1 text-[13px] leading-relaxed text-obsidian/85">
            {review.comment}
          </p>
        ) : null}
        <p className="mt-1 text-[10px] text-gravel">
          {new Date(review.created_at).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
