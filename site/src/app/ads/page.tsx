import type { Metadata } from "next";
import { PageShell } from "@/components/site/shell";
import { AdsChecker } from "@/components/site/ads-checker";

export const metadata: Metadata = { title: "Ads Checker", description: "Type what you spent and what you got. See if the ad is paying for itself, what to do next, and what kind of ad fits your goal. Free." };

export default function Page() {
  return (
    <PageShell group="Product" kicker="Ads Checker" title="Is your ad paying for itself?" lead="Type what you spent and what you got. You get the cost per result, a clear verdict, and the next step. It uses your own numbers, with no made-up averages.">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><AdsChecker /></div>
    </PageShell>
  );
}
