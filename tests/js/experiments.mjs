// Experiment engine: run with `node tests/js/experiments.mjs`
import assert from "node:assert/strict";
import { planExperiments, verdict, threshold, median } from "../../site/src/lib/experiments.ts";

const L = { handle: "t", posts: 40, date: "2026-11-19", groups: {
  type: [{ value: "image", posts: 22, median_score: 80 }, { value: "reel", posts: 9, median_score: 160 }],
  slot: [{ value: "night (9 pm-12)", posts: 20, median_score: 90 }, { value: "morning (5-12)", posts: 7, median_score: 140 }],
  weekday: [{ value: "Monday", posts: 12, median_score: 100 }, { value: "Friday", posts: 6, median_score: 112 }],
  length: [{ value: "16-30 s", posts: 6, median_score: 130 }] } };

// median and thresholds
assert.equal(median([]), null); assert.equal(median([3, 1, 2]), 2); assert.equal(median([1, 2, 3, 4]), 2.5);
assert.equal(threshold(3), 1.25); assert.equal(threshold(5), 1.15); assert.equal(threshold(9), 1.1);

// a real gap is proposed, strongest first, and each experiment changes exactly one thing
const plan = planExperiments(L);
assert.ok(plan.length >= 3);
assert.equal(plan[0].variable, "type", "the 80 vs 160 gap is the biggest and should lead");
assert.ok(plan[0].baseline === 80 && plan[0].win > 80);
assert.ok(plan.every((e) => e.hold.length > 0 && e.posts >= 4), "every experiment holds the rest fixed and needs enough posts");
assert.equal(new Set(plan.map((e) => e.id)).size, plan.length, "no duplicate experiments");
assert.ok(plan.some((e) => e.id === "new-type-carousel"), "an untried format is offered");
// a gap under 15 points is not worth a month of posting
assert.ok(!plan.some((e) => e.id === "gap-weekday-Friday"), "the 100 vs 112 weekday gap is too small to propose");
// caption variables are always offered, with or without a report
assert.ok(planExperiments(null).some((e) => e.variable === "hook"));
assert.ok(planExperiments(null).every((e) => e.baseline === 100));

// verdicts
const e = { id: "x", variable: "type", title: "", change: "", hold: "", posts: 5, baseline: 100, win: 115, why: "", rank: 1 };
assert.equal(verdict(e, undefined).state, "keep going");
assert.equal(verdict(e, { id: "x", scores: [200, 200] }).state, "keep going", "never call it before the posts are in");
assert.equal(verdict(e, { id: "x", scores: [160, 170, 150, 180, 165] }).state, "won");
assert.equal(verdict(e, { id: "x", scores: [60, 55, 70, 50, 65] }).state, "lost");
// the whole point: a small gap over few posts is not a result
assert.equal(verdict(e, { id: "x", scores: [105, 108, 102, 110, 104] }).state, "no difference");
assert.match(verdict(e, { id: "x", scores: [105, 108, 102, 110, 104] }).line, /luck alone/);
// more posts make a smaller gap meaningful
const e8 = { ...e, posts: 8 };
assert.equal(verdict(e8, { id: "x", scores: [112, 113, 111, 114, 112, 115, 110, 113] }).state, "won");

console.log("experiments.mjs ok");
