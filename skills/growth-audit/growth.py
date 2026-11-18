#!/usr/bin/env python3
"""Creator Growth Studio engine. Standard library only, no network, no scraping.

Reads exports the creator downloads themselves (Meta Business Suite / Instagram Insights CSV,
YouTube Studio CSV, or a simple CSV/JSON you type), and turns them into honest numbers:
per-post scores against the account's own median, what the best posts share, a growth map,
an influencer check for brands, and a calendar file.

Commands:
  growth.py audit    --posts export.csv [--followers 2300] [--out folder]
  growth.py map      --followers 2300 --goal 20000 --months 6 [--posts export.csv] [--per-week 4]
  growth.py check    --profile influencer.json            (for brands and agencies)
  growth.py calendar --plan plan.json --out calendar.ics  (any calendar app opens it)
"""
import argparse
import csv
import datetime as dt
import json
import math
import os
import re
import statistics
import sys

# ---------------------------------------------------------------- loading
ALIASES = {
    "id": ["post id", "id", "content", "video", "media id"],
    "caption": ["description", "caption", "post message", "video title", "title", "text"],
    "time": ["publish time", "published", "date", "video publish time", "timestamp", "posted", "time"],
    "type": ["post type", "type", "media type", "format", "content type"],
    "reach": ["reach", "accounts reached", "impressions reach"],
    "views": ["views", "plays", "impressions", "video views"],
    "likes": ["likes", "likes and reactions", "reactions"],
    "comments": ["comments", "comments added"],
    "shares": ["shares", "sends", "share count"],
    "saves": ["saves", "saved"],
    "follows": ["follows", "followers gained", "subscribers", "subscribers gained", "new followers"],
    "duration": ["duration (sec)", "duration", "length (sec)", "duration seconds"],
    "watch_hours": ["watch time (hours)", "watch hours"],
    "avg_view_pct": ["average percentage viewed (%)", "average view percentage", "avg % viewed"],
    "ctr": ["impressions click-through rate (%)", "ctr", "click-through rate"],
    "link": ["permalink", "link", "url"],
    "hook": ["hook", "hook type", "opening", "label"],
    "topic": ["topic", "pillar", "series", "content pillar"],
}
TIME_FORMATS = ["%m/%d/%Y %H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M", "%d/%m/%Y %H:%M",
                "%Y-%m-%d", "%b %d, %Y", "%d %b %Y", "%m/%d/%Y"]


class GrowthError(Exception):
    pass


