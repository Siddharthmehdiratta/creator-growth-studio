import type { Metadata } from "next";
import { CheckIcon, LockIcon, ShieldCheckIcon, DatabaseIcon } from "lucide-react";
import { CtaBand, PageShell, Section, SectionHead } from "@/components/site/shell";
import { InstagramMark, TwitchMark, YouTubeMark } from "@/components/site/brand-icons";

export const metadata: Metadata = { title: "How it works", description: "How your numbers become a report: every way to bring data, how the ratings are worked out, how patterns are tested, and where your data goes." };

const WAYS = [
  [InstagramMark, "Instagram", "Type a username or profile link", "Followers, likes, comments and Reel views on the last 50 posts", "Seconds"],
  [InstagramMark, "Instagram", "Connect Instagram (official login)", "Also reach, watch time, skip rate, sends, saves, follows, profile visits and comments", "1 minute"],
  [InstagramMark, "Instagram", "Upload a Meta Business Suite export", "Reach, views, likes, comments, shares, saves and follows for up to 90 days", "2 minutes"],
  [YouTubeMark, "YouTube", "Upload a YouTube Studio export", "Views, watch time, view duration, click rate, subscribers, likes, comments and shares", "2 minutes"],
  [TwitchMark, "Twitch", "Type in your last streams", "Average viewers, hours, followers gained and chat messages", "3 minutes"],
] as const;

const WEIGHTS = [["Average watch time", "30%"], ["Sends per 1,000 reached", "30%"], ["Follows per 1,000 reached", "25%"], ["Likes per 1,000 reached", "15%"], ["Saves per 1,000 reached", "15%"], ["Comments per 1,000 reached", "15%"], ["Hold rate (didn't skip)", "15%"]];

export default function Page() {
  return (
    <PageShell group="Product" kicker="How it works" title="From your numbers to a plan, in under a minute" lead="Pick your platform, bring your numbers, read your report. Here's exactly what happens at each step, and how the ratings are worked out.">
      <Section>
        <ol className="grid gap-4 md:grid-cols-3">
          {[["Pick your platform", "Instagram, YouTube or Twitch. The next step changes to fit it."], ["Bring your numbers", "Upload your Instagram download, or type in your streams. Username lookup is coming soon."], ["Read your report", "Stars for every post, why each worked, what to post next and a 30-day plan."]].map(([t, d], i) => (
            <li key={t} className="rounded-3xl border p-7">
              <span className="text-sm font-semibold text-link">Step {i + 1}</span>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">{t}</h2>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section tint>
        <SectionHead eyebrow="Step 2 in detail" title="Every way to bring your numbers" text="Use whichever is easiest. You can add more detail later." />
        <div className="mt-10 overflow-hidden rounded-3xl border bg-background">
          {WAYS.map(([M, plat, how, what, time]) => (
            <div key={how} className="grid gap-3 border-b p-5 last:border-b-0 sm:grid-cols-[2.5rem_1fr_7rem] sm:items-center sm:gap-5 sm:p-6">
              <span className="grid size-10 place-items-center rounded-xl border text-link"><M className="size-5" /></span>
              <div><p className="font-medium">{how} <span className="ml-1 text-xs text-muted-foreground">{plat}</span></p><p className="mt-1 text-sm text-muted-foreground">{what}</p></div>
              <span className="w-fit rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-link sm:justify-self-end">{time}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid grid-cols-1 gap-12 [&>*]:min-w-0 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="The method" title="How the ratings are worked out" text="Each post gets a score where 100 means a normal post for you. The score blends how many people a post reached with how strongly they reacted." />
            <ol className="mt-8 grid gap-5">
              {[["Per person reached.", "Sends, follows, likes, saves and comments are divided by reach, so a big post doesn't win just for being big."], ["Compared with you.", "Each signal is compared with your own typical post, not with other accounts."], ["Weighted by what matters.", "Watch time and sends count most, because Instagram's head names them as top signals."], ["Turned into stars.", "3.5 stars is your normal. 5 stars is about twice as good as usual."]].map(([b, t], i) => (
                <li key={b} className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full border text-sm font-semibold text-link">{i + 1}</span><p><b className="font-medium">{b}</b> <span className="text-muted-foreground">{t}</span></p></li>
              ))}
            </ol>
          </div>
          <div className="overflow-hidden rounded-3xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left"><tr><th className="px-6 py-4 font-medium">Signal</th><th className="px-6 py-4 text-right font-medium">Weight</th></tr></thead>
              <tbody>{WEIGHTS.map(([s, w]) => <tr key={s} className="border-t"><td className="px-6 py-3.5">{s}</td><td className="px-6 py-3.5 text-right tabular-nums">{w}</td></tr>)}</tbody>
            </table>
            <p className="border-t px-6 py-4 text-xs text-muted-foreground">When a signal is missing, for example when an export has no watch time, its weight is shared out again.</p>
          </div>
        </div>
      </Section>
      <Section tint>
        <div className="grid grid-cols-1 gap-12 [&>*]:min-w-0 lg:grid-cols-2">
          <SectionHead eyebrow="Honest statistics" title="How patterns are found" text="Simple averages fool people. If your night posts were all GTA 6 posts, night looks great even when the topic did the work. So the report compares like with like." />
          <ul className="grid gap-4 text-sm">
            {["Format, time, day, hook, topic, length and hashtags are tested together", "A time trend is included, so a growing account doesn't make recent habits look magic", "Only findings that pass a strict test are shown, labelled strong or good evidence", "On pure random data, fewer than 1 in 10 runs shows a false pattern", "Groups with fewer than 3 posts are marked thin and never shown as rules"].map((t) => <li key={t} className="flex gap-3 rounded-2xl border bg-background p-4"><CheckIcon className="mt-0.5 size-4 shrink-0 text-link" />{t}</li>)}
          </ul>
        </div>
      </Section>
      <Section>
        <SectionHead eyebrow="Privacy" title="Where your data goes" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[[LockIcon, "Worked out in your browser", "The report is calculated on your own device. Uploaded files never leave it."], [ShieldCheckIcon, "Official API only", "Instagram numbers come through Meta's official API. No scraping, no bots, no passwords."], [DatabaseIcon, "Nothing stored", "The connector keeps nothing. Your login token stays in your browser tab until you close it."]].map(([I, t, d]) => {
            const C = I as typeof LockIcon;
            return <div key={t as string} className="rounded-3xl border p-7"><C className="size-5 text-link" /><h3 className="mt-4 text-lg font-semibold tracking-tight">{t as string}</h3><p className="mt-2 text-sm text-muted-foreground">{d as string}</p></div>;
          })}
        </div>
      </Section>
      <CtaBand />
    </PageShell>
  );
}
