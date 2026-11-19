"use client";
import { useMemo, useState } from "react";
import { CheckCircle2Icon, CircleAlertIcon, InfoIcon, XCircleIcon } from "lucide-react";
import { ClaudeButton } from "./claude-button";
import { checkAd, planTest, DEFAULT_AD, RESULT_WORD, type Ad, type Goal } from "@/lib/ads";

const GOALS: [Goal, string][] = [["followers", "More followers"], ["sales", "Sales"], ["messages", "Messages or leads"], ["reach", "Reach"]];
const LABEL = { working: "It's working", close: "Close to break-even", losing: "It's losing money", "too-early": "Too early", "need-target": "Add one more number", empty: "Type your numbers" } as const;
const TONE = { working: "#0E7A53", close: "#9A6200", losing: "#B4232F", "too-early": "#9A6200", "need-target": "#15131F", empty: "#15131F" } as const;
const field = "h-12 w-full rounded-xl border bg-background px-3 text-base tabular-nums outline-none focus:border-foreground";

function Num({ label, hint, value, set, id }: { label: string; hint?: string; value: number; set: (n: number) => void; id: string }) {
  return (
    <label htmlFor={id} className="grid content-start gap-1.5 text-sm font-medium">{label}
      <input id={id} name={id} type="number" inputMode="decimal" min={0} autoComplete="off" className={field} value={Number.isFinite(value) && value !== 0 ? value : ""} placeholder="0" onChange={(e) => set(e.target.value === "" ? 0 : Number(e.target.value))} />
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function AdsChecker() {
  const [a, setA] = useState<Ad>(DEFAULT_AD);
  const [cur, setCur] = useState("₹");
  const [daily, setDaily] = useState(300);
  const up = <K extends keyof Ad>(k: K) => (v: Ad[K]) => setA((x) => ({ ...x, [k]: v }));
  const r = useMemo(() => checkAd(a), [a]);
  const plan = useMemo(() => planTest(daily, a.orderValue, a.marginPct), [daily, a.orderValue, a.marginPct]);
  const money = (n: number | null) => (n === null ? "–" : `${cur}${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n)}`);
  const word = RESULT_WORD[a.goal];
  const prompt = `You are a careful paid-social advisor for a small creator or business. No hype, no invented benchmarks.
My Instagram ad: goal ${a.goal}; spent ${money(a.spend)} over ${a.days} days; reached ${a.reach} people; ${r.results} ${a.goal === "sales" ? "orders" : "results"}; cost per result ${money(r.cpr)}; cost per 1,000 reached ${money(r.cpm)}.${a.goal === "sales" ? ` Average order ${money(a.orderValue)}, margin ${a.marginPct}%, profit after ads ${money(r.profit)}.` : ""}
The checker's reading: ${LABEL[r.verdict]}.
Give me: 1) the single most likely reason for this result, 2) three new versions of the first line or first 3 seconds to test, 3) one audience change to test. Keep it under 180 words.`;
  return (
    <div className="grid grid-cols-1 gap-6 [&>*]:min-w-0 lg:grid-cols-[1.15fr_1fr]">
      <form className="grid content-start gap-6 rounded-3xl border bg-surface p-6 sm:p-8" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">What was the ad for?</legend>
          <div role="radiogroup" aria-label="Goal of the ad" className="mt-2 flex flex-wrap gap-1.5">
            {GOALS.map(([g, l]) => (
              <button key={g} type="button" role="radio" aria-checked={a.goal === g} onClick={() => up("goal")(g)}
                className={`inline-flex h-11 items-center rounded-full border px-4 text-sm transition-colors ${a.goal === g ? "border-foreground bg-foreground text-background" : "bg-background hover:border-foreground/40"}`}>{l}</button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-[7rem_1fr_1fr]">
          <label htmlFor="cur" className="grid gap-1.5 text-sm font-medium">Currency
            <select id="cur" className={field} value={cur} onChange={(e) => setCur(e.target.value)}>{["₹", "$", "£", "€"].map((c) => <option key={c}>{c}</option>)}</select></label>
          <Num id="spend" label="Total spent" value={a.spend} set={up("spend")} />
          <Num id="days" label="Days it ran" value={a.days} set={up("days")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Num id="reach" label="People reached" hint="From the ad's insights." value={a.reach} set={up("reach")} />
          {a.goal === "sales"
            ? <Num id="orders" label="Orders from the ad" value={a.orders} set={up("orders")} />
            : a.goal !== "reach" && <Num id="results" label={a.goal === "followers" ? "New followers from the ad" : "Messages from the ad"} value={a.results} set={up("results")} />}
        </div>
        {a.goal === "sales" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Num id="aov" label="Average order value" value={a.orderValue} set={up("orderValue")} />
            <Num id="margin" label="Margin %" hint="What you keep from a sale after the product's own cost." value={a.marginPct} set={up("marginPct")} />
          </div>
        ) : (
          <Num id="target" label={`Most you would pay for one ${word}`} hint="Your own limit. The verdict compares your real cost with this." value={a.target} set={up("target")} />
        )}
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Before you paid, did this post beat your normal reach?</legend>
          <div role="radiogroup" aria-label="Did the post beat your normal reach" className="mt-2 flex flex-wrap gap-1.5">
            {([["yes", "Yes"], ["no", "No"], ["unsure", "Not sure"]] as const).map(([v, l]) => (
              <button key={v} type="button" role="radio" aria-checked={a.beatNormal === v} onClick={() => up("beatNormal")(v)}
                className={`inline-flex h-11 items-center rounded-full border px-4 text-sm transition-colors ${a.beatNormal === v ? "border-foreground bg-foreground text-background" : "bg-background hover:border-foreground/40"}`}>{l}</button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 border-t pt-6 sm:grid-cols-2">
          <Num id="daily" label="Planning a new test? Daily budget" value={daily} set={setDaily} />
          <p className="self-end text-sm text-muted-foreground">7 days at this budget is <b className="text-foreground">{money(plan.total)}</b>.{plan.ordersToBreakEven !== null && a.goal === "sales" && <> You need <b className="text-foreground">{plan.ordersToBreakEven}</b> orders to break even.</>} Meta suggests at least US$5 a day for more than 6 days.</p>
        </div>
      </form>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border bg-background p-6 sm:p-8" aria-live="polite">
          <p className="text-sm text-muted-foreground">Is the ad working?</p>
          <p className="font-display mt-1 text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: TONE[r.verdict] }}>{LABEL[r.verdict]}{r.early && (r.verdict === "working" || r.verdict === "losing" || r.verdict === "close") ? ", so far" : ""}</p>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y py-5 text-sm">
            <div><dt className="text-muted-foreground">Cost per {word === "1,000 people reached" ? "result" : word}</dt><dd className="mt-0.5 text-2xl font-semibold tabular-nums">{a.goal === "reach" ? "–" : money(r.cpr)}</dd></div>
            <div><dt className="text-muted-foreground">Cost per 1,000 reached</dt><dd className="mt-0.5 text-2xl font-semibold tabular-nums">{money(r.cpm)}</dd></div>
            <div><dt className="text-muted-foreground">Spend per day</dt><dd className="mt-0.5 text-2xl font-semibold tabular-nums">{money(r.perDay)}</dd></div>
            {a.goal === "sales" && <div><dt className="text-muted-foreground">Left after product cost and ads</dt><dd className="mt-0.5 text-2xl font-semibold tabular-nums">{money(r.profit)}</dd></div>}
          </dl>
          <div className="mt-5 grid gap-4">
            {r.findings.map((f) => (
              <div key={f.title} className="flex gap-3 text-sm">
                {f.tone === "good" ? <CheckCircle2Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-[#0E7A53]" /> : f.tone === "bad" ? <XCircleIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-[#B4232F]" /> : f.tone === "warn" ? <CircleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-[#9A6200]" /> : <InfoIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-muted-foreground" />}
                <div><p className="font-medium">{f.title}</p><p className="text-muted-foreground">{f.text}{f.src && <> <a href={f.src.url} target="_blank" rel="noopener" className="underline underline-offset-2">Source: {f.src.name}</a></>}</p></div>
              </div>
            ))}
          </div>
          <h2 className="mt-7 text-lg font-semibold tracking-tight">Do this next</h2>
          <ol className="mt-2 grid list-decimal gap-1.5 pl-5 text-sm text-muted-foreground">{r.next.map((n) => <li key={n}>{n}</li>)}</ol>
          <h2 className="mt-7 text-lg font-semibold tracking-tight">The kind of ad for this goal</h2>
          <p className="mt-2 text-sm"><b>{r.adType.title}.</b> <span className="text-muted-foreground">{r.adType.text}</span></p>
          <div className="mt-7 border-t pt-6"><ClaudeButton prompt={prompt} label="Ask Claude what to change" /></div>
          <p className="mt-6 text-xs text-muted-foreground">The verdict uses only your numbers and your own limit. It is a guide, not financial advice. Nothing you type leaves your browser.</p>
        </div>
      </div>
    </div>
  );
}
