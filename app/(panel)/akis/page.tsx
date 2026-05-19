import Link from "next/link";
import { ArrowRight, MapPin, Package, Sparkles, Truck } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PostComposer } from "@/components/posts/PostComposer";
import { PostCard, type PostCardData } from "@/components/posts/PostCard";
import { Chip } from "@/components/marketing/Chip";
import { REGION_LABELS } from "@/lib/turkey-regions";
import { formatPriceRange, formatDistanceKm } from "@/lib/utils";
import type { Listing } from "@/lib/supabase/types";

export const metadata = { title: "Akış · Patiyolu" };
export const dynamic = "force-dynamic";

interface RawPost {
  id: string;
  author_id: string;
  body: string;
  image_url: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
}

interface FeedPost {
  kind: "post";
  data: PostCardData;
  score: number;
}

interface FeedListing {
  kind: "listing";
  data: Listing & {
    customer_name: string | null;
    customer_avatar: string | null;
  };
  score: number;
}

type FeedItem = FeedPost | FeedListing;

export default async function AkisPage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const { data: meProfile } = await supabase
    .from("profiles")
    .select("region, avatar_url, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const myRegion = meProfile?.region ?? null;

  // Takip ettiklerim
  const { data: followsRaw } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);
  const followedIds = new Set(
    (followsRaw ?? []).map((f) => f.following_id),
  );

  // Son 30 günün postları (limit 40)
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: postsRaw } = await supabase
    .from("posts")
    .select(
      "id, author_id, body, image_url, like_count, comment_count, created_at",
    )
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(40);

  const allPosts = (postsRaw ?? []) as RawPost[];

  // Son 14 günün published ilanları (limit 20)
  const sinceListings = new Date(
    Date.now() - 14 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { data: listingsRaw } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "published")
    .gte("created_at", sinceListings)
    .order("created_at", { ascending: false })
    .limit(20);

  const allListings = (listingsRaw ?? []) as Listing[];

  // Profil bilgileri toplu çek (author + customer)
  const authorIds = new Set([
    ...allPosts.map((p) => p.author_id),
    ...allListings.map((l) => l.customer_id),
  ]);
  const { data: profilesData } =
    authorIds.size > 0
      ? await supabase
          .from("profile_stats")
          .select("id, full_name, avatar_url, region")
          .in("id", Array.from(authorIds))
      : { data: [] };

  const profileById = new Map(
    (profilesData ?? []).map((p) => [p.id, p] as const),
  );

  // Kendi like'larım
  const myLikes =
    allPosts.length > 0
      ? await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in(
            "post_id",
            allPosts.map((p) => p.id),
          )
      : { data: [] };
  const likedSet = new Set((myLikes.data ?? []).map((l) => l.post_id));

  // Feed item'ları skorla
  function scoreFor(
    createdAt: string,
    authorId: string,
    listingCity?: string | null,
  ): number {
    const hoursAgo = (Date.now() - new Date(createdAt).getTime()) / 36e5;
    let score = -hoursAgo;
    if (followedIds.has(authorId)) score += 200;
    const authorProfile = profileById.get(authorId);
    if (myRegion && authorProfile?.region === myRegion) score += 80;
    // Listing'in pickup şehri bizim bölgemize uyuyorsa boost
    if (myRegion && listingCity) {
      // basit: aynı region check'ini profile'dan yaptık; pickup_city'den ayrıca burada yapmıyoruz
    }
    return score;
  }

  const feedPosts: FeedPost[] = allPosts.map((p) => {
    const author = profileById.get(p.author_id);
    return {
      kind: "post",
      score: scoreFor(p.created_at, p.author_id),
      data: {
        id: p.id,
        author_id: p.author_id,
        body: p.body,
        image_url: p.image_url,
        like_count: p.like_count,
        comment_count: p.comment_count,
        created_at: p.created_at,
        author: author
          ? {
              full_name: author.full_name,
              avatar_url: author.avatar_url,
            }
          : null,
        liked_by_me: likedSet.has(p.id),
      },
    };
  });

  const feedListings: FeedListing[] = allListings.map((l) => {
    const owner = profileById.get(l.customer_id);
    return {
      kind: "listing",
      score: scoreFor(l.created_at, l.customer_id, l.pickup_city) + 20,
      data: {
        ...l,
        customer_name: owner?.full_name ?? null,
        customer_avatar: owner?.avatar_url ?? null,
      },
    };
  });

  const feed: FeedItem[] = [...feedPosts, ...feedListings].sort(
    (a, b) => b.score - a.score,
  );

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          {greeting()} —
        </span>
        <h1 className="font-display text-[28px] leading-tight">
          Akış 🐾
        </h1>
        <p className="text-[13px] text-gravel">
          {myRegion
            ? `${REGION_LABELS[myRegion]} bölgesi öne çıkıyor.`
            : "Bölgeni seç ki yakın taşıyıcılar ve ilanlar öne çıksın."}
        </p>
      </header>

      <PostComposer
        authorName={meProfile?.full_name ?? user.profile!.full_name}
        avatarUrl={meProfile?.avatar_url ?? user.profile!.avatar_url}
      />

      {!myRegion ? (
        <Link
          href="/profil"
          className="flex items-center gap-3 rounded-3xl border border-paw/30 bg-paw/10 p-4 transition hover:bg-paw/15"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-paw/30">
            <MapPin className="size-5 text-obsidian" />
          </div>
          <div className="flex-1">
            <div className="font-display text-[15px] leading-tight">
              Bölgeni seç
            </div>
            <div className="text-[12px] text-gravel">
              Aynı bölgendeki ilanlar ve taşıyıcılar akışta öne çıksın.
            </div>
          </div>
          <ArrowRight className="size-4 text-gravel" />
        </Link>
      ) : null}

      {feed.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-chalk bg-powder p-6 text-center">
          <div className="text-3xl" aria-hidden>
            🐾
          </div>
          <p className="mt-3 text-[13px] text-gravel">
            Akışta henüz bir şey yok. İlk paylaşımı sen yap!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feed.map((item) =>
            item.kind === "post" ? (
              <PostCard
                key={`post-${item.data.id}`}
                post={item.data}
                currentUserId={user.id}
              />
            ) : (
              <ListingFeedCard
                key={`listing-${item.data.id}`}
                listing={item.data}
                myRegion={myRegion}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function ListingFeedCard({
  listing,
  myRegion,
}: {
  listing: FeedListing["data"];
  myRegion: string | null;
}) {
  return (
    <Link
      href={`/tasiyici/ilanlar/${listing.id}`}
      className="block rounded-3xl border border-chalk bg-white p-4 transition hover:bg-powder"
    >
      <header className="flex items-center gap-2">
        <Chip className="bg-clover/20 text-clover">
          <Package className="size-3" /> Yeni ilan
        </Chip>
        {listing.urgency !== "standard" ? (
          <Chip className="bg-paw/20 text-obsidian">
            <Sparkles className="size-3" />{" "}
            {listing.urgency === "express" ? "Express" : "Aynı gün"}
          </Chip>
        ) : null}
      </header>

      <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
        <div className="min-w-0">
          <div className="text-[15px] font-medium leading-tight">
            <span className="text-gravel">{listing.pickup_city ?? "—"}</span>
            <span className="mx-2 text-gravel">→</span>
            <span>{listing.dropoff_city ?? "—"}</span>
          </div>
          <div className="mt-0.5 text-[11px] text-gravel">
            {formatDistanceKm(listing.distance_km)}
            {listing.scheduled_at
              ? " · " +
                new Date(listing.scheduled_at).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                })
              : ""}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-[18px] leading-none">
            {formatPriceRange(listing.est_price_min, listing.est_price_max)}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gravel">
            tahmini
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-chalk pt-3 text-[12px]">
        <span className="text-gravel">
          {listing.customer_name ?? "Müşteri"}
        </span>
        <span className="inline-flex items-center gap-1 text-signal">
          <Truck className="size-3" /> Detay
        </span>
      </div>
    </Link>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "iyi geceler";
  if (h < 12) return "günaydın";
  if (h < 18) return "tünaydın";
  return "iyi akşamlar";
}