def _num(v, decimal_comma=False):
    if v is None:
        return None
    s = str(v).strip().replace("%", "")
    s = s.replace(".", "").replace(",", ".") if decimal_comma else s.replace(",", "")
    if s in ("", "-", "--", "n/a", "N/A"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _time(v):
    s = str(v or "").strip().replace("Z", "")
    s = re.sub(r"[+-]\d\d:?\d\d$", "", s)
    for f in TIME_FORMATS:
        try:
            return dt.datetime.strptime(s, f)
        except ValueError:
            continue
    return None


def _fmt(v):
    s = str(v or "").lower()
    if "reel" in s or "short" in s or "video" in s or "clip" in s:
        return "reel"
    if "carousel" in s or "album" in s:
        return "carousel"
    if "story" in s:
        return "story"
    if "image" in s or "photo" in s or "post" in s:
        return "image"
    return s or "unknown"


def _colmap(headers):
    low = {h.strip().lower().lstrip("\ufeff"): h for h in headers}
    out = {}
    for key, names in ALIASES.items():
        for n in names:
            if n in low:
                out[key] = low[n]
                break
    return out


def load_posts(path):
    """Read a CSV or JSON export into a list of clean post dicts."""
    if not os.path.exists(path):
        raise GrowthError("file not found: %s" % path)
    if path.lower().endswith(".json"):
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
        raw = data.get("posts", data) if isinstance(data, dict) else data
        if not isinstance(raw, list):
            raise GrowthError("JSON must be a list of posts or {\"posts\": [...]}")
        headers = sorted({k for r in raw for k in r})
        semicolon = False
    else:
        with open(path, encoding="utf-8-sig", newline="") as fh:
            sample = fh.read(4096)
            fh.seek(0)
            try:
                dialect = csv.Sniffer().sniff(sample.split("\n")[0], delimiters=",;\t") if sample else csv.excel
            except csv.Error:
                dialect = csv.excel
            raw = list(csv.DictReader(fh, dialect=dialect))
            semicolon = getattr(dialect, "delimiter", ",") == ";"
        headers = list(raw[0].keys()) if raw else []
    cm = _colmap(headers)
    if "reach" not in cm and "views" not in cm:
        raise GrowthError("could not find a Reach or Views column. Columns seen: %s" % ", ".join(headers[:20]))
    posts = []
    for i, r in enumerate(raw):
        g = lambda k: r.get(cm[k]) if k in cm else None
        if "total" in (str(g("caption") or "").strip().lower(), str(g("id") or "").strip().lower()):
            continue
        p = {"id": str(g("id") or "P%03d" % (i + 1)), "caption": str(g("caption") or ""), "time": _time(g("time")),
             "type": _fmt(g("type")) if "type" in cm else ("reel" if _num(g("duration")) else "unknown"),
             "link": str(g("link") or "").strip() if re.match(r"https?://", str(g("link") or "").strip(), re.I) else "", "hook": str(g("hook") or "").strip() or None,
             "topic": str(g("topic") or "").strip() or None}
        for k in ("reach", "views", "likes", "comments", "shares", "saves", "follows", "duration", "watch_hours",
                  "avg_view_pct", "ctr"):
            p[k] = _num(g(k), semicolon)
        if p["reach"] is None:
            p["reach"] = p["views"]
            p["reach_is_views"] = True
        if not p["reach"]:
            continue
        posts.append(p)
    if not posts:
        raise GrowthError("no posts with a reach or views number were found")
    return posts


# ---------------------------------------------------------------- per-post metrics
SIGNALS = [  # (key, label, weight in the growth score)
    ("sends", "Sends per 1,000 reached", 0.30),
    ("follows", "Follows per 1,000 reached", 0.25),
    ("likes", "Likes per 1,000 reached", 0.15),
    ("saves", "Saves per 1,000 reached", 0.15),
    ("comments", "Comments per 1,000 reached", 0.15),
]
SRC = {"sends": "shares", "follows": "follows", "likes": "likes", "saves": "saves", "comments": "comments"}


def per_k(p, field):
    v = p.get(field)
    return None if v is None or not p["reach"] else 1000.0 * v / p["reach"]


def _median(xs):
    xs = [x for x in xs if x is not None]
    return statistics.median(xs) if xs else None


def hour_slot(h):
    if h is None:
        return "unknown"
    if 5 <= h < 12:
        return "morning (5-12)"
    if 12 <= h < 17:
        return "afternoon (12-5 pm)"
    if 17 <= h < 21:
        return "evening (5-9 pm)"
    if h >= 21:
        return "night (9 pm-12)"
    return "late night (12-5 am)"


def dur_bucket(s):
    if not s:
        return None
    if s <= 15:
        return "up to 15 s"
    if s <= 30:
        return "16-30 s"
    if s <= 60:
        return "31-60 s"
    if s <= 180:
        return "1-3 min"
    return "over 3 min"


def tags_of(caption):
    return sorted({t.lower() for t in re.findall(r"#(\w+)", caption or "")})


def score_posts(posts):
    """Add per-1,000 signals and a growth score: 100 = this account's typical post."""
    med = {k: _median(per_k(p, SRC[k]) for p in posts) for k, _, _ in SIGNALS}
    med_reach = _median(p["reach"] for p in posts)
    for p in posts:
        p["signals"] = {k: per_k(p, SRC[k]) for k, _, _ in SIGNALS}
        parts, wsum = [], 0.0
        for k, _, w in SIGNALS:
            v, m = p["signals"][k], med[k]
            if v is None or not m:
                continue
            parts.append(w * math.log(max(v, 0.01 * m) / m))
            wsum += w
        quality = math.exp(sum(parts) / wsum) if wsum else 1.0
        reach_idx = p["reach"] / med_reach if med_reach else 1.0
        # half how well people reacted, half how far it travelled (geometric mean)
        p["score"] = round(100 * math.sqrt(quality * reach_idx))
        p["quality"] = round(100 * quality)
        p["reach_index"] = round(100 * reach_idx)
        p["slot"] = hour_slot(p["time"].hour if p["time"] else None)
        p["weekday"] = p["time"].strftime("%A") if p["time"] else "unknown"
        p["length"] = dur_bucket(p.get("duration"))
        p["tags"] = tags_of(p["caption"])
    return med, med_reach


def groups(posts, key, min_n=3):
    """Compare groups of posts (format, time slot...) on median score. Thin groups are flagged, not hidden."""
    buckets = {}
    for p in posts:
        vals = p.get(key)
        for v in (vals if isinstance(vals, list) else [vals]):
            if v in (None, "", "unknown"):
                continue
            buckets.setdefault(v, []).append(p)
    out = []
    for v, ps in buckets.items():
        out.append({"value": v, "posts": len(ps), "median_score": _median(x["score"] for x in ps),
                    "median_reach": _median(x["reach"] for x in ps),
                    "sends_per_k": _median(x["signals"]["sends"] for x in ps),
                    "follows_per_k": _median(x["signals"]["follows"] for x in ps),
                    "thin": len(ps) < min_n})
    out.sort(key=lambda g: (g["thin"], -(g["median_score"] or 0)))
    return out


def _solve(A, b):
    """Gaussian elimination for a small square system."""
    n = len(A)
    M = [row[:] + [b[i]] for i, row in enumerate(A)]
    for c in range(n):
        piv = max(range(c, n), key=lambda r: abs(M[r][c]))
        M[c], M[piv] = M[piv], M[c]
        if abs(M[c][c]) < 1e-12:
            continue
        for r in range(n):
            if r != c:
                f = M[r][c] / M[c][c]
                M[r] = [x - f * y for x, y in zip(M[r], M[c])]
    return [M[i][n] / M[i][i] if abs(M[i][i]) > 1e-12 else 0.0 for i in range(n)]


def _features(posts, min_n=3):
    """One-hot features for format, time slot, reel length, hook, topic and common hashtags."""
    feats = []
    def add(name, fn):
        on = [1.0 if fn(p) else 0.0 for p in posts]
        if min_n <= sum(on) <= len(posts) - min_n:
            feats.append((name, on))
    for key, label in (("type", "format"), ("slot", "time"), ("length", "length"), ("hook", "hook"), ("topic", "topic")):
        vals = sorted({p.get(key) for p in posts if p.get(key) not in (None, "", "unknown")})
        if len(vals) < 2:
            continue
        counts_v = {v: sum(1 for p in posts if p.get(key) == v) for v in vals}
        base = max(vals, key=lambda v: (counts_v[v], v))  # the most common value is the baseline
        for v in vals:
            if v != base:
                add("%s: %s (vs %s)" % (label, v, base), lambda p, k=key, v=v: p.get(k) == v)
    counts = {}
    for p in posts:
        for t in p.get("tags") or []:
            counts[t] = counts.get(t, 0) + 1
    for t, c in counts.items():
        add("#" + t, lambda p, t=t: t in (p.get("tags") or []))
    # drop exact duplicates (e.g. #gta6 and #gtavi always together)
    seen, out = {}, []
    for name, col in feats:
        k = tuple(col)
        if k in seen:
            seen[k][0] += " / " + name
            continue
        item = [name, col]
        seen[k] = item
        out.append(item)
    return [(n, c) for n, c in out]


def _inv(A):
    n = len(A)
    M = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(A)]
    for c in range(n):
        piv = max(range(c, n), key=lambda r: abs(M[r][c]))
        M[c], M[piv] = M[piv], M[c]
        d = M[c][c]
        if abs(d) < 1e-12:
            raise GrowthError("features are not separable")
        M[c] = [x / d for x in M[c]]
        for r in range(n):
            if r != c and M[r][c]:
                f = M[r][c]
                M[r] = [x - f * y for x, y in zip(M[r], M[c])]
    return [row[n:] for row in M]


