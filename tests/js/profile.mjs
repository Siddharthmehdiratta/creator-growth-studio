// Profile review engine: run with `node tests/js/profile.mjs`
import assert from "node:assert/strict";
import { CHECKS, GROUPS, review, readText, srcOf, MIN_ANSWERS } from "../../site/src/lib/profile.ts";

// the list itself
assert.equal(new Set(CHECKS.map((c) => c.id)).size, CHECKS.length, "no duplicate checks");
assert.ok(CHECKS.every((c) => GROUPS.includes(c.group) && c.q.endsWith("?") && c.why && c.fix && c.w > 0));
assert.ok(CHECKS.every((c) => !/[—–]/.test(c.q + c.why + c.fix)), "no long dashes in the copy");
for (const c of CHECKS) { const s = srcOf(c); assert.ok(s === null || s.url.startsWith("https://"), c.id + " source is a real link or none"); }
assert.ok(CHECKS.filter((c) => srcOf(c)).length >= 10, "most checks cite a source");
assert.ok(CHECKS.some((c) => !srcOf(c)), "habits with no published rule are not given a fake source");

const all = (v) => Object.fromEntries(CHECKS.map((c) => [c.id, v]));

// nothing answered: no score, never a made-up number
let r = review({});
assert.equal(r.score, null); assert.equal(r.answered, 0); assert.equal(r.fixes.length, 0);

// too few answers: still no score, so three easy yeses cannot read as 10
r = review({ pro: "yes", name: "yes", bio: "yes" });
assert.equal(r.score, null, "under " + MIN_ANSWERS + " answers gives no score");

// all yes is 10, all no is 0
assert.equal(review(all("yes")).score, 10);
assert.equal(review(all("no")).score, 0);
assert.equal(review(all("no")).fixes.length, CHECKS.length);

// "not sure" is left out of the score and listed, not counted as a no
r = review(all("unsure"));
assert.equal(r.score, null); assert.equal(r.unsure.length, CHECKS.length); assert.equal(r.fixes.length, 0);
const mix = all("yes"); mix.hook = "unsure";
assert.equal(review(mix).score, 10, "an unsure answer does not lower the score");
assert.equal(review(mix).unsure[0].id, "hook");

// fixes come heaviest first
const two = all("yes"); two.hashtags = "no"; two.hook = "no";
r = review(two);
assert.deepEqual(r.fixes.map((c) => c.id), ["hook", "hashtags"]);
assert.ok(r.score < 10 && r.score > 8);
// weights matter: missing the hook costs more than missing hashtags
const a = all("yes"); a.hook = "no"; const b = all("yes"); b.hashtags = "no";
assert.ok(review(a).score < review(b).score);

// group scores
r = review(all("yes"));
assert.deepEqual(r.groups.map((g) => g.score), [10, 10, 10]);
assert.equal(review({ pro: "yes" }).groups[0].score, null, "a group with one answer has no score");

// reading pasted text
let h = readText({ username: "", name: "", bio: "" });
assert.equal(h.length, 0, "nothing pasted, nothing claimed");
h = readText({ username: "asha.fit", name: "Asha | Home workouts", bio: "Home workouts for busy parents. New 10-minute routine every Monday. Follow for the next one." });
assert.ok(h.every((x) => x.ok), JSON.stringify(h));
h = readText({ username: "asha.fit", name: "asha fit", bio: "x".repeat(160) });
assert.ok(h.some((x) => !x.ok && x.line.includes("160")), "over 150 is flagged with the count");
assert.ok(h.some((x) => x.line.includes("repeats your username")));
assert.ok(h.some((x) => x.line.includes("does not ask")));
h = readText({ username: "a", name: "Asha", bio: "Follow me. DM for collabs. Shop the link. Subscribe on YouTube." });
assert.ok(h.some((x) => x.line.includes("different things")));
assert.ok(h.some((x) => x.line.includes("one word")));
// emoji count as one character each, the way Instagram counts
assert.ok(readText({ username: "", name: "", bio: "🏋️".repeat(10) + " follow" })[0].ok);

console.log("profile: all passed");
