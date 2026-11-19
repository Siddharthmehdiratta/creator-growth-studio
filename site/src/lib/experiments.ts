/* The experiment engine. Your report tells you what your account already does. This tells you what to try next.
   One rule runs the whole thing: change one thing at a time. Change five and a win tells you nothing about which
   one caused it. Every experiment names the one variable, the number that counts as a win, and how many posts it
   needs before the answer means anything. A difference inside the noise is not a result, and this says so. */
import type { Learned, Group } from "./learn.ts";
import { DAYS } from "./learn.ts";

export const EXP_KEY = "cgs-experiments";

export type Variable = "type" | "length" | "weekday" | "slot" | "tag" | "hook" | "cta";
export type Experiment = {
  id: string;
  variable: Variable;
  title: string;          // what to change, in one line
  change: string;         // the thing you do differently
  hold: string;           // what must stay the same
  posts: number;          // how many posts before the answer counts
  baseline: number;       // the score to beat, 100 = your usual post
  win: number;            // the number that counts as a win
  why: string;            // why this one is worth your time
  rank: number;           // how much it could move, used for ordering
};
export type Run = { id: string; scores: number[] };
export type Verdict = {
  state: "won" | "lost" | "no difference" | "keep going";
  line: string;
  median: number | null;
  done: number;
  needed: number;
};

/* How big a gap has to be before it means anything. Three posts can swing a long way on luck alone, so three posts
   have to show a big gap. Eight posts can show a small one. These are rules of thumb, not statistics, and the app
   says so on screen. */
export function threshold(n: number) {
  if (n >= 8) return 1.1;
  if (n >= 5) return 1.15;
  return 1.25;
}
export function median(xs: number[]) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const usable = (g: Group) => !g.thin && g.median_score !== null;
const best = (gs: Group[] = []) => gs.filter(usable).sort((a, b) => (b.median_score || 0) - (a.median_score || 0))[0];
const mostUsed = (gs: Group[] = []) => [...gs].sort((a, b) => b.posts - a.posts)[0];
const times = (m: number) => `${(m / 100).toFixed(m >= 195 ? 0 : 1)}×`;

const SLOTS = ["morning (5-12)", "afternoon (12-5 pm)", "evening (5-9 pm)", "night (9 pm-12)"];
const TYPES = ["reel", "carousel", "image"];
const TYPE_WORD: Record<string, string> = { reel: "Reels", carousel: "carousels", image: "photos", photo: "photos" };

/* Builds the list of experiments worth running, strongest first. Three sources, in this order of usefulness:
   a gap your own numbers already show, an option you have never tried, and the caption variables no report can
   see. The caption ones are always offered because they cost nothing to test. */