def _z_crit(p):
    """Two-sided normal critical value for p, by bisection on erfc."""
    lo, hi = 0.0, 10.0
    for _ in range(80):
        mid = (lo + hi) / 2
        if math.erfc(mid / math.sqrt(2)) > p:
            lo = mid
        else:
            hi = mid
    return hi


def drivers(posts, target="reach", ridge=1.0, families=2):
    """Effects after adjusting for the other labels and the account's overall trend:
    ridge regression of log(target) on post features plus a time trend.
    Confidence uses the model's own standard errors and a Bonferroni correction for
    testing many features at once, so pure noise rarely shows up as a finding."""
    ys = []
    for p in posts:
        v = p["reach"] if target == "reach" else (p["signals"].get(target) if target in p.get("signals", {}) else None)
        ys.append(math.log(v) if v and v > 0 else None)
    idx = [i for i, y in enumerate(ys) if y is not None]
    if len(idx) < 12:
        return []
    sub = [posts[i] for i in idx]
    y = [ys[i] for i in idx]
    feats = _features(sub)
    if not feats:
        return []
    times = [p["time"].timestamp() if p.get("time") else None for p in sub]
    known = [t for t in times if t is not None]
    trend = None
    if len(known) >= 6 and max(known) > min(known):
        lo_t, hi_t = min(known), max(known)
        mid_t = (lo_t + hi_t) / 2
        trend = [((t if t is not None else mid_t) - lo_t) / (hi_t - lo_t) - 0.5 for t in times]
    X = [[1.0] + ([trend[r]] if trend else []) + [f[1][r] for f in feats] for r in range(len(sub))]
    k, n = len(X[0]), len(X)
    off = 2 if trend else 1
    if n - k < 4:
        return []
    XtX = [[sum(X[r][i] * X[r][j] for r in range(n)) for j in range(k)] for i in range(k)]
    A = [[XtX[i][j] + (ridge if i == j and i >= off else 0.0) for j in range(k)] for i in range(k)]
    b = [sum(X[r][i] * y[r] for r in range(n)) for i in range(k)]
    try:
        Ai = _inv(A)
    except GrowthError:
        return []
    beta = [sum(Ai[i][j] * b[j] for j in range(k)) for i in range(k)]
    resid = [y[r] - sum(X[r][j] * beta[j] for j in range(k)) for r in range(n)]
    sigma2 = sum(e * e for e in resid) / max(1, n - k)
    # Var(beta) = sigma^2 * Ai * XtX * Ai
    T = [[sum(Ai[i][m] * XtX[m][j] for m in range(k)) for j in range(k)] for i in range(k)]
    m_tests = len(feats) * families  # the audit reports reach and sends side by side
    z_med, z_strong = _z_crit(0.05 / m_tests), _z_crit(0.01 / m_tests)
    out = []
    for jf, (name, col) in enumerate(feats):
        j = jf + off
        var = sigma2 * sum(T[j][m] * Ai[m][j] for m in range(k))
        se = math.sqrt(max(var, 1e-12))
        z = abs(beta[j]) / se
        out.append({"feature": name, "multiplier": round(math.exp(beta[j]), 2), "posts": int(sum(col)),
                    "z": round(z, 2), "confidence": "strong" if z >= z_strong else "medium" if z >= z_med else "weak"})
    out.sort(key=lambda d: -abs(math.log(d["multiplier"])))
    return out


