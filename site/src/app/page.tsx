import { ArrowRightIcon, BadgeCheckIcon, CalendarDaysIcon, CheckIcon, LightbulbIcon, LockIcon, MessageSquareTextIcon, SparklesIcon, StarIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BorderBeam } from "@/components/velora/border-beam";
import { BrowserMockup } from "@/components/velora/browser-mockup";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { InstagramMark, TwitchMark, YouTubeMark } from "@/components/site/brand-icons";
import { SITE, href } from "@/lib/site";
import { Hero3DLazy } from "@/components/site/hero-3d-lazy";
import { PostChecker } from "@/components/site/post-checker";
import { Icon } from "@/components/site/icon";

const PLATFORMS = [
  { name: "Instagram", sub: "Reels, posts, carousels", p: "instagram", Mark: InstagramMark, tone: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]" },
  { name: "YouTube", sub: "Videos and Shorts", p: "youtube", Mark: YouTubeMark, tone: "from-[#FF3B30] to-[#C4161C]" },
  { name: "Twitch", sub: "Live streams", p: "twitch", Mark: TwitchMark, tone: "from-[#9146FF] to-[#6441A5]" },
];

const FAQ = [
  ["Is it really free?", "Yes. It's open source under the MIT licence. There's nothing to buy, no trial and no account to create."],
  ["Do I need to give my password?", "No. Typing a username reads public numbers. Connect Instagram uses Instagram's own login page, so the tool never sees your password."],
  ["Does it work with a small account?", "Yes. Each post is compared with your own typical post, so it works from your first few posts. With fewer than 15 posts, the report says its patterns are early hints."],
  ["Where does my data go?", "Nowhere. The report is worked out inside your own browser, and uploaded files never leave your device."],
];

