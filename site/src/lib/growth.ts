/* Growth Plan: turns a creator's goal and limits into a weekly posting pattern, with a reason for every line.
   Built on what Instagram's head has said publicly. Instagram does not publish exact weights, so this is a guide.
   Lines that are common practice rather than an Instagram statement say so. */
export type Goal = "followers" | "views" | "engagement" | "sales" | "deals" | "other";
export type Stage = "new" | "small" | "mid" | "large" | "other";
export type Fmt = "face" | "voice" | "carousel" | "photo" | "stories";
export type Hours = "h2" | "h5" | "h10" | "h10plus" | "other";
export type Now = "n1" | "n2" | "n5" | "n6" | "other";
export type Struggle = "ideas" | "reach" | "nofollow" | "comments" | "consistency" | "sales" | "other";
export type Slot = "morning" | "lunch" | "evening" | "unsure" | "other";
export type Answers = { goal: Goal; niche: string; stage: Stage; formats: Fmt[]; hours: Hours; now: Now; struggle: Struggle; slot: Slot; other: Record<string, string> };
export type Src = { name: string; url: string };
export const DEFAULT_ANSWERS: Answers = { goal: "followers", niche: "", stage: "new", formats: ["face", "carousel"], hours: "h5", now: "n2", struggle: "reach", slot: "evening", other: {} };

export const G_SOURCES = {
  ranking: { name: "Instagram: Ranking Explained", url: "https://about.instagram.com/blog/announcements/instagram-ranking-explained" },
  signals: { name: "Buffer: Mosseri's top 3 signals", url: "https://buffer.com/resources/instagram-algorithms/" },
  connected: { name: "Social Media Today, quoting Mosseri", url: "https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/" },
  frequency: { name: "Buffer: 2 million posts", url: "https://buffer.com/resources/how-often-to-post-on-instagram/" },
  hashtags: { name: "Business Today: 5-hashtag cap", url: "https://www.businesstoday.in/technology/news/story/no-more-hashtag-stuffing-instagram-limits-hashtag-usage-to-just-5-per-reel-and-post-507444-2025-12-19" },
  trial: { name: "TechCrunch: trial reels", url: "https://techcrunch.com/2024/12/10/instagram-rolls-out-trial-reels-that-arent-shown-to-a-creators-followers" },
  google: { name: "Metricool: Google indexing", url: "https://metricool.com/instagram-indexing-on-google/" },
} as const;

export const GOAL_LABEL: Record<Goal, string> = { followers: "More followers", views: "More views", engagement: "More comments and a closer community", sales: "Sales from Instagram", deals: "Brand deals", other: "Your own goal" };
const HOURS_TO_POSTS: Record<Hours, number> = { h2: 2, h5: 3, h10: 4, h10plus: 5, other: 3 };
const NOW_TO_POSTS: Record<Now, number> = { n1: 1, n2: 2, n5: 4, n6: 6, other: 2 };
const DAYS: Record<number, string[]> = { 2: ["Tue", "Fri"], 3: ["Mon", "Wed", "Fri"], 4: ["Mon", "Tue", "Thu", "Sat"], 5: ["Mon", "Tue", "Wed", "Fri", "Sat"] };
const TIME: Record<Slot, string> = { morning: "08:00", lunch: "13:00", evening: "19:30", unsure: "19:30", other: "19:30" };
export const FORMAT_NAME = { reel: "Reel", carousel: "Carousel", photo: "Photo" } as const;
type Kind = keyof typeof FORMAT_NAME;
const SHARE: Record<Goal, Record<Kind, number>> = {
  followers: { reel: 0.7, carousel: 0.3, photo: 0 }, views: { reel: 0.85, carousel: 0.15, photo: 0 }, engagement: { reel: 0.4, carousel: 0.4, photo: 0.2 },
  sales: { reel: 0.4, carousel: 0.6, photo: 0 }, deals: { reel: 0.6, carousel: 0.4, photo: 0 }, other: { reel: 0.6, carousel: 0.4, photo: 0 },
};
const WHY: Record<Kind, { text: string; src?: Src }> = {
  reel: { text: "Most reels people see come from accounts they do not follow. Reels are how new people find you.", src: G_SOURCES.ranking },
  carousel: { text: "People swipe through and save carousels. Good for teaching and for explaining an offer. Common practice." },
  photo: { text: "Photos go mostly to people who already follow you. Use them to stay close, not to grow. Common practice." },
};

function split(shares: Record<Kind, number>, total: number) {
  const kinds = (Object.keys(shares) as Kind[]).filter((k) => shares[k] > 0);
  const sum = kinds.reduce((s, k) => s + shares[k], 0) || 1;
  const raw = kinds.map((k) => ({ k, exact: (shares[k] / sum) * total }));
  const out = raw.map((r) => ({ k: r.k, n: Math.floor(r.exact), rest: r.exact - Math.floor(r.exact) }));
  let left = total - out.reduce((s, r) => s + r.n, 0);
  [...out].sort((x, y) => y.rest - x.rest).forEach((r) => { if (left > 0) { r.n++; left--; } });
  return out.filter((r) => r.n > 0).sort((x, y) => y.n - x.n);
}

