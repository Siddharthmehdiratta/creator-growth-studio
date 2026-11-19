"use client";
import { useEffect, useState } from "react";
import { CalendarDaysIcon, CheckIcon, DownloadIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { ClaudeButton } from "./claude-button";
import { href } from "@/lib/site";

type Item = { id: number; title: string; format: string; date: string; time: string; notes?: string; score?: number; done: boolean };
const pad = (n: number) => String(n).padStart(2, "0");
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

function ics(items: Item[]) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ev = items.filter((i) => i.date).map((i) => {
    const [y, m, d] = i.date.split("-"), [hh, mm] = (i.time || "18:00").split(":");
    const start = `${y}${m}${d}T${hh}${mm}00`;
    const endH = pad((Number(hh) + 1) % 24);
    return ["BEGIN:VEVENT", `UID:cgs-${i.id}@creator-growth-studio`, `DTSTAMP:${stamp}`, `DTSTART:${start}`, `DTEND:${y}${m}${d}T${endH}${mm}00`,
      `SUMMARY:Post: ${i.title.replace(/[,;\n]/g, " ")}`, `DESCRIPTION:${(i.format + (i.notes ? " - " + i.notes : "")).replace(/[,;\n]/g, " ")}`,
      "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:Post goes out in 30 minutes", "END:VALARM", "END:VEVENT"].join("\r\n");
  });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Creator Growth Studio//Planner//EN", ...ev, "END:VCALENDAR"].join("\r\n");
}

export function Planner() {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Item>({ id: 0, title: "", format: "Reel", date: today(), time: "18:00", done: false });
  const [ready, setReady] = useState(false);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("cgs-plan") || "[]")); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem("cgs-plan", JSON.stringify(items)); } catch {} }, [items, ready]);
  const add = () => { if (!draft.title.trim()) return; setItems((x) => [...x, { ...draft, id: Date.now() }]); setDraft({ ...draft, title: "", notes: "" }); };
  const set = (id: number, k: keyof Item, v: unknown) => setItems((x) => x.map((i) => (i.id === id ? { ...i, [k]: v } : i)));
  const sorted = [...items].sort((a, b) => (a.date || "9") .localeCompare(b.date || "9") || a.time.localeCompare(b.time));
  const download = () => { const b = new Blob([ics(items)], { type: "text/calendar" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "my-instagram-plan.ics"; a.click(); };
  const week = sorted.filter((i) => !i.done).length;
  const field = "h-11 rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";

  return (
    <div className="grid grid-cols-1 gap-6 [&>*]:min-w-0 lg:grid-cols-[1fr_22rem]">
      <div className="rounded-3xl border bg-background p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
          <label className="grid gap-1.5 text-sm font-medium">What's the post?<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Part 2: GTA 6 price in India" className={field} /></label>
          <label className="grid gap-1.5 text-sm font-medium">Format<select value={draft.format} onChange={(e) => setDraft({ ...draft, format: e.target.value })} className={field}>{["Reel", "Carousel", "Photo", "Story", "Trial reel"].map((f) => <option key={f}>{f}</option>)}</select></label>
          <label className="grid gap-1.5 text-sm font-medium">Day<input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className={field} /></label>
          <label className="grid gap-1.5 text-sm font-medium">Time<input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} className={field} /></label>
        </div>
        <button type="button" onClick={add} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"><PlusIcon className="size-4" />Add to plan</button>

        <div className="mt-8">
          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground"><CalendarDaysIcon className="mx-auto size-6" /><p className="mt-3">Your plan is empty. Add a post above, or send one from the <a className="font-medium text-link" href={href("/post-checker/")}>Post Checker</a>.</p></div>
          ) : (
            <ul className="divide-y rounded-2xl border">
              {sorted.map((i) => (
                <li key={i.id} className={`flex flex-wrap items-center gap-3 p-4 ${i.done ? "opacity-55" : ""}`}>
                  <button type="button" onClick={() => set(i.id, "done", !i.done)} aria-label={i.done ? "Mark as not posted" : "Mark as posted"} className={`grid size-7 shrink-0 place-items-center rounded-full border ${i.done ? "border-primary bg-primary text-primary-foreground" : ""}`}>{i.done && <CheckIcon className="size-4" />}</button>
                  <div className="min-w-0 flex-1"><p className={`truncate font-medium ${i.done ? "line-through" : ""}`}>{i.title}</p><p className="text-xs text-muted-foreground">{i.format}{i.score != null && ` · checked ${i.score}/100`}</p></div>
                  <input type="date" value={i.date} onChange={(e) => set(i.id, "date", e.target.value)} aria-label="Day" className="h-9 rounded-lg border px-2 text-sm" />
                  <input type="time" value={i.time} onChange={(e) => set(i.id, "time", e.target.value)} aria-label="Time" className="h-9 rounded-lg border px-2 text-sm" />
                  <button type="button" onClick={() => setItems((x) => x.filter((y) => y.id !== i.id))} aria-label="Remove" className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><Trash2Icon className="size-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <aside className="grid content-start gap-4">
        <div className="rounded-3xl border bg-surface p-6">
          <p className="text-4xl font-semibold tabular-nums tracking-tight">{week}</p><p className="text-sm text-muted-foreground">posts still to go</p>
          <p className="mt-4 text-sm text-muted-foreground">Buffer's study of 2 million posts found 3 to 5 posts a week more than doubled follower growth compared with 1 to 2.</p>
          <button type="button" onClick={download} disabled={!items.length} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#15131F] text-sm font-medium text-white disabled:opacity-40"><DownloadIcon className="size-4" />Add reminders to my calendar</button>
          <p className="mt-2 text-xs text-muted-foreground">Works with Google Calendar, Apple Calendar and Outlook. Each post reminds you 30 minutes before.</p>
        </div>
        <div className="rounded-3xl border p-6">
          <p className="font-medium">Want it to post by itself?</p>
          <p className="mt-2 text-sm text-muted-foreground">Instagram lets professional accounts schedule posts in the app, and Meta Business Suite has a Planner. Use your times from here. Automatic posting from this site comes once our Instagram connection is approved by Meta.</p>
        </div>
        <div className="rounded-3xl border p-6">
          <p className="font-medium">Fill my month with Claude</p>
          <p className="mt-2 mb-4 text-sm text-muted-foreground">Claude drafts 12 post ideas around your niche, ready to add here.</p>
          <ClaudeButton label="Plan my month" prompt={"You are an Instagram growth coach. My niche is: [write your niche]. My best format is: [Reels / carousels]. Plan 12 posts for the next 4 weeks (3 a week). For each: day, a hook for the first second, the angle, a \"send this to\" line, and up to 5 specific hashtags. Include 2 trial reel ideas. Keep it in a short table."} />
        </div>
      </aside>
    </div>
  );
}
