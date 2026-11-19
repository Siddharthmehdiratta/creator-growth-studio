import type { Metadata } from "next";
import { PageShell } from "@/components/site/shell";
import { href } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy", description: "What happens to your data: nothing is stored, nothing is sold." };

export default function Page() {
  return (
    <PageShell group="Company" kicker="Privacy" title="What happens to your data" lead="Short version: your report is worked out on your own device, nothing is stored, and nothing is sold. Updated 19 November 2026.">
      <article className="mx-auto max-w-3xl px-5 py-16 text-[1.04rem] leading-[1.75] text-[#2D2A3A]">
        {[["Files you upload", "Exports from Meta Business Suite, YouTube Studio or your typed Twitch streams are read by your browser. They never leave your device."],
          ["Username lookups", "When you type a username, a small connector asks Instagram's official API for that account's public numbers and passes them straight back. It keeps no copy and no log of who asked."],
          ["Connect Instagram", "You log in on Instagram's own page. The tool never sees your password. Instagram gives your browser a temporary key, which stays in that browser tab and is gone when you close it."],
          ["No accounts, no tracking", "There is no sign-up, no database and no advertising tracker. GitHub Pages, which hosts this site, may keep standard server logs under GitHub's own privacy policy."],
          ["The AI boardroom", "It works by copying a message into your own Claude app. What you paste there is covered by Anthropic's privacy policy, not ours."],
          ["What the checker learns", "After your report, this browser keeps a short summary of which kinds of post did better or worse than your usual one: format, length, day, time and hashtags. The Post Checker uses it to rate new posts for you. It never leaves your device. Clear it by clearing this site's data in your browser."],
          ["Fonts", "The typefaces load from Fontshare, a free font service by Indian Type Foundry. Like any website request, your browser shares its IP address with Fontshare to fetch them. No cookies are set by this site."],
          ["Questions", "Ask anything about privacy on our contact page."]].map(([t, d]) => (
          <section key={t} className="border-b py-7 first:pt-0 last:border-b-0"><h2 className="text-xl font-semibold tracking-tight">{t}</h2><p className="mt-2 text-muted-foreground">{d}</p></section>
        ))}
        <a href={href("/contact/")} className="mt-4 inline-block font-medium text-primary">Contact us</a>
      </article>
    </PageShell>
  );
}