export function buildPlan(a: Answers) {
  const formats = a.formats.length ? a.formats : (["face", "voice", "carousel", "photo", "stories"] as Fmt[]);
  const canReel = formats.includes("face") || formats.includes("voice"), canCarousel = formats.includes("carousel"), canPhoto = formats.includes("photo");
  const nowCount = NOW_TO_POSTS[a.now];
  const perWeek = Math.min(5, Math.max(HOURS_TO_POSTS[a.hours], Math.min(nowCount, 5)));
  const ramp = nowCount < perWeek - 1 ? `You post about ${nowCount} a week now. Add one post a week until you reach ${perWeek}. A pace you can keep beats a burst. Rule of thumb.` : null;

  // format mix: start from the goal, then move shares away from formats this creator cannot make
  const s = { ...SHARE[a.goal] };
  if (!canReel) { (canCarousel || !canPhoto ? (s.carousel += s.reel) : (s.photo += s.reel)); s.reel = 0; }
  if (!canCarousel) { (canReel ? (s.reel += s.carousel) : (s.photo += s.carousel)); s.carousel = 0; }
  if (!canPhoto && s.photo) { (canReel ? (s.reel += s.photo) : (s.carousel += s.photo)); s.photo = 0; }
  if (!canReel && !canCarousel && !canPhoto) { s.reel = 0; s.carousel = 1; s.photo = 0; }
  const mix = split(s, perWeek).map((r) => ({ kind: r.k, format: FORMAT_NAME[r.k], count: r.n, why: WHY[r.k].text, src: WHY[r.k].src }));
  const stories = formats.includes("stories") || a.goal === "engagement" || a.goal === "sales";

  // one post per chosen day, formats interleaved so the week is not all one kind
  const days = DAYS[perWeek];
  const queue = mix.map((m) => ({ ...m }));
  let last = "";
  const week = days.map((day) => {
    const left = queue.filter((m) => m.count > 0).sort((x, y) => y.count - x.count);
    const m = left.find((x) => x.format !== last && x.count >= left[0].count - 1) ?? left[0];
    m.count--; last = m.format; return { day, format: m.format };
  });

  const signal: { name: string; why: string; how: string; src: Src } =
    a.goal === "views" ? { name: "Average watch time", why: "Watch time is one of Instagram's three top signals and counts everywhere, most of all on Reels.", how: "Cut the first second until something happens straight away. Keep reels short enough to finish.", src: G_SOURCES.signals } :
    a.goal === "engagement" ? { name: "Likes per reach, then comments", why: "Likes count slightly more for reaching people who already follow you. Feed ranking also predicts how likely someone is to comment.", how: "Work out likes ÷ accounts reached for each post. Reply to comments so people come back.", src: G_SOURCES.connected } :
    a.goal === "sales" ? { name: "Profile visits per reach", why: "A sale starts with a tap on your profile. Feed ranking predicts profile taps too.", how: "Work out profile visits ÷ accounts reached. Make the bio say what you sell and put one link in it.", src: G_SOURCES.ranking } :
    a.goal === "deals" ? { name: "Engagement per reach, steady every week", why: "Brands look at how many of the people you reach react, and whether it holds week after week. Common practice, not an Instagram rule.", how: "Track (likes + comments + sends + saves) ÷ accounts reached for every post.", src: G_SOURCES.signals } :
    { name: "Sends per reach", why: "Sends count slightly more for reaching people who do not follow you yet.", how: "Make each post something a person would forward to one friend. Work out sends ÷ accounts reached.", src: G_SOURCES.connected };

  const hook =
    formats.includes("face") ? { title: "Open with your face, talking, in the first second", text: "Say the point of the video before anything else. No intro, no logo. Common practice." } :
    formats.includes("voice") ? { title: "Show the result first, then explain", text: "Start on the finished thing, then show how you got there, with your voice over it. No face needed. Common practice." } :
    canCarousel ? { title: "Slide 1 is the headline", text: "Say who it is for and what they get, in under 8 words. Common practice." } :
    { title: "Let the caption's first line carry it", text: "Say what the post is about in plain words. Public posts can appear in Google search." };

  const topic = a.niche.trim();
  const cta =
    a.goal === "views" ? { title: "No ask. End on a loop", text: "Finish so the last second leads back to the first, or on a cliff-hanger for part 2.", example: "Part 2 tomorrow." } :
    a.goal === "engagement" ? { title: "Ask one question with two choices", text: "A choice is easier to answer than an open question.", example: "A or B? Tell me which." } :
    a.goal === "sales" ? { title: "One clear next step", text: "Ask for one thing only. A keyword in DMs is easy to act on.", example: "DM me the word START and I'll send the details." } :
    a.goal === "deals" ? { title: "Ask for saves", text: "Saves show a post was worth keeping, and brands ask for save counts.", example: "Save this for later." } :
    { title: "End with a send line", text: "Name the friend. It turns a like into a send.", example: `Send this to a friend who ${topic ? `is into ${topic}` : "needs to see it"}.` };

  const FIX: Record<Struggle, { title: string; steps: string[]; src?: Src }> = {
    ideas: { title: "You run out of ideas", steps: ["Write down the 10 questions people ask most about your topic.", "Make one post per question. That is three weeks of posts.", "Use the Claude helper for 20 more ideas from your best post."] },
    reach: { title: "Your views are low", steps: ["Check the post is original, sharp, with sound, no watermark from another app and not mostly text. Instagram shows those less.", "Rework the first second. If nothing happens, people swipe.", "Try a trial reel: it is shown to people who do not follow you first."], src: G_SOURCES.trial },
    nofollow: { title: "People watch but do not follow", steps: ["Make your bio say who you help and what they get.", "Pin your 3 best posts so a visitor sees your best work first.", "Turn your best post into a series, and say when part 2 comes. Common practice."] },
    comments: { title: "Nobody comments", steps: ["End each post with one question that has two choices.", "Reply to every comment in the first hour.", "Pin the best comment. Common practice."] },
    consistency: { title: "You cannot stay consistent", steps: ["Film a whole week in one sitting.", "Add the week to the Planner so your phone reminds you.", "Keep the number low enough that you never miss it."] },
    sales: { title: "Followers do not buy", steps: ["Post one clear offer a week. People cannot buy what they never see.", "Use Stories for your followers: answer the questions buyers ask.", "Give one next step: a link in bio or a DM keyword."] },
    other: { title: "Your own blocker", steps: ["Ask Claude with the button at the end. It gets your exact words.", "Change one thing at a time, so you can see what helped.", "Check again with the report after 4 weeks."] },
  };

  const watch =
    a.goal === "views" ? ["Average watch time on each reel", "Views from people who do not follow you"] :
    a.goal === "engagement" ? ["Likes ÷ accounts reached", "Comments per post", "Story replies"] :
    a.goal === "sales" ? ["Profile visits ÷ accounts reached", "Link taps or DMs with your keyword", "Orders that came from Instagram"] :
    a.goal === "deals" ? ["Engagement ÷ accounts reached", "Saves per post", "Follower growth per month"] :
    ["Sends ÷ accounts reached", "Follows per post", "Reach from people who do not follow you"];

  const STAGE: Record<Stage, string> = {
    new: "Under 1,000 followers: stay on one topic, so Instagram learns who to show you to. Common practice.",
    small: "1,000 to 10,000: turn your best post into a series. Common practice.",
    mid: "10,000 to 100,000: add collab posts with accounts your size. Common practice.",
    large: "Over 100,000: protect quality. Test new formats as trial reels before your followers see them.",
    other: "Your stage is in your own words, so Claude will read it with the button at the end.",
  };

  const slotOther = a.slot === "other" ? a.other.slot?.trim() : "";
  const timeNote = a.slot === "unsure" || a.slot === "other"
    ? `There is no single best time for everyone.${slotOther ? ` You wrote: "${slotOther}". Use that if it gives a clear time.` : ""} Start in the evening for 4 weeks, then use your report. It shows which day and time worked for your own posts.`
    : "There is no single best time for everyone. Start with this time for 4 weeks, then use your report. It shows which day and time worked for your own posts.";

  return {
    headline: `${perWeek} posts a week`, perWeek, ramp, mix, stories, week, days, time: TIME[a.slot], timeNote, signal, hook, cta,
    fix: FIX[a.struggle], watch, stageNote: STAGE[a.stage],
    frequencyWhy: { text: "In Buffer's study of 2 million posts, 3 to 5 posts a week more than doubled follower growth against 1 to 2.", src: G_SOURCES.frequency },
    storiesWhy: { text: "Stories go to people who already follow you, ranked by how close they are to you.", src: G_SOURCES.ranking },
    test: ["Weeks 1 and 2: post the pattern as written. Change nothing.", `Week 3: change one thing only. Start with the ${a.goal === "views" ? "first second" : "last line"}.`, "Week 4: put your numbers into the report. Keep what beat your normal. Drop what did not."],
    avoid: [{ text: "Watermarks from other apps, reposts of other people's work, low resolution, muted reels, borders, and posts that are mostly text. Instagram shows these less.", src: G_SOURCES.ranking }, { text: "More than 5 hashtags. Instagram caps them at 5.", src: G_SOURCES.hashtags }],
    ownWords: Object.entries(a.other).filter(([, v]) => v && v.trim()).map(([k, v]) => ({ question: k, text: v.trim() })),
  };
}
