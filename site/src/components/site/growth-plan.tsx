"use client";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlusIcon, PrinterIcon } from "lucide-react";
import { ClaudeButton } from "./claude-button";
import { href } from "@/lib/site";
import { buildPlan, DEFAULT_ANSWERS, GOAL_LABEL, type Answers, type Fmt, type Src } from "@/lib/growth";

type Opt = [string, string];
const Q = {
  goal: { q: "What do you want most from Instagram?", opts: [["followers", "More followers"], ["views", "More views"], ["engagement", "More comments"], ["sales", "Sales"], ["deals", "Brand deals"]] as Opt[] },
  stage: { q: "How many followers do you have now?", opts: [["new", "Under 1,000"], ["small", "1,000 to 10,000"], ["mid", "10,000 to 100,000"], ["large", "Over 100,000"]] as Opt[] },
  hours: { q: "How much time can you give it each week?", opts: [["h2", "1 to 2 hours"], ["h5", "3 to 5 hours"], ["h10", "6 to 10 hours"], ["h10plus", "More than 10"]] as Opt[] },
  now: { q: "How often do you post now?", opts: [["n1", "Once a week or less"], ["n2", "Twice a week"], ["n5", "3 to 5 times"], ["n6", "6 or more"]] as Opt[] },
  struggle: { q: "What is the hardest part right now?", opts: [["ideas", "I run out of ideas"], ["reach", "Low views"], ["nofollow", "Views, but no follows"], ["comments", "No comments"], ["consistency", "Staying consistent"], ["sales", "Followers don't buy"]] as Opt[] },
  slot: { q: "When are your followers free to scroll?", opts: [["morning", "Morning, 7 to 9"], ["lunch", "Lunch, 12 to 2"], ["evening", "Evening, 6 to 10"], ["unsure", "Not sure"]] as Opt[] },
} as const;
const FORMATS: [Fmt, string][] = [["face", "Reels with my face"], ["voice", "Reels with my voice, no face"], ["carousel", "Carousels"], ["photo", "Photos"], ["stories", "Stories"]];
const pill = (on: boolean) => `inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-left text-sm transition-colors ${on ? "border-foreground bg-foreground text-background" : "bg-background hover:border-foreground/40"}`;
const input = "h-12 w-full rounded-xl border bg-background px-3 text-base outline-none focus:border-foreground";
const PHRASE = { followers: "more followers", views: "more views", engagement: "more comments", sales: "sales from Instagram", deals: "brand deals", other: "your own goal" } as const;
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Source({ src }: { src?: Src }) {
  return src ? <> <a href={src.url} target="_blank" rel="noopener" className="whitespace-nowrap underline underline-offset-2">Source: {src.name}</a></> : null;
}

