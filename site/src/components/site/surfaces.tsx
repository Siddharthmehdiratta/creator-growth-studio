"use client";
import { useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";

type S = { id: string; name: string; who: string; signals: string[]; predicts: string[]; doThis: string[]; avoid: string[] };
const DATA: S[] = [
  { id: "reels", name: "Reels", who: "Mostly people who don't follow you yet. Built to entertain.",
    signals: ["What you've liked, saved, shared and commented on before", "Your history with the person who posted", "The reel itself: audio, visuals and how popular it is", "The person who posted: followers and engagement"],
    predicts: ["Reshare it", "Watch to the end", "Like it", "Visit the audio page"],
    doThis: ["Make the first second earn the second", "Give people a reason to send it to a friend", "Use your own sound or a trending one", "Keep it as short as the story allows"],
    avoid: ["Watermarks from other apps", "Low resolution", "Muted video", "Borders", "Mostly text", "Reposting what's already on Instagram"] },
  { id: "explore", name: "Explore", who: "People who don't follow you, browsing for something new.",
    signals: ["The post itself: how popular it is and how fast people engage (matters much more here)", "What the viewer has done in Explore before", "Their history with you", "Information about you"],
    predicts: ["Like it", "Save it", "Share it"],
    doThis: ["Make posts worth saving: guides, lists, how-tos", "Use 3 to 5 specific hashtags", "Write a first line that says what it's about"],
    avoid: ["Anything that breaks Instagram's Recommendation Guidelines: it stays up but isn't recommended"] },
  { id: "feed", name: "Feed", who: "Mostly your followers, plus some suggested posts.",
    signals: ["What the viewer has liked, shared, saved and commented on", "The post: how popular, how fast people engage, when it was posted, location", "You: how many people interacted with you in recent weeks", "Their history with you, like commenting on each other's posts"],
    predicts: ["Spend a few seconds on it", "Comment", "Like", "Share", "Tap your profile photo"],
    doThis: ["Reply to comments, especially in the first hour", "Ask a question people want to answer", "Post when your followers are online"],
    avoid: ["Posting many times in a row: Instagram avoids showing too many posts from one person back to back"] },
  { id: "stories", name: "Stories", who: "Your closest followers: the people who watch and reply.",
    signals: ["Viewing history: whose stories they usually watch", "Engagement history: likes and DMs", "Closeness: are you friends or family"],
    predicts: ["Tap into your story", "Reply to it", "Skip to the next one"],
    doThis: ["Use stickers and questions that invite replies", "Post stories most days so people keep watching", "Share your new posts to stories"],
    avoid: ["Long text slides people skip"] },
];

export function SurfaceExplorer() {
  const [cur, setCur] = useState("reels");
  const s = DATA.find((d) => d.id === cur)!;
  return (
    <div className="rounded-3xl border bg-background shadow-xl shadow-primary/5">
      <div role="tablist" aria-label="Parts of Instagram" className="flex gap-1 overflow-x-auto border-b p-2">
        {DATA.map((d) => (
          <button key={d.id} role="tab" aria-selected={cur === d.id} onClick={() => setCur(d.id)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${cur === d.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{d.name}</button>
        ))}
      </div>
      <div role="tabpanel" className="grid gap-8 p-6 sm:p-9 lg:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Who sees it</p>
          <p className="mt-1 text-lg font-medium">{s.who}</p>
          <p className="mt-7 text-sm text-muted-foreground">What Instagram looks at, roughly most important first</p>
          <ol className="mt-3 grid gap-2.5">{s.signals.map((x, i) => <li key={x} className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span><span>{x}</span></li>)}</ol>
          <p className="mt-7 text-sm text-muted-foreground">What it tries to predict you'll do</p>
          <div className="mt-3 flex flex-wrap gap-2">{s.predicts.map((x) => <span key={x} className="rounded-full border px-3 py-1 text-sm">{x}</span>)}</div>
        </div>
        <div className="grid content-start gap-4">
          <div className="rounded-2xl bg-[#F3FBF8] p-5"><p className="text-sm font-medium text-[#0B7A5F]">Do this</p><ul className="mt-3 grid gap-2">{s.doThis.map((x) => <li key={x} className="flex gap-2.5 text-sm"><CheckIcon className="mt-0.5 size-4 shrink-0 text-[#0E9E84]" />{x}</li>)}</ul></div>
          <div className="rounded-2xl bg-[#FDF2F3] p-5"><p className="text-sm font-medium text-[#B42336]">Gets shown less</p><ul className="mt-3 grid gap-2">{s.avoid.map((x) => <li key={x} className="flex gap-2.5 text-sm"><XIcon className="mt-0.5 size-4 shrink-0 text-[#D9384A]" />{x}</li>)}</ul></div>
        </div>
      </div>
    </div>
  );
}