def why(p, med, med_reach):
    """Plain reasons a post beat or missed the account's typical post."""
    good, bad = [], []
    labels = {k: l for k, l, _ in SIGNALS}
    for k, _, _ in SIGNALS:
        v, m = p["signals"].get(k), med.get(k)
        if v is None or not m:
            continue
        r = v / m
        if r >= 1.4:
            good.append("%s was %.1fx your usual" % (labels[k].split(" per")[0], r))
        elif r == 0:
            bad.append("no %s" % labels[k].split(" per")[0].lower())
        elif r <= 0.6:
            bad.append("%s was %.1fx your usual" % (labels[k].split(" per")[0], r))
    r = p["reach"] / med_reach if med_reach else 1
    if r >= 1.5:
        good.append("reached %.1fx more people than usual" % r)
    elif r <= 0.6:
        bad.append("reached %.1fx fewer people than usual" % (1 / r if r else 0))
    return good, bad


def audit(posts, followers=None):
    med, med_reach = score_posts(posts)
    ranked = sorted(posts, key=lambda p: -p["score"])
    res = {"posts": len(posts), "median": {k: (round(v, 2) if v is not None else None) for k, v in med.items()},
           "median_reach": med_reach, "followers": followers,
           "by_format": groups(posts, "type"), "by_slot": groups(posts, "slot"), "by_weekday": groups(posts, "weekday"),
           "by_length": groups([p for p in posts if p["type"] == "reel"], "length"), "by_tag": groups(posts, "tags"),
           "by_hook": groups(posts, "hook"), "by_topic": groups(posts, "topic"),
           "drivers_reach": drivers(posts, "reach"), "drivers_sends": drivers(posts, "sends"),
           "drivers_follows": drivers(posts, "follows"),
           "top": [], "bottom": [], "honest_notes": []}
    for p in ranked[:5]:
        g, b = why(p, med, med_reach)
        res["top"].append({"id": p["id"], "caption": p["caption"][:90], "score": p["score"], "type": p["type"],
                           "slot": p["slot"], "good": g, "bad": b, "link": p["link"]})
    for p in ranked[-5:][::-1]:
        g, b = why(p, med, med_reach)
        res["bottom"].append({"id": p["id"], "caption": p["caption"][:90], "score": p["score"], "type": p["type"],
                              "slot": p["slot"], "good": g, "bad": b, "link": p["link"]})
    if followers:
        eng = [((p.get("likes") or 0) + (p.get("comments") or 0)) / followers for p in posts]
        res["engagement_rate_by_followers"] = round(100 * _median(eng), 2)
    if len(posts) < 15:
        res["honest_notes"].append("Only %d posts: patterns below are early hints, not proof." % len(posts))
    if any(p.get("reach_is_views") for p in posts):
        res["honest_notes"].append("No Reach column, so Views were used instead of Reach.")
    res["honest_notes"].append("Groups with fewer than 3 posts are marked thin. These are patterns in your own posts, "
                               "not proof of cause: test one change at a time.")
    return res


