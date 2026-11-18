// Tests for connect/worker.js with a fake Instagram API (no network). Run: node tests/js/worker.mjs
import assert from "node:assert/strict";
import worker, { cleanUsername, friendly } from "../../connect/worker.js";

const env = { IG_APP_ID: "123", IG_APP_SECRET: "secret", SITE_URL: "https://siddharthmehdiratta.github.io/creator-growth-studio/", OWNER_IG_ID: "1784", OWNER_TOKEN: "owner" };
const calls = [];
let routes = [];
globalThis.fetch = async (u, opts) => {
  const s = String(u); calls.push(s);
  for (const [re, fn] of routes) if (re.test(s)) { const [status, body] = fn(s, opts); return new Response(JSON.stringify(body), { status }); }
  return new Response(JSON.stringify({ error: { message: "no route " + s, code: 1 } }), { status: 500 });
};
const call = (path, headers = {}) => worker.fetch(new Request("https://cgs.example.workers.dev" + path, { headers }), env, { waitUntil() {} });
let pass = 0; const t = async (name, fn) => { await fn(); pass++; console.log("ok", name); };

await t("username cleaning", () => {
  assert.equal(cleanUsername("https://www.instagram.com/Lavi.Store/?hl=en"), "lavi.store");
  assert.equal(cleanUsername("@sid_m"), "sid_m");
  assert.equal(cleanUsername("instagram.com/p/ABC123"), "");
  assert.equal(cleanUsername("bad name!"), "");
  assert.equal(cleanUsername(""), "");
});

await t("login redirects to Instagram with signed state and 3 scopes", async () => {
  const r = await call("/login");
  assert.equal(r.status, 302);
  const loc = new URL(r.headers.get("location"));
  assert.equal(loc.host, "www.instagram.com");
  assert.equal(loc.searchParams.get("client_id"), "123");
  assert.equal(loc.searchParams.get("redirect_uri"), "https://cgs.example.workers.dev/callback");
  assert.match(loc.searchParams.get("scope"), /manage_insights/);
  assert.equal(loc.searchParams.get("state").split(".").length, 3);
});

await t("callback rejects a forged state", async () => {
  const r = await call("/callback?code=abc&state=x.y.z");
  assert.match(decodeURIComponent(r.headers.get("location")), /#error=The login link expired/);
});

await t("callback swaps code for long token and returns it in the fragment only", async () => {
  const state = new URL((await call("/login")).headers.get("location")).searchParams.get("state");
  routes = [[/api\.instagram\.com\/oauth\/access_token/, () => [200, { access_token: "SHORT" }]], [/ig_exchange_token/, () => [200, { access_token: "LONG" }]]];
  const r = await call("/callback?code=abc%23_&state=" + encodeURIComponent(state));
  const loc = r.headers.get("location");
  assert.ok(loc.startsWith(env.SITE_URL + "#ig=LONG"), loc);
  assert.ok(!loc.includes("?"), "token must not be in the query string");
});

await t("account reads profile and up to 100 posts, drops stories", async () => {
  routes = [[/\/me\?/, () => [200, { username: "sid", account_type: "MEDIA_CREATOR", followers_count: 812, media_count: 3 }]],
    [/\/me\/media/, () => [200, { data: [{ id: "1", media_product_type: "REELS", media_type: "VIDEO", caption: "hi", timestamp: "2026-11-01T14:00:00+0000", thumbnail_url: "t" }, { id: "2", media_product_type: "STORY" }, { id: "3", media_product_type: "FEED", media_type: "IMAGE", media_url: "m" }] }]]];
  const r = await call("/account", { Authorization: "Bearer TOK" });
  const b = await r.json();
  assert.equal(b.account.followers, 812);
  assert.deepEqual(b.media.map(m => m.id), ["1", "3"]);
  assert.equal(b.media[1].thumb, "m");
  assert.equal(r.headers.get("access-control-allow-origin"), "https://siddharthmehdiratta.github.io");
});

await t("insights fall back when a metric isn't available, and cap at 20 ids", async () => {
  calls.length = 0;
  routes = [[/insights\?metric=views%2Creach%2Clikes%2Ccomments%2Cshares%2Csaved%2Cig_reels_avg_watch_time%2Creels_skip_rate/, () => [400, { error: { code: 100, message: "metric not supported" } }]],
    [/insights/, s => [200, { data: [{ name: "reach", values: [{ value: 500 }] }, { name: "ig_reels_avg_watch_time", values: [{ value: 8400 }] }] }]]];
  const many = Array.from({ length: 30 }, (_, i) => `${i + 1}:REELS`).join(",");
  const b = await (await call("/insights?ids=" + many, { Authorization: "Bearer TOK" })).json();
  assert.equal(b.rows.length, 20);
  assert.equal(b.rows[0].v.reach, 500);
  assert.ok(calls.length <= 40, "stays under Cloudflare's 50 requests per call: " + calls.length);
});

await t("expired token gives a plain message", async () => {
  routes = [[/insights/, () => [400, { error: { code: 190, message: "Error validating access token" } }]]];
  const r = await call("/insights?ids=1:FEED", { Authorization: "Bearer OLD" });
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /expired/);
});

await t("missing token is refused", async () => {
  const r = await call("/account");
  assert.equal(r.status, 401);
});

await t("public lookup returns posts with likes, comments and views", async () => {
  routes = [[/graph\.facebook\.com\/v25\.0\/1784\?/, () => [200, { business_discovery: { username: "lavi", followers_count: 5400, media_count: 2, media: { data: [{ id: "9", like_count: 120, comments_count: 4, view_count: 3000, media_product_type: "REELS", timestamp: "2026-11-02T10:00:00+0000" }] } } }]]];
  const b = await (await call("/lookup?u=https://instagram.com/lavi")).json();
  assert.equal(b.mode, "public");
  assert.equal(b.account.followers, 5400);
  assert.equal(b.media[0].views, 3000);
});

await t("lookup of a personal account explains why", async () => {
  routes = [[/graph\.facebook\.com/, () => [400, { error: { code: 110, message: "Cannot find User using the username" } }]]];
  const r = await call("/lookup?u=someone.private");
  assert.equal(r.status, 404);
  assert.match((await r.json()).error, /Only public Creator and Business accounts/);
});

await t("lookup retries with fewer fields when a field is refused", async () => {
  let n = 0;
  routes = [[/graph\.facebook\.com/, () => (++n === 1 ? [400, { error: { code: 100, message: "(#100) Tried accessing nonexisting field (view_count)" } }] : [200, { business_discovery: { username: "x", followers_count: 1, media: { data: [] } } }])]];
  const b = await (await call("/lookup?u=x")).json();
  assert.equal(n, 2); assert.equal(b.account.username, "x");
});

await t("bad username is refused without calling Instagram", async () => {
  calls.length = 0;
  const r = await call("/lookup?u=" + encodeURIComponent("a b"));
  assert.equal(r.status, 400); assert.equal(calls.length, 0);
});

await t("rate limit message", () => { const e = new Error("x"); e.code = 4; assert.match(friendly(e), /hourly limit/); });

console.log(`\n${pass} worker tests passed`);
