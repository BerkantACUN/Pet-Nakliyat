import { PawLoader } from "@/components/motion/PawLoader";

export default function RootLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-eggshell">
      <PawLoader size="lg" label="Patiyolu yükleniyor…" />
    </div>
  );
}