def audit_md(res):
    L = ["# Your post audit", "", "%d posts. A score of 100 is your typical post; 200 is twice as good." % res["posts"], ""]
    if res.get("engagement_rate_by_followers") is not None:
        L.append("Engagement rate (likes + comments / followers, median per post): %.2f%%" % res["engagement_rate_by_followers"])
        L.append("")
    L += ["## Your typical post (median, per 1,000 people reached)", ""]
    for k, l, _ in SIGNALS:
        L.append("- %s: %s" % (l, res["median"][k] if res["median"][k] is not None else "not in your export"))
    if not any(d["confidence"] != "weak" for d in res.get("drivers_reach") or []):
        L += ["", "## No clear pattern yet", "", "Nothing in your posts passes the evidence bar. Post more, label hooks and topics, and test one change at a time."]
    if res.get("drivers_reach"):
        L += ["", "## What is linked with more reach (after adjusting for the rest)", "",
              "After adjusting for format, time, hook, tags and the account's overall trend. These are links in your posts, not proof of cause.", ""]
        for d in res["drivers_reach"][:8]:
            L.append("- %s: %s reach (%d posts, %s evidence)" % (d["feature"], _x(d["multiplier"]), d["posts"], d["confidence"]))
    if res.get("drivers_sends"):
        L += ["", "## What is linked with more sends (after adjusting for the rest)", ""]
        for d in res["drivers_sends"][:5]:
            L.append("- %s: %s sends per 1,000 reached (%s evidence)" % (d["feature"], _x(d["multiplier"]), d["confidence"]))
    for title, key in (("Hook type", "by_hook"), ("What works best: format", "by_format"), ("Time of day", "by_slot"), ("Day of week", "by_weekday"),
                       ("Reel length", "by_length"), ("Topics (hashtags)", "by_tag")):
        if not res[key]:
            continue
        L += ["", "## " + title, "", "| Group | Posts | Median score | Sends /1k | Follows /1k |", "|---|---|---|---|---|"]
        for g in res[key][:8]:
            L.append("| %s%s | %d | %s | %s | %s |" % (g["value"], " (thin)" if g["thin"] else "", g["posts"],
                     _r(g["median_score"]), _r(g["sends_per_k"], 1), _r(g["follows_per_k"], 1)))
    for title, key in (("Your 5 best posts and why", "top"), ("Your 5 weakest posts and why", "bottom")):
        L += ["", "## " + title, ""]
        for p in res[key]:
            L.append("- **%s** (score %d, %s, %s): %s" % (p["caption"] or p["id"], p["score"], p["type"], p["slot"],
                     "; ".join(p["good"] + p["bad"]) or "close to your usual"))
    L += ["", "## Read this before acting", ""] + ["- " + n for n in res["honest_notes"]]
    return "\n".join(L) + "\n"


