import type { Metadata } from "next";
import { PageShell } from "@/components/site/shell";
import { PostChecker } from "@/components/site/post-checker";

export const metadata: Metadata = { title: "Post Checker", description: "Check an Instagram post before you post it: a score out of 100, what Instagram rewards, and exactly what to fix." };

export default function Page() {
  return (
    <PageShell group="Product" kicker="Post Checker" title="Check your post before you post it" lead="Describe the post you're planning. The score updates as you change things, and every point links to where Instagram said it. Nothing you type leaves your browser.">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><PostChecker /></div>
    </PageShell>
  );
}
