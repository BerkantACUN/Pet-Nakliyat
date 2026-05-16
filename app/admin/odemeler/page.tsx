export const metadata = { title: "Ödeme defteri — Admin" };

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-[28px]">Ödeme defteri</h1>
        <p className="text-[13px] text-gravel">
          Iyzico entegrasyonu Sprint 6'da aktive olacak. O zaman bu sayfa gerçek
          ödemeleri listeleyecek.
        </p>
      </header>

      <div className="grid place-items-center rounded-3xl border border-chalk bg-powder/40 px-6 py-16 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-white text-2xl">
          💸
        </div>
        <p className="mt-3 max-w-md text-[13px] text-gravel">
          Henüz ödeme kaydı yok. İlk başarılı booking ödemesi geldiğinde
          burada listelenecek.
        </p>
      </div>
    </div>
  );
}
