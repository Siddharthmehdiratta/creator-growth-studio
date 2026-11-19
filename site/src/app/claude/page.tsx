import type { Metadata } from "next";
import { PageShell } from "@/components/site/shell";
import { ClaudeStudio } from "@/components/site/claude-studio";
import { href } from "@/lib/site";

export const metadata: Metadata = { title: "Claude helpers", description: "One click opens Claude with the request already written: captions, hooks, reel scripts, comment replies, bio, ideas, a monthly plan and brand pitches." };

export default function Page() {
  return (
    <PageShell group="Product" kicker="Claude helpers" title="Let Claude do the writing" lead="Fill in your niche and idea once. Each button opens Claude with the request already written, so you just press send. Works on Claude's free plan.">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <ClaudeStudio />
        <div className="mt-10 rounded-3xl bg-[#15131F] p-8 text-white">
          <h2 className="text-2xl font-semibold tracking-tight">Want a full review of your account?</h2>
          <p className="mt-2 max-w-2xl text-white/70">The AI boardroom in your report sends Claude your real numbers. Six advisers, a CEO, growth lead, social media expert, SEO lead, data analyst and creative director, review your account and agree on a plan.</p>
          <a href={href("/start.html")} className="mt-6 inline-flex h-11 items-center rounded-xl bg-white px-5 font-medium text-[#15131F]">Get my report first</a>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">If Claude opens without your request, press Copy the request and paste it. Claude is made by Anthropic; this site isn't affiliated with Anthropic.</p>
      </div>
    </PageShell>
  );
}
