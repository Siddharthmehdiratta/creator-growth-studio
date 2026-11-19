/* Post Checker: scores a planned Instagram post against the signals Instagram has published.
   This is a guide, not Instagram's real algorithm: Instagram does not publish weights. Every rule cites its source. */

export const SOURCES = {
  ranking: { name: "Instagram: Ranking Explained", url: "https://about.instagram.com/blog/announcements/instagram-ranking-explained" },
  signals: { name: "Buffer: Mosseri's top 3 signals", url: "https://buffer.com/resources/instagram-algorithms/" },
  hashtags: { name: "Business Today: 5-hashtag cap", url: "https://www.businesstoday.in/technology/news/story/no-more-hashtag-stuffing-instagram-limits-hashtag-usage-to-just-5-per-reel-and-post-507444-2025-12-19" },
  trial: { name: "TechCrunch: trial reels", url: "https://techcrunch.com/2024/12/10/instagram-rolls-out-trial-reels-that-arent-shown-to-a-creators-followers" },
  frequency: { name: "Buffer: 2 million posts", url: "https://buffer.com/resources/how-often-to-post-on-instagram/" },
  google: { name: "Metricool: Google indexing", url: "https://metricool.com/instagram-indexing-on-google/" },
  reels3: { name: "Business Today: 3-minute Reels", url: "https://www.businesstoday.in/technology/news/story/instagram-head-announces-big-changes-3-minute-reels-and-new-look-for-profile-grid-461527-2025-01-21" },
} as const;
export type SourceKey = keyof typeof SOURCES;

export type Post = {
  format: "reel" | "carousel" | "photo";
  goal: "new" | "followers";
  length: number; // seconds, reels only
  hook: "face" | "result" | "question" | "text" | "none";
  audio: "original" | "trending" | "none";
  original: boolean;
  watermark: boolean;
  sharp: boolean;
  mostlyText: boolean;
  borders: boolean;
  subtitles: boolean;
  trial: boolean;
  caption: string;
};

export const DEFAULT_POST: Post = {
  format: "reel", goal: "new", length: 25, hook: "face", audio: "original", original: true, watermark: false, sharp: true,
  mostlyText: false, borders: false, subtitles: true, trial: false,
  caption: "GTA 6 price in India, explained in 20 seconds. Send this to the friend who's saving up. #gta6 #gaming",
};

export type Finding = { ok: boolean; points: number; title: string; why: string; fix?: string; src?: SourceKey; surface: ("Reels" | "Explore" | "Feed")[] };
export type Result = { score: number; label: string; stars: number; findings: Finding[]; surfaces: Record<"Reels" | "Explore" | "Feed", number>; hashtags: number };

const has = (s: string, ...words: string[]) => words.some((w) => s.toLowerCase().includes(w));

