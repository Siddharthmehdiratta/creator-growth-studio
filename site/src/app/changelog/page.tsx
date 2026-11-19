import type { Metadata } from "next";
import { PageShell } from "@/components/site/shell";

export const metadata: Metadata = { title: "Changelog", description: "What's new in Creator Growth Studio, and when." };

const LOG = [
  ["19 Nov 2026", "A new website", ["A proper home page with real screenshots of the report", "Separate pages for features, pricing, help, contact, about and privacy", "Report a problem and give feedback straight from the contact page"]],
  ["18 Nov 2026", "YouTube and Twitch", ["Pick your platform first: Instagram, YouTube or Twitch", "YouTube Studio exports, with Shorts and long videos rated separately", "Twitch streams typed in by hand, rated on viewer-hours, follows and chat"]],
  ["18 Nov 2026", "Type a username, or connect Instagram", ["Read any public Creator or Business account by username", "Connect your own account for reach, watch time, skips, sends and comments"]],
  ["19 Nov 2026", "Ratings out of 10 that learn", ["Every post rated out of 10 against your own usual post", "The Post Checker learns from your report: format, length, day, time and hashtags", "A caption score out of 10", "Growth Plan: 8 questions, a weekly pattern, and why", "Ads Checker: is your ad paying for itself?"]],
  ["18 Nov 2026", "First release", ["Star ratings for every post, why each worked, what to post next and a 30-day plan", "An AI boardroom of six advisers in Claude", "An audience health check for brands"]],
] as const;

export default function Page() {
  return (
    <PageShell group="Learn" kicker="Changelog" title="What's new" lead="Every change to Creator Growth Studio, newest first. The full history is on GitHub.">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <ol className="relative grid gap-12 border-l pl-8">
          {LOG.map(([d, t, items]) => (
            <li key={t} className="relative">
              <span aria-hidden className="absolute top-1.5 -left-[2.3rem] size-3 rounded-full border-2 border-background bg-primary ring-4 ring-primary/15" />
              <p className="text-sm text-muted-foreground">{d}</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">{t}</h2>
              <ul className="mt-3 grid list-disc gap-1.5 pl-5 text-muted-foreground">{items.map((x) => <li key={x}>{x}</li>)}</ul>
            </li>
          ))}
        </ol>
      </div>
    </PageShell>
  );
}
