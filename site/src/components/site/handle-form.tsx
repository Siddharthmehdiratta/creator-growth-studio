"use client";
import { useState } from "react";
import { href } from "@/lib/site";
export function HandleForm() {
  const [v, setV] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (v.trim()) location.href = href(`/start.html?p=instagram&u=${encodeURIComponent(v.trim())}`); }} className="mt-5 flex gap-2">
      <label htmlFor="cu" className="sr-only">Instagram username or profile link</label>
      <span className="relative flex-1"><span aria-hidden className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground">@</span>
        <input id="cu" value={v} onChange={(e) => setV(e.target.value)} placeholder="username" autoCapitalize="none" spellCheck={false} className="h-12 w-full min-w-0 rounded-xl border bg-background pr-3 pl-8 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></span>
      <button className="h-12 shrink-0 rounded-xl bg-primary px-5 font-medium text-primary-foreground">Go</button>
    </form>
  );
}