export function GrowthPlan() {
  const [a, setA] = useState<Answers>(DEFAULT_ANSWERS);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState("");
  useEffect(() => {
    let next = DEFAULT_ANSWERS;
    try { const s = JSON.parse(localStorage.getItem("cgs-growth") || "null"); if (s && s.goal) next = { ...DEFAULT_ANSWERS, ...s, other: s.other || {} }; } catch {}
    const g = new URLSearchParams(window.location.search).get("goal");
    if (g && g in GOAL_LABEL) next = { ...next, goal: g as Answers["goal"] };
    setA(next); setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem("cgs-growth", JSON.stringify(a)); } catch {} }, [a, ready]);
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((x) => ({ ...x, [k]: v }));
  const setOther = (k: string, v: string) => setA((x) => ({ ...x, other: { ...x.other, [k]: v } }));
  const p = useMemo(() => buildPlan(a), [a]);

  const addToPlanner = () => {
    try {
      const list = JSON.parse(localStorage.getItem("cgs-plan") || "[]");
      const today = new Date();
      p.week.forEach((w, i) => {
        const d = new Date(today); const want = DAY_NAMES.indexOf(w.day); const have = (today.getDay() + 6) % 7;
        d.setDate(today.getDate() + (((want - have + 7) % 7) || 7));
        list.push({ id: Date.now() + i, title: `${w.format}${a.niche.trim() ? ` about ${a.niche.trim()}` : ""}`, format: w.format, date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, time: p.time, notes: `${p.hook.title}. ${p.cta.title}: "${p.cta.example}"`, done: false });
      });
      localStorage.setItem("cgs-plan", JSON.stringify(list)); setSaved(`Added ${p.week.length} posts to your planner.`);
    } catch { setSaved("Could not save. Your browser is blocking storage."); }
  };

  const label = (k: keyof typeof Q) => (a[k] === "other" ? `Other: ${a.other[k] || "(not written yet)"}` : Q[k].opts.find(([v]) => v === a[k])?.[1]);
  const prompt = `You are an Instagram growth coach. Plain English, short lines, no hype. Never promise results and never invent statistics.
About me: topic "${a.niche || "not given"}"; goal: ${label("goal")}; followers: ${label("stage")}; time per week: ${label("hours")}; posting now: ${label("now")}; hardest part: ${label("struggle")}; my followers are free: ${label("slot")}; I can make: ${a.formats.join(", ") || "anything"}${a.other.formats ? `, also: ${a.other.formats}` : ""}.
My plan: ${p.headline} (${p.mix.map((m) => `${m.count} ${m.format.toLowerCase()}${m.count > 1 ? "s" : ""}`).join(", ")}) on ${p.days.join(", ")} at ${p.time}. Signal to improve: ${p.signal.name}. Opening: ${p.hook.title}. Last line: ${p.cta.title}.
Give me: 1) 12 post ideas for the next 4 weeks that fit this plan, each with its first line or first 3 seconds; 2) the one idea you would post first and why; 3) anything in my own words above that changes the plan.`;

  const choice = (k: keyof typeof Q) => (
    <fieldset className="grid gap-3">
      <legend className="text-base font-semibold tracking-tight">{Q[k].q}</legend>
      <div role="radiogroup" aria-label={Q[k].q} className="flex flex-wrap gap-1.5">
        {Q[k].opts.map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={a[k] === v} onClick={() => set(k, v as never)} className={pill(a[k] === v)}>{l}</button>)}
        <button type="button" role="radio" aria-checked={a[k] === "other"} onClick={() => set(k, "other" as never)} className={pill(a[k] === "other")}>Other</button>
      </div>
      {a[k] === "other" && <label className="grid gap-1.5 text-sm text-muted-foreground">Write your own answer<input className={input} value={a.other[k] || ""} onChange={(e) => setOther(k, e.target.value)} autoFocus /></label>}
    </fieldset>
  );

  return (
    <div className="grid grid-cols-1 gap-8 [&>*]:min-w-0 lg:grid-cols-[1fr_1.15fr]">
      <form className="grid content-start gap-8 rounded-3xl border bg-[#FAFAFC] p-6 sm:p-8 print:hidden" onSubmit={(e) => e.preventDefault()}>
        {choice("goal")}
        <label className="grid gap-3"><span className="text-base font-semibold tracking-tight">What is your account about?</span>
          <input className={input} value={a.niche} onChange={(e) => set("niche", e.target.value)} placeholder="Budget travel in India" autoComplete="off" /></label>
        {choice("stage")}
        <fieldset className="grid gap-3">
          <legend className="text-base font-semibold tracking-tight">What can you make? Pick all that fit.</legend>
          <div className="flex flex-wrap gap-1.5">
            {FORMATS.map(([v, l]) => { const on = a.formats.includes(v); return <button key={v} type="button" aria-pressed={on} onClick={() => set("formats", on ? a.formats.filter((x) => x !== v) : [...a.formats, v])} className={pill(on)}>{l}</button>; })}
          </div>
          <label className="grid gap-1.5 text-sm text-muted-foreground">Other: write your own<input className={input} value={a.other.formats || ""} onChange={(e) => setOther("formats", e.target.value)} placeholder="Live streams, memes…" /></label>
        </fieldset>
        {choice("hours")}{choice("now")}{choice("struggle")}{choice("slot")}
        <p className="text-sm text-muted-foreground">Your answers stay in this browser. Anything you write in your own words is passed to Claude when you press the Claude button.</p>
      </form>

      <div className="grid content-start gap-10" aria-live="polite">
        <div>
          <p className="text-sm text-muted-foreground">Your pattern for {PHRASE[a.goal]}</p>
          <p className="font-display mt-1 text-5xl font-bold tracking-[-0.04em] sm:text-7xl">{p.headline}</p>
          <p className="mt-3 text-lg text-muted-foreground">{p.mix.map((m) => `${m.count} ${m.format.toLowerCase()}${m.count > 1 ? "s" : ""}`).join(" + ")}{p.stories ? ", plus Stories most days" : ""}. {p.frequencyWhy.text}<Source src={p.frequencyWhy.src} /></p>
          {p.ramp && <p className="mt-3 rounded-2xl bg-[#FFF6DD] p-4 text-sm text-[#5C4200]">{p.ramp}</p>}
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight">Your week</h2>
          <ol className="mt-4 grid grid-cols-7 gap-1.5 text-center">
            {DAY_NAMES.map((d) => { const w = p.week.find((x) => x.day === d); return (
              <li key={d} className={`grid min-h-24 content-between rounded-2xl border p-2 ${w ? "border-foreground bg-foreground text-background" : "bg-[#FAFAFC] text-muted-foreground"}`}>
                <span className="text-xs">{d}</span>{w ? <><span className="text-sm font-semibold sm:text-base">{w.format}</span><span className="text-xs tabular-nums opacity-70">{p.time}</span></> : <span className="text-xs">{p.stories ? "Story" : "Rest"}</span>}
              </li>); })}
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">{p.timeNote} The days spread your posts across the week; they are a starting pattern, not an Instagram rule.</p>
        </div>

        <dl className="grid gap-0 border-t">
          {[
            ["What to post", <>{p.mix.map((m) => <span key={m.format} className="mb-2 block"><b className="text-foreground">{m.count} × {m.format}.</b> {m.why}<Source src={m.src} /></span>)}{p.stories && <span className="block"><b className="text-foreground">Stories.</b> {p.storiesWhy.text}<Source src={p.storiesWhy.src} /></span>}</>],
            ["The number to move", <><b className="text-foreground">{p.signal.name}.</b> {p.signal.why}<Source src={p.signal.src} /><span className="mt-2 block">{p.signal.how}</span></>],
            ["How to open", <><b className="text-foreground">{p.hook.title}.</b> {p.hook.text}</>],
            ["How to end", <><b className="text-foreground">{p.cta.title}.</b> {p.cta.text} <span className="mt-2 block rounded-xl bg-[#FAFAFC] p-3 text-foreground">"{p.cta.example}"</span></>],
            [p.fix.title, <ol key="f" className="grid list-decimal gap-1.5 pl-5">{p.fix.steps.map((s) => <li key={s}>{s}</li>)}{p.fix.src && <li className="list-none"><Source src={p.fix.src} /></li>}</ol>],
            ["What to track", <ul key="w" className="grid list-disc gap-1.5 pl-5">{p.watch.map((s) => <li key={s}>{s}</li>)}</ul>],
            ["Your 4-week test", <ol key="t" className="grid list-decimal gap-1.5 pl-5">{p.test.map((s) => <li key={s}>{s}</li>)}</ol>],
            ["Do not do this", <ul key="a" className="grid list-disc gap-1.5 pl-5">{p.avoid.map((s) => <li key={s.text}>{s.text}<Source src={s.src} /></li>)}</ul>],
            ["For your size", <>{p.stageNote}</>],
          ].map(([t, body]) => (
            <div key={t as string} className="grid gap-2 border-b py-6 sm:grid-cols-[11rem_1fr] sm:gap-6">
              <dt className="text-base font-semibold tracking-tight">{t}</dt><dd className="text-[0.95rem] leading-relaxed text-muted-foreground">{body}</dd>
            </div>
          ))}
        </dl>

        {p.ownWords.length > 0 && <p className="rounded-2xl border p-4 text-sm text-muted-foreground"><b className="text-foreground">Your own words.</b> The plan cannot score free text, so it uses a safe default for those answers. Press the Claude button and Claude will read exactly what you wrote.</p>}

        <div className="grid gap-3 print:hidden">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={addToPlanner} data-slot="button" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 font-medium text-primary-foreground"><CalendarPlusIcon aria-hidden className="size-4" />Add this week to my planner</button>
            <button type="button" onClick={() => window.print()} data-slot="button" className="inline-flex h-12 items-center gap-2 rounded-xl border px-5 font-medium"><PrinterIcon aria-hidden className="size-4" />Save as PDF</button>
          </div>
          {saved && <p role="status" className="text-sm">{saved} <a href={href("/planner/")} className="underline underline-offset-2">Open the planner</a></p>}
          <ClaudeButton prompt={prompt} label="Get 12 post ideas for this plan" />
        </div>
        <p className="text-xs text-muted-foreground">There are no hacks here. Instagram does not publish exact weights. This plan uses what Instagram's head has said in public, plus common practice, which is labelled. It is a guide, not a promise of growth.</p>
      </div>
    </div>
  );
}
