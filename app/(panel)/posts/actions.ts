"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/(auth)/actions";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const createPostSchema = z.object({
  body: z
    .string()
    .min(1, "En az 1 karakter")
    .max(1000, "En fazla 1000 karakter"),
});

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = i.path.join(".");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}

export async function createPostAction(
  formData: FormData,
): Promise<ActionResult & { postId?: string }> {
  const body = String(formData.get("body") ?? "");
  const parsed = createPostSchema.safeParse({ body });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZod(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  // Görsel varsa upload et
  let imageUrl: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_BYTES) {
      return { ok: false, error: "Görsel en fazla 8 MB olabilir" };
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return { ok: false, error: "Sadece JPG / PNG / WEBP / AVIF" };
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${user.id}/post-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("posts")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadErr) return { ok: false, error: uploadErr.message };
    const { data: pub } = supabase.storage.from("posts").getPublicUrl(path);
    imageUrl = pub.publicUrl;
  }

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      body: parsed.data.body,
      image_url: imageUrl,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/profil");
  revalidatePath(`/u/${user.id}`);
  return { ok: true, postId: post.id };
}

export async function deletePostAction(
  postId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("author_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profil");
  revalidatePath(`/u/${user.id}`);
  return { ok: true };
}

export async function togglePostLikeAction(
  postId: string,
): Promise<ActionResult & { liked?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, liked: false };
  }

  const { error } = await supabase
    .from("post_likes")
    .insert({ post_id: postId, user_id: user.id });
  if (error && error.code !== "23505") {
    return { ok: false, error: error.message };
  }
  return { ok: true, liked: true };
}

const commentSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().min(1, "Boş yorum olamaz").max(500, "En fazla 500 karakter"),
});

export async function addCommentAction(input: {
  postId: string;
  body: string;
}): Promise<ActionResult & { commentId?: string }> {
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZod(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: parsed.data.postId,
      author_id: user.id,
      body: parsed.data.body,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  return { ok: true, commentId: data.id };
}
