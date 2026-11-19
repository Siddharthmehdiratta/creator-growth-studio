import type { Metadata } from "next";
import { InfoIcon } from "lucide-react";
import { CtaBand, PageShell, Src } from "@/components/site/shell";
import { InstagramMark, TwitchMark, YouTubeMark } from "@/components/site/brand-icons";

export const metadata: Metadata = { title: "Growth guide 2026", description: "What the platforms and the biggest studies say about growing on Instagram, YouTube and Twitch in 2026, with sources and steps." };

const S = {
  bufferAlgo: "https://buffer.com/resources/instagram-algorithms/",
  bufferFreq: "https://buffer.com/resources/how-often-to-post-on-instagram/",
  reels3: "https://www.businesstoday.in/technology/news/story/instagram-head-announces-big-changes-3-minute-reels-and-new-look-for-profile-grid-461527-2025-01-21",
  trial: "https://techcrunch.com/2024/12/10/instagram-rolls-out-trial-reels-that-arent-shown-to-a-creators-followers",
  tags: "https://www.businesstoday.in/technology/news/story/no-more-hashtag-stuffing-instagram-limits-hashtag-usage-to-just-5-per-reel-and-post-507444-2025-12-19",
  google: "https://metricool.com/instagram-indexing-on-google/",
  shorts: "https://blog.youtube/news-and-events/tall-updates-coming-to-shorts/",
  testc: "https://www.tubefilter.com/2025/07/16/youtube-feature-test-and-compare-titles-thumbnails/",
  ypp: "https://www.tubefilter.com/2026/08/10/youtube-partner-program-ad-eligibility-requirements-shorts/amp/",
  twitch: "https://streamer.guide/guides/twitch-affiliate-requirements",
  asci: "https://www.ascionline.in/wp-content/uploads/2025/02/Press-Release-Influencer-Disclosure-Guidelines-ASCI-Report.pdf",
};

