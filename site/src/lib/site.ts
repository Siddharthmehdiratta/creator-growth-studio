/* Everything the whole site shares: names, links and the menu. */
export const BASE = process.env.NEXT_PUBLIC_BASE ?? "";
export const href = (p: string) => (p.startsWith("http") || p.startsWith("#") ? p : BASE + p);

export const SITE = {
  name: "Creator Growth Studio",
  repo: "https://github.com/Siddharthmehdiratta/creator-growth-studio",
  ask: "https://github.com/Siddharthmehdiratta/creator-growth-studio/discussions/new?category=q-a",
  issue: "https://github.com/Siddharthmehdiratta/creator-growth-studio/issues/new",
  sister: "https://siddharthmehdiratta.github.io/founder-skill-plus/",
  app: "/connect/",
  sample: "/start.html?sample=1",
  samplePdf: "/sample/",
};

export type Item = { title: string; text: string; href: string; icon: string };
export const MENU: { name: string; items: Item[] }[] = [
  { name: "Product", items: [
    { title: "Get my report", text: "Log in, type a username or upload a file", href: "/connect/", icon: "BarChart3" },
    { title: "Growth Plan", text: "What to post, when and why", href: "/growth-plan/", icon: "Target" },
    { title: "Post Checker", text: "Score a post before you share it", href: "/post-checker/", icon: "ScanSearch" },
    { title: "Ads Checker", text: "See if an ad pays for itself", href: "/ads/", icon: "Megaphone" },
    { title: "Planner", text: "Plan posts, get calendar reminders", href: "/planner/", icon: "CalendarDays" },
    { title: "Claude helpers", text: "Captions, hooks and scripts in one click", href: "/claude/", icon: "Sparkles" },
    { title: "Sample report", text: "A designed PDF of a real report", href: "/sample/", icon: "FileText" },
    { title: "Features", text: "Everything the report tells you", href: "/features/", icon: "LayoutGrid" },
    { title: "Pricing", text: "Free, and open source", href: "/pricing/", icon: "BadgeCheck" },
  ]},
  { name: "Learn", items: [
    { title: "Instagram algorithm", text: "What Feed, Reels, Explore and Stories reward", href: "/algorithm/", icon: "Cpu" },
    { title: "Beginner's guide", text: "Your first report in 7 steps", href: "/guide/", icon: "BookOpen" },
    { title: "Growth guide 2026", text: "What works on Instagram, YouTube and Twitch", href: "/growth-guide/", icon: "TrendingUp" },
    { title: "How it works", text: "How the ratings and patterns are worked out", href: "/how-it-works/", icon: "Workflow" },
    { title: "FAQ", text: "Quick answers, searchable", href: "/faq/", icon: "Search" },
  ]},
  { name: "Help", items: [
    { title: "Help centre", text: "Every way to get help", href: "/help/", icon: "LifeBuoy" },
    { title: "Contact", text: "Questions, problems and ideas", href: "/contact/", icon: "Mail" },
    { title: "Report a problem", text: "Tell us what broke", href: "/contact/#report", icon: "Bug" },
    { title: "Give feedback", text: "What to keep, what to change", href: "/contact/#feedback", icon: "MessageSquareHeart" },
  ]},
  { name: "Company", items: [
    { title: "About", text: "Who makes this, and why", href: "/about/", icon: "Users" },
    { title: "Open source", text: "Code, licence and how to help", href: "/open-source/", icon: "Github" },
    { title: "Privacy", text: "What happens to your data", href: "/privacy/", icon: "ShieldCheck" },
    { title: "Terms", text: "The plain-English rules", href: "/terms/", icon: "FileText" },
    { title: "Changelog", text: "What's new, and when", href: "/changelog/", icon: "History" },
    { title: "Founder Plus", text: "Our sister project for founders", href: "https://siddharthmehdiratta.github.io/founder-skill-plus/", icon: "Rocket" },
  ]},
];