def _x(m):
    return ("%.1fx" % m) if m >= 1 else ("%.0f%% less" % (100 * (1 - m)))


def _r(v, d=0):
    return "-" if v is None else (("%." + str(d) + "f") % v)


# ---------------------------------------------------------------- growth map
def growth_map(followers, goal, months, follows_per_post=None, per_week=None):
    if followers <= 0 or goal <= followers or months <= 0:
        raise GrowthError("need followers > 0, goal above followers, and months > 0")
    monthly = (goal / followers) ** (1.0 / months) - 1
    need = goal - followers
    out = {"followers": followers, "goal": goal, "months": months, "monthly_growth_needed_pct": round(100 * monthly, 1),
           "followers_needed": need, "per_day": round(need / (months * 30.4), 1), "milestones": []}
    f = followers
    for m in range(1, months + 1):
        f = followers * (1 + monthly) ** m
        out["milestones"].append({"month": m, "followers": int(round(f))})
    if follows_per_post is not None and follows_per_post <= 0:
        out["follows_per_post_now"] = 0
    elif follows_per_post:
        posts_needed = need / follows_per_post
        out["follows_per_post_now"] = round(follows_per_post, 1)
        out["posts_needed_at_current_rate"] = int(math.ceil(posts_needed))
        out["posts_per_week_needed"] = round(posts_needed / (months * 4.345), 1)
        if per_week:
            out["follows_per_post_needed_at_your_pace"] = round(need / (per_week * months * 4.345), 1)
            out["multiplier_needed"] = round(out["follows_per_post_needed_at_your_pace"] / follows_per_post, 1)
    if follows_per_post and follows_per_post > 0 and per_week:
        weeks = months * 4.345
        out["followers_at_your_pace"] = int(round(followers + follows_per_post * per_week * weeks))
        out["months_to_goal_at_your_pace"] = round(need / (follows_per_post * per_week * 4.345), 1)
    # rule-of-thumb bands, deliberately cautious
    out["verdict"] = ("realistic" if monthly <= 0.05 else "ambitious" if monthly <= 0.15 else "very hard without a viral hit")
    out["note"] = "Follows per post are counted before unfollows, so real growth at your pace will be a little lower."
    return out


# ---------------------------------------------------------------- influencer check (brands)
# Median engagement by tier: Buffer, 27M posts, 2026 (via IQFluence). Ranges below are half to 3x the median.
TIERS = [(10_000, "nano", 4.25), (100_000, "micro", 3.4), (500_000, "mid", 3.6), (1_000_000, "macro", 2.7),
         (float("inf"), "mega", 3.9)]


