import json
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS = ["growth-studio", "growth-audit", "growth-plan", "growth-boardroom", "growth-write", "growth-seo", "growth-money", "brand-scout"]


class Repo(unittest.TestCase):
    def test_every_skill_has_valid_frontmatter(self):
        for s in SKILLS:
            with open(os.path.join(ROOT, "skills", s, "SKILL.md"), encoding="utf-8") as fh:
                text = fh.read()
            m = re.match(r"---\nname: ([a-z0-9-]+)\ndescription: (.+?)\n---\n", text, re.S)
            self.assertTrue(m, s)
            self.assertEqual(m.group(1), s)
            self.assertLess(len(m.group(2)), 1024, s)

    def test_plugin_files(self):
        for f in ("plugin.json", "marketplace.json"):
            with open(os.path.join(ROOT, ".claude-plugin", f)) as fh:
                json.load(fh)

    def test_site_files_exist_and_link(self):
        for f in ("index.html", "guide.html", "engine.js", "data.js", "app.js", "style.css", ".nojekyll", "data/sample-instagram-export.csv"):
            self.assertTrue(os.path.exists(os.path.join(ROOT, "docs", f)), f)
        with open(os.path.join(ROOT, "docs", "index.html"), encoding="utf-8") as fh:
            html = fh.read()
        self.assertNotIn("fonts.googleapis", html)  # fonts are self-hosted: nothing leaves the browser

    def test_rules_are_dated_and_sourced(self):
        with open(os.path.join(ROOT, "skills", "growth-studio", "reference", "rules.md"), encoding="utf-8") as fh:
            text = fh.read()
        self.assertIn("checked 18 November 2026", text)
        self.assertGreaterEqual(text.count("https://"), 10)

    def test_readme_title(self):
        with open(os.path.join(ROOT, "README.md"), encoding="utf-8") as fh:
            self.assertIn("Creator Growth Studio", fh.read())


if __name__ == "__main__":
    unittest.main()