function Do({ items }: { items: React.ReactNode[] }) {
  return <div className="my-6 rounded-2xl border border-[#D9F0E8] bg-[#F3FBF8] p-5"><p className="text-sm font-medium text-[#0B7A5F]">Do this</p><ul className="mt-3 grid list-disc gap-2 pl-5">{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>;
}
const H2 = ({ id, icon, children }: { id: string; icon: React.ReactNode; children: React.ReactNode }) => <h2 id={id} className="mt-16 flex scroll-mt-24 items-center gap-3 text-3xl font-semibold tracking-[-0.03em] first:mt-0">{icon}{children}</h2>;
const H3 = ({ id, children }: { id: string; children: React.ReactNode }) => <h3 id={id} className="mt-10 scroll-mt-24 text-xl font-semibold tracking-tight">{children}</h3>;
const Badge = ({ children }: { children: React.ReactNode }) => <span className="grid size-10 place-items-center rounded-xl border text-link">{children}</span>;

const TOC = [["instagram", "Instagram"], ["ig-signals", "What the algorithm rewards", 1], ["ig-rhythm", "How often to post", 1], ["ig-hooks", "Hooks and length", 1], ["ig-reach", "Reaching new people", 1], ["ig-profile", "Profile and search", 1], ["youtube", "YouTube"], ["twitch", "Twitch"], ["money", "Brand deals and money"], ["plan", "Your first 30 days"]] as const;

export default function Page() {
  return (
    <PageShell group="Learn" kicker="Growth guide 2026" title="How to grow on Instagram, YouTube and Twitch" lead="What the platforms and the biggest studies actually say, turned into steps. Every fact has a source you can check. Updated 19 November 2026.">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[15rem_1fr] lg:px-8">
        <aside className="hidden lg:block"><nav aria-label="On this page" className="sticky top-24 grid gap-0.5 text-sm">
          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">On this page</p>
          {TOC.map(([id, t, sub]) => <a key={id} href={`#${id}`} className={`rounded-lg px-3 py-1.5 hover:bg-muted hover:text-foreground ${sub ? "pl-6 text-muted-foreground" : "font-medium"}`}>{t}</a>)}
        </nav></aside>
        <article className="max-w-[44rem] text-[1.04rem] leading-[1.75] text-[#2D2A3A]">
          <H2 id="instagram" icon={<Badge><InstagramMark className="size-5" /></Badge>}>Instagram</H2>
          <H3 id="ig-signals">What the algorithm rewards</H3>
          <p className="mt-3">Instagram's head, Adam Mosseri, has named three signals as the most important for reach: <b>watch time</b>, <b>sends per reach</b> (how often people send your post to a friend) and <b>likes per reach</b>.<Src url={S.bufferAlgo} name="Buffer" /></p>
          <Do items={["Make the first second earn the second: movement, a face, or the result first.", "Give people a reason to send it. \"Send this to the friend who…\" works because it names the friend.", <>Post original work. Instagram ranks original content above reposts.<Src url={S.bufferAlgo} name="Buffer" /></>]} />
          <H3 id="ig-rhythm">How often to post</H3>
          <p className="mt-3">Buffer studied 2 million Instagram posts. Posting 3 to 5 times a week more than doubled follower growth compared with 1 to 2 times, and gave about 12% more reach per post.<Src url={S.bufferFreq} name="Buffer" /></p>
          <div className="my-6 grid grid-cols-3 overflow-hidden rounded-2xl border text-center">
            {[["1–2", "a week: the minimum"], ["3–5", "a week: the sweet spot"], ["6+", "more growth, more effort"]].map(([n, t]) => <div key={n} className="border-r p-5 last:border-r-0"><p className="text-3xl font-semibold tracking-tight">{n}</p><p className="mt-1 text-xs text-muted-foreground">{t}</p></div>)}
          </div>
          <Do items={["Pick a number you can keep for 3 months. Consistency beats a burst then silence.", "Use the 30-day plan in your report: it puts posts on your best days and times."]} />
          <H3 id="ig-hooks">Hooks and length</H3>
          <p className="mt-3">Reels can be up to 3 minutes long since January 2025.<Src url={S.reels3} name="Business Today" /> Longer is allowed, not required: length should follow the story.</p>
          <Do items={["Check your report's Reels by length result. It shows which length holds your audience.", "If the skip rate is high, the opening is the problem.", "Test one hook style at a time: face to camera, result first, or a question."]} />
          <H3 id="ig-reach">Reaching new people</H3>
          <p className="mt-3">Trial reels are shown only to people who don't follow you, and stay off your grid until you choose to share them.<Src url={S.trial} name="TechCrunch" /> Instagram also caps hashtags at 5 per post since December 2025.<Src url={S.tags} name="Business Today" /></p>
          <Do items={["Test risky ideas as trial reels first. Keep the winners.", "Use 3 to 5 specific hashtags that describe the post.", "Collab with creators your size: the post shows to both audiences."]} />
          <H3 id="ig-profile">Profile and search</H3>
          <p className="mt-3">Since 10 July 2025, public posts from professional accounts can appear in Google search.<Src url={S.google} name="Metricool" /></p>
          <Do items={["Put your main keyword in your name field, for example \"Rohan | GTA and BGMI tips\".", "Write captions that say what the post is about in plain words.", "Pin your 3 best posts so new visitors see why to follow."]} />

          <H2 id="youtube" icon={<Badge><YouTubeMark className="size-5" /></Badge>}>YouTube</H2>
          <p className="mt-4">Shorts can be up to 3 minutes long since 15 October 2024.<Src url={S.shorts} name="YouTube blog" /> Test and Compare lets creators test up to three thumbnails, and now titles too, and picks the winner by watch time.<Src url={S.testc} name="Tubefilter" /></p>
          <Do items={["Use Shorts to be found and long videos to be watched. Your report rates them separately.", "Watch average view duration more than views."]} />
          <p>To earn from ads in the YouTube Partner Program, you need 1,000 subscribers plus 4,000 watch hours in a year, or 10 million Shorts views in 90 days. Fan funding opens at 500 subscribers.<Src url={S.ypp} name="Tubefilter" /></p>

          <H2 id="twitch" icon={<Badge><TwitchMark className="size-5" /></Badge>}>Twitch</H2>
          <p className="mt-4">Twitch Affiliate needs 25 followers, 4 hours streamed, 4 broadcast days and 3 average viewers within 30 days. Check Twitch Help for the latest.<Src url={S.twitch} name="Streamer Guide" /></p>
          <Do items={["Stream on a fixed schedule so people know when to come back.", "Clip your best moments and post them as Reels and Shorts.", "Use your report to see which days, start times and lengths bring the most follows."]} />

          <H2 id="money" icon={<Badge><span className="text-lg">₹</span></Badge>}>Brand deals and money</H2>
          <p className="mt-4">In India, ASCI requires a clear, upfront ad label on paid influencer posts, and brands share responsibility. In its February 2025 study, 69% of top digital stars broke the rules.<Src url={S.asci} name="ASCI" /></p>
          <Do items={["Label every paid post at the start: \"Ad\" or \"Paid partnership\".", "Run the audience health check before pitching. Brands look at the same numbers.", "Price from your real reach, not your follower count."]} />

          <H2 id="plan" icon={<Badge><span className="text-sm font-semibold">30</span></Badge>}>Your first 30 days</H2>
          <ol className="mt-6 grid gap-4">
            {[["Week 1", "Get your report. Write down your 2 best formats and your best posting time."], ["Week 2", "Post 3 to 5 times. Make a part 2 of your best post. Test one new hook as a trial reel."], ["Week 3", "Reply to every comment in the first hour. Turn the top question into a post."], ["Week 4", "Run your report again. Keep what moved up, drop what moved down, change one thing at a time."]].map(([w, t]) => <li key={w} className="flex gap-4 rounded-2xl border p-5"><b className="w-16 shrink-0 font-medium text-link">{w}</b><span>{t}</span></li>)}
          </ol>
          <p className="mt-8 flex gap-3 rounded-2xl bg-[#F6F4FB] p-5 text-sm"><InfoIcon className="mt-0.5 size-4 shrink-0 text-link" />No tool can guarantee followers. Anyone who promises that is selling bots, which Instagram removes. Growth comes from posting what your audience sends to friends, often enough to learn what that is.</p>
        </article>
      </div>
      <CtaBand />
    </PageShell>
  );
}
