"use client";
import { useState } from "react";
import { ClaudeButton } from "./claude-button";

type H = { title: string; text: string; prompt: (v: V) => string };
type V = { niche: string; handle: string; draft: string };
const coach = "You are a friendly Instagram growth coach. Use plain English, short lines, and Indian English spelling.";
const HELPERS: H[] = [
  { title: "Write a caption", text: "A plain first line people search for, a send-this line, and up to 5 hashtags.", prompt: (v) => `${coach}\nWrite 3 caption options for this post in the ${v.niche} niche:\n"""${v.draft}"""\nEach caption: a plain first line that says what it's about, 2 to 3 short lines, a "send this to the friend who…" line, and 3 to 5 specific hashtags (never more than 5).` },
  { title: "10 hooks for the first second", text: "Openers that stop the scroll: face, result first, or a question.", prompt: (v) => `${coach}\nGive me 10 hooks for the first second of a reel about:\n"""${v.draft}"""\nNiche: ${v.niche}. Mix: 4 face-to-camera lines, 3 "result first" openers, 3 questions. Max 8 words each.` },
  { title: "Script a 30-second reel", text: "Shot by shot, with on-screen text and what to say.", prompt: (v) => `${coach}\nScript a 25 to 30 second reel about:\n"""${v.draft}"""\nNiche: ${v.niche}. Give: the hook (first second), 4 to 6 shots with what I say and the on-screen text, and an ending that asks people to send it to a friend. Keep on-screen text short.` },
  { title: "Reply to my comments", text: "Paste comments; get warm, short replies that start conversations.", prompt: (v) => `${coach}\nHere are comments on my ${v.niche} post. Write a short, warm reply to each that invites another reply. Flag any that should become a new post.\n"""${v.draft || "(paste comments here)"}"""` },
  { title: "Rewrite my bio", text: "Clear niche, a keyword for search, and one reason to follow.", prompt: (v) => `${coach}\nRewrite my Instagram bio${v.handle ? ` for @${v.handle}` : ""}. Niche: ${v.niche}. Current bio:\n"""${v.draft}"""\nGive 3 options under 150 characters, each with the main keyword in the first line and one clear reason to follow. Also suggest a name-field keyword like "Rohan | GTA and BGMI tips".` },
  { title: "20 post ideas for my niche", text: "Ideas built to be sent and saved, with the best format for each.", prompt: (v) => `${coach}\nGive me 20 post ideas for a ${v.niche} creator${v.handle ? ` (@${v.handle})` : ""}. For each: the idea, best format (reel, carousel or photo), a hook, and whether it's built to be sent or saved. Include 4 trial reel ideas to test new angles.` },
  { title: "Plan my month", text: "12 posts over 4 weeks, with days, hooks and hashtags.", prompt: (v) => `${coach}\nPlan 12 Instagram posts over the next 4 weeks for a ${v.niche} creator. For each: day, format, hook, angle, a send-this line, and up to 5 hashtags. Put it in a short table.` },
  { title: "Pitch a brand", text: "A short, honest brand-deal message based on real reach.", prompt: (v) => `${coach}\nWrite a short brand pitch from${v.handle ? ` @${v.handle},` : " me,"} a ${v.niche} creator, to a brand that fits. Use placeholders for my real reach and engagement numbers, never invent numbers. Mention that paid posts will be labelled as ads (ASCI rules in India). Under 120 words.` },
];

export function ClaudeStudio() {
  const [v, setV] = useState<V>({ niche: "gaming", handle: "", draft: "GTA 6 price in India, explained" });
  const field = "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
  return (
    <div>
      <div className="grid gap-4 rounded-3xl border bg-[#FAFAFC] p-6 sm:grid-cols-3 sm:p-8">
        <label className="grid gap-1.5 text-sm font-medium">Your niche<input className={field} value={v.niche} onChange={(e) => setV({ ...v, niche: e.target.value })} /></label>
        <label className="grid gap-1.5 text-sm font-medium">Your username (optional)<input className={field} value={v.handle} onChange={(e) => setV({ ...v, handle: e.target.value.replace(/^@/, "") })} placeholder="lowping.rohan" /></label>
        <label className="grid gap-1.5 text-sm font-medium sm:col-span-3">Your post idea, draft, bio or comments<textarea rows={3} className="w-full rounded-xl border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" value={v.draft} onChange={(e) => setV({ ...v, draft: e.target.value })} /></label>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {HELPERS.map((h) => (
          <div key={h.title} className="flex flex-col rounded-3xl border p-6">
            <h3 className="text-lg font-semibold tracking-tight">{h.title}</h3>
            <p className="mt-1 mb-5 text-sm text-muted-foreground">{h.text}</p>
            <ClaudeButton className="mt-auto" label="Open in Claude" prompt={h.prompt(v)} />
          </div>
        ))}
      </div>
    </div>
  );
}
