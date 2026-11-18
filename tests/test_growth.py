import json
import os
import shutil
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "skills", "growth-audit"))
import growth  # noqa: E402

SAMPLE = os.path.join(ROOT, "docs", "data", "sample-instagram-export.csv")


def drv(res, key, text):
    return [d for d in res[key] if text in d["feature"]]


class Loading(unittest.TestCase):
    def test_sample_loads_with_every_metric(self):
        posts = growth.load_posts(SAMPLE)
        self.assertEqual(len(posts), 40)
        p = posts[0]
        for k in ("reach", "views", "likes", "comments", "shares", "saves", "follows"):
            self.assertIsNotNone(p[k], k)
        self.assertEqual(p["type"], "reel")
        self.assertIsNotNone(p["time"])
        self.assertIn(p["hook"], ("Face to camera", "Gameplay first"))

    def test_youtube_style_and_semicolons_and_total_row(self):
        d = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, d)
        f = os.path.join(d, "yt.csv")
        with open(f, "w", encoding="utf-8") as fh:
            fh.write("Content;Video title;Video publish time;Views;Watch time (hours);Subscribers;Likes;Comments added;Shares\n")
            fh.write("Total;Total;;12,000;300;40;500;60;30\n")
            for i in range(14):
                fh.write("v%d;GTA 6 short %d;Nov %d, 2026;%d;10;%d;%d;5;%d\n" % (i, i, i + 1, 1000 + 50 * i, 2 + i % 3, 40 + i, 3 + i % 4))
        posts = growth.load_posts(f)
        self.assertEqual(len(posts), 14)  # the Total row is skipped
        self.assertTrue(posts[0].get("reach_is_views"))
        self.assertEqual(posts[0]["follows"], 2)
        res = growth.audit(posts)
        self.assertTrue(any("Views were used" in n for n in res["honest_notes"]))

    def test_clear_errors(self):
        d = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, d)
        f = os.path.join(d, "bad.csv")
        with open(f, "w") as fh:
            fh.write("a,b\n1,2\n")
        with self.assertRaises(growth.GrowthError):
            growth.load_posts(f)
        with self.assertRaises(growth.GrowthError):
            growth.load_posts(os.path.join(d, "missing.csv"))


class FindsThePlantedPatterns(unittest.TestCase):
    """The sample account was generated with known effects. The audit must find them."""

    @classmethod
    def setUpClass(cls):
        cls.res = growth.audit(growth.load_posts(SAMPLE), 2282)

    def test_gta6_travels_further(self):
        d = drv(self.res, "drivers_reach", "#gta6")
        self.assertTrue(d and d[0]["multiplier"] >= 1.5, d)

    def test_night_beats_other_slots_all_else_equal(self):
        for slot in ("afternoon", "evening", "morning"):
            d = drv(self.res, "drivers_reach", "time: " + slot)
            if d:
                self.assertLess(d[0]["multiplier"], 1.0, d)
                self.assertIn("vs night", d[0]["feature"])

    def test_face_hook_gets_more_sends(self):
        def mult(key, text):
            d = [x for x in self.res[key] if x["feature"].startswith("hook: " + text)]
            return d[0]["multiplier"] if d else 1.0  # 1.0 when it is the baseline
        ratio = mult("drivers_sends", "Face to camera") / mult("drivers_sends", "Gameplay first")
        self.assertGreater(ratio, 1.4, self.res["drivers_sends"])

    def test_reels_beat_images(self):
        fm = {g["value"]: g["median_score"] for g in self.res["by_format"]}
        self.assertGreater(fm["reel"], fm["image"])

    def test_typical_post_scores_about_100(self):
        posts = growth.load_posts(SAMPLE)
        growth.score_posts(posts)
        med = growth._median(p["score"] for p in posts)
        self.assertTrue(80 <= med <= 120, med)

    def test_top_posts_have_reasons(self):
        self.assertEqual(len(self.res["top"]), 5)
        self.assertTrue(all(p["good"] for p in self.res["top"]))
        self.assertTrue(all(p["bad"] for p in self.res["bottom"]))

    def test_markdown_report(self):
        md = growth.audit_md(self.res)
        self.assertIn("after adjusting", md)
        self.assertIn("Read this before acting", md)