function Shot({ src, alt, className = "", eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return <img src={href(src)} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" className={`block w-full ${className}`} />;
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="overflow-x-clip">
        {/* ---------------- hero ---------------- */}
        <section className="relative isolate overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_75%_10%,#EDE7FF_0%,transparent_70%)]" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-40 mask-[radial-gradient(ellipse_70%_60%_at_70%_0%,black,transparent_75%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pt-14 pb-16 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:px-8">
            <div className="text-center lg:text-left">
              <a href={href("/algorithm/")} className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm text-muted-foreground shadow-xs hover:text-foreground">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">New</span>
                How the Instagram algorithm works
                <ArrowRightIcon className="size-3.5" />
              </a>
              <h1 className="mt-7 text-[3.4rem] leading-[0.95] font-bold tracking-[-0.045em] text-balance sm:text-7xl lg:text-[6.4rem]">
                Know what to post next.
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl lg:mx-0">
                See which posts grew your account and why. Then check your next post before you share it. Free and private.
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button size="lg" className="h-12 rounded-xl px-6 text-base shadow-lg shadow-primary/25" asChild>
                  <a href={href("/connect/")}>Get my free report<ArrowRightIcon /></a>
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-xl px-6 text-base" asChild>
                  <a href={href("/post-checker/")}>Check a post</a>
                </Button>
              </div>
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
                {["No password", "No sign-up", "Open source"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><CheckIcon className="size-4 text-primary" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div aria-hidden className="absolute inset-x-10 top-10 bottom-10 -z-10 rounded-full bg-[radial-gradient(closest-side,#D9CCFF,transparent)] blur-2xl" />
              <Hero3DLazy fallback="/shots/overview-phone.png" />
              <p className="mt-3 text-center text-xs text-muted-foreground">Real report, fictional sample account.</p>
            </div>
          </div>
        </section>

        {/* ---------------- free tools ---------------- */}
        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[["/connect/", "Your report", "Stars for every post and why each worked.", "BarChart3"], ["/post-checker/", "Post Checker", "Score your next post before you share it.", "ScanSearch"], ["/planner/", "Planner", "Plan your week and get calendar reminders.", "CalendarDays"], ["/claude/", "Claude helpers", "Captions, hooks and scripts in one click.", "Sparkles"]].map(([h, t, d, ic]) => (
              <a key={t} href={href(h)} className="group rounded-3xl border bg-background p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon name={ic} className="size-5" /></span>
                <h2 className="mt-5 text-lg font-semibold tracking-tight">{t}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Open<ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" /></span>
              </a>
            ))}
          </div>
        </section>

        {/* ---------------- inside the report ---------------- */}
        <section className="border-y bg-[#FAFAFC]">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-primary">Inside the report</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">Every number, compared with your own usual.</h2>
            </div>
            <div className="relative mt-12">
              <div aria-hidden className="absolute -inset-x-10 -top-10 -bottom-4 -z-10 rounded-[3rem] bg-[radial-gradient(50%_60%_at_50%_40%,#C9B8FF_0%,transparent_70%)] opacity-50 blur-2xl" />
              <BrowserMockup url="creator-growth-studio · sample report" className="relative overflow-hidden rounded-2xl shadow-2xl shadow-primary/10">
                <Shot src="/shots/overview.png" alt="The report's overview for a fictional sample account: average rating 3.5 stars, typical reach 1,380, and the patterns that stand out." />
                <BorderBeam size={260} duration={9} colorFrom="#6C47FF" colorTo="#C4B5FD" />
              </BrowserMockup>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button className="h-11 rounded-xl px-5" asChild><a href={href("/sample/")}>See the sample report (PDF)</a></Button>
                <Button variant="outline" className="h-11 rounded-xl px-5" asChild><a href={href(SITE.sample)}>Explore it live</a></Button>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- try the checker ---------------- */}
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Try it now</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">Will your next post get shown?</h2>
            <p className="mt-4 text-muted-foreground">Change the post and watch the score move. Built on the signals Instagram has published, with a source for every point.</p>
          </div>
          <div className="mt-12"><PostChecker compact /></div>
        </section>

        {/* ---------------- platform choice ---------------- */}
        <section className="border-y bg-[#FAFAFC]">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Pick where you post</h2>
                <p className="mt-3 max-w-xl text-muted-foreground">The report changes to fit each platform. Start with one and add the others later.</p>
              </div>
              <a href={href("/how-it-works/")} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">How each one works<ArrowRightIcon className="size-4" /></a>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {PLATFORMS.map(({ name, sub, p, Mark, tone }) => (
                <a key={p} href={href(`/start.html?p=${p}`)} className="group relative flex items-center gap-4 rounded-2xl border bg-background p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <span className={`grid size-12 place-items-center rounded-xl bg-linear-to-br ${tone} text-white shadow-sm`}><Mark className="size-6" /></span>
                  <span className="grid"><span className="text-lg font-medium">{name}</span><span className="text-sm text-muted-foreground">{sub}</span></span>
                  <ArrowRightIcon className="ml-auto size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- features bento ---------------- */}
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">What you get</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">The advice of a growth team, in one free report.</h2>
          </div>
          <div className="mt-14 grid gap-4 lg:grid-cols-6">
            <article className="overflow-hidden rounded-3xl border bg-background lg:col-span-4">
              <div className="p-7 pb-0 sm:p-9 sm:pb-0">
                <StarIcon className="size-5 text-primary" />
                <h3 className="mt-4 text-xl font-semibold tracking-tight">Every post, rated</h3>
                <p className="mt-2 max-w-md text-muted-foreground">One to five stars from watch time, sends, follows and saves, compared with your own usual post.</p>
              </div>
              <div className="mt-8 ml-7 overflow-hidden rounded-tl-xl border-t border-l shadow-sm sm:ml-9"><Shot src="/shots/posts.png" alt="The posts list, each with stars and a score." className="object-cover object-left-top" /></div>
            </article>
            <article className="overflow-hidden rounded-3xl border bg-linear-to-b from-[#F6F3FF] to-background lg:col-span-2">
              <div className="p-7 sm:p-9">
                <LightbulbIcon className="size-5 text-primary" />
                <h3 className="mt-4 text-xl font-semibold tracking-tight">Know why it worked</h3>
                <p className="mt-2 text-muted-foreground">Each number next to your usual, with a plain reason and what to do next time.</p>
              </div>
              <div className="mx-7 overflow-hidden rounded-t-xl border border-b-0 shadow-sm sm:mx-9"><Shot src="/shots/post-phone.png" alt="One post opened: reach, watch time and sends compared with usual." /></div>
            </article>
            <article className="overflow-hidden rounded-3xl border bg-background lg:col-span-2">
              <div className="p-7 sm:p-9">
                <SparklesIcon className="size-5 text-primary" />
                <h3 className="mt-4 text-xl font-semibold tracking-tight">What to post next</h3>
                <p className="mt-2 text-muted-foreground">Ideas built from your own best posts, with the format, day and time that work for you.</p>
              </div>
              <div className="mx-7 overflow-hidden rounded-t-xl border border-b-0 shadow-sm sm:mx-9"><Shot src="/shots/ideas-phone.png" alt="Post ideas built from the account's best posts." /></div>
            </article>
            <article className="overflow-hidden rounded-3xl border bg-background lg:col-span-4">
              <div className="grid gap-8 p-7 sm:p-9 md:grid-cols-2">
                <div>
                  <CalendarDaysIcon className="size-5 text-primary" />
                  <h3 className="mt-4 text-xl font-semibold tracking-tight">A 30-day plan</h3>
                  <p className="mt-2 text-muted-foreground">Pick a goal. See if it's realistic at your pace, then get a calendar of your best days that drops into Google Calendar.</p>
                  <ul className="mt-6 grid gap-3 text-sm">
                    {[[MessageSquareTextIcon, "Comments sorted into questions, requests and spam"], [UsersIcon, "An AI boardroom of six advisers in Claude"], [BadgeCheckIcon, "An audience health check brands trust"]].map(([I, t]) => {
                      const C = I as typeof StarIcon;
                      return <li key={t as string} className="flex items-center gap-2.5"><C className="size-4 text-primary" />{t as string}</li>;
                    })}
                  </ul>
                </div>
                <div className="overflow-hidden rounded-xl border shadow-sm"><Shot src="/shots/plan.png" alt="The 30-day plan with a growth goal." /></div>
              </div>
            </article>
          </div>
          <div className="mt-10"><Button variant="outline" className="rounded-xl" asChild><a href={href("/features/")}>See every feature<ArrowRightIcon /></a></Button></div>
        </section>

        {/* ---------------- how it works ---------------- */}
        <section className="border-y bg-[#FAFAFC]">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-sm font-medium text-primary">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">Three steps. Under a minute.</h2>
              <ol className="mt-10 grid gap-8">
                {[["Pick your platform", "Instagram, YouTube or Twitch. The next screen shows only what fits."],
                  ["Bring your numbers", "Type a username, upload the file your platform gives you, or type in your streams."],
                  ["Read your report", "Stars for every post, the reasons, and a plan for the next 30 days."]].map(([t, d], i) => (
                  <li key={t} className="flex gap-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border bg-background text-sm font-semibold text-primary shadow-xs">{i + 1}</span>
                    <div><h3 className="text-lg font-semibold tracking-tight">{t}</h3><p className="mt-1 text-muted-foreground">{d}</p></div>
                  </li>
                ))}
              </ol>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button className="h-11 rounded-xl px-5" asChild><a href={href(SITE.app)}>Get my free report</a></Button>
                <Button variant="ghost" className="h-11 rounded-xl px-5" asChild><a href={href("/guide/")}>Read the beginner's guide</a></Button>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-sm">
              <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,#DCD1FF,transparent)]" />
              <div className="overflow-hidden rounded-[2.4rem] border-8 border-[#15131F] bg-[#15131F] shadow-2xl">
                <Shot src="/shots/overview-phone.png" alt="The report on a phone." className="rounded-[1.8rem]" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- grounded in evidence ---------------- */}
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Built on evidence</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">Advice grounded in what platforms reward.</h2>
            <p className="mt-4 text-muted-foreground">Every rule the report uses has a public source you can check.</p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border bg-border md:grid-cols-3">
            {[["3 signals", "Watch time, sends per reach and likes per reach are what Instagram's head names as most important. Your stars weigh them most.", "Buffer", "https://buffer.com/resources/instagram-algorithms/"],
              ["3 to 5 posts", "A week more than doubled follower growth against 1 to 2, in Buffer's study of 2 million Instagram posts.", "Buffer", "https://buffer.com/resources/how-often-to-post-on-instagram/"],
              ["5 hashtags", "Instagram caps hashtags at 5 per post since December 2025. Your plan never suggests more.", "Business Today", "https://www.businesstoday.in/technology/news/story/no-more-hashtag-stuffing-instagram-limits-hashtag-usage-to-just-5-per-reel-and-post-507444-2025-12-19"]].map(([n, d, s, u]) => (
              <div key={n} className="bg-background p-8">
                <p className="text-4xl font-semibold tracking-[-0.04em]">{n}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
                <a href={u} target="_blank" rel="noopener" className="mt-5 inline-block text-xs font-medium text-primary">Source: {s}</a>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[[LockIcon, "Never sees your password", "Instagram's own login page, or public numbers only."], [BadgeCheckIcon, "Official data only", "No scraping, no bots. Meta's official API and your own exports."], [StarIcon, "Honest statistics", "Patterns are checked like with like, and thin evidence is labelled."]].map(([I, t, d]) => {
              const C = I as typeof StarIcon;
              return (
                <div key={t as string} className="flex gap-3 rounded-2xl border p-5">
                  <C className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div><p className="font-medium">{t as string}</p><p className="mt-1 text-sm text-muted-foreground">{d as string}</p></div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="border-t bg-[#FAFAFC]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[1fr_1.4fr] lg:px-8">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Questions, answered</h2>
              <p className="mt-4 text-muted-foreground">Can't find yours? The help centre has more, and you can ask in public.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-xl" asChild><a href={href("/faq/")}>All questions</a></Button>
                <Button variant="ghost" className="rounded-xl" asChild><a href={href("/contact/")}>Contact us</a></Button>
              </div>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map(([q, a]) => (
                <AccordionItem key={q} value={q}>
                  <AccordionTrigger className="py-5 text-base">{q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ---------------- final call ---------------- */}
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#15131F] px-6 py-16 text-center text-white sm:px-16 sm:py-20">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_0%,#6C47FF_0%,transparent_70%)] opacity-70" />
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">Your next post could be your best one.</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/70">Find out what's working in under a minute. Free, private, and nothing to install.</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-12 rounded-xl bg-white px-6 text-base text-[#15131F] hover:bg-white/90" asChild><a href={href(SITE.app)}>Get my free report</a></Button>
              <Button size="lg" variant="ghost" className="h-12 rounded-xl px-6 text-base text-white hover:bg-white/10 hover:text-white" asChild><a href={href("/sample/")}>See a sample first</a></Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
