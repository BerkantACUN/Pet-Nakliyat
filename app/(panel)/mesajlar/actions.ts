"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/(auth)/actions";

const messageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1, "Mesaj boş olamaz").max(2000),
});

export async function sendMessageAction(input: {
  conversationId: string;
  body: string;
}): Promise<ActionResult> {
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { data: conv } = await supabase
    .from("conversations")
    .select("id,customer_id,transporter_id")
    .eq("id", parsed.data.conversationId)
    .maybeSingle();
  if (!conv) return { ok: false, error: "Konuşma bulunamadı" };
  if (conv.customer_id !== user.id && conv.transporter_id !== user.id) {
    return { ok: false, error: "Yetki yok" };
  }

  const { error: insertErr } = await supabase.from("messages").insert({
    conversation_id: conv.id,
    sender_id: user.id,
    body: parsed.data.body,
  });
  if (insertErr) return { ok: false, error: insertErr.message };

  const { data: convCounts } = await supabase
    .from("conversations")
    .select("customer_unread_count,transporter_unread_count")
    .eq("id", conv.id)
    .maybeSingle();

  const isSenderCustomer = user.id === conv.customer_id;
  const lastMessageAt = new Date().toISOString();
  if (isSenderCustomer) {
    await supabase
      .from("conversations")
      .update({
        last_message_at: lastMessageAt,
        transporter_unread_count:
          (convCounts?.transporter_unread_count ?? 0) + 1,
      })
      .eq("id", conv.id);
  } else {
    await supabase
      .from("conversations")
      .update({
        last_message_at: lastMessageAt,
        customer_unread_count: (convCounts?.customer_unread_count ?? 0) + 1,
      })
      .eq("id", conv.id);
  }

  revalidatePath(`/mesajlar/${conv.id}`);
  revalidatePath("/mesajlar");
  return { ok: true };
}

export async function markConversationReadAction(
  conversationId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { data: conv } = await supabase
    .from("conversations")
    .select("id,customer_id,transporter_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return { ok: false, error: "Konuşma bulunamadı" };
  if (conv.customer_id !== user.id && conv.transporter_id !== user.id) {
    return { ok: false, error: "Yetki yok" };
  }

  const update =
    user.id === conv.customer_id
      ? { customer_unread_count: 0 }
      : { transporter_unread_count: 0 };

  await supabase.from("conversations").update(update).eq("id", conv.id);
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conv.id)
    .is("read_at", null)
    .neq("sender_id", user.id);

  revalidatePath(`/mesajlar/${conv.id}`);
  revalidatePath("/mesajlar");
  return { ok: true };
}
