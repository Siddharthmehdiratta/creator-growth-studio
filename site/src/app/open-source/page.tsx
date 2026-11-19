import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { PageShell, Section, SectionHead } from "@/components/site/shell";
import { GhStats } from "@/components/site/gh-stats";
import { GithubMark } from "@/components/site/brand-icons";
import { SITE, href } from "@/lib/site";

export const metadata: Metadata = { title: "Open source", description: "Free and open source under MIT. Live stars, what's inside and how to run your own copy." };

export default function Page() {
  return (
    <PageShell group="Company" kicker="Open source" title="Free, open source, and yours to copy" lead="Every line of code is public under the MIT licence. Use it, change it, or help build it."
      actions={<><Button className="h-11 gap-2 rounded-xl px-5" asChild><a href={SITE.repo}><GithubMark className="size-4" />Open on GitHub</a></Button><Button variant="outline" className="h-11 rounded-xl px-5" asChild><a href={`${SITE.repo}/stargazers`}>Give it a star</a></Button></>}>
      <Section><GhStats repo="Siddharthmehdiratta/creator-growth-studio" /></Section>
      <Section tint>
        <div className="grid grid-cols-1 gap-12 [&>*]:min-w-0 lg:grid-cols-2">
          <div>
            <SectionHead title="What's inside" />
            <ul className="mt-8 grid gap-3">
              {[["site/", "This website, built with Next.js and Tailwind from the free Velora UI template."], ["docs/", "The published website, plus the report tool itself in plain HTML and JavaScript."], ["connect/", "The small Instagram connector, a free Cloudflare Worker that stores nothing."], ["skills/", "Claude Code skills: the Python engine, the AI boardroom and the platform rules."], ["tests/", "Automatic checks for the maths, the connector and every page."]].map(([f, d]) => (
                <li key={f} className="rounded-2xl border bg-background p-4"><p className="font-mono text-sm text-link">{f}</p><p className="mt-1 text-sm text-muted-foreground">{d}</p></li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHead title="Run your own copy" />
            <ol className="mt-8 grid gap-4">
              {[["Fork it.", "Press Fork on GitHub. It's free."], ["Turn on Pages.", "Settings, then Pages, then branch main and folder /docs."], ["Open your site.", "Uploads work straight away. For username lookup, follow CONNECT-INSTAGRAM.md."]].map(([b, t], i) => <li key={b} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full border bg-background text-sm font-semibold text-link">{i + 1}</span><p><b className="font-medium">{b}</b> <span className="text-muted-foreground">{t}</span></p></li>)}
            </ol>
            <pre className="mt-8 overflow-x-auto rounded-2xl bg-[#15131F] p-5 text-sm leading-relaxed text-[#E7E2FF]"><code>{`git clone ${SITE.repo}.git
cd creator-growth-studio/docs
python3 -m http.server 8000`}</code></pre>
          </div>
        </div>
      </Section>
      <Section>
        <SectionHead title="Help build it" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[[`${SITE.repo}/stargazers`, "Star the repo", "It helps other creators find it."], ["/contact/#report", "Report a problem", "Bugs get fixed faster with exact steps."], [`${SITE.repo}/pulls`, "Send a change", "Open a pull request. Tests run on every change."]].map(([h, t, d]) => (
            <a key={t} href={href(h)} className="rounded-3xl border p-7 hover:border-primary/30 hover:bg-[#FAF8FF]"><h3 className="font-semibold tracking-tight">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></a>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">Website design based on Velora UI by Colorlib (MIT). Fonts: Geist (SIL Open Font License).</p>
      </Section>
    </PageShell>
  );
}
