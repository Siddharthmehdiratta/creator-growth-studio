/* Creator Growth Studio: Instagram connector.
   A Cloudflare Worker (free plan) that does the two things a static website can't do safely:
     1. "Connect Instagram": swaps Instagram's login code for an access token using the app secret,
        which must never be in the browser. Then it reads that person's own posts and insights.
     2. "Look up any account": reads the public numbers of any Creator or Business account by username,
        using Meta's Business Discovery API and the site owner's own token.
   It stores nothing. A user's token goes back to their own browser in the URL fragment
   (the part after #, which browsers never send to servers) and is used only to read that user's own account.

   Settings (Cloudflare dashboard > your Worker > Settings > Variables and Secrets):
     IG_APP_ID       Instagram App ID       (Meta App Dashboard > Instagram > API setup with Instagram login)
     IG_APP_SECRET   Instagram App Secret   (type: Secret)
     SITE_URL        https://siddharthmehdiratta.github.io/creator-growth-studio/
   Optional, for "Look up any account":
     OWNER_IG_ID     Your own Instagram professional account ID (from Graph API Explorer: me/accounts?fields=instagram_business_account)
     OWNER_TOKEN     A long-lived Facebook Login user token with instagram_basic and pages_show_list (type: Secret)

   Cloudflare's free plan allows 50 outgoing requests per call, so the site asks for insights in batches of 20 posts. */

const IG = "https://graph.instagram.com";
const FB = "https://graph.facebook.com/v25.0";
const SCOPES = "instagram_business_basic,instagram_business_manage_insights,instagram_business_manage_comments";
// Metric names from Meta's Instagram Media Insights reference (checked 18 Nov 2026).
// If a metric isn't available for a post, Instagram rejects the whole request, so each type has a safe fallback.
export const METRICS = {
  REELS: ["views,reach,likes,comments,shares,saved,ig_reels_avg_watch_time,reels_skip_rate", "views,reach,likes,comments,shares,saved,ig_reels_avg_watch_time", "reach,likes,comments,saved"],
  FEED: ["views,reach,likes,comments,shares,saved,follows,profile_visits", "views,reach,likes,comments,shares,saved", "reach,likes,comments,saved"]
};
const MEDIA_FIELDS = "id,caption,media_type,media_product_type,timestamp,permalink,thumbnail_url,media_url,like_count,comments_count";
const BD_FULL = "username,name,biography,followers_count,follows_count,media_count,profile_picture_url,media.limit(50){id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count,view_count,thumbnail_url,media_url}";
const BD_MIN = "username,followers_count,media_count,media.limit(50){id,caption,media_type,timestamp,permalink,like_count,comments_count}";
const MAX_IDS = 20;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const site = new URL(env.SITE_URL);
    const cors = { "Access-Control-Allow-Origin": site.origin, "Access-Control-Allow-Headers": "Authorization", "Vary": "Origin" };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const path = url.pathname.replace(/\/+$/, "") || "/";
    try {
      if (path === "/login") {
        const state = await sign(env, crypto.randomUUID());
        const auth = new URL("https://www.instagram.com/oauth/authorize");
        auth.search = new URLSearchParams({ client_id: env.IG_APP_ID, redirect_uri: url.origin + "/callback", response_type: "code", scope: SCOPES, state }).toString();
        return Response.redirect(auth.toString(), 302);
      }
      if (path === "/callback") {
        if (url.searchParams.get("error")) return back(site, "error=" + encodeURIComponent(url.searchParams.get("error_description") || "Login was cancelled."));
        if (!(await verify(env, url.searchParams.get("state") || ""))) return back(site, "error=" + encodeURIComponent("The login link expired. Press Connect Instagram again."));
        const code = (url.searchParams.get("code") || "").replace(/#_$/, "");
        const form = new FormData();
        form.set("client_id", env.IG_APP_ID); form.set("client_secret", env.IG_APP_SECRET);
        form.set("grant_type", "authorization_code"); form.set("redirect_uri", url.origin + "/callback"); form.set("code", code);
        const short = await json(await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", body: form }));
        let token = short.access_token;
        try { token = (await json(await fetch(`${IG}/access_token?` + new URLSearchParams({ grant_type: "ig_exchange_token", client_secret: env.IG_APP_SECRET, access_token: short.access_token })))).access_token || token; } catch (e) { /* the short token still works for an hour */ }
        return back(site, "ig=" + encodeURIComponent(token));
      }
      if (path === "/lookup") {
        const u = cleanUsername(url.searchParams.get("u"));
        if (!u) return out({ error: "That doesn't look like an Instagram username. Use letters, numbers, dots and underscores only." }, 400, cors);
        if (!env.OWNER_IG_ID || !env.OWNER_TOKEN) return out({ error: "Account lookup isn't switched on for this site yet." }, 503, cors);
        const cache = typeof caches !== "undefined" ? caches.default : null, key = new Request(url.origin + "/lookup?u=" + u);
        if (cache) { const hit = await cache.match(key); if (hit) return new Response(hit.body, { status: 200, headers: { ...cors, "content-type": "application/json", "x-cache": "hit" } }); }
        const body = await lookup(u, env);
        const res = out(body, 200, cors);
        if (cache && ctx) ctx.waitUntil(cache.put(key, new Response(JSON.stringify(body), { headers: { "content-type": "application/json", "cache-control": "max-age=3600" } })));
        return res;
      }
      const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      if (["/account", "/insights", "/comments"].includes(path) && !token) return out({ error: "Not connected. Press Connect Instagram." }, 401, cors);
      if (path === "/account") return out(await account(token), 200, cors);
      if (path === "/insights") return out({ rows: await insightsFor(ids(url), token) }, 200, cors);
      if (path === "/comments") return out({ comments: await commentsFor(ids(url), token) }, 200, cors);
      return new Response("Creator Growth Studio connector. Nothing to see here.", { headers: { "content-type": "text/plain" } });
    } catch (e) {
      const msg = friendly(e);
      if (path === "/login" || path === "/callback") return back(site, "error=" + encodeURIComponent(msg));
      return out({ error: msg, code: e.code || null }, e.status || 502, cors);
    }
  }
};

