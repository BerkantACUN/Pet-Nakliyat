"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  togglePostLikeAction,
  deletePostAction,
} from "@/app/(panel)/posts/actions";

export interface PostCardData {
  id: string;
  author_id: string;
  body: string;
  image_url: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  author: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  liked_by_me: boolean;
}

interface PostCardProps {
  post: PostCardData;
  currentUserId: string | null;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [pending, startTransition] = useTransition();

  const isOwn = currentUserId === post.author_id;
  const authorName = post.author?.full_name ?? "Kullanıcı";

  function toggleLike() {
    if (!currentUserId) {
      router.push("/giris");
      return;
    }
    const prevLiked = liked;
    setLiked(!prevLiked);
    setLikeCount((c) => (prevLiked ? Math.max(c - 1, 0) : c + 1));
    startTransition(async () => {
      const r = await togglePostLikeAction(post.id);
      if (!r.ok) {
        setLiked(prevLiked);
        setLikeCount(post.like_count);
        toast.error(r.error ?? "İşlem başarısız");
      }
    });
  }

  function onDelete() {
    if (!confirm("Bu paylaşımı silmek istediğine emin misin?")) return;
    startTransition(async () => {
      const r = await deletePostAction(post.id);
      if (!r.ok) {
        toast.error(r.error ?? "Silinemedi");
        return;
      }
      toast.success("Paylaşım silindi");
      router.refresh();
    });
  }

  return (
    <article className="rounded-3xl border border-chalk bg-white p-4">
      <header className="flex items-start gap-3">
        <Link href={`/u/${post.author_id}`}>
          <Avatar className="size-10 shrink-0 border border-chalk">
            {post.author?.avatar_url ? (
              <AvatarImage src={post.author.avatar_url} alt={authorName} />
            ) : null}
            <AvatarFallback className="bg-paw/20 text-[12px] font-medium text-obsidian">
              {initials(authorName)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${post.author_id}`}
            className="text-[14px] font-medium hover:underline"
          >
            {authorName}
          </Link>
          <div className="text-[11px] text-gravel">
            {timeAgo(post.created_at)}
          </div>
        </div>
        {isOwn ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            aria-label="Sil"
            className="grid size-8 place-items-center rounded-full text-gravel hover:bg-danger/10 hover:text-danger disabled:opacity-50"
          >
            <Trash2 className="size-3.5" />
          </button>
        ) : null}
      </header>

      <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-obsidian">
        {post.body}
      </p>

      {post.image_url ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-chalk">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt=""
            className="block max-h-96 w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-4 border-t border-chalk pt-3 text-gravel">
        <button
          type="button"
          onClick={toggleLike}
          disabled={pending}
          className={`inline-flex items-center gap-1.5 text-[12px] transition ${
            liked ? "text-danger" : "hover:text-obsidian"
          }`}
        >
          <Heart
            className={`size-4 transition ${liked ? "fill-danger" : ""}`}
          />
          {likeCount}
        </button>
        <span className="inline-flex items-center gap-1.5 text-[12px]">
          <MessageCircle className="size-4" />
          {post.comment_count}
        </span>
      </div>
    </article>
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "şimdi";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} gün önce`;
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
}
