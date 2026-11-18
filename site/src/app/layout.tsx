import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Creator Growth Studio: see which posts grow your account, and why", template: "%s · Creator Growth Studio" },
  description: "Free. Pick Instagram, YouTube or Twitch and get a star rating for every post, why it worked, what to post next and a 30-day plan.",
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%236C47FF'/%3E%3Cpath d='M9 21v-3M14 21v-7M19 21v-10M24 21V8' stroke='%23fff' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <head>
        {/* Instagram login can land on any page: send it to the report app. */}
        <script dangerouslySetInnerHTML={{ __html: `if(/^#(ig|error)=/.test(location.hash)&&!/start\\.html$/.test(location.pathname)){location.replace("${process.env.NEXT_PUBLIC_BASE ?? ""}/start.html"+location.hash)}` }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased" style={{ fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
