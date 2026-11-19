/* Ads Checker maths. Every number is worked out from what the user types; there are no invented benchmarks.
   Rules of thumb are labelled as such in the findings. */
export type Goal = "followers" | "sales" | "messages" | "reach";
export type Ad = {
  goal: Goal; spend: number; days: number; reach: number; results: number;
  orders: number; orderValue: number; marginPct: number; target: number; beatNormal: "yes" | "no" | "unsure";
};
export type Finding = { tone: "good" | "warn" | "bad" | "info"; title: string; text: string; src?: { name: string; url: string } };
export type Verdict = "working" | "close" | "losing" | "too-early" | "need-target" | "empty";
export const DEFAULT_AD: Ad = { goal: "followers", spend: 2100, days: 7, reach: 18000, results: 60, orders: 0, orderValue: 0, marginPct: 40, target: 30, beatNormal: "yes" };
export const AD_SOURCES = {
  metaBudget: { name: "Shopify, citing Meta", url: "https://www.shopify.com/ca/blog/how-to-boost-instagram-post" },
};
export const RESULT_WORD: Record<Goal, string> = { followers: "new follower", sales: "order", messages: "message", reach: "1,000 people reached" };
export const AD_TYPE: Record<Goal, { title: string; text: string }> = {
  followers: { title: "Boost a reel that already did well", text: "Pick a reel that beat your normal reach without paying. Boost it with the goal set to profile visits." },
  sales: { title: "A sales campaign in Meta Ads Manager", text: "Boosting cannot aim for purchases. Use Ads Manager with the sales goal, and install the Meta pixel on your shop so orders are counted." },
  messages: { title: "Boost with the messages goal", text: "Boost a post that explains your offer, with the goal set to messages. Reply fast: slow replies waste the spend." },
  reach: { title: "Boost your best recent post", text: "Use a post that already beat your normal reach. Paid reach on a weak post buys views, not interest." },
};
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

export function checkAd(a: Ad) {
  const spend = Math.max(0, a.spend || 0), days = Math.max(0, a.days || 0), reach = Math.max(0, a.reach || 0);
  const results = Math.max(0, (a.goal === "sales" ? a.orders : a.results) || 0);
  const perDay = days ? round(spend / days) : 0;
  const cpm = reach ? round((spend / reach) * 1000) : null;          // cost per 1,000 people reached
  const cpr = results ? round(spend / results) : null;                 // cost per result
  const margin = Math.min(100, Math.max(0, a.marginPct || 0)) / 100;
  const revenue = a.goal === "sales" ? round(results * (a.orderValue || 0)) : null;
  const roas = revenue !== null && spend ? round(revenue / spend) : null;            // sales per 1 spent
  const breakEvenRoas = a.goal === "sales" && margin ? round(1 / margin) : null;     // sales per 1 spent needed to break even
  const profit = revenue !== null ? round(revenue * margin - spend) : null;          // money left after product cost and ad spend
  const maxCostPerOrder = a.goal === "sales" ? round((a.orderValue || 0) * margin) : null;
  const findings: Finding[] = [];
  let verdict: Verdict;

  const tooShort = days > 0 && days < 7, tooFew = a.goal !== "reach" && results < 10;
  if (!spend) verdict = "empty";
  else if (a.goal === "sales") {
    if (!a.orderValue || !margin) verdict = "need-target";
    else if (profit! > spend * 0.1) verdict = "working";
    else if (profit! >= -spend * 0.1) verdict = "close";
    else verdict = "losing";
  } else {
    const cost = a.goal === "reach" ? cpm : cpr;
    if (!a.target) verdict = "need-target";
    else if (cost === null) verdict = "losing";
    else if (cost <= a.target) verdict = "working";
    else if (cost <= a.target * 1.25) verdict = "close";
    else verdict = "losing";
  }
  const early = spend > 0 && (tooShort || tooFew);
  if (early && verdict !== "empty" && verdict !== "need-target") {
    findings.push({ tone: "warn", title: "Too early to be sure", text: tooShort
      ? `The ad ran ${days} day${days === 1 ? "" : "s"}. Meta suggests more than 6 days so its system has time to learn who responds.`
      : `Only ${results} ${results === 1 ? "result" : "results"} so far. Under 10, one lucky day can swing the numbers. This is a rule of thumb, not a Meta rule.`,
      src: tooShort ? AD_SOURCES.metaBudget : undefined });
  }
  if (a.beatNormal === "no") findings.push({ tone: "warn", title: "This post was weak before you paid", text: "It did not beat your normal reach on its own. Paying rarely rescues a post people skipped. Next time, pick a post that already did well. Common practice, not a Meta rule." });
  if (a.beatNormal === "yes") findings.push({ tone: "good", title: "You picked a proven post", text: "It beat your normal reach before you paid, so the ad starts from something people already liked." });
  if (a.goal === "sales" && maxCostPerOrder) findings.push({ tone: "info", title: "Your break-even cost per order", text: `With this order value and margin, each order can cost up to ${maxCostPerOrder} in ads before you lose money.` });
  if (a.goal === "sales" && roas !== null && breakEvenRoas !== null) findings.push({ tone: roas >= breakEvenRoas ? "good" : "bad", title: roas >= breakEvenRoas ? "Sales cover the product cost and the ad" : "Sales do not cover the ad yet", text: `You made ${roas} in sales for every 1 spent. You need ${breakEvenRoas} to break even at a ${Math.round(margin * 100)}% margin.` });

  const next: string[] =
    verdict === "working" ? ["Keep it running.", "Raise the daily budget in small steps, about 20% at a time, and check the cost again after 3 days. Rule of thumb.", "Make a second ad from your next best post so you are not relying on one."] :
    verdict === "close" ? ["Do not raise the budget yet.", "Change one thing: the first 3 seconds, the caption's first line, or the audience.", "Run 7 more days and compare the cost per result."] :
    verdict === "losing" ? ["Pause this ad.", "Do not fix it with more money. Change the post itself, or pick a stronger one.", "Test again with a small budget for 7 days."] :
    verdict === "need-target" ? [a.goal === "sales" ? "Add your average order value and margin to get a verdict." : "Add the most you would pay for one result to get a verdict."] :
    ["Type what you spent and what you got."];
  if (early && (verdict === "working" || verdict === "losing" || verdict === "close")) next.unshift("Treat this as an early reading. Let it reach 7 days and 10 results before a big decision.");

  return { verdict, early, perDay, cpm, cpr, results, revenue, roas, breakEvenRoas, profit, maxCostPerOrder, findings, next, adType: AD_TYPE[a.goal] };
}

/* Plan a first test: how much to set aside, and what it must return. */
export function planTest(daily: number, orderValue: number, marginPct: number) {
  const total = round(Math.max(0, daily) * 7);
  const perOrder = (orderValue || 0) * (Math.min(100, Math.max(0, marginPct || 0)) / 100);
  return { total, ordersToBreakEven: perOrder > 0 ? Math.ceil(total / perOrder) : null };
}
