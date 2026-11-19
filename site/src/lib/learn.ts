/* Learns from your own report. When you run the free report, it saves (only in your browser) how each kind of post
   did against your own usual post: format, length, day, time and hashtags. The Post Checker then adds that to its score,
   so every new post is rated for your audience, not an average account. */
import { checkPost, type Post, type Finding, type Result } from "./checker.ts";

export type Group = { value: string; posts: number; median_score: number | null; thin?: boolean };
export type Learned = { handle: string; posts: number; date: string; groups: Partial<Record<"type" | "length" | "weekday" | "slot" | "tag", Group[]>> };
export type When = { day: string; hour: number | null };
export const LEARN_KEY = "cgs-learned";
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function slotOf(h: number | null) {
  if (h === null) return null;
  if (h >= 5 && h < 12) return "morning (5-12)";
  if (h >= 12 && h < 17) return "afternoon (12-5 pm)";
  if (h >= 17 && h < 21) return "evening (5-9 pm)";
  if (h >= 21) return "night (9 pm-12)";
  return "late night (12-5 am)";
}
export function durBucket(s: number) { return s <= 15 ? "up to 15 s" : s <= 30 ? "16-30 s" : s <= 60 ? "31-60 s" : s <= 180 ? "1-3 min" : "over 3 min"; }
export function loadLearned(): Learned | null {
  try { const l = JSON.parse(localStorage.getItem(LEARN_KEY) || "null"); return l && l.groups && l.posts ? l : null; } catch { return null; }
}

const TYPE_WORD: Record<string, string> = { reel: "Reels", carousel: "Carousels", photo: "Photos" };
const times = (m: number) => `${(m / 100).toFixed(m >= 195 ? 0 : 1)}×`;

/* One finding per factor the report has enough posts for (3 or more). 100 means "your usual post".
   Each factor moves the score by up to 6 points, all of them together by up to 15. */
export function personal(p: Post, when: When, l: Learned | null) {
  if (!l) return { points: 0, findings: [] as Finding[] };
  const pick = (k: keyof Learned["groups"], v: string | null) => (v ? (l.groups[k] || []).find((g) => g.value === v && !g.thin && g.median_score !== null) : undefined);
  const out: Finding[] = [];
  const add = (g: Group | undefined, what: string) => {
    if (!g || g.median_score === null) return;
    const m = g.median_score, pts = Math.max(-6, Math.min(6, Math.round((m - 100) / 10)));
    const ok = m >= 100;
    out.push({ ok, points: pts, title: `${what}: ${ok ? "works" : "weaker"} on your account`,
      why: `On your ${g.posts} posts like this, the score was ${times(m)} your usual post.`, fix: ok ? undefined : "Your own numbers say this does less well for you. Try your best option instead, or test it once and compare.", surface: ["Reels", "Explore", "Feed"] });
  };
  add(pick("type", p.format), TYPE_WORD[p.format]);
  if (p.format === "reel") add(pick("length", durBucket(p.length)), `Reels of ${durBucket(p.length)}`);
  if (when.day) add(pick("weekday", when.day), `Posting on ${when.day}`);
  const sl = slotOf(when.hour); if (sl) add(pick("slot", sl), `Posting in the ${sl.split(" (")[0]}`);
  const tags = (p.caption.match(/#[\p{L}\p{N}_]+/gu) || []).map((t) => t.slice(1).toLowerCase());
  const tagGroups = tags.map((t) => pick("tag", t)).filter(Boolean) as Group[];
  if (tagGroups.length) { const best = tagGroups.sort((a, b) => (b.median_score || 0) - (a.median_score || 0))[0]; add(best, `#${best.value}`); }
  const points = Math.max(-15, Math.min(15, out.reduce((s, f) => s + f.points, 0)));
  return { points, findings: out };
}

const CAPTION_TITLES = /send it|reason to send|reason to save|invites comments|hashtag|first line/i;
export type Scored = Result & { out10: number; caption10: number; mine: Finding[]; learnedFrom: Learned | null };

export function scorePost(p: Post, when: When, l: Learned | null): Scored {
  const r = checkPost(p);
  const me = personal(p, when, l);
  const score = Math.max(0, Math.min(100, r.score + me.points));
  const label = score >= 85 ? "Ready to post" : score >= 70 ? "Good, a few fixes" : score >= 50 ? "Needs work" : "Fix before posting";
  const capPts = r.findings.filter((f) => CAPTION_TITLES.test(f.title)).reduce((s, f) => s + f.points, 0);
  const caption10 = Math.max(0, Math.min(10, Math.round((3 + (capPts * 7) / 26) * 10) / 10));
  const findings = [...me.findings, ...r.findings].sort((a, b) => Number(a.ok) - Number(b.ok) || a.points - b.points);
  return { ...r, score, label, findings, out10: Math.round(score) / 10, caption10, mine: me.findings, learnedFrom: l };
}
