import type { Metadata } from "next";
import { PageShell } from "@/components/site/shell";
import { ProfileReview } from "@/components/site/profile-review";

export const metadata: Metadata = {
  title: "Profile review",
  description: "Review your whole Instagram profile in 5 minutes: name, bio, pinned posts, content and habits. A score out of 10 and the one thing to fix first. Free, no login.",
};

export default function Page() {
  return (
    <PageShell
      group="Product"
      kicker="Profile review"
      title="Review your whole profile in 5 minutes."
      lead="19 questions about your name, bio, posts and habits. You get a score out of 10 and the one thing to fix first. Each rule links to where Instagram said it, and the ones that are only good practice say so."
    >
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><ProfileReview /></div>
    </PageShell>
  );
}
