export const FAQS: [string, [string, string][]][] = [
  ["Getting started", [
    ["Is it really free?", "Yes. It's open source under the MIT licence, and you can read every line on GitHub. There's nothing to buy and no account to create."],
    ["What do I need to start?", "Just your platform. For Instagram, type your username. For YouTube, download your YouTube Studio export. For Twitch, have your last few streams' numbers ready."],
    ["Does it work with a small account?", "Yes. Ratings compare each post with your own typical post, so they work from your first few posts. With fewer than 15 posts, the report says its patterns are early hints, not proof."],
    ["Can I try it without my own account?", "Yes. Press See a sample report. The sample is a fictional gaming creator with 40 posts, analysed by the real tool."],
  ]],
  ["Instagram connection", [
    ["Can I just type my Instagram link?", "Yes. Type a username or paste a profile link, and the tool reads that account's public numbers through Instagram's official API: followers, likes, comments and Reel views for the last 50 posts."],
    ["Why doesn't my account show up?", "Instagram only lets apps read Creator and Business accounts. In the Instagram app, open Settings, then Account type and tools, then Switch to professional account. It's free and you can switch back."],
    ["What does Connect Instagram add?", "Reach, views, average watch time, skip rate, sends, saves, follows, profile visits and your comments. Instagram only shares these with the account owner, after they log in through Instagram's own page."],
    ["Is the username box working yet?", "Username lookup and Connect Instagram switch on once the site's Meta app is set up and approved. Until then, uploading your export gives the same detail and takes about 2 minutes."],
  ]],
  ["Stars and scores", [
    ["How are the stars worked out?", "Each post gets a score where 100 is your typical post. It blends reach with quality signals per person reached: watch time and sends count most, then follows, then likes, saves, comments and hold rate. 3.5 stars is typical; 5 stars is about twice as good as usual."],
    ["Why did a post with lots of views get few stars?", "Stars look at how strongly people reacted, not just how many saw it. A post can reach many people but get few sends, follows or a short watch time. The post's detail shows which signal held it back."],
    ["How sure are the patterns?", "Only patterns that pass a strict statistical test are shown, compared like with like. Each one says whether the evidence is strong or good. Thin groups are never shown as rules."],
  ]],
  ["YouTube and Twitch", [
    ["How do I get my YouTube export?", "Open YouTube Studio, then Analytics, then Advanced mode. Pick the last 90 days, press the download icon and choose CSV. Upload the file called Table data.csv."],
    ["Are Shorts and long videos mixed up?", "No. Videos of 60 seconds or less are treated as Shorts and rated against each other, separately from long videos."],
    ["How does Twitch work without a login?", "You type in your last few streams: date, start time, average viewers, hours, followers gained and chat messages. The report then finds your best days, times and stream lengths."],
  ]],
  ["Privacy and safety", [
    ["Is my data stored anywhere?", "No. Your report is worked out inside your own browser. Username lookups and Connect Instagram pass through a small connector that asks Instagram for the numbers and stores nothing. Uploaded files never leave your browser."],
    ["Do you need my password?", "Never. Connect Instagram uses Instagram's own login page. The tool never sees your password."],
    ["Can it guarantee followers?", "No. No honest tool can. It tells you what works for your audience so you can do more of it."],
  ]],
  ["Brands and agencies", [
    ["Can I check a creator before paying them?", "Yes. Type their username. The audience health check compares their engagement with accounts of the same size and flags patterns that suggest bought likes."],
    ["Can it show a creator's audience ages and cities?", "No tool can see another account's private audience data. Ask the creator for an Insights screenshot before you pay."],
  ]],
];