export function planExperiments(l: Learned | null): Experiment[] {
  const out: Experiment[] = [];
  const add = (e: Omit<Experiment, "win"> & { win?: number }) =>
    out.push({ ...e, win: e.win ?? Math.round(e.baseline * threshold(e.posts)) });

  if (l) {
    const g = l.groups;

    // 1. A gap your own posts already show: you mostly do one thing, something else scores better.
    const gaps: { k: Variable; label: (v: string) => string; hold: string; gs?: Group[] }[] = [
      { k: "type", label: (v) => `Post ${TYPE_WORD[v] || v} instead`, hold: "same subject, same caption style", gs: g.type },
      { k: "slot", label: (v) => `Post in the ${v.split(" (")[0]}`, hold: "same format, same kind of post", gs: g.slot },
      { k: "weekday", label: (v) => `Post on ${v}`, hold: "same format, same time of day", gs: g.weekday },
      { k: "length", label: (v) => `Make your Reels ${v}`, hold: "same subject, same hook", gs: g.length },
    ];
    for (const { k, label, hold, gs } of gaps) {
      const b = best(gs), u = mostUsed(gs);
      if (!b || !u || b.value === u.value || u.median_score === null) continue;
      const lift = (b.median_score || 0) - u.median_score;
      if (lift < 15) continue; // too small a gap to be worth a month of posting
      add({
        id: `gap-${k}-${b.value}`, variable: k, rank: lift,
        title: label(b.value),
        change: `For the next few posts, ${label(b.value).toLowerCase()}.`,
        hold: `Keep everything else the same: ${hold}.`,
        posts: b.posts >= 6 ? 5 : 6,
        baseline: Math.round(u.median_score),
        why: `Most of your posts are ${k === "type" ? TYPE_WORD[u.value] || u.value : u.value}, scoring ${times(u.median_score)} your usual. Your ${b.posts} posts at ${b.value} scored ${times(b.median_score || 0)}. That gap is worth testing on purpose instead of by accident.`,
      });
    }

    // 2. Something you have never tried. No data is not the same as bad.
    const untried = (gs: Group[] = [], all: string[]) => all.filter((v) => !gs.some((x) => x.value === v && x.posts >= 3));
    for (const v of untried(g.type, TYPES).slice(0, 1))
      add({ id: `new-type-${v}`, variable: "type", rank: 12, title: `Try ${TYPE_WORD[v]}, you have none to judge`,
        change: `Post 4 ${TYPE_WORD[v]} over the next few weeks.`, hold: "Same subjects you already post about.", posts: 4, baseline: 100,
        why: `Your report has fewer than 3 ${TYPE_WORD[v]} to score, so nothing here can tell you whether they work for you. Four posts settles it.` });
    for (const v of untried(g.slot, SLOTS).slice(0, 1))
      add({ id: `new-slot-${v}`, variable: "slot", rank: 10, title: `Try posting in the ${v.split(" (")[0]}`,
        change: `Post 4 times in the ${v.split(" (")[0]}.`, hold: "Same format and same kind of post as usual.", posts: 4, baseline: 100,
        why: `You have almost never posted in the ${v.split(" (")[0]}. An untested slot is not a bad slot, it is an unknown one.` });
  }

  // 3. Caption variables. No report can see these, so they are always worth a run.
  add({ id: "hook-question", variable: "hook", rank: 9, title: "Open with a question instead of a statement",
    change: "Start the first line with a question your audience would answer in their head.",
    hold: "Same format, same posting time, same subject.", posts: 5, baseline: 100,
    why: "The first line decides whether anyone reads the rest. It is the cheapest thing on the list to change and nothing in your report measures it." });
  add({ id: "cta-send", variable: "cta", rank: 8, title: "Ask for a send instead of a like",
    change: "End with one line asking people to send the post to someone specific.",
    hold: "Same first line, same format, same time.", posts: 5, baseline: 100,
    why: "Sends per reach is one of the three signals Instagram has said it weighs, and sends count for more than likes when reaching people who do not follow you." });

  return out.sort((a, b) => b.rank - a.rank);
}

/* Reads a run and says where it stands. It will say "no difference" rather than pick a winner out of noise, and it
   will not call anything at all before the posts are in. */
export function verdict(e: Experiment, run: Run | undefined): Verdict {
  const scores = run?.scores || [];
  const done = scores.length, needed = e.posts, m = median(scores);
  if (done < needed)
    return { state: "keep going", done, needed, median: m,
      line: `${done} of ${needed} posts in.${m !== null ? ` Running median ${times(m)} your usual, which does not count yet.` : ""}` };
  const t = threshold(done), hi = e.baseline * t, lo = e.baseline / t;
  if (m === null) return { state: "keep going", done, needed, median: m, line: "No scores recorded yet." };
  if (m >= hi) return { state: "won", done, needed, median: m,
    line: `${times(m)} your usual against ${times(e.baseline)} before, over ${done} posts. Make this your new normal, then test the next thing against it.` };
  if (m <= lo) return { state: "lost", done, needed, median: m,
    line: `${times(m)} against ${times(e.baseline)} before. Go back to what you were doing and test something else.` };
  return { state: "no difference", done, needed, median: m,
    line: `Not worth acting on: ${times(m)} against ${times(e.baseline)}, which is inside what ${done} posts can swing on luck alone. Keep whichever is easier for you.` };
}

export function loadRuns(): Record<string, Run> {
  try { return JSON.parse(localStorage.getItem(EXP_KEY) || "{}") || {}; } catch { return {}; }
}
export function saveRuns(r: Record<string, Run>) {
  try { localStorage.setItem(EXP_KEY, JSON.stringify(r)); } catch { /* private browsing */ }
}
export { DAYS };
