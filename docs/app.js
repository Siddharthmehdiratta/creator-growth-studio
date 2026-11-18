/* Creator Growth Studio: app. Everything runs in the browser; nothing is uploaded. */
(function () {
  "use strict";
  const D = window.CGS_DATA, E = window.CGS;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtN = n => (n == null || isNaN(n) ? "-" : Math.round(n).toLocaleString("en-IN"));
  const STEPS = [["account", "Your account"], ["numbers", "Your numbers"], ["diagnosis", "Diagnosis"], ["map", "Growth map"], ["plan", "30-day plan"], ["board", "AI boardroom"], ["brand", "For brands"]];
  const HOOKS = ["Face to camera", "Gameplay first", "Text on screen", "Question", "Before and after", "Trend audio", "Story start", "Other"];
  const METERS = [["sends", "Sends", "--red"], ["follows", "Follows", "--amber"], ["likes", "Likes", "--green"], ["saves", "Saves", "--cyan"], ["comments", "Comments", "--violet"]];
  const BENCH = [[10000, "nano", 4.25], [100000, "micro", 3.4], [500000, "mid-tier", 3.6], [1000000, "macro", 2.7], [Infinity, "mega", 3.9]];
  const OPTS = {
    platform: [["instagram", "Instagram"], ["youtube", "YouTube"], ["twitch", "Twitch"]],
    goal: [1000, 2000, 5000, 10000, 20000, 30000, 50000, 100000, 250000, 500000, 1000000].map(n => [n, n.toLocaleString("en-IN")]),
    months: [3, 6, 9, 12].map(n => [n, n + " months"]),
    country: D.audiences.countries.map(c => [c, c]),
    tier: D.audiences.tiers.map(c => [c, c]),
    lang: D.audiences.languages.map(c => [c, c]),
    aim: [["followers", "Grow followers"], ["views", "Get more views"], ["sales", "Sell a product"], ["deals", "Get brand deals"], ["bookings", "Get bookings or customers"], ["stream", "Grow my stream"]],
    pace: Array.from({ length: 14 }, (_, i) => [i + 1, (i + 1) + (i ? " posts a week" : " post a week")]),
    camera: [["yes", "Yes, my face is in most posts"], ["some", "Sometimes"], ["no", "No, faceless (voice, text or gameplay)"]],
    highlights: [0, 1, 2, 3, 4, 5, 6].map(n => [n, n ? n + (n > 1 ? " highlights" : " highlight") : "None"]),
    ptime: ["07:00", "09:00", "12:00", "13:00", "15:00", "17:00", "18:00", "19:00", "20:00", "21:00", "21:30", "22:00", "23:00"].map(t => [t, t]),
    mix: [["reels", "Mostly short video (7 in 10 reels)"], ["balanced", "Balanced reels, carousels and photos"], ["teach", "Teaching-heavy (more carousels)"], ["stream", "Stream-led (lives plus clips)"]],
    target: D.reviewTargets.map(t => [t.id, t.name]),
    tone: [["blunt", "Blunt, like a strict coach"], ["balanced", "Balanced"], ["gentle", "Gentle, start with what works"]],
    panel: [[10, "10 viewers (fastest)"], [20, "20 viewers (recommended)"], [30, "30 viewers"]],
    reply: [["English", "English"], ["Hinglish", "Hinglish"], ["Hindi", "Hindi"]],
    gender: [["70/30 men", "Mostly men (about 70/30)"], ["50/50", "About even"], ["70/30 women", "Mostly women (about 70/30)"], ["unknown", "I don't know yet"]]
  };
  const today = new Date(); const tomorrow = new Date(today.getTime() + 864e5);
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const DEF = { platform: "instagram", niche: "gaming", sub: "GTA 6 and open world", handle: "", followers: "", following: "", goal: 20000, months: 6, country: "India",
    tier: D.audiences.tiers[0], lang: "Hinglish", aim: "followers", pace: 4, camera: "yes", name: "", bio: "", link: "", highlights: 0, checks: {}, rows: [], source: "none",
    start: iso(tomorrow), ptime: "21:00", mix: "reels", days: [1, 3, 5, 6], pillars: null, target: "post", tone: "blunt", panel: 20, reply: "English", draft: "",
    seats: D.board.filter(b => b.default).map(b => b.id), ages: ["18-24", "25-34"], gender: "70/30 men", tiers: [D.audiences.tiers[0], D.audiences.tiers[1]], fixes: [], step: "account", seen: {} };
  let S = load(), A = null, SAMPLE = null, picked = null;

  function load() {
    let s = null; try { s = JSON.parse(localStorage.getItem("cgs-v1") || "null"); } catch (e) { s = null; }
    const out = Object.assign({}, DEF);
    if (s && typeof s === "object") Object.keys(DEF).forEach(k => { const d = DEF[k], v = s[k];
      if (v === undefined || v === null) return;
      if (Array.isArray(d) ? Array.isArray(v) : (d && typeof d === "object" ? typeof v === "object" && !Array.isArray(v) : typeof v === typeof d || d === "" || d === null)) out[k] = v; });
    if (s && s.fixLabels && typeof s.fixLabels === "object") out.fixLabels = s.fixLabels;
    if (!STEPS.some(x => x[0] === out.step)) out.step = "account";
    if (!D.platforms[out.platform]) out.platform = "instagram";
    if (!D.niches.some(n => n.id === out.niche)) out.niche = "gaming";
    out.rows = out.rows.filter(r => r && typeof r === "object");
    return out;
  }
  function save() { try { localStorage.setItem("cgs-v1", JSON.stringify(S)); } catch (e) { /* private mode: keep going in memory */ } }
  function toast(t) { const el = $("toast"); el.textContent = t; el.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2200); }
  const niche = () => D.niches.find(n => n.id === S.niche) || D.niches[0];
  const unit = () => D.platforms[S.platform].unit;

  /* ---------- selects and binding ---------- */
  function fillSelect(el, key) {
    let opts = OPTS[key];
    if (key === "niche") opts = D.niches.map(n => [n.id, n.name]);
    if (key === "sub") opts = niche().subs.map(s => [s, s]);
    if (!opts) return;
    el.innerHTML = opts.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join("");
    el.value = String(S[key]);
    if (el.value !== String(S[key]) && opts.length) { S[key] = isNaN(+opts[0][0]) ? opts[0][0] : opts[0][0]; el.value = String(opts[0][0]); }
  }
  function bindAll() {
    document.querySelectorAll("[data-bind]").forEach(el => {
      const key = el.dataset.bind;
      if (el.tagName === "SELECT") fillSelect(el, key); else el.value = S[key] == null ? "" : S[key];
      el.oninput = el.onchange = () => {
        let v = el.value; if (el.type === "number" || ["goal", "months", "pace", "panel", "highlights"].includes(key)) v = v === "" ? "" : Number(v);
        S[key] = v;
        if (key === "niche") { S.sub = niche().subs[0]; S.pillars = null; }
        if (key === "platform") S.checks = {};
        if (key === "pace") { const n = Math.min(7, Number(v)), spread = [[4], [2, 5], [1, 3, 5], [1, 3, 5, 6], [1, 2, 4, 5, 6], [1, 2, 3, 5, 6, 7], [1, 2, 3, 4, 5, 6, 7]][n - 1]; S.days = spread.slice(); }
        document.querySelectorAll(`[data-bind="${key}"]`).forEach(o => { if (o !== el) o.value = el.value; });
        if (key === "niche" || key === "platform") document.querySelectorAll('[data-bind="sub"]').forEach(o => fillSelect(o, "sub"));
        save(); refresh(key);
      };
    });
  }

  /* ---------- analysis ---------- */
  function analyse() {
    A = null;
    if (!S.rows.length) return;
    try { const posts = E.loadPosts(S.rows.map(r => Object.assign({}, r))); A = E.audit(posts, Number(S.followers) || null); A.list = posts; } catch (e) { A = { error: e.message }; }
  }
  function meterValues(res) {
    if (!res || !res.list) return null;
    const ps = res.list.filter(p => p.time).sort((a, b) => b.time - a.time);
    const recent = ps.slice(0, 10);
    if (!recent.length) return METERS.map(() => null);
    return METERS.map(([k]) => { const all = res.median[k], now = E.median(recent.map(p => p.signals[k])); return all && now != null ? Math.round(100 * now / all) : null; });
  }
  function drawMeters(vals, src, foot) {
    $("meters").innerHTML = METERS.map(([k, label, c], i) => {
      const v = vals ? vals[i] : null, lit = v == null ? 0 : Math.max(1, Math.min(12, Math.round(v / 200 * 12)));
      const leds = Array.from({ length: 12 }, (_, j) => `<span class="led${j < lit ? " on" : ""}"></span>`).join("");
      return `<div class="meter" style="--c:var(${c})"><div class="leds" role="img" aria-label="${label}: ${v == null ? "no data" : v + "% of your usual"}">${leds}</div><div class="v num">${v == null ? "-" : v + "%"}</div><div class="l">${label} per reach</div></div>`;
    }).join("");
    $("rack-src").textContent = src; if (foot) $("rack-foot").textContent = foot;
  }
  function heroMeters() {
    if (A && A.list) { drawMeters(meterValues(A), S.source === "sample" ? "Sample account" : "Your account", "Last 10 posts compared with your usual post. 100% means normal for you." + (S.platform === "instagram" ? " Instagram says watch time, sends and likes per reach matter most." : "")); return; }
    if (SAMPLE) drawMeters(meterValues(SAMPLE), "Sample account", "This is a sample gaming account. Add your own numbers to see yours.");
    else drawMeters(null, "Waiting for numbers");
  }

  /* ---------- rail ---------- */
  function done(id) {
    if (id === "account") return !!(S.followers && Object.keys(S.checks).length >= 5);
    if (id === "numbers") return S.rows.length > 0;
    return !!S.seen[id];
  }
  function drawRail() {
    $("rail").innerHTML = STEPS.map(([id, name]) => `<li><button data-go="${id}" class="${done(id) ? "done" : ""}" ${S.step === id ? 'aria-current="step"' : ""}><span class="dot"></span>${name}</button></li>`).join("");
    const st = strength();
    $("strength-label").textContent = `Profile strength ${st}%`; $("strength-fill").style.width = st + "%";
  }
  function go(id, scroll) {
    S.step = id; S.seen[id] = true; save();
    document.querySelectorAll(".step").forEach(s => s.classList.toggle("active", s.dataset.step === id));
    drawRail(); renderStep(id);
    if (scroll) $("studio").scrollIntoView({ behavior: window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  /* ---------- account step ---------- */
  function checksList() { return D.profileChecks[S.platform] || D.profileChecks.instagram; }
  function strength() {
    const cs = checksList(); let got = 0, all = 0;
    cs.forEach(c => { all += c.w; const v = S.checks[c.id]; if (v != null) got += c.w * v / 2; });
    return all ? Math.round(100 * got / all) : 0;
  }
  function drawChecks() {
    $("checks").innerHTML = checksList().map(c => `<div class="check"><div>${esc(c.label)}<small>${esc(c.why)}</small></div>
      <div class="seg" role="group" aria-label="${esc(c.label)}">${[[2, "Yes"], [1, "Partly"], [0, "No"]].map(([v, t]) => `<button data-check="${c.id}" data-v="${v}" aria-pressed="${S.checks[c.id] === v}">${t}</button>`).join("")}</div></div>`).join("");
  }
  function bioTips() {
    const tips = [], bio = S.bio || "", name = S.name || "", n = niche(), kw = S.sub.split(/[ ,]/)[0].toLowerCase();
    if (bio.length < 40) tips.push("Your bio is short. Say who it's for, what they get, and why follow.");
    if (name && !name.toLowerCase().includes(kw) && !name.toLowerCase().includes(n.name.split(" ")[0].toLowerCase())) tips.push(`Add a search word to your name field, like "${(name.split("|")[0] || "Your name").trim()} | ${S.sub}".`);
    if (!/(watch|join|new|daily|every|link|follow|live|below|book|shop|dm)/i.test(bio)) tips.push("Add one next step: a schedule (\"new clip daily at 9 pm\"), a link, or a series name.");
    const who = { gaming: "gamers", tech: "smart buyers", cars: "car lovers", fitness: "busy people", food: "food lovers" }[S.niche] || "people who love " + n.name.toLowerCase();
    const sched = S.pace >= 7 ? "New post daily" : `${S.pace} new posts a week`;
    const drafts = [
      `${S.sub} for ${who} 🎮\n${sched}, ${S.ptime.replace(":00", "")} IST\nWatch the full streams below`.replace(" 🎮", S.niche === "gaming" ? " 🎮" : ""),
      `Helping ${who} with ${S.sub.toLowerCase()}\nHonest tips, no hype\n${sched}`,
      `${S.sub}: clips, tips and news\nFor ${who} in ${S.country === "India" ? "India" : S.country}\nNew series every week`
    ].map(s => s.slice(0, 150));
    $("bio-tips").innerHTML = (tips.length ? `<div class="note">${tips.map(esc).join("<br>")}</div>` : `<div class="note">Bio covers the basics. Test a version with a clear schedule.</div>`) +
      `<p class="small sub" style="margin-top:12px">Starting points (edit to sound like you):</p>` + drafts.map((d, i) => `<div class="post small"><span style="white-space:pre-wrap">${esc(d)}</span> <button class="btn line small" data-usebio="${i}">Use this</button></div>`).join("");
    bioTips.drafts = drafts;
    $("bio-count").textContent = `(${bio.length}/150)`;
  }
  function drawPhone() {
    const handle = S.handle || "yourhandle", initials = (S.name || handle).replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "?";
    const posts = A && A.list ? A.list.slice().sort((a, b) => (b.time || 0) - (a.time || 0)).slice(0, 9) : [];
    const tile = p => { const s = Math.max(20, Math.min(220, p.score)), h = s >= 130 ? "var(--green)" : s >= 85 ? "var(--amber)" : "var(--red)";
      return `<i style="background:linear-gradient(160deg,#232a39,${h})"><b>${p.type === "reel" ? (S.platform === "youtube" ? "Video" : "Reel") : p.type === "carousel" ? "Carousel" : "Photo"} ${p.score}</b></i>`; };
    $("phone").innerHTML = `<div class="ph-top"><div class="avatar">${esc(initials)}</div><div class="ph-stats"><div><b>${A && A.list ? A.list.length : "-"}</b>posts</div><div><b>${fmtN(S.followers)}</b>${unit()}</div><div><b>${fmtN(S.following)}</b>following</div></div></div>
      <div class="ph-name">${esc(S.name || handle)}</div><div class="ph-bio">${esc(S.bio || "Your bio appears here.")}</div>${S.link ? `<div class="ph-link">${esc(S.link)}</div>` : ""}
      <div class="ph-hl">${Array.from({ length: Number(S.highlights) || 0 }, () => "<span></span>").join("")}</div>
      <div class="ph-grid">${posts.length ? posts.map(tile).join("") : Array.from({ length: 9 }, () => "<i></i>").join("")}</div>
      <p class="small sub" style="margin-top:10px">${posts.length ? "Tiles show each post's score: 100 is your usual." : "Add numbers to see your grid scored."}</p>`;
  }

  /* ---------- numbers step ---------- */
  function canon(p) {
    const t = p.time ? `${p.time.getFullYear()}-${String(p.time.getMonth() + 1).padStart(2, "0")}-${String(p.time.getDate()).padStart(2, "0")}T${String(p.time.getHours()).padStart(2, "0")}:${String(p.time.getMinutes()).padStart(2, "0")}:00` : "";
    return { id: p.id, caption: p.caption, time: t, type: p.type, reach: p.reach_is_views ? null : p.reach, views: p.views, likes: p.likes, comments: p.comments, shares: p.shares,
      saves: p.saves, follows: p.follows, duration: p.duration, hook: p.hook || "", topic: p.topic || "", link: p.link };
  }
  function useText(text, source) {
    try { const posts = E.loadPosts(text); S.rows = posts.map(canon); S.source = source; save(); analyse(); refresh("rows");
      $("load-msg").textContent = `Loaded ${posts.length} ${posts.length === 1 ? "post" : "posts"}${source === "sample" ? " from the sample account (fictional, for practice)" : ""}. Label hooks and topics below, then open your diagnosis.`;
      toast(`${posts.length} ${posts.length === 1 ? "post" : "posts"} loaded`);
    } catch (e) { $("load-msg").textContent = e.message; toast("That file didn't work. See the message under the upload box."); }
  }
  function drawExport() {
    const P = D.platforms[S.platform];
    $("export-title").textContent = `Get your ${P.name} export`;
    $("export-steps").innerHTML = P.export.map(s => `<li>${esc(s)}</li>`).join("");
  }
  function drawPosts() {
    $("posts-block").hidden = !S.rows.length;
    if (!S.rows.length) { $("load-msg").textContent = "No posts yet."; return; }
    const topics = [...new Set(niche().pillars.concat(S.rows.map(r => r.topic).filter(Boolean)))];
    const scoreOf = {}; if (A && A.list) A.list.forEach(p => { scoreOf[p.id] = p.score; });
    $("posts-table").innerHTML = `<thead><tr><th>Date</th><th>Post</th><th>Format</th><th>Hook</th><th>Topic</th><th class="num">Reach</th><th class="num">Sends</th><th class="num">Follows</th><th class="num">Score</th></tr></thead><tbody>` +
      S.rows.map((r, i) => `<tr><td class="num">${r.manual ? `<input type="date" aria-label="Post ${i + 1} date" data-row="${i}" data-f="date" value="${esc((r.time || "").slice(0, 10))}">` : esc((r.time || "").slice(0, 10))}</td><td>${r.manual ? `<input aria-label="Post ${i + 1} topic or caption" data-row="${i}" data-f="caption" value="${esc(r.caption)}" placeholder="What was it about?">` : esc((r.caption || "").slice(0, 40))}</td>
        <td><select aria-label="Post ${i + 1} format" data-row="${i}" data-f="type">${["reel", "carousel", "image", "story"].map(f => `<option ${r.type === f ? "selected" : ""}>${f}</option>`).join("")}</select></td>
        <td><select aria-label="Post ${i + 1} hook" data-row="${i}" data-f="hook"><option value="">Pick</option>${HOOKS.map(h => `<option ${r.hook === h ? "selected" : ""}>${h}</option>`).join("")}</select></td>
        <td><select aria-label="Post ${i + 1} topic" data-row="${i}" data-f="topic"><option value="">Pick</option>${topics.map(h => `<option ${r.topic === h ? "selected" : ""}>${esc(h)}</option>`).join("")}</select></td>
        ${["reach", "shares", "follows"].map(f => r.manual ? `<td><input type="number" min="0" aria-label="Post ${i + 1} ${f === "shares" ? "sends" : f}" data-row="${i}" data-f="${f}" value="${r[f] == null ? "" : r[f]}" style="width:84px"></td>` : `<td class="num">${fmtN(r[f] == null && f === "reach" ? r.views : r[f])}</td>`).join("")}
        <td class="num">${scoreOf[r.id] != null ? scoreOf[r.id] : "-"}</td></tr>`).join("") + "</tbody>";
  }

  /* ---------- diagnosis ---------- */
  function bench(f) { return BENCH.find(b => f < b[0]); }
  const NOUN = { reel: "Reels", carousel: "Carousels", image: "Photos", story: "Stories" };
  function plain(feature, mult, what) {
    const pct = mult >= 1 ? mult.toFixed(1) + "x" : Math.round(100 * (1 - mult)) + "% " + (what === "reach" ? "fewer" : "fewer");
    const effect = what === "reach" ? (mult >= 1 ? `reach ${pct} as many people` : `reach ${pct} people`) : (mult >= 1 ? `get ${pct} the sends` : `get ${pct} sends`);
    let m;
    if ((m = feature.match(/^format: (.+) \(vs (.+)\)$/))) return `${NOUN[m[1]] || m[1]} ${effect} compared with ${(NOUN[m[2]] || m[2]).toLowerCase()}`;
    if ((m = feature.match(/^time: (.+) \(vs (.+)\)$/))) return `Posting in the ${m[1]} you ${effect.replace("reach", "reach").replace("get", "get")} compared with the ${m[2]}`;
    if ((m = feature.match(/^hook: (.+) \(vs (.+)\)$/))) return `"${m[1]}" hooks ${effect} compared with "${m[2]}"`;
    if ((m = feature.match(/^length: (.+) \(vs (.+)\)$/))) return `Reels of ${m[1]} ${effect} compared with ${m[2]}`;
    if ((m = feature.match(/^topic: (.+) \(vs (.+)\)$/))) return `"${m[1]}" posts ${effect} compared with "${m[2]}"`;
    if (feature.startsWith("#")) return `Posts tagged ${feature} ${effect}`;
    return `${feature}: ${pct}`;
  }
  function findings() {
    const good = [], bad = [];
    if (A && A.list) {
      const conf = d => d.confidence !== "weak";
      A.drivers_reach.filter(conf).forEach(d => (d.multiplier >= 1.15 ? good : d.multiplier <= 0.87 ? bad : []).push({ k: "r:" + d.feature, t: plain(d.feature, d.multiplier, "reach"), why: `Linked in your posts after adjusting for format, time, hook and tags (${d.posts} posts, ${d.confidence} evidence). A pattern, not proof: test it.`, w: Math.abs(Math.log(d.multiplier)) * 10 }));
      A.drivers_sends.filter(conf).slice(0, 4).forEach(d => (d.multiplier >= 1.2 ? good : d.multiplier <= 0.8 ? bad : []).push({ k: "s:" + d.feature, t: plain(d.feature, d.multiplier, "sends"), why: "Sends per reach is a top signal for reaching people who don't follow you.", w: Math.abs(Math.log(d.multiplier)) * 9 }));
      const mv = meterValues(A);
      METERS.forEach(([k, label], i) => { const v = mv[i]; if (v != null && v < 80) bad.push({ k: "m:" + k, t: `${label} are down: last 10 posts at ${v}% of your usual`, why: "A recent slide. Compare your last 10 posts with your best ones below.", w: (100 - v) / 8 });
        if (v != null && v >= 125) good.push({ k: "m:" + k, t: `${label} are up: last 10 posts at ${v}% of your usual`, why: "Keep doing what changed recently.", w: (v - 100) / 10 }); });
      const recent = A.list.filter(p => p.time && (Date.now() - p.time) < 30 * 864e5).length, latest = A.list.reduce((m, p) => (p.time && p.time > m ? p.time : m), 0);
      const span = latest ? A.list.filter(p => p.time && (latest - p.time) < 30 * 864e5).length : recent;
      const perWeek = Math.round(10 * span / 4.3) / 10;
      if (perWeek && perWeek < Number(S.pace) * 0.75) bad.push({ k: "pace", t: `You posted about ${perWeek} times a week in your last month of data`, why: `Your plan says ${S.pace}. Pick a pace you can keep for 12 weeks.`, w: 4 });
    }
    checksList().forEach(c => { const v = S.checks[c.id]; if (v === 0 || v === 1) bad.push({ k: "c:" + c.id, t: (v === 0 ? "Missing: " : "Half done: ") + c.label, why: c.why, w: c.w * (v === 0 ? 1 : 0.5) / 1.5 }); });
    if (Number(S.following) && Number(S.followers) && Number(S.following) > Number(S.followers) * 1.2) bad.push({ k: "ratio", t: "You follow more accounts than follow you", why: "Visitors read this as follow-for-follow. Unfollow accounts that don't fit your niche, slowly.", w: 3 });
    good.sort((a, b) => b.w - a.w); bad.sort((a, b) => b.w - a.w);
    return [good.slice(0, 6), bad.slice(0, 8)];
  }
  function findRow(f, lamp) {
    const on = S.fixes.includes(f.k);
    return `<div class="find"><span class="lamp ${lamp}"></span><div><b>${esc(f.t)}</b><span class="small sub">${esc(f.why)}</span></div>${lamp === "r" || lamp === "a" ? `<button class="btn line small" data-fix="${esc(f.k)}" data-label="${esc(f.t)}" aria-pressed="${on}">${on ? "This week's fix" : "Make this a fix"}</button>` : "<span></span>"}</div>`;
  }
  function bars(title, rows, color) {
    if (!rows || !rows.length) return "";
    const max = Math.max(...rows.map(r => r.median_score || 0), 1);
    return `<div class="block"><h3>${title}</h3><div class="bars">${rows.slice(0, 7).map(r => `<div class="row"><span>${esc(r.value)}${r.thin ? " <span class='sub'>(few posts)</span>" : ""}</span><span class="track"><i style="width:${Math.round(100 * (r.median_score || 0) / max)}%;background:${r.thin ? "var(--faint)" : color}"></i></span><span class="num">${Math.round(r.median_score || 0)}</span></div>`).join("")}</div><p class="small sub">Median score per group. 100 is your usual post.</p></div>`;
  }
  function adjusted(key, label) {
    // all-else-equal multipliers for one category, baseline = 1.0
    const groupsRaw = A["by_" + key] || [], ds = A.drivers_reach.filter(d => d.feature.startsWith(label + ": "));
    if (!ds.length) return null;
    const base = (ds[0].feature.match(/\(vs (.+)\)$/) || [])[1];
    const rows = [{ value: base, m: 1, posts: (groupsRaw.find(g => g.value === base) || {}).posts }].concat(ds.map(d => ({ value: d.feature.slice(label.length + 2).replace(/ \(vs .+\)$/, ""), m: d.multiplier, posts: d.posts, conf: d.confidence })));
    return rows.sort((a, b) => b.m - a.m);
  }
  function adjBars(title, rows, color) {
    if (!rows || rows.length < 2) return "";
    const max = Math.max(...rows.map(r => r.m));
    return `<div class="block"><h3>${title}</h3><div class="bars">${rows.map(r => `<div class="row"><span>${esc(NOUN[r.value] || r.value)}</span><span class="track"><i style="width:${Math.round(100 * r.m / max)}%;background:${r.conf === "weak" ? "var(--faint)" : color}"></i></span><span class="num">${r.m.toFixed(2)}x</span></div>`).join("")}</div><p class="small sub">Reach compared with ${esc(NOUN[rows.find(r => r.m === 1).value] || rows.find(r => r.m === 1).value)} (1.00x), after adjusting for the rest. Grey bars are weak evidence.</p></div>`;
  }
  function renderDiag() {
    const [good, bad] = findings(), st = strength();
    let h = "";
    if (A && A.error) h += `<div class="block"><b>${esc(A.error)}</b></div>`;
    const f = Number(S.followers);
    let er = A && A.engagement_rate_by_followers, b = f ? bench(f) : null;
    const mv = A && A.list ? meterValues(A) : null;
    const momRaw = mv ? E.median(mv.filter(v => v != null)) : null, mom = momRaw == null ? null : Math.round(momRaw);
    const parts = [["Profile", st, "How complete and clear your profile is."]];
    if (mom != null) parts.push(["Momentum", Math.max(0, Math.min(100, Math.round(mom / 2))), `Last 10 posts at ${mom}% of your usual (50 = normal).`]);
    if (er != null && b) parts.push(["Engagement", Math.max(0, Math.min(100, Math.round(50 * er / b[2]))), `${er}% vs about ${b[2]}% typical for ${b[1]} accounts (50 = typical).`]);
    const total = Math.round(parts.reduce((s, p) => s + p[1], 0) / parts.length), cls = total >= 65 ? "g" : total >= 45 ? "a" : "r";
    h += `<div class="block"><div class="score"><div class="big num">${total}</div><div><span class="pill ${cls}">${total >= 65 ? "In good shape" : total >= 45 ? "Fixable gaps" : "Needs work"}</span><p class="sub" style="margin-top:8px">Growth readiness out of 100: the average of the parts below.</p></div></div>
      <div class="grid3" style="margin-top:16px">${parts.map(p => `<div><b class="num">${p[1]}</b> ${p[0]}<div class="small sub">${esc(p[2])}</div></div>`).join("")}</div>
      ${er != null ? `<p class="note">Engagement benchmarks vary by study: ${esc(D.sources.er.text)} <a href="${D.sources.er.url}" target="_blank" rel="noopener">Source</a></p>` : ""}</div>`;
    h += `<div class="block"><h3>What's holding you back</h3>${bad.length ? bad.map(x => findRow(x, x.k.startsWith("c:") && S.checks[x.k.slice(2)] === 1 ? "a" : "r")).join("") : "<p class='sub'>Nothing big found yet. Add numbers and answer the profile checks for a full read.</p>"}<p class="small sub" style="margin-top:12px">Pick up to 3 fixes. A few specific fixes are easier to finish, and easier to measure.</p></div>`;
    if (good.length) h += `<div class="block"><h3>What's working</h3>${good.map(x => findRow(x, "g")).join("")}</div>`;
    if (A && A.list && !A.drivers_reach.concat(A.drivers_sends).some(d => d.confidence !== "weak")) h += `<div class="block"><h3>No clear pattern yet</h3><p class="sub">Nothing in your posts passes the evidence bar, so nothing is shown as a fact. Label your hooks and topics, post for 4 more weeks, and change one thing at a time.</p></div>`;
    if (A && A.list) {
      const ab = (key, label, title, color) => adjBars(title, adjusted(key, label), color) || bars(title + " (simple averages)", A["by_" + key], color);
      h += `<div class="block flat"><h3>Like for like</h3><p class="sub small">Simple averages can mislead: if most of your night posts were reels, night looks good partly because reels do. These charts adjust for format, time, hook, tags and your account's overall trend, so each one isolates one choice as far as your data allows. Grey bars aren't proven.</p></div>`;
      h += ab("format", "format", "Format", "var(--red)") + ab("slot", "time", "Time of day (in your export's time zone)", "var(--amber)") + ab("hook", "hook", "Hook", "var(--green)") + ab("length", "length", "Reel length", "var(--violet)") + bars("Day of week (simple averages, few posts per day)", A.by_weekday, "var(--cyan)");
      const card = p => `<div class="post"><b>${esc(p.caption || p.id)}</b> <span class="pill ${p.score >= 130 ? "g" : p.score >= 85 ? "a" : "r"} num">${p.score}</span><div class="small sub">${esc(p.type)}, ${esc(p.slot)}${p.link ? `, <a href="${esc(p.link)}" target="_blank" rel="noopener">open</a>` : ""}</div>
        <div class="small">${p.good.length ? "Did well: " + esc(p.good.join("; ")) : ""}${p.good.length && p.bad.length ? "<br>" : ""}${p.bad.length ? "Held back: " + esc(p.bad.join("; ")) : ""}</div></div>`;
      h += `<div class="two"><div class="block"><h3>Your 5 best posts, and why</h3>${A.top.map(card).join("")}</div><div class="block"><h3>Your 5 weakest, and why</h3>${A.bottom.map(card).join("")}</div></div>`;
      h += `<div class="block flat"><h3>Read this before acting</h3>${A.honest_notes.map(n => `<p class="small sub">${esc(n)}</p>`).join("")}</div>`;
    } else h += `<div class="block"><p>Add your numbers to see which formats, hooks, topics and times work for you.</p><button class="btn go" data-go="numbers">Add your numbers</button></div>`;
    h += `<div class="block flat"><h3>Who you're talking to</h3><p class="sub">${esc(S.tier)}, ${esc(S.country)}, posting in ${esc(S.lang)}.</p><p class="small sub">Instagram shows follower age, gender, top cities and countries (100+ followers), never income. If your audience is in India: urban Indians spend about ₹6,996 per person a month and rural Indians about ₹4,122 (MoSPI, 2023-24). The boardroom uses this as an estimate and labels it.</p></div>`;
    $("diag").innerHTML = h;
  }

  /* ---------- growth map ---------- */
  function renderMap() {
    const f = Number(S.followers), g = Number(S.goal), m = Number(S.months);
    if (!f) { $("mapview").innerHTML = `<div class="block"><p>Add your follower count in Your account.</p><button class="btn go" data-go="account">Add followers</button></div>`; return; }
    if (g <= f) { $("mapview").innerHTML = `<div class="block"><p>Your goal (${fmtN(g)}) is not above your current ${fmtN(f)}. Pick a bigger goal.</p></div>`; return; }
    const fpp = A && A.list ? E.median(A.list.map(p => p.follows)) : null;
    const M = E.growthMap(f, g, m, fpp, Number(S.pace));
    const end = new Date(); end.setMonth(end.getMonth() + m);
    const when = end.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const cls = M.verdict === "realistic" ? "g" : M.verdict === "ambitious" ? "a" : "r";
    let h = `<div class="block"><span class="pill ${cls}">${M.verdict[0].toUpperCase() + M.verdict.slice(1)}</span>
      <p style="margin-top:12px;font-size:var(--s4)">To reach <b>${fmtN(g)}</b> ${unit()} by ${when}, you need about <b class="num">${fmtN(M.per_day)}</b> new ${unit()} a day: <b class="num">${M.monthly_growth_needed_pct}%</b> growth every month.</p>`;
    if (M.follows_per_post_now === 0) h += `<p>Your posts in this export brought a median of 0 new ${unit()} each. Start with the profile fixes and the levers below.</p>`;
    else if (M.follows_per_post_now != null) h += `<p>Your posts bring a median of <b>${M.follows_per_post_now}</b> new ${unit()} each. At ${S.pace} posts a week you'd reach about <b>${fmtN(M.followers_at_your_pace)}</b> by ${when}. To hit the goal at that pace, each post needs about <b>${fmtN(M.follows_per_post_needed_at_your_pace)}</b>: <b>${M.multiplier_needed}x</b> today's rate.</p><p class="small sub">${esc(M.note)}</p>`;
    else h += `<p class="sub">Add your numbers to see what your posts bring in today.</p>`;
    h += chart(M, f) + `</div>`;
    const real = Math.round(f * Math.pow(1.05, m)), amb = Math.round(f * Math.pow(1.15, m));
    h += `<div class="block"><h3>Three honest targets for ${m} months</h3><div class="grid3"><div><b class="num">${fmtN(real)}</b><div class="small sub">Steady: about 5% a month from consistent posting.</div></div><div><b class="num">${fmtN(amb)}</b><div class="small sub">Ambitious: about 15% a month, needs collabs and a few breakout posts.</div></div><div><b class="num">${fmtN(g)}</b><div class="small sub">Your goal: ${M.monthly_growth_needed_pct}% a month.</div></div></div><p class="small sub" style="margin-top:10px">These growth rates are cautious rules of thumb, not promises or published benchmarks. Your own numbers will tell you within 4 weeks.</p></div>`;
    h += `<div class="block"><h3>Levers that close the gap</h3>` + levers().map(l => `<div class="find"><span class="lamp c"></span><div><b>${esc(l[0])}</b><span class="small sub">${l[1]}</span></div><span></span></div>`).join("") + `</div>`;
    h += money();
    $("mapview").innerHTML = h;
  }
  function chart(M, f) {
    const W = 640, H = 220, P = 36, n = M.months, maxY = Math.max(M.goal, M.followers_at_your_pace || 0) * 1.05;
    const x = i => P + (W - 2 * P) * i / n, y = v => H - P - (H - 2 * P) * v / maxY;
    const need = [[0, f]].concat(M.milestones.map(s => [s.month, s.followers])).map(([i, v]) => `${x(i)},${y(v)}`).join(" ");
    const paceEnd = M.followers_at_your_pace;
    const pace = paceEnd ? `<polyline points="${x(0)},${y(f)} ${x(n)},${y(paceEnd)}" fill="none" stroke="var(--amber)" stroke-width="3" stroke-dasharray="6 5"/><text x="${x(n) - 4}" y="${y(paceEnd) - 8}" text-anchor="end">Your pace: ${fmtN(paceEnd)}</text>` : "";
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Growth needed versus your current pace" style="width:100%;margin-top:12px">
      <line x1="${P}" y1="${H - P}" x2="${W - P}" y2="${H - P}" stroke="var(--rule)"/>${Array.from({ length: n + 1 }, (_, i) => `<text x="${x(i)}" y="${H - 12}" text-anchor="middle">${i ? "M" + i : "Now"}</text>`).join("")}
      <polyline points="${need}" fill="none" stroke="var(--green)" stroke-width="3"/><text x="${x(n) - 4}" y="${y(M.goal) - 8}" text-anchor="end">Goal path: ${fmtN(M.goal)}</text>${pace}</svg>`;
  }
  function levers() {
    const L = [], src = k => ` <a href="${D.sources[k].url}" target="_blank" rel="noopener">Source</a>`;
    if (A && A.list) {
      const best = A.drivers_reach.concat(A.drivers_sends).filter(d => d.multiplier >= 1.2 && d.confidence !== "weak").sort((a, b) => b.multiplier - a.multiplier)[0];
      const nm = best && best.feature.split(" (vs")[0], lab = !nm ? "" : nm.startsWith("hook: ") ? `Use more "${nm.slice(6)}" hooks` : nm.startsWith("format: ") ? `Post more ${(NOUN[nm.slice(8)] || nm.slice(8)).toLowerCase()}` : nm.startsWith("time: ") ? `Post more in the ${nm.slice(6)}` : nm.startsWith("#") ? `Make more posts like your ${nm.split(" / ")[0]} ones` : `Do more of "${nm}"`;
      if (best) L.push([lab, `Linked with ${best.multiplier.toFixed(1)}x in your posts (${best.confidence} evidence). Make it most of next month's posts, then check whether it holds.`]);
    }
    L.push(["Test 2 trial reels a week", esc(D.sources.trial.text) + src("trial")]);
    L.push(["Make every post worth sending", "End with a reason to send it to one friend. " + esc(D.sources.signals.text) + src("signals")]);
    L.push(["Collab monthly with creators your size", "Collab posts show you to a similar audience that already trusts the other creator."]);
    if (S.niche === "gaming" && iso(new Date()) <= "2026-11-26") L.push(["Own GTA 6 launch week", esc(D.sources.gta6.text) + " Plan first-hour reactions, settings, and 'things nobody told you' posts." + src("gta6")]);
    if (strength() < 70) L.push(["Fix your profile first", `Profile strength is ${strength()}%. Visitors who land from a good post decide in seconds whether to follow.`]);
    L.push(["Original over reposted", esc(D.sources.original.text) + src("original")]);
    return L;
  }
  function money() {
    const src = k => `<a href="${D.sources[k].url}" target="_blank" rel="noopener">Source</a>`;
    let h = `<div class="block"><h3>Money: what you can unlock</h3>`;
    if (S.platform === "youtube") h += `<p>${esc(D.sources.ypp.text)} ${src("ypp")}</p>`;
    else if (S.platform === "twitch") h += `<p>${esc(D.sources.twitch.text)} ${src("twitch")}</p>`;
    else h += `<p>On Instagram, most creators earn through brand deals, affiliate links and their own products. Brands look for a clear niche, real engagement and labelled ads.</p><p class="small sub">${esc(D.sources.asci.text)} ${src("asci")}</p>`;
    const n = niche(); h += `<p class="small sub">Routes that fit ${esc(n.name.toLowerCase())}: ${esc(n.money.join(", "))}.</p>${n.note ? `<p class="note">${esc(n.note)}</p>` : ""}</div>`;
    return h;
  }

  /* ---------- plan ---------- */
  const DAYN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  function pillars() { if (!S.pillars) S.pillars = niche().pillars.slice(0, 4); return S.pillars; }
  function plan() {
    const n = niche(), P = D.psychology, start = new Date(S.start + "T00:00:00"), items = [];
    if (isNaN(start)) return items;
    const fmts = S.platform === "youtube" ? { reels: ["short", "short", "short", "long video"], balanced: ["short", "long video"], teach: ["long video", "short"], stream: ["live", "short", "short"] }[S.mix]
      : S.platform === "twitch" ? ["live", "clip as reel", "live", "clip as reel"]
      : { reels: ["reel", "reel", "carousel", "reel", "reel", "image", "reel", "carousel", "reel", "reel"], balanced: ["reel", "carousel", "image", "reel", "carousel"], teach: ["carousel", "reel", "carousel", "carousel", "reel"], stream: ["live", "reel", "reel", "reel"] }[S.mix];
    const best = A && A.list ? A.top.map(t => t.caption) : [];
    const tags = (A && A.by_tag ? A.by_tag.filter(g => !g.thin && g.value !== "gaming").slice(0, 3).map(g => "#" + g.value) : []);
    const ctas = ["Send this to the friend who needs it.", "Save this for later.", "Follow for part 2.", "Comment your answer.", "Which one would you pick?"];
    let k = 0;
    for (let d = 0; d < 30; d++) {
      const day = new Date(start.getTime() + d * 864e5), wd = (day.getDay() + 6) % 7;
      const launch = S.niche === "gaming" && iso(day) === "2026-11-19";
      if (!S.days.includes(wd + 1) && !launch) continue;
      const per = Number(S.pace) > 7 ? 2 : 1;
      for (let j = 0; j < per; j++) {
        const pil = pillars()[k % pillars().length], fmt = fmts[k % fmts.length], ps = P[k % P.length], hook = n.hooks[k % n.hooks.length];
        let title = `${fmt[0].toUpperCase() + fmt.slice(1)}: ${pil}`, special = "";
        if (S.niche === "gaming" && iso(day) >= "2026-11-17" && iso(day) <= "2026-11-23") { special = iso(day) === "2026-11-19" ? "GTA 6 launch day: first-hour reaction or 'first 10 minutes' tips" : "GTA 6 launch week: settings, first missions, 'things nobody told you'"; title = `${fmt[0].toUpperCase() + fmt.slice(1)}: GTA 6 week, ${pil.toLowerCase()}`; }
        const time = j ? "13:00" : S.ptime;
        items.push({ date: iso(day), time, fmt, pillar: pil, title, special, principle: ps.name, hook: special || hook, how: ps.how + " " + ps.honest, cta: ctas[k % ctas.length],
          tags: `${tags.slice(0, 2).join(" ")} + up to ${5 - Math.min(2, tags.length)} specific to this post (5 max)`.trim(), ref: best[k % Math.max(1, best.length)] || "" });
        k++;
      }
    }
    return items;
  }
  function renderPlan() {
    fillSelect($("p-time"), "ptime"); fillSelect($("p-mix"), "mix"); $("p-start").value = S.start;
    $("p-days").setAttribute("role", "group"); $("p-days").setAttribute("aria-label", "Posting days"); $("p-pillars").setAttribute("role", "group"); $("p-pillars").setAttribute("aria-label", "Content pillars");
    $("p-days").innerHTML = DAYN.map((d, i) => `<button class="chip" data-day="${i + 1}" aria-pressed="${S.days.includes(i + 1)}">${d}</button>`).join("");
    $("p-pillars").innerHTML = niche().pillars.map(p => `<button class="chip" data-pillar="${esc(p)}" aria-pressed="${pillars().includes(p)}">${esc(p)}</button>`).join("");
    const items = plan(); renderPlan.items = items;
    const start = new Date(S.start + "T00:00:00"), lead = (start.getDay() + 6) % 7, byDate = {};
    items.forEach((it, i) => { (byDate[it.date] = byDate[it.date] || []).push(i); });
    let h = DAYN.map(d => `<div class="dh">${d}</div>`).join("") + Array.from({ length: lead }, () => '<div class="blank"></div>').join("");
    for (let d = 0; d < 30; d++) { const day = new Date(start.getTime() + d * 864e5), key = iso(day), its = byDate[key] || [];
      h += `<div class="day${its.length ? " has" : ""}" ${its.length ? `data-item="${its[0]}" tabindex="0" role="button" aria-label="${esc(items[its[0]].title)} on ${key}"` : ""}><span class="d">${day.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>${its.map(i => `<div><span class="f ${items[i].fmt.split(" ")[0]}">${esc(items[i].fmt)}</span> ${esc(items[i].time)}<br>${esc(items[i].special ? "GTA 6 week" : items[i].pillar)}</div>`).join("")}</div>`; }
    $("cal").innerHTML = h;
    const perWeek = S.days.length * (Number(S.pace) > 7 ? 2 : 1), warn = perWeek !== Number(S.pace) ? ` Your ticked days give ${perWeek} posts a week, but your plan says ${S.pace}. Tick ${Math.min(7, Number(S.pace))} days to match.` : "";
    $("cal-detail").innerHTML = items.length ? `<p class="small sub">${items.length} posts in 30 days. Tap a day for its details.${esc(warn)}</p>` : `<p class="sub">Pick at least one posting day.</p>`;
  }
  function showItem(i) {
    const it = renderPlan.items[i]; if (!it) return;
    $("cal-detail").innerHTML = `<div class="block flat"><h3>${esc(new Date(it.date + "T00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }))}, ${esc(it.time)}</h3>
      <p><b>${esc(it.title)}</b></p><p><b>Hook idea:</b> ${esc(it.hook)}</p><p><b>Psychology:</b> ${esc(it.principle)}. ${esc(it.how)}</p><p><b>End with:</b> ${esc(it.cta)}</p><p><b>Hashtags:</b> ${esc(it.tags)}</p>
      ${it.ref ? `<p class="small sub">Learn from your best post: "${esc(it.ref)}"</p>` : ""}<button class="btn line small" data-copyitem="${i}">Copy this brief</button></div>`;
  }
  function itemText(it) { return `${it.date} ${it.time} | ${it.title}\nHook: ${it.hook}\nPsychology: ${it.principle}\nEnd with: ${it.cta}\nHashtags: ${it.tags}`; }

  /* ---------- boardroom ---------- */
  function renderBoard() {
    $("seats").innerHTML = D.board.map(b => `<label class="seat"><input type="checkbox" data-seat="${b.id}" ${S.seats.includes(b.id) ? "checked" : ""}><span><b>${esc(b.name)}</b><span>${esc(b.job)}</span></span></label>`).join("");
    $("aud-ages").setAttribute("role", "group"); $("aud-ages").setAttribute("aria-label", "Audience ages"); $("aud-tiers").setAttribute("role", "group"); $("aud-tiers").setAttribute("aria-label", "Where your audience lives");
    $("aud-ages").innerHTML = D.audiences.ages.map(a => `<button class="chip" data-age="${a}" aria-pressed="${S.ages.includes(a)}">${a}</button>`).join("");
    $("aud-tiers").innerHTML = D.audiences.tiers.map(a => `<button class="chip" data-tier="${esc(a)}" aria-pressed="${S.tiers.includes(a)}">${esc(a.split(" (")[0])}</button>`).join("");
    if (!$("board-preview").hidden) $("board-preview").textContent = boardPrompt();
  }
  function boardPrompt() {
    const n = niche(), P = D.platforms[S.platform], tgt = D.reviewTargets.find(t => t.id === S.target) || D.reviewTargets[0];
    const yes = { 2: "yes", 1: "partly", 0: "no" }, L = [];
    L.push(`You are running an AI growth boardroom for ${/^[AEIOU]/.test(P.name) ? "an" : "a"} ${P.name} creator. Be honest and specific. Never invent numbers; if you estimate, say "estimate". Use short sentences.`);
    L.push("", "THE ACCOUNT", `- ${S.handle ? "@" + S.handle + ", " : ""}${n.name} (${S.sub}), ${fmtN(S.followers)} ${P.unit}, following ${fmtN(S.following)}.`,
      `- Goal: ${fmtN(S.goal)} ${P.unit} in ${S.months} months. Main aim: ${(OPTS.aim.find(a => a[0] === S.aim) || [, ""])[1]}. Can keep ${S.pace} posts a week. On camera: ${(OPTS.camera.find(a => a[0] === S.camera) || [, ""])[1]}.`,
      `- Audience: ${S.country}, ${S.tier}. Language: ${S.lang}.`);
    if (S.name || S.bio) L.push(`- Name field: "${S.name}". Bio: "${(S.bio || "").replace(/\n/g, " / ")}". Link: ${S.link || "none"}. Highlights: ${S.highlights}.`);
    const ans = checksList().filter(c => S.checks[c.id] != null).map(c => `${c.label}: ${yes[S.checks[c.id]]}`);
    if (ans.length) L.push(`- Profile checks (profile strength ${strength()}%): ` + ans.join("; ") + ".");
    if (A && A.list) {
      L.push("", `THEIR NUMBERS (${A.posts} posts from their own export${S.source === "sample" ? "; this is a fictional sample account" : ""})`,
        `- Typical post per 1,000 reached: ${METERS.map(([k, l]) => `${l.toLowerCase()} ${A.median[k] != null ? A.median[k].toFixed(1) : "n/a"}`).join(", ")}. Median reach ${fmtN(A.median_reach)}.`);
      const mv = meterValues(A); L.push(`- Last 10 posts vs usual: ${METERS.map(([, l], i) => `${l.toLowerCase()} ${mv[i] == null ? "n/a" : mv[i] + "%"}`).join(", ")}.`);
      if (A.engagement_rate_by_followers != null) L.push(`- Engagement rate (likes + comments / followers, median): ${A.engagement_rate_by_followers}%.`);
      const dr = d => `${d.feature}: ${d.multiplier}x (${d.confidence})`;
      if (A.drivers_reach.length) L.push(`- What moves reach, all else equal: ${A.drivers_reach.slice(0, 6).map(dr).join("; ")}.`);
      if (A.drivers_sends.length) L.push(`- What gets sends, all else equal: ${A.drivers_sends.slice(0, 4).map(dr).join("; ")}.`);
      L.push(`- Best posts: ${A.top.slice(0, 3).map(p => `"${p.caption}" (score ${p.score}; ${p.good.join(", ")})`).join(" | ")}.`);
      L.push(`- Weakest posts: ${A.bottom.slice(0, 3).map(p => `"${p.caption}" (score ${p.score}; ${p.bad.join(", ")})`).join(" | ")}.`);
      L.push("- Scores: 100 = their typical post. Treat thin groups (under 3 posts) as hints only.");
    } else L.push("", "THEIR NUMBERS: not provided. Ask for their last 30 posts' reach, sends, saves and follows if you need them, but still give a full answer.");
    if (S.fixes.length) L.push(`- Fixes they picked for this week: ${S.fixes.map(f => (S.fixLabels || {})[f] || f).join("; ")}.`);
    L.push("", "THEIR AUDIENCE", `- Ages: ${S.ages.join(", ") || "unknown"}. Gender: ${S.gender}. Where: ${S.tiers.map(t => t.split(" (")[0]).join(", ") || S.tier}. Main country: ${S.country}.`,
      "- Income is never shown by Instagram or YouTube. Estimate spending power from city type and age and label it \"estimate\". Reference: urban Indians spend about ₹6,996 per person a month, rural about ₹4,122 (MoSPI HCES 2023-24).");
    L.push("", "PLATFORM RULES TO RESPECT (checked 18 Nov 2026)", "- " + D.sources.signals.text, "- " + D.sources.hashtags.text, "- " + D.sources.trial.text, "- " + D.sources.original.text, "- " + D.sources.indexing.text, "- " + D.sources.asci.text);
    if (S.platform === "youtube") L.push("- " + D.sources.ypp.text); if (S.platform === "twitch") L.push("- " + D.sources.twitch.text);
    if (n.note) L.push("- " + n.note); if (S.niche === "gaming") L.push("- " + D.sources.gta6.text);
    L.push("", "WHAT TO REVIEW", `- ${tgt.ask}`);
    if (S.draft) L.push(`- Their draft:\n"""\n${S.draft}\n"""`);
    L.push("", "THE ROOM (each adviser: 3 to 6 bullet points in their own voice, a score 0-10 for the current state, and one action for this week)");
    D.board.filter(b => S.seats.includes(b.id)).forEach(b => L.push(`- ${b.name}: ${b.job}`));
    L.push("", `AI AUDIENCE PANEL: create ${S.panel} viewers who match the audience above (spread the ages, gender split and places as given). Give each a first name, age, city, what they usually watch and one real-life habit. They react to the draft${S.draft ? "" : " (or, with no draft, to the account's typical post)"} as real people in a normal scroll: most people scroll past most posts, so do not be kind. For each viewer: stops scrolling (yes/no), watches to the end (yes/half/no), sends to a friend (yes/no), saves (yes/no), follows (yes/no), and the comment they would write in their own words (or "-"). Then tally the rates.`);
    L.push("", "ANSWER IN THIS ORDER", "1. The CEO's verdict in 3 lines.", "2. Scorecard table: adviser, score 0-10, biggest problem, fix.", "3. The audience panel table and tally, and what would make more of them send, save or follow.",
      "4. Where the advisers disagree, and the CEO's ruling.", "5. This week: 3 actions in order, 1 thing to stop, and 2 ideas to test as trial reels.",
      "6. Rewrites: 3 hooks (mark the best), a caption with at most 5 hashtags, on-screen text" + (S.platform === "youtube" ? ", a title and thumbnail text" : "") + (["bio", "account"].includes(S.target) ? ", a name field and bio under 150 characters" : "") + ".",
      "7. Honest limits: what this review cannot know.", "", `Write in ${S.reply}. Tone: ${(OPTS.tone.find(t => t[0] === S.tone) || [, ""])[1]}.`);
    return L.join("\n");
  }
  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg); }
    catch (e) { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); toast(msg); } catch (e2) { toast("Copy failed: select the preview and copy it."); } t.remove(); }
  }

  /* ---------- brand check ---------- */
  function drawBrandTable(rows) {
    rows = rows || Array.from({ length: 12 }, () => ({}));
    $("c-table").innerHTML = `<thead><tr><th>#</th><th>Likes</th><th>Comments</th><th>Views (reels)</th><th>Paid?</th><th>Ad label?</th></tr></thead><tbody>` +
      rows.map((r, i) => `<tr><td>${i + 1}</td>${["likes", "comments", "views"].map(f => `<td><input type="number" min="0" aria-label="Post ${i + 1} ${f}" data-c="${f}" data-i="${i}" value="${r[f] == null ? "" : r[f]}" style="width:96px"></td>`).join("")}<td><input type="checkbox" aria-label="Post ${i + 1} is paid" data-c="paid" data-i="${i}" ${r.paid ? "checked" : ""} style="width:auto"></td><td><input type="checkbox" aria-label="Post ${i + 1} has an ad label" data-c="disclosed" data-i="${i}" ${r.disclosed ? "checked" : ""} style="width:auto"></td></tr>`).join("") + "</tbody>";
  }
  function runCheck() {
    const posts = []; for (let i = 0; i < 12; i++) { const g = f => document.querySelector(`[data-c="${f}"][data-i="${i}"]`);
      const likes = g("likes").value; if (likes === "") continue; posts.push({ likes: +likes, comments: +(g("comments").value || 0), views: g("views").value ? +g("views").value : null, paid: g("paid").checked, disclosed: g("disclosed").checked }); }
    try {
      const r = E.check({ handle: $("c-handle").value, followers: +$("c-followers").value, following: +$("c-following").value || null, posts });
      const cls = r.summary === "Looks healthy" ? "g" : r.summary === "High risk" ? "r" : "a", lamp = { ok: "g", watch: "a", risk: "r", info: "c" };
      $("c-result").innerHTML = `<div class="block"><div class="score"><div class="big num">${r.engagement_rate}%</div><div><span class="pill ${cls}">${r.summary}</span><p class="sub" style="margin-top:8px">${esc(r.handle || "This creator")}: ${fmtN(r.followers)} followers, ${r.tier} tier. Engagement = (likes + comments) / followers, median of recent posts.</p></div></div>
        ${r.signals.map(s => `<div class="find"><span class="lamp ${lamp[s.level]}"></span><div>${esc(s.text)}</div><span></span></div>`).join("")}<p class="note">${esc(r.note)} <a href="${D.sources.asci.url}" target="_blank" rel="noopener">ASCI rules</a></p></div>`;
    } catch (e) { $("c-result").innerHTML = `<div class="block"><b>${esc(e.message)}</b></div>`; }
  }

  /* ---------- render orchestration ---------- */
  function renderStep(id) {
    if (id === "account") { drawChecks(); bioTips(); drawPhone(); }
    if (id === "numbers") { drawExport(); drawPosts(); }
    if (id === "diagnosis") renderDiag();
    if (id === "map") renderMap();
    if (id === "plan") renderPlan();
    if (id === "board") renderBoard();
    if (id === "brand" && !$("c-table").innerHTML) drawBrandTable();
  }
  function refresh(key) {
    if (["rows", "followers", "goal", "months", "pace", "platform", "niche", "sub", "following"].includes(key)) analyse();
    heroMeters(); drawRail(); renderStep(S.step);
  }

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("button, [data-go], [data-goto], [data-item]"); if (!t) return;
    if (t.dataset.go || t.dataset.goto) { e.preventDefault(); go(t.dataset.go || t.dataset.goto, true); return; }
    if (t.dataset.next) { go(t.dataset.next, true); return; }
    if (t.dataset.check) { S.checks[t.dataset.check] = +t.dataset.v; save(); drawChecks(); drawRail(); return; }
    if (t.dataset.usebio) { S.bio = bioTips.drafts[+t.dataset.usebio]; $("a-bio").value = S.bio; save(); bioTips(); drawPhone(); return; }
    if (t.dataset.fix) { const k = t.dataset.fix; S.fixLabels = S.fixLabels || {};
      if (S.fixes.includes(k)) S.fixes = S.fixes.filter(x => x !== k); else if (S.fixes.length >= 3) { toast("3 fixes is the limit. Finish one first."); return; } else { S.fixes.push(k); S.fixLabels[k] = t.dataset.label; toast("Added to this week's fixes"); }
      save(); renderDiag(); return; }
    if (t.dataset.day) { const d = +t.dataset.day; S.days = S.days.includes(d) ? S.days.filter(x => x !== d) : S.days.concat(d).sort(); save(); renderPlan(); return; }
    if (t.dataset.pillar) { const p = t.dataset.pillar, cur = pillars(); S.pillars = cur.includes(p) ? (cur.length > 1 ? cur.filter(x => x !== p) : cur) : cur.concat(p); save(); renderPlan(); return; }
    if (t.dataset.item) { showItem(+t.dataset.item); return; }
    if (t.dataset.copyitem) { copy(itemText(renderPlan.items[+t.dataset.copyitem]), "Brief copied"); return; }
    if (t.dataset.age) { const a = t.dataset.age; S.ages = S.ages.includes(a) ? S.ages.filter(x => x !== a) : S.ages.concat(a); save(); renderBoard(); return; }
    if (t.dataset.tier) { const a = t.dataset.tier; S.tiers = S.tiers.includes(a) ? S.tiers.filter(x => x !== a) : S.tiers.concat(a); save(); renderBoard(); return; }
    switch (t.id) {
      case "start": go(S.rows.length ? "diagnosis" : "account", true); break;
      case "sample": case "sample2": loadSample(true); break;
      case "addrow": S.rows.push({ id: "M" + Date.now(), caption: "", time: iso(new Date()) + "T21:00:00", type: "reel", reach: null, likes: null, comments: null, shares: null, saves: null, follows: null, hook: "", topic: "", manual: true }); S.source = S.source === "none" ? "manual" : S.source; save(); drawPosts(); break;
      case "clear": S.rows = []; S.source = "none"; save(); analyse(); refresh("rows"); break;
      case "dl-ics": { const items = renderPlan.items || []; if (!items.length) { toast("Pick posting days first"); break; }
        download("growth-plan.ics", E.ics(items.map(it => ({ date: it.date, time: it.time, title: it.title, notes: itemText(it) })), S.country === "India" ? "Asia/Kolkata" : Intl.DateTimeFormat().resolvedOptions().timeZone), "text/calendar"); break; }
      case "dl-csv": { const items = renderPlan.items || []; if (!items.length) { toast("Pick posting days first"); break; } const rows = [["Date", "Time", "Format", "Pillar", "Hook idea", "Psychology", "End with", "Hashtags"]].concat(items.map(i => [i.date, i.time, i.fmt, i.pillar, i.hook, i.principle, i.cta, i.tags]));
        download("growth-plan.csv", rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n"), "text/csv"); break; }
      case "cp-plan": if (!(renderPlan.items || []).length) { toast("Pick posting days first"); break; } copy((renderPlan.items || []).map(itemText).join("\n\n"), "Plan copied"); break;
      case "copy-board": copy(boardPrompt(), "Copied. Paste it into Claude and send."); break;
      case "show-board": { const p = $("board-preview"); p.hidden = !p.hidden; p.textContent = boardPrompt(); t.textContent = p.hidden ? "Preview the message" : "Hide the preview"; break; }
      case "c-run": runCheck(); break;
      case "c-demo": $("c-handle").value = "@demo.creator"; $("c-followers").value = 48000; $("c-following").value = 61000;
        drawBrandTable(Array.from({ length: 12 }, (_, i) => ({ likes: 410 + (i % 3) * 6, comments: 2 + (i % 2), views: 3100 + i * 40, paid: i % 3 === 0, disclosed: i % 6 === 0 }))); runCheck(); break;
      case "m-back": case "m-next": { const i = STEPS.findIndex(s => s[0] === S.step), j = t.id === "m-next" ? Math.min(STEPS.length - 1, i + 1) : Math.max(0, i - 1); go(STEPS[j][0], true); break; }
    }
  });
  document.addEventListener("keydown", e => { const d = e.target.closest && e.target.closest("[data-item]"); if (d && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); showItem(+d.dataset.item); } });
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.row != null) { const r = S.rows[+t.dataset.row], f = t.dataset.f;
      if (f === "date") r.time = t.value ? t.value + "T21:00:00" : ""; else r[f] = t.type === "number" ? (t.value === "" ? null : +t.value) : t.value;
      save(); analyse(); heroMeters(); return; }
    if (t.dataset.seat) { S.seats = t.checked ? S.seats.concat(t.dataset.seat) : S.seats.filter(x => x !== t.dataset.seat); save(); renderBoard(); return; }
    if (t.id === "file" && t.files[0]) { const fr = new FileReader(); fr.onload = () => useText(fr.result, "file"); fr.readAsText(t.files[0]); }
    if (["p-start", "p-time", "p-mix"].includes(t.id)) setTimeout(renderPlan, 0);
  });
  const drop = $("drop");
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => { const f = e.dataTransfer.files[0]; if (f) { const fr = new FileReader(); fr.onload = () => useText(fr.result, "file"); fr.readAsText(f); } });
  drop.setAttribute("role", "button"); drop.setAttribute("aria-label", "Upload your CSV export");
  drop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("file").click(); } });
  function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }

  function loadSample(apply) {
    const useIt = (text, prof) => {
      if (!apply) return;
      Object.assign(S, { platform: "instagram", niche: "gaming", sub: "GTA 6 and open world", handle: prof.handle, followers: prof.followers, following: prof.following, name: "Rohan | GTA 6 and BGMI", bio: "Clips, settings and GTA 6 news\nNew reel every night", link: "youtube.com/@lowpingrohan", highlights: 2 });
      bindAll(); useText(text, "sample"); go("diagnosis", true);
    };
    if (typeof fetch !== "function") return;
    Promise.all([fetch("data/sample-instagram-export.csv").then(r => r.text()), fetch("data/sample-profile.json").then(r => r.json())])
      .then(([text, prof]) => { try { SAMPLE = E.audit(E.loadPosts(text), prof.followers); SAMPLE.list = E.loadPosts(text); E.scorePosts(SAMPLE.list); } catch (e) { SAMPLE = null; } heroMeters(); useIt(text, prof); })
      .catch(() => { if (apply) toast("The sample needs the website (it can't load from a saved file)."); });
  }

  if ("IntersectionObserver" in window) { const mb = document.querySelector(".mobilebar"); mb.hidden = true; new IntersectionObserver(es => es.forEach(en => { mb.hidden = !en.isIntersecting; }), { threshold: 0.05 }).observe($("studio")); }
  $("quick").addEventListener("submit", e => { e.preventDefault(); go(S.rows.length ? "diagnosis" : "account", true); });
  /* ---------- start ---------- */
  window.__cgs = { state: () => S, analysis: () => A, boardPrompt, plan: () => renderPlan.items, go, useText, findings, strength, setSample: (text, prof) => { SAMPLE = E.audit(E.loadPosts(text), prof.followers); SAMPLE.list = E.loadPosts(text); E.scorePosts(SAMPLE.list); heroMeters(); } };
  $("sources").innerHTML = "Sources, checked " + D.checked + ": " + Object.values(D.sources).map((s, i) => `<a href="${s.url}" target="_blank" rel="noopener">${i + 1}</a>`).join(", ");
  try { bindAll(); analyse(); heroMeters(); go(S.step || "account", false); }
  catch (e) { try { localStorage.removeItem("cgs-v1"); } catch (e2) { /* ignore */ } S = Object.assign({}, DEF); bindAll(); analyse(); heroMeters(); go("account", false); }
  loadSample(false);
})();