export function checkPost(p: Post): Result {
  const f: Finding[] = [];
  const cap = p.caption.trim();
  const tags = (cap.match(/#[\p{L}\p{N}_]+/gu) || []).length;
  const firstLine = cap.split("\n")[0].replace(/#[\p{L}\p{N}_]+/gu, "").trim();
  const video = p.format === "reel";

  // Things Instagram says make a reel less visible
  if (p.watermark) f.push({ ok: false, points: -25, title: "Watermark from another app", why: "Instagram says reels can be made less visible if they are watermarked.", fix: "Export again without the TikTok or CapCut logo.", src: "ranking", surface: ["Reels", "Explore"] });
  if (!p.original) f.push({ ok: false, points: -25, title: "Not your original content", why: "Instagram says reels already posted on Instagram can be shown less, and it ranks original work above reposts.", fix: "Post your own footage, or add real commentary that makes it yours.", src: "ranking", surface: ["Reels", "Explore", "Feed"] });
  if (!p.sharp) f.push({ ok: false, points: -10, title: "Low resolution", why: "Low-resolution reels can be made less visible.", fix: "Export at 1080 x 1920 and upload over Wi-Fi.", src: "ranking", surface: ["Reels", "Explore"] });
  if (p.mostlyText) f.push({ ok: false, points: -10, title: "Mostly text", why: "Reels that are mostly text can be shown less.", fix: "Lead with a face, movement or the result, and keep text to a short line.", src: "ranking", surface: ["Reels", "Explore"] });
  if (p.borders) f.push({ ok: false, points: -5, title: "Borders around the video", why: "Reels with borders can be shown less.", fix: "Fill the full 9:16 frame.", src: "ranking", surface: ["Reels", "Explore"] });
  if (video && p.audio === "none") f.push({ ok: false, points: -10, title: "No sound", why: "Muted reels can be made less visible, and Instagram watches whether people visit the audio page.", fix: "Add your voice, music or a trending sound.", src: "ranking", surface: ["Reels"] });
  else if (video) f.push({ ok: true, points: 4, title: p.audio === "trending" ? "Uses a trending sound" : "Has its own sound", why: "Sound is part of the reel information Instagram ranks, and audio-page visits are one of its key predictions.", src: "ranking", surface: ["Reels"] });

  // Watch time: the hook and the length
  const hookPts = { face: 12, result: 12, question: 9, text: 4, none: 0 }[p.hook];
  f.push(hookPts >= 9
    ? { ok: true, points: hookPts, title: "Strong first second", why: "Watch time is one of the three signals Instagram's head names as most important. A face, the result first or a question stops the scroll.", src: "signals", surface: ["Reels", "Explore", "Feed"] }
    : { ok: false, points: hookPts, title: p.hook === "none" ? "No hook in the first second" : "Text-only hook", why: "Watch time is one of the three most important signals, and people decide in the first second.", fix: "Open with your face, the end result, or a direct question.", src: "signals", surface: ["Reels", "Explore", "Feed"] });
  if (video) {
    if (p.length <= 30) f.push({ ok: true, points: 8, title: `${p.length} seconds: easy to watch to the end`, why: "Instagram predicts how likely people are to watch a reel all the way through.", src: "ranking", surface: ["Reels"] });
    else if (p.length <= 90) f.push({ ok: true, points: 5, title: `${p.length} seconds`, why: "Fine if the story needs it. Instagram predicts whether people watch to the end, so cut anything that doesn't move the story.", src: "ranking", surface: ["Reels"] });
    else if (p.length <= 180) f.push({ ok: false, points: 1, title: `${p.length} seconds is long`, why: "Reels can be up to 3 minutes, but every extra second is a chance to skip before the end.", fix: "Check your report's Reels by length result, and trim to what your audience watches.", src: "reels3", surface: ["Reels"] });
    else f.push({ ok: false, points: -5, title: "Longer than 3 minutes", why: "Reels can be up to 3 minutes long.", fix: "Cut it under 3 minutes, or post it as a long video on YouTube.", src: "reels3", surface: ["Reels"] });
    f.push(p.subtitles
      ? { ok: true, points: 4, title: "Has subtitles", why: "Many people watch with the sound off; subtitles keep them watching. (Common practice, not an Instagram rule.)", surface: ["Reels", "Explore"] }
      : { ok: false, points: 0, title: "No subtitles", why: "Many people watch with the sound off, which can cost watch time. (Common practice, not an Instagram rule.)", fix: "Turn on Instagram's auto captions or burn them in.", surface: ["Reels", "Explore"] });
  }

  // Sends per reach and likes per reach: give people a reason
  if (has(cap, "send this", "send it", "share this", "tag a friend", "tag someone", "tag your", "send to", "forward")) f.push({ ok: true, points: 10, title: "Asks people to send it", why: "Sends per reach is one of the three signals Instagram's head names as most important, and resharing is a key Reels prediction.", src: "signals", surface: ["Reels", "Explore", "Feed"] });
  else f.push({ ok: false, points: 0, title: "No reason to send it", why: "Sends per reach is one of the top three signals. Naming the friend makes people send it.", fix: "Add a line like \"Send this to the friend who…\".", src: "signals", surface: ["Reels", "Explore", "Feed"] });
  if (has(cap, "save this", "save it", "save for", "bookmark")) f.push({ ok: true, points: 5, title: "Gives a reason to save", why: "Saves are one of the most important predictions on Explore.", src: "ranking", surface: ["Explore"] });
  if (cap.includes("?") || has(cap, "comment", "tell me", "which one", "reply")) f.push({ ok: true, points: 4, title: "Invites comments", why: "Instagram predicts how likely you are to comment on a post in Feed.", src: "ranking", surface: ["Feed"] });

  // Hashtags and search
  if (tags > 5) f.push({ ok: false, points: -6, title: `${tags} hashtags`, why: "Instagram caps hashtags at 5 per post since December 2025.", fix: "Keep the 3 to 5 most specific ones.", src: "hashtags", surface: ["Explore", "Feed"] });
  else if (tags >= 1) f.push({ ok: true, points: 3, title: `${tags} hashtag${tags > 1 ? "s" : ""}`, why: "Within Instagram's 5-hashtag limit. Specific tags describe the post.", src: "hashtags", surface: ["Explore"] });
  else f.push({ ok: false, points: 0, title: "No hashtags", why: "One to five specific hashtags help describe the post.", fix: "Add 3 to 5 that say exactly what it's about.", src: "hashtags", surface: ["Explore"] });
  if (firstLine.length >= 30) f.push({ ok: true, points: 4, title: "First line says what it's about", why: "Since July 2025, public posts from professional accounts can appear in Google search, and search reads captions.", src: "google", surface: ["Explore", "Feed"] });
  else f.push({ ok: false, points: 0, title: "First line is too short", why: "Search reads captions. Since July 2025, posts can appear in Google search.", fix: "Start with a plain sentence that names the topic.", src: "google", surface: ["Explore", "Feed"] });

  // Format and goal
  if (p.goal === "new") {
    if (video) f.push({ ok: true, points: 6, title: "Reel for reaching new people", why: "Most reels people see are from accounts they don't follow.", src: "ranking", surface: ["Reels"] });
    else f.push({ ok: false, points: 0, title: "Photo or carousel to reach new people", why: "Reels and Explore mostly show accounts people don't follow yet; photos lean on your followers.", fix: "Turn the idea into a short reel, or accept that it will mostly reach followers.", src: "ranking", surface: ["Reels", "Explore"] });
    if (video && p.trial) f.push({ ok: true, points: 3, title: "Posted as a trial reel", why: "Trial reels are shown only to people who don't follow you, so you can test without hurting your grid.", src: "trial", surface: ["Reels"] });
  } else {
    f.push({ ok: true, points: 4, title: "Made for your followers", why: "Feed ranks your followers' history with you highly, including whether you comment on each other's posts.", src: "ranking", surface: ["Feed"] });
  }

  const raw = 40 + f.reduce((a, x) => a + x.points, 0);
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const label = score >= 85 ? "Ready to post" : score >= 70 ? "Good, a few fixes" : score >= 50 ? "Needs work" : "Fix before posting";
  const surf = (s: "Reels" | "Explore" | "Feed") => {
    const rel = f.filter((x) => x.surface.includes(s));
    const got = rel.reduce((a, x) => a + Math.max(0, x.points), 0), lost = rel.reduce((a, x) => a + Math.min(0, x.points), 0);
    const max = rel.reduce((a, x) => a + Math.max(4, Math.abs(x.points)), 0) || 1;
    return Math.max(0, Math.min(100, Math.round(((got + lost) / max) * 100)));
  };
  const surfaces = { Reels: video ? surf("Reels") : 0, Explore: surf("Explore"), Feed: surf("Feed") };
  return { score, label, stars: Math.max(1, Math.min(5, Math.round(score / 20 * 2) / 2)), findings: f.sort((a, b) => Number(a.ok) - Number(b.ok) || a.points - b.points), surfaces, hashtags: tags };
}

export function claudePrompt(p: Post, r: Result) {
  const fixes = r.findings.filter((x) => !x.ok).map((x) => `- ${x.title}: ${x.fix ?? x.why}`).join("\n");
  return `You are an Instagram growth coach. Improve my planned ${p.format} post. It scores ${(r.score / 10).toFixed(1)} out of 10 now; help me reach 9 or more.

Goal: ${p.goal === "new" ? "reach new people" : "engage my followers"}.${p.format === "reel" ? ` Length: ${p.length} seconds.` : ""}
Caption draft:
"""
${p.caption}
"""
A checker scored it ${r.score}/100 and flagged:
${fixes || "- nothing major"}

Please give me: 3 stronger hooks for the first second, a rewritten caption with a plain first line and a "send this to" line, 3 to 5 specific hashtags, and one idea for a trial reel version. Keep it short.`;
}
