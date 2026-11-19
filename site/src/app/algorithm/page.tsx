import type { Metadata } from "next";
import { ArrowRightIcon, ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand, PageShell, Section, SectionHead, Src } from "@/components/site/shell";
import { SurfaceExplorer } from "@/components/site/surfaces";
import { PostChecker } from "@/components/site/post-checker";
import { href } from "@/lib/site";

export const metadata: Metadata = { title: "How the Instagram algorithm works", description: "Feed, Reels, Explore and Stories each rank posts differently. What each one looks at, what it predicts, and what that means for your posts, with Instagram's own sources." };

const R = "https://about.instagram.com/blog/announcements/instagram-ranking-explained";

const MYTHS = [
  ["\"There's one Instagram algorithm.\"", <>No. Instagram says each part of the app (Feed, Stories, Explore, Reels and Search) uses its own algorithm, tailored to how people use it.<Src url={R} name="Instagram" /></>],
  ["\"Use 30 hashtags.\"", <>Instagram caps hashtags at 5 per post since December 2025. Pick specific ones.<Src url="https://www.businesstoday.in/technology/news/story/no-more-hashtag-stuffing-instagram-limits-hashtag-usage-to-just-5-per-reel-and-post-507444-2025-12-19" name="Business Today" /></>],
  ["\"I've been shadowbanned.\"", <>Instagram points creators to Account Status, which shows whether your account and content can be recommended, including in Search, and lets you appeal.<Src url={R} name="Instagram" /></>],
  ["\"Testing new ideas will hurt my account.\"", <>Trial reels are shown only to people who don't follow you, and stay off your grid until you choose to share them.<Src url="https://techcrunch.com/2024/12/10/instagram-rolls-out-trial-reels-that-arent-shown-to-a-creators-followers" name="TechCrunch" /></>],
] as const;

export default function Page() {
  return (
    <PageShell group="Learn" kicker="Instagram algorithm" title="How the Instagram algorithm actually works" lead="There isn't one algorithm. Feed, Reels, Explore and Stories each rank posts their own way. Here's what each one looks at, in Instagram's own words, and what that means for your next post."
      actions={<><Button className="h-11 rounded-xl px-5" asChild><a href="#checker">Check a post now</a></Button><Button variant="outline" className="h-11 rounded-xl px-5" asChild><a href={R} target="_blank" rel="noopener">Read Instagram's explanation</a></Button></>}>
      <Section>
        <div className="grid grid-cols-1 gap-10 [&>*]:min-w-0 lg:grid-cols-3">
          {[["3 signals", "Instagram's head, Adam Mosseri, names watch time, sends per reach and likes per reach as the most important signals for reach.", "https://buffer.com/resources/instagram-algorithms/", "Buffer"],
            ["4 algorithms", "Feed, Stories, Explore and Reels each use their own ranking, and Search has its own rules too.", R, "Instagram"],
            ["Original wins", "Instagram ranks original content above reposts, and can show reels less if they were already posted on Instagram.", R, "Instagram"]].map(([n, d, u, s]) => (
            <div key={n} className="rounded-3xl border p-7">
              <p className="text-3xl font-semibold tracking-[-0.03em]">{n}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}<Src url={u} name={s} /></p>
            </div>
          ))}
        </div>
      </Section>

      <Section tint>
        <SectionHead eyebrow="Part by part" title="Pick a part of Instagram" text="The signals and predictions come from Instagram's own explanation. The Do this lists are our advice, built on those signals." />
        <div className="mt-10"><SurfaceExplorer /></div>
        <p className="mt-4 text-xs text-muted-foreground">Source: Adam Mosseri, "Instagram Ranking Explained", Instagram, 31 May 2023. Order of signals is Instagram's own "roughly in order of importance".</p>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-12 [&>*]:min-w-0 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Shown less" title="What makes Instagram show a post less" />
            <ul className="mt-8 grid gap-3">
              {["Low resolution", "Watermarks from other apps", "Muted (no sound)", "Borders around the video", "Mostly text", "Already posted on Instagram"].map((t) => (
                <li key={t} className="flex items-center gap-3 rounded-2xl border p-4"><ShieldAlertIcon className="size-5 shrink-0 text-[#D9384A]" />{t}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">These are the reasons Instagram itself lists for making a reel less visible.<Src url={R} name="Instagram" /></p>
          </div>
          <div>
            <SectionHead eyebrow="Rules" title="Not recommended is not the same as removed" />
            <div className="mt-8 grid gap-4 text-muted-foreground">
              <p>Posts that break Instagram's Recommendation Guidelines stay on your profile but aren't shown to new people in Explore or Reels.</p>
              <p>Accounts that keep breaking those guidelines can have none of their posts recommended for a while. Posts that break the Community Standards are removed.</p>
              <p>Check <b className="text-foreground">Settings, then Account Status</b> to see if your account can be recommended, and appeal if Instagram got it wrong.<Src url={R} name="Instagram" /></p>
            </div>
          </div>
        </div>
      </Section>

      <Section tint>
        <SectionHead eyebrow="Myths" title="Four things people get wrong" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {MYTHS.map(([m, t]) => <div key={m as string} className="rounded-3xl border bg-background p-7"><p className="text-lg font-semibold tracking-tight">{m}</p><p className="mt-3 text-muted-foreground">{t}</p></div>)}
        </div>
      </Section>

      <section id="checker" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
          <SectionHead eyebrow="Try it" title="Check your next post against these signals" text="Change anything and the score updates. Every point links to its source." />
          <div className="mt-10"><PostChecker /></div>
          <a href={href("/post-checker/")} className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary">Open the Post Checker on its own page<ArrowRightIcon className="size-4" /></a>
        </div>
      </section>
      <CtaBand />
    </PageShell>
  );
}
