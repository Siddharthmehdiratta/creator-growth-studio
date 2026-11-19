import type { Metadata } from "next";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageShell, Section } from "@/components/site/shell";
import { SITE, href } from "@/lib/site";

export const metadata: Metadata = { title: "Pricing", description: "Creator Growth Studio is free and open source under the MIT licence." };

const ALL = ["A rating out of 10 for every post", "Why each post worked", "What to post next", "A 30-day plan for Google Calendar", "Comments sorted", "AI boardroom in Claude", "Audience health check", "Instagram, YouTube and Twitch", "Unlimited reports", "Your data never leaves your browser"];

export default function Page() {
  return (
    <PageShell group="Product" kicker="Pricing" title="Free. Every feature, for everyone." lead="No trial, no card, no account. The whole tool is open source under the MIT licence, so it stays free.">
      <Section>
        <div className="mx-auto grid max-w-4xl overflow-hidden rounded-[2rem] border shadow-xl shadow-primary/5 md:grid-cols-[1fr_1.2fr]">
          <div className="bg-[#15131F] p-9 text-white">
            <p className="text-sm font-medium text-white/70">Everything</p>
            <p className="mt-4 flex items-baseline gap-2"><span className="text-6xl font-semibold tracking-[-0.04em]">₹0</span><span className="text-white/60">forever</span></p>
            <p className="mt-4 text-sm text-white/70">Also $0, €0 and £0. Made free on purpose, so every creator can grow.</p>
            <Button size="lg" className="mt-8 h-12 w-full rounded-xl bg-white text-[#15131F] hover:bg-white/90" asChild><a href={href(SITE.app)}>Get my free report</a></Button>
            <a href={href("/sample/")} className="mt-3 block text-center text-sm text-white/70 hover:text-white">See a sample first</a>
          </div>
          <div className="p-9">
            <p className="font-medium">What's included</p>
            <ul className="mt-5 grid gap-3 text-sm">{ALL.map((t) => <li key={t} className="flex gap-2.5"><CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />{t}</li>)}</ul>
          </div>
        </div>
      </Section>
      <Section tint>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-[-0.03em]">Questions about price</h2>
          <Accordion type="single" collapsible className="mt-6">
            {[["Why is it free?", "It's built as an open-source project to help creators grow. The code is public on GitHub under MIT, so anyone can use it, copy it and check it."], ["Will it stay free?", "The code is MIT licensed, so it can never be taken back. If a paid version ever appears, this free version stays available."], ["Does the AI boardroom cost money?", "It runs in your own Claude app. It works on Claude's free plan; longer reviews may need a paid Claude plan, which is between you and Anthropic."], ["Do you sell my data?", "No. There's no account and no database. Your report is worked out in your browser."]].map(([q, a]) => (
              <AccordionItem key={q} value={q}><AccordionTrigger className="py-5 text-base">{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>
    </PageShell>
  );
}
