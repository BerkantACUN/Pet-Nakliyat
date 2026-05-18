import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatPriceTRY } from "@/lib/utils";
import type { PaymentStatus, PaymentType } from "@/lib/supabase/types";

export const metadata = { title: "Ödeme defteri — Admin" };

const TYPE_LABEL: Record<PaymentType, string> = {
  listing_fee: "İlan ücreti",
  booking_commission: "Komisyon",
  booking_full: "Booking",
  refund: "İade",
};

const STATUS_META: Record<PaymentStatus, { label: string; cls: string }> = {
  pending: { label: "Bekliyor", cls: "bg-powder text-gravel" },
  success: { label: "Başarılı", cls: "bg-clover/15 text-foreground" },
  failed: { label: "Başarısız", cls: "bg-danger/10 text-danger" },
  refunded: { label: "İade edildi", cls: "bg-paw/15 text-foreground" },
};

export default async function AdminPaymentsPage() {
  const supabase = createServiceRoleClient();

  const { data: payments } = await supabase
    .from("payments")
    .select(
      "id, type, amount, currency, provider, provider_ref, status, related_listing, related_booking, created_at, user_id",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const list = payments ?? [];

  const userIds = Array.from(new Set(list.map((p) => p.user_id)));
  const usersById = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      usersById.set(p.id, p.full_name);
    }
  }

  // Toplam hesapla (sadece success)
  const successOnly = list.filter((p) => p.status === "success");
  const totalListingFees = successOnly
    .filter((p) => p.type === "listing_fee")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCommission = successOnly
    .filter((p) => p.type === "booking_commission")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalRefunds = successOnly
    .filter((p) => p.type === "refund")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const netRevenue = totalListingFees + totalCommission - totalRefunds;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-[28px]">Ödeme defteri</h1>
        <p className="text-[13px] text-gravel">
          Son 100 ödeme kaydı. Sadece başarılı olanlar toplama dahil.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        <KpiCard label="İlan ücreti" value={totalListingFees} />
        <KpiCard label="Komisyon" value={totalCommission} />
        <KpiCard label="İade" value={totalRefunds} negative />
        <KpiCard label="Net gelir" value={netRevenue} highlight />
      </section>

      {list.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-chalk bg-powder/40 px-6 py-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-white text-2xl">
            💸
          </div>
          <p className="mt-3 max-w-md text-[13px] text-gravel">
            Henüz ödeme kaydı yok. İlk ilan ücreti veya booking ödemesi
            geldiğinde burada listelenecek.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-chalk bg-white">
          <table className="min-w-full text-[13px]">
            <thead className="border-b border-chalk bg-powder/50">
              <tr className="text-left">
                <Th>Tarih</Th>
                <Th>Kullanıcı</Th>
                <Th>Tip</Th>
                <Th>Tutar</Th>
                <Th>Durum</Th>
                <Th>Provider</Th>
                <Th>Ref</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const statusMeta = STATUS_META[p.status];
                const userName = usersById.get(p.user_id) ?? "—";
                const isRefund = p.type === "refund";
                return (
                  <tr key={p.id} className="border-t border-chalk">
                    <Td>
                      {new Date(p.created_at).toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </Td>
                    <Td>{userName}</Td>
                    <Td>{TYPE_LABEL[p.type]}</Td>
                    <Td>
                      <span
                        className={
                          isRefund ? "text-danger" : "text-foreground"
                        }
                      >
                        {isRefund ? "-" : ""}
                        {formatPriceTRY(Number(p.amount))}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusMeta.cls}`}
                      >
                        {statusMeta.label}
                      </span>
                    </Td>
                    <Td>{p.provider}</Td>
                    <Td>
                      <span className="font-mono text-[11px] text-gravel">
                        {p.provider_ref ?? "—"}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  highlight?: boolean;
  negative?: boolean;
}

function KpiCard({ label, value, highlight, negative }: KpiCardProps) {
  return (
    <div
      className={`rounded-3xl border p-4 ${
        highlight ? "border-clover bg-clover/10" : "border-chalk bg-white"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-[22px] leading-tight ${
          negative ? "text-danger" : ""
        }`}
      >
        {negative && value > 0 ? "-" : ""}
        {formatPriceTRY(value)}
      </p>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
      {children}
    </th>
  );
}

function Td({
  children,
  colSpan,
}: {
  children?: React.ReactNode;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className="px-3 py-2 align-top">
      {children}
    </td>
  );
}
