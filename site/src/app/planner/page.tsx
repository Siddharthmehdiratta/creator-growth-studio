import type { Metadata } from "next";
import { PageShell } from "@/components/site/shell";
import { Planner } from "@/components/site/planner";

export const metadata: Metadata = { title: "Planner", description: "Plan your Instagram posts, then add reminders to your calendar." };

export default function Page() {
  return (
    <PageShell group="Product" kicker="Planner" title="Plan and schedule your posts" lead="Add what you'll post and when. Your plan stays in this browser. When you're ready, add reminders to your calendar in one tap.">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><Planner /></div>
    </PageShell>
  );
}
