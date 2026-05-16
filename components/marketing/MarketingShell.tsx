import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface MarketingShellProps {
  children: React.ReactNode;
}

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-eggshell">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