def tier_of(f):
    for cap, name, med in TIERS:
        if f < cap:
            return name, (med / 2, med * 3)
    return TIERS[-1][1], (TIERS[-1][2] / 2, TIERS[-1][2] * 3)


def check(profile):
    """Authenticity and fit signals from public numbers. Signals, not verdicts."""
    f = float(profile.get("followers") or 0)
    posts = profile.get("posts") or []
    if f <= 0 or len(posts) < 6:
        raise GrowthError("need followers and at least 6 recent posts (likes, comments; views for reels)")
    tier, (lo, hi) = tier_of(f)
    likes = [float(p.get("likes") or 0) for p in posts]
    comments = [float(p.get("comments") or 0) for p in posts]
    er = 100 * statistics.median([(l + c) / f for l, c in zip(likes, comments)])
    signals = []
    def add(level, text):
        signals.append({"level": level, "text": text})
    if er < lo:
        add("watch", "Engagement %.2f%% is below half the typical %s-tier median (%.1f%%): many followers may not be active." % (er, tier, lo * 2))
    elif er > hi:
        add("watch", "Engagement %.2f%% is far above the %s-tier range: check for giveaways or engagement groups." % (er, tier))
    else:
        add("ok", "Engagement %.2f%% is in the normal range for %s accounts (typical median %.1f%%)." % (er, tier, lo * 2))
    cl = statistics.median([c / l for l, c in zip(likes, comments) if l > 0] or [0])
    if not any(likes):
        add("watch", "Likes are hidden or zero on every post: ask the creator for their Insights.")
    elif cl < 0.005:
        add("watch", "Very few comments per like (%.1f per 100 likes): likes may be bought, or the audience is passive." % (100 * cl))
    else:
        add("ok", "%.1f comments per 100 likes: real conversation is happening." % (100 * cl))
    if len(likes) >= 6 and statistics.mean(likes) > 0:
        cv = statistics.pstdev(likes) / statistics.mean(likes)
        if cv < 0.08:
            add("watch", "Likes are almost identical on every post (variation %.0f%%): real audiences vary more." % (100 * cv))
    views = [float(p["views"]) for p in posts if p.get("views")]
    if views:
        vf = statistics.median(views) / f
        add("ok" if vf >= 0.2 else "watch", "Typical reel views are %.0f%% of follower count (median)%s." % (100 * vf, "" if vf >= 0.2 else ": low for an active audience"))
    paid = [p for p in posts if p.get("paid")]
    if posts:
        share = len(paid) / len(posts)
        add("info", "%d of %d recent posts are paid (%.0f%%)." % (len(paid), len(posts), 100 * share))
        if share > 0.5:
            add("watch", "More than half the feed is paid: recommendations may carry less weight with followers.")
    undisclosed = [p for p in paid if not p.get("disclosed")]
    if undisclosed:
        add("risk", "%d paid posts have no clear ad label. India's ASCI rules and the US FTC require an upfront label; brands share responsibility." % len(undisclosed))
    if paid and len(paid) < len(posts):
        org = statistics.median([float(p.get("likes") or 0) for p in posts if not p.get("paid")])
        pd = statistics.median([float(p.get("likes") or 0) for p in paid])
        if org:
            add("info", "Paid posts get %.0f%% of the likes of normal posts." % (100 * pd / org))
    hist = profile.get("follower_history") or []
    for a, b in zip(hist, hist[1:]):
        if a.get("followers") and b.get("followers") and b["followers"] > a["followers"] * 1.25:
            add("watch", "Followers jumped %d%% between %s and %s: ask what caused it." % (
                round(100 * (b["followers"] / a["followers"] - 1)), a.get("date", "?"), b.get("date", "?")))
    following = profile.get("following")
    if following and following > f * 1.5:
        add("watch", "Follows %d accounts but has %d followers: follow-for-follow growth is likely." % (following, f))
    levels = [s["level"] for s in signals]
    summary = ("Looks healthy" if levels.count("watch") + levels.count("risk") == 0
               else "Check before paying" if levels.count("watch") + levels.count("risk") <= 2 else "High risk")
    return {"handle": profile.get("handle", ""), "followers": int(f), "tier": tier, "engagement_rate": round(er, 2),
            "summary": summary, "signals": signals,
            "note": "Signals from public numbers only. No tool can see another account's real audience; ask the creator "
                    "for an Insights screenshot (age, gender, cities) before paying."}


