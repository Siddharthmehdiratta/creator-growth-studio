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
            d = drv(self.res, key, text)
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
        self.assertIn("all else equal", md)
        self.assertIn("Read this before acting", md)


class GrowthMap(unittest.TestCase):
    def test_compound_maths(self):
        m = growth.growth_map(2000, 20000, 6, follows_per_post=5, per_week=4)
        self.assertEqual(m["milestones"][-1]["followers"], 20000)
        self.assertAlmostEqual((1 + m["monthly_growth_needed_pct"] / 100) ** 6, 10, delta=0.05)
        self.assertEqual(m["verdict"], "very hard without a viral hit")
        self.assertEqual(m["followers_at_your_pace"], int(round(2000 + 5 * 4 * 6 * 4.345)))

    def test_realistic_goal(self):
        self.assertEqual(growth.growth_map(5000, 6000, 3)["verdict"], "realistic")

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
        self.assertIn("below the usual micro-tier", texts)
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
        self.assertIn("DTSTART;TZID=Asia/Kolkata:20261120T210000", s)
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
