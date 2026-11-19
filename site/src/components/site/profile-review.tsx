"use client";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2Icon, CircleAlertIcon } from "lucide-react";
import { ClaudeButton } from "./claude-button";
import { href } from "@/lib/site";
import { CHECKS, GROUPS, MIN_ANSWERS, loadProfile, readText, review, saveProfile, srcOf, type Answer, type Text } from "@/lib/profile";

const input = "w-full rounded-xl border bg-white px-3 text-base outline-none focus:border-foreground";
const OPTS: [Answer, string][] = [["yes", "Yes"], ["no", "No"], ["unsure", "Not sure"]];

function claudePrompt(t: Text, fixes: string[], score: number | null) {
  const L = ["You are an honest Instagram coach. Review my profile and rewrite it. Use plain words. Do not invent numbers or results."];
  if (t.username) L.push(`Username: @${t.username.replace(/^@/, "")}`);
  if (t.name) L.push(`Name field: ${t.name}`);
  if (t.bio) L.push(`Bio: ${t.bio}`);
  if (score !== null) L.push(`My profile review score is ${score.toFixed(1)} out of 10.`);
  if (fixes.length) L.push("Gaps I found:\n" + fixes.map((f) => "- " + f).join("\n"));
  L.push("Give me: 1) a new name field under 64 characters, 2) three bio options under 150 characters, each with one clear next step, 3) what my 3 pinned posts should show, 4) the one gap to fix first and why.");
  return L.join("\n");
}

