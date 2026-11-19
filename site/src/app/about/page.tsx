import type { Metadata } from "next";
import { PageShell, Section, SectionHead, CtaBand } from "@/components/site/shell";
import { href } from "@/lib/site";

export const metadata: Metadata = { title: "About", description: "Who makes Creator Growth Studio, and why it's free." };

export default function Page() {
  return (
    <PageShell kicker="About" title="Growth advice that fits your account, not someone else's" lead="Creator Growth Studio is a free, open-source tool made by Siddharth Mehdiratta in Pune, India. It turns the numbers you already have into a clear, honest plan.">
      <Section>
        <div className="grid grid-cols-1 gap-12 [&>*]:min-w-0 lg:grid-cols-2">
          <SectionHead eyebrow="Why it exists" title="Most growth advice is generic. Your numbers aren't." />
          <div className="grid gap-5 text-lg leading-relaxed text-muted-foreground">
            <p>Every creator hears the same tips: post more, use trends, hook in the first second. Some of it is true for you, and some of it isn't.</p>
            <p>The only way to know is to look at your own posts and compare like with like. That's slow and fiddly by hand, so this tool does it for you, in under a minute, for free.</p>
          </div>
        </div>
      </Section>
      <Section tint>
        <SectionHead eyebrow="What we believe" title="Four rules the tool never breaks" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[["Honest over impressive", "Every pattern says how strong the evidence is. Thin evidence is labelled, and no tool can promise followers."], ["Your data stays yours", "The report is worked out in your browser. No account, no database, no password."], ["Official data only", "Instagram's official API and the exports platforms give you. No scraping and no bots."], ["Free and open", "Every line of code is public under the MIT licence, so anyone can check it, copy it and improve it."]].map(([t, d], i) => (
            <div key={t} className="rounded-3xl border bg-background p-7"><h3 className="text-lg font-semibold tracking-tight">{t}</h3><p className="mt-2 text-muted-foreground">{d}</p></div>
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid grid-cols-1 gap-10 [&>*]:min-w-0 lg:grid-cols-2">
          <SectionHead eyebrow="The maker" title="Siddharth Mehdiratta" />
          <div className="grid gap-5 text-lg leading-relaxed text-muted-foreground">
            <p>A photographer trained at Arts University Bournemouth, based in Pune. Creator Growth Studio is one of two free projects; the other is <a className="font-medium text-link" href="https://siddharthmehdiratta.github.io/founder-skill-plus/">Founder Plus</a>, which lets founders test a business idea on AI customers.</p>
            <p>Have an idea or found a problem? <a className="font-medium text-link" href={href("/contact/")}>Get in touch</a>.</p>
          </div>
        </div>
      </Section>
      <CtaBand />
    </PageShell>
  );
}
