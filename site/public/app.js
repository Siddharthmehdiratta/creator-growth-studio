/* Creator Growth Studio: the app. Reads a file (or the official Instagram login), works everything else out, renders the report.
   Nothing is sent anywhere. Settings are kept in this browser only. */
(function () {
  "use strict";
  const E = window.CGS, D = window.CGS_DATA, C = window.CGS_CONFIG || {};
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } } };
  const sess = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* too big or blocked */ } }, del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* blocked */ } } };
  const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
  const fmtN = n => (n == null || isNaN(n) ? "–" : Math.abs(n) >= 10000 ? compact.format(n) : Math.round(n).toLocaleString("en-IN"));
  const full = n => (n == null || isNaN(n) ? "–" : Math.round(n).toLocaleString("en-IN"));
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDate = d => (d ? `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}` : "No date");
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const icon = (id, cls) => `<svg aria-hidden="true"${cls ? ` class="${cls}"` : ""}><use href="#i-${id}"/></svg>`;
  const SLOT = { "morning (5-12)": ["Morning", "5 am to 12 pm", "09:00"], "afternoon (12-5 pm)": ["Afternoon", "12 to 5 pm", "13:00"], "evening (5-9 pm)": ["Evening", "5 to 9 pm", "19:00"], "night (9 pm-12)": ["Night", "9 pm to midnight", "21:30"], "late night (12-5 am)": ["Late night", "midnight to 5 am", "23:30"] };
  const FORMAT = { reel: ["Reel", "Reels"], carousel: ["Carousel", "Carousels"], image: ["Photo post", "Photo posts"], video: ["Video", "Videos"], short: ["Short", "Shorts"], stream: ["Stream", "Streams"], story: ["Story", "Stories"] };
  const fName = (f, plural) => (FORMAT[f] ? FORMAT[f][plural ? 1 : 0] : f.charAt(0).toUpperCase() + f.slice(1));
  const LANGS = D.audiences.languages, COUNTRIES = D.audiences.countries;

  /* ---------- state ---------- */
  const S = Object.assign({ platform: "instagram", niche: "", followers: null, goalX: "2", months: "6", pace: "4", ptime: "", start: "", country: "India", lang: "English",
    target: "account", tone: "honest", reply: "English", panel: "20", draft: "", seats: D.board.filter(b => b.default).map(b => b.id), filter: "all", sort: "new" }, store.get("cgs-settings", {}));
  let A = null, POSTS = [], META = { source: "", handle: "", name: "", detected: {} }, OPEN = null, CAL = [], DAY = null;
  const save = () => store.set("cgs-settings", Object.fromEntries(Object.entries(S).filter(([k]) => !["draft"].includes(k))));

  /* ---------- small UI helpers ---------- */
  function toast(msg) { const t = $("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2600); }
  function stars(n, lg) {
    let h = ""; for (let i = 1; i <= 5; i++) { const fill = n >= i ? "#F5A524" : n >= i - 0.5 ? "url(#g-half)" : "#E3E1EE"; h += `<svg viewBox="0 0 20 20"><use href="#i-star" fill="${fill}"/></svg>`; }
    return `<span class="stars${lg ? " lg" : ""}" role="img" aria-label="${n} out of 5 stars">${h}</span>`;
  }
  function ratio(r) { if (r == null || !isFinite(r)) return ""; const cls = r >= 1.15 ? "up" : r <= 0.85 ? "down" : "flat"; return `<span class="ratio ${cls}">${r >= 10 ? Math.round(r) : r.toFixed(1)}x</span>`; }
  const TYPE_IC = { reel: "M8 5v14l11-7z", video: "M8 5v14l11-7z", short: "M8 5v14l11-7z", stream: "M4 3h16v11l-4 4h-4l-3 3v-3H4zM11 7v4M15 7v4", carousel: "M7 4h11a2 2 0 0 1 2 2v11M4 8h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" };
  function thumb(id, type) {
    const u = META.thumbs && META.thumbs[id];
    if (u) return `<img class="thumb" src="${esc(u)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'thumb ph'}))">`;
    return `<span class="thumb ph ${esc(type || "")}" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="${TYPE_IC[type] || "M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4"}"/></svg></span>`;
  }
  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg); }
    catch (e) { const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); toast(msg); } catch (e2) { toast("Couldn't copy. Use Preview and copy it by hand."); } t.remove(); }
  }
  function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  const select = (id, opts, val, label, hint) => `<div class="field"><label for="${id}">${label}</label><select id="${id}">${opts.map(([v, t]) => `<option value="${esc(v)}"${String(v) === String(val) ? " selected" : ""}>${esc(t)}</option>`).join("")}</select>${hint ? `<span class="hint">${hint}</span>` : ""}</div>`;

  /* ---------- auto-detection ---------- */
  const NICHE_WORDS = {
    gaming: "gta|gaming|gamer|game|games|bgmi|pubg|valorant|fps|ps5|xbox|minecraft|free ?fire|clutch|stream|streamer|fortnite|cod|warzone|iracing|sim ?racing|esports|controller|console",
    tech: "phone|iphone|android|laptop|gadget|gadgets|tech|unboxing|ai tool|ai tools|chatgpt|smartwatch|earbuds|charger",
    cars: "car|cars|bike|bikes|drift|engine|turbo|supercar|exhaust|bmw|porsche|mercedes|motorsport|horsepower|track day|modified",
    fitness: "gym|workout|squat|fitness|protein|running|yoga|abs|deadlift|bench|cardio|reps",
    food: "food|recipe|chai|restaurant|biryani|cook|cooking|street food|dessert|foodie|thali|cafe",
    fashion: "outfit|outfits|style|fashion|ootd|shirt|sneakers|thrift|streetwear|kurta|saree",
    beauty: "skincare|makeup|serum|sunscreen|haircare|beauty|glow|moisturiser|moisturizer|lipstick",
    travel: "travel|trip|trek|goa|hotel|beach|itinerary|mountains|backpacking|homestay|wanderlust",
    photo: "photo|photography|photographer|lens|camera|lightroom|portrait|shot on|preset|presets",
    comedy: "pov|funny|comedy|meme|memes|relatable|sketch|prank",
    education: "learn|study|exam|explained|lesson|upsc|coding|neet|jee|students|teacher",
    finance: "money|invest|investing|sip|stocks|finance|loan|emi|savings|mutual fund|tax|crypto",
    business: "business|startup|founder|marketing|sales|freelance|entrepreneur|agency|clients",
    music: "song|cover|music|dance|beat|singing|guitar|piano|rap|choreography",
    lifestyle: "routine|day in|vlog|morning|habits|productivity|home tour|room tour",
    sports: "cricket|football|golf|tennis|match|swing|drill|ipl|badminton|coach",
    local: "visit us|open now|our cafe|our salon|book now|walk in|we are open|outlet",
    brand: "shop now|order now|link in bio to buy|our product|new launch|free shipping|customers"
  };
  function detectNiche(posts) {
    const text = " " + posts.map(p => p.caption.toLowerCase()).join(" \n ") + " ";
    let best = ["lifestyle", 0];
    Object.entries(NICHE_WORDS).forEach(([id, w]) => { const m = text.match(new RegExp(`(?:^|[^a-z0-9])#?(?:${w})(?=[^a-z0-9]|$)`, "g")); const n = m ? m.length : 0; if (n > best[1]) best = [id, n]; });
    return D.niches.some(n => n.id === best[0]) ? best[0] : "lifestyle";
  }
  function detectPlatform(rows) {
    const h = Object.keys(rows[0] || {}).map(x => x.toLowerCase());
    if (h.some(x => /video title|watch time \(hours\)|impressions click-through|subscribers/.test(x))) return "youtube";
    return "instagram";
  }
  const niche = () => D.niches.find(n => n.id === S.niche) || D.niches[0];
  const unit = () => (S.platform === "youtube" ? "subscribers" : "followers");

  /* ---------- loading ---------- */
  function loadRows(rows, meta) {
    let posts;
    try { posts = E.loadPosts(rows); } catch (e) { return fail(e.message); }
    POSTS = posts; META = Object.assign({ source: "file", handle: "", name: "", detected: {} }, meta || {});
    const rawRows = typeof rows === "string" ? E.parseCSV(rows) : rows;
    const plat = META.platform || detectPlatform(rawRows);
    if (plat === "youtube") POSTS.forEach(p => { p.type = p.duration && p.duration <= 60 ? "short" : "video"; });
    if (plat === "twitch") POSTS.forEach(p => { p.type = "stream"; });
    const first = k => { for (const r of rawRows) { const key = Object.keys(r).find(x => x.trim().toLowerCase() === k); if (key && String(r[key]).trim()) return String(r[key]).trim(); } return ""; };
    META.handle = META.handle || first("account username") || first("channel name");
    META.name = META.name || first("account name");
    META.detected = { platform: plat, niche: detectNiche(posts) };
    if (!meta || !meta.keepSettings) { S.platform = META.detected.platform; S.niche = META.detected.niche; S.followers = (meta && meta.followers) || null; }
    if (!S.niche) S.niche = META.detected.niche;
    analyse(); openApp(); return true;
  }
  function fail(msg) {
    if (!$("landing").hidden && $("w2").hidden) choosePlatform(S.platform || "instagram");
    const e = $("load-err"); e.textContent = msg; e.hidden = false; toast(msg); return false;
  }
  async function useDyi(file) {
    if (!window.CGS_DYI) return fail("Couldn't open that file type here. Upload a CSV instead.");
    try {
      busy("Opening your Instagram download...");
      const d = await window.CGS_DYI.read(file); busy();
      if (!d.posts && !d.rows.length) return fail("No posts were found in that file. When you request your download, tick Posts and Reels, and choose JSON.");
      if (d.withNumbers < 3) return fail(`Your file has ${d.posts} posts, but Instagram didn't include their numbers (reach, views, likes). For stars you need numbers: press Connect Instagram, or upload the Meta Business Suite CSV.`);
      const meta = { source: "file", fileName: file.name + " (Instagram download)" };
      if (loadRows(d.rows, meta)) { sess.set("cgs-data", JSON.stringify({ kind: "rows", rows: d.rows, meta })); toast(`Read ${d.rows.length} posts from your Instagram download.`); }
    } catch (e) { busy(); fail(e.message || "Couldn't read that file. Download it again from Instagram, in JSON format."); }
  }
  function useFile(file) {
    if (!file) return;
    if (/\.(zip|json)$/i.test(file.name)) return useDyi(file);
    if (file.size > 25 * 1024 * 1024) return fail("That file is over 25 MB. Export 90 days of posts and try again.");
    const r = new FileReader();
    r.onload = () => { const text = String(r.result || ""); if (loadRows(text, { source: "file", fileName: file.name })) { sess.set("cgs-data", JSON.stringify({ kind: "csv", text, meta: { source: "file", fileName: file.name } })); } };
    r.onerror = () => fail("Couldn't read that file. Try exporting it again.");
    r.readAsText(file);
  }
  async function loadSample() {
    try {
      const [text, prof] = await Promise.all([fetch("data/sample-instagram-export.csv").then(r => { if (!r.ok) throw 0; return r.text(); }), fetch("data/sample-profile.json").then(r => r.json())]);
      const meta = { source: "sample", followers: prof.followers, fileName: "Sample account" };
      if (loadRows(text, meta)) sess.set("cgs-data", JSON.stringify({ kind: "csv", text, meta }));
    } catch (e) { fail("The sample only loads on the website. Open the live site, or drop in your own file."); }
  }
  async function loadSampleYT() {
    try { const text = await fetch("data/sample-youtube-export.csv").then(r => { if (!r.ok) throw 0; return r.text(); });
      const meta = { source: "sample", platform: "youtube", followers: 4870, handle: "LowPing Rohan", fileName: "Sample channel" };
      if (loadRows(text, meta)) sess.set("cgs-data", JSON.stringify({ kind: "csv", text, meta }));
    } catch (e) { fail("The sample only loads on the website. Open the live site, or drop in your own file."); }
  }
  /* Twitch: no public export, so streams are typed into a small table and turned into rows the engine understands.
     Reach = viewer-hours (average viewers x hours), Follows = followers gained, Comments = chat messages. */
  const TW_COLS = [["date", "date", "Date"], ["start", "time", "Start"], ["title", "text", "Title"], ["avg", "number", "Avg viewers"], ["hours", "number", "Hours"], ["fol", "number", "New followers"], ["chat", "number", "Chat messages"]];
  let TW = [];
  function twBlank() { const d = new Date(); return { date: iso(d), start: "20:00", title: "", avg: "", hours: "", fol: "", chat: "" }; }
  function twRender() {
    if (!TW.length) TW = [twBlank(), twBlank(), twBlank()];
    $("tw-rows").innerHTML = TW.map((r, i) => `<tr>${TW_COLS.map(([k, t, l]) => `<td><input data-tw="${i}.${k}" type="${t}" ${t === "number" ? 'min="0" step="any" inputmode="decimal"' : ""} value="${esc(r[k])}" aria-label="${l}, stream ${i + 1}"${k === "title" ? ' placeholder="Stream title"' : ""}></td>`).join("")}<td><button class="iconbtn" type="button" data-twdel="${i}" aria-label="Remove stream ${i + 1}"><svg aria-hidden="true"><use href="#i-x"/></svg></button></td></tr>`).join("");
  }
  function twRows() {
    return TW.filter(r => Number(r.avg) > 0 && Number(r.hours) > 0 && r.date).map((r, i) => ({ "Post ID": "S" + String(i + 1).padStart(3, "0"), "Description": r.title || "Stream " + (i + 1), "Publish time": `${r.date} ${r.start || "20:00"}`, "Post type": "Stream",
      "Reach": Math.round(Number(r.avg) * Number(r.hours)), "Views": Math.round(Number(r.avg) * Number(r.hours)), "Follows": r.fol === "" ? "" : Number(r.fol), "Comments": r.chat === "" ? "" : Number(r.chat), "Duration (sec)": Math.round(Number(r.hours) * 3600) }));
  }
  function twGo(meta) {
    const rows = twRows();
    if (rows.length < 3) return fail("Add at least 3 streams with average viewers and hours filled in.");
    const f = parseInt($("tw-f").value, 10);
    const m = Object.assign({ source: "twitch", platform: "twitch", followers: f > 0 ? f : null, fileName: "Your streams" }, meta || {});
    if (loadRows(rows, m)) sess.set("cgs-data", JSON.stringify({ kind: "rows", rows, meta: m }));
  }
  async function loadSampleTW() {
    try { const text = await fetch("data/sample-twitch-streams.csv").then(r => { if (!r.ok) throw 0; return r.text(); });
      TW = E.parseCSV(text).map(r => ({ date: r["Date"], start: r["Start time"], title: r["Stream title"], avg: r["Average viewers"], hours: r["Hours streamed"], fol: r["Followers gained"], chat: r["Chat messages"] }));
      twRender(); $("tw-f").value = 340; twGo({ source: "sample", handle: "lowping_live", fileName: "Sample streamer" });
    } catch (e) { fail("The sample only loads on the website."); }
  }
  /* ---------- wizard ---------- */
  function wizStep(n) {
    $("w1").hidden = n !== 1; $("w2").hidden = n !== 2;
    [1, 2, 3].forEach(i => { const el = $("sb" + i); el.classList.toggle("on", i <= n); el.classList.toggle("now", i === n); });
    $("load-err").hidden = true; window.scrollTo(0, 0);
  }
  function choosePlatform(p) {
    if (!["instagram", "youtube", "twitch"].includes(p)) return;
    S.platform = p; save();
    document.querySelectorAll(".wplat").forEach(el => { el.hidden = el.dataset.for !== p; });
    if (p === "twitch") twRender();
    wizStep(2);
    const f = { instagram: $("handle"), youtube: $("drop-yt"), twitch: document.querySelector("#tw-rows input") }[p]; if (f) setTimeout(() => f.focus(), 50);
  }
  const TWITCH = () => S.platform === "twitch" && POSTS.some(p => p.type === "stream");
  /* Instagram: the connector (connect/worker.js) talks to Instagram's official API. Two ways in:
     connected = the owner logged in, so we get reach, watch time, skips, sends, saves, follows and comments;
     public    = any Creator or Business account by username, so only followers, likes, comments and Reel views. */
  const API = () => (C.connectUrl || "").replace(/\/$/, "");
  const localStamp = s => { const d = new Date(String(s || "").replace(/([+-]\d\d)(\d\d)$/, "$1:$2")); if (isNaN(d)) return ""; const p = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const kindOf = m => (m.product === "REELS" ? "Reel" : m.type === "CAROUSEL_ALBUM" ? "Carousel" : m.type === "VIDEO" ? "Video" : "Image");
  function apiRows(body, ins) {
    const followers = body.account.followers || null, pub = body.mode === "public";
    return body.media.map(m => {
      const v = (ins && ins[m.id]) || {}, has = x => x !== undefined && x !== null;
      const skip = has(v.reels_skip_rate) ? (v.reels_skip_rate <= 1 ? v.reels_skip_rate * 100 : v.reels_skip_rate) : "";
      return { "Post ID": m.id, "Description": m.caption, "Publish time": localStamp(m.time), "Permalink": m.link, "Post type": kindOf(m),
        "Reach": pub ? followers || "" : has(v.reach) ? v.reach : "", "Views": has(v.views) ? v.views : has(m.views) ? m.views : "",
        "Likes": has(v.likes) ? v.likes : m.likes ?? "", "Comments": has(v.comments) ? v.comments : m.comments ?? "",
        "Shares": has(v.shares) ? v.shares : "", "Saves": has(v.saved) ? v.saved : "", "Follows": has(v.follows) ? v.follows : "",
        "Profile visits": has(v.profile_visits) ? v.profile_visits : "",
        "Average watch time (sec)": has(v.ig_reels_avg_watch_time) ? Math.round(v.ig_reels_avg_watch_time / 100) / 10 : "", "Skip rate (%)": skip };
    });
  }
  function busy(msg) { const b = $("busy"); if (msg == null) { b.hidden = true; return; } $("busy-msg").textContent = msg; b.hidden = false; }
  async function api(path, token) {
    const r = await fetch(API() + path, token ? { headers: { Authorization: "Bearer " + token } } : {});
    const body = await r.json().catch(() => ({}));
    if (!r.ok || body.error) throw new Error(body.error || "Instagram didn't answer. Try again in a minute.");
    return body;
  }
  function metaFrom(body, extra) {
    const a = body.account, thumbs = {}; body.media.forEach(m => { if (m.thumb) thumbs[m.id] = m.thumb; });
    return Object.assign({ source: body.mode === "public" ? "public" : "instagram", handle: a.username, name: a.name, followers: a.followers, following: a.following, picture: a.picture, fileName: "Instagram", thumbs }, extra || {});
  }
  async function loadInstagram(token) {
    if (!API()) return fail("Connect Instagram isn't switched on for this site yet. Upload your export instead (2 minutes).");
    try {
      busy("Connecting to Instagram...");
      const body = await api("/account", token);
      if (!body.media.length) throw new Error("This account has no posts yet. Post 3 or more, then come back.");
      const ins = {}, list = body.media.map(m => m.id + ":" + (m.product || "FEED"));
      for (let i = 0; i < list.length; i += 20) {
        busy(`Reading post stats: ${Math.min(i + 20, list.length)} of ${list.length}`);
        (await api("/insights?ids=" + list.slice(i, i + 20).join(","), token)).rows.forEach(r => { if (r.v) ins[r.id] = r.v; });
      }
      busy("Reading comments...");
      let comments = {};
      try { comments = (await api("/comments?ids=" + list.slice(0, 20).join(","), token)).comments || {}; } catch (e) { /* comments are a bonus */ }
      const rows = apiRows(body, ins), meta = metaFrom(body, { comments });
      busy();
      if (loadRows(rows, meta)) sess.set("cgs-data", JSON.stringify({ kind: "rows", rows, meta }));
    } catch (e) { busy(); fail(e.message); }
  }
  async function loadLookup(raw) {
    const u = cleanHandle(raw);
    if (!u) return fail("Type an Instagram username, like natgeo, or paste a profile link.");
    if (!API()) { $("export-help").hidden = false; $("how-export").setAttribute("aria-expanded", "true"); return fail("Looking up accounts by username is being switched on. Until then, upload your Instagram export: it takes 2 minutes and gives even more detail."); }
    try {
      busy(`Reading @${u}...`);
      const body = await api("/lookup?u=" + encodeURIComponent(u));
      busy();
      if (!body.media.length) return fail(`@${u} has no public posts yet.`);
      const rows = apiRows(body, null), meta = metaFrom(body);
      if (loadRows(rows, meta)) sess.set("cgs-data", JSON.stringify({ kind: "rows", rows, meta }));
    } catch (e) { busy(); fail(e.message); }
  }
  function cleanHandle(raw) {
    let s = String(raw || "").trim(); const m = s.match(/instagram\.com\/([^/?#\s]+)/i); if (m) s = m[1];
    s = s.replace(/^@/, "").toLowerCase();
    return /^[a-z0-9._]{1,30}$/.test(s) && !["p", "reel", "reels", "stories", "explore"].includes(s) ? s : "";
  }
  const PUBLIC = () => META.source === "public";

  /* ---------- analysis ---------- */
  function analyse() {
    A = E.audit(POSTS, S.followers || null);
    if (PUBLIC()) A.honest_notes = ["Public numbers only: Instagram shows everyone the likes, comments and Reel views, but keeps reach, watch time, sends and saves private to the owner. Stars here compare likes and comments per follower. If this is your account, press Connect Instagram for the full report."]
      .concat(A.honest_notes.filter(n => !/watch time|Reach column/i.test(n)));
  }
  const dated = () => POSTS.filter(p => p.time).sort((a, b) => a.time - b.time);
  function recentVsUsual() {
    const recent = POSTS.slice().sort((a, b) => (b.time || 0) - (a.time || 0)).slice(0, 10);
    return E.SIGNALS.map(([k, label]) => { const m = A.median[k]; if (!m) return null; const r = E.median(recent.map(p => p.signals[k])); return r == null ? null : { k, label, pct: Math.round(100 * r / m) }; }).filter(Boolean);
  }
  function featText(name) {
    name = name.split(" / ")[0];
    if (name.startsWith("#")) return `Posts with ${name}`;
    const m = name.match(/^(\w+): (.*) \(vs (.*)\)$/); if (!m) return name;
    const [, kind, v, base] = m;
    if (kind === "format") return `${fName(v, true)} (compared with ${fName(base, true).toLowerCase()})`;
    if (kind === "time") return `Posts in the ${(SLOT[v] || [v])[0].toLowerCase()}, ${(SLOT[v] || [, ""])[1]} (compared with the ${(SLOT[base] || [base])[0].toLowerCase()})`;
    if (kind === "length") return `Reels ${v} long (compared with ${base})`;
    if (kind === "hook") return `"${v}" hooks (compared with "${base}")`;
    if (kind === "topic") return `${v} posts (compared with ${base})`;
    return name;
  }
  function shortFeat(name) {
    name = name.split(" / ")[0];
    if (name.startsWith("#")) return `${name} posts`;
    const m = name.match(/^(\w+): (.*) \(vs (.*)\)$/); if (!m) return name;
    const [, kind, v] = m;
    return kind === "format" ? fName(v, true) : kind === "time" ? `${(SLOT[v] || [v])[0]} posts` : kind === "length" ? `${v} reels` : kind === "hook" ? `"${v}" hooks` : v;
  }
  const strong = ds => (ds || []).filter(d => d.confidence !== "weak");
  const conf = c => `<span class="pill ${c === "strong" ? "good" : "warn"}">${c === "strong" ? "Strong evidence" : "Good evidence"}</span>`;
  const pct = x => `${x >= 1 ? "+" : ""}${Math.round((x - 1) * 100)}%`;

  function verdict() {
    const out = [], R = strong(A.drivers_reach), up = R.filter(d => d.multiplier > 1), down = R.filter(d => d.multiplier < 1);
    if (up[0]) out.push(["good", `${featText(up[0].feature)} reach ${up[0].multiplier}x more people`, `Same format, time and topic mix otherwise. Based on ${up[0].posts} posts. Do more of this.`]);
    if (down[0]) out.push(["bad", `${featText(down[0].feature)} reach ${Math.round(100 * (1 - down[0].multiplier))}% fewer people`, `Based on ${down[0].posts} posts, after adjusting for everything else. Change it or stop it.`]);
    const H = strong(A.drivers_hold).concat(strong(A.drivers_watch)).filter(d => d.multiplier > 1)[0];
    if (H) out.push(["good", `${featText(H.feature)} keep people watching longer`, "Watch time is the signal Instagram says matters most."]);
    const S2 = strong(A.drivers_sends).filter(d => d.multiplier > 1)[0];
    if (S2) out.push(["good", `${featText(S2.feature)} get sent to friends ${S2.multiplier}x more`, "Sends are the strongest way to reach people who don't follow you yet."]);
    const slots = A.by_slot.filter(g => !g.thin);
    if (slots.length >= 2) { const b = slots[0]; out.push(["info", `Your best time is the ${SLOT[b.value] ? SLOT[b.value][0].toLowerCase() + ", " + SLOT[b.value][1] : b.value}`, `Posts then score ${Math.round(b.median_score)} against your usual 100 (${b.posts} posts).`]); }
    const rv = recentVsUsual(), last = E.median(POSTS.slice().sort((a, b) => (b.time || 0) - (a.time || 0)).slice(0, 10).map(p => p.score));
    if (POSTS.length >= 15 && last != null) out.push([last >= 105 ? "good" : last <= 90 ? "bad" : "info", last >= 105 ? `Your last 10 posts are doing better than usual` : last <= 90 ? `Your last 10 posts are doing worse than usual` : `Your last 10 posts are about normal for you`, `They score ${Math.round(last)} against your usual 100.` + (rv.find(x => x.k === "sends" && x.pct < 80) ? " Sends have dropped the most." : "")]);
    if (!up[0] && !down[0]) out.unshift(["info", "No clear pattern yet", POSTS.length < 20 ? `With ${POSTS.length} posts, nothing stands out beyond luck. Keep posting and change one thing at a time.` : "Your formats, times and topics perform about the same. The hook and the idea matter more: test new hooks with trial reels."]);
    return out.slice(0, 5);
  }

  /* ---------- app shell ---------- */
  const TABS = ["overview", "posts", "ideas", "plan", "board"];
  let TAB = "overview";
  function openApp() {
    $("landing").hidden = true; $("app").hidden = false; $("load-err").hidden = true; document.body.classList.add("in-app");
    const h = META.handle || (META.source === "file" ? META.fileName : "Your account") || "Your account";
    $("av").textContent = (h.replace(/^@/, "")[0] || "Y").toUpperCase();
    if (META.picture) { const im = new Image(); im.alt = ""; im.referrerPolicy = "no-referrer"; im.onload = () => { $("av").textContent = ""; $("av").appendChild(im); }; im.src = META.picture; }
    $("acct-name").textContent = META.handle ? (/\s/.test(META.handle) ? META.handle : "@" + META.handle.replace(/^@/, "")) : h;
    const d = dated(), range = d.length ? ` from ${fmtDate(d[0].time)} to ${fmtDate(d[d.length - 1].time)}` : "";
    $("acct-meta").textContent = `${POSTS.length} ${POSTS.length === 1 ? "post" : "posts"}${range}${META.source === "sample" ? ", fictional sample" : META.source === "public" ? ", public numbers" : META.source === "instagram" ? ", live from Instagram" : ""}`;
    document.title = `${$("acct-name").textContent} report: Creator Growth Studio`;
    S.ptime = S.ptime || ""; save();
    renderAll(); showTab(location.hash.slice(1) && TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "overview", true);
    window.scrollTo(0, 0);
  }
  function showTab(t, quiet) {
    TAB = t; TABS.forEach(x => { $("tab-" + x).setAttribute("aria-selected", String(x === t)); $("tab-" + x).tabIndex = x === t ? 0 : -1; $("p-" + x).hidden = x !== t; });
    if (!quiet) { history.replaceState(null, "", "#" + t); window.scrollTo({ top: 0 }); }
  }
  function renderAll() { renderOverview(); renderPosts(); renderIdeas(); renderPlan(); renderBoard(); }

  /* ---------- overview ---------- */
  function renderOverview() {
    const avg = Math.round(2 * POSTS.reduce((a, p) => a + p.stars, 0) / POSTS.length) / 2;
    const lv = S.followers ? E.levelOf(S.followers) : null;
    const rv = recentVsUsual(), V = verdict(), d = dated();
    const top = A.top.slice(0, 3), bottom = A.bottom.slice(0, 3);
    const best = A.by_format.filter(g => !g.thin)[0];
    $("p-overview").innerHTML = `
      <div class="acct-hero">
        <div class="ah-id"><span class="ah-av">${META.picture ? `<img src="${esc(META.picture)}" alt="" referrerpolicy="no-referrer">` : esc(((META.handle || "Y").replace(/^@/, "")[0] || "Y").toUpperCase())}</span>
          <div><h2>${esc(META.handle ? (/\s/.test(META.handle) ? META.handle : "@" + META.handle.replace(/^@/, "")) : "Your account")}</h2><p>${POSTS.length} posts${d.length ? `, ${fmtDate(d[0].time)} to ${fmtDate(d[d.length - 1].time)}` : ""}. 100 means normal for you, so the report fits any account size.</p>
          <span class="ah-tags">${lv ? `<span class="ah-tag lvl">${lv.level}</span>` : ""}<span class="ah-tag">${{ sample: "Fictional sample", public: "Public numbers", instagram: "Live from Instagram", file: "From your file" }[META.source] || "Your data"}</span>${S.niche ? `<span class="ah-tag">${esc(niche().name)}</span>` : ""}</span></div></div>
        <div class="ah-kpis">
          <div><span>Average rating</span><b>${avg.toFixed(1)}</b>${stars(avg)}</div>
          <div><span>${PUBLIC() ? "Typical likes" : TWITCH() ? "Typical viewer-hours" : META.detected && META.detected.platform === "youtube" ? "Typical views" : "Typical reach"}</span><b>${PUBLIC() ? fmtN(E.median(POSTS.map(p => p.likes))) : fmtN(A.median_reach)}</b><small>${best ? `${fName(best.value, true)} do best` : "per post"}</small></div>
          <div><span>${unit().charAt(0).toUpperCase() + unit().slice(1)}</span>${S.followers ? `<b>${fmtN(S.followers)}</b><small>${lv ? lv.level + " level" : ""}</small>` : `<b>–</b><button class="linkbtn" data-act="adjust">Add count</button>`}</div>
          <div><span>Posts analysed</span><b>${POSTS.length}</b><small>${top.length ? `${A.reports.filter(r => r.stars >= 4).length} rated 4 stars or more` : ""}</small></div>
        </div>
      </div>
      <div class="grid g2">
        <div class="card"><h3>The short version</h3><p class="sub">The patterns that stand out in your posts.</p>
          <div class="verdict">${V.map(([c, t, s]) => `<div class="item"><span class="dot ${c}">${icon(c === "good" ? "upar" : c === "bad" ? "down" : "info")}</span><div><b>${esc(t)}</b><p>${esc(s)}</p></div></div>`).join("")}</div></div>
        <div class="card"><h3>Your last 10 posts</h3><p class="sub">Each signal compared with your usual. 100% means normal.</p>
          ${rv.length ? rv.map(x => `<div class="mrow"><span>${esc(x.label)}</span><span class="v">${x.pct}%</span><div class="meter${x.pct < 85 ? " bad" : ""}"><i style="width:${Math.min(100, x.pct / 2)}%"></i></div></div>`).join("") : `<p class="muted small">Not enough signals in this file.</p>`}
          ${lv ? `<div class="callout info" style="margin-top:16px">${icon("info")}<p><b>${lv.level}:</b> ${esc(lv.focus.replace(/^[^.]*\.\s*/, ""))}</p></div>` : ""}</div>
      </div>
      <div class="grid g2">
        <div class="card"><h3>Best posts</h3><p class="sub">Highest rated, and why.</p>${top.map(p => miniPost(p)).join("")}</div>
        <div class="card"><h3>Weakest posts</h3><p class="sub">Lowest rated, and what held them back.</p>${bottom.map(p => miniPost(p, true)).join("")}</div>
      </div>
      ${driversCard()}
      ${brandCard()}
      <div class="callout info" style="margin-top:16px">${icon("info")}<p>${A.honest_notes.map(esc).join(" ")}</p></div>`;
  }
  function brandCard() {
    if (!S.followers || POSTS.length < 6 || META.source === "file" && !POSTS.some(p => p.likes)) return "";
    let c; try { c = E.check({ handle: META.handle, followers: S.followers, following: META.following || null, posts: POSTS.slice().sort((a, b) => (b.time || 0) - (a.time || 0)).slice(0, 30).map(p => ({ likes: p.likes, comments: p.comments, views: p.type === "reel" ? p.views : null })) }); } catch (e) { return ""; }
    const sig = c.signals.filter(x => !/paid/i.test(x.text)), cls = { ok: "good", watch: "warn", risk: "bad", info: "info" };
    return `<div class="card" style="margin-top:16px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:baseline;flex-wrap:wrap"><h3>Audience health check</h3><span class="pill ${c.summary === "Looks healthy" ? "good" : c.summary === "High risk" ? "bad" : "warn"}">${esc(c.summary)}</span></div>
      <p class="sub">What a brand sees before paying for a post: engagement compared with accounts of the same size (${esc(c.tier)} tier). Benchmarks: Buffer data via IQFluence.</p>
      <div class="verdict">${sig.map(x => `<div class="item"><span class="dot ${cls[x.level]}">${icon(x.level === "ok" ? "check" : "info")}</span><div><p style="margin:0;color:var(--ink)">${esc(x.text)}</p></div></div>`).join("")}</div>
      <p class="small muted" style="margin:12px 0 0">${esc(c.note)}</p></div>`;
  }
  function miniPost(p, weak) {
    const why = (weak ? p.bad : p.good).slice(0, 2).join("; ");
    return `<div class="mrow" style="grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center"><span>${stars(p.stars)}</span><span style="min-width:0"><button class="linkbtn" data-open="${esc(p.id)}" style="text-decoration:none;color:var(--ink);font-weight:500;text-align:left;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">${esc(p.caption || "Untitled post")}</button><span class="small muted">${why ? esc(why.charAt(0).toUpperCase() + why.slice(1)) : "About usual on every signal"}</span></span></div>`;
  }
  function driversCard() {
    const rows = [["People reached", A.drivers_reach], ["Sent to friends", A.drivers_sends], ["Watch time", A.drivers_watch], ["Follows", A.drivers_follows]]
      .flatMap(([what, ds]) => strong(ds).slice(0, 3).map(d => ({ what, d })));
    if (!rows.length) return `<div class="card"><h3>What changes your results</h3><p class="sub" style="margin:0">${POSTS.length < 12 ? `This needs at least 12 posts. You have ${POSTS.length}.` : "Nothing passes the evidence bar yet. That's normal: it means no single format, time or hashtag is clearly better or worse for you. Test one change at a time."}</p></div>`;
    return `<div class="card"><h3>What changes your results</h3><p class="sub">Each line compares like with like: the other factors are held equal, and only findings that pass a strict test are shown.</p>
      <div class="scroll"><table class="table"><thead><tr><th>What you do</th><th>Affects</th><th style="text-align:right">Effect</th><th>Evidence</th></tr></thead><tbody>
      ${rows.map(({ what, d }) => `<tr><td>${esc(featText(d.feature))}</td><td>${what}</td><td style="text-align:right;font-weight:600;color:${d.multiplier >= 1 ? "var(--accent-ink)" : "var(--bad)"}">${pct(d.multiplier)}</td><td>${conf(d.confidence)}</td></tr>`).join("")}
      </tbody></table></div></div>`;
  }

  /* ---------- posts ---------- */
  function filtered() {
    let list = A.reports.slice();
    const f = S.filter;
    if (f === "top") list = list.filter(r => r.stars >= 4); else if (f === "low") list = list.filter(r => r.stars <= 2.5);
    else if (["reel", "carousel", "image", "video"].includes(f)) list = list.filter(r => r.type === f);
    if (S.sort === "best") list.sort((a, b) => b.score - a.score); else if (S.sort === "worst") list.sort((a, b) => a.score - b.score);
    else if (S.sort === "reach") list.sort((a, b) => b.post.reach - a.post.reach);
    return list;
  }
  function renderPosts() {
    const types = [...new Set(POSTS.map(p => p.type))].filter(t => FORMAT[t] && t !== "story");
    const hasWatch = POSTS.some(p => p.avg_watch), hasSends = POSTS.some(p => p.shares != null);
    const list = filtered();
    $("p-posts").innerHTML = `
      <div class="panel-head"><div><h2>${TWITCH() ? "Every stream, rated" : META.detected && META.detected.platform === "youtube" ? "Every video, rated" : "Every post, rated"}</h2><p>Open a post to see each number against your usual, why it worked or didn't, and what to do next time.</p></div></div>
      <div class="toolbar">
        <label class="sr" for="pf">Show</label><select class="inline-select" id="pf">${[["all", "All posts"], ["top", "4 stars and up"], ["low", "2.5 stars and under"]].concat(types.length > 1 ? types.map(t => [t, fName(t, true) + " only"]) : []).map(([v, t]) => `<option value="${v}"${S.filter === v ? " selected" : ""}>${t}</option>`).join("")}</select>
        <label class="sr" for="ps">Sort</label><select class="inline-select" id="ps">${[["new", "Newest first"], ["best", "Highest rated"], ["worst", "Lowest rated"], ["reach", "Most reach"]].map(([v, t]) => `<option value="${v}"${S.sort === v ? " selected" : ""}>${t}</option>`).join("")}</select>
        <span class="count">${list.length} of ${POSTS.length} posts</span>
      </div>
      <div class="posts">
        <div class="plist-head"><span>Rating</span><span>Post</span><span>${PUBLIC() || (META.detected && META.detected.platform === "youtube") ? "Views" : TWITCH() ? "Viewer-hours" : "Reach"}</span><span>${TWITCH() ? "New followers" : hasWatch ? "Avg watch" : "Likes"}</span><span>${hasSends ? (META.detected && META.detected.platform === "youtube" ? "Shares" : "Sends") : TWITCH() ? "Chat" : "Comments"}</span><span></span></div>
        ${list.length ? list.map(r => postRow(r, hasWatch, hasSends)).join("") : `<div class="empty-state"><h3>No posts match</h3><p>Pick a different filter.</p></div>`}
      </div>
      ${commentsCard()}`;
  }
  const secTxt = v => (v >= 60 ? `${Math.floor(v / 60)}:${String(Math.round(v % 60)).padStart(2, "0")}` : v.toFixed(1) + " s");
  function postRow(r, hasWatch, hasSends) {
    const p = r.post, open = OPEN === r.id;
    const c2 = TWITCH() ? fmtN(p.follows) : hasWatch ? (p.avg_watch ? secTxt(p.avg_watch) : "–") : fmtN(p.likes), c3 = hasSends ? fmtN(p.shares) : fmtN(p.comments);
    return `<button class="prow" data-row="${esc(r.id)}" aria-expanded="${open}">
      <span class="stars-cell">${stars(r.stars)}<span class="small muted num" style="display:block">Score ${r.score}</span></span>
      <span class="main" style="min-width:0">${thumb(r.id, p.type)}<span class="cap" style="display:block">${esc(r.caption || "Untitled post")}</span><span class="meta">${p.time ? fmtDate(p.time) : "No date"}, ${fName(p.type)}${SLOT[p.slot] ? ", " + SLOT[p.slot][0].toLowerCase() : ""}</span></span>
      ${PUBLIC() ? `<span class="m first">${p.views ? fmtN(p.views) + "<small>views</small>" : fmtN(p.likes) + "<small>likes</small>"}</span>` : `<span class="m first">${fmtN(p.reach)}<small>${TWITCH() ? "viewer-hours" : META.detected && META.detected.platform === "youtube" ? "views" : "reached"}</small></span>`}<span class="m">${c2}</span><span class="m">${c3}</span>
      <span class="chev">${icon("chev")}</span></button>${open ? postDetail(r) : ""}`;
  }
  function postDetail(r) {
    const rows = r.rows.filter(x => !/\(count\)$/.test(x.metric) || x.value != null).filter(x => !(PUBLIC() && x.metric === "Reach"))
      .map(x => PUBLIC() ? Object.assign({}, x, { metric: x.metric.replace("per 1,000 reached", "per 1,000 followers") }) : TWITCH() ? Object.assign({}, x, { metric: x.metric.replace("per 1,000 reached", "per 1,000 viewer-hours").replace(/^Reach$/, "Viewer-hours").replace("Comments", "Chat messages") }) : x);
    const FIELD = { "Views": "views", "Profile visits": "profile_visits", "Likes (count)": "likes", "Comments (count)": "comments", "Sends (shares) (count)": "shares", "Saves (count)": "saves", "Follows (count)": "follows" };
    rows.forEach(x => { const f = FIELD[x.metric]; if (x.usual == null && f) { const m = E.median(POSTS.map(p => p[f])); if (m) { x.usual = m; x.ratio = x.value / m; } } });
    const cm = META.comments && META.comments[r.id], ck = cm && cm.length ? E.classifyComments(cm.join("\n")) : null;
    const fmtV = (x) => x.metric.startsWith("Average watch") ? x.value + " s" : /rate|%/.test(x.metric) ? x.value + "%" : /per 1,000/.test(x.metric) ? x.value : full(x.value);
    const fmtU = (x) => x.usual == null ? "" : x.metric.startsWith("Average watch") ? x.usual + " s" : /rate|%/.test(x.metric) ? x.usual + "%" : /per 1,000/.test(x.metric) ? x.usual : full(x.usual);
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    return `<div class="pdetail"><div class="cols">
      <div><h4>The numbers</h4><div class="scroll"><table class="table"><thead><tr><th>Metric</th><th style="text-align:right">This post</th><th style="text-align:right">Your usual</th></tr></thead><tbody>
        ${rows.map(x => `<tr><td>${esc(x.metric.replace(" (count)", ""))}</td><td style="text-align:right;font-weight:600">${fmtV(x)}${ratio(x.ratio)}</td><td style="text-align:right" class="muted">${fmtU(x) || "–"}</td></tr>`).join("")}
      </tbody></table></div></div>
      <div>${r.good.length ? `<h4>Why it worked</h4><ul>${r.good.map(g => `<li>${esc(cap(g))}</li>`).join("")}</ul>` : ""}
        ${r.bad.length ? `<h4>What held it back</h4><ul>${r.bad.map(g => `<li>${esc(cap(g))}</li>`).join("")}</ul>` : ""}
        ${!r.good.length && !r.bad.length ? `<h4>About normal</h4><p class="small muted">Every signal was within the usual range for you.</p>` : ""}
        ${r.next.length ? `<h4>Next time</h4><ul>${r.next.map(g => `<li>${esc(g)}</li>`).join("")}</ul>` : ""}
        ${ck ? `<h4>Comments (${ck.total})</h4><p class="small muted" style="margin:0 0 8px">${Object.keys(CK).filter(k => ck[k].length).map(k => `${CK[k][0]}: ${ck[k].length}`).join(", ")}</p>${["request", "question"].filter(k => ck[k].length).map(k => `<p class="small" style="margin:0 0 6px"><b>${CK[k][0]}:</b> ${ck[k].slice(0, 2).map(t => "\u201c" + esc(t.slice(0, 120)) + "\u201d").join(" ")}</p>`).join("")}` : ""}
        <p class="small" style="margin:0">${r.link ? `<a href="${esc(r.link)}" target="_blank" rel="noopener">Open the post on Instagram</a>` : ""}</p></div>
    </div></div>`;
  }
  const CK = { question: ["Questions", "Answer them with a reply video: each question is a free post idea."], request: ["Requests", "People are telling you what to post next. Make these first."], criticism: ["Criticism", "One person is noise. Three people saying the same thing is a signal: fix it."], praise: ["Praise", "Reply in the first hour and pin the best one."], spam: ["Spam", "Hide or delete these. Turn on Hidden Words in Instagram settings."], other: ["Other", "General chat. Reply to keep the conversation going."] };
  function commentsCard() {
    const all = META.comments ? Object.values(META.comments).flat() : [];
    const auto = all.length ? E.classifyComments(all.join("\n")) : null;
    return `<div class="card" style="margin-top:16px"><h3>${auto ? "What your comments say" : "Sort your comments"}</h3>
      <p class="sub">${auto ? `Read automatically from your ${Object.keys(META.comments).length} newest posts: ${auto.total} comments. You can also paste more below.` : "Copy the comments from any post and paste them here, one per line. Works with English and Hinglish."}</p>
      ${auto ? `<div id="cm-auto">${commentsView(auto)}</div>` : ""}
      <div class="field" style="margin-top:${auto ? 20 : 0}px"><label for="cm-text" class="sr">Comments</label><textarea id="cm-text" placeholder="Paste comments here, one per line"></textarea></div>
      <div style="display:flex;gap:8px;margin-top:12px"><button class="btn${auto ? "" : " primary"}" id="cm-run">Sort comments</button></div><div id="cm-out"></div></div>`;
  }
  function commentsView(r) {
    return `<div style="margin-top:8px">${Object.keys(CK).filter(k => r[k].length).map(k => `<div class="mrow" style="grid-template-columns:minmax(0,1fr) auto"><span><b>${CK[k][0]}</b> <span class="muted small">${CK[k][1]}</span><span class="small" style="display:block;color:var(--ink-2);margin-top:4px">${r[k].slice(0, 4).map(esc).join("<br>")}${r[k].length > 4 ? `<br><span class="muted">and ${r[k].length - 4} more</span>` : ""}</span></span><span class="v">${r[k].length}</span><div class="meter"><i style="width:${Math.round(100 * r[k].length / r.total)}%"></i></div></div>`).join("")}</div>`;
  }
  function runComments() {
    const r = E.classifyComments($("cm-text").value);
    if (!r.total) { $("cm-out").innerHTML = `<p class="err">Paste at least one comment first.</p>`; return; }
    $("cm-out").innerHTML = `<div style="margin-top:12px">${commentsView(r)}</div>`;
  }

  /* ---------- what to post ---------- */
  function bestOf(groups) { return (groups || []).filter(g => !g.thin && g.median_score != null)[0] || null; }
  function bestDays(n) {
    const ranked = A.by_weekday.filter(g => !g.thin).map(g => g.value), DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const order = ranked.concat(["Tuesday", "Thursday", "Saturday", "Monday", "Wednesday", "Friday", "Sunday"].filter(d => !ranked.includes(d)));
    return order.slice(0, n).map(d => DAYS.indexOf(d)).sort((a, b) => a - b);
  }
  function bestTime() { const s = bestOf(A.by_slot); return S.ptime || (s && SLOT[s.value] ? SLOT[s.value][2] : "19:00"); }
  const t12 = t => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}${m ? ":" + String(m).padStart(2, "0") : ""} ${h < 12 ? "am" : "pm"}`; };
  function ideas() {
    const n = niche(), P = D.psychology, fmt = bestOf(A.by_format), len = bestOf(A.by_length), hook = bestOf(A.by_hook), tag = bestOf(A.by_tag);
    const fmtTxt = fmt ? fName(fmt.value) : "Reel", lenTxt = len ? ` (${len.value})` : "", when = `${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][bestDays(1)[0]]}, ${t12(bestTime())}`;
    const out = [], topPost = A.top[0];
    if (topPost) out.push({ title: "Make a part 2 of your best post", hook: `Part 2: ${topPost.caption.replace(/#\w+/g, "").trim().slice(0, 70)}`, why: `Your best post scored ${topPost.score} (${topPost.stars} stars)${topPost.good[0] ? ": " + topPost.good[0] : ""}. A follow-up reaches the same people while the interest is fresh.`, format: fName(topPost.type) + lenTxt, when, principle: P.find(x => x.id === "openloop") });
    if (S.niche === "gaming") out.push({ title: "GTA 6 launch week", hook: "GTA 6 is out. Do this before your first mission.", why: "GTA 6 launches on 19 November 2026. Real dates pull in people searching for it right now.", format: fmtTxt + lenTxt, when: "Thursday 19 November, " + t12(bestTime()), principle: P.find(x => x.id === "scarcity") });
    const S2 = strong(A.drivers_sends).find(d => d.multiplier > 1);
    n.hooks.slice(0, 3).forEach((h, i) => out.push({ title: i === 0 ? `A ${n.name.toLowerCase()} post built to be sent` : `Test a new hook: ${P[i % P.length].name.toLowerCase()}`, hook: h,
      why: i === 0 ? (S2 ? `${featText(S2.feature)} get sent ${S2.multiplier}x more for you. End with "send this to the friend who...".` : "Sends are Instagram's strongest signal for reaching new people. End with a clear reason to send it.") : `${P[i % P.length].how} Try it as a trial reel first, so only non-followers see it. If it beats your usual, make more like it.`,
      format: (i === 2 ? "Trial reel" : fmtTxt) + lenTxt, when, principle: i === 0 ? P.find(x => x.id === "share") : P[i % P.length] }));
    if (hook) out.push({ title: `Use your best hook style: "${hook.value}"`, hook: `Open with ${hook.value.toLowerCase()} in the first second.`, why: `Posts with this hook score ${Math.round(hook.median_score)} against your usual 100 (${hook.posts} posts).`, format: fmtTxt + lenTxt, when, principle: P.find(x => x.id === "interrupt") });
    else if (tag) out.push({ title: `More on #${tag.value}`, hook: n.hooks[3] || n.hooks[0], why: `Posts with #${tag.value} score ${Math.round(tag.median_score)} against your usual 100 (${tag.posts} posts).`, format: fmtTxt + lenTxt, when, principle: P.find(x => x.id === "specific") });
    return out.slice(0, 5);
  }
  function moreLess() {
    const lines = [];
    const add = (g, label) => (g || []).filter(x => !x.thin && x.median_score != null).forEach(x => lines.push({ text: label(x.value), score: x.median_score, n: x.posts }));
    add(A.by_format, v => fName(v, true)); add(A.by_slot, v => "Posting in the " + (SLOT[v] ? SLOT[v][0].toLowerCase() : v)); add(A.by_weekday, v => "Posting on " + v + "s");
    add(A.by_length, v => `Reels ${v} long`); add(A.by_hook, v => `"${v}" hooks`); add(A.by_topic, v => v); add((A.by_tag || []).slice(0, 12), v => "#" + v);
    const more = lines.filter(l => l.score >= 115).sort((a, b) => b.score - a.score).slice(0, 6), less = lines.filter(l => l.score <= 85).sort((a, b) => a.score - b.score).slice(0, 6);
    return { more, less };
  }
  function renderIdeas() {
    const I = ideas(), ML = moreLess(), n = niche();
    const li = l => `<li><span>${esc(l.text)} <span class="muted">(${l.n} posts)</span></span><b class="num">${Math.round(l.score)}</b></li>`;
    $("p-ideas").innerHTML = `
      <div class="panel-head"><div><h2>What to post next</h2><p>Built from your own best posts and what works in ${esc(n.name.toLowerCase())}. Change the niche with Adjust.</p></div></div>
      <div class="card" style="padding:0">${I.map(x => `<div class="idea"><div><span class="small muted">${esc(x.title)}</span><p class="hook">${esc(x.hook)}</p><p class="why">${esc(x.why)}</p></div>
        <dl><dt>Format</dt><dd>${esc(x.format)}</dd><dt>When</dt><dd>${esc(x.when)}</dd><dt>Angle</dt><dd>${esc(x.principle.name)}</dd></dl></div>`).join("")}</div>
      <div class="grid g2">
        <div class="card"><h3>Do more of</h3><p class="sub">Typical score for each group. Your usual is 100.</p>${ML.more.length ? `<ul class="dolist">${ML.more.map(li).join("")}</ul>` : `<p class="small muted">Nothing scores clearly above usual yet.</p>`}</div>
        <div class="card"><h3>Do less of</h3><p class="sub">Groups that score well below your usual.</p>${ML.less.length ? `<ul class="dolist">${ML.less.map(li).join("")}</ul>` : `<p class="small muted">Nothing scores clearly below usual. Good.</p>`}</div>
      </div>
      <div class="card"><h3>Hooks that work in ${esc(n.name.toLowerCase())}</h3><p class="sub">Swap in your own words. The angle explains why each one stops the scroll.</p>
        <ul class="dolist">${n.hooks.map((h, i) => `<li><span>${esc(h)}</span><span class="muted small" style="white-space:nowrap">${esc(D.psychology[i % D.psychology.length].name)}</span></li>`).join("")}</ul>
        ${n.note ? `<div class="callout" style="margin-top:12px">${icon("info")}<p>${esc(n.note)}</p></div>` : ""}</div>`;
  }

  /* ---------- plan ---------- */
  function goalOptions() {
    const f = S.followers || 0, opts = [["1.5", "1.5 times"], ["2", "Double"], ["3", "Triple"], ["5", "5 times"]];
    [1000, 10000, 100000, 1000000].filter(m => m > f).slice(0, 2).forEach(m => opts.push(["=" + m, fmtN(m) + " " + unit()]));
    return opts;
  }
  const goalValue = () => { const f = S.followers || 0; return String(S.goalX).startsWith("=") ? Number(S.goalX.slice(1)) : Math.round(f * Number(S.goalX)); };
  function buildCalendar() {
    const start = S.start ? new Date(S.start + "T00:00") : (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); return d; })();
    const days = bestDays(Number(S.pace)), n = niche(), P = D.psychology, fmt = bestOf(A.by_format), time = bestTime();
    const tags = (A.by_tag || []).filter(g => !g.thin).slice(0, 3).map(g => "#" + g.value);
    const I = ideas(); let k = 0; const items = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const special = S.niche === "gaming" && iso(d) === "2026-11-19";
      if (!days.includes(d.getDay()) && !special) continue;
      const pillar = n.pillars[k % n.pillars.length], idea = I[k % I.length], pr = special ? P.find(x => x.id === "scarcity") : P[(k * 3) % P.length];
      items.push({ date: iso(d), time, special, title: special ? "GTA 6 launch day post" : `${fmt ? fName(fmt.value) : "Reel"}: ${pillar}`, hook: special ? "GTA 6 is out. Do this before your first mission." : (k < I.length ? idea.hook : n.hooks[k % n.hooks.length]),
        principle: pr.name + ": " + pr.how, cta: k % 2 ? "Send this to the friend who needs it." : "Follow for part 2.", tags: tags.concat(n.id === "gaming" ? ["#gta6"] : []).slice(0, 5).join(" ") || "Pick 3 to 5 specific hashtags", minutes: 30 });
      k++;
    }
    return { start, items };
  }
  function renderPlan() {
    if (String(S.goalX).startsWith("=") && Number(S.goalX.slice(1)) <= (S.followers || 0)) S.goalX = "2";
    const f = S.followers, fpp = POSTS.some(p => p.follows != null) ? E.median(POSTS.map(p => p.follows)) : null;
    let G = null, gErr = "";
    if (f) { try { G = E.growthMap(f, goalValue(), Number(S.months), fpp, Number(S.pace)); } catch (e) { gErr = e.message; } }
    const cal = buildCalendar(); CAL = cal.items;
    const timeOpts = ["07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "18:00", "19:00", "20:00", "21:00", "21:30", "22:00", "23:00", "23:30"].map(t => [t, t12(t)]);
    if (!timeOpts.some(o => o[0] === bestTime())) timeOpts.push([bestTime(), t12(bestTime())]);
    const badge = G ? (G.verdict === "realistic" ? "good" : G.verdict === "ambitious" ? "warn" : "bad") : "";
    $("p-plan").innerHTML = `
      <div class="panel-head"><div><h2>Your plan</h2><p>What your goal takes, and a 30-day posting calendar built from your best days and times.</p></div></div>
      <div class="card"><h3>Growth goal</h3><p class="sub">Set your current ${unit()} and a goal. Everything else is worked out from your posts.</p>
        <div class="fields f4">
          <div class="field"><label for="g-f">${unit().charAt(0).toUpperCase() + unit().slice(1)} now</label><input id="g-f" type="number" min="1" inputmode="numeric" value="${f || ""}" placeholder="For example 2300"></div>
          ${select("g-goal", goalOptions(), S.goalX, "Goal")}
          ${select("g-months", [["3", "3 months"], ["6", "6 months"], ["12", "12 months"]], S.months, "By")}
          ${select("g-pace", [1, 2, 3, 4, 5, 6, 7].map(x => [String(x), x + (x === 1 ? " post" : " posts") + " a week"]), S.pace, "Posts you can keep up")}
        </div>
        ${G ? growthView(G) : `<p class="muted small" style="margin:16px 0 0">${gErr ? esc(gErr) : `Add your ${unit()} to see what the goal takes.`}</p>`}
      </div>
      <div class="card"><div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:flex-end"><div><h3>30-day calendar</h3><p class="sub" style="margin:0">${CAL.length} posts on your best days. Tap a day for the hook and caption plan.</p></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">
          <div class="field"><label for="c-start">Start</label><input id="c-start" type="date" value="${iso(cal.start)}" style="min-height:36px;padding:4px 10px"></div>
          ${select("c-time", timeOpts, bestTime(), "Time")}
        </div></div>
        <div class="cal" style="margin-top:20px">${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => `<div class="dh">${d}</div>`).join("")}${calCells(cal.start)}</div>
        <div id="day-detail"></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><button class="btn primary" id="dl-ics">${icon("cal")}Add to my calendar</button><button class="btn" id="dl-csv">Download as spreadsheet</button><button class="btn" id="cp-plan">${icon("copy")}Copy the plan</button></div>
        <p class="small muted" style="margin:12px 0 0">To post automatically, schedule each item in Meta Business Suite (Planner) or YouTube Studio. Both are free and official. Never give your password to a growth app.</p>
      </div>`;
    if (DAY != null) showDay(DAY, true);
  }
  function growthView(G) {
    const vtxt = { realistic: "Realistic", ambitious: "Ambitious", "very hard without a viral hit": "Very hard without a viral hit" }[G.verdict];
    const badge = G.verdict === "realistic" ? "good" : G.verdict === "ambitious" ? "warn" : "bad";
    const pts = [{ month: 0, followers: G.followers }].concat(G.milestones), max = G.goal * 1.05, W = 600, H = 200, px = m => 12 + (W - 24) * m / G.months, py = v => H - 8 - (H - 36) * (v - G.followers * 0.95) / (max - G.followers * 0.95);
    const pace = G.follows_per_post_now != null ? pts.map(p => ({ month: p.month, followers: Math.round(G.followers + (G.follows_per_post_now || 0) * Number(S.pace) * 4.345 * p.month) })) : null;
    const line = arr => arr.map((p, i) => `${i ? "L" : "M"}${px(p.month).toFixed(1)},${py(Math.min(p.followers, max)).toFixed(1)}`).join(" ");
    return `<div class="grid g3" style="margin-top:20px">
        <div class="stat" style="background:var(--canvas);border-color:transparent"><div class="k">Verdict</div><div class="v" style="font-size:20px"><span class="pill ${badge}" style="font-size:14px;height:28px">${vtxt}</span></div><div class="d">Needs ${G.monthly_growth_needed_pct}% growth a month</div></div>
        <div class="stat" style="background:var(--canvas);border-color:transparent"><div class="k">You need</div><div class="v">${full(G.followers_needed)}</div><div class="d">About ${G.per_day} new ${unit()} a day</div></div>
        <div class="stat" style="background:var(--canvas);border-color:transparent"><div class="k">At your current pace</div><div class="v">${G.followers_at_your_pace ? full(G.followers_at_your_pace) : "–"}</div><div class="d">${G.follows_per_post_now != null ? `${G.follows_per_post_now} follows per post, ${S.pace} posts a week` : "Your file has no follows column"}</div></div>
      </div>
      <div class="chartbox" role="img" aria-label="Followers needed each month to reach the goal">
        <span class="goal-lbl" style="top:${(100 * (py(G.goal) - 4) / H).toFixed(1)}%">Goal ${fmtN(G.goal)}</span>
        <svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
          <line x1="${px(0)}" x2="${px(G.months)}" y1="${py(G.goal)}" y2="${py(G.goal)}" stroke="#d3d8df" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/>
          <defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6C47FF" stop-opacity=".22"/><stop offset="1" stop-color="#6C47FF" stop-opacity="0"/></linearGradient><linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6C47FF"/><stop offset=".6" stop-color="#A33DF5"/><stop offset="1" stop-color="#E0428A"/></linearGradient></defs>
          <path d="${line(pts)} L${px(G.months)},${H} L${px(0)},${H} Z" fill="url(#gArea)" stroke="none"/>
          <path d="${line(pts)}" fill="none" stroke="url(#gLine)" stroke-width="3" vector-effect="non-scaling-stroke"/>${pace ? `<path d="${line(pace)}" fill="none" stroke="#8a909c" stroke-width="2" stroke-dasharray="5 4" vector-effect="non-scaling-stroke"/>` : ""}
        </svg>
        <div class="xlbl">${pts.map(p => `<span>${p.month ? "M" + p.month : "Now"}</span>`).join("")}</div>
      </div>
      <p class="small muted" style="margin:4px 0 0"><span style="color:var(--brand-700);font-weight:600">Solid line:</span> the path to your goal. ${pace ? `<span style="font-weight:600">Dashed:</span> where your current pace leads. ` : ""}${G.multiplier_needed ? `To hit the goal at ${S.pace} posts a week, each post needs ${G.multiplier_needed}x the follows it gets now. ` : ""}${esc(G.note)}</p>`;
  }
  function calCells(start) {
    let h = ""; for (let i = 0; i < start.getDay(); i++) h += `<div class="day empty"></div>`;
    for (let i = 0; i < 30; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const idx = CAL.findIndex(it => it.date === iso(d));
      h += idx >= 0 ? `<button class="day post${CAL[idx].special ? " special" : ""}${DAY === idx ? " on" : ""}" data-day="${idx}" aria-label="${fmtDate(d)}: ${esc(CAL[idx].title)}"><span class="dn">${d.getDate()} ${i === 0 || d.getDate() === 1 ? MON[d.getMonth()] : ""}</span><b>${esc(CAL[idx].title)}</b></button>` : `<div class="day"><span class="dn">${d.getDate()} ${i === 0 || d.getDate() === 1 ? MON[d.getMonth()] : ""}</span></div>`; }
    return h;
  }
  function showDay(i, quiet) {
    DAY = i; const it = CAL[i]; if (!it) return;
    document.querySelectorAll(".day.post").forEach(b => b.classList.toggle("on", Number(b.dataset.day) === i));
    $("day-detail").innerHTML = `<div class="daydetail"><b>${fmtDate(new Date(it.date + "T00:00"))}, ${t12(it.time)}</b><span class="muted"> ${esc(it.title)}</span>
      <dl><dt>Hook</dt><dd>${esc(it.hook)}</dd><dt>Angle</dt><dd>${esc(it.principle)}</dd><dt>End with</dt><dd>${esc(it.cta)}</dd><dt>Hashtags</dt><dd>${esc(it.tags)}</dd></dl></div>`;
    if (!quiet) $("day-detail").scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  const itemText = it => `${it.date} ${t12(it.time)}: ${it.title}\nHook: ${it.hook}\nAngle: ${it.principle}\nEnd with: ${it.cta}\nHashtags: ${it.tags}`;

  /* ---------- boardroom ---------- */
  const TONES = [["honest", "Honest"], ["blunt", "Blunt"], ["brutal", "Brutal"]];
  function renderBoard() {
    const needsDraft = !["account", "slump"].includes(S.target);
    $("p-board").innerHTML = `
      <div class="panel-head"><div><h2>AI boardroom</h2><p>Get Claude to review your account like a full team: a CEO, growth, social media, SEO, data and creative leads, plus an AI audience that reacts like real viewers.</p></div></div>
      <div class="grid g2" style="align-items:start">
        <div class="card"><h3>What should they review?</h3><p class="sub">Your numbers from this report go with the message automatically.</p>
          <div style="display:grid;gap:16px">
            ${select("b-target", D.reviewTargets.map(t => [t.id, t.name]), S.target, "Review")}
            <div class="field" ${needsDraft ? "" : "hidden"} id="b-draft-wrap"><label for="b-draft">Your draft</label><textarea id="b-draft" placeholder="Hook, script, caption, thumbnail idea or pitch">${esc(S.draft)}</textarea></div>
            <div class="fields">
              ${select("b-tone", TONES, S.tone, "How blunt")}${select("b-reply", [["English", "English"], ["Hinglish", "Hinglish"], ["Hindi", "Hindi"]].concat(LANGS.filter(l => !["English", "Hinglish", "Hindi"].includes(l)).map(l => [l, l])), S.reply, "Answer in")}${select("b-panel", [["10", "10 viewers"], ["20", "20 viewers"], ["30", "30 viewers"]], S.panel, "AI audience")}
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:20px"><button class="btn primary" id="copy-board">${icon("copy")}Copy the message</button><a class="btn" href="https://claude.ai/new" target="_blank" rel="noopener">Open Claude</a><button class="btn ghost" id="show-board" aria-expanded="false">Preview</button></div>
          <div class="callout info" style="margin-top:16px">${icon("info")}<p>Paste the message into Claude and send. For a sharper review, also attach two screenshots: your profile, and Insights then Audience. The free Claude plan works.</p></div>
          <pre class="prompt" id="board-preview" hidden></pre>
        </div>
        <div class="card"><h3>Who's in the room</h3><p class="sub">Each adviser scores your account and gives one action. The CEO makes the final call. <a href="sample-boardroom.html">See a sample result</a></p>
          ${D.board.map(b => `<label class="check"><input type="checkbox" data-seat="${b.id}" ${S.seats.includes(b.id) ? "checked" : ""}><span><b>${esc(b.name)}</b><span>${esc(b.job)}</span></span></label>`).join("")}
        </div>
      </div>`;
  }
  function boardPrompt() {
    const n = niche(), P = D.platforms[S.platform] || D.platforms.instagram, tgt = D.reviewTargets.find(t => t.id === S.target) || D.reviewTargets[0], L = [];
    const handle = META.handle ? (/\s/.test(META.handle) ? META.handle : "@" + META.handle.replace(/^@/, "")) : "this account";
    L.push(`You are running an AI growth boardroom for ${handle}, ${/^[AEIOU]/.test(P.name) ? "an" : "a"} ${P.name} creator in ${n.name.toLowerCase()}. Be honest and specific. Never invent numbers; if you estimate, say "estimate". Use short sentences.`);
    L.push("", "THE ACCOUNT", `- ${S.followers ? full(S.followers) + " " + unit() : unit() + " not given"}. Niche: ${n.name}. Main audience country: ${S.country}. Content language: ${S.lang}. Can keep ${S.pace} posts a week.`);
    if (S.followers) L.push(`- Goal: ${full(goalValue())} ${unit()} in ${S.months} months.`);
    L.push("", `THEIR NUMBERS (${A.posts} posts from their own ${META.source === "instagram" ? "Instagram account" : "export"}${META.source === "sample" ? "; a fictional sample account" : ""})`,
      `- Median reach ${full(A.median_reach)}. Typical post per 1,000 reached: ${E.SIGNALS.filter(([k]) => A.median[k] != null).map(([k, l]) => `${l.toLowerCase()} ${A.median[k].toFixed(1)}`).join(", ")}.`,
      `- Last 10 posts vs usual: ${recentVsUsual().map(x => `${x.label.toLowerCase()} ${x.pct}%`).join(", ") || "n/a"}.`);
    if (A.engagement_rate_by_followers != null) L.push(`- Engagement rate (likes + comments / followers, median): ${A.engagement_rate_by_followers}%.`);
    const dr = d => `${featText(d.feature)}: ${pct(d.multiplier)} (${d.confidence} evidence)`;
    [["reach", A.drivers_reach], ["sends", A.drivers_sends], ["watch time", A.drivers_watch]].forEach(([w, ds]) => { const s = strong(ds); if (s.length) L.push(`- What changes ${w}, other factors held equal: ${s.slice(0, 5).map(dr).join("; ")}.`); });
    L.push(`- Best posts: ${A.top.slice(0, 3).map(p => `"${p.caption}" (${p.stars} stars; ${p.good.join(", ") || "solid all round"})`).join(" | ")}.`);
    L.push(`- Weakest posts: ${A.bottom.slice(0, 3).map(p => `"${p.caption}" (${p.stars} stars; ${p.bad.join(", ") || "weak all round"})`).join(" | ")}.`);
    L.push("- Scores: 100 = their typical post. 3.5 stars = typical, 5 stars = about twice as good.");
    L.push("", "THEIR AUDIENCE", "- If they attached an Insights Audience screenshot, use it. Otherwise estimate the audience from the niche, country and language, and label it \"estimate\".",
      "- Income is never shown by Instagram or YouTube. Estimate spending power from city type and age, and say it's an estimate. Reference: urban Indians spend about ₹6,996 per person a month, rural about ₹4,122 (MoSPI HCES 2023-24).");
    L.push("", "PLATFORM RULES TO RESPECT (checked 18 Nov 2026)", "- " + D.sources.signals.text, "- " + D.sources.hashtags.text, "- " + D.sources.trial.text, "- " + D.sources.original.text, "- " + D.sources.indexing.text, "- " + D.sources.asci.text);
    if (S.platform === "youtube") L.push("- " + D.sources.ypp.text); if (S.platform === "twitch") L.push("- " + D.sources.twitch.text);
    if (n.note) L.push("- " + n.note); if (S.niche === "gaming") L.push("- " + D.sources.gta6.text);
    L.push("", "WHAT TO REVIEW", `- ${tgt.ask}`);
    if (S.draft && !["account", "slump"].includes(S.target)) L.push(`- Their draft:\n"""\n${S.draft}\n"""`);
    L.push("- If they attached a profile screenshot, also judge the name field, bio, highlights and pinned posts.");
    L.push("", "THE ROOM (each adviser: 3 to 6 bullet points in their own voice, a score 0-10, and one action for this week)");
    D.board.filter(b => S.seats.includes(b.id)).forEach(b => L.push(`- ${b.name}: ${b.job}`));
    L.push("", `AI AUDIENCE PANEL: create ${S.panel} viewers who match the likely audience. Give each a first name, age, city, what they usually watch and one real-life habit. They react to ${S.draft ? "the draft" : "the account's typical post"} as real people in a normal scroll: most people scroll past most posts, so do not be kind. For each: stops scrolling (yes/no), watches to the end (yes/half/no), sends to a friend (yes/no), saves (yes/no), follows (yes/no), and the comment they would write (or "-"). Then tally the rates.`);
    L.push("", "ANSWER IN THIS ORDER", "1. The CEO's verdict in 3 lines.", "2. Scorecard table: adviser, score 0-10, biggest problem, fix.", "3. The audience panel table and tally, and what would make more of them send, save or follow.",
      "4. Where the advisers disagree, and the CEO's ruling.", "5. This week: 3 actions in order, 1 thing to stop, and 2 ideas to test as trial reels.",
      "6. Rewrites: 3 hooks (mark the best), a caption with at most 5 hashtags, on-screen text" + (S.platform === "youtube" ? ", a title and thumbnail text" : "") + (["bio", "account"].includes(S.target) ? ", a name field and a bio under 150 characters" : "") + ".",
      "7. Honest limits: what this review cannot know.", "", `Write in ${S.reply}. Tone: ${(TONES.find(t => t[0] === S.tone) || TONES[0])[1].toLowerCase()}.`);
    return L.join("\n");
  }

  /* ---------- adjust dialog ---------- */
  function openAdjust() {
    const det = META.detected || {};
    $("adjust-fields").innerHTML =
      select("a-platform", [["instagram", "Instagram"], ["youtube", "YouTube"], ["twitch", "Twitch"]].map(([v, t]) => [v, t + (det.platform === v ? " (detected)" : "")]), S.platform, "Platform") +
      select("a-niche", D.niches.map(x => [x.id, x.name + (det.niche === x.id ? " (detected)" : "")]), S.niche, "Niche") +
      `<div class="field"><label for="a-followers">${unit().charAt(0).toUpperCase() + unit().slice(1)} now</label><input id="a-followers" type="number" min="0" inputmode="numeric" value="${S.followers || ""}" placeholder="Shown on your profile"><span class="hint">Unlocks your level and growth plan</span></div>` +
      select("a-country", COUNTRIES.map(c => [c, c]), S.country, "Main audience country") +
      select("a-lang", LANGS.map(c => [c, c]), S.lang, "Content language") +
      select("a-pace", [1, 2, 3, 4, 5, 6, 7].map(x => [String(x), x + (x === 1 ? " post" : " posts") + " a week"]), S.pace, "Posts you can keep up");
    $("adjust").showModal();
  }
  function saveAdjust() {
    S.platform = $("a-platform").value; S.niche = $("a-niche").value; S.country = $("a-country").value; S.lang = $("a-lang").value; S.pace = $("a-pace").value;
    const f = parseInt($("a-followers").value, 10); S.followers = f > 0 ? f : null;
    save(); analyse(); renderAll(); showTab(TAB, true); toast("Report updated");
  }

  /* ---------- landing preview (real output from the sample account) ---------- */
  async function drawPreview() {
    try {
      const text = await fetch("data/sample-instagram-export.csv").then(r => { if (!r.ok) throw 0; return r.text(); });
      const posts = E.loadPosts(text), a = E.audit(posts, 2282), best = a.reports.slice().sort((x, y) => y.score - x.score)[0];
      $("pv-stars").outerHTML = stars(best.stars, true);
      $("pv-score").textContent = `Score ${best.score}`; $("pv-cap").textContent = best.caption.replace(/#\w+/g, "").trim();
      $("pv-date").textContent = best.post.time ? fmtDate(best.post.time) : "";
      const keep = best.rows.filter(r => r.ratio != null).slice(0, 5);
      $("pv-rows").innerHTML = keep.map(r => `<div class="mrow"><span>${esc(r.metric.replace(" (seconds)", "").replace(" (% who didn't skip)", ""))}</span><span class="v">${r.metric.startsWith("Average watch") ? r.value + " s" : /Hold/.test(r.metric) ? r.value + "%" : fmtN(r.value)}${ratio(r.ratio)}</span></div>`).join("");
      $("pv-note").innerHTML = `<b>Why it worked:</b> ${esc((best.good[0] || "").replace(/^./, c => c.toUpperCase()))}. Fictional sample account.`;
      const recent = a.reports.slice(0, 9), K = { reel: ["k1", "k6", "k3"], carousel: ["k2", "k5"], image: ["k3", "k4"], video: ["k6"] };
      $("pv-grid").innerHTML = recent.map((r, i) => { const ks = K[r.type] || ["k4"]; return `<div class="tile ${ks[i % ks.length]}"><svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="${TYPE_IC[r.type] || "M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4"}"/></svg><span class="bdg"><i>★</i>${r.stars}</span></div>`; }).join("");
      const slot = (a.by_slot || []).filter(g => !g.thin)[0];
      if (slot && SLOT[slot.value]) $("pv-time").textContent = `${SLOT[slot.value][0]}, ${SLOT[slot.value][1]}`;
      const lv = strong(a.drivers_reach).find(d => d.multiplier > 1);
      if (lv) $("pv-lever").textContent = `${shortFeat(lv.feature)}: ${pct(lv.multiplier)} reach`;
    } catch (e) { document.querySelector(".preview").hidden = true; }
  }

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("button, a, [data-row], [data-day]"); if (!t) return;
    if (t.matches("[data-sample]")) { e.preventDefault(); loadSample(); return; }
    if (t.id === "how-export") { const h = $("export-help"); h.hidden = !h.hidden; t.setAttribute("aria-expanded", String(!h.hidden)); return; }
    if (t.id === "connect") { if (!API()) { fail("Connect Instagram is being switched on. Until then, upload your export: open How do I get my export? below."); return; } busy("Opening Instagram..."); location.href = API() + "/login"; return; }
    if (t.matches(".tab")) { showTab(t.id.replace("tab-", "")); return; }
    if (t.id === "open-adjust" || t.dataset.act === "adjust") { openAdjust(); return; }
    if (t.id === "new-file" || t.id === "home") { e.preventDefault(); sess.del("cgs-data"); history.replaceState(null, "", location.pathname); $("app").hidden = true; $("landing").hidden = false; document.body.classList.remove("in-app"); OPEN = null; DAY = null; document.title = "Start free: Creator Growth Studio"; wizStep(1); return; }
    if (t.dataset.plat) { choosePlatform(t.dataset.plat); return; }
    if (t.id === "w-back") { wizStep(1); return; }
    if (t.matches("[data-sample-yt]")) { loadSampleYT(); return; }
    if (t.matches("[data-sample-tw]")) { loadSampleTW(); return; }
    if (t.id === "tw-add") { TW.push(twBlank()); twRender(); const ins = document.querySelectorAll("#tw-rows tr:last-child input"); if (ins[0]) ins[0].focus(); return; }
    if (t.dataset.twdel != null) { TW.splice(Number(t.dataset.twdel), 1); twRender(); return; }
    if (t.id === "tw-go") { twGo(); return; }
    if (t.dataset.row != null) { OPEN = OPEN === t.dataset.row ? null : t.dataset.row; renderPosts(); const el = document.querySelector(`[data-row="${CSS.escape(t.dataset.row)}"]`); if (el) el.focus(); return; }
    if (t.dataset.open != null) { OPEN = t.dataset.open; S.filter = "all"; showTab("posts"); renderPosts(); const el = document.querySelector(`[data-row="${CSS.escape(OPEN)}"]`); if (el) el.scrollIntoView({ block: "center" }); return; }
    if (t.dataset.day != null) { showDay(Number(t.dataset.day)); return; }
    if (t.id === "cm-run") { runComments(); return; }
    if (t.id === "dl-ics") { download("growth-plan.ics", E.ics(CAL.map(it => ({ date: it.date, time: it.time, title: it.title, notes: itemText(it), minutes: 30 }))), "text/calendar"); toast("Calendar file downloaded. Open it to add the posts."); return; }
    if (t.id === "dl-csv") { const q = v => `"${String(v).replace(/"/g, '""')}"`; download("growth-plan.csv", "Date,Time,Post,Hook,Angle,End with,Hashtags\n" + CAL.map(it => [it.date, it.time, it.title, it.hook, it.principle, it.cta, it.tags].map(q).join(",")).join("\n"), "text/csv"); return; }
    if (t.id === "cp-plan") { copy(CAL.map(itemText).join("\n\n"), "Plan copied"); return; }
    if (t.id === "copy-board") { copy(boardPrompt(), "Copied. Paste it into Claude and send."); return; }
    if (t.id === "show-board") { const p = $("board-preview"); p.hidden = !p.hidden; t.setAttribute("aria-expanded", String(!p.hidden)); t.textContent = p.hidden ? "Preview" : "Hide preview"; if (!p.hidden) p.textContent = boardPrompt(); return; }
  });
  $("lookup").addEventListener("submit", e => { e.preventDefault(); $("load-err").hidden = true; loadLookup($("handle").value); });
  document.addEventListener("change", e => {
    const t = e.target, id = t.id;
    if (id === "file") { useFile(t.files[0]); t.value = ""; return; }
    if (id === "pf") { S.filter = t.value; save(); renderPosts(); return; }
    if (id === "ps") { S.sort = t.value; save(); renderPosts(); return; }
    if (id === "g-f") { const f = parseInt(t.value, 10); S.followers = f > 0 ? f : null; save(); analyse(); renderOverview(); renderPlan(); return; }
    if (id === "g-goal") { S.goalX = t.value; } else if (id === "g-months") { S.months = t.value; } else if (id === "g-pace") { S.pace = t.value; } else if (id === "c-start") { S.start = t.value; DAY = null; } else if (id === "c-time") { S.ptime = t.value; }
    if (["g-goal", "g-months", "g-pace", "c-start", "c-time"].includes(id)) { save(); renderPlan(); return; }
    if (id === "b-target") { S.target = t.value; save(); renderBoard(); return; }
    if (["b-tone", "b-reply", "b-panel"].includes(id)) { S[id.slice(2)] = t.value; save(); }
    if (t.dataset.seat) { S.seats = [...document.querySelectorAll("[data-seat]:checked")].map(x => x.dataset.seat); save(); }
    if (!$("board-preview") || $("board-preview").hidden) return; $("board-preview").textContent = boardPrompt();
  });
  document.addEventListener("input", e => { if (e.target.dataset && e.target.dataset.tw) { const [i, k] = e.target.dataset.tw.split("."); TW[Number(i)][k] = e.target.value; return; } if (e.target.id === "b-draft") { S.draft = e.target.value; if (!$("board-preview").hidden) $("board-preview").textContent = boardPrompt(); } });
  document.addEventListener("keydown", e => {
    if ((e.target.id === "drop" || e.target.id === "drop-yt") && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); $("file").click(); }
    if (e.target.matches && e.target.matches(".tab") && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { const i = TABS.indexOf(TAB) + (e.key === "ArrowRight" ? 1 : -1), n = TABS[(i + TABS.length) % TABS.length]; showTab(n); $("tab-" + n).focus(); }
  });
  ["drop", "drop-yt"].forEach(id => { const drop = $(id); if (!drop) return;
    ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
    drop.addEventListener("drop", e => { e.stopPropagation(); useFile(e.dataTransfer.files[0]); }); });
  window.addEventListener("dragover", e => e.preventDefault()); window.addEventListener("drop", e => { e.preventDefault(); if (!$("landing").hidden && e.dataTransfer && e.dataTransfer.files[0]) useFile(e.dataTransfer.files[0]); });
  $("adjust").addEventListener("close", () => { if ($("adjust").returnValue === "save") saveAdjust(); });

  /* ---------- start ---------- */
  const hash = new URLSearchParams(location.hash.slice(1)), qs = new URLSearchParams(location.search);
  if (hash.get("ig")) { const tok = hash.get("ig"); history.replaceState(null, "", location.pathname); loadInstagram(tok); }
  else if (hash.get("error")) { history.replaceState(null, "", location.pathname); fail(hash.get("error")); }
  else {
    const saved = sess.get("cgs-data");
    if (qs.get("sample")) { history.replaceState(null, "", location.pathname); loadSample(); }
    else if (saved) { try { const d = JSON.parse(saved); loadRows(d.kind === "csv" ? d.text : d.rows, Object.assign({}, d.meta, { keepSettings: true })); } catch (e) { sess.del("cgs-data"); } }
    else if (qs.get("p")) { choosePlatform(qs.get("p"));
      if (qs.get("u")) { $("handle").value = qs.get("u"); loadLookup(qs.get("u")); }
      else if (qs.get("connect") && $("connect")) $("connect").click(); }
  }
  window.CGS_APP = { boardPrompt, state: S, audit: () => A, meta: () => META };
})();
