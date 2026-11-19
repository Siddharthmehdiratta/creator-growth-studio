// Growth Plan rules: run with `node tests/js/growth.mjs`
import assert from "node:assert/strict";
import { buildPlan, DEFAULT_ANSWERS } from "../../site/src/lib/growth.ts";
const A = (o) => ({ ...DEFAULT_ANSWERS, ...o });
const total = (p) => p.mix.reduce((s, m) => s + m.count, 0);
let p = buildPlan(A({}));
assert.equal(p.perWeek, 3); assert.equal(total(p), 3); assert.equal(p.week.length, 3); assert.deepEqual(p.days, ["Mon", "Wed", "Fri"]); assert.equal(p.signal.name, "Sends per reach"); assert.equal(p.time, "19:30");
assert.equal(p.mix[0].format, "Reel"); assert.equal(p.mix[0].count, 2);
for (const hours of ["h2", "h5", "h10", "h10plus", "other"]) for (const goal of ["followers", "views", "engagement", "sales", "deals", "other"]) for (const formats of [["face"], ["voice"], ["carousel"], ["photo"], ["stories"], [], ["face", "voice", "carousel", "photo", "stories"]]) {
  const q = buildPlan(A({ hours, goal, formats }));
  assert.equal(total(q), q.perWeek, `${hours} ${goal} ${formats}`); assert.equal(q.week.length, q.perWeek); assert.ok(q.perWeek >= 2 && q.perWeek <= 5);
  if (formats.length && !formats.includes("face") && !formats.includes("voice")) assert.ok(!q.mix.some((m) => m.format === "Reel"), `no reels without a way to film: ${formats}`);
  if (formats.length === 1 && formats[0] === "photo") assert.deepEqual(q.mix.map((m) => m.format), ["Photo"]);
}
p = buildPlan(A({ hours: "h2", now: "n5" })); assert.equal(p.perWeek, 4, "keeps a pace the creator already holds");
p = buildPlan(A({ hours: "h10plus", now: "n1" })); assert.equal(p.perWeek, 5); assert.ok(p.ramp && p.ramp.includes("Add one post a week"));
p = buildPlan(A({ hours: "h5", now: "n2" })); assert.equal(p.ramp, null);
p = buildPlan(A({ goal: "views" })); assert.equal(p.signal.name, "Average watch time");
p = buildPlan(A({ goal: "engagement" })); assert.ok(p.stories); assert.ok(p.signal.name.startsWith("Likes per reach"));
p = buildPlan(A({ goal: "sales", formats: ["carousel"] })); assert.deepEqual(p.mix.map((m) => m.format), ["Carousel"]); assert.equal(p.cta.title, "One clear next step");
p = buildPlan(A({ niche: "budget travel" })); assert.ok(p.cta.example.includes("budget travel"));
p = buildPlan(A({ slot: "morning" })); assert.equal(p.time, "08:00");
p = buildPlan(A({ slot: "other", other: { slot: "night shift workers", goal: "  " } })); assert.ok(p.timeNote.includes("night shift workers")); assert.deepEqual(p.ownWords, [{ question: "slot", text: "night shift workers" }]);
p = buildPlan(A({ goal: "other", stage: "other", hours: "other", now: "other", struggle: "other" })); assert.equal(p.perWeek, 3); assert.equal(p.fix.title, "Your own blocker");
console.log("all Growth Plan checks passed");