# ---------------------------------------------------------------- calendar file
def _to_utc(d, tz):
    try:
        from zoneinfo import ZoneInfo
        return d.replace(tzinfo=ZoneInfo(tz)).astimezone(dt.timezone.utc)
    except Exception:  # no tz database: assume India Standard Time
        return (d - dt.timedelta(hours=5, minutes=30)).replace(tzinfo=dt.timezone.utc)


def ics(plan):
    """plan = {"items": [{"date": "2026-11-20", "time": "21:00", "title": "...", "notes": "..."}], "tz": "Asia/Kolkata"}"""
    tz = plan.get("tz", "Asia/Kolkata")
    now = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Creator Growth Studio//EN", "CALSCALE:GREGORIAN"]
    for i, it in enumerate(plan.get("items") or []):
        d = dt.datetime.strptime(it["date"] + " " + it.get("time", "19:00"), "%Y-%m-%d %H:%M")
        e = d + dt.timedelta(minutes=int(it.get("minutes", 30)))
        esc = lambda s: str(s).replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")
        L += ["BEGIN:VEVENT", "UID:cgs-%d-%s@creator-growth-studio" % (i, d.strftime("%Y%m%d%H%M")), "DTSTAMP:" + now,
              "DTSTART:" + _to_utc(d, tz).strftime("%Y%m%dT%H%M%SZ"), "DTEND:" + _to_utc(e, tz).strftime("%Y%m%dT%H%M%SZ"),
              "SUMMARY:" + esc(it.get("title", "Post")), "DESCRIPTION:" + esc(it.get("notes", "")), "END:VEVENT"]
    L.append("END:VCALENDAR")
    return "\r\n".join(L) + "\r\n"


# ---------------------------------------------------------------- CLI
def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("audit"); a.add_argument("--posts", required=True); a.add_argument("--followers", type=float)
    a.add_argument("--out", default=".")
    m = sub.add_parser("map"); m.add_argument("--followers", type=float, required=True); m.add_argument("--goal", type=float, required=True)
    m.add_argument("--months", type=int, required=True); m.add_argument("--posts"); m.add_argument("--per-week", type=float)
    c = sub.add_parser("check"); c.add_argument("--profile", required=True)
    k = sub.add_parser("calendar"); k.add_argument("--plan", required=True); k.add_argument("--out", required=True)
    args = ap.parse_args(argv)
    try:
        if args.cmd == "audit":
            res = audit(load_posts(args.posts), args.followers)
            os.makedirs(args.out, exist_ok=True)
            with open(os.path.join(args.out, "audit.json"), "w", encoding="utf-8") as fh:
                json.dump(res, fh, indent=1, default=str)
            with open(os.path.join(args.out, "audit.md"), "w", encoding="utf-8") as fh:
                fh.write(audit_md(res))
            print("Audited %d posts. Wrote audit.md and audit.json in %s" % (res["posts"], args.out))
        elif args.cmd == "map":
            fpp = None
            if args.posts:
                fpp = _median(p.get("follows") for p in load_posts(args.posts))
            print(json.dumps(growth_map(args.followers, args.goal, args.months, fpp, args.per_week), indent=1))
        elif args.cmd == "check":
            with open(args.profile, encoding="utf-8") as fh:
                print(json.dumps(check(json.load(fh)), indent=1))
        elif args.cmd == "calendar":
            with open(args.plan, encoding="utf-8") as fh:
                plan = json.load(fh)
            with open(args.out, "w", encoding="utf-8", newline="") as fh:
                fh.write(ics(plan))
            print("Wrote %d events to %s" % (len(plan.get("items") or []), args.out))
    except GrowthError as e:
        print("Problem: %s" % e, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