export function cleanUsername(raw) {
  let s = String(raw || "").trim();
  const m = s.match(/instagram\.com\/([^/?#]+)/i); if (m) s = m[1];
  s = s.replace(/^@/, "").toLowerCase();
  return /^[a-z0-9._]{1,30}$/.test(s) && !["p", "reel", "reels", "stories", "explore"].includes(s) ? s : "";
}
function ids(url) {
  return (url.searchParams.get("ids") || "").split(",").map(x => x.trim()).filter(x => /^\d+(:[A-Z_]+)?$/.test(x)).slice(0, MAX_IDS);
}

async function account(token) {
  const q = p => new URLSearchParams({ ...p, access_token: token });
  const me = await json(await fetch(`${IG}/me?` + q({ fields: "user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count,biography" })));
  let media = [], next = `${IG}/me/media?` + q({ fields: MEDIA_FIELDS, limit: "50" });
  while (next && media.length < 100) { const page = await json(await fetch(next)); media = media.concat(page.data || []); next = page.paging && page.paging.next; }
  media = media.filter(m => m.media_product_type !== "STORY" && m.media_product_type !== "AD");
  return { mode: "connected", account: acct(me), media: media.map(slim) };
}

export async function insightsFor(list, token) {
  const rows = await Promise.all(list.map(async item => {
    const [id, product] = item.split(":");
    const kind = product === "REELS" ? "REELS" : "FEED";
    for (const metric of METRICS[kind]) {
      const r = await fetch(`${IG}/${id}/insights?` + new URLSearchParams({ metric, access_token: token }));
      if (r.ok) { const v = {}; ((await r.json()).data || []).forEach(d => { v[d.name] = d.values ? d.values[0].value : d.total_value && d.total_value.value; }); return { id, v }; }
      const b = await r.json().catch(() => ({}));
      if (b.error && [190, 102, 4, 17, 32, 613].includes(b.error.code)) throw apiError(b.error, r.status);
    }
    return { id, v: null };
  }));
  return rows;
}

async function commentsFor(list, token) {
  const out = {};
  await Promise.all(list.map(async item => {
    const id = item.split(":")[0];
    const r = await fetch(`${IG}/${id}/comments?` + new URLSearchParams({ fields: "text,timestamp", limit: "50", access_token: token }));
    if (!r.ok) return;
    out[id] = ((await r.json()).data || []).map(c => c.text).filter(Boolean);
  }));
  return out;
}

async function lookup(u, env) {
  let last;
  for (const fields of [BD_FULL, BD_MIN]) {
    const r = await fetch(`${FB}/${env.OWNER_IG_ID}?` + new URLSearchParams({ fields: `business_discovery.username(${u}){${fields}}`, access_token: env.OWNER_TOKEN }));
    const b = await r.json().catch(() => ({}));
    if (r.ok && b.business_discovery) {
      const d = b.business_discovery;
      return { mode: "public", account: acct(d), media: ((d.media && d.media.data) || []).map(slim) };
    }
    last = apiError(b.error || {}, r.status);
    if (!(b.error && b.error.code === 100 && !/username|not.*found|cannot be found|does not exist/i.test(b.error.message || ""))) break;
  }
  if (last && last.code === 110 || last && /business_discovery|username|does not exist|cannot be found|not found/i.test(last.message)) {
    const e = new Error(`We couldn't read @${u}. Only public Creator and Business accounts can be looked up. Personal and private accounts can't, by Instagram's rules.`); e.status = 404; throw e;
  }
  throw last || new Error("Instagram didn't answer. Try again in a minute.");
}

function acct(a) {
  return { username: a.username, name: a.name || "", type: a.account_type || "", picture: a.profile_picture_url || "", bio: a.biography || "",
    followers: a.followers_count ?? null, following: a.follows_count ?? null, posts: a.media_count ?? null };
}
function slim(m) {
  return { id: m.id, caption: m.caption || "", type: m.media_type || "", product: m.media_product_type || "", time: m.timestamp || "", link: m.permalink || "",
    thumb: m.thumbnail_url || (m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM" ? m.media_url || "" : ""),
    likes: m.like_count ?? null, comments: m.comments_count ?? null, views: m.view_count ?? null };
}

function apiError(err, status) { const e = new Error(err.message || err.error_message || `Instagram returned ${status}`); e.code = err.code; e.status = status >= 400 && status < 600 ? status : 502; return e; }
export function friendly(e) {
  const c = e.code, m = String(e.message || e);
  if (c === 190 || /access token|session has expired|Error validating/i.test(m)) return "Your Instagram connection expired. Press Connect Instagram again.";
  if ([4, 17, 32, 613].includes(c) || /request limit|rate limit|too many/i.test(m)) return "Instagram's hourly limit was reached. Try again in an hour.";
  if (c === 10 || c === 200 || /permission/i.test(m)) return "Instagram didn't give permission for this. Connect again and allow all the boxes.";
  return m;
}
function back(site, fragment) { return Response.redirect(site.toString().replace(/#.*$/, "") + "#" + fragment, 302); }
function out(body, status, headers) { return new Response(JSON.stringify(body), { status, headers: { ...headers, "content-type": "application/json", "cache-control": "no-store" } }); }
async function json(r) { const b = await r.json().catch(() => ({})); if (!r.ok || b.error || b.error_message) throw apiError(b.error || b, r.status); return b; }
async function hmac(env, text) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.IG_APP_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return [...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text)))].map(b => b.toString(16).padStart(2, "0")).join("");
}
async function sign(env, nonce) { const t = Date.now().toString(36), body = nonce + "." + t; return body + "." + (await hmac(env, body)); }
async function verify(env, state) {
  const [nonce, t, mac] = state.split(".");
  if (!nonce || !t || !mac || Date.now() - parseInt(t, 36) > 15 * 60 * 1000) return false;
  const good = await hmac(env, nonce + "." + t);
  if (good.length !== mac.length) return false;
  let diff = 0; for (let i = 0; i < good.length; i++) diff |= good.charCodeAt(i) ^ mac.charCodeAt(i);
  return diff === 0;
}