export function ProfileReview() {
  const [a, setA] = useState<Record<string, Answer>>({});
  const [t, setT] = useState<Text>({ username: "", name: "", bio: "" });
  const [ready, setReady] = useState(false);
  useEffect(() => { const s = loadProfile(); if (s) { setA(s.a); setT(s.t); } setReady(true); }, []);
  useEffect(() => { if (ready) saveProfile({ a, t }); }, [a, t, ready]);

  const r = useMemo(() => review(a), [a]);
  const hints = useMemo(() => readText(t), [t]);
  const bioLen = [...t.bio].length;
  const left = Math.max(0, MIN_ANSWERS - CHECKS.filter((c) => a[c.id] === "yes" || a[c.id] === "no").length);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
      <div className="grid gap-10">
        <section aria-labelledby="pr-text">
          <h2 id="pr-text" className="text-2xl font-semibold tracking-tight">Paste your profile</h2>
          <p className="mt-2 text-muted-foreground">Optional. It stays in this browser. No login and no password.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">Username
              <input className={`${input} h-12`} value={t.username} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="yourname" onChange={(e) => setT({ ...t, username: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">Name field
              <input className={`${input} h-12`} value={t.name} autoComplete="off" placeholder="The bold line under your photo" onChange={(e) => setT({ ...t, name: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
              <span className="flex justify-between">Bio <span className={`font-normal tabular-nums ${bioLen > 150 ? "text-[#B4342A]" : "text-muted-foreground"}`}>{bioLen} / 150</span></span>
              <textarea className={`${input} min-h-28 py-3`} value={t.bio} placeholder="Copy your bio from Instagram and paste it here" onChange={(e) => setT({ ...t, bio: e.target.value })} />
            </label>
          </div>
          {hints.length > 0 && (
            <ul className="mt-4 grid gap-2" aria-live="polite">
              {hints.map((h) => (
                <li key={h.line} className="flex gap-2.5 text-sm">
                  {h.ok ? <CheckCircle2Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-[#1D6B3F]" /> : <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-[#B4342A]" />}
                  <span>{h.line}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {GROUPS.map((g) => (
          <section key={g} aria-labelledby={`pr-${g}`}>
            <h2 id={`pr-${g}`} className="text-2xl font-semibold tracking-tight">{g}</h2>
            <ul className="mt-3">
              {CHECKS.filter((c) => c.group === g).map((c) => {
                const s = srcOf(c);
                return (
                  <li key={c.id} className="border-t py-5">
                    <fieldset className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
                      <div>
                        <legend className="float-left w-full font-medium">{c.q}</legend>
                        <p className="clear-both pt-1 text-sm text-muted-foreground">
                          {c.why}{" "}
                          {s ? <a href={s.url} target="_blank" rel="noopener" className="text-brand underline underline-offset-2">Source</a> : <span className="text-xs">(Good practice. No published rule.)</span>}
                        </p>
                        {a[c.id] === "no" && <p className="mt-2 text-sm font-medium">Fix: {c.fix}</p>}
                      </div>
                      <div className="flex gap-1.5">
                        {OPTS.map(([v, label]) => (
                          <label key={v} className={`pill ${a[c.id] === v ? "pill-on" : ""}`}>
                            <input type="radio" name={c.id} value={v} checked={a[c.id] === v} onChange={() => setA({ ...a, [c.id]: v })} className="sr-only" />
                            {label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start" aria-live="polite">
        <div className="rounded-3xl border bg-white p-6 sm:p-8">
          <p className="text-sm text-muted-foreground">Your profile</p>
          {r.score === null ? (
            <>
              <p className="font-display mt-1 text-5xl leading-none font-bold tracking-[-0.04em] text-foreground/25">?<span className="text-2xl">/10</span></p>
              <p className="mt-3 text-muted-foreground">{left > 0 ? `Answer ${left} more with Yes or No to see your score.` : "Answer Yes or No to see your score."}</p>
            </>
          ) : (
            <>
              <p className="font-display mt-1 text-7xl leading-none font-bold tracking-[-0.04em] tabular-nums">{r.score.toFixed(1)}<span className="text-3xl text-muted-foreground">/10</span></p>
              <p className="mt-2 text-xl font-semibold tracking-tight">{r.label}</p>
            </>
          )}
          <p className="mt-3 text-sm text-muted-foreground tabular-nums">{r.answered} of {r.total} answered</p>

          <div className="mt-6 grid gap-2.5">
            {r.groups.map((g) => (
              <div key={g.name} className="grid grid-cols-[6rem_1fr_2.5rem] items-center gap-3 text-sm">
                <span className="text-muted-foreground">{g.name}</span>
                <span className="h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-foreground transition-[width] duration-300" style={{ width: `${(g.score ?? 0) * 10}%` }} /></span>
                <span className="text-right tabular-nums">{g.score === null ? "?" : g.score.toFixed(1)}</span>
              </div>
            ))}
          </div>

          {r.fixes.length > 0 && (
            <div className="mt-7 border-t pt-6">
              <h3 className="text-lg font-semibold tracking-tight">Fix this first</h3>
              <p className="mt-2 font-medium">{r.fixes[0].fix}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.fixes[0].why}</p>
              {r.fixes.length > 1 && (
                <>
                  <h3 className="mt-6 text-sm font-medium text-muted-foreground">Then, in this order</h3>
                  <ol className="mt-2 grid list-decimal gap-2 pl-5 text-sm">
                    {r.fixes.slice(1, 6).map((c) => <li key={c.id}>{c.fix}</li>)}
                  </ol>
                  {r.fixes.length > 6 && <p className="mt-2 text-sm text-muted-foreground">And {r.fixes.length - 6} more, marked on the left.</p>}
                </>
              )}
            </div>
          )}
          {r.unsure.length > 0 && (
            <p className="mt-6 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
              You were not sure about {r.unsure.length}. They are left out of the score. <a href={href("/connect/")} className="font-medium text-foreground underline underline-offset-2">Your free report</a> answers the ones about your posts from your real numbers.
            </p>
          )}
          <div className="mt-7 border-t pt-6">
            <ClaudeButton label="Rewrite my profile with Claude" prompt={claudePrompt(t, r.fixes.map((c) => c.q.replace(/\?$/, "") + ": no"), r.score)} />
          </div>
          <p className="mt-5 text-xs text-muted-foreground">A guide built on what Instagram has published. Instagram does not publish its weights, so this is not its real algorithm.</p>
        </div>
      </aside>
    </div>
  );
}
