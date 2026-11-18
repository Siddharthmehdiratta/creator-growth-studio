/* Everything the whole site shares: names, links and the menu. */
export const BASE = process.env.NEXT_PUBLIC_BASE ?? "";
export const href = (p: string) => (p.startsWith("http") || p.startsWith("#") ? p : BASE + p);

export const SITE = {
  name: "Creator Growth Studio",
  repo: "https://github.com/Siddharthmehdiratta/creator-growth-studio",
  ask: "https://github.com/Siddharthmehdiratta/creator-growth-studio/discussions/new?category=q-a",
  issue: "https://github.com/Siddharthmehdiratta/creator-growth-studio/issues/new",
  sister: "https://siddharthmehdiratta.github.io/founder-skill-plus/",
  app: "/start.html",
  sample: "/start.html?sample=1",
};

export type Item = { title: string; text: string; href: string; icon: string };
export const MENU: { name: string; items: Item[] }[] = [
  { name: "Product", items: [
    { title: "Features", text: "Everything your report tells you", href: "/features/", icon: "Sparkles" },
    { title: "How it works", text: "From your numbers to a plan", href: "/how-it-works/", icon: "Workflow" },
    { title: "Sample report", text: "A fictional account, the real tool", href: "/start.html?sample=1", icon: "BarChart3" },
    { title: "Pricing", text: "Free, and open source", href: "/pricing/", icon: "BadgeCheck" },
  ]},
  { name: "Learn", items: [
    { title: "Beginner's guide", text: "Your first report in 7 steps", href: "/guide/", icon: "BookOpen" },
    { title: "Growth guide 2026", text: "What the platforms reward, with sources", href: "/growth-guide/", icon: "TrendingUp" },
    { title: "FAQ", text: "Quick answers, searchable", href: "/faq/", icon: "Search" },
    { title: "Changelog", text: "What's new, and when", href: "/changelog/", icon: "History" },
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
    { title: "Founder Plus", text: "Our sister project for founders", href: "https://siddharthmehdiratta.github.io/founder-skill-plus/", icon: "Rocket" },
  ]},
];
