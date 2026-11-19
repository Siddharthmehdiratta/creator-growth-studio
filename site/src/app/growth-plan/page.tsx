import type { Metadata } from "next";
import { PageShell } from "@/components/site/shell";
import { GrowthPlan } from "@/components/site/growth-plan";

export const metadata: Metadata = { title: "Growth Plan", description: "Answer 8 short questions about your goal. Get what to post, when, and why, with a source for every rule. Free." };

export default function Page() {
  return (
    <PageShell group="Product" kicker="Growth Plan" title="What to post, when, and why." lead="Answer 8 short questions about your goal. You get a weekly pattern, how to open and end each post, the one number to move, and a 4-week test. Every rule shows where it comes from.">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><GrowthPlan /></div>
    </PageShell>
  );
}
