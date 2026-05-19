"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/(auth)/actions";

export async function followAction(
  targetUserId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };
  if (user.id === targetUserId) {
    return { ok: false, error: "Kendini takip edemezsin" };
  }

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: targetUserId });
  if (error && error.code !== "23505") {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/u/${targetUserId}`);
  return { ok: true };
}

export async function startDirectConversationAction(
  targetUserId: string,
): Promise<ActionResult & { conversationId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };
  if (user.id === targetUserId) {
    return { ok: false, error: "Kendine mesaj atamazsın" };
  }

  // Canonical ordering: lexicographic (DB unique constraint için iki yönü de kapat)
  const [a, b] =
    user.id < targetUserId ? [user.id, targetUserId] : [targetUserId, user.id];

  // Var olan direct conversation'a bak (her iki yönde)
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .is("listing_id", null)
    .or(
      `and(customer_id.eq.${a},transporter_id.eq.${b}),and(customer_id.eq.${b},transporter_id.eq.${a})`,
    )
    .maybeSingle();

  if (existing) {
    return { ok: true, conversationId: existing.id };
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      listing_id: null,
      customer_id: a,
      transporter_id: b,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/mesajlar");
  return { ok: true, conversationId: created.id };
}

export async function unfollowAction(
  targetUserId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/u/${targetUserId}`);
  return { ok: true };
}
