/* Creator Growth Studio: analysis engine for the browser (same maths as skills/growth-audit/growth.py).
   Pure functions, no network. Works in the browser (window.CGS) and in Node (module.exports). */
(function (root) {
  "use strict";
  const ALIASES = {
    id: ["post id", "id", "content", "video", "media id"],
    caption: ["description", "caption", "post message", "video title", "title", "text"],
    time: ["publish time", "published", "date", "video publish time", "timestamp", "posted", "time"],
    type: ["post type", "type", "media type", "format", "content type"],
    reach: ["reach", "accounts reached", "impressions reach"],
    views: ["views", "plays", "impressions", "video views"],
    likes: ["likes", "likes and reactions", "reactions"],
    comments: ["comments", "comments added"],
    shares: ["shares", "sends", "share count"],
    saves: ["saves", "saved"],
    follows: ["follows", "followers gained", "subscribers", "subscribers gained", "new followers"],
    duration: ["duration (sec)", "duration", "length (sec)", "duration seconds"],
    watch_hours: ["watch time (hours)", "watch hours"],
    avg_view_pct: ["average percentage viewed (%)", "average view percentage", "avg % viewed"],
    ctr: ["impressions click-through rate (%)", "ctr", "click-through rate"],
    link: ["permalink", "link", "url"],
    hook: ["hook", "hook type", "opening", "label"],
    topic: ["topic", "pillar", "series", "content pillar"]
  };
  const SIGNALS = [["sends", "Sends", 0.30], ["follows", "Follows", 0.25], ["likes", "Likes", 0.15], ["saves", "Saves", 0.15], ["comments", "Comments", 0.15]];
  const SRC = { sends: "shares", follows: "follows", likes: "likes", saves: "saves", comments: "comments" };
  const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function parseCSV(text) {
    text = String(text || "").replace(/^\ufeff/, "");
    const first = text.split(/\r?\n/)[0] || "";
    const counts = [",", ";", "\t"].map(d => [d, first.split(d).length]);
    const delim = counts.sort((a, b) => b[1] - a[1])[0][0];
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false; else cell += c;
      } else if (c === '"') q = true;
      else if (c === delim) { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); cell = ""; if (row.some(x => x !== "")) rows.push(row); row = [];
      } else cell += c;
    }
    row.push(cell); if (row.some(x => x !== "")) rows.push(row);
    if (!rows.length) return [];
    parseCSV.lastDelimiter = delim;
    const h = rows[0];
    return rows.slice(1).map(r => Object.fromEntries(h.map((k, i) => [k, r[i] === undefined ? "" : r[i]])));
  }
  function num(v, decimalComma) {
    if (v === null || v === undefined) return null;
    let s = String(v).trim().replace(/%/g, "");
    s = decimalComma ? s.replace(/\./g, "").replace(/,/g, ".") : s.replace(/,/g, "");
    if (["", "-", "--", "n/a", "N/A"].includes(s)) return null;
    const n = Number(s); return isFinite(n) ? n : null;
  }
  function time(v) {
    let s = String(v || "").trim().replace("Z", "").replace(/[+-]\d\d:?\d\d$/, "");
    let m;
    if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/))) return new Date(+m[3], +m[1] - 1, +m[2], +(m[4] || 0), +(m[5] || 0));
    if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/))) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
    if ((m = s.match(/^([A-Za-z]{3})[a-z]*\s+(\d{1,2}),\s*(\d{4})$/)) && MONTHS[m[1].toLowerCase()] !== undefined) return new Date(+m[3], MONTHS[m[1].toLowerCase()], +m[2]);
    if ((m = s.match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})$/)) && MONTHS[m[2].toLowerCase()] !== undefined) return new Date(+m[3], MONTHS[m[2].toLowerCase()], +m[1]);
    return null;
  }
  function fmt(v) {
    const s = String(v || "").toLowerCase();
    if (/reel|short|video|clip/.test(s)) return "reel";
    if (/carousel|album/.test(s)) return "carousel";
    if (/story/.test(s)) return "story";
    if (/image|photo|post/.test(s)) return "image";
    return s || "unknown";
  }
  function colmap(headers) {
    const low = {}; headers.forEach(h => { low[h.trim().toLowerCase().replace(/^\ufeff/, "")] = h; });
    const out = {};
    for (const [k, names] of Object.entries(ALIASES)) for (const n of names) if (n in low) { out[k] = low[n]; break; }
    return out;
  }
  function loadPosts(raw) {
    let dc = false;
    if (typeof raw === "string") { raw = parseCSV(raw); dc = parseCSV.lastDelimiter === ";"; }
    if (!Array.isArray(raw) || !raw.length) throw new Error("No rows found. Export your posts as a CSV and try again.");
    const headers = [...new Set(raw.flatMap(r => Object.keys(r)))];
    const cm = colmap(headers);
    if (!("reach" in cm) && !("views" in cm)) throw new Error("Could not find a Reach or Views column. Columns seen: " + headers.slice(0, 12).join(", "));
    const posts = [];
    raw.forEach((r, i) => {
      const g = k => (k in cm ? r[cm[k]] : null);
      if ([g("caption"), g("id")].some(v => String(v || "").trim().toLowerCase() === "total")) return;
      const p = { id: String(g("id") || "P" + String(i + 1).padStart(3, "0")), caption: String(g("caption") || ""), time: time(g("time")),
        type: "type" in cm ? fmt(g("type")) : (num(g("duration")) ? "reel" : "unknown"), link: /^https?:\/\//i.test(String(g("link") || "").trim()) ? String(g("link")).trim() : "",
        hook: String(g("hook") || "").trim() || null, topic: String(g("topic") || "").trim() || null };
      ["reach", "views", "likes", "comments", "shares", "saves", "follows", "duration", "watch_hours", "avg_view_pct", "ctr"].forEach(k => { p[k] = num(g(k), dc); });
      if (p.reach === null) { p.reach = p.views; p.reach_is_views = true; }
      if (!p.reach) return;
      posts.push(p);
    });
    if (!posts.length) throw new Error("No posts with a Reach or Views number were found.");
    return posts;
  }
  const median = xs => { xs = xs.filter(x => x !== null && x !== undefined && !isNaN(x)).sort((a, b) => a - b); if (!xs.length) return null; const m = xs.length >> 1; return xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2; };
  const perK = (p, f) => (p[f] === null || p[f] === undefined || !p.reach ? null : 1000 * p[f] / p.reach);
  function slot(h) {
    if (h === null || h === undefined) return "unknown";
    if (h >= 5 && h < 12) return "morning (5-12)";
    if (h >= 12 && h < 17) return "afternoon (12-5 pm)";
    if (h >= 17 && h < 21) return "evening (5-9 pm)";
    if (h >= 21) return "night (9 pm-12)";
    return "late night (12-5 am)";
  }
  function durBucket(s) { if (!s) return null; if (s <= 15) return "up to 15 s"; if (s <= 30) return "16-30 s"; if (s <= 60) return "31-60 s"; if (s <= 180) return "1-3 min"; return "over 3 min"; }
  const tagsOf = c => [...new Set((String(c || "").match(/#(\w+)/g) || []).map(t => t.slice(1).toLowerCase()))].sort();
  const pyRound = x => { const r = Math.round(x); return (Math.abs(x % 1) === 0.5 && r % 2 !== 0) ? r - Math.sign(x) : r; }; // banker's rounding, like Python

  function scorePosts(posts) {
    const med = {}; SIGNALS.forEach(([k]) => { med[k] = median(posts.map(p => perK(p, SRC[k]))); });
    const medReach = median(posts.map(p => p.reach));
    posts.forEach(p => {
      p.signals = {}; SIGNALS.forEach(([k]) => { p.signals[k] = perK(p, SRC[k]); });
      let parts = 0, w = 0;
      SIGNALS.forEach(([k, , wt]) => { const v = p.signals[k], m = med[k]; if (v === null || !m) return; parts += wt * Math.log(Math.max(v, 0.01 * m) / m); w += wt; });
      const quality = w ? Math.exp(parts / w) : 1, ri = medReach ? p.reach / medReach : 1;
      p.score = pyRound(100 * Math.sqrt(quality * ri)); p.quality = pyRound(100 * quality); p.reach_index = pyRound(100 * ri);
      p.slot = slot(p.time ? p.time.getHours() : null); p.weekday = p.time ? DAYS[p.time.getDay()] : "unknown";
      p.length = durBucket(p.duration); p.tags = tagsOf(p.caption);
    });
    return [med, medReach];
  }
  function groups(posts, key, minN = 3) {
    const b = new Map();
    posts.forEach(p => { const v = p[key]; (Array.isArray(v) ? v : [v]).forEach(x => { if (x === null || x === undefined || x === "" || x === "unknown") return; if (!b.has(x)) b.set(x, []); b.get(x).push(p); }); });
    const out = [...b.entries()].map(([v, ps]) => ({ value: v, posts: ps.length, median_score: median(ps.map(x => x.score)), median_reach: median(ps.map(x => x.reach)),
      sends_per_k: median(ps.map(x => x.signals.sends)), follows_per_k: median(ps.map(x => x.signals.follows)), thin: ps.length < minN }));
    out.sort((a, c) => (a.thin - c.thin) || ((c.median_score || 0) - (a.median_score || 0)));
    return out;
  }
  function solve(A, b) {
    const n = A.length, M = A.map((r, i) => r.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      [M[c], M[piv]] = [M[piv], M[c]]; if (Math.abs(M[c][c]) < 1e-12) continue;
      for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; M[r] = M[r].map((x, j) => x - f * M[c][j]); }
    }
    return M.map((r, i) => (Math.abs(r[i]) > 1e-12 ? r[n] / r[i] : 0));
  }
  function features(posts, minN = 3) {
    const feats = [];
    const add = (name, fn) => { const on = posts.map(p => (fn(p) ? 1 : 0)); const s = on.reduce((a, b) => a + b, 0); if (s >= minN && s <= posts.length - minN) feats.push([name, on]); };
    [["type", "format"], ["slot", "time"], ["length", "length"], ["hook", "hook"], ["topic", "topic"]].forEach(([key, label]) => {
      const vals = [...new Set(posts.map(p => p[key]).filter(v => v !== null && v !== undefined && v !== "" && v !== "unknown"))].sort();
      if (vals.length < 2) return;
      const cnt = Object.fromEntries(vals.map(v => [v, posts.filter(p => p[key] === v).length]));
      const base = vals.reduce((a, v) => ((cnt[v] > cnt[a] || (cnt[v] === cnt[a] && v > a)) ? v : a), vals[0]);
      vals.forEach(v => { if (v !== base) add(`${label}: ${v} (vs ${base})`, p => p[key] === v); });
    });
    const counts = {}; posts.forEach(p => (p.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
    Object.keys(counts).forEach(t => add("#" + t, p => (p.tags || []).includes(t)));
    const seen = new Map(), out = [];
    feats.forEach(([name, col]) => { const k = col.join(""); if (seen.has(k)) { seen.get(k)[0] += " / " + name; return; } const it = [name, col]; seen.set(k, it); out.push(it); });
    return out;
  }
  function inv(A) {
    const n = A.length, M = A.map((r, i) => r.concat(Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))));
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      [M[c], M[piv]] = [M[piv], M[c]]; const d = M[c][c]; if (Math.abs(d) < 1e-12) return null;
      M[c] = M[c].map(x => x / d);
      for (let r = 0; r < n; r++) if (r !== c && M[r][c]) { const f = M[r][c]; M[r] = M[r].map((x, j) => x - f * M[c][j]); }
    }
    return M.map(r => r.slice(n));
  }
  function erfc(x) { // Numerical Recipes erfcc, relative error < 1.2e-7
    const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  function zCrit(p) { let lo = 0, hi = 10; for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (erfc(mid / Math.SQRT2) > p) lo = mid; else hi = mid; } return hi; }
  function drivers(posts, target = "reach", ridge = 1.0, families = 2) {
    const ys = posts.map(p => { const v = target === "reach" ? p.reach : (p.signals || {})[target]; return v && v > 0 ? Math.log(v) : null; });
    const idx = ys.map((y, i) => (y === null ? -1 : i)).filter(i => i >= 0);
    if (idx.length < 12) return [];
    const sub = idx.map(i => posts[i]), y = idx.map(i => ys[i]), feats = features(sub);
    if (!feats.length) return [];
    const times = sub.map(p => (p.time ? p.time.getTime() / 1000 : null)), known = times.filter(t => t !== null);
    let trend = null;
    if (known.length >= 6 && Math.max(...known) > Math.min(...known)) { const lo = Math.min(...known), hi = Math.max(...known), mid = (lo + hi) / 2; trend = times.map(t => ((t === null ? mid : t) - lo) / (hi - lo) - 0.5); }
    const off = trend ? 2 : 1;
    const X = sub.map((_, r) => [1].concat(trend ? [trend[r]] : [], feats.map(f => f[1][r]))), k = X[0].length, n = X.length;
    if (n - k < 4) return [];
    const XtX = [], b = [];
    for (let i = 0; i < k; i++) { XtX.push([]); for (let j = 0; j < k; j++) { let s2 = 0; for (let r = 0; r < n; r++) s2 += X[r][i] * X[r][j]; XtX[i].push(s2); } let t = 0; for (let r = 0; r < n; r++) t += X[r][i] * y[r]; b.push(t); }
    const A = XtX.map((row, i) => row.map((v, j) => v + (i === j && i >= off ? ridge : 0)));
    const Ai = inv(A); if (!Ai) return [];
    const beta = Ai.map(row => row.reduce((s2, v, j) => s2 + v * b[j], 0));
    const resid = X.map((row, r) => y[r] - row.reduce((s2, x, j) => s2 + x * beta[j], 0));
    const sigma2 = resid.reduce((s2, e) => s2 + e * e, 0) / Math.max(1, n - k);
    const T = Ai.map(row => XtX[0].map((_, j) => row.reduce((s2, v, m) => s2 + v * XtX[m][j], 0)));
    const m = feats.length * families, zMed = zCrit(0.05 / m), zStrong = zCrit(0.01 / m);
    const out = feats.map(([name, col], jf) => { const j = jf + off; let v = 0; for (let q = 0; q < k; q++) v += T[j][q] * Ai[q][j];
      const se = Math.sqrt(Math.max(sigma2 * v, 1e-12)), z = Math.abs(beta[j]) / se;
      return { feature: name, multiplier: Math.round(Math.exp(beta[j]) * 100) / 100, posts: col.reduce((a, c) => a + c, 0), z: Math.round(z * 100) / 100, confidence: z >= zStrong ? "strong" : z >= zMed ? "medium" : "weak" }; });
    out.sort((a, c) => Math.abs(Math.log(c.multiplier)) - Math.abs(Math.log(a.multiplier)));
    return out;
  }
  function why(p, med, medReach) {
    const good = [], bad = [];
    SIGNALS.forEach(([k, label]) => { const v = p.signals[k], m = med[k]; if (v === null || !m) return; const r = v / m;
      if (r >= 1.4) good.push(`${label} ${r.toFixed(1)}x your usual`); else if (r === 0) bad.push(`no ${label.toLowerCase()}`); else if (r <= 0.6) bad.push(`${label} ${r.toFixed(1)}x your usual`); });
    const r = medReach ? p.reach / medReach : 1;
    if (r >= 1.5) good.push(`reached ${r.toFixed(1)}x more people than usual`); else if (r <= 0.6) bad.push(`reached ${(1 / r).toFixed(1)}x fewer people than usual`);
    return [good, bad];
  }
  function audit(posts, followers) {
    const [med, medReach] = scorePosts(posts);
    const ranked = posts.slice().sort((a, b) => b.score - a.score);
    const res = { posts: posts.length, median: med, median_reach: medReach, followers: followers || null,
      by_format: groups(posts, "type"), by_slot: groups(posts, "slot"), by_weekday: groups(posts, "weekday"),
      by_length: groups(posts.filter(p => p.type === "reel"), "length"), by_tag: groups(posts, "tags"),
      by_hook: groups(posts, "hook"), by_topic: groups(posts, "topic"),
      drivers_reach: drivers(posts, "reach"), drivers_sends: drivers(posts, "sends"), drivers_follows: drivers(posts, "follows"),
      top: [], bottom: [], honest_notes: [], all: ranked };
    const card = p => { const [g, b] = why(p, med, medReach); return { id: p.id, caption: p.caption.slice(0, 90), score: p.score, type: p.type, slot: p.slot, good: g, bad: b, link: p.link, reach: p.reach }; };
    res.top = ranked.slice(0, 5).map(card); res.bottom = ranked.slice(-5).reverse().map(card);
    if (followers) res.engagement_rate_by_followers = Math.round(100 * 100 * median(posts.map(p => ((p.likes || 0) + (p.comments || 0)) / followers))) / 100;
    if (posts.length < 15) res.honest_notes.push(`Only ${posts.length} posts: patterns below are early hints, not proof.`);
    if (posts.some(p => p.reach_is_views)) res.honest_notes.push("No Reach column, so Views were used instead of Reach.");
    res.honest_notes.push("Groups with fewer than 3 posts are marked thin. These are patterns in your own posts, not proof of cause: test one change at a time.");
    return res;
  }
  function growthMap(followers, goal, months, fpp, perWeek) {
    if (!(followers > 0) || !(goal > followers) || !(months > 0)) throw new Error("Goal must be above your current followers.");
    const monthly = Math.pow(goal / followers, 1 / months) - 1, need = goal - followers;
    const out = { followers, goal, months, monthly_growth_needed_pct: Math.round(1000 * monthly) / 10, followers_needed: need, per_day: Math.round(10 * need / (months * 30.4)) / 10, milestones: [] };
    for (let m = 1; m <= months; m++) out.milestones.push({ month: m, followers: Math.round(followers * Math.pow(1 + monthly, m)) });
    if (fpp !== null && fpp !== undefined && fpp <= 0) out.follows_per_post_now = 0;
    else if (fpp) {
      const postsNeeded = need / fpp;
      out.follows_per_post_now = Math.round(fpp * 10) / 10; out.posts_needed_at_current_rate = Math.ceil(postsNeeded);
      out.posts_per_week_needed = Math.round(10 * postsNeeded / (months * 4.345)) / 10;
      if (perWeek) {
        out.follows_per_post_needed_at_your_pace = Math.round(10 * need / (perWeek * months * 4.345)) / 10;
        out.multiplier_needed = Math.round(10 * out.follows_per_post_needed_at_your_pace / fpp) / 10;
        out.followers_at_your_pace = Math.round(followers + fpp * perWeek * months * 4.345);
        out.months_to_goal_at_your_pace = Math.round(10 * need / (fpp * perWeek * 4.345)) / 10;
      }
    }
    out.verdict = monthly <= 0.05 ? "realistic" : monthly <= 0.15 ? "ambitious" : "very hard without a viral hit";
    out.note = "Follows per post are counted before unfollows, so real growth at your pace will be a little lower.";
    return out;
  }
  // Median engagement by tier: Buffer, 27M posts, 2026 (via IQFluence). Normal range: half to 3x the median.
  const TIERS = [[10000, "nano", 4.25], [100000, "micro", 3.4], [500000, "mid", 3.6], [1000000, "macro", 2.7], [Infinity, "mega", 3.9]];
  function check(profile) {
    const f = Number(profile.followers || 0), posts = profile.posts || [];
    if (!(f > 0) || posts.length < 6) throw new Error("Add the follower count and at least 6 recent posts.");
    const [, tier, med] = TIERS.find(t => f < t[0]), lo = med / 2, hi = med * 3;
    const likes = posts.map(p => Number(p.likes || 0)), comments = posts.map(p => Number(p.comments || 0));
    const er = 100 * median(likes.map((l, i) => (l + comments[i]) / f));
    const S = []; const add = (level, text) => S.push({ level, text });
    if (er < lo) add("watch", `Engagement ${er.toFixed(2)}% is below half the typical ${tier}-tier median (${med.toFixed(1)}%): many followers may not be active.`);
    else if (er > hi) add("watch", `Engagement ${er.toFixed(2)}% is far above the ${tier}-tier range: check for giveaways or engagement groups.`);
    else add("ok", `Engagement ${er.toFixed(2)}% is in the normal range for ${tier} accounts (typical median ${med.toFixed(1)}%).`);
    const cl = median(likes.map((l, i) => (l > 0 ? comments[i] / l : null)).filter(x => x !== null)) || 0;
    if (!likes.some(l => l > 0)) add("watch", "Likes are hidden or zero on every post: ask the creator for their Insights.");
    else if (cl < 0.005) add("watch", `Very few comments per like (${(100 * cl).toFixed(1)} per 100 likes): likes may be bought, or the audience is passive.`);
    else add("ok", `${(100 * cl).toFixed(1)} comments per 100 likes: real conversation is happening.`);
    const mean = likes.reduce((a, b) => a + b, 0) / likes.length;
    if (likes.length >= 6 && mean > 0) { const sd = Math.sqrt(likes.reduce((a, b) => a + (b - mean) ** 2, 0) / likes.length); if (sd / mean < 0.08) add("watch", `Likes are almost identical on every post (variation ${Math.round(100 * sd / mean)}%): real audiences vary more.`); }
    const views = posts.filter(p => p.views).map(p => Number(p.views));
    if (views.length) { const vf = median(views) / f; add(vf >= 0.2 ? "ok" : "watch", `Typical reel views are ${Math.round(100 * vf)}% of follower count (median)${vf >= 0.2 ? "" : ": low for an active audience"}.`); }
    const paid = posts.filter(p => p.paid);
    add("info", `${paid.length} of ${posts.length} recent posts are paid (${Math.round(100 * paid.length / posts.length)}%).`);
    if (paid.length / posts.length > 0.5) add("watch", "More than half the feed is paid: recommendations may carry less weight with followers.");
    const und = paid.filter(p => !p.disclosed);
    if (und.length) add("risk", `${und.length} paid posts have no clear ad label. India's ASCI rules and the US FTC require an upfront label; brands share responsibility.`);
    if (paid.length && paid.length < posts.length) { const org = median(posts.filter(p => !p.paid).map(p => Number(p.likes || 0))), pd = median(paid.map(p => Number(p.likes || 0))); if (org) add("info", `Paid posts get ${Math.round(100 * pd / org)}% of the likes of normal posts.`); }
    const hist = profile.follower_history || [];
    for (let i = 1; i < hist.length; i++) { const a = hist[i - 1], b = hist[i]; if (a.followers && b.followers && b.followers > a.followers * 1.25) add("watch", `Followers jumped ${Math.round(100 * (b.followers / a.followers - 1))}% between ${a.date || "?"} and ${b.date || "?"}: ask what caused it.`); }
    if (profile.following && profile.following > f * 1.5) add("watch", `Follows ${profile.following} accounts but has ${f} followers: follow-for-follow growth is likely.`);
    const bad = S.filter(s => s.level === "watch" || s.level === "risk").length;
    return { handle: profile.handle || "", followers: f, tier, engagement_rate: Math.round(er * 100) / 100, summary: bad === 0 ? "Looks healthy" : bad <= 2 ? "Check before paying" : "High risk", signals: S,
      note: "Signals from public numbers only. No tool can see another account's real audience; ask the creator for an Insights screenshot (age, gender, cities) before paying." };
  }
  function ics(items, tz = "Asia/Kolkata") {
    const pad = n => String(n).padStart(2, "0");
    const stamp = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    const esc = s => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
    const now = new Date(), L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Creator Growth Studio//EN", "CALSCALE:GREGORIAN"];
    const utc = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
    items.forEach((it, i) => { const [y, mo, d] = it.date.split("-").map(Number), [h, mi] = (it.time || "19:00").split(":").map(Number);
      const s = new Date(y, mo - 1, d, h, mi), e = new Date(s.getTime() + (it.minutes || 30) * 60000);
      const z = d2 => `${d2.getUTCFullYear()}${pad(d2.getUTCMonth() + 1)}${pad(d2.getUTCDate())}T${pad(d2.getUTCHours())}${pad(d2.getUTCMinutes())}00Z`;
      L.push("BEGIN:VEVENT", `UID:cgs-${i}-${stamp(s)}@creator-growth-studio`, "DTSTAMP:" + utc, `DTSTART:${z(s)}`, `DTEND:${z(e)}`, "SUMMARY:" + esc(it.title), "DESCRIPTION:" + esc(it.notes), "END:VEVENT"); });
    L.push("END:VCALENDAR"); return L.join("\r\n") + "\r\n";
  }
  const API = { parseCSV, loadPosts, scorePosts, groups, drivers, audit, growthMap, check, ics, median, SIGNALS };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else root.CGS = API;
})(typeof window !== "undefined" ? window : this);
