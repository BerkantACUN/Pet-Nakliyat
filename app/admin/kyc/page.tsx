import { createServiceRoleClient } from "@/lib/supabase/server";
import { KycReviewRow } from "@/components/admin/KycReviewRow";

export const metadata = { title: "KYC Kuyruğu — Admin" };

export default async function AdminKycPage() {
  const supabase = createServiceRoleClient();

  const { data: pendingDocs } = await supabase
    .from("kyc_documents")
    .select("id, doc_type, storage_path, created_at, user_id")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const userIds = Array.from(new Set((pendingDocs ?? []).map((d) => d.user_id)));
  const usersById = new Map<
    string,
    { full_name: string; email: string | null }
  >();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      usersById.set(p.id, { full_name: p.full_name, email: null });
    }
    // E-postaları admin auth API'sından çek (service role gerekli)
    for (const uid of userIds) {
      const { data } = await supabase.auth.admin.getUserById(uid);
      const entry = usersById.get(uid);
      if (entry && data?.user) {
        entry.email = data.user.email ?? null;
      }
    }
  }

  // Her belge için signed URL üret (5 dk)
  const rows = await Promise.all(
    (pendingDocs ?? []).map(async (doc) => {
      const { data } = await supabase.storage
        .from("kyc")
        .createSignedUrl(doc.storage_path, 300);
      return {
        ...doc,
        signedUrl: data?.signedUrl ?? "",
      };
    }),
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-[28px]">KYC kuyruğu</h1>
        <p className="text-[13px] text-gravel">
          {rows.length === 0
            ? "Bekleyen belge yok 🎉"
            : `${rows.length} belge incelemeyi bekliyor.`}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => {
          const u = usersById.get(r.user_id);
          return (
            <KycReviewRow
              key={r.id}
              docId={r.id}
              docType={r.doc_type}
              userName={u?.full_name ?? "—"}
              userEmail={u?.email ?? null}
              signedUrl={r.signedUrl}
              createdAt={r.created_at}
            />
          );
        })}
      </div>
    </div>
  );
}
