// Ads Checker maths: run with `node tests/js/ads.mjs`
import assert from "node:assert/strict";
import { checkAd, planTest, DEFAULT_AD } from "../../site/src/lib/ads.ts";
const base = { ...DEFAULT_AD };
let r = checkAd({ ...base, goal: "followers", spend: 2100, days: 7, reach: 18000, results: 60, target: 30 });
assert.equal(r.cpr, 35); assert.equal(r.cpm, 116.67); assert.equal(r.perDay, 300); assert.equal(r.verdict, "close"); assert.equal(r.early, false);
r = checkAd({ ...base, results: 100, target: 30 }); assert.equal(r.cpr, 21); assert.equal(r.verdict, "working");
r = checkAd({ ...base, results: 20, target: 30 }); assert.equal(r.verdict, "losing");
r = checkAd({ ...base, target: 0 }); assert.equal(r.verdict, "need-target");
r = checkAd({ ...base, days: 3 }); assert.equal(r.early, true); assert.ok(r.findings.some((f) => f.title.startsWith("Too early")));
r = checkAd({ ...base, results: 4 }); assert.equal(r.early, true);
// sales: 10 orders x 1500 = 15000 revenue; margin 40% = 6000; spend 5000 -> profit 1000 (20% of spend) -> working
r = checkAd({ ...base, goal: "sales", spend: 5000, days: 10, orders: 10, orderValue: 1500, marginPct: 40 });
assert.equal(r.revenue, 15000); assert.equal(r.roas, 3); assert.equal(r.breakEvenRoas, 2.5); assert.equal(r.profit, 1000); assert.equal(r.maxCostPerOrder, 600); assert.equal(r.verdict, "working");
r = checkAd({ ...base, goal: "sales", spend: 6000, days: 10, orders: 10, orderValue: 1500, marginPct: 40 }); assert.equal(r.profit, 0); assert.equal(r.verdict, "close");
r = checkAd({ ...base, goal: "sales", spend: 9000, days: 10, orders: 10, orderValue: 1500, marginPct: 40 }); assert.equal(r.verdict, "losing");
r = checkAd({ ...base, goal: "sales", spend: 9000, days: 10, orders: 10, orderValue: 0, marginPct: 40 }); assert.equal(r.verdict, "need-target");
r = checkAd({ ...base, goal: "reach", spend: 900, days: 7, reach: 30000, target: 40 }); assert.equal(r.cpm, 30); assert.equal(r.verdict, "working");
r = checkAd({ ...base, spend: 0 }); assert.equal(r.verdict, "empty");
r = checkAd({ ...base, beatNormal: "no" }); assert.ok(r.findings.some((f) => f.tone === "warn" && f.title.includes("weak")));
assert.deepEqual(planTest(300, 1500, 40), { total: 2100, ordersToBreakEven: 4 });
assert.deepEqual(planTest(300, 0, 40), { total: 2100, ordersToBreakEven: null });
console.log("all Ads Checker checks passed");
