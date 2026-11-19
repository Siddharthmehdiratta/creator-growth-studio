/* Profile review: scores a whole Instagram profile, not one post.
   A guide, not Instagram's algorithm. A check cites a source only when Instagram or a named study has said it.
   The rest are marked as good practice, so nobody mistakes a habit for a published rule. */
import { SOURCES, type SourceKey } from "./checker.ts";

export const SEARCH_SRC = { name: "Instagram: how Search works", url: "https://about.instagram.com/blog/announcements/break-down-how-instagram-search-works/" };

export type Answer = "yes" | "no" | "unsure";
export type Check = { id: string; group: "First look" | "Your posts" | "Your habits"; q: string; why: string; fix: string; w: number; src?: SourceKey | "search" };

export const CHECKS: Check[] = [
  { id: "pro", group: "First look", q: "Is it a professional account (Creator or Business)?", why: "You need one for Insights and trial reels, and for your posts to show on Google.", fix: "Open Settings, then Account type and tools, then Switch to professional account. It is free.", w: 8, src: "google" },
  { id: "name", group: "First look", q: "Does your name field say what you post about?", why: "Search matches on text. The name field is one of the places it looks.", fix: "Add your topic after your name, for example \"Asha | Home workouts\".", w: 7, src: "search" },
  { id: "bio", group: "First look", q: "Does your bio say who it is for and what they get?", why: "Instagram says to put keywords about who you are and what the profile is about in the bio.", fix: "Write one line: who it is for, what they get, how often.", w: 9, src: "search" },
  { id: "cta", group: "First look", q: "Does your bio ask for one thing only?", why: "A visitor with one clear next step is more likely to take it than a visitor with five.", fix: "Keep one ask: follow, watch the series, or tap the link. Remove the rest.", w: 5 },
  { id: "link", group: "First look", q: "Does your link go somewhere useful?", why: "The link is the only way off Instagram to something you own.", fix: "Point it at one page: your shop, booking page, channel or newsletter.", w: 4 },
  { id: "pinned", group: "First look", q: "Are your 3 best posts pinned?", why: "The top row is the first thing a new visitor sees.", fix: "Pin three posts that each show a different reason to follow.", w: 7 },
  { id: "highlights", group: "First look", q: "Do you have highlights that answer common questions?", why: "They answer a visitor before they leave to ask.", fix: "Make three: Start here, Best of, and Questions.", w: 4 },

  { id: "niche", group: "Your posts", q: "Do about 8 in 10 posts serve the same audience?", why: "Instagram recommends posts to people who liked similar ones. A clear topic makes that match easier.", fix: "Pick the one audience your best posts reached. Make the next 10 posts for them.", w: 9, src: "ranking" },
  { id: "hook", group: "Your posts", q: "Does the first second show movement, a face or a bold line?", why: "Watch time is the signal Instagram's head names first.", fix: "Start on the result or the most surprising moment. Cut the intro.", w: 10, src: "signals" },
  { id: "subtitles", group: "Your posts", q: "Do your videos have text on screen or subtitles?", why: "Many people watch with the sound off.", fix: "Turn on captions in the Reels editor before you post.", w: 5 },
  { id: "original", group: "Your posts", q: "Is everything you post your own?", why: "Instagram ranks original content above reposts.", fix: "Stop reposting. Film your own take on the idea.", w: 8, src: "ranking" },
  { id: "sendable", group: "Your posts", q: "Would someone send your posts to a friend?", why: "Sends per person reached is a top signal for reaching people who do not follow you.", fix: "Make the post useful to one kind of person, then say who to send it to.", w: 9, src: "signals" },
  { id: "hashtags", group: "Your posts", q: "Do you use 5 hashtags or fewer?", why: "Instagram caps hashtags at 5 per post.", fix: "Keep 3 to 5 that name the topic exactly.", w: 3, src: "hashtags" },
  { id: "seo", group: "Your posts", q: "Do your captions use the words people search for?", why: "Search reads captions, and public professional posts can show on Google.", fix: "Say what the post is about in plain words in the first line.", w: 4, src: "search" },

  { id: "consistent", group: "Your habits", q: "Do you post 3 or more times most weeks?", why: "In Buffer's study of 2 million posts, 3 to 5 a week more than doubled follower growth against 1 to 2.", fix: "Pick three days you can keep for 12 weeks. Put them in your calendar.", w: 7, src: "frequency" },
  { id: "reply", group: "Your habits", q: "Do you reply to comments in the first hour?", why: "Replies keep a conversation going while the post is still being shown.", fix: "Set a 20-minute timer after you post. Reply to every comment in it.", w: 5 },
  { id: "stories", group: "Your habits", q: "Do you post stories most days?", why: "People who watch your stories see more of your posts.", fix: "Post one story a day. A poll or a question counts.", w: 4 },
  { id: "collab", group: "Your habits", q: "Do you do a collab post at least once a month?", why: "A collab post shows on both accounts, so a new audience sees you.", fix: "Message one creator your size this week with a specific idea.", w: 6 },
  { id: "trial", group: "Your habits", q: "Do you test new ideas with trial reels?", why: "A trial reel goes to people who do not follow you first, so a bad test does not reach your followers.", fix: "Turn on Trial when you post your next new idea.", w: 5, src: "trial" },
];