class HonestStatistics(unittest.TestCase):
    """Accounts with pure noise must rarely show a 'finding'."""

    def noise_account(self, R, n=30):
        import datetime
        posts, start = [], datetime.datetime(2026, 8, 1)
        for i in range(n):
            reach = int(1200 * R.lognormvariate(0, 0.5))
            posts.append({"id": str(i), "caption": "post " + R.choice(["#gta6", "#bgmi", "#setup", "#meme", ""]),
                          "time": start + datetime.timedelta(days=2 * i, hours=R.choice([9, 13, 18, 21, 22])),
                          "type": R.choice(["reel", "reel", "carousel", "image"]), "hook": R.choice(["Face to camera", "Gameplay first", "Text on screen"]),
                          "topic": None, "link": "", "reach": reach, "views": reach, "likes": int(reach * R.uniform(.04, .07)),
                          "comments": int(reach * R.uniform(.004, .009)), "shares": int(reach * R.uniform(.006, .012)),
                          "saves": int(reach * R.uniform(.004, .01)), "follows": int(reach * R.uniform(.002, .004)), "duration": 20})
        return posts

    def test_false_findings_are_rare(self):
        import random
        R, n, fp = random.Random(11), 80, 0
        for _ in range(n):
            r = growth.audit(self.noise_account(R))
            fp += any(d["confidence"] != "weak" for d in r["drivers_reach"] + r["drivers_sends"])
        self.assertLessEqual(fp / n, 0.2, fp)

    def test_youtube_total_row_in_content_column_is_skipped(self):
        d = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, d)
        f = os.path.join(d, "Table data.csv")
        with open(f, "w", encoding="utf-8") as fh:
            fh.write("Content,Video title,Video publish time,Views,Subscribers\nTotal,,,99999,500\n")
            for i in range(5):
                fh.write('v%d,Short %d,"Nov %d, 2026",%d,3\n' % (i, i, i + 1, 1000 + i))
        posts = growth.load_posts(f)
        self.assertEqual(len(posts), 5)
        self.assertTrue(all(p["views"] < 2000 for p in posts))

    def test_unsafe_links_are_dropped(self):
        d = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, d)
        f = os.path.join(d, "x.csv")
        with open(f, "w", encoding="utf-8") as fh:
            fh.write("Reach,Permalink\n100,javascript:alert(1)\n200,https://www.instagram.com/p/ok/\n")
        posts = growth.load_posts(f)
        self.assertEqual(posts[0]["link"], "")
        self.assertTrue(posts[1]["link"].startswith("https://"))

    def test_semicolon_csv_with_decimal_commas(self):
        d = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, d)
        f = os.path.join(d, "eu.csv")
        with open(f, "w", encoding="utf-8") as fh:
            fh.write("Reach;Likes;Average view percentage\n1.234;56;45,5\n2.000;80;50,0\n")
        p = growth.load_posts(f)[0]
        self.assertEqual(p["reach"], 1234)
        self.assertEqual(p["avg_view_pct"], 45.5)


