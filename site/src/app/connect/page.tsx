import type { Metadata } from "next";
import { CheckIcon, FileArchiveIcon, KeyRoundIcon, AtSignIcon, ShieldCheckIcon } from "lucide-react";
import { PageShell, Section, SectionHead } from "@/components/site/shell";
import { Modal } from "@/components/site/modal";
import { HandleForm } from "@/components/site/handle-form";
import { InstagramMark, TwitchMark, YouTubeMark } from "@/components/site/brand-icons";
import { href } from "@/lib/site";

export const metadata: Metadata = { title: "Connect", description: "Three ways to bring your Instagram: log in with Instagram, type a username, or upload Instagram's own data download." };

const Tick = ({ children }: { children: React.ReactNode }) => <li className="flex gap-2.5 text-sm"><CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />{children}</li>;

export default function Page() {
  return (
    <PageShell group="Product" kicker="Connect" title="Bring your Instagram, your way" lead="Three ways in. Pick the one that suits you. You never type your Instagram password on this site.">
      <Section>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="relative flex flex-col rounded-3xl border-2 border-primary/40 bg-[#FAF8FF] p-7">
            <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Most detail</span>
            <KeyRoundIcon className="size-6 text-primary" />
            <h2 className="mt-4 text-xl font-semibold tracking-tight">Log in with Instagram</h2>
            <p className="mt-2 text-sm text-muted-foreground">You log in on Instagram's own page, then come straight back with your report.</p>
            <ul className="mt-5 grid gap-2"><Tick>Reach, views, watch time and skips</Tick><Tick>Sends, saves, follows and comments</Tick><Tick>Your password stays with Instagram</Tick></ul>
            <a href={href("/start.html?p=instagram&connect=1")} className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary pt-0 font-medium text-primary-foreground [margin-top:1.75rem]"><InstagramMark className="size-5" />Log in with Instagram</a>
            <p className="mt-2 text-xs text-muted-foreground">Needs a Creator or Business account. Switching on once Meta approves our app.</p>
          </div>
          <div className="flex flex-col rounded-3xl border p-7">
            <AtSignIcon className="size-6 text-primary" />
            <h2 className="mt-4 text-xl font-semibold tracking-tight">Type a username</h2>
            <p className="mt-2 text-sm text-muted-foreground">Yours or anyone's public Creator or Business account. Great for checking a creator before a brand deal.</p>
            <ul className="mt-5 grid gap-2"><Tick>Followers, likes and comments</Tick><Tick>Reel views on the last 50 posts</Tick><Tick>Nothing to log into</Tick></ul>
            <HandleForm />
          </div>
          <div className="flex flex-col rounded-3xl border p-7">
            <FileArchiveIcon className="size-6 text-primary" />
            <h2 className="mt-4 text-xl font-semibold tracking-tight">Upload a file</h2>
            <p className="mt-2 text-sm text-muted-foreground">Instagram's own "Download your information" ZIP, or a Meta Business Suite CSV. Read in your browser, never uploaded.</p>
            <ul className="mt-5 grid gap-2"><Tick>Works today, no approval needed</Tick><Tick>Up to 90 days of numbers (Meta CSV)</Tick><Tick>Stays on your device</Tick></ul>
            <div className="mt-auto grid gap-2 [margin-top:1.75rem]">
              <a href={href("/start.html?p=instagram")} className="inline-flex h-12 items-center justify-center rounded-xl border font-medium hover:bg-muted">Upload my file</a>
              <Modal wide title="How to get your Instagram file" trigger={<button type="button" className="text-sm font-medium text-primary">How do I get the file?</button>}>
                <p className="font-medium text-foreground">Option 1: Meta Business Suite (best, has reach and saves)</p>
                <ol className="mt-2 grid list-decimal gap-1.5 pl-5"><li>On a computer, open Meta Business Suite, then Insights, then Content.</li><li>Pick the last 90 days.</li><li>Press Export data, then CSV.</li></ol>
                <p className="mt-5 font-medium text-foreground">Option 2: Instagram's own download (ZIP)</p>
                <ol className="mt-2 grid list-decimal gap-1.5 pl-5"><li>In the Instagram app: your profile, the menu, then Accounts Center.</li><li>Your information and permissions, then Download your information (Instagram may call it Export your information).</li><li>Pick your Instagram account, tick Posts and Reels, choose JSON, then Create files.</li><li>Instagram emails you when it's ready. Download the ZIP and upload it here.</li></ol>
                <p className="mt-5 text-sm">Instagram changes these menus from time to time. If a label is different, search for "Download your information" in Settings.</p>
              </Modal>
            </div>
          </div>
        </div>
      </Section>
      <Section tint>
        <div className="grid grid-cols-1 gap-10 [&>*]:min-w-0 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Your safety" title="Why we never ask for your Instagram password" />
            <div className="mt-6 grid gap-4 text-muted-foreground">
              <p>Typing your Instagram password into another website is risky: whoever runs that site could take over your account. A real tool should never need it.</p>
              <p>"Log in with Instagram" is the safe way: you type your password on Instagram's own page, Instagram asks you what to share, and we only receive a key to read your numbers. You can remove it any time in Instagram's settings.</p>
            </div>
          </div>
          <div className="grid content-start gap-3">
            {[[ShieldCheckIcon, "Official API only", "No scraping, no bots."], [KeyRoundIcon, "Read-only", "We can read numbers. We can't post, delete or message."], [FileArchiveIcon, "Files stay on your device", "Uploads are read by your browser and never sent anywhere."]].map(([I, t, d]) => {
              const C = I as typeof CheckIcon;
              return <div key={t as string} className="flex gap-3 rounded-2xl border bg-background p-5"><C className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="font-medium">{t as string}</p><p className="text-sm text-muted-foreground">{d as string}</p></div></div>;
            })}
          </div>
        </div>
      </Section>
      <Section>
        <SectionHead title="Not on Instagram?" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <a href={href("/start.html?p=youtube")} className="flex items-center gap-4 rounded-2xl border p-5 hover:border-primary/40"><span className="grid size-11 place-items-center rounded-xl bg-[#FF3B30] text-white"><YouTubeMark className="size-5" /></span><span><b className="font-medium">YouTube</b><span className="block text-sm text-muted-foreground">Upload your YouTube Studio export</span></span></a>
          <a href={href("/start.html?p=twitch")} className="flex items-center gap-4 rounded-2xl border p-5 hover:border-primary/40"><span className="grid size-11 place-items-center rounded-xl bg-[#9146FF] text-white"><TwitchMark className="size-5" /></span><span><b className="font-medium">Twitch</b><span className="block text-sm text-muted-foreground">Type in your last few streams</span></span></a>
        </div>
      </Section>
    </PageShell>
  );
}
