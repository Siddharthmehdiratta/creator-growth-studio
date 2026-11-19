// Learning layer: run with `node tests/js/learn.mjs`
import assert from "node:assert/strict";
import { scorePost, personal, slotOf, durBucket } from "../../site/src/lib/learn.ts";
import { DEFAULT_POST, checkPost } from "../../site/src/lib/checker.ts";
const L = { handle: "test", posts: 40, date: "2026-11-19", groups: {
  type: [{ value: "reel", posts: 20, median_score: 150 }, { value: "photo", posts: 8, median_score: 60 }],
  length: [{ value: "16-30 s", posts: 9, median_score: 130 }],
  weekday: [{ value: "Friday", posts: 6, median_score: 120 }, { value: "Monday", posts: 2, median_score: 300, thin: true }],
  slot: [{ value: "evening (5-9 pm)", posts: 12, median_score: 80 }],
  tag: [{ value: "gaming", posts: 10, median_score: 110 }] } };
const none = { day: "", hour: null };
// without a report the score equals the published-signals score
let base = checkPost(DEFAULT_POST), r = scorePost(DEFAULT_POST, none, null);
assert.equal(r.score, base.score); assert.equal(r.out10, base.score / 10); assert.equal(r.mine.length, 0);
// with a report: reel +5, 16-30 s +3, #gaming +1
r = scorePost(DEFAULT_POST, none, L);
assert.deepEqual(r.mine.map((f) => f.points), [5, 3, 1]); assert.equal(r.score, Math.min(100, base.score + 9));
// thin groups are ignored, weak ones count against
let m = personal(DEFAULT_POST, { day: "Monday", hour: 19 }, L);
assert.ok(!m.findings.some((f) => f.title.includes("Monday"))); assert.ok(m.findings.some((f) => f.title.includes("evening") && f.points === -2 && !f.ok));
m = personal({ ...DEFAULT_POST, format: "photo" }, none, L); assert.equal(m.findings[0].points, -4);
// caps: each factor at most 6, all together at most 15
const big = { ...L, groups: { type: [{ value: "reel", posts: 9, median_score: 400 }], length: [{ value: "16-30 s", posts: 9, median_score: 400 }], weekday: [{ value: "Friday", posts: 9, median_score: 400 }], slot: [{ value: "evening (5-9 pm)", posts: 9, median_score: 400 }] } };
m = personal(DEFAULT_POST, { day: "Friday", hour: 19 }, big); assert.ok(m.findings.every((f) => f.points <= 6)); assert.equal(m.points, 15);
// caption score
r = scorePost({ ...DEFAULT_POST, caption: "" }, none, null); assert.ok(r.caption10 <= 3.5);
r = scorePost({ ...DEFAULT_POST, caption: "The cheapest way to visit Goa in December, step by step. Save this and send it to your travel buddy. Which beach first? #goa #travel" }, none, null); assert.equal(r.caption10, 10);
r = scorePost({ ...DEFAULT_POST, caption: "nice #a #b #c #d #e #f #g" }, none, null); assert.ok(r.caption10 < 2.5);
assert.equal(slotOf(19), "evening (5-9 pm)"); assert.equal(slotOf(null), null); assert.equal(durBucket(25), "16-30 s");
m = personal({ ...DEFAULT_POST, format: "photo" }, none, { ...L, groups: { type: [{ value: "image", posts: 8, median_score: 52 }] } }); assert.equal(m.findings[0].points, -5, "photos match the report's image type");
console.log("all learning checks passed");
