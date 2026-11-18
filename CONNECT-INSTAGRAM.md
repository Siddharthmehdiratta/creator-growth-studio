# Switch on "Connect Instagram" and username lookup

This takes about 25 minutes, once. After that, anyone can type a username or press Connect Instagram on the site.

The site itself stays a free static page on GitHub Pages. You add one small free helper, a Cloudflare Worker. It holds your app's secret key, because a secret can't safely sit in a web page. The code is in [`connect/worker.js`](connect/worker.js). It stores nothing.

## What each option reads

| Option | Who can use it | What it reads |
| --- | --- | --- |
| Type a username | Anyone. The account must be a public Creator or Business account | Followers, and for the last 50 posts: likes, comments, Reel views, captions and dates |
| Connect Instagram | The account owner, after logging in | Everything above, plus reach, views, watch time, skip rate, sends, saves, follows, profile visits and comments |

Personal Instagram accounts can't be read by any official app. The fix is free: in the Instagram app, open **Settings**, then **Account type and tools**, then **Switch to professional account**.

## Part 1: Create the Meta app (10 minutes)

1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps) and log in with your Facebook account.
2. Click **Create app**, enter the name **Creator Growth Studio** and your email, then click **Next**.
3. For the use case, choose **Other**, then click **Next**.
4. For the app type, choose **Business**, then click **Create app**. Enter your Facebook password if asked.
5. On the next page, find the **Instagram** product and click **Set up**. This adds **API setup with Instagram login**.
6. Copy the **Instagram app ID** and the **Instagram app secret** from that page. Keep them for Part 2.
7. In section **3. Set up Instagram business login**, click **Set up**, add this redirect URL and click **Save**. You'll get the exact address in Part 2, step 6: `https://cgs-connect.YOUR-NAME.workers.dev/callback`
8. Under **Add account**, add your own Instagram account and your friends' accounts as testers. Each account must be public. You can change the list later in **App Roles**, then **Roles**.

Meta's screens change often, so the names above may differ slightly. Until Meta approves the app, only you and your testers can use Connect Instagram. To open it to everyone, submit **App Review** for `instagram_business_basic`, `instagram_business_manage_insights` and `instagram_business_manage_comments`. Meta also requires **Business Verification**, which needs business documents. It usually takes 2 to 4 weeks.

## Part 2: Put the Worker online (10 minutes)

1. Sign up free at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up).
2. Open **Workers and Pages**, then click **Create**, then **Create Worker**.
3. Name it **cgs-connect** and click **Deploy**.
4. Click **Edit code**. Delete everything in the editor, paste the whole of `connect/worker.js`, and click **Deploy**.
5. Go back to the Worker. Open **Settings**, then **Variables and Secrets**, and add these three:
   - `IG_APP_ID`: your Instagram app ID (type **Text**)
   - `IG_APP_SECRET`: your Instagram app secret (type **Secret**)
   - `SITE_URL`: `https://siddharthmehdiratta.github.io/creator-growth-studio/start.html` (type **Text**)
6. Copy the Worker's address, for example `https://cgs-connect.your-name.workers.dev`. Use it to finish Part 1, step 7.
7. In this repo, open `docs/config.js` and set `connectUrl` to that address. The Connect Instagram button then works.

## Part 3: Switch on username lookup (5 minutes, optional)

Username lookup uses Meta's Business Discovery API. It runs on your own Instagram professional account, which must be linked to a Facebook Page.

1. In the same Meta app, add the use case **Manage everything on your Page**. Facebook Login for Business comes with it.
2. Open the [Graph API Explorer](https://developers.facebook.com/tools/explorer/). Pick your app, then click **Generate Access Token** with these permissions: `instagram_basic`, `pages_show_list`, `pages_read_engagement` and `business_management`.
3. Run `me/accounts?fields=instagram_business_account` and copy the `instagram_business_account` ID.
4. Open the [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/), paste the token, and click **Extend Access Token** to get a 60-day token.
5. In the Worker settings, add `OWNER_IG_ID` (type **Text**) and `OWNER_TOKEN` (type **Secret**).

Lookups are cached for one hour, so they use less of Instagram's hourly limit. Renew the token every 60 days with steps 2 and 4.

## Check it works

1. Open the site, type a big public account such as `natgeo`, and press **Get my report**.
2. Press **Connect Instagram** and log in with your own account.

If something fails, the site shows Instagram's reason in plain English.
