import type { Metadata } from "next";
import { CheckIcon, MessageSquareTextIcon, ShieldCheckIcon, LayersIcon } from "lucide-react";
import { BrowserMockup } from "@/components/velora/browser-mockup";
import { CtaBand, PageShell, Section, Shot } from "@/components/site/shell";
import { href } from "@/lib/site";

export const metadata: Metadata = { title: "Features", description: "A rating out of 10 for every post, why each worked, what to post next, a 30-day plan, comments sorted, an AI boardroom and an audience health check." };

const ROWS = [
  { id: "stars", eyebrow: "Ratings out of 10", title: "Every post, rated against your own usual", text: "A rating out of 10 from the signals Instagram says matter most: watch time, sends and likes per person reached, plus follows, saves and comments.", ticks: ["3.5 stars is a normal post for you", "5 stars is about twice as good as usual", "Sort by best, worst, newest or reach, and filter by format"], shot: "/shots/posts.png", alt: "The posts list, each post with stars and a score." },
  { id: "why", eyebrow: "Why it worked", title: "Know exactly what made a post work", text: "Open any post to see reach, views, watch time, skips, sends, saves, follows and comments next to your usual, then a plain reason and what to do next time.", ticks: ["Patterns compare like with like, so luck isn't sold as a rule", "Every finding says how strong the evidence is"], shot: "/shots/post.png", alt: "One post opened, each number compared with the account's usual." },
  { id: "next", eyebrow: "What to post next", title: "Ideas built from your own best posts", text: "Part 2s of your winners, posts built to be sent, and angles from your niche, each with the format, day and time that work for your audience.", ticks: ["Trial reels to test new ideas safely", "A do-more and do-less list from your own numbers"], shot: "/shots/ideas.png", alt: "Post ideas with format, day, time and angle." },
  { id: "plan", eyebrow: "30-day plan", title: "A goal you can reach, and a calendar to get there", text: "Pick a follower goal. The report says if it's realistic at your pace, then builds a posting calendar on your best days that drops into Google Calendar.", ticks: ["Realistic, ambitious or very hard, from your real follows per post", "Each day has a hook, an angle and up to 5 hashtags"], shot: "/shots/plan.png", alt: "The 30-day plan and growth goal." },
  { id: "board", eyebrow: "AI boardroom", title: "Six expert advisers review your account", text: "One message from your report gets Claude to act as a CEO, growth lead, social media expert, SEO lead, data analyst and creative director. They disagree out loud, then the CEO decides.", ticks: ["Works on the free Claude plan", "Includes an AI audience that reacts like real viewers"], shot: "/shots/board.png", alt: "The AI boardroom tab with a ready-made message for Claude." },
];

export default function Page() {
  return (
    <PageShell group="Product" kicker="Features" title="Everything your report tells you" lead="One free report that does the work of a growth team. It rates every post, explains why, tells you what to post next and plans your month.">
      <nav aria-label="On this page" className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 py-2 text-sm lg:px-8">
          {[...ROWS.map((r) => [r.id, r.eyebrow]), ["more", "And more"]].map(([id, t]) => (
            <a key={id} href={`#${id}`} className="shrink-0 rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">{t}</a>
          ))}
        </div>
      </nav>
      {ROWS.map((r, i) => (
        <Section key={r.id} tint={i % 2 === 1}>
          <div id={r.id} className="grid scroll-mt-32 items-center gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div className={i % 2 ? "lg:order-2" : ""}>
              <p className="text-sm font-medium text-primary">{r.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-balance">{r.title}</h2>
              <p className="mt-4 text-muted-foreground">{r.text}</p>
              <ul className="mt-6 grid gap-3 text-sm">{r.ticks.map((t) => <li key={t} className="flex gap-2.5"><CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />{t}</li>)}</ul>
            </div>
            <BrowserMockup url="sample report" className="overflow-hidden rounded-2xl shadow-xl shadow-primary/5"><Shot src={r.shot} alt={r.alt} /></BrowserMockup>
          </div>
        </Section>
      ))}
      <Section>
        <div id="more" className="scroll-mt-32 grid gap-4 md:grid-cols-3">
          {[[MessageSquareTextIcon, "Comments sorted", "Questions, requests, praise, criticism and spam, in English and Hinglish. Requests become free post ideas."],
            [ShieldCheckIcon, "Audience health check", "What a brand sees before paying: engagement against accounts of the same size, and patterns that suggest bought likes."],
            [LayersIcon, "Three platforms", "Instagram, YouTube (videos and Shorts rated separately) and Twitch (streams typed in by hand)."]].map(([I, t, d]) => {
            const C = I as typeof CheckIcon;
            return <div key={t as string} className="rounded-3xl border p-7"><C className="size-5 text-primary" /><h3 className="mt-4 text-lg font-semibold tracking-tight">{t as string}</h3><p className="mt-2 text-sm text-muted-foreground">{d as string}</p></div>;
          })}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">Want the method behind the ratings? <a className="font-medium text-primary" href={href("/how-it-works/")}>Read how it works</a>.</p>
      </Section>
      <CtaBand />
    </PageShell>
  );
}
