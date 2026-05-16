import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatPriceTRY } from "@/lib/utils";

export const metadata = { title: "İlan moderasyonu — Admin" };

export default async function AdminListingsPage() {
  const supabase = createServiceRoleClient();
  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, status, urgency, pickup_city, dropoff_city, distance_km, est_price_min, est_price_max, created_at, customer_id",
    )
    .order("created_at", { ascending: false })
    .limit(60);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-[28px]">İlanlar</h1>
        <p className="text-[13px] text-gravel">
          Son 60 ilan. Detay için tıkla.
        </p>
      </header>

      <div className="overflow-x-auto rounded-3xl border border-chalk bg-white">
        <table className="min-w-full text-[13px]">
          <thead className="border-b border-chalk bg-powder/50">
            <tr className="text-left">
              <Th>Durum</Th>
              <Th>Aciliyet</Th>
              <Th>Rota</Th>
              <Th>Mesafe</Th>
              <Th>Tahmin</Th>
              <Th>Oluşturuldu</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {(listings ?? []).map((l) => (
              <tr key={l.id} className="border-t border-chalk">
                <Td>
                  <StatusChip status={l.status} />
                </Td>
                <Td>{l.urgency}</Td>
                <Td>
                  {l.pickup_city ?? "—"} → {l.dropoff_city ?? "—"}
                </Td>
                <Td>{Number(l.distance_km).toFixed(0)} km</Td>
                <Td>
                  {formatPriceTRY(Number(l.est_price_min))} –{" "}
                  {formatPriceTRY(Number(l.est_price_max))}
                </Td>
                <Td>
                  {new Date(l.created_at).toLocaleString("tr-TR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </Td>
                <Td>
                  <Link
                    href={`/musteri/${l.id}`}
                    className="text-[12px] text-obsidian underline decoration-chalk underline-offset-2 hover:decoration-obsidian"
                  >
                    Detay ↗
                  </Link>
                </Td>
              </tr>
            ))}
            {(listings ?? []).length === 0 ? (
              <tr>
                <Td colSpan={7}>
                  <p className="py-8 text-center text-gravel">
                    Henüz ilan yok.
                  </p>
                </Td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: "Taslak", cls: "bg-powder text-gravel" },
  published: { label: "Yayında", cls: "bg-clover/15 text-foreground" },
  closed: { label: "Kapalı", cls: "bg-paw/15 text-foreground" },
  expired: { label: "Süresi dolmuş", cls: "bg-chalk text-gravel" },
  cancelled: { label: "İptal", cls: "bg-danger/10 text-danger" },
};

function StatusChip({ status }: { status: string }) {
  const v = STATUS_LABEL[status] ?? { label: status, cls: "bg-chalk text-gravel" };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">{children}</th>;
}

function Td({ children, colSpan }: { children?: React.ReactNode; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className="px-3 py-2 align-top">
      {children}
    </td>
  );
}
