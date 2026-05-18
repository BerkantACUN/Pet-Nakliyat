import { PawLoader } from "@/components/motion/PawLoader";

export default function MarketingLoading() {
  return (
    <div className="min-h-[60vh]">
      <PawLoader size="lg" label="Hazırlanıyor…" />
    </div>
  );
}
