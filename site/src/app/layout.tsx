import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://siddharthmehdiratta.github.io"),
  openGraph: { type: "website", siteName: "Creator Growth Studio", url: "https://siddharthmehdiratta.github.io/creator-growth-studio/", images: [{ url: "https://siddharthmehdiratta.github.io/creator-growth-studio/og.png", width: 1200, height: 630, alt: "Creator Growth Studio: Know what to post next." }] },
  twitter: { card: "summary_large_image", images: ["https://siddharthmehdiratta.github.io/creator-growth-studio/og.png"] },
  title: { default: "Creator Growth Studio: see which posts grow your account, and why", template: "%s · Creator Growth Studio" },
  description: "Free. Pick Instagram, YouTube or Twitch and get every post rated out of 10, why it worked, what to post next and a 30-day plan.",
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%2315131F'/%3E%3Cpath d='M9 21v-3M14 21v-7M19 21v-10M24 21V8' stroke='%23fff' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts load from Fontshare (Indian Type Foundry, free for commercial use; files may not be redistributed). */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        {/* One link per font: the Fontshare API reads only the first font in a link. */}
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,700,800&display=swap" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap" />
        {/* Instagram login can land on any page: send it to the report app. */}
        <script dangerouslySetInnerHTML={{ __html: `if(/^#(ig|error)=/.test(location.hash)&&!/start\\.html$/.test(location.pathname)){location.replace("${process.env.NEXT_PUBLIC_BASE ?? ""}/start.html"+location.hash)}` }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased" style={{ fontFamily: "'General Sans', ui-sans-serif, system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
