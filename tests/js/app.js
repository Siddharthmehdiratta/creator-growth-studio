// Headless run of the whole app: every step renders, the sample analyses, prompts and calendar build.
const { JSDOM } = require(process.env.JSDOM || "jsdom"); const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..", ".."), docs = path.join(root, "docs");
let html = fs.readFileSync(path.join(docs, "index.html"), "utf8")
  .replace('<script src="engine.js"></script>', "<script>" + fs.readFileSync(path.join(docs, "engine.js"), "utf8") + "</script>")
  .replace('<script src="data.js"></script>', "<script>" + fs.readFileSync(path.join(docs, "data.js"), "utf8") + "</script>")
  .replace('<script src="app.js"></script>', "<script>" + fs.readFileSync(path.join(docs, "app.js"), "utf8") + "</script>");
const dom = new JSDOM(html, { runScripts: "dangerously", url: "https://example.org/", pretendToBeVisual: true });
const w = dom.window, d = w.document, errs = [];
w.addEventListener("error", e => errs.push(e.message));
w.HTMLElement.prototype.scrollIntoView = function () {};
const csv = fs.readFileSync(path.join(docs, "data", "sample-instagram-export.csv"), "utf8");
const prof = JSON.parse(fs.readFileSync(path.join(docs, "data", "sample-profile.json"), "utf8"));
const C = w.__cgs; let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log("FAIL", m); } };
C.setSample(csv, prof);
ok(d.querySelectorAll(".led.on").length > 10, "hero meters light up");
C.state().followers = 2282; C.state().following = 640; C.useText(csv, "sample");
ok(C.analysis().posts === 40, "40 posts analysed");
["account", "numbers", "diagnosis", "map", "plan", "board", "brand"].forEach(s => { C.go(s); ok(d.querySelector(`[data-step="${s}"]`).classList.contains("active"), "step " + s); });
C.go("account"); ok(d.querySelectorAll("#checks .check").length === 19, "19 Instagram checks");
d.querySelector('[data-check="bio"][data-v="0"]').click(); d.querySelector('[data-check="hook"][data-v="1"]').click();
ok(C.strength() > 0, "strength moves");
C.go("diagnosis"); const diag = d.getElementById("diag").textContent;
ok(/holding you back/.test(diag) && /Missing: Bio says/.test(diag), "diagnosis lists the missing bio");
ok(/#gta6/.test(diag), "diagnosis finds GTA 6"); ok(/5 best posts/.test(diag), "best posts");
const fixBtn = d.querySelector("[data-fix]"); fixBtn.click(); ok(C.state().fixes.length === 1, "fix picked");
C.go("map"); const map = d.getElementById("mapview").textContent;
ok(/very hard|ambitious|realistic/i.test(map) && /Your pace/.test(map), "map with chart"); ok(/GTA 6 launch week/.test(map), "GTA lever");
C.state().start = "2026-11-16"; C.go("plan"); const items = C.plan();
ok(items.length >= 15, "plan has posts: " + items.length); ok(items.some(i => /launch day/.test(i.hook)), "launch day post");
d.querySelector("[data-item]").click(); ok(/Hook idea/.test(d.getElementById("cal-detail").textContent), "day detail");
C.go("board"); C.state().draft = "Hook: Don't buy a PS5 Pro for GTA 6 until you see this"; const p = C.boardPrompt();
ok(/AI AUDIENCE PANEL: create 20 viewers/.test(p) && /CEO/.test(p) && /SEO lead/.test(p) && /What moves reach/.test(p) && /PS5 Pro/.test(p) && /fictional sample/.test(p), "boardroom prompt complete");
ok(/5 per post/.test(p) && /MoSPI/.test(p), "rules and income estimate in prompt");
C.go("brand"); d.getElementById("c-demo").click(); ok(/High risk|Check before paying/.test(d.getElementById("c-result").textContent), "brand demo flags risk");
ok(/no clear ad label/.test(d.getElementById("c-result").textContent), "flags missing ad labels");
C.state().platform = "youtube"; C.go("account"); ok(d.querySelectorAll("#checks .check").length === 9, "YouTube checks");
console.log("prompt length", p.length, "| plan items", items.length, "| errors", JSON.stringify(errs));
ok(!errs.length, "no script errors");
console.log(fails ? fails + " failures" : "app OK"); process.exit(fails ? 1 : 0);