class PostReports(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.res = growth.audit(growth.load_posts(SAMPLE), 2282)

    def test_watch_time_and_skip_rate_are_read(self):
        posts = growth.load_posts(SAMPLE)
        reels = [p for p in posts if p["type"] == "reel"]
        self.assertTrue(all(p["avg_watch"] for p in reels))
        self.assertTrue(all(p["skip_rate"] is not None for p in reels))
        self.assertTrue(all(p["profile_visits"] is not None for p in posts))

    def test_every_post_has_stars_and_a_report(self):
        self.assertEqual(len(self.res["reports"]), 40)
        for r in self.res["reports"]:
            self.assertIn(r["stars"], [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0])
            self.assertTrue(r["rows"])

    def test_star_bands(self):
        self.assertEqual(growth.stars_of(100), 3.5)
        self.assertEqual(growth.stars_of(250), 5.0)
        self.assertEqual(growth.stars_of(10), 1.0)

    def test_face_hooks_hold_attention(self):
        d = [x for x in self.res["drivers_hold"] if x["feature"].startswith("hook: Face to camera")]
        g = [x for x in self.res["drivers_hold"] if x["feature"].startswith("hook: Gameplay first")]
        face = d[0]["multiplier"] if d else 1.0
        game = g[0]["multiplier"] if g else 1.0
        self.assertGreater(face / game, 1.2, self.res["drivers_hold"])

    def test_advice_for_a_skipped_reel(self):
        posts = growth.load_posts(SAMPLE)
        med, mr = growth.score_posts(posts)
        reel = max((p for p in posts if p["skip_rate"] is not None), key=lambda p: p["skip_rate"])
        rep = growth.post_report(reel, med, mr)
        self.assertTrue(any("first second" in a for a in rep["next"]), rep["next"])

    def test_youtube_duration_format(self):
        self.assertEqual(growth._secs("0:01:23"), 83)
        self.assertEqual(growth._secs("1:05"), 65)
        self.assertEqual(growth._secs("24.5"), 24.5)

    def test_levels(self):
        self.assertEqual(growth.level_of(1)["level"], "Starter")
        self.assertIn("won't show audience", growth.level_of(50)["focus"])
        self.assertEqual(growth.level_of(5000)["level"], "Growing")
        self.assertEqual(growth.level_of(150000)["level"], "Pro")

    def test_comment_sorting_english_and_hinglish(self):
        c = growth.classify_comments("bro settings kya hai?\n🔥🔥🔥\npart 2 please\nclickbait hai ye\nfollow me for promo\nok")
        self.assertEqual(c["total"], 6)
        self.assertEqual(len(c["question"]), 1)
        self.assertEqual(len(c["praise"]), 1)
        self.assertEqual(len(c["request"]), 1)
        self.assertEqual(len(c["criticism"]), 1)
        self.assertEqual(len(c["spam"]), 1)


class GrowthMap(unittest.TestCase):
    def test_compound_maths(self):
        m = growth.growth_map(2000, 20000, 6, follows_per_post=5, per_week=4)
        self.assertEqual(m["milestones"][-1]["followers"], 20000)
        self.assertAlmostEqual((1 + m["monthly_growth_needed_pct"] / 100) ** 6, 10, delta=0.05)
        self.assertEqual(m["verdict"], "very hard without a viral hit")
        self.assertEqual(m["followers_at_your_pace"], int(round(2000 + 5 * 4 * 6 * 4.345)))

    def test_realistic_goal(self):
        self.assertEqual(growth.growth_map(5000, 5600, 3)["verdict"], "realistic")
        self.assertEqual(growth.growth_map(5000, 6000, 3)["verdict"], "ambitious")

    def test_bad_input(self):
        with self.assertRaises(growth.GrowthError):
            growth.growth_map(2000, 1000, 6)


class BrandCheck(unittest.TestCase):
    def profile(self, **kw):
        posts = [{"likes": 400 + 37 * i, "comments": 20 + i, "views": 3000 + 100 * i, "paid": i < 2, "disclosed": i != 1}
                 for i in range(12)]
        p = {"handle": "x", "followers": 9000, "following": 500, "posts": posts}
        p.update(kw)
        return p

    def test_healthy_account_with_one_undisclosed_ad(self):
        r = growth.check(self.profile())
        self.assertEqual(r["tier"], "nano")
        self.assertTrue(any(s["level"] == "risk" and "ASCI" in s["text"] for s in r["signals"]))
        self.assertIn("Insights screenshot", r["note"])

    def test_bought_likes_pattern(self):
        posts = [{"likes": 300, "comments": 0} for _ in range(10)]
        r = growth.check({"followers": 50000, "following": 90000, "posts": posts})
        texts = " ".join(s["text"] for s in r["signals"])
        self.assertIn("below half the typical micro-tier", texts)
        self.assertIn("Very few comments", texts)
        self.assertIn("almost identical", texts)
        self.assertIn("follow-for-follow", texts)
        self.assertEqual(r["summary"], "High risk")

    def test_needs_enough_posts(self):
        with self.assertRaises(growth.GrowthError):
            growth.check({"followers": 100, "posts": [{"likes": 1}]})


class Calendar(unittest.TestCase):
    def test_ics(self):
        s = growth.ics({"items": [{"date": "2026-11-20", "time": "21:00", "title": "Reel, GTA 6, day 2", "notes": "Hook: face"}]})
        self.assertIn("BEGIN:VEVENT", s)
        self.assertIn("DTSTART:20261120T153000Z", s)  # 9 pm IST in UTC
        self.assertIn("SUMMARY:Reel\\, GTA 6\\, day 2", s)
        self.assertTrue(s.endswith("END:VCALENDAR\r\n"))


class CommandLine(unittest.TestCase):
    def test_audit_writes_files(self):
        d = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, d)
        self.assertEqual(growth.main(["audit", "--posts", SAMPLE, "--out", d]), 0)
        self.assertTrue(os.path.exists(os.path.join(d, "audit.md")))
        with open(os.path.join(d, "audit.json")) as fh:
            self.assertEqual(json.load(fh)["posts"], 40)

    def test_friendly_error_code(self):
        self.assertEqual(growth.main(["map", "--followers", "10", "--goal", "5", "--months", "2"]), 2)


if __name__ == "__main__":
    unittest.main()