export const GROUPS = ["First look", "Your posts", "Your habits"] as const;
export const srcOf = (c: Check) => (c.src ? (c.src === "search" ? SEARCH_SRC : SOURCES[c.src]) : null);

export type Text = { username: string; name: string; bio: string };
export type Hint = { ok: boolean; line: string };

/* What can be read straight from the pasted text. These are hints. They do not change the score. */
export function readText(t: Text): Hint[] {
  const out: Hint[] = [];
  const bio = t.bio.trim(), name = t.name.trim(), user = t.username.trim().replace(/^@/, "");
  if (bio) {
    const n = [...bio].length;
    out.push(n > 150 ? { ok: false, line: `Your bio is ${n} characters. Instagram allows 150, so ${n - 150} will be cut.` } : { ok: true, line: `Your bio is ${n} of 150 characters.` });
    const asks = (bio.toLowerCase().match(/\b(follow|dm|message|link|tap|click|shop|book|subscribe|watch|join|download|order)\b/g) || []);
    const kinds = new Set(asks).size;
    if (kinds === 0) out.push({ ok: false, line: "Your bio does not ask the visitor to do anything." });
    else if (kinds > 2) out.push({ ok: false, line: `Your bio asks for ${kinds} different things. Keep one.` });
    else out.push({ ok: true, line: "Your bio has a clear next step." });
  }
  if (name && user) {
    const flat = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (flat(name) === flat(user)) out.push({ ok: false, line: "Your name field repeats your username. That is a searchable field with nothing new in it." });
  }
  if (name && name.split(/\s+/).length === 1 && name.length < 12) out.push({ ok: false, line: "Your name field is one word. Add what you post about after it." });
  return out;
}

export type Review = {
  answered: number; total: number; score: number | null; label: string;
  groups: { name: string; score: number | null }[];
  fixes: Check[]; unsure: Check[];
};

/* Score = weight of the yes answers over the weight of everything answered yes or no.
   "Not sure" is left out of the score and listed, because guessing it either way would be made up.
   No score until 6 answers, so three easy yeses cannot read as 10 out of 10. */
export const MIN_ANSWERS = 6;
export function review(a: Record<string, Answer>): Review {
  const known = CHECKS.filter((c) => a[c.id] === "yes" || a[c.id] === "no");
  const ratio = (cs: Check[]) => {
    const w = cs.reduce((s, c) => s + c.w, 0);
    return w ? cs.filter((c) => a[c.id] === "yes").reduce((s, c) => s + c.w, 0) / w : null;
  };
  const r = known.length >= MIN_ANSWERS ? ratio(known) : null;
  const score = r === null ? null : Math.round(r * 100) / 10;
  const label = score === null ? "" : score >= 8.5 ? "Strong. Keep it up." : score >= 6.5 ? "Good, with a few gaps." : score >= 4 ? "Halfway. The fixes below matter." : "Early days. Start with the first fix.";
  return {
    answered: CHECKS.filter((c) => a[c.id]).length, total: CHECKS.length, score, label,
    groups: GROUPS.map((g) => { const cs = known.filter((c) => c.group === g); const x = cs.length >= 2 ? ratio(cs) : null; return { name: g, score: x === null ? null : Math.round(x * 100) / 10 }; }),
    fixes: CHECKS.filter((c) => a[c.id] === "no").sort((x, y) => y.w - x.w),
    unsure: CHECKS.filter((c) => a[c.id] === "unsure"),
  };
}

export const PROFILE_KEY = "cgs-profile";
export type Saved = { a: Record<string, Answer>; t: Text };
export function loadProfile(): Saved | null {
  try { const s = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); return s && s.a && s.t ? s : null; } catch { return null; }
}
export function saveProfile(s: Saved) { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(s)); } catch { /* private mode: nothing to save */ } }
