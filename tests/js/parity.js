// Checks the browser engine gives the same numbers as the Python engine on the sample account.
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const root = path.resolve(__dirname, "..", "..");
const E = require(path.join(root, "docs", "engine.js"));
const csv = fs.readFileSync(path.join(root, "docs", "data", "sample-instagram-export.csv"), "utf8");
const js = E.audit(E.loadPosts(csv), 2282);
const py = JSON.parse(execFileSync("python3", ["-c", `
import sys,json;sys.path.insert(0,${JSON.stringify(path.join(root, "skills", "growth-audit"))});import growth
r=growth.audit(growth.load_posts(${JSON.stringify(path.join(root, "docs", "data", "sample-instagram-export.csv"))}),2282)
print(json.dumps({k:r[k] for k in ("median","median_reach","engagement_rate_by_followers","drivers_reach","drivers_sends","drivers_watch","drivers_hold","top","bottom","by_format","by_slot","reports","level")},default=str))`]).toString());
let fails = 0;
const eq = (a, b, what, tol = 0.011) => { const ok = typeof a === "number" ? Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)) : a === b; if (!ok) { fails++; console.log("MISMATCH", what, a, b); } };
for (const k of Object.keys(py.median)) eq(Math.round(js.median[k] * 100) / 100, py.median[k], "median " + k);
eq(js.median_reach, py.median_reach, "median reach");
eq(js.engagement_rate_by_followers, py.engagement_rate_by_followers, "ER");
["drivers_reach", "drivers_sends", "drivers_watch", "drivers_hold"].forEach(k => { eq(js[k].length, py[k].length, k + " count");
  const pm = Object.fromEntries(py[k].map(d => [d.feature, d.multiplier]));
  const pc = Object.fromEntries(py[k].map(d => [d.feature, d.confidence]));
  js[k].forEach(d => { eq(d.multiplier, pm[d.feature], k + " " + d.feature); eq(d.confidence, pc[d.feature], k + " confidence " + d.feature); }); });
["top", "bottom"].forEach(k => js[k].forEach((p, i) => { eq(p.id, py[k][i].id, k + " id " + i); eq(p.score, py[k][i].score, k + " score " + i, 0); }));
["by_format", "by_slot"].forEach(k => js[k].forEach((g, i) => { eq(g.value, py[k][i].value, k + " " + i); eq(g.median_score, py[k][i].median_score, k + " score " + i); }));
eq(js.reports.length, py.reports.length, "report count");
js.reports.forEach((r, i) => { eq(r.id, py.reports[i].id, "report id " + i); eq(r.stars, py.reports[i].stars, "stars " + i, 0); eq(r.next.join("|"), py.reports[i].next.join("|"), "advice " + i); eq(r.time, py.reports[i].time, "time " + i); });
eq(js.level.level, py.level.level, "level");
const cc = E.classifyComments("bro settings kya hai?\n🔥🔥🔥\npart 2 please\nclickbait hai ye\nfollow me for promo\nok");
["question", "praise", "request", "criticism", "spam", "other"].forEach(k => eq(cc[k].length, 1, "comments " + k));
// growth map and brand check parity
const gm = E.growthMap(2282, 20000, 6, 4.5, 4);
eq(gm.monthly_growth_needed_pct, 43.6, "map pct"); eq(gm.followers_at_your_pace, Math.round(2282 + 4.5 * 4 * 6 * 4.345), "pace");
const prof = { followers: 50000, following: 90000, posts: Array.from({ length: 10 }, () => ({ likes: 300, comments: 0 })) };
eq(E.check(prof).summary, "High risk", "check summary");
console.log(fails ? fails + " mismatches" : "parity OK: browser and Python engines agree");
process.exit(fails ? 1 : 0);
