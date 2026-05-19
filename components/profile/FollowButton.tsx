"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, UserPlus } from "lucide-react";
import { followAction, unfollowAction } from "@/app/u/[id]/actions";

interface FollowButtonProps {
  targetId: string;
  initialFollowing: boolean;
}

export function FollowButton({ targetId, initialFollowing }: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      // Optimistic
      const wasFollowing = following;
      setFollowing(!wasFollowing);

      const result = wasFollowing
        ? await unfollowAction(targetId)
        : await followAction(targetId);

      if (!result.ok) {
        setFollowing(wasFollowing);
        toast.error(result.error ?? "İşlem başarısız");
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={
        following
          ? "inline-flex items-center gap-1.5 rounded-pill border border-chalk bg-white px-4 py-2 text-[12px] font-medium text-obsidian transition hover:bg-powder disabled:opacity-60"
          : "inline-flex items-center gap-1.5 rounded-pill bg-obsidian px-4 py-2 text-[12px] font-medium text-eggshell transition hover:bg-obsidian/85 disabled:opacity-60"
      }
    >
      {following ? (
        <>
          <Check className="size-3.5" /> Takip ediyorsun
        </>
      ) : (
        <>
          <UserPlus className="size-3.5" /> Takip et
        </>
      )}
    </button>
  );
}
