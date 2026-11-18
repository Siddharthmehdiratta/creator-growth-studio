/* Creator Growth Studio: content library. Facts carry a source; ideas are labelled as ideas. Checked 18 Nov 2026. */
window.CGS_DATA = {
  checked: "18 November 2026",
  sources: {
    signals: { text: "Instagram's head Adam Mosseri named watch time, sends per reach and likes per reach as the signals that matter most (Jan 2025, repeated since).", url: "https://buffer.com/resources/instagram-algorithms/" },
    hashtags: { text: "Instagram caps hashtags at 5 per post and Reel since December 2025.", url: "https://www.businesstoday.in/technology/news/story/no-more-hashtag-stuffing-instagram-limits-hashtag-usage-to-just-5-per-reel-and-post-507444-2025-12-19" },
    demographics: { text: "Instagram shows follower age, gender, top 45 cities and countries, only for accounts with 100+ followers.", url: "https://developers.facebook.com/docs/instagram-platform/api-reference/instagram-user/insights" },
    indexing: { text: "Since 10 July 2025, public posts from professional accounts (18+) can appear in Google search.", url: "https://metricool.com/instagram-indexing-on-google/" },
    trial: { text: "Trial reels are shown only to non-followers, and stay off your grid until you choose to share them.", url: "https://techcrunch.com/2024/12/10/instagram-rolls-out-trial-reels-that-arent-shown-to-a-creators-followers" },
    original: { text: "Instagram ranks original content above reposts; aggregator accounts get less reach.", url: "https://buffer.com/resources/instagram-algorithms/" },
    er: { text: "Engagement rate falls as accounts grow: nano 1K-10K around 4-4.5% median (Buffer data on 27M posts, 2026, as reported by IQFluence). Other studies give lower numbers, so treat it as a range.", url: "https://iqfluence.io/public/blog/engagement-rate-instagram" },
    ypp: { text: "YouTube Partner Program: fan funding needs 500 subs, 3 uploads in 90 days and 3,000 watch hours or 3M Shorts views; ads need 1,000 subs plus 4,000 watch hours or 10M Shorts views. From 1 Feb 2027 new applicants need 8,000 hours or 20M Shorts views.", url: "https://www.tubefilter.com/2026/08/10/youtube-partner-program-ad-eligibility-requirements-shorts/amp/" },
    twitch: { text: "Twitch Affiliate: 25 followers, 4 hours streamed, 4 broadcast days and 3 average viewers within 30 days (lowered in 2026 from 50 followers, 8 hours and 7 days). Check Twitch Help for changes.", url: "https://streamer.guide/guides/twitch-affiliate-requirements" },
    asci: { text: "India's ASCI requires a clear, upfront ad label on paid influencer posts; brands share responsibility. In its Feb 2025 study, 69% of top digital stars broke the rules.", url: "https://www.ascionline.in/wp-content/uploads/2025/02/Press-Release-Influencer-Disclosure-Guidelines-ASCI-Report.pdf" },
    asci_fin: { text: "Since April 2025, ASCI asks health and finance influencers to show qualifications for advice.", url: "https://www.campaignindia.in/article/influencers-credentials-please-asci-draws-the-line-on-advice/502204" },
    gta6: { text: "GTA 6 launch date: Thursday 19 November 2026, on PS5 and Xbox Series X|S.", url: "https://www.gamesradar.com/games/grand-theft-auto/gta-6-delayed-6-more-months-as-rockstar-commits-to-november-2026-and-says-sorry" }
  },

  platforms: {
    instagram: { name: "Instagram", unit: "followers", metrics: ["Reach", "Views", "Likes", "Comments", "Shares (sends)", "Saves", "Follows"],
      export: ["Open Meta Business Suite on a computer (business.facebook.com).", "Go to Insights, then Content.", "Pick the last 90 days and press Export data, then CSV.", "Optional: add columns called Hook and Topic and fill them in. The analysis then tells you which hooks and topics work."] },
    youtube: { name: "YouTube", unit: "subscribers", metrics: ["Views", "Watch time (hours)", "Average % viewed", "Impressions CTR", "Subscribers gained", "Likes", "Comments", "Shares"],
      export: ["Open YouTube Studio, then Analytics.", "Press Advanced mode (top right).", "Choose the last 90 days, then the Download icon, then Comma-separated values (.csv).", "Upload the file called Table data.csv."] },
    twitch: { name: "Twitch", unit: "followers", metrics: ["Average viewers", "Peak viewers", "Hours streamed", "Followers gained", "Chat messages", "Clips made"],
      export: ["Open Creator Dashboard, then Insights, then Stream summary.", "Note each stream's average viewers, hours, followers gained and chatters.", "Type them into the table here, one stream per row (Reach = average viewers x hours)."] }
  },

  niches: [
    { id: "gaming", name: "Gaming", subs: ["GTA 6 and open world", "BGMI and mobile battle royale", "Valorant and FPS", "Free Fire", "Minecraft", "Sim racing", "EA FC and sports games", "Game news and leaks", "Gaming setups and tech", "Streams and highlights"],
      pillars: ["Clips and clutch moments", "News and launch reactions", "Tips, settings and guides", "Setup and gear", "Community and memes"],
      hooks: ["This GTA 6 detail changes how you'll play the first mission.", "My settings went from bottom frag to MVP. Here are the 3 that mattered.", "Rate this clutch from 1 to 10. Be honest.", "Everyone's buying this for GTA 6. Don't, until you see this."],
      collabs: ["Duo clips with a creator your size", "Settings swap with a pro player", "Shop or café hosting a launch night"],
      money: ["Gaming peripheral brands (honest reviews)", "Streaming tips and memberships", "Tournament hosting", "Affiliate links for gear"] },
    { id: "tech", name: "Tech and gadgets", subs: ["Phones", "Laptops and PCs", "AI tools", "Budget tech", "Smart home"], pillars: ["Honest reviews", "Comparisons", "Hidden features", "Buying advice by budget", "Myth busting"],
      hooks: ["I used this phone for 30 days. Here's what the ads don't say.", "₹20,000 vs ₹40,000: can you tell the difference?", "Turn this setting off right now."], collabs: ["Comparison with another reviewer", "Store walk-throughs"], money: ["Review units and paid reviews (labelled)", "Affiliate links", "Tech consulting"] },
    { id: "cars", name: "Cars and bikes", subs: ["Supercars", "Budget cars", "Modifications", "Motorsport and drifting", "EVs", "Bikes"], pillars: ["Drives and sounds", "Ownership costs", "Mods and builds", "Buying guides", "Car culture and meets"],
      hooks: ["This is what a ₹10 lakh mod really sounds like.", "Don't buy this car before you see the service bill.", "Spot the fake: 3 signs of a tampered odometer."], collabs: ["Garage and workshop features", "Car meets and track days"], money: ["Dealers and garages", "Parts and accessories", "Track-day and detailing brands"] },
    { id: "fitness", name: "Fitness", subs: ["Gym", "Home workouts", "Running", "Yoga", "Sports training"], pillars: ["Form fixes", "Follow-along workouts", "Myth busting", "Progress stories", "Day in the life"],
      hooks: ["You're doing this squat wrong if your heels do this.", "3 months, same diet, one change.", "Save this for your next leg day."], collabs: ["Partner workouts", "Gym features"], money: ["Coaching programmes", "Gear brands", "Gym partnerships"], note: "Health advice: ASCI asks health influencers to show relevant qualifications." },
    { id: "food", name: "Food", subs: ["Street food", "Recipes", "Restaurant reviews", "Healthy food", "Home bakers"], pillars: ["Hidden gems", "Recipes in 30 seconds", "Price vs taste", "Food stories", "Challenges"],
      hooks: ["The best ₹50 plate in Pune, and why there's a queue at 7 am.", "Restaurant vs home: same dish, one-tenth the price.", "Stop throwing away this part."], collabs: ["Restaurant collabs", "Food walks with other creators"], money: ["Restaurant partnerships", "Kitchen brands", "Recipe e-books"] },
    { id: "fashion", name: "Fashion and style", subs: ["Men's style", "Women's style", "Streetwear", "Thrift", "Ethnic wear"], pillars: ["Outfit formulas", "Budget vs premium", "Try-on hauls", "Styling one item 5 ways", "Trend checks"],
      hooks: ["One white shirt, 5 outfits, ₹0 extra.", "This trend is over. Wear this instead.", "Rate my outfit for a wedding, honestly."], collabs: ["Local brands", "Style swaps"], money: ["Brand collabs (labelled)", "Affiliate stores", "Styling services"] },
    { id: "beauty", name: "Beauty and skincare", subs: ["Skincare", "Makeup", "Haircare", "Men's grooming"], pillars: ["Routines", "Product tests", "Ingredient explainers", "Before and after", "Budget dupes"],
      hooks: ["I tested this ₹299 dupe against the ₹3,000 original.", "Your sunscreen is fine. Your routine isn't.", "Don't mix these two."], collabs: ["Dermatologist Q&A (qualified)", "Salon features"], money: ["Brand collabs", "Affiliate", "Own product line"], note: "Skin and health claims: ASCI asks for qualifications and evidence." },
    { id: "travel", name: "Travel", subs: ["Budget travel", "Luxury", "Road trips", "Treks", "International"], pillars: ["Cost breakdowns", "Hidden spots", "Itineraries", "Mistakes to avoid", "Stays"],
      hooks: ["Goa in 3 days for ₹9,000, every rupee shown.", "Don't book this view room. Here's why.", "The trek nobody tells you about, 2 hours from Pune."], collabs: ["Hotel and homestay stays", "Travel duos"], money: ["Stays and tourism boards", "Trip planning services", "Presets and guides"] },
    { id: "photo", name: "Photography and video", subs: ["Phone photography", "Portraits", "Automotive", "Travel", "Editing"], pillars: ["Before and after edits", "One-light setups", "Gear on a budget", "Location reveals", "Client stories"],
      hooks: ["Same phone, same place. One setting changed everything.", "This ₹500 light beats a ₹15,000 flash.", "Guess the gear before the reveal."], collabs: ["Model and stylist shoots", "Brand product shoots"], money: ["Shoot bookings", "Presets and courses", "Prints"] },
    { id: "comedy", name: "Comedy and memes", subs: ["Sketches", "Relatable", "Office", "Family", "Gaming memes"], pillars: ["Recurring characters", "Relatable series", "Trends with a twist", "Collabs", "Behind the scenes"],
      hooks: ["Every Indian parent when you say 'one minute'.", "POV: you said GTA 6 is just a game.", "Tag the friend who does this."], collabs: ["Duet sketches", "Brand skits"], money: ["Brand integrations (labelled)", "Shows and events"] },
    { id: "education", name: "Education and study", subs: ["Exams", "Languages", "Careers", "Coding", "Science"], pillars: ["60-second lessons", "Mistakes and fixes", "Study systems", "Q&A", "Myths"],
      hooks: ["You've been taught this wrong since school.", "One trick that saves 2 hours of revision.", "Comment a topic and I'll explain it in 30 seconds."], collabs: ["Teacher collabs", "College clubs"], money: ["Courses", "Tutoring", "Ed-tech collabs"] },
    { id: "finance", name: "Money and finance", subs: ["Personal finance", "Investing basics", "Credit and loans", "Side income"], pillars: ["Myths", "Calculators", "Mistakes", "Explainers", "Case studies"],
      hooks: ["The EMI trick banks don't explain.", "₹5,000 a month for 10 years: the real number.", "Stop doing this with your bonus."], collabs: ["Qualified advisers", "Fintech explainers (labelled)"], money: ["Paid communities", "Fintech collabs (labelled)"], note: "Finance advice: ASCI asks for SEBI registration or clear qualifications; give education, not tips." },
    { id: "business", name: "Business and startups", subs: ["Founders", "Small business", "Marketing", "Freelancing"], pillars: ["Lessons and numbers", "Behind the scenes", "Breakdowns", "Tools", "Wins and losses"],
      hooks: ["Our first ₹1 lakh month: what actually worked.", "I'd never start a business this way again.", "3 tools that replaced a ₹30,000 hire."], collabs: ["Founder interviews", "Panels"], money: ["Consulting", "Courses", "Sponsorships"] },
    { id: "music", name: "Music and dance", subs: ["Covers", "Original music", "Dance", "Production"], pillars: ["Covers", "Originals", "Tutorials", "Challenges", "Stories"],
      hooks: ["This song, but in a style you'd never expect.", "Learn this step in 15 seconds.", "Finish the lyric in the comments."], collabs: ["Duets", "Producer collabs"], money: ["Shows", "Streaming", "Lessons"] },
    { id: "lifestyle", name: "Lifestyle and vlogs", subs: ["Day in the life", "Home", "Productivity", "Relationships"], pillars: ["Routines", "Honest stories", "Home and space", "Habits", "Q&A"],
      hooks: ["The 9 pm routine that fixed my mornings.", "What ₹50,000 a month really buys in Pune.", "One habit I quit and don't miss."], collabs: ["Room tours", "Habit challenges"], money: ["Brand collabs", "Affiliate"] },
    { id: "sports", name: "Sports", subs: ["Cricket", "Football", "Golf", "Tennis", "Racing"], pillars: ["Technique", "Match reactions", "Drills", "Gear", "Stories"],
      hooks: ["This one drill fixed my slice in a week.", "Why this shot works, frame by frame.", "Rate my swing, honestly."], collabs: ["Coach collabs", "Club features"], money: ["Coaching", "Gear brands", "Academies"] },
    { id: "local", name: "Local business (café, salon, gym, store)", subs: ["Café or restaurant", "Salon", "Gym", "Retail store", "Clinic", "Service business"], pillars: ["Behind the counter", "Customer stories", "Offers and launches", "Owner's story", "Local guides"],
      hooks: ["We tested 14 coffee beans so you don't have to.", "What ₹499 gets you here, start to finish.", "Our regulars always order this."], collabs: ["Local creators", "Neighbouring businesses"], money: ["Footfall and bookings", "Local ads"] },
    { id: "brand", name: "D2C product brand", subs: ["Apparel", "Beauty", "Food and drink", "Home", "Gadgets"], pillars: ["Product in use", "Founder story", "Customer proof (real)", "How it's made", "Comparisons"],
      hooks: ["We made this because the ₹2,000 version kept breaking.", "1 product, 5 ways people actually use it.", "Real customer, real review, no script."], collabs: ["Micro creators with real fans", "UGC creators"], money: ["Sales and repeat buyers", "Retail partners"] }
  ],

  psychology: [
    { id: "curiosity", name: "Curiosity gap", how: "Promise a specific answer the viewer doesn't have yet, then deliver it fast.", example: "This GTA 6 detail changes the first mission.", honest: "Only promise what the post actually shows." },
    { id: "identity", name: "Identity", how: "Name the viewer's group so they feel seen.", example: "If you game on a ₹30,000 budget, this is for you.", honest: "Speak to a group without mocking another." },
    { id: "proof", name: "Social proof", how: "Show real numbers or real people.", example: "312 of you asked for my settings. Here they are.", honest: "Never fake numbers, comments or reviews." },
    { id: "contrast", name: "Contrast", how: "Before and after, cheap and expensive, wrong and right.", example: "₹20,000 vs ₹40,000: can you tell?", honest: "Compare like with like." },
    { id: "interrupt", name: "Pattern interrupt", how: "Break the scroll in the first second: movement, a face, an unexpected line.", example: "Starting with the fail, then the fix.", honest: "No shock for its own sake." },
    { id: "openloop", name: "Open loop", how: "Start a story and pay it off at the end so people watch to the end.", example: "The 3rd setting is the one nobody uses.", honest: "Always pay it off." },
    { id: "reciprocity", name: "Reciprocity", how: "Give something useful for free; people return the favour with saves and follows.", example: "Save this: my full GTA 6 settings list.", honest: "Give real value, not bait." },
    { id: "scarcity", name: "Real timeliness", how: "Tie a post to a real date or event.", example: "GTA 6 launches Thursday. Do this before you start.", honest: "Only real deadlines. No fake countdowns." },
    { id: "share", name: "Share trigger", how: "Make it easy to send to one friend: 'send this to the friend who...'.", example: "Send this to the friend who still plays on default settings.", honest: "Ask once, at the end." },
    { id: "specific", name: "Specificity", how: "Exact numbers and names feel more believable than vague claims.", example: "3 settings, 11 seconds, +40 fps.", honest: "Only numbers you can show." }
  ],

  profileChecks: {
    instagram: [
      { id: "pro", label: "Professional account (Creator or Business)", why: "Needed for Insights, trial reels and Google indexing.", w: 8 },
      { id: "name", label: "Name field includes a search keyword (e.g. 'Rohan | GTA 6 tips')", why: "The name field is searchable inside Instagram.", w: 7 },
      { id: "bio", label: "Bio says who it's for, what they get, and why follow", why: "Profile visitors decide in seconds.", w: 9 },
      { id: "cta", label: "Bio has one clear next step (link, series, or 'new clip daily')", why: "One action converts better than five.", w: 5 },
      { id: "link", label: "Link goes somewhere useful (YouTube, Twitch, shop, booking)", why: "Turns reach into something you own.", w: 4 },
      { id: "pinned", label: "3 best posts pinned, each showing a different reason to follow", why: "New visitors judge you on the top row.", w: 7 },
      { id: "highlights", label: "Highlights for start here, best clips, setup or FAQ", why: "Answers questions before people leave.", w: 4 },
      { id: "niche", label: "Most posts serve one audience (about 80% on-niche)", why: "Recommendations work best when your audience is clear.", w: 9 },
      { id: "hook", label: "First second has movement, a face or a bold line", why: "Watch time is the top ranking signal.", w: 10 },
      { id: "captions", label: "On-screen text or subtitles (most watch on mute)", why: "Keeps viewers who can't play sound.", w: 5 },
      { id: "original", label: "Original content, no reposts of other creators", why: "Instagram ranks original content higher.", w: 8 },
      { id: "sendable", label: "Posts give people a reason to send them to a friend", why: "Sends per reach is a top signal for reaching new people.", w: 9 },
      { id: "hashtags", label: "3-5 specific hashtags, never more than 5", why: "Instagram caps hashtags at 5.", w: 3 },
      { id: "trial", label: "Uses trial reels to test new ideas on non-followers", why: "Tests ideas without risking your followers' feed.", w: 5 },
      { id: "reply", label: "Replies to comments in the first hour", why: "Conversation helps the post and the relationship.", w: 5 },
      { id: "stories", label: "Stories most days (polls, questions, behind the scenes)", why: "Keeps followers close; they see more of your posts.", w: 4 },
      { id: "collab", label: "Collab posts with creators your size, at least monthly", why: "Puts you in front of a new, similar audience.", w: 6 },
      { id: "consistent", label: "Posts on a schedule you can keep for 12 weeks", why: "Consistency beats bursts.", w: 7 },
      { id: "seo", label: "Captions use words people search, and alt text is set", why: "Public professional posts can appear on Google.", w: 4 }
    ],
    youtube: [
      { id: "title", label: "Titles promise one clear outcome, under about 60 characters", why: "Titles and thumbnails drive clicks.", w: 9 },
      { id: "thumb", label: "Thumbnails: one face or object, 3 words or fewer, high contrast", why: "Readable on a phone.", w: 9 },
      { id: "first30", label: "First 30 seconds deliver on the title", why: "Early drop-off kills recommendations.", w: 10 },
      { id: "chapters", label: "Chapters and keyword-rich description", why: "Helps search and skimmers.", w: 4 },
      { id: "shorts", label: "Shorts point to a long video on the same topic", why: "Turns Shorts viewers into subscribers.", w: 6 },
      { id: "series", label: "Videos come in series and playlists", why: "Session time and binge watching.", w: 6 },
      { id: "end", label: "End screens point to the next best video", why: "Keeps viewers on your channel.", w: 5 },
      { id: "consistent", label: "Upload schedule you can keep for 12 weeks", why: "Consistency builds returning viewers.", w: 7 },
      { id: "community", label: "Replies and pins comments; uses the Community tab", why: "Builds loyal viewers.", w: 4 }
    ],
    twitch: [
      { id: "schedule", label: "Fixed stream schedule shown on the channel", why: "People can only come back if they know when.", w: 10 },
      { id: "title", label: "Titles say what's happening today, not just 'live'", why: "Browsers pick streams by title and category.", w: 7 },
      { id: "category", label: "Picks categories where you can be seen (not only the biggest)", why: "Small streams vanish in huge categories.", w: 8 },
      { id: "clips", label: "Turns clips into Reels, Shorts and TikToks", why: "Short video is the main way new people find streamers.", w: 10 },
      { id: "chat", label: "Talks to chat by name, even with 2 viewers", why: "Small streams grow by making each viewer feel seen.", w: 8 },
      { id: "panels", label: "Panels: about, schedule, setup, rules", why: "Answers new viewers' questions.", w: 3 },
      { id: "raids", label: "Raids and networks with streamers your size", why: "Shared audiences grow together.", w: 6 },
      { id: "discord", label: "A Discord or Instagram where viewers stay between streams", why: "Brings people back.", w: 5 }
    ]
  },

  board: [
    { id: "ceo", name: "CEO", job: "Sets the one goal, decides what to stop, and makes the final call when advisers disagree.", default: true },
    { id: "growth", name: "Head of growth and marketing", job: "Positioning, content pillars, collabs, launch moments (like GTA 6 week) and the 90-day plan.", default: true },
    { id: "social", name: "Social media expert", job: "Platform rules for 2026: formats, hooks, trial reels, 5-hashtag cap, posting rhythm, Stories, Lives.", default: true },
    { id: "seo", name: "SEO lead", job: "Keywords for the name field, bio, captions and alt text; Google indexing of posts; YouTube titles and descriptions.", default: true },
    { id: "data", name: "Data analyst", job: "Reads the numbers, separates real patterns from luck, and says how confident each finding is.", default: true },
    { id: "creative", name: "Creative director", job: "Hooks, scripts, thumbnails and series ideas that fit the creator's voice.", default: true },
    { id: "psych", name: "Audience psychologist", job: "Why people stop, watch, share, save and follow; honest persuasion only.", default: true },
    { id: "community", name: "Community manager", job: "Comments, replies, DMs, fan groups and how to turn viewers into regulars.", default: false },
    { id: "money", name: "Brand partnerships and money lead", job: "Monetization readiness, rate card from real numbers, brand pitch, and ad-label rules.", default: false },
    { id: "critic", name: "Devil's advocate", job: "Argues against the plan and names the most likely way it fails.", default: false }
  ],

  audiences: {
    ages: ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"],
    tiers: ["Tier 1 metro (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Kolkata, Ahmedabad, Pune)", "Tier 2 city", "Tier 3 town", "Village", "Outside India"],
    countries: ["India", "United States", "United Kingdom", "UAE", "Canada", "Australia", "Singapore", "Germany", "Other"],
    languages: ["English", "Hinglish", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali", "Kannada", "Malayalam", "Gujarati", "Punjabi"]
  },

  reviewTargets: [
    { id: "account", name: "My whole account", ask: "Review the whole account and give a 90-day plan." },
    { id: "post", name: "A post before I publish it", ask: "Test this draft post on the audience panel, then improve it." },
    { id: "bio", name: "My profile and bio", ask: "Rewrite and judge the profile: name field, bio, pinned posts and highlights." },
    { id: "series", name: "A new series idea", ask: "Judge this series idea and plan the first 6 episodes." },
    { id: "collab", name: "A collab or brand pitch", ask: "Improve this pitch and say who to send it to." },
    { id: "slump", name: "Why my reach dropped", ask: "Find the most likely reasons reach dropped and what to test first." }
  ]
};
