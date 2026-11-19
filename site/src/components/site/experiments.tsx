"use client";
import { useEffect, useMemo, useState } from "react";
import { ClaudeButton } from "./claude-button";
import { loadLearned, type Learned } from "@/lib/learn";
import { planExperiments, verdict, loadRuns, saveRuns, type Experiment, type Run } from "@/lib/experiments";

const card = "rounded-2xl border bg-background p-5";
const input = "h-12 w-full rounded-xl border bg-background px-3 text-base outline-none focus:border-foreground";
const STATE_LABEL: Record<string, string> = {
  won: "Won.", lost: "Lost.", "no difference": "No difference.", "keep going": "Still running.",
};
const TONE: Record<string, string> = {
  won: "border-foreground bg-foreground text-background",
  lost: "bg-muted",
  "no difference": "bg-muted",
  "keep going": "bg-background",
};

function Card({ e, run, onAdd, onClear }: { e: Experiment; run?: Run; onAdd: (s: number) => void; onClear: () => void }) {
  const [v, setV] = useState("");
  const vd = verdict(e, run);
  const pct = Math.min(100, Math.round((vd.done / vd.needed) * 100));
  return (
    <li className={card}>
      <h3 className="text-lg font-medium">{e.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{e.why}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div><dt className="text-muted-foreground">Change this</dt><dd className="mt-1">{e.change}</dd></div>
        <div><dt className="text-muted-foreground">Keep the rest the same</dt><dd className="mt-1">{e.hold}</dd></div>
        <div><dt className="text-muted-foreground">Counts as a win</dt><dd className="mt-1 tabular-nums">{(e.win / 100).toFixed(2)}× your usual post, over {e.posts} posts</dd></div>
      </dl>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full bg-foreground transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className={`mt-3 rounded-xl px-4 py-3 text-sm ${TONE[vd.state]}`} role="status">
        <b className="font-medium">{STATE_LABEL[vd.state]}</b> {vd.line}
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="flex-1 min-w-[12rem] text-sm">
          <span className="text-muted-foreground">Score of your next post in this test</span>
          <input className={`${input} mt-1`} inputMode="numeric" placeholder="e.g. 140" value={v}
            onChange={(ev) => setV(ev.target.value.replace(/[^0-9.]/g, ""))}
            onKeyDown={(ev) => { if (ev.key === "Enter" && v) { onAdd(Number(v)); setV(""); } }} />
        </label>
        <button type="button" className="h-12 rounded-xl border px-4 text-sm hover:border-foreground disabled:opacity-40"
          disabled={!v} onClick={() => { onAdd(Number(v)); setV(""); }}>Add post</button>
        {!!run?.scores.length && (
          <button type="button" className="h-12 rounded-xl px-3 text-sm text-muted-foreground underline underline-offset-4" onClick={onClear}>
            Clear {run.scores.length}
          </button>
        )}
      </div>
      {!!run?.scores.length && (
        <p className="mt-2 text-xs text-muted-foreground tabular-nums">Recorded: {run.scores.join(", ")}</p>
      )}
    </li>
  );
}

export function Experiments() {
  const [learned, setLearned] = useState<Learned | null>(null);
  const [runs, setRuns] = useState<Record<string, Run>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => { setLearned(loadLearned()); setRuns(loadRuns()); setReady(true); }, []);
  useEffect(() => { if (ready) saveRuns(runs); }, [runs, ready]);

  const plan = useMemo(() => planExperiments(learned), [learned]);
  const add = (id: string, s: number) =>
    setRuns((r) => ({ ...r, [id]: { id, scores: [...(r[id]?.scores || []), s] } }));
  const clear = (id: string) => setRuns((r) => { const n = { ...r }; delete n[id]; return n; });

  const open = plan.filter((e) => verdict(e, runs[e.id]).state === "keep going");
  const settled = plan.filter((e) => verdict(e, runs[e.id]).state !== "keep going");

  if (!ready) return <div className="h-40" aria-hidden />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className={`${card} mb-8`}>
        <h2 className="text-lg font-medium">How this works</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Change one thing at a time. Change five and a good week tells you nothing about which one caused it.
          Each test below names the single thing to change, what to hold still, and the number that counts as a win
          before you start. Record the score of each post from your free report. When enough posts are in, this says
          won, lost, or no difference.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          The win numbers are rules of thumb, not statistics: three posts have to show a big gap because three posts
          swing a long way on luck, eight posts can show a smaller one. When a result sits inside that swing, this
          says no difference rather than picking a winner.
        </p>
        {!learned && (
          <p className="mt-3 rounded-xl bg-muted px-4 py-3 text-sm">
            You have not run the free report in this browser yet, so the tests below are the ones that apply to any
            account. Run the report and this page adds the tests built from your own posts.
          </p>
        )}
      </div>

      {!!open.length && (
        <>
          <h2 className="mb-4 text-xl font-medium">Running now</h2>
          <ul className="grid gap-5">
            {open.map((e) => <Card key={e.id} e={e} run={runs[e.id]} onAdd={(s) => add(e.id, s)} onClear={() => clear(e.id)} />)}
          </ul>
        </>
      )}

      {!!settled.length && (
        <>
          <h2 className="mb-4 mt-10 text-xl font-medium">Settled</h2>
          <ul className="grid gap-5">
            {settled.map((e) => <Card key={e.id} e={e} run={runs[e.id]} onAdd={(s) => add(e.id, s)} onClear={() => clear(e.id)} />)}
          </ul>
        </>
      )}

      <div className={`${card} mt-10`}>
        <h2 className="text-lg font-medium">Take it further</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Hand the open tests to Claude and it will write the posts, hold the rest of the variables still, and tell you
          what it changed.
        </p>
        <div className="mt-4">
          <ClaudeButton prompt={claudePrompt(plan, runs)} label="Plan these tests with Claude" />
        </div>
      </div>
    </div>
  );
}

function claudePrompt(plan: Experiment[], runs: Record<string, Run>) {
  const lines = plan.slice(0, 4).map((e) => {
    const v = verdict(e, runs[e.id]);
    return `- ${e.title}. Change: ${e.change} Hold still: ${e.hold} Win: ${(e.win / 100).toFixed(2)}x my usual post over ${e.posts} posts. Status: ${v.state}, ${v.done} of ${v.needed} posts in.`;
  });
  return `I am running these Instagram tests, one variable at a time:\n${lines.join("\n")}\n\nWrite the posts for the first test that is still running. Change only the one thing it names and keep everything else the same as my usual post. At the end, list exactly what you changed and what you kept, so I can tell whether the result means anything.`;
}
