import type { Metadata } from "next";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/site/shell";
import { SITE, href } from "@/lib/site";

export const metadata: Metadata = { title: "Beginner's guide", description: "Your first report in 7 short steps." };

const STEPS: { t: string; lead: string; do: string[]; tip?: string; shot?: string }[] = [
  { t: "Know what you'll get", lead: "A report that tells you which posts grew your account, why, and what to post next. About 10 minutes in total.", do: ["Have your phone or computer ready.", "Know which platform you want to grow: Instagram, YouTube or Twitch.", "That's it. No account, no password, no payment."], tip: "Want to look first? Open the sample report. It's a fictional account analysed by the real tool." },
  { t: "Get your account ready", lead: "Only Instagram needs one setting changed. YouTube and Twitch need nothing.", do: ["Instagram: open the app, go to Settings, then Account type and tools, then Switch to professional account. Pick Creator. It's free and you can switch back.", "YouTube: nothing to do yet.", "Twitch: nothing to do yet."], tip: "Instagram only lets tools read Creator and Business accounts. That's Instagram's rule." },
  { t: "Pick your platform", lead: "Open the tool and choose where you post.", do: ["Press Get my free report.", "Press Instagram, YouTube or Twitch.", "The next screen shows only the options for that platform."] },
  { t: "Bring your numbers", lead: "Pick the easiest way for you. Each one is explained on screen.", do: ["Instagram: type your username, press Connect Instagram, or upload an export from Meta Business Suite.", "YouTube: in YouTube Studio open Analytics, then Advanced mode. Pick the last 90 days, press the download icon, choose CSV, and upload the file called Table data.csv.", "Twitch: type in your last 5 to 10 streams: date, start time, average viewers, hours, new followers and chat messages."], tip: "Username lookup and Connect Instagram switch on once the site's Meta app is approved. Until then, the export upload gives the same detail." },
  { t: "Read your stars", lead: "Every post gets 1 to 5 stars, compared with your own typical post.", do: ["3.5 stars means a normal post for you.", "5 stars means about twice as good as usual. 1 star means well below.", "Sort by Best first to see your top posts, then Worst first."], shot: "/shots/posts-phone.png" },
  { t: "See why each post worked", lead: "Open any post. Each number sits next to your usual, with a plain reason.", do: ["Look for the biggest green number. That's what made it work.", "Look for the red one. That's what held it back.", "Read the Next time line and write it down."], shot: "/shots/post-phone.png" },
  { t: "Act on it, then check again", lead: "Growth comes from repeating what works and changing one thing at a time.", do: ["Open What to post and pick one idea.", "Open Plan and add the 30-day calendar to Google Calendar.", "Post 3 to 5 times a week for 4 weeks.", "Run your report again and compare."], shot: "/shots/plan-phone.png" },
];

export default function Page() {
  return (
    <PageShell group="Learn" kicker="Beginner's guide" title="Your first report in 7 steps" lead="New to all this? Go one step at a time. Each step takes 1 to 3 minutes."
      actions={<><Button className="h-11 rounded-xl px-5" asChild><a href={href(SITE.app)}>Start now</a></Button><Button variant="outline" className="h-11 rounded-xl px-5" asChild><a href={href(SITE.sample)}>Open the sample report</a></Button></>}>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[15rem_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <nav aria-label="Steps" className="sticky top-24 grid gap-1 text-sm">
            {STEPS.map((s, i) => <a key={s.t} href={`#step-${i + 1}`} className="flex gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"><span className="tabular-nums text-primary">{i + 1}</span>{s.t}</a>)}
          </nav>
        </aside>
        <ol className="grid gap-6">
          {STEPS.map((s, i) => (
            <li key={s.t} id={`step-${i + 1}`} className="scroll-mt-24 rounded-3xl border p-7 sm:p-9">
              <div className={s.shot ? "grid items-start gap-8 md:grid-cols-[1fr_14rem]" : ""}>
                <div>
                  <p className="text-sm font-medium text-primary">Step {i + 1} of {STEPS.length}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">{s.t}</h2>
                  <p className="mt-3 text-muted-foreground">{s.lead}</p>
                  <div className="mt-6 rounded-2xl bg-[#F6F4FB] p-5">
                    <p className="text-sm font-medium">Do this</p>
                    <ol className="mt-3 grid list-decimal gap-2.5 pl-5 text-[0.95rem]">{s.do.map((d) => <li key={d}>{d}</li>)}</ol>
                  </div>
                  {s.tip && <p className="mt-4 flex gap-2.5 text-sm text-muted-foreground"><InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />{s.tip}</p>}
                </div>
                {s.shot && <div className="overflow-hidden rounded-[1.6rem] border-[6px] border-[#15131F] bg-[#15131F] shadow-lg"><img src={href(s.shot)} alt="" loading="lazy" className="block w-full rounded-[1.2rem]" /></div>}
              </div>
            </li>
          ))}
          <li className="rounded-3xl bg-[#15131F] p-9 text-white">
            <h2 className="text-2xl font-semibold tracking-tight">You're ready.</h2>
            <p className="mt-2 text-white/70">Stuck on any step? The help centre answers it, or you can ask in public.</p>
            <div className="mt-6 flex flex-wrap gap-3"><a href={href(SITE.app)} className="inline-flex h-11 items-center rounded-xl bg-white px-5 font-medium text-[#15131F]">Start my report</a><a href={href("/help/")} className="inline-flex h-11 items-center rounded-xl px-5 font-medium text-white hover:bg-white/10">Open the help centre</a></div>
          </li>
        </ol>
      </div>
    </PageShell>
  );
}
