import type { Metadata } from "next";
import { PageShell } from "@/components/site/shell";
import { Experiments } from "@/components/site/experiments";

export const metadata: Metadata = {
  title: "Experiments",
  description: "Test one thing at a time on your Instagram. Each test names the single change, what to hold still, and the number that counts as a win before you start. Free.",
};

export default function Page() {
  return (
    <PageShell
      group="Product"
      kicker="Experiments"
      title="Change one thing. See if it worked."
      lead="Most advice tells you to change ten things at once, so a good week teaches you nothing. Each test here changes one thing, holds the rest still, and sets the win number before you start. When the result is too small to trust, it says so instead of picking a winner."
    >
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><Experiments /></div>
    </PageShell>
  );
}
