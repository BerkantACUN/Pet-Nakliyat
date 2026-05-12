import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { ValueProps } from "@/components/marketing/ValueProps";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Hero />
        <ValueProps />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
