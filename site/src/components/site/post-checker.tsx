"use client";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2Icon, CircleAlertIcon, CalendarPlusIcon, InfoIcon, RotateCcwIcon } from "lucide-react";
import { DEFAULT_POST, SOURCES, claudePrompt, type Post } from "@/lib/checker";
import { scorePost, loadLearned, DAYS, type Learned, type When } from "@/lib/learn";
import { ClaudeButton } from "./claude-button";
import { Modal } from "./modal";
import { href } from "@/lib/site";

const seg = "flex flex-wrap gap-1.5";
function Pills<T extends string>({ value, set, opts, name }: { value: T; set: (v: T) => void; opts: [T, string][]; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className={seg}>
      {opts.map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => set(v)}
          className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${value === v ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/40"}`}>{l}</button>
      ))}
    </div>
  );
}
function Toggle({ on, set, label, hint }: { on: boolean; set: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-3 hover:border-primary/40">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="mt-0.5 size-4 accent-[#15131F]" />
      <span><span className="text-sm font-medium">{label}</span>{hint && <span className="block text-xs text-muted-foreground">{hint}</span>}</span>
    </label>
  );
}
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="grid gap-2"><p className="text-sm font-medium">{label}</p>{children}</div>;

export function PostChecker({ compact = false }: { compact?: boolean }) {
  const [p, setP] = useState<Post>(DEFAULT_POST);
  const [saved, setSaved] = useState("");
  useEffect(() => { try { const s = localStorage.getItem("cgs-checker"); if (s) setP({ ...DEFAULT_POST, ...JSON.parse(s) }); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("cgs-checker", JSON.stringify(p)); } catch {} }, [p]);
  const [when, setWhen] = useState<When>({ day: "", hour: null });
  const [learned, setLearned] = useState<Learned | null>(null);
  useEffect(() => { setLearned(loadLearned()); }, []);
  const r = useMemo(() => scorePost(p, when, learned), [p, when, learned]);
  const up = <K extends keyof Post>(k: K) => (v: Post[K]) => setP((x) => ({ ...x, [k]: v }));
  const tone = r.score >= 85 ? "#0E9E84" : r.score >= 70 ? "#15131F" : r.score >= 50 ? "#D98A00" : "#D9384A";

  const addToPlan = () => {
    try {
      const list = JSON.parse(localStorage.getItem("cgs-plan") || "[]");
      list.push({ id: Date.now(), title: p.caption.split("\n")[0].slice(0, 80) || "Untitled post", format: p.format, score: r.out10, date: "", time: "18:00", done: false });
      localStorage.setItem("cgs-plan", JSON.stringify(list)); setSaved("Added to your planner.");
    } catch { setSaved("Your browser blocked saving. Try another browser."); }
  };

  return (
    <div className="grid grid-cols-1 gap-6 [&>*]:min-w-0 lg:grid-cols-[1.1fr_1fr]">
      {/* ---- inputs ---- */}
      <div className="grid content-start gap-6 rounded-3xl border bg-surface p-6 sm:p-8">
        <Field label="What are you posting?"><Pills name="Format" value={p.format} set={up("format")} opts={[["reel", "Reel"], ["carousel", "Carousel"], ["photo", "Photo"]]} /></Field>
        <Field label="Caption, with hashtags">
          <textarea value={p.caption} onChange={(e) => up("caption")(e.target.value)} rows={4} className="w-full rounded-xl border bg-background p-3 text-[0.95rem] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" aria-label="Caption" />
          <p className="text-xs text-muted-foreground">{p.caption.length} characters · {r.hashtags} hashtag{r.hashtags === 1 ? "" : "s"} (Instagram allows 5)</p>
        </Field>
        <Field label="How does the first second open?"><Pills name="Hook" value={p.hook} set={up("hook")} opts={[["face", "My face talking"], ["result", "The result first"], ["question", "A question"], ["text", "Text on screen"], ["none", "No hook"]]} /></Field>
        <Field label="When will you post it? (optional)">
          <div className="grid grid-cols-2 gap-2">
            <select aria-label="Day" value={when.day} onChange={(e) => setWhen((w) => ({ ...w, day: e.target.value }))} className="h-11 rounded-xl border bg-background px-3 text-sm"><option value="">Any day</option>{DAYS.map((d) => <option key={d}>{d}</option>)}</select>
            <select aria-label="Time" value={when.hour ?? ""} onChange={(e) => setWhen((w) => ({ ...w, hour: e.target.value === "" ? null : Number(e.target.value) }))} className="h-11 rounded-xl border bg-background px-3 text-sm"><option value="">Any time</option>{[7, 9, 12, 15, 18, 20, 22].map((h) => <option key={h} value={h}>{`${h % 12 || 12}:00 ${h < 12 ? "am" : "pm"}`}</option>)}</select>
          </div>
        </Field>
        <details className="group rounded-2xl border bg-background p-4 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">More details <span className="text-muted-foreground">(optional, for a sharper score)</span></summary>
          <div className="mt-5 grid gap-6">
        <Field label="Who should see it?"><Pills name="Goal" value={p.goal} set={up("goal")} opts={[["new", "New people"], ["followers", "My followers"]]} /></Field>
        {p.format === "reel" && (
          <Field label={`Length: ${p.length} seconds`}>
            <input type="range" min={5} max={200} step={1} value={p.length} onChange={(e) => up("length")(Number(e.target.value))} className="w-full accent-[#15131F]" aria-label="Reel length in seconds" />
          </Field>
        )}
        {p.format === "reel" && <Field label="Sound"><Pills name="Sound" value={p.audio} set={up("audio")} opts={[["original", "My voice or music"], ["trending", "Trending sound"], ["none", "No sound"]]} /></Field>}
        <div className="grid gap-2 sm:grid-cols-2">
          <Toggle on={p.original} set={up("original")} label="It's my original content" hint="Not a repost of someone else's" />
          <Toggle on={p.sharp} set={up("sharp")} label="Sharp, full quality" hint="1080 pixels wide or more" />
          <Toggle on={p.watermark} set={up("watermark")} label="Has a TikTok or CapCut logo" />
          <Toggle on={p.mostlyText} set={up("mostlyText")} label="Mostly text on screen" />
          {p.format === "reel" && <Toggle on={p.borders} set={up("borders")} label="Black bars or borders" />}
          {p.format === "reel" && <Toggle on={p.subtitles} set={up("subtitles")} label="Has subtitles" />}
          {p.format === "reel" && p.goal === "new" && <Toggle on={p.trial} set={up("trial")} label="Posting as a trial reel" hint="Shown only to non-followers first" />}
        </div>
          </div>
        </details>
        <button type="button" onClick={() => setP(DEFAULT_POST)} className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><RotateCcwIcon className="size-4" />Start again with the example</button>
      </div>

      {/* ---- result ---- */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border bg-background p-6 shadow-xl shadow-primary/5 sm:p-8" aria-live="polite">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Your post</p>
              <p className="font-display text-7xl leading-none font-bold tracking-[-0.04em] tabular-nums" style={{ color: tone }}>{r.out10.toFixed(1)}<span className="text-3xl text-muted-foreground">/10</span></p>
              <p className="mt-2 text-xl font-semibold tracking-tight">{r.label}</p>
            </div>
            <div className="rounded-2xl border px-4 py-3 text-right">
              <p className="text-xs text-muted-foreground">Caption</p>
              <p className="text-2xl font-semibold tabular-nums">{r.caption10.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span></p>
            </div>
          </div>
          <p className="mt-4 rounded-2xl bg-surface p-3 text-sm text-muted-foreground">
            {r.learnedFrom
              ? <>Tuned to {r.learnedFrom.handle ? <b className="text-foreground">@{r.learnedFrom.handle.replace(/^@/, "")}</b> : "your account"}: learned from your {r.learnedFrom.posts} posts on {new Date(r.learnedFrom.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.</>
              : <>Rated on what Instagram has published. <a href={href("/connect/")} className="font-medium text-foreground underline underline-offset-2">Run your free report</a> and this score learns what works for your own audience.</>}
            {" "}<Modal title="How this score works" trigger={<button type="button" className="font-medium text-foreground underline underline-offset-2">How it works</button>}>
              <p>Every post starts at 4 out of 10. Each rule adds or takes away points, and each rule links to where Instagram (or a big study) said it.</p>
              <p className="mt-3">After you run your report, the checker also compares this post with your own past posts: the format, length, day, time and hashtags that did better or worse than your usual post. Only these patterns are saved, in your browser.</p>
              <p className="mt-3">Instagram doesn't publish its real weights, so this is a <b className="text-foreground">guide</b>, not Instagram's actual algorithm.</p>
              <a className="mt-4 inline-block font-medium text-link" href={href("/algorithm/")}>Read how the algorithm works</a>
            </Modal>
          </p>

          <div className="mt-6 grid gap-2.5">
            {(["Reels", "Explore", "Feed"] as const).filter((s) => p.format === "reel" || s !== "Reels").map((s) => (
              <div key={s} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-3 text-sm">
                <span className="text-muted-foreground">{s}</span>
                <span className="h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary transition-all" style={{ width: `${r.surfaces[s]}%` }} /></span>
                <span className="text-right tabular-nums">{r.surfaces[s]}</span>
              </div>
            ))}
          </div>

          <ul className="mt-7 grid gap-3">
            {r.findings.slice(0, compact ? 4 : 20).map((x) => (
              <li key={x.title} className="flex gap-3">
                {x.ok ? <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-[#0E9E84]" /> : <CircleAlertIcon className="mt-0.5 size-5 shrink-0 text-[#D9384A]" />}
                <div className="text-sm">
                  <p className="font-medium">{x.title} <span className="ml-1 text-xs font-normal text-muted-foreground tabular-nums">{x.points > 0 ? `+${(x.points / 10).toFixed(1)}` : (x.points / 10).toFixed(1)}</span></p>
                  <p className="mt-0.5 text-muted-foreground">{x.why}{x.src && <> <a href={SOURCES[x.src].url} target="_blank" rel="noopener" className="text-xs text-link">Source</a></>}</p>
                  {!x.ok && x.fix && <p className="mt-1 font-medium text-foreground">Fix: {x.fix}</p>}
                </div>
              </li>
            ))}
          </ul>

          {!compact && (
            <div className="mt-8 grid gap-3 border-t pt-6">
              <ClaudeButton prompt={claudePrompt(p, r)} />
              <button type="button" onClick={addToPlan} className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-muted"><CalendarPlusIcon className="size-4" />Add to my planner</button>
              {saved && <p role="status" className="text-sm text-[#0B7A5F]">{saved} <a href={href("/planner/")} className="font-medium underline">Open the planner</a></p>}
            </div>
          )}
          {compact && <a href={href("/post-checker/")} className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground">Open the full Post Checker</a>}
        </div>
      </div>
    </div>
  );
}
