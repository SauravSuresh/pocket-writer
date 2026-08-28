# Gagan Achari v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Gagan Achari — a local-first, desktop-only, text-only web app that turns screenplay feedback into an enforced root-cause-first action plan, gamified as a campaign.

**Architecture:** One seam. `src/domain/*` is pure TypeScript over plain data (no DOM, no storage) and owns every rule; it is the only thing tested. `src/storage/db.ts` persists one `Account` object to IndexedDB. `src/ui/*` is a thin Preact layer rendering the two locked prototype layouts (`.scratch/feedback-tool/prototypes/*.html`). Mutations go through `src/ui/store.ts`, which mutates the in-memory `Account`, saves, and re-renders.

**Tech Stack:** TypeScript, Vite, Preact, `idb`, `fflate` (zip), Vitest. Static hosting (Cloudflare Pages / GitHub Pages).

**Spec:** `.scratch/feedback-tool/spec.md` (glossary: `CONTEXT.md`; decisions: `.scratch/feedback-tool/issues/01–11`).

## Global Constraints

- App name everywhere: **Gagan Achari**. Tab title `Gagan Achari`. Backup filename `gagan-achari-backup-<YYYY-MM-DD>.json`. IndexedDB name `gagan-achari`.
- No AI, no transcription, no audio, no network calls at runtime, no accounts, no backend. Desktop only.
- Data model uses glossary terms (`CONTEXT.md`). Campaign vocabulary and unserious copy live only in `src/ui/copy.ts`.
- Severity is never overridden; Action Order is never hand-reordered.
- Every Issue needs a solution; there is no "cleared" status. Statuses are exactly `Raw | Captured | Assessed | Planned`, derived.
- Tag weights default: Theme 9, Tone 8, Character 7, Arc 6, Structure 5, Exposition 4, Logic 3, Scene 2, Dialogue 1. Sub-tags (`Character/Dynamics`) inherit the parent weight.
- Affinity ranks, in order: `Walked out, Unconvinced, Watching, Nodding, Loves it` (indexes 0–4). Faces: `🚪 😤 👀 🙂 😍`.
- Tests: Vitest, domain only. No UI, storage, sound, or animation tests.
- Commit after every task. Repo is not yet a git repo; Task 1 initialises it.

---

## Part A — Domain core and storage

### Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/ui/App.tsx`, `.gitignore`
- Test: `tests/smoke.test.ts`

**Interfaces:**
- Produces: a runnable Vite + Preact app at `pnpm dev`, and `pnpm test` running Vitest.

- [ ] **Step 1: Initialise git and package**

```bash
cd /Users/sauravsuresh/workspace/personal/secondchild
git init
printf 'node_modules\ndist\n.scratch/feedback-tool/prototypes/*.bak\n' > .gitignore
pnpm init
pnpm add preact idb fflate
pnpm add -D vite @preact/preset-vite typescript vitest
```

- [ ] **Step 2: Write config files**

`package.json` scripts block (merge into the generated file):
```json
"scripts": {
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
},
"type": "module"
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler",
    "jsx": "react-jsx", "jsxImportSource": "preact",
    "strict": true, "noEmit": true, "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": ["src", "tests"]
}
```

`vite.config.ts`:
```ts
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
export default defineConfig({ plugins: [preact()], test: { environment: "node", include: ["tests/**/*.test.ts"] } } as any);
```

`index.html`:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gagan Achari</title>
  <link rel="stylesheet" href="/src/ui/styles.css" />
</head>
<body><div id="app"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
```

`src/main.tsx`:
```tsx
import { render } from "preact";
import { App } from "./ui/App";
render(<App />, document.getElementById("app")!);
```

`src/ui/App.tsx` (placeholder until Task 13 replaces it):
```tsx
export function App() { return <h1>Gagan Achari</h1>; }
```

Create an empty `src/ui/styles.css`.

- [ ] **Step 3: Write the smoke test**

`tests/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";
describe("toolchain", () => { it("runs", () => { expect(1 + 1).toBe(2); }); });
```

- [ ] **Step 4: Run test and dev build**

Run: `pnpm test`
Expected: `1 passed`.
Run: `pnpm build`
Expected: `dist/` produced, no TS errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Gagan Achari (vite + preact + vitest)"
```

---

### Task 2: Domain types, defaults, ids

**Files:**
- Create: `src/domain/types.ts`
- Test: `tests/types.test.ts`

**Interfaces:**
- Produces: all data types below; `DEFAULT_TAG_WEIGHTS`, `TAGS`, `RANKS`, `newId()`, `now()`, `weightOf(tag, weights)`.

- [ ] **Step 1: Write the failing test**

`tests/types.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { DEFAULT_TAG_WEIGHTS, weightOf, newId, RANKS, TAGS } from "../src/domain/types";

describe("types", () => {
  it("has the nine default weights", () => {
    expect(DEFAULT_TAG_WEIGHTS).toEqual({ Theme: 9, Tone: 8, Character: 7, Arc: 6, Structure: 5, Exposition: 4, Logic: 3, Scene: 2, Dialogue: 1 });
    expect(TAGS).toEqual(["Theme","Tone","Character","Arc","Structure","Exposition","Logic","Scene","Dialogue"]);
  });
  it("sub-tags inherit the parent weight", () => {
    expect(weightOf("Character/Dynamics", DEFAULT_TAG_WEIGHTS)).toBe(7);
    expect(weightOf("Nonsense", DEFAULT_TAG_WEIGHTS)).toBe(0);
  });
  it("ranks are ordered", () => {
    expect(RANKS).toEqual(["Walked out","Unconvinced","Watching","Nodding","Loves it"]);
  });
  it("ids are unique strings", () => {
    expect(newId()).not.toBe(newId());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/types.test.ts`
Expected: FAIL — cannot resolve `../src/domain/types`.

- [ ] **Step 3: Write the types**

`src/domain/types.ts`:
```ts
export type NeedsAction = "undecided" | "yes" | "no";
export type CascadeAnswer = "full" | "partial" | "no";
export type NudgeId = "N2" | "N3" | "N6";
export type Status = "Raw" | "Captured" | "Assessed" | "Planned";
export type Kind = "reaction" | "suggestion";

export interface Reference { url: string; label?: string }
export interface Skip { nudge: NudgeId; at: string }

export interface Issue {
  id: string; draftId: string; createdAt: string;
  title: string; description: string; thoughts: string; references: Reference[];
  tags: string[];
  causedBy: string[]; isRoot: boolean;
  needsAction: NeedsAction; canBeAddressed: string; whyDiverges: string;
  solution: string; reasonNotActing: string;
  coveredBy?: string; partialOf?: string;
  cascadeAnswers: Record<string, CascadeAnswer>;
  skips: Skip[];
  ancestorId?: string; pinnedNote?: string;
  ideaIds: string[];
  adoptedSuggestions: { itemId: string; giverId: string }[];
}
export interface FeedbackItem { id: string; sessionId: string; draftId: string; giverId: string; kind: Kind; text: string; issueIds: string[] }
export interface Session { id: string; draftId: string; date: string; giverIds: string[] }
export interface Giver { id: string; name: string }
export interface Idea { id: string; text: string; issueIds: string[]; usedInDraft?: number }
export interface EndTurnSummary { grade: Grade; planned: number; total: number; bossesCleared: number; roots: number; skipped: string[]; unplanned: string[]; walkedOut: string[]; rankChanges: { giverId: string; from: number; to: number }[]; at: string }
export type Grade = "S" | "A" | "B" | "C";
export interface Draft { id: string; number: number; frozen: boolean; createdAt: string; summary?: EndTurnSummary; exportStale?: boolean; dismissedN4: string[] }
export interface Project {
  id: string; name: string; isSample: boolean; createdAt: string;
  tagWeights: Record<string, number>;
  givers: Giver[]; drafts: Draft[]; sessions: Session[]; items: FeedbackItem[]; issues: Issue[]; ideas: Idea[];
  lastRank: Record<string, number>;
}
export interface Settings { sound: boolean; lastBackupAt?: string; seenHowItWorks: boolean; tourDone: boolean }
export interface Account { schemaVersion: 1; projects: Project[]; settings: Settings }

export const TAGS = ["Theme","Tone","Character","Arc","Structure","Exposition","Logic","Scene","Dialogue"] as const;
export const SUBTAGS = ["Character/Dynamics","Logic/Emotional","Logic/Physical","Arc/Relationship"] as const;
export const DEFAULT_TAG_WEIGHTS: Record<string, number> = { Theme: 9, Tone: 8, Character: 7, Arc: 6, Structure: 5, Exposition: 4, Logic: 3, Scene: 2, Dialogue: 1 };
export const RANKS = ["Walked out","Unconvinced","Watching","Nodding","Loves it"] as const;

export const weightOf = (tag: string, weights: Record<string, number>): number => weights[tag.split("/")[0]] ?? 0;
export const newId = (): string => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const now = (): string => new Date().toISOString();

export function emptyIssue(draftId: string, title = ""): Issue {
  return { id: newId(), draftId, createdAt: now(), title, description: "", thoughts: "", references: [], tags: [], causedBy: [], isRoot: false,
    needsAction: "undecided", canBeAddressed: "", whyDiverges: "", solution: "", reasonNotActing: "", cascadeAnswers: {}, skips: [], ideaIds: [], adoptedSuggestions: [] };
}
export function emptyAccount(): Account { return { schemaVersion: 1, projects: [], settings: { sound: true, seenHowItWorks: false, tourDone: false } }; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/types.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/domain/types.ts tests/types.test.ts
git commit -m "feat(domain): types, defaults, ids"
```

---

### Task 3: Severity, derived status, "what's missing"

**Files:**
- Create: `src/domain/issue.ts`
- Test: `tests/issue.test.ts`

**Interfaces:**
- Consumes: `Issue`, `weightOf`, `emptyIssue` from Task 2.
- Produces: `severity(issue, weights): number`, `status(issue): Status`, `missing(issue): string[]` (machine keys, UI maps to copy).

- [ ] **Step 1: Write the failing test**

`tests/issue.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { severity, status, missing } from "../src/domain/issue";
import { emptyIssue, DEFAULT_TAG_WEIGHTS } from "../src/domain/types";

const W = DEFAULT_TAG_WEIGHTS;
const mk = (p: Partial<ReturnType<typeof emptyIssue>>) => ({ ...emptyIssue("d1", "t"), ...p });

describe("severity", () => {
  it("is 0 when untagged", () => { expect(severity(mk({}), W)).toBe(0); });
  it("is max weight + 1 per extra tag", () => {
    expect(severity(mk({ tags: ["Theme"] }), W)).toBe(9);
    expect(severity(mk({ tags: ["Logic", "Scene"] }), W)).toBe(4);
    expect(severity(mk({ tags: ["Theme","Character","Character/Dynamics","Exposition","Logic","Structure","Tone"] }), W)).toBe(15);
  });
});

describe("status", () => {
  it("Raw with only a title", () => { expect(status(mk({}))).toBe("Raw"); });
  it("Captured with a description", () => { expect(status(mk({ description: "x" }))).toBe("Captured"); });
  it("Assessed needs tag + root/cause + needsAction + canBeAddressed", () => {
    const base = { description: "x", tags: ["Theme"], isRoot: true, needsAction: "yes" as const, canBeAddressed: "yes" };
    expect(status(mk(base))).toBe("Assessed");
    expect(status(mk({ ...base, tags: [] }))).toBe("Captured");
    expect(status(mk({ ...base, isRoot: false }))).toBe("Captured");
    expect(status(mk({ ...base, isRoot: false, causedBy: ["z"] }))).toBe("Assessed");
    expect(status(mk({ ...base, needsAction: "undecided" }))).toBe("Captured");
    expect(status(mk({ ...base, canBeAddressed: "" }))).toBe("Captured");
  });
  it("Planned needs a solution; no-action also needs reason + whyDiverges", () => {
    const base = { description: "x", tags: ["Theme"], isRoot: true, needsAction: "yes" as const, canBeAddressed: "yes", solution: "do it" };
    expect(status(mk(base))).toBe("Planned");
    const no = { ...base, needsAction: "no" as const };
    expect(status(mk(no))).toBe("Assessed");
    expect(status(mk({ ...no, reasonNotActing: "r" }))).toBe("Assessed");
    expect(status(mk({ ...no, reasonNotActing: "r", whyDiverges: "w" }))).toBe("Planned");
  });
});

describe("missing", () => {
  it("lists keys needed for the next status", () => {
    expect(missing(mk({}))).toEqual(["description"]);
    expect(missing(mk({ description: "x" }))).toEqual(["tags","cause","needsAction","canBeAddressed"]);
    expect(missing(mk({ description: "x", tags: ["Theme"], isRoot: true, needsAction: "no", canBeAddressed: "y" }))).toEqual(["solution","reasonNotActing","whyDiverges"]);
    expect(missing(mk({ description: "x", tags: ["Theme"], isRoot: true, needsAction: "yes", canBeAddressed: "y", solution: "s" }))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/issue.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/domain/issue.ts`:
```ts
import { Issue, Status, weightOf } from "./types";

export function severity(i: Issue, weights: Record<string, number>): number {
  if (!i.tags.length) return 0;
  return Math.max(...i.tags.map(t => weightOf(t, weights))) + (i.tags.length - 1);
}

const assessed = (i: Issue) => i.tags.length > 0 && (i.isRoot || i.causedBy.length > 0) && i.needsAction !== "undecided" && i.canBeAddressed.trim() !== "";
const planned = (i: Issue) => i.solution.trim() !== "" && (i.needsAction !== "no" || (i.reasonNotActing.trim() !== "" && i.whyDiverges.trim() !== ""));

export function status(i: Issue): Status {
  if (i.description.trim() === "") return "Raw";
  if (!assessed(i)) return "Captured";
  if (!planned(i)) return "Assessed";
  return "Planned";
}

export function missing(i: Issue): string[] {
  const s = status(i);
  if (s === "Raw") return ["description"];
  if (s === "Captured") {
    const m: string[] = [];
    if (!i.tags.length) m.push("tags");
    if (!i.isRoot && !i.causedBy.length) m.push("cause");
    if (i.needsAction === "undecided") m.push("needsAction");
    if (!i.canBeAddressed.trim()) m.push("canBeAddressed");
    return m;
  }
  if (s === "Assessed") {
    const m: string[] = [];
    if (!i.solution.trim()) m.push("solution");
    if (i.needsAction === "no" && !i.reasonNotActing.trim()) m.push("reasonNotActing");
    if (i.needsAction === "no" && !i.whyDiverges.trim()) m.push("whyDiverges");
    return m;
  }
  return [];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/issue.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/domain/issue.ts tests/issue.test.ts
git commit -m "feat(domain): severity, derived status, missing"
```

---

### Task 4: Cause graph — cycle check, Action Order, minions

**Files:**
- Create: `src/domain/graph.ts`, `tests/fixtures/v3.ts`
- Test: `tests/graph.test.ts`

**Interfaces:**
- Consumes: `severity` (Task 3), `Issue`.
- Produces: `wouldCycle(issues, fromId, toId): boolean`, `actionOrder(issues, weights): Issue[]`, `minions(issues, bossId): Issue[]`, `roots(issues): Issue[]`, `draftIssues(project, draftId): Issue[]`.

- [ ] **Step 1: Write the V3 fixture**

`tests/fixtures/v3.ts` — the writer's real graph, the reference Dataview ordering was verified against it:
```ts
import { emptyIssue, Issue, NeedsAction } from "../../src/domain/types";
const mk = (id: string, title: string, tags: string[], isRoot: boolean, causedBy: string[], needsAction: NeedsAction): Issue =>
  ({ ...emptyIssue("d2", title), id, description: "x", tags, isRoot, causedBy, needsAction, canBeAddressed: "y" });
export const V3: Issue[] = [
  mk("1", "Too many ideas lessening the intensity of one idea", ["Structure","Theme"], true, [], "yes"),
  mk("2", "Lack of Focused setup", ["Structure"], true, [], "yes"),
  mk("3", "What are we laughing at in this film", ["Theme"], true, [], "yes"),
  mk("4", "The ghosts problem", ["Theme","Character","Logic"], true, [], "yes"),
  mk("5", "Perspective and who is this story about", ["Structure","Theme"], false, ["2"], "yes"),
  mk("6", "The anto problem", ["Character","Structure"], false, ["2","5"], "yes"),
  mk("7", "Anto was searching is not clear", ["Character","Arc","Structure"], false, ["2","1"], "yes"),
  mk("8", "Too many characters", ["Character","Arc"], false, ["1","5"], "no"),
  mk("9", "Bobbing heads", ["Tone"], false, ["3"], "yes"),
  mk("10", "The villain problem", ["Character","Tone"], false, ["3"], "yes"),
  mk("11", "Should shaji be mythified", ["Character","Theme"], false, ["4"], "yes"),
  mk("12", "Main conflict only comes in by the 50th page", ["Structure"], false, ["9"], "no"),
  mk("13", "Risk in simon being seen with shaji", ["Logic"], true, [], "no"),
];
```

- [ ] **Step 2: Write the failing test**

`tests/graph.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { wouldCycle, actionOrder, minions, roots } from "../src/domain/graph";
import { DEFAULT_TAG_WEIGHTS } from "../src/domain/types";
import { V3 } from "./fixtures/v3";

describe("wouldCycle", () => {
  it("refuses a direct loop", () => { expect(wouldCycle(V3, "2", "5")).toBe(true); });   // 5 is caused by 2; 2 caused by 5 would loop
  it("refuses an indirect loop", () => { expect(wouldCycle(V3, "2", "6")).toBe(true); }); // 6 ← 5 ← 2
  it("allows a fresh edge", () => { expect(wouldCycle(V3, "13", "4")).toBe(false); });
  it("refuses self", () => { expect(wouldCycle(V3, "1", "1")).toBe(true); });
});

describe("actionOrder", () => {
  const order = actionOrder(V3, DEFAULT_TAG_WEIGHTS).map(i => i.id);
  it("puts every root before any of its symptoms", () => {
    for (const i of V3) for (const c of i.causedBy) expect(order.indexOf(c)).toBeLessThan(order.indexOf(i.id));
  });
  it("among ready roots: needsAction first, then severity", () => {
    // roots 1(sev10,yes) 2(5,yes) 3(9,yes) 4(11,yes) 13(3,no) → 4,1,3,2 then 13 last of the roots
    expect(order.slice(0, 4)).toEqual(["4","1","3","2"]);
    expect(order.indexOf("13")).toBeGreaterThan(order.indexOf("2"));
  });
  it("emits every issue exactly once", () => { expect([...new Set(order)].length).toBe(V3.length); });
});

describe("minions / roots", () => {
  it("lists direct symptoms", () => { expect(minions(V3, "3").map(i => i.id)).toEqual(["9","10"]); });
  it("lists explicit roots only", () => { expect(roots(V3).map(i => i.id)).toEqual(["1","2","3","4","13"]); });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test tests/graph.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement**

`src/domain/graph.ts`:
```ts
import { Issue, Project } from "./types";
import { severity } from "./issue";

export const draftIssues = (p: Project, draftId: string): Issue[] => p.issues.filter(i => i.draftId === draftId);
export const roots = (issues: Issue[]): Issue[] => issues.filter(i => i.isRoot);
export const minions = (issues: Issue[], bossId: string): Issue[] => issues.filter(i => i.causedBy.includes(bossId));

/** Would adding `fromId causedBy toId` close a cycle? True if toId already reaches fromId via causedBy. */
export function wouldCycle(issues: Issue[], fromId: string, toId: string): boolean {
  if (fromId === toId) return true;
  const byId = new Map(issues.map(i => [i.id, i]));
  const seen = new Set<string>(); const stack = [toId];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur === fromId) return true;
    if (seen.has(cur)) continue; seen.add(cur);
    for (const c of byId.get(cur)?.causedBy ?? []) stack.push(c);
  }
  return false;
}

/** Topological by causedBy (roots first); ready items sorted needsAction=yes first, fewer causes, higher severity. Ported from the campaign prototype / Dataview. */
export function actionOrder(issues: Issue[], weights: Record<string, number>): Issue[] {
  const ids = new Set(issues.map(i => i.id));
  const indeg = new Map(issues.map(i => [i.id, i.causedBy.filter(c => ids.has(c)).length]));
  const cmp = (a: Issue, b: Issue) =>
    Number(b.needsAction === "yes") - Number(a.needsAction === "yes") ||
    a.causedBy.length - b.causedBy.length ||
    severity(b, weights) - severity(a, weights) ||
    a.createdAt.localeCompare(b.createdAt);
  const out: Issue[] = []; let ready = issues.filter(i => indeg.get(i.id) === 0);
  while (ready.length) {
    ready.sort(cmp); const n = ready.shift()!; out.push(n);
    for (const x of issues) if (x.causedBy.includes(n.id)) { indeg.set(x.id, indeg.get(x.id)! - 1); if (indeg.get(x.id) === 0) ready.push(x); }
  }
  // Defensive: cycles are refused at entry, but never drop data if one sneaks in via restore.
  for (const i of issues) if (!out.includes(i)) out.push(i);
  return out;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test tests/graph.test.ts`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/domain/graph.ts tests/graph.test.ts tests/fixtures/v3.ts
git commit -m "feat(domain): cause graph, cycle check, action order"
```

---

### Task 5: Cascade

**Files:**
- Create: `src/domain/cascade.ts`
- Test: `tests/cascade.test.ts`

**Interfaces:**
- Consumes: `minions` (Task 4), `status` (Task 3).
- Produces: `cascadeQueue(issues, bossId): Issue[]`, `answerCascade(issues, bossId, minionId, answer): void` (mutates the minion), `bossCleared(issues, boss): boolean`.

- [ ] **Step 1: Write the failing test**

`tests/cascade.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { cascadeQueue, answerCascade, bossCleared } from "../src/domain/cascade";
import { status } from "../src/domain/issue";
import { V3 } from "./fixtures/v3";

const clone = () => V3.map(i => ({ ...i, causedBy: [...i.causedBy], cascadeAnswers: {} as Record<string, "full"|"partial"|"no"> }));

describe("cascade", () => {
  it("queues unanswered minions of a boss", () => {
    const iss = clone(); expect(cascadeQueue(iss, "3").map(i => i.id)).toEqual(["9","10"]);
  });
  it("full: fills 'Covered by' and plans the minion", () => {
    const iss = clone(); const boss = iss.find(i => i.id === "3")!; boss.solution = "We laugh at identity.";
    answerCascade(iss, "3", "9", "full");
    const m = iss.find(i => i.id === "9")!;
    expect(m.solution).toBe("Covered by “What are we laughing at in this film”");
    expect(m.coveredBy).toBe("3"); expect(status(m)).toBe("Planned");
    expect(cascadeQueue(iss, "3").map(i => i.id)).toEqual(["10"]);
  });
  it("partial: links but leaves unplanned; no: leaves untouched", () => {
    const iss = clone();
    answerCascade(iss, "3", "9", "partial"); answerCascade(iss, "3", "10", "no");
    expect(iss.find(i => i.id === "9")!.partialOf).toBe("3");
    expect(iss.find(i => i.id === "9")!.solution).toBe("");
    expect(iss.find(i => i.id === "10")!.cascadeAnswers["3"]).toBe("no");
  });
  it("boss is cleared only when planned and every minion answered", () => {
    const iss = clone(); const boss = iss.find(i => i.id === "3")!;
    expect(bossCleared(iss, boss)).toBe(false);
    boss.solution = "s"; expect(bossCleared(iss, boss)).toBe(false);
    answerCascade(iss, "3", "9", "no"); answerCascade(iss, "3", "10", "full");
    expect(bossCleared(iss, boss)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/cascade.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/domain/cascade.ts`:
```ts
import { CascadeAnswer, Issue } from "./types";
import { minions } from "./graph";
import { status } from "./issue";

export const cascadeQueue = (issues: Issue[], bossId: string): Issue[] => minions(issues, bossId).filter(m => !m.cascadeAnswers[bossId]);

export function answerCascade(issues: Issue[], bossId: string, minionId: string, answer: CascadeAnswer): void {
  const boss = issues.find(i => i.id === bossId)!; const m = issues.find(i => i.id === minionId)!;
  m.cascadeAnswers[bossId] = answer;
  if (answer === "full") { m.solution = `Covered by “${boss.title}”`; m.coveredBy = bossId; m.partialOf = undefined; }
  if (answer === "partial") { m.partialOf = bossId; }
}

export const bossCleared = (issues: Issue[], boss: Issue): boolean =>
  status(boss) === "Planned" && minions(issues, boss.id).every(m => !!m.cascadeAnswers[boss.id]);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/cascade.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/domain/cascade.ts tests/cascade.test.ts
git commit -m "feat(domain): cascade prompt rules"
```

---

### Task 6: Affinity, meters, grade

**Files:**
- Create: `src/domain/affinity.ts`
- Test: `tests/affinity.test.ts`

**Interfaces:**
- Consumes: `status`, `roots`, `bossCleared`, `draftIssues`.
- Produces: `affinity(project, draftId, giverId): { rank: number; planned: number; total: number; interest: number; unaccounted: number }`, `meters(project, draftId)`, `grade(project, draftId): Grade`, `liveRank` semantics documented below.

Rules: `planned` = the giver's items in this draft whose every linked issue is Planned (items with no issues never count as planned). `computed = total===0 ? (lastRank ?? 1) : 1 + floor(3·planned/total)`, capped at 4; if any item unaccounted, capped at 3. `rank = max(lastRank ?? 0, computed)`; if lastRank is 0 (walked out) the giver climbs back from computed. `interest = total ? planned/total : 0`.

- [ ] **Step 1: Write the failing test**

`tests/affinity.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { affinity, meters, grade } from "../src/domain/affinity";
import { Project, emptyIssue, DEFAULT_TAG_WEIGHTS } from "../src/domain/types";

function proj(): Project {
  const planned = { ...emptyIssue("d1", "P"), id: "p", description: "x", tags: ["Theme"], isRoot: true, needsAction: "yes" as const, canBeAddressed: "y", solution: "s" };
  const open = { ...emptyIssue("d1", "O"), id: "o", description: "x", tags: ["Scene"], isRoot: true, needsAction: "yes" as const, canBeAddressed: "y" };
  return { id: "pr", name: "t", isSample: false, createdAt: "", tagWeights: DEFAULT_TAG_WEIGHTS, lastRank: {},
    givers: [{ id: "g", name: "Rohan" }], drafts: [{ id: "d1", number: 1, frozen: false, createdAt: "", dismissedN4: [] }], sessions: [],
    items: [
      { id: "i1", sessionId: "s", draftId: "d1", giverId: "g", kind: "reaction", text: "a", issueIds: ["p"] },
      { id: "i2", sessionId: "s", draftId: "d1", giverId: "g", kind: "reaction", text: "b", issueIds: ["o"] },
      { id: "i3", sessionId: "s", draftId: "d1", giverId: "g", kind: "reaction", text: "c", issueIds: [] },
    ], issues: [planned, open], ideas: [] };
}

describe("affinity", () => {
  it("counts planned items and caps at Nodding while anything is unaccounted", () => {
    const a = affinity(proj(), "d1", "g");
    expect(a).toMatchObject({ planned: 1, total: 3, unaccounted: 1 }); expect(a.rank).toBe(2); // 1+floor(3*1/3)=2
  });
  it("reaches Loves it only when all planned and all accounted", () => {
    const p = proj(); p.items[2].issueIds = ["p"]; p.issues[1].solution = "s";
    expect(affinity(p, "d1", "g").rank).toBe(4);
  });
  it("never drops below lastRank during a draft; walked-out climbs back", () => {
    const p = proj(); p.lastRank.g = 3; expect(affinity(p, "d1", "g").rank).toBe(3);
    p.lastRank.g = 0; expect(affinity(p, "d1", "g").rank).toBe(2);
  });
  it("a giver with no items in this draft keeps lastRank, default Unconvinced", () => {
    const p = proj(); p.items = []; expect(affinity(p, "d1", "g").rank).toBe(1);
    p.lastRank.g = 4; expect(affinity(p, "d1", "g").rank).toBe(4);
  });
});

describe("meters & grade", () => {
  it("meters", () => {
    expect(meters(proj(), "d1")).toEqual({ accounted: 2, items: 3, assessed: 2, planned: 1, issues: 2, bossesCleared: 1, roots: 2 });
  });
  it("grade: S only when all planned & no skips; letter down for skips or walk-outs", () => {
    const p = proj(); expect(grade(p, "d1")).toBe("C");           // 50% planned
    p.issues[1].solution = "s"; expect(grade(p, "d1")).toBe("A");   // all planned but i3 unaccounted → Rohan walks out → S down to A
    p.items[2].issueIds = ["p"]; expect(grade(p, "d1")).toBe("S");
    p.issues[1].skips.push({ nudge: "N3", at: "" }); expect(grade(p, "d1")).toBe("A");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/affinity.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/domain/affinity.ts`:
```ts
import { Grade, Project } from "./types";
import { status } from "./issue";
import { draftIssues, roots } from "./graph";
import { bossCleared } from "./cascade";

export interface Affinity { rank: number; planned: number; total: number; interest: number; unaccounted: number }

export function affinity(p: Project, draftId: string, giverId: string): Affinity {
  const byId = new Map(p.issues.map(i => [i.id, i]));
  const items = p.items.filter(it => it.draftId === draftId && it.giverId === giverId);
  const total = items.length;
  const unaccounted = items.filter(it => it.issueIds.length === 0).length;
  const planned = items.filter(it => it.issueIds.length > 0 && it.issueIds.every(id => status(byId.get(id)!) === "Planned")).length;
  const last = p.lastRank[giverId];
  let computed = total === 0 ? (last ?? 1) : 1 + Math.floor(3 * planned / total);
  computed = Math.min(computed, unaccounted > 0 ? 3 : 4);
  const rank = Math.max(last ?? 0, computed);
  return { rank, planned, total, interest: total ? planned / total : 0, unaccounted };
}

export function meters(p: Project, draftId: string) {
  const items = p.items.filter(it => it.draftId === draftId);
  const issues = draftIssues(p, draftId);
  const st = issues.map(status);
  return {
    accounted: items.filter(it => it.issueIds.length > 0).length, items: items.length,
    assessed: st.filter(s => s === "Assessed" || s === "Planned").length,
    planned: st.filter(s => s === "Planned").length, issues: issues.length,
    bossesCleared: roots(issues).filter(b => bossCleared(issues, b)).length, roots: roots(issues).length,
  };
}

export const walkedOut = (p: Project, draftId: string): string[] =>
  p.givers.filter(g => affinity(p, draftId, g.id).unaccounted > 0).map(g => g.id);

export const skippedIssues = (p: Project, draftId: string) => draftIssues(p, draftId).filter(i => i.skips.length > 0);

export function grade(p: Project, draftId: string): Grade {
  const m = meters(p, draftId);
  const frac = m.issues === 0 ? 1 : m.planned / m.issues;
  const skips = skippedIssues(p, draftId).length;
  let g: Grade = frac === 1 && skips === 0 ? "S" : frac >= 0.9 ? "A" : frac >= 0.7 ? "B" : "C";
  if (skips > 0 || walkedOut(p, draftId).length > 0) g = ({ S: "A", A: "B", B: "C", C: "C" } as const)[g];
  return g;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/affinity.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/domain/affinity.ts tests/affinity.test.ts
git commit -m "feat(domain): affinity, meters, grade"
```

---

### Task 7: Nudges and skips

**Files:**
- Create: `src/domain/nudges.ts`
- Test: `tests/nudges.test.ts`

**Interfaces:**
- Consumes: `severity`, `minions`, `draftIssues`, `roots`.
- Produces: `pendingNudges(project, draftId, issue): NudgeId[]`, `skip(issue, nudge): void`, `reconcileSkips(issue, project, draftId): void`, `giverPatternNudges(project, draftId): { giverId: string; issueIds: string[] }[]`, `deeperCausePicker(project, draftId, forIssueId): Issue[]`.

Rules (nudge ticket): N2 pending when Captured+ ∧ ¬isRoot ∧ no causes ∧ no N2 skip. N3 pending when isRoot ∧ tags.length ∧ severity ≤ 3 ∧ no N3 skip. N6 pending when isRoot ∧ needsAction = no ∧ minions ≥ 1 ∧ no N6 skip. N4: a giver with ≥ 3 root issues extracted from their items in this draft, not in `draft.dismissedN4`. Skips are removed by `reconcileSkips` when the trigger condition no longer holds; a dismissed nudge whose condition still holds stays skipped.

- [ ] **Step 1: Write the failing test**

`tests/nudges.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { pendingNudges, skip, reconcileSkips, giverPatternNudges, deeperCausePicker } from "../src/domain/nudges";
import { Project, emptyIssue, DEFAULT_TAG_WEIGHTS } from "../src/domain/types";
import { V3 } from "./fixtures/v3";

const proj = (): Project => ({ id: "p", name: "t", isSample: false, createdAt: "", tagWeights: DEFAULT_TAG_WEIGHTS, lastRank: {},
  givers: [{ id: "g", name: "Rohan" }], drafts: [{ id: "d2", number: 2, frozen: false, createdAt: "", dismissedN4: [] }], sessions: [], items: [], ideas: [],
  issues: V3.map(i => ({ ...i, skips: [] })) });

describe("pendingNudges", () => {
  it("N2 when captured, not root, no causes", () => {
    const p = proj(); const i = { ...emptyIssue("d2", "x"), description: "d" };
    expect(pendingNudges(p, "d2", i)).toEqual(["N2"]);
    skip(i, "N2"); expect(pendingNudges(p, "d2", i)).toEqual([]);
    i.causedBy = ["2"]; reconcileSkips(i, p, "d2"); expect(i.skips).toEqual([]);
  });
  it("N3 for a shallow root", () => {
    const p = proj(); const i = { ...emptyIssue("d2", "x"), description: "d", isRoot: true, tags: ["Dialogue"] };
    expect(pendingNudges(p, "d2", i)).toEqual(["N3"]);
    i.tags = ["Structure"]; expect(pendingNudges(p, "d2", i)).toEqual([]);
  });
  it("N6 for a no-action root with symptoms", () => {
    const p = proj(); const boss = p.issues.find(i => i.id === "3")!; boss.needsAction = "no";
    expect(pendingNudges(p, "d2", boss)).toEqual(["N6"]);
    skip(boss, "N6"); boss.needsAction = "yes"; reconcileSkips(boss, p, "d2"); expect(boss.skips).toEqual([]);
  });
});

describe("giverPatternNudges", () => {
  it("fires at three roots from one giver, once", () => {
    const p = proj();
    p.items = ["1","2","3"].map(id => ({ id: "it" + id, sessionId: "s", draftId: "d2", giverId: "g", kind: "reaction" as const, text: "q", issueIds: [id] }));
    expect(giverPatternNudges(p, "d2")).toEqual([{ giverId: "g", issueIds: ["1","2","3"] }]);
    p.drafts[0].dismissedN4.push("g"); expect(giverPatternNudges(p, "d2")).toEqual([]);
  });
});

describe("deeperCausePicker", () => {
  it("lists other issues, roots first then severity, excluding self and anything that would cycle", () => {
    const p = proj(); const ids = deeperCausePicker(p, "d2", "5").map(i => i.id);
    expect(ids[0]).toBe("4"); expect(ids).not.toContain("5"); expect(ids).not.toContain("6"); // 6 is caused by 5
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/nudges.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/domain/nudges.ts`:
```ts
import { Issue, NudgeId, Project, now } from "./types";
import { severity, status } from "./issue";
import { draftIssues, minions, wouldCycle } from "./graph";

const conditions = (p: Project, draftId: string, i: Issue): Record<NudgeId, boolean> => {
  const issues = draftIssues(p, draftId);
  return {
    N2: status(i) !== "Raw" && !i.isRoot && i.causedBy.length === 0,
    N3: i.isRoot && i.tags.length > 0 && severity(i, p.tagWeights) <= 3,
    N6: i.isRoot && i.needsAction === "no" && minions(issues, i.id).length > 0,
  };
};

export function pendingNudges(p: Project, draftId: string, i: Issue): NudgeId[] {
  const c = conditions(p, draftId, i);
  return (["N2","N3","N6"] as NudgeId[]).filter(n => c[n] && !i.skips.some(s => s.nudge === n));
}

export function skip(i: Issue, nudge: NudgeId): void {
  if (!i.skips.some(s => s.nudge === nudge)) i.skips.push({ nudge, at: now() });
}

export function reconcileSkips(i: Issue, p: Project, draftId: string): void {
  const c = conditions(p, draftId, i);
  i.skips = i.skips.filter(s => c[s.nudge]);
}

export function giverPatternNudges(p: Project, draftId: string): { giverId: string; issueIds: string[] }[] {
  const draft = p.drafts.find(d => d.id === draftId)!;
  const byId = new Map(p.issues.map(i => [i.id, i]));
  return p.givers.filter(g => !draft.dismissedN4.includes(g.id)).map(g => {
    const ids = new Set<string>();
    for (const it of p.items.filter(it => it.draftId === draftId && it.giverId === g.id)) for (const id of it.issueIds) if (byId.get(id)?.isRoot) ids.add(id);
    return { giverId: g.id, issueIds: [...ids] };
  }).filter(x => x.issueIds.length >= 3);
}

export function deeperCausePicker(p: Project, draftId: string, forIssueId: string): Issue[] {
  const issues = draftIssues(p, draftId);
  return issues.filter(i => i.id !== forIssueId && !wouldCycle(issues, forIssueId, i.id))
    .sort((a, b) => Number(b.isRoot) - Number(a.isRoot) || severity(b, p.tagWeights) - severity(a, p.tagWeights));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/nudges.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/domain/nudges.ts tests/nudges.test.ts
git commit -m "feat(domain): nudge triggers and skip bookkeeping"
```

---

### Task 8: Revive — similar titles, inheritance, badges

**Files:**
- Create: `src/domain/revive.ts`
- Test: `tests/revive.test.ts`

**Interfaces:**
- Consumes: `Issue`, `Project`, `emptyIssue`, `status`.
- Produces: `similarTitles(project, draftId, title): Issue[]` (previous-draft matches, Jaccard ≥ 0.6), `reviveIssues(project, fromDraftId, toDraftId, ids): Issue[]` (creates and returns new issues), `badge(project, issue): "cameBack" | "stillBothers" | null`, `previousDraft(project, draftId): Draft | undefined`.

- [ ] **Step 1: Write the failing test**

`tests/revive.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { similarTitles, reviveIssues, badge, previousDraft } from "../src/domain/revive";
import { Project, DEFAULT_TAG_WEIGHTS } from "../src/domain/types";
import { V3 } from "./fixtures/v3";

const proj = (): Project => ({ id: "p", name: "t", isSample: false, createdAt: "", tagWeights: DEFAULT_TAG_WEIGHTS, lastRank: {}, givers: [], sessions: [], items: [], ideas: [],
  drafts: [{ id: "d2", number: 2, frozen: true, createdAt: "1", dismissedN4: [] }, { id: "d3", number: 3, frozen: false, createdAt: "2", dismissedN4: [] }],
  issues: V3.map(i => ({ ...i, causedBy: [...i.causedBy] })) });

describe("previousDraft", () => {
  it("is the draft before the given one", () => { expect(previousDraft(proj(), "d3")!.id).toBe("d2"); expect(previousDraft(proj(), "d2")).toBeUndefined(); });
});

describe("similarTitles", () => {
  it("matches previous-draft titles by token overlap", () => {
    expect(similarTitles(proj(), "d3", "the anto problem").map(i => i.id)).toEqual(["6"]);
    expect(similarTitles(proj(), "d3", "ghosts problem the").map(i => i.id)).toEqual(["4"]);
    expect(similarTitles(proj(), "d3", "completely unrelated")).toEqual([]);
  });
});

describe("reviveIssues", () => {
  it("copies text and tags, rewires causes only to revived siblings, pins the old plan, links ancestor", () => {
    const p = proj();
    const old6 = p.issues.find(i => i.id === "6")!; old6.solution = "Give Anto agency."; old6.needsAction = "yes";
    const old8 = p.issues.find(i => i.id === "8")!; old8.solution = "would prune"; old8.reasonNotActing = "depth is the point"; old8.whyDiverges = "w";
    const revived = reviveIssues(p, "d2", "d3", ["5","6","8"]);
    expect(revived.map(r => r.title)).toEqual(["Perspective and who is this story about","The anto problem","Too many characters"]);
    const r5 = revived[0], r6 = revived[1], r8 = revived[2];
    expect(r6.draftId).toBe("d3"); expect(r6.ancestorId).toBe("6"); expect(r6.solution).toBe("");
    expect(r6.causedBy).toEqual([r5.id]);          // "2" was not revived → dropped
    expect(r6.pinnedNote).toBe("Draft 2 plan: Give Anto agency.");
    expect(r8.pinnedNote).toBe("Draft 2 plan: would prune\nWhy not, then: depth is the point");
    expect(r5.isRoot).toBe(false); expect(r5.causedBy).toEqual([]);   // its cause "2" gone → needs re-deciding
    expect(p.issues.filter(i => i.draftId === "d3").length).toBe(3);
  });
  it("badges derive from the ancestor", () => {
    const p = proj();
    p.issues.find(i => i.id === "6")!.solution = "s";
    const [r6, r8] = reviveIssues(p, "d2", "d3", ["6","8"]);
    expect(badge(p, r6)).toBe("cameBack"); expect(badge(p, r8)).toBe("stillBothers");
    expect(badge(p, p.issues.find(i => i.id === "1")!)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/revive.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/domain/revive.ts`:
```ts
import { Draft, Issue, Project, emptyIssue } from "./types";
import { draftIssues } from "./graph";

export function previousDraft(p: Project, draftId: string): Draft | undefined {
  const sorted = [...p.drafts].sort((a, b) => a.number - b.number);
  const idx = sorted.findIndex(d => d.id === draftId);
  return idx > 0 ? sorted[idx - 1] : undefined;
}

const tokens = (s: string) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2));
const jaccard = (a: Set<string>, b: Set<string>) => { const inter = [...a].filter(x => b.has(x)).length; const uni = new Set([...a, ...b]).size; return uni ? inter / uni : 0; };

export function similarTitles(p: Project, draftId: string, title: string): Issue[] {
  const prev = previousDraft(p, draftId); if (!prev) return [];
  const t = tokens(title); if (!t.size) return [];
  return draftIssues(p, prev.id).filter(i => jaccard(t, tokens(i.title)) >= 0.6);
}

export function reviveIssues(p: Project, fromDraftId: string, toDraftId: string, ids: string[]): Issue[] {
  const from = p.drafts.find(d => d.id === fromDraftId)!;
  const olds = ids.map(id => p.issues.find(i => i.id === id && i.draftId === fromDraftId)!).filter(Boolean);
  const map = new Map<string, Issue>();
  for (const o of olds) {
    const n = emptyIssue(toDraftId, o.title);
    n.description = o.description; n.thoughts = o.thoughts; n.references = o.references.map(r => ({ ...r })); n.tags = [...o.tags];
    n.ancestorId = o.id;
    let note = o.solution ? `Draft ${from.number} plan: ${o.solution}` : "";
    if (o.needsAction === "no" && o.reasonNotActing) note += `${note ? "\n" : ""}Why not, then: ${o.reasonNotActing}`;
    n.pinnedNote = note || undefined;
    map.set(o.id, n);
  }
  for (const o of olds) {
    const n = map.get(o.id)!;
    n.causedBy = o.causedBy.filter(c => map.has(c)).map(c => map.get(c)!.id);
    n.isRoot = o.isRoot;
  }
  const out = olds.map(o => map.get(o.id)!);
  p.issues.push(...out);
  return out;
}

export function badge(p: Project, i: Issue): "cameBack" | "stillBothers" | null {
  if (!i.ancestorId) return null;
  const a = p.issues.find(x => x.id === i.ancestorId); if (!a) return null;
  if (a.needsAction === "no") return "stillBothers";
  if (a.solution.trim()) return "cameBack";
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/revive.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/domain/revive.ts tests/revive.test.ts
git commit -m "feat(domain): revive, similar titles, badges"
```

---

### Task 9: Exports — Action Plan, Obsidian files, backup

**Files:**
- Create: `src/domain/exports.ts`
- Test: `tests/exports.test.ts`

**Interfaces:**
- Consumes: `actionOrder`, `roots`, `minions`, `status`, `severity`, `meters`, `grade`, `Account`.
- Produces: `actionPlanMarkdown(project, draftId): string`, `obsidianFiles(project): { path: string; content: string }[]`, `serializeBackup(account): string`, `parseBackup(text): Account` (throws on bad schema), `backupCounts(account): { projects: number; issues: number; items: number }`, `actionPlanFilename(project, draft)`, `backupFilename(date)`.

- [ ] **Step 1: Write the failing test**

`tests/exports.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { actionPlanMarkdown, obsidianFiles, serializeBackup, parseBackup, backupCounts, actionPlanFilename, backupFilename } from "../src/domain/exports";
import { Project, DEFAULT_TAG_WEIGHTS, emptyAccount } from "../src/domain/types";
import { answerCascade } from "../src/domain/cascade";
import { V3 } from "./fixtures/v3";

function proj(): Project {
  const p: Project = { id: "p", name: "Shaji", isSample: false, createdAt: "", tagWeights: DEFAULT_TAG_WEIGHTS, lastRank: {},
    givers: [{ id: "g1", name: "Rohan" }, { id: "g2", name: "Akhil" }],
    drafts: [{ id: "d2", number: 2, frozen: false, createdAt: "", dismissedN4: [] }], sessions: [], ideas: [{ id: "i", text: "Bring Alan back", issueIds: ["2"] }],
    items: [
      { id: "it1", sessionId: "s", draftId: "d2", giverId: "g1", kind: "reaction", text: "Everyone is a protagonist", issueIds: ["5"] },
      { id: "it2", sessionId: "s", draftId: "d2", giverId: "g2", kind: "reaction", text: "Tone shift abrupt", issueIds: ["9"] },
    ],
    issues: V3.map(i => ({ ...i, causedBy: [...i.causedBy], cascadeAnswers: {} })) };
  const b3 = p.issues.find(i => i.id === "3")!; b3.solution = "We laugh at identity.";
  answerCascade(p.issues, "3", "9", "full");
  const i13 = p.issues.find(i => i.id === "13")!; i13.solution = "Add exposition about the election."; i13.reasonNotActing = "It's explained enough."; i13.whyDiverges = "Slows the open.";
  return p;
}

describe("actionPlanMarkdown", () => {
  const md = actionPlanMarkdown(proj(), "d2");
  it("has a header with grade and meters", () => { expect(md).toMatch(/^# Shaji — Draft 2 action plan\n/); expect(md).toMatch(/grade [SABC] · planned \d+\/\d+ · bosses \d+\/\d+/); });
  it("renders bosses as ## with nested ### minions, quotes, and Covered by", () => {
    expect(md).toContain("## What are we laughing at in this film");
    expect(md).toContain("### Bobbing heads\nraised by Akhil: “Tone shift abrupt”\nCovered by What are we laughing at in this film");
    expect(md).toContain("### Perspective and who is this story about\nraised by Rohan: “Everyone is a protagonist”");
  });
  it("has Left alone and Unplanned sections", () => {
    expect(md).toContain("## Left alone, on purpose\n\n### Risk in simon being seen with shaji\nWould have: Add exposition about the election.\nWhy not: It's explained enough.");
    expect(md).toContain("## Unplanned\n"); expect(md).toContain("- Lack of Focused setup — solution");
  });
  it("filenames", () => {
    expect(actionPlanFilename(proj(), proj().drafts[0])).toBe("shaji-draft2-action-plan.md");
    expect(backupFilename(new Date("2026-08-28T10:00:00Z"))).toBe("gagan-achari-backup-2026-08-28.json");
  });
});

describe("obsidianFiles", () => {
  it("one file per issue with V3 frontmatter, plus Ideas.md", () => {
    const files = obsidianFiles(proj());
    const f = files.find(f => f.path === "Draft 2/Bobbing heads.md")!;
    expect(f.content).toContain('Speaker: Akhil\nQuote: "Tone shift abrupt"\nissueTag:\n  - "#ScreenplayIssue/Tone"');
    expect(f.content).toContain('Caused by:\n  - "[[What are we laughing at in this film]]"');
    expect(f.content).toContain("Needsaction: true\nStatus: Planned");
    expect(files.find(f => f.path === "Ideas.md")!.content).toContain("- Bring Alan back → [[Lack of Focused setup]]");
  });
});

describe("backup", () => {
  it("round-trips and counts", () => {
    const acc = emptyAccount(); acc.projects.push(proj());
    const text = serializeBackup(acc); const back = parseBackup(text);
    expect(back).toEqual(acc); expect(backupCounts(acc)).toEqual({ projects: 1, issues: 13, items: 2 });
    expect(() => parseBackup('{"schemaVersion":99}')).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/exports.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/domain/exports.ts`:
```ts
import { Account, Draft, Issue, Project } from "./types";
import { actionOrder, draftIssues, minions, roots } from "./graph";
import { missing, status } from "./issue";
import { grade, meters } from "./affinity";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const actionPlanFilename = (p: Project, d: Draft) => `${slug(p.name)}-draft${d.number}-action-plan.md`;
export const backupFilename = (date: Date) => `gagan-achari-backup-${date.toISOString().slice(0, 10)}.json`;

function raisedBy(p: Project, i: Issue): string {
  const quotes = p.items.filter(it => it.issueIds.includes(i.id)).map(it => `${p.givers.find(g => g.id === it.giverId)?.name ?? "?"}: “${it.text}”`);
  return quotes.length ? `raised by ${quotes.join(" · ")}\n` : "";
}

export function actionPlanMarkdown(p: Project, draftId: string): string {
  const d = p.drafts.find(x => x.id === draftId)!; const issues = draftIssues(p, draftId);
  const order = actionOrder(issues, p.tagWeights); const m = meters(p, draftId);
  const out: string[] = [`# ${p.name} — Draft ${d.number} action plan`, `${new Date().toISOString().slice(0, 10)} · grade ${grade(p, draftId)} · planned ${m.planned}/${m.issues} · bosses ${m.bossesCleared}/${m.roots}`, ""];
  const done = new Set<string>();
  const body = (i: Issue) => i.coveredBy ? `Covered by ${issues.find(x => x.id === i.coveredBy)!.title}` : i.solution;
  const actionable = (i: Issue) => i.needsAction !== "no" && status(i) === "Planned";
  for (const i of order) {
    if (done.has(i.id) || !actionable(i)) continue;
    if (i.isRoot) {
      out.push(`## ${i.title}`, raisedBy(p, i) + i.solution, "");
      for (const mn of order.filter(x => x.causedBy.includes(i.id))) { if (done.has(mn.id) || !actionable(mn)) continue; out.push(`### ${mn.title}`, raisedBy(p, mn) + body(mn), ""); done.add(mn.id); }
    } else out.push(`### ${i.title}`, raisedBy(p, i) + body(i), "");
    done.add(i.id);
  }
  const left = order.filter(i => i.needsAction === "no" && status(i) === "Planned");
  if (left.length) { out.push("## Left alone, on purpose", ""); for (const i of left) out.push(`### ${i.title}`, raisedBy(p, i) + `Would have: ${i.solution}\nWhy not: ${i.reasonNotActing}`, ""); }
  const un = order.filter(i => status(i) !== "Planned");
  if (un.length) { out.push("## Unplanned", ""); for (const i of un) out.push(`- ${i.title} — ${missing(i).join(", ")}`); out.push(""); }
  return out.join("\n");
}

export function obsidianFiles(p: Project): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  const byId = new Map(p.issues.map(i => [i.id, i]));
  for (const d of p.drafts) for (const i of draftIssues(p, d.id)) {
    const first = p.items.find(it => it.issueIds.includes(i.id));
    const fm = [
      "---",
      `Speaker: ${first ? p.givers.find(g => g.id === first.giverId)?.name ?? "" : ""}`,
      `Quote: ${first ? JSON.stringify(first.text) : ""}`,
      "issueTag:", ...i.tags.map(t => `  - "#ScreenplayIssue/${t}"`),
      "Caused by:", ...i.causedBy.map(c => `  - "[[${byId.get(c)?.title ?? c}]]"`),
      `Needsaction: ${i.needsAction === "no" ? "false" : "true"}`,
      `Status: ${status(i)}`,
      "---",
    ];
    const body = ["### Describe the issue", i.description, "", "### Thoughts", i.thoughts, "", "### Solution", i.solution, i.needsAction === "no" ? `\nReason not acting: ${i.reasonNotActing}` : ""];
    files.push({ path: `Draft ${d.number}/${i.title.replace(/[\\/:*?"<>|]/g, "-")}.md`, content: [...fm, ...body].join("\n") });
  }
  files.push({ path: "Ideas.md", content: p.ideas.map(id => `- ${id.text}${id.issueIds.length ? " → " + id.issueIds.map(x => `[[${byId.get(x)?.title ?? x}]]`).join(", ") : ""}${id.usedInDraft ? ` (used in Draft ${id.usedInDraft})` : ""}`).join("\n") });
  return files;
}

export const serializeBackup = (a: Account) => JSON.stringify({ schemaVersion: a.schemaVersion, exportedAt: new Date().toISOString(), account: a }, null, 2);
export function parseBackup(text: string): Account {
  const j = JSON.parse(text);
  if (j?.schemaVersion !== 1 || !j.account || !Array.isArray(j.account.projects)) throw new Error("Not a Gagan Achari backup (schema 1)");
  return j.account as Account;
}
export const backupCounts = (a: Account) => ({ projects: a.projects.length, issues: a.projects.reduce((n, p) => n + p.issues.length, 0), items: a.projects.reduce((n, p) => n + p.items.length, 0) });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/exports.test.ts`
Expected: all pass. If a quote/ordering assertion fails, fix the implementation, not the test — the test encodes the export ticket's layout.

- [ ] **Step 5: Commit**

```bash
git add src/domain/exports.ts tests/exports.test.ts
git commit -m "feat(domain): action plan, obsidian export, backup"
```

---

### Task 10: Account mutations (the command surface)

**Files:**
- Create: `src/domain/account.ts`
- Test: `tests/account.test.ts`

**Interfaces:**
- Consumes: everything above.
- Produces (all mutate in place and return the created thing where relevant):
  `createProject(acc, name)`, `deleteProject(acc, id)`, `startDraft(p)`, `addGiver(p, name)`, `createSession(p, draftId, date, giverIds)`, `addItem(p, sessionId, giverId, kind, text)`, `createIssue(p, draftId, title, fromItemId?)`, `linkItem(p, itemId, issueId)`, `unlinkItem(p, itemId, issueId)`, `setCausedBy(p, issueId, causeIds): { refused?: string }`, `setRoot(p, issueId)`, `createDeeperIssue(p, draftId, title, forIssueIds)`, `adoptSuggestion(p, issueId, itemId)`, `addIdea(p, text, issueId?)`, `useIdea(p, ideaId, issueId)`, `endTurn(p, draftId): EndTurnSummary`, `reopenDraft(p, draftId)`, `touch(p, issue)` (runs `reconcileSkips`).

- [ ] **Step 1: Write the failing test**

`tests/account.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import * as A from "../src/domain/account";
import { emptyAccount } from "../src/domain/types";
import { status } from "../src/domain/issue";

function setup() {
  const acc = emptyAccount(); const p = A.createProject(acc, "Shaji"); const d = A.startDraft(p);
  const g = A.addGiver(p, "Rohan"); const s = A.createSession(p, d.id, "2025-07-25", [g.id]);
  return { acc, p, d, g, s };
}

describe("capture", () => {
  it("adds items and extracts issues linked to them", () => {
    const { p, d, g, s } = setup();
    const it = A.addItem(p, s.id, g.id, "reaction", "Everyone is a protagonist");
    const iss = A.createIssue(p, d.id, "Perspective", it.id);
    expect(it.issueIds).toEqual([iss.id]); expect(iss.draftId).toBe(d.id);
    A.unlinkItem(p, it.id, iss.id); expect(it.issueIds).toEqual([]);
    A.linkItem(p, it.id, iss.id); A.linkItem(p, it.id, iss.id); expect(it.issueIds).toEqual([iss.id]);
  });
});

describe("causes", () => {
  it("refuses cycles and reports which issue to flip", () => {
    const { p, d } = setup();
    const a = A.createIssue(p, d.id, "A"), b = A.createIssue(p, d.id, "B");
    expect(A.setCausedBy(p, a.id, [b.id])).toEqual({});
    expect(A.setCausedBy(p, b.id, [a.id])).toEqual({ refused: a.id });
    expect(b.causedBy).toEqual([]);
    A.setRoot(p, b.id); expect(b.isRoot).toBe(true); expect(b.causedBy).toEqual([]);
    A.setCausedBy(p, b.id, []); // still root
    expect(b.isRoot).toBe(true);
  });
  it("createDeeperIssue links the given issues as its symptoms", () => {
    const { p, d } = setup();
    const a = A.createIssue(p, d.id, "A"), b = A.createIssue(p, d.id, "B");
    const deep = A.createDeeperIssue(p, d.id, "Deep", [a.id, b.id]);
    expect(a.causedBy).toEqual([deep.id]); expect(b.causedBy).toEqual([deep.id]); expect(status(deep)).toBe("Raw");
  });
});

describe("suggestions and ideas", () => {
  it("adopting a suggestion appends credited text; using an idea marks it", () => {
    const { p, d, g, s } = setup();
    const it = A.addItem(p, s.id, g.id, "suggestion", "Bring back the fools");
    const iss = A.createIssue(p, d.id, "Myth", it.id);
    A.adoptSuggestion(p, iss.id, it.id);
    expect(iss.solution).toBe("Bring back the fools — adopted from Rohan"); expect(iss.adoptedSuggestions).toEqual([{ itemId: it.id, giverId: g.id }]);
    const idea = A.addIdea(p, "Alan returns", iss.id); expect(idea.issueIds).toEqual([iss.id]); expect(iss.ideaIds).toEqual([idea.id]);
    A.useIdea(p, idea.id, iss.id); expect(idea.usedInDraft).toBe(1); expect(iss.solution).toContain("Alan returns");
  });
});

describe("end turn / reopen", () => {
  it("freezes, stores a summary, updates lastRank; reopen unfreezes and marks export stale", () => {
    const { p, d, g, s } = setup();
    const it = A.addItem(p, s.id, g.id, "reaction", "q");
    const iss = A.createIssue(p, d.id, "X", it.id);
    Object.assign(iss, { description: "d", tags: ["Theme"], isRoot: true, needsAction: "yes", canBeAddressed: "y", solution: "s" });
    const sum = A.endTurn(p, d.id);
    expect(d.frozen).toBe(true); expect(sum.grade).toBe("S"); expect(p.lastRank[g.id]).toBe(4); expect(sum.rankChanges).toEqual([{ giverId: g.id, from: 1, to: 4 }]);
    A.reopenDraft(p, d.id); expect(d.frozen).toBe(false); expect(d.exportStale).toBe(true);
  });
  it("walked-out givers get rank 0 at end turn", () => {
    const { p, d, g, s } = setup(); A.addItem(p, s.id, g.id, "reaction", "ignored");
    const sum = A.endTurn(p, d.id); expect(p.lastRank[g.id]).toBe(0); expect(sum.walkedOut).toEqual([g.id]);
  });
  it("startDraft numbers sequentially and refuses while one is unfrozen", () => {
    const { p, d } = setup(); expect(() => A.startDraft(p)).toThrow();
    A.endTurn(p, d.id); expect(A.startDraft(p).number).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/account.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/domain/account.ts`:
```ts
import { Account, Draft, EndTurnSummary, FeedbackItem, Giver, Idea, Issue, Kind, Project, Session, DEFAULT_TAG_WEIGHTS, emptyIssue, newId, now } from "./types";
import { draftIssues, wouldCycle } from "./graph";
import { affinity, grade, meters, skippedIssues, walkedOut } from "./affinity";
import { reconcileSkips } from "./nudges";
import { status } from "./issue";

const find = <T extends { id: string }>(xs: T[], id: string): T => { const x = xs.find(y => y.id === id); if (!x) throw new Error(`missing ${id}`); return x; };

export function createProject(acc: Account, name: string, isSample = false): Project {
  const p: Project = { id: newId(), name, isSample, createdAt: now(), tagWeights: { ...DEFAULT_TAG_WEIGHTS }, givers: [], drafts: [], sessions: [], items: [], issues: [], ideas: [], lastRank: {} };
  acc.projects.push(p); return p;
}
export function deleteProject(acc: Account, id: string): void { acc.projects = acc.projects.filter(p => p.id !== id); }

export function startDraft(p: Project): Draft {
  if (p.drafts.some(d => !d.frozen)) throw new Error("End the current turn first");
  const d: Draft = { id: newId(), number: p.drafts.length + 1, frozen: false, createdAt: now(), dismissedN4: [] };
  p.drafts.push(d); return d;
}
export function addGiver(p: Project, name: string): Giver { const g = { id: newId(), name: name.trim() }; p.givers.push(g); return g; }
export function createSession(p: Project, draftId: string, date: string, giverIds: string[]): Session { const s = { id: newId(), draftId, date, giverIds }; p.sessions.push(s); return s; }
export function addItem(p: Project, sessionId: string, giverId: string, kind: Kind, text: string): FeedbackItem {
  const s = find(p.sessions, sessionId);
  const it: FeedbackItem = { id: newId(), sessionId, draftId: s.draftId, giverId, kind, text: text.trim(), issueIds: [] }; p.items.push(it); return it;
}
export function createIssue(p: Project, draftId: string, title: string, fromItemId?: string): Issue {
  const i = emptyIssue(draftId, title.trim()); p.issues.push(i);
  if (fromItemId) linkItem(p, fromItemId, i.id);
  return i;
}
export function linkItem(p: Project, itemId: string, issueId: string): void { const it = find(p.items, itemId); if (!it.issueIds.includes(issueId)) it.issueIds.push(issueId); }
export function unlinkItem(p: Project, itemId: string, issueId: string): void { const it = find(p.items, itemId); it.issueIds = it.issueIds.filter(x => x !== issueId); }

export function setCausedBy(p: Project, issueId: string, causeIds: string[]): { refused?: string } {
  const i = find(p.issues, issueId); const issues = draftIssues(p, i.draftId);
  for (const c of causeIds) if (!i.causedBy.includes(c) && wouldCycle(issues, issueId, c)) return { refused: c };
  i.causedBy = [...new Set(causeIds)];
  if (i.causedBy.length) i.isRoot = false;
  touch(p, i); return {};
}
export function setRoot(p: Project, issueId: string): void { const i = find(p.issues, issueId); i.isRoot = true; i.causedBy = []; touch(p, i); }
export function createDeeperIssue(p: Project, draftId: string, title: string, forIssueIds: string[]): Issue {
  const deep = createIssue(p, draftId, title);
  for (const id of forIssueIds) { const i = find(p.issues, id); i.isRoot = false; if (!i.causedBy.includes(deep.id)) i.causedBy.push(deep.id); touch(p, i); }
  return deep;
}
export function touch(p: Project, i: Issue): void { reconcileSkips(i, p, i.draftId); }

const append = (s: string, add: string) => (s.trim() ? s.trimEnd() + "\n" : "") + add;
export function adoptSuggestion(p: Project, issueId: string, itemId: string): void {
  const i = find(p.issues, issueId), it = find(p.items, itemId); const g = find(p.givers, it.giverId);
  i.solution = append(i.solution, `${it.text} — adopted from ${g.name}`);
  if (!i.adoptedSuggestions.some(a => a.itemId === itemId)) i.adoptedSuggestions.push({ itemId, giverId: g.id });
}
export function addIdea(p: Project, text: string, issueId?: string): Idea {
  const idea: Idea = { id: newId(), text: text.trim(), issueIds: issueId ? [issueId] : [] }; p.ideas.push(idea);
  if (issueId) find(p.issues, issueId).ideaIds.push(idea.id);
  return idea;
}
export function useIdea(p: Project, ideaId: string, issueId: string): void {
  const idea = find(p.ideas, ideaId), i = find(p.issues, issueId); const d = find(p.drafts, i.draftId);
  i.solution = append(i.solution, idea.text); idea.usedInDraft = d.number;
  if (!idea.issueIds.includes(issueId)) idea.issueIds.push(issueId);
  if (!i.ideaIds.includes(ideaId)) i.ideaIds.push(ideaId);
}

export function endTurn(p: Project, draftId: string): EndTurnSummary {
  const d = find(p.drafts, draftId); const m = meters(p, draftId);
  const wo = walkedOut(p, draftId);
  const rankChanges: EndTurnSummary["rankChanges"] = [];
  for (const g of p.givers) {
    const from = p.lastRank[g.id] ?? 1;
    const to = wo.includes(g.id) ? 0 : Math.max(from, affinity(p, draftId, g.id).rank);
    if (to !== from || !(g.id in p.lastRank)) rankChanges.push({ giverId: g.id, from, to });
    p.lastRank[g.id] = to;
  }
  const summary: EndTurnSummary = { grade: grade(p, draftId), planned: m.planned, total: m.issues, bossesCleared: m.bossesCleared, roots: m.roots,
    skipped: skippedIssues(p, draftId).map(i => i.id), unplanned: draftIssues(p, draftId).filter(i => status(i) !== "Planned").map(i => i.id), walkedOut: wo, rankChanges, at: now() };
  d.frozen = true; d.summary = summary; d.exportStale = false; return summary;
}
export function reopenDraft(p: Project, draftId: string): void { const d = find(p.drafts, draftId); d.frozen = false; d.exportStale = true; }
```

Note on `grade` in `endTurn`: the grade is computed *before* `lastRank` is updated is fine — `grade` reads `walkedOut`, which reads unaccounted items, not `lastRank`. In the test, Rohan's rank change is `from: 1` because unseen givers default to 1 (Unconvinced).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/account.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/domain/account.ts tests/account.test.ts
git commit -m "feat(domain): account mutations, end turn, reopen"
```

---

### Task 11: Sample project — *Smoke Love Repeat*

**Files:**
- Create: `src/domain/sample.ts`
- Test: `tests/sample.test.ts`

**Interfaces:**
- Consumes: `account.ts` mutations.
- Produces: `installSample(acc): Project` — idempotent (no-op if a sample exists).

- [ ] **Step 1: Write the failing test**

`tests/sample.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { installSample } from "../src/domain/sample";
import { emptyAccount } from "../src/domain/types";
import { roots, minions, draftIssues } from "../src/domain/graph";
import { affinity } from "../src/domain/affinity";

describe("sample", () => {
  it("installs Smoke Love Repeat once, with 2 bosses, ≥5 minions, 3 givers at different ranks", () => {
    const acc = emptyAccount(); const p = installSample(acc); installSample(acc);
    expect(acc.projects.length).toBe(1); expect(p.name).toBe("Smoke Love Repeat"); expect(p.isSample).toBe(true);
    const d = p.drafts[0]; const issues = draftIssues(p, d.id);
    expect(roots(issues).length).toBe(2);
    expect(roots(issues).reduce((n, b) => n + minions(issues, b.id).length, 0)).toBeGreaterThanOrEqual(5);
    expect(p.givers.length).toBe(3);
    const ranks = p.givers.map(g => affinity(p, d.id, g.id).rank);
    expect(new Set(ranks).size).toBe(3);
    expect(p.items.some(i => i.kind === "suggestion")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/sample.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/domain/sample.ts` (silly on purpose; Akhil and Rithu die at the end):
```ts
import { Account, Project } from "./types";
import * as A from "./account";
import { answerCascade } from "./cascade";

export function installSample(acc: Account): Project {
  const existing = acc.projects.find(p => p.isSample); if (existing) return existing;
  const p = A.createProject(acc, "Smoke Love Repeat", true);
  const d = A.startDraft(p);
  const [dev, appu, meera] = ["Dev", "Appu", "Meera"].map(n => A.addGiver(p, n));
  const s = A.createSession(p, d.id, "2026-08-01", [dev.id, appu.id, meera.id]);

  // Bosses
  const bossTone = A.createIssue(p, d.id, "Nobody knows if the film is a comedy");
  Object.assign(bossTone, { description: "Akhil's lighter jokes sit next to Rithu's funeral. The script never picks a lane.", tags: ["Tone", "Theme"], isRoot: true, needsAction: "yes", canBeAddressed: "Yes — decide what we laugh at.", solution: "We laugh at how seriously Akhil takes smoking. Everything else is played straight." });
  const bossWant = A.createIssue(p, d.id, "Rithu doesn't want anything");
  Object.assign(bossWant, { description: "Rithu reacts to Akhil for 90 pages. She never chooses.", tags: ["Character", "Arc"], isRoot: true, needsAction: "yes", canBeAddressed: "Yes — give her one impossible want." });

  // Minions
  const m1 = A.createIssue(p, d.id, "The cigarette-as-metaphor scene lands as a gag");
  Object.assign(m1, { description: "Audience laughs when Akhil cries over the last cigarette; it's meant to be the turn.", tags: ["Scene"], causedBy: [bossTone.id], needsAction: "yes", canBeAddressed: "Yes." });
  const m2 = A.createIssue(p, d.id, "The funeral is too long");
  Object.assign(m2, { description: "Four pages of eulogy with no jokes and no reversal.", tags: ["Structure", "Scene"], causedBy: [bossTone.id], needsAction: "yes", canBeAddressed: "Cut two pages." });
  const m3 = A.createIssue(p, d.id, "Why does Rithu keep coming back to the balcony");
  Object.assign(m3, { description: "The balcony is where Akhil smokes; she has no stated reason to be there.", tags: ["Logic"], causedBy: [bossWant.id], needsAction: "yes", canBeAddressed: "Yes once she wants something there." });
  const m4 = A.createIssue(p, d.id, "The breakup feels unearned");
  Object.assign(m4, { description: "They split over a lighter. We haven't seen what the lighter means to her.", tags: ["Arc", "Logic/Emotional"], causedBy: [bossWant.id], needsAction: "yes", canBeAddressed: "Yes." });
  const m5 = A.createIssue(p, d.id, "The ending (they die) reads as a shrug");
  Object.assign(m5, { description: "Both die in the fire; nobody chose anything, so it's weather, not fate.", tags: ["Structure", "Theme"], causedBy: [bossWant.id, bossTone.id], needsAction: "yes", canBeAddressed: "Yes — make one of them light the match." });
  const m6 = A.createIssue(p, d.id, "Dialogue in the tea shop is generic");
  Object.assign(m6, { description: "Lines could be any two people in any tea shop.", tags: ["Dialogue"], causedBy: [bossTone.id], needsAction: "no", canBeAddressed: "Yes.", solution: "Give Akhil a smoking-specific idiom in every line.", reasonNotActing: "Comes free once tone is fixed.", whyDiverges: "Over-flavoured dialogue makes the film cute." });

  // Feedback items (reaction vs suggestion by example)
  const add = (g: { id: string }, kind: "reaction" | "suggestion", text: string, ...iss: { id: string }[]) => { const it = A.addItem(p, s.id, g.id, kind, text); for (const i of iss) A.linkItem(p, it.id, i.id); return it; };
  add(dev, "reaction", "I laughed at the wrong bits.", bossTone, m1);
  add(dev, "reaction", "The funeral is where I checked my phone.", m2);
  add(dev, "suggestion", "Make Akhil narrate his own funeral.", bossTone);
  add(appu, "reaction", "Rithu is just… there?", bossWant);
  add(appu, "reaction", "Why is she on the balcony again", m3);
  add(appu, "reaction", "They break up over a lighter??", m4);
  add(meera, "reaction", "The fire at the end felt like the writer gave up.", m5);
  add(meera, "suggestion", "One of them should start the fire.", m5);
  add(meera, "reaction", "Tea shop scene — any two people could say those lines.", m6);
  add(meera, "reaction", "I don't know what this film is.");   // deliberately unaccounted

  // Boss 1 planned + cascade partly answered → Dev is well along; Appu untouched; Meera capped by the unaccounted item.
  answerCascade(p.issues, bossTone.id, m1.id, "full");
  answerCascade(p.issues, bossTone.id, m2.id, "no");
  A.addIdea(p, "The lighter is Rithu's father's. Nobody has said so yet.", m4.id);
  acc.settings.tourDone = false;
  return p;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/sample.test.ts`
Expected: pass. If the "three different ranks" assertion fails, adjust which items are linked/planned until Dev, Appu, Meera land on three distinct ranks — do not weaken the test.

- [ ] **Step 5: Commit**

```bash
git add src/domain/sample.ts tests/sample.test.ts
git commit -m "feat(domain): Smoke Love Repeat sample project"
```

---

### Task 12: Storage adapter

**Files:**
- Create: `src/storage/db.ts`

**Interfaces:**
- Produces: `loadAccount(): Promise<Account>` (returns `emptyAccount()` if none), `saveAccount(acc): Promise<void>`, `requestPersistence(): Promise<boolean>`.
- Not tested (storage is outside the seam). Verified manually in Task 13.

- [ ] **Step 1: Implement**

`src/storage/db.ts`:
```ts
import { openDB } from "idb";
import { Account, emptyAccount } from "../domain/types";

const DB = "gagan-achari", STORE = "kv", KEY = "account";
const db = () => openDB(DB, 1, { upgrade(d) { d.createObjectStore(STORE); } });

export async function loadAccount(): Promise<Account> {
  const acc = await (await db()).get(STORE, KEY);
  return (acc as Account | undefined) ?? emptyAccount();
}
export async function saveAccount(acc: Account): Promise<void> {
  await (await db()).put(STORE, JSON.parse(JSON.stringify(acc)), KEY);
}
let persistAsked = false;
export async function requestPersistence(): Promise<boolean> {
  if (persistAsked || !navigator.storage?.persist) return false;
  persistAsked = true;
  try { return await navigator.storage.persist(); } catch { return false; }
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/storage/db.ts
git commit -m "feat(storage): IndexedDB account store"
```

---

## Part B — UI, onboarding, deploy

UI tasks are not unit-tested (outside the seam). Each ends with a manual check in `pnpm dev`. Layouts copy the two locked prototypes: `.scratch/feedback-tool/prototypes/capture-flow.html` (variant B) and `campaign-view.html` (variant B). Copy strings live only in `src/ui/copy.ts`.

### Task 13: Store, router, copy, styles, app shell, Projects screen

**Files:**
- Create: `src/ui/store.ts`, `src/ui/router.ts`, `src/ui/copy.ts`, `src/ui/styles.css`, `src/ui/App.tsx` (replace), `src/ui/screens/Projects.tsx`, `src/ui/Header.tsx`

**Interfaces:**
- Produces: `store.acc` (the live `Account`), `store.update(fn)` (mutate → save → re-render), `useStore()`, `route()` parsed from `location.hash`, `go(path)`, `COPY` object, `<Header/>`.

- [ ] **Step 1: Store**

`src/ui/store.ts`:
```ts
import { useEffect, useReducer } from "preact/hooks";
import { Account, emptyAccount } from "../domain/types";
import { loadAccount, saveAccount, requestPersistence } from "../storage/db";
import { installSample } from "../domain/sample";

let acc: Account = emptyAccount();
let ready = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export const store = {
  get acc() { return acc; },
  get ready() { return ready; },
  async init() { acc = await loadAccount(); if (!acc.projects.length) { installSample(acc); await saveAccount(acc); } ready = true; emit(); },
  update(fn: (a: Account) => void) { fn(acc); void saveAccount(acc); void requestPersistence(); emit(); },
  replace(next: Account) { acc = next; void saveAccount(acc); emit(); },
};
export function useStore(): Account {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => { listeners.add(force); return () => { listeners.delete(force); }; }, []);
  return acc;
}
```

- [ ] **Step 2: Router**

`src/ui/router.ts`:
```ts
import { useEffect, useReducer } from "preact/hooks";
export interface Route { name: string; pid?: string; did?: string; sid?: string }
export function route(): Route {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (!parts.length) return { name: "projects" };
  if (parts[0] === "how") return { name: "how" };
  if (parts[0] === "settings") return { name: "settings" };
  if (parts[0] === "p") {
    const pid = parts[1];
    if (parts[2] === "ideas") return { name: "ideas", pid };
    if (parts[2] === "d") {
      const did = parts[3];
      if (parts[4] === "s") return { name: "session", pid, did, sid: parts[5] };
      if (parts[4] === "campaign") return { name: "campaign", pid, did };
      if (parts[4] === "summary") return { name: "summary", pid, did };
      return { name: "draft", pid, did };
    }
    return { name: "project", pid };
  }
  return { name: "projects" };
}
export const go = (path: string) => { location.hash = "#" + path; };
export function useRoute(): Route {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => { addEventListener("hashchange", force); return () => removeEventListener("hashchange", force); }, []);
  return route();
}
```

- [ ] **Step 3: Copy**

`src/ui/copy.ts` — every user-facing string; the unserious voice lives here:
```ts
import { RANKS } from "../domain/types";
export const FACES = ["🚪","😤","👀","🙂","😍"] as const;
export const MOODS: Record<number, string[]> = {
  0: ["left. seat's still warm.", "gone. popcorn abandoned."],
  1: ["arms crossed.", "'this is the same film.'", "checking phone."],
  2: ["hm.", "leaning forward slightly.", "'okay… go on.'"],
  3: ["nodding. slowly.", "'oh that's nice.'", "stopped checking phone."],
  4: ["'I TOLD you it would work.'", "already casting it.", "crying (good)."],
};
export const mood = (rank: number, seed: number) => MOODS[rank][seed % MOODS[rank].length];
export const rankName = (r: number) => RANKS[r];
export const COPY = {
  app: "Gagan Achari",
  missing: { description: "What in the screenplay causes this? Write it.", tags: "Tag it.", cause: "Root or symptom? Decide.", needsAction: "Fixing it or not? Decide.", canBeAddressed: "Can it even be fixed? One line.", solution: "Unarmed. Write a plan.", reasonNotActing: "You're not fixing it. Say why.", whyDiverges: "Imagine you did fix it. What does the film lose?" } as Record<string, string>,
  placeholder: { descriptionFor: (g: string) => `What in the screenplay makes ${g} say this?`, descriptionFree: "What in the screenplay is the problem?", solution: "What will you change in the next draft?", wouldSolution: "What would you do if you did fix it?", whyDiverges: "Imagine you did fix it. What does the film lose?" },
  n2: { title: "Could this be a symptom of something deeper?", cause: "Yes — caused by", newDeeper: "+ new deeper issue…", root: "No — this is a root", later: "Decide later", laterNote: "(counts as a skipped nudge)" },
  n3: (tag: string) => `A ${tag} issue as a root cause? Sure nothing's underneath?`,
  n4: (name: string, n: number) => `${name} has ${n} separate root issues. Are they one problem?`,
  n6: (n: number) => `You're leaving a root cause alone; its ${n} symptom${n === 1 ? "" : "s"} will stay.`,
  encounter: { boss: "⚔️ BOSS FIGHT", minion: "👾 ENCOUNTER", minionsBehind: (n: number) => `${n} minion${n === 1 ? "" : "s"} behind it`, swing: "⚔️ Swing at the boss", handle: "Handle it", next: "Who's next? →", upNext: (t: string) => `Up next: ${t}`, nothingLeft: "Nothing left standing. End the turn.", endTurn: "🏁 End turn" },
  cascade: { title: "Does that swing also knock out this one?", no: "Nope, still standing", partial: "Winged it", full: "💥 Down — mark covered", progress: (a: number, n: number) => `Cascade · ${a} of ${n} answered` },
  bossDown: { tag: "💥 BOSS DOWN", fell: (names: string[]) => `Took these down with it: ${names.join(" · ")}`, none: "Minions survived. Rude. They stay in the order.", cont: "click to continue" },
  rankUp: { tag: "INTEREST RISING", line: (name: string, rank: string) => `${name} is now ${rank}` },
  inbox: { newIssue: "＋ New issue", newIssueFrom: (g: string) => `＋ New issue from what ${g} said`, newFree: "＋ Issue without feedback", link: "…or link an existing issue", unaccounted: "unaccounted", selectHint: "Or select an item on the left to extract an issue from it / link it to an existing one." },
  badges: { cameBack: "Came back", stillBothers: "Still bothers them" },
  summary: { title: (n: number) => `Draft ${n} — turn over`, backup: "Download backup", nextDraft: "Start next draft", reopen: "Reopen draft" },
  nag: "It's been a week since your last backup. Browser storage is not a vault.",
};
```

- [ ] **Step 4: Styles**

`src/ui/styles.css`: copy the `<style>` block from `campaign-view.html` (tokens, buttons, `.st`, `.lvl`, `.missing`, `.quote`, `.sugg`, `.idea`, `.card`, `.boss`, `.minion`, `.overlay`, `.modal`, `.cleared`, `.rankcard`, `.enc`, `.rail`, `.focus`, `.ctx`, `.audience`, `.aud`, `@keyframes bump`, `.gpanel`, `.rank`, `.hearts`, `.gitem`) and from `capture-flow.html` (`.inbox`, `.feed`, `.panel`, `.drawer`, `.n2`, `.pill`, `.issue-chip`, `.badge`). Remove `.state` and `.switcher` (prototype-only). Add:
```css
.toast { position:fixed; bottom:20px; right:20px; background:#111; color:#fff; padding:10px 14px; border-radius:8px; z-index:20; animation:fade 3s forwards; }
@keyframes fade { 0%,80%{opacity:1} 100%{opacity:0} }
.nag { background:#fbf1eb; border-bottom:1px solid #e8c9b8; padding:8px 24px; font-size:13px; display:flex; gap:12px; align-items:center; }
.pinned { background:#f3f1ec; border-left:3px solid #999; padding:6px 10px; font-size:13px; white-space:pre-wrap; margin:6px 0; }
.badge-rev { font-size:11px; border-radius:4px; padding:1px 6px; background:#3b2a5a; color:#fff; }
```

- [ ] **Step 5: Header, App, Projects**

`src/ui/Header.tsx`:
```tsx
import { COPY } from "./copy";
import { go } from "./router";
export function Header({ title, right }: { title?: string; right?: preact.ComponentChildren }) {
  return <header>
    <h1 style="cursor:pointer" onClick={() => go("/")}>{COPY.app}</h1>
    {title && <span class="mut">· {title}</span>}
    <span style="margin-left:auto;display:flex;gap:10px">
      {right}
      <button class="sm" onClick={() => go("/how")}>How this works</button>
      <button class="sm" onClick={() => go("/settings")}>Settings</button>
    </span>
  </header>;
}
```

`src/ui/screens/Projects.tsx`:
```tsx
import { useStore, store } from "../store";
import { go } from "../router";
import { Header } from "../Header";
import { createProject, deleteProject, startDraft } from "../../domain/account";
export function Projects() {
  const acc = useStore();
  const create = () => { const name = prompt("Screenplay name?"); if (!name?.trim()) return; store.update(a => { const p = createProject(a, name); startDraft(p); go(`/p/${p.id}`); }); };
  return <>
    <Header />
    <main>
      <div class="row" style="margin-bottom:14px"><h2 style="margin:0" class="grow">Projects</h2><button class="pri" onClick={create}>＋ New screenplay</button></div>
      {acc.projects.map(p => <div class="card" style="margin-bottom:10px">
        <div class="row"><b class="grow" style="cursor:pointer" onClick={() => go(`/p/${p.id}`)}>{p.name}{p.isSample && <span class="pill" style="margin-left:8px">sample</span>}</b>
          <span class="mut">{p.drafts.length} draft{p.drafts.length === 1 ? "" : "s"} · {p.issues.length} issues</span>
          <button class="sm" onClick={() => { if (confirm(`Delete “${p.name}”? No undo.`)) store.update(a => deleteProject(a, p.id)); }}>delete</button></div>
      </div>)}
    </main>
  </>;
}
```

`src/ui/App.tsx`:
```tsx
import { useEffect } from "preact/hooks";
import { store, useStore } from "./store";
import { useRoute, go } from "./router";
import { Projects } from "./screens/Projects";
export function App() {
  useStore(); const r = useRoute();
  useEffect(() => { void store.init(); }, []);
  if (!store.ready) return <main class="mut">Loading…</main>;
  if (r.name === "project") { const p = store.acc.projects.find(x => x.id === r.pid); const d = p?.drafts.find(x => !x.frozen) ?? p?.drafts.at(-1); if (p && d) go(`/p/${p.id}/d/${d.id}`); else go("/"); return null; }
  switch (r.name) {
    default: return <Projects />;
  }
}
```

- [ ] **Step 6: Manual check**

Run: `pnpm dev`, open the URL. Expected: header "Gagan Achari", Projects list shows *Smoke Love Repeat* (sample). Reload — it persists (IndexedDB). Create a project, delete it.

- [ ] **Step 7: Commit**

```bash
git add src/ui
git commit -m "feat(ui): store, router, copy, styles, shell, projects"
```

---

### Task 14: Draft home

**Files:**
- Create: `src/ui/screens/DraftHome.tsx`, `src/ui/Meters.tsx`
- Modify: `src/ui/App.tsx` (add route)

**Interfaces:**
- Consumes: `meters`, `createSession`, `addGiver`, `endTurn`, `reopenDraft`, `startDraft`.
- Produces: `<Meters project draftId/>` reused by campaign and summary.

- [ ] **Step 1: Meters**

`src/ui/Meters.tsx`:
```tsx
import { Project } from "../domain/types";
import { meters } from "../domain/affinity";
const Bar = ({ a, b }: { a: number; b: number }) => <span class="bar"><i style={`width:${b ? 100 * a / b : 0}%`}></i></span>;
export function Meters({ p, draftId }: { p: Project; draftId: string }) {
  const m = meters(p, draftId);
  return <div class="meters">
    <span>Accounted <b>{m.accounted}/{m.items}</b><Bar a={m.accounted} b={m.items} /></span>
    <span>Assessed <b>{m.assessed}/{m.issues}</b><Bar a={m.assessed} b={m.issues} /></span>
    <span>Planned <b>{m.planned}/{m.issues}</b><Bar a={m.planned} b={m.issues} /></span>
    <span>Bosses <b>{m.bossesCleared}/{m.roots}</b><Bar a={m.bossesCleared} b={m.roots} /></span>
  </div>;
}
```

- [ ] **Step 2: Draft home**

`src/ui/screens/DraftHome.tsx`:
```tsx
import { store, useStore } from "../store";
import { go } from "../router";
import { Header } from "../Header";
import { Meters } from "../Meters";
import { COPY } from "../copy";
import { addGiver, createSession, endTurn, reopenDraft, startDraft } from "../../domain/account";
export function DraftHome({ pid, did }: { pid: string; did: string }) {
  const acc = useStore(); const p = acc.projects.find(x => x.id === pid)!; const d = p.drafts.find(x => x.id === did)!;
  const sessions = p.sessions.filter(s => s.draftId === did);
  const newSession = () => {
    const date = prompt("Session date (YYYY-MM-DD)?", new Date().toISOString().slice(0, 10)); if (!date) return;
    store.update(() => { const s = createSession(p, did, date, p.givers.map(g => g.id)); go(`/p/${pid}/d/${did}/s/${s.id}`); });
  };
  return <>
    <Header title={`${p.name} · Draft ${d.number}${d.frozen ? " (frozen)" : ""}`} right={<Meters p={p} draftId={did} />} />
    <main>
      <div class="row" style="margin-bottom:12px;flex-wrap:wrap">
        <select onChange={e => go(`/p/${pid}/d/${(e.target as HTMLSelectElement).value}`)}>{p.drafts.map(x => <option value={x.id} selected={x.id === did}>Draft {x.number}{x.frozen ? " · frozen" : ""}</option>)}</select>
        <button onClick={() => go(`/p/${pid}/d/${did}/campaign`)}>⚔️ Campaign</button>
        <button onClick={() => go(`/p/${pid}/ideas`)}>💡 Ideas</button>
        <span class="grow" />
        {!d.frozen && <button class="pri" onClick={() => { store.update(() => endTurn(p, did)); go(`/p/${pid}/d/${did}/summary`); }}>{COPY.encounter.endTurn}</button>}
        {d.frozen && <button onClick={() => store.update(() => reopenDraft(p, did))}>{COPY.summary.reopen}</button>}
        {d.frozen && !p.drafts.some(x => !x.frozen) && <button class="pri" onClick={() => store.update(() => { const n = startDraft(p); go(`/p/${pid}/d/${n.id}`); })}>{COPY.summary.nextDraft}</button>}
      </div>
      <div class="card" style="margin-bottom:12px">
        <div class="row"><b class="grow">The room</b><button class="sm" onClick={() => { const n = prompt("Giver name?"); if (n?.trim()) store.update(() => addGiver(p, n)); }}>＋ giver</button></div>
        <div class="mut">{p.givers.map(g => g.name).join(", ") || "nobody yet"}</div>
      </div>
      <div class="card">
        <div class="row"><b class="grow">Feedback sessions</b>{!d.frozen && <button class="sm pri" onClick={newSession}>＋ session</button>}</div>
        {sessions.map(s => { const items = p.items.filter(i => i.sessionId === s.id); const un = items.filter(i => !i.issueIds.length).length;
          return <div class="minion" style="cursor:pointer" onClick={() => go(`/p/${pid}/d/${did}/s/${s.id}`)}><span class="grow">{s.date} · {items.length} items</span>{un > 0 && <span class="badge">{un} {COPY.inbox.unaccounted}</span>}</div>; })}
        {!sessions.length && <div class="mut" style="margin-top:6px">No sessions yet. Add one when the room has spoken.</div>}
      </div>
    </main>
  </>;
}
```

- [ ] **Step 3: Route it** — in `App.tsx` add `case "draft": return <DraftHome pid={r.pid!} did={r.did!} />;` with the import.

- [ ] **Step 4: Manual check** — open the sample project: meters show, sessions list shows the Aug 1 session with 1 unaccounted, End turn freezes, Reopen unfreezes, Start next draft appears only when frozen.

- [ ] **Step 5: Commit**

```bash
git add src/ui
git commit -m "feat(ui): draft home and meters"
```

---

### Task 15: Session — Inbox and extract drawer (N1, N2, N3)

**Files:**
- Create: `src/ui/screens/Session.tsx`, `src/ui/ExtractDrawer.tsx`
- Modify: `src/ui/App.tsx` (route)

**Interfaces:**
- Consumes: `addItem`, `createIssue`, `linkItem`, `unlinkItem`, `setCausedBy`, `setRoot`, `createDeeperIssue`, `skip`, `touch`, `deeperCausePicker`, `severity`, `status`, `similarTitles`, `reviveIssues`.
- Produces: `<ExtractDrawer p draftId item? onClose/>` reused nowhere else but kept separate for size.

- [ ] **Step 1: Extract drawer**

`src/ui/ExtractDrawer.tsx`:
```tsx
import { useState } from "preact/hooks";
import { FeedbackItem, Project, TAGS, SUBTAGS } from "../domain/types";
import { store } from "../store";
import { COPY } from "../copy";
import { createDeeperIssue, createIssue, setCausedBy, setRoot, touch } from "../../domain/account";
import { skip } from "../../domain/nudges";
import { deeperCausePicker } from "../../domain/nudges";
import { severity } from "../../domain/issue";
import { similarTitles, reviveIssues } from "../../domain/revive";

export function ExtractDrawer({ p, draftId, item, onClose }: { p: Project; draftId: string; item?: FeedbackItem; onClose: () => void }) {
  const giver = item ? p.givers.find(g => g.id === item.giverId)?.name ?? "them" : null;
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [tags, setTags] = useState<string[]>([]);
  const [n2, setN2] = useState<"" | "cause" | "root" | "later">(""); const [cause, setCause] = useState(""); const [newCause, setNewCause] = useState("");
  const [ancestor, setAncestor] = useState<string | null>(null);
  const similar = title.length > 3 ? similarTitles(p, draftId, title) : [];
  const picker = deeperCausePicker(p, draftId, "__new__");
  const toggle = (t: string) => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);
  const save = () => {
    if (!title.trim()) return alert("Title first.");
    if (n2 === "root" && tags.length && severity({ tags } as any, p.tagWeights) <= 3 && !confirm(COPY.n3(tags.join("/")) + "\n\nOK = keep as root · Cancel = go back")) return;
    store.update(() => {
      let iss;
      if (ancestor) { iss = reviveIssues(p, p.drafts.find(d => d.number === (p.drafts.find(x => x.id === draftId)!.number - 1))!.id, draftId, [ancestor])[0]; iss.title = title.trim(); if (item) item.issueIds.push(iss.id); }
      else iss = createIssue(p, draftId, title, item?.id);
      iss.description = desc; iss.tags = tags;
      if (n2 === "cause" && cause === "new" && newCause.trim()) { const deep = createDeeperIssue(p, draftId, newCause, [iss.id]); void deep; }
      else if (n2 === "cause" && cause) setCausedBy(p, iss.id, [cause]);
      else if (n2 === "root") setRoot(p, iss.id);
      else if (n2 === "later") skip(iss, "N2");
      touch(p, iss);
    });
    onClose();
  };
  return <div class="drawer">
    {item ? <div class="quote">{giver}: “{item.text}”</div> : <div class="mut" style="margin-bottom:8px">Issue with no feedback item — your own observation.</div>}
    <input placeholder="Issue title — the thing in the screenplay (e.g. “Anto has no agency”)" value={title} onInput={e => { setTitle((e.target as HTMLInputElement).value); setAncestor(null); }} />
    {similar.length > 0 && !ancestor && <div class="n2" style="margin-top:6px">Draft {p.drafts.find(x => x.id === draftId)!.number - 1} had: {similar.map(s => <button class="sm" onClick={() => { setAncestor(s.id); setTitle(s.title); setDesc(s.description); setTags(s.tags); }}>{s.title}</button>)} — same thing?</div>}
    {ancestor && <div class="pinned">Reviving from the previous draft.</div>}
    <textarea style="margin-top:8px" placeholder={giver ? COPY.placeholder.descriptionFor(giver) : COPY.placeholder.descriptionFree} value={desc}
      onInput={e => { const v = (e.target as HTMLTextAreaElement).value; setDesc(v); if (v.length > 20 && !n2) setN2("cause" as any); }} />
    <div class="row" style="margin-top:8px;flex-wrap:wrap">{[...TAGS, ...SUBTAGS].map(t => <label class="tag"><input type="checkbox" style="width:auto" checked={tags.includes(t)} onChange={() => toggle(t)} /> {t}</label>)}</div>
    {(n2 || desc.length > 20) && <div class="n2"><h4>{COPY.n2.title}</h4>
      <label><input type="radio" name="n2" checked={n2 === "cause"} onChange={() => setN2("cause")} /> {COPY.n2.cause}
        <select style="width:auto;display:inline-block;margin-left:6px" value={cause} onChange={e => { setCause((e.target as HTMLSelectElement).value); setN2("cause"); }}>
          <option value="">pick…</option>{picker.map(i => <option value={i.id}>{i.isRoot ? "★ " : ""}{i.title} ({severity(i, p.tagWeights)})</option>)}<option value="new">{COPY.n2.newDeeper}</option>
        </select></label>
      {cause === "new" && <input placeholder="Title of the deeper issue (created Raw, linked)" value={newCause} onInput={e => setNewCause((e.target as HTMLInputElement).value)} style="margin:4px 0 4px 22px;width:calc(100% - 22px)" />}
      <label><input type="radio" name="n2" checked={n2 === "root"} onChange={() => setN2("root")} /> {COPY.n2.root}</label>
      <label><input type="radio" name="n2" checked={n2 === "later"} onChange={() => setN2("later")} /> {COPY.n2.later} <span class="mut">{COPY.n2.laterNote}</span></label>
    </div>}
    <div class="row" style="margin-top:10px;justify-content:flex-end"><button onClick={onClose}>Cancel</button><button class="pri" onClick={save}>Save issue</button></div>
  </div>;
}
```

- [ ] **Step 2: Session screen**

`src/ui/screens/Session.tsx`:
```tsx
import { useState } from "preact/hooks";
import { store, useStore } from "../store";
import { go } from "../router";
import { Header } from "../Header";
import { Meters } from "../Meters";
import { COPY } from "../copy";
import { ExtractDrawer } from "../ExtractDrawer";
import { addItem, linkItem, unlinkItem } from "../../domain/account";
import { draftIssues } from "../../domain/graph";
import { severity, status } from "../../domain/issue";
export function Session({ pid, did, sid }: { pid: string; did: string; sid: string }) {
  const acc = useStore(); const p = acc.projects.find(x => x.id === pid)!; const d = p.drafts.find(x => x.id === did)!; const s = p.sessions.find(x => x.id === sid)!;
  const [sel, setSel] = useState<string | null>(null); const [drawer, setDrawer] = useState<null | "free" | string>(null);
  const items = p.items.filter(i => i.sessionId === sid).slice().reverse();
  const selItem = items.find(i => i.id === sel); const issues = draftIssues(p, did).slice().sort((a, b) => severity(b, p.tagWeights) - severity(a, p.tagWeights));
  const un = items.filter(i => !i.issueIds.length).length;
  let giverSel: HTMLSelectElement | null = null, kindSel: HTMLSelectElement | null = null;
  const add = (text: string) => { if (!text.trim() || d.frozen) return; store.update(() => { const it = addItem(p, sid, giverSel!.value, kindSel!.value as any, text); setSel(it.id); }); };
  const chip = (id: string, itemId: string) => { const i = issues.find(x => x.id === id)!; return <span class={`issue-chip ${i.isRoot ? "root" : ""}`}>{i.isRoot ? "★ " : ""}{i.title} <a href="#" onClick={e => { e.preventDefault(); store.update(() => unlinkItem(p, itemId, id)); }} style="color:#999;text-decoration:none">×</a></span>; };
  return <>
    <Header title={`${p.name} · Draft ${d.number} · ${s.date}`} right={<><button class="sm" onClick={() => go(`/p/${pid}/d/${did}`)}>← draft</button><Meters p={p} draftId={did} /></>} />
    <main><div class="inbox">
      <div class="feed">
        <div class="add"><div class="row"><select ref={e => giverSel = e} style="width:140px">{p.givers.map(g => <option value={g.id}>{g.name}</option>)}</select>
          <select ref={e => kindSel = e} style="width:120px"><option value="reaction">reaction</option><option value="suggestion">suggestion</option></select>
          {un > 0 && <span class="badge">{un} {COPY.inbox.unaccounted}</span>}</div>
          <input style="margin-top:6px" placeholder="What did they say? Enter to add" disabled={d.frozen} onKeyDown={e => { if (e.key === "Enter") { add((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ""; } }} /></div>
        {items.map(it => <div class={`item ${sel === it.id ? "sel" : ""} ${it.issueIds.length ? "" : "un"}`} onClick={() => { setSel(it.id); setDrawer(null); }}>
          <div class="row"><b>{p.givers.find(g => g.id === it.giverId)?.name}</b> <span class={`pill ${it.kind === "suggestion" ? "s" : ""}`}>{it.kind}</span>{!it.issueIds.length && <span class="tag" style="margin-left:auto;color:var(--warn)">{COPY.inbox.unaccounted}</span>}</div>
          <div>{it.text}</div><div class="row" style="margin-top:4px;flex-wrap:wrap">{it.issueIds.map(id => chip(id, it.id))}</div></div>)}
      </div>
      <div class="panel">
        <div class="row" style="margin-bottom:12px"><button class="pri" style="font-size:15px;padding:8px 14px" disabled={d.frozen} onClick={() => setDrawer(selItem ? selItem.id : "free")}>{selItem ? COPY.inbox.newIssueFrom(p.givers.find(g => g.id === selItem.giverId)?.name ?? "them") : COPY.inbox.newIssue}</button>
          {selItem && <button disabled={d.frozen} onClick={() => setDrawer("free")}>{COPY.inbox.newFree}</button>}</div>
        {drawer && <ExtractDrawer p={p} draftId={did} item={drawer === "free" ? undefined : selItem} onClose={() => setDrawer(null)} />}
        {!selItem && <p class="mut">{COPY.inbox.selectHint}</p>}
        {selItem && <><div class="quote">{p.givers.find(g => g.id === selItem.giverId)?.name}: “{selItem.text}”</div>
          <h3 style="margin:8px 0 4px;font-size:14px">{COPY.inbox.link}</h3>
          <div class="list">{issues.map(i => <label><input type="checkbox" style="width:auto" checked={selItem.issueIds.includes(i.id)} onChange={e => store.update(() => (e.target as HTMLInputElement).checked ? linkItem(p, selItem.id, i.id) : unlinkItem(p, selItem.id, i.id))} /> {i.isRoot ? "★ " : ""}{i.title} <span class="tag">{i.tags.join(", ")} · sev {severity(i, p.tagWeights)} · {status(i)}</span></label>)}</div></>}
      </div>
    </div></main>
  </>;
}
```

- [ ] **Step 3: Route it** — `case "session": return <Session pid={r.pid!} did={r.did!} sid={r.sid!} />;`

- [ ] **Step 4: Manual check** — in the sample session: add an item (auto-selects), click New issue, watch N2 appear after ~20 chars, pick a cause / new deeper / root (Dialogue root → N3 confirm) / later; link/unlink via checkbox; unaccounted badge updates. Refresh: everything persisted.

- [ ] **Step 5: Commit**

```bash
git add src/ui
git commit -m "feat(ui): inbox session and extract drawer with nudges"
```

---

### Task 16: Campaign — Encounter screen with audience strip

**Files:**
- Create: `src/ui/screens/Campaign.tsx`, `src/ui/Audience.tsx`, `src/ui/IssueEditor.tsx`
- Modify: `src/ui/App.tsx` (route)

**Interfaces:**
- Consumes: `actionOrder`, `minions`, `status`, `missing`, `severity`, `affinity`, `badge`, `pendingNudges`, `adoptSuggestion`, `useIdea`, `addIdea`, `setCausedBy`, `setRoot`, `touch`, `skip`.
- Produces: `<Audience p draftId onPick(giverId)/>`, `<IssueEditor p issue onSaved(kind)/>` where `kind` is `"boss" | "symptom"` (Task 17 hooks the cascade onto `"boss"`), `useLocalDraft` pattern below.

- [ ] **Step 1: Audience strip**

`src/ui/Audience.tsx`:
```tsx
import { useRef } from "preact/hooks";
import { Project } from "../domain/types";
import { affinity } from "../domain/affinity";
import { FACES, mood, rankName } from "./copy";
export function Audience({ p, draftId, onPick }: { p: Project; draftId: string; onPick: (giverId: string) => void }) {
  const last = useRef<Record<string, number>>({});
  return <div class="audience">{p.givers.map(g => {
    const a = affinity(p, draftId, g.id); const bumped = last.current[g.id] !== undefined && last.current[g.id] < a.rank; last.current[g.id] = a.rank;
    return <div class={`aud ${bumped ? "bump" : ""}`} onClick={() => onPick(g.id)}>
      <div class="row"><span class="face">{FACES[a.rank]}</span><div><div class="nm">{g.name}</div><div class="rk">{rankName(a.rank)} · {a.planned}/{a.total}</div></div></div>
      <span class="bar"><i style={`width:${Math.round(100 * a.interest)}%`}></i></span>
      <div class="say">{mood(a.rank, g.name.length + a.planned)}</div>
    </div>; })}</div>;
}
```

- [ ] **Step 2: Issue editor (solution, assessment, nudges N3/N6, suggestions, ideas)**

`src/ui/IssueEditor.tsx`:
```tsx
import { useState } from "preact/hooks";
import { Issue, Project, TAGS, SUBTAGS } from "../domain/types";
import { store } from "./store";
import { COPY } from "./copy";
import { missing, severity, status } from "../domain/issue";
import { badge } from "../domain/revive";
import { pendingNudges, skip, deeperCausePicker } from "../domain/nudges";
import { minions } from "../domain/graph";
import { adoptSuggestion, addIdea, setCausedBy, setRoot, touch, useIdea } from "../domain/account";

export function IssueEditor({ p, issue, onSaved }: { p: Project; issue: Issue; onSaved: (kind: "boss" | "symptom") => void }) {
  const [draft, setDraft] = useState(issue.solution);
  const issues = p.issues.filter(i => i.draftId === issue.draftId);
  const st = status(issue); const miss = missing(issue); const b = badge(p, issue); const nudges = pendingNudges(p, issue.draftId, issue);
  const set = (fn: (i: Issue) => void) => store.update(() => { fn(issue); touch(p, issue); });
  const suggestions = p.items.filter(it => it.kind === "suggestion" && it.issueIds.includes(issue.id));
  const ideas = p.ideas.filter(i => i.issueIds.includes(issue.id));
  const save = () => { if (!draft.trim()) return; set(i => { i.solution = draft.trim(); }); onSaved(issue.isRoot ? "boss" : "symptom"); };
  return <div>
    <div class="row" style="margin-bottom:6px;flex-wrap:wrap"><span class={`st ${st}`}>{st}</span><span class="lvl">Lv {severity(issue, p.tagWeights)}</span>
      {b && <span class="badge-rev">{COPY.badges[b]}</span>}
      {issue.partialOf && <span class="tag">· winged by “{issues.find(x => x.id === issue.partialOf)?.title}”</span>}</div>
    {issue.pinnedNote && <div class="pinned">{issue.pinnedNote}</div>}
    <textarea placeholder={COPY.placeholder.descriptionFor("them")} value={issue.description} onInput={e => set(i => { i.description = (e.target as HTMLTextAreaElement).value; })} style="min-height:60px" />
    <div class="row" style="margin:6px 0;flex-wrap:wrap">{[...TAGS, ...SUBTAGS].map(t => <label class="tag"><input type="checkbox" style="width:auto" checked={issue.tags.includes(t)} onChange={() => set(i => { i.tags = i.tags.includes(t) ? i.tags.filter(x => x !== t) : [...i.tags, t]; })} /> {t}</label>)}</div>
    <div class="row" style="flex-wrap:wrap;gap:12px">
      <label class="tag"><input type="radio" style="width:auto" checked={issue.isRoot} onChange={() => set(i => { setRoot(p, i.id); })} /> root</label>
      <label class="tag">symptom of <select style="width:auto" onChange={e => { const v = (e.target as HTMLSelectElement).value; if (!v) return; store.update(() => { const r = setCausedBy(p, issue.id, [...issue.causedBy, v]); if (r.refused) { const other = issues.find(x => x.id === r.refused)!; if (confirm(`“${other.title}” is already caused by this one. Flip it — make “${issue.title}” the cause?`)) { setCausedBy(p, other.id, other.causedBy.filter(c => c !== issue.id)); setCausedBy(p, issue.id, [...issue.causedBy, v]); } } }); }}>
        <option value="">add…</option>{deeperCausePicker(p, issue.draftId, issue.id).map(c => <option value={c.id}>{c.isRoot ? "★ " : ""}{c.title}</option>)}</select></label>
      {issue.causedBy.map(c => <span class="issue-chip">{issues.find(x => x.id === c)?.title} <a href="#" onClick={e => { e.preventDefault(); set(i => { setCausedBy(p, i.id, i.causedBy.filter(x => x !== c)); }); }}>×</a></span>)}
      <label class="tag">needs action <select style="width:auto" value={issue.needsAction} onChange={e => set(i => { i.needsAction = (e.target as HTMLSelectElement).value as any; })}><option value="undecided">undecided</option><option value="yes">yes</option><option value="no">no</option></select></label>
    </div>
    <input style="margin-top:6px" placeholder="Can it be addressed? One line." value={issue.canBeAddressed} onInput={e => set(i => { i.canBeAddressed = (e.target as HTMLInputElement).value; })} />
    {nudges.includes("N3") && <div class="n2"><b>{COPY.n3(issue.tags.join("/"))}</b> <button class="sm" onClick={() => set(i => skip(i, "N3"))}>keep as root</button></div>}
    {nudges.includes("N6") && <div class="n2"><b>{COPY.n6(minions(issues, issue.id).length)}</b> <button class="sm" onClick={() => set(i => skip(i, "N6"))}>leave it</button></div>}
    <textarea style="margin-top:8px" placeholder={issue.needsAction === "no" ? COPY.placeholder.wouldSolution : COPY.placeholder.solution} value={draft} onInput={e => setDraft((e.target as HTMLTextAreaElement).value)} />
    {issue.needsAction === "no" && <>
      <input style="margin-top:6px" placeholder="Reason not acting" value={issue.reasonNotActing} onInput={e => set(i => { i.reasonNotActing = (e.target as HTMLInputElement).value; })} />
      <input style="margin-top:6px" placeholder={COPY.placeholder.whyDiverges} value={issue.whyDiverges} onInput={e => set(i => { i.whyDiverges = (e.target as HTMLInputElement).value; })} /></>}
    <div class="row" style="margin-top:8px"><span class="missing grow">{miss.map(m => COPY.missing[m]).join(" · ")}</span><button class="pri" onClick={save}>{issue.isRoot ? COPY.encounter.swing : COPY.encounter.handle}</button></div>
    <h4 style="margin:12px 0 6px;font-size:13px">Suggestions from the room</h4>
    {suggestions.length ? suggestions.map(s => <div class="sugg"><div class="row"><span><b>{p.givers.find(g => g.id === s.giverId)?.name}</b> · {s.text}</span><button class="sm" onClick={() => { store.update(() => adoptSuggestion(p, issue.id, s.id)); setDraft(issue.solution); }}>adopt</button></div></div>) : <div class="mut" style="font-size:13px">none</div>}
    <h4 style="margin:12px 0 6px;font-size:13px">Your ideas <button class="sm" onClick={() => { const t = prompt("Idea?"); if (t?.trim()) store.update(() => addIdea(p, t, issue.id)); }}>＋ idea</button></h4>
    {ideas.length ? ideas.map(i => <div class="idea" style={i.usedInDraft ? "opacity:.5" : ""}>{i.text} {!i.usedInDraft && <button class="sm" onClick={() => { store.update(() => useIdea(p, i.id, issue.id)); setDraft(issue.solution); }}>use</button>}{i.usedInDraft && <span class="tag">used in Draft {i.usedInDraft}</span>}</div>) : <div class="mut" style="font-size:13px">none linked</div>}
    <textarea style="margin-top:10px;min-height:50px" placeholder="Thoughts (never gated)" value={issue.thoughts} onInput={e => set(i => { i.thoughts = (e.target as HTMLTextAreaElement).value; })} />
  </div>;
}
```

- [ ] **Step 3: Campaign screen**

`src/ui/screens/Campaign.tsx`:
```tsx
import { useState } from "preact/hooks";
import { store, useStore } from "../store";
import { go } from "../router";
import { Header } from "../Header";
import { Meters } from "../Meters";
import { Audience } from "../Audience";
import { IssueEditor } from "../IssueEditor";
import { COPY } from "../copy";
import { actionOrder, draftIssues, minions } from "../../domain/graph";
import { status, severity } from "../../domain/issue";
import { createIssue, endTurn } from "../../domain/account";
export function Campaign({ pid, did }: { pid: string; did: string }) {
  const acc = useStore(); const p = acc.projects.find(x => x.id === pid)!; const d = p.drafts.find(x => x.id === did)!;
  const issues = draftIssues(p, did); const order = actionOrder(issues, p.tagWeights);
  const [sel, setSel] = useState<string | null>(order[0]?.id ?? null); const [giver, setGiver] = useState<string | null>(null);
  const i = order.find(x => x.id === sel) ?? order[0]; const idx = order.findIndex(x => x === i);
  const next = order.slice(idx + 1).find(x => status(x) !== "Planned") ?? order.find(x => status(x) !== "Planned");
  const onSaved = (kind: "boss" | "symptom") => { /* Task 17 replaces this with the cascade hook */ void kind; };
  if (!i) return <><Header title={`${p.name} · Draft ${d.number} · Campaign`} /><main class="mut">No issues yet. <button onClick={() => store.update(() => { const n = createIssue(p, did, prompt("Issue title?") ?? "Untitled"); setSel(n.id); })}>＋ issue</button></main></>;
  return <>
    <Header title={`${p.name} · Draft ${d.number} · Campaign`} right={<><button class="sm" onClick={() => go(`/p/${pid}/d/${did}`)}>← draft</button><Meters p={p} draftId={did} /></>} />
    <main>
      <Audience p={p} draftId={did} onPick={setGiver} />
      <div class="enc">
        <div class="rail"><div class="tag" style="margin-bottom:6px">ACTION ORDER — enforced</div>
          {order.map((x, n) => <div class={`it ${x.isRoot ? "" : "sym"} ${i.id === x.id ? "sel" : ""}`} onClick={() => setSel(x.id)}><span class="num">{n + 1}</span><span class="grow">{x.isRoot ? "★ " : ""}{x.title}</span><span class={`st ${status(x)}`}>{x.coveredBy ? "cov" : status(x)[0]}</span></div>)}
          <button class="sm" style="margin-top:8px" onClick={() => { const t = prompt("Issue title?"); if (t?.trim()) store.update(() => { const n = createIssue(p, did, t); setSel(n.id); }); }}>＋ issue</button></div>
        <div class="focus">
          <div class="tag">{i.isRoot ? COPY.encounter.boss : COPY.encounter.minion} · #{idx + 1} of {order.length}{i.isRoot && ` · ${COPY.encounter.minionsBehind(minions(issues, i.id).length)}`}</div>
          <h2>{i.title}</h2>
          <IssueEditor key={i.id} p={p} issue={i} onSaved={onSaved} />
          <div class="row" style="margin-top:14px"><span class="mut grow" style="font-size:13px">{next ? COPY.encounter.upNext(next.title) : COPY.encounter.nothingLeft}</span>
            {next ? <button onClick={() => setSel(next.id)}>{COPY.encounter.next}</button> : !d.frozen && <button class="pri" onClick={() => { store.update(() => endTurn(p, did)); go(`/p/${pid}/d/${did}/summary`); }}>{COPY.encounter.endTurn}</button>}</div>
        </div>
        <div class="ctx">
          {i.isRoot ? <div class="card"><b>Minions</b> ({minions(issues, i.id).length}){minions(issues, i.id).map(m => <div class={`minion ${m.coveredBy === i.id ? "covered" : ""}`} onClick={() => setSel(m.id)} style="cursor:pointer"><span class="grow">{m.title}</span><span class="lvl">Lv {severity(m, p.tagWeights)}</span><span class={`st ${status(m)}`}>{status(m)}</span></div>)}</div>
            : <div class="card"><b>Symptom of</b>{i.causedBy.map(c => { const b = issues.find(x => x.id === c)!; return <div class="minion" onClick={() => setSel(c)} style="cursor:pointer">★ {b.title} <span class={`st ${status(b)}`}>{status(b)}</span></div>; })}</div>}
        </div>
      </div>
    </main>
    {giver && <div id="giver-panel-slot" data-giver={giver} onClick={() => setGiver(null)} />}{/* Task 18 renders the panel here */}
  </>;
}
```

- [ ] **Step 4: Route it** — `case "campaign": return <Campaign pid={r.pid!} did={r.did!} />;`

- [ ] **Step 5: Manual check** — sample project: audience strip shows Dev/Appu/Meera at three ranks with moods; rail is in Action Order with the two bosses first; select a symptom, "symptom of" shows its boss; set a cause that would cycle → flip confirm; N3 appears on a Dialogue root; needs-action = no reveals the two extra fields; save updates status and "what's missing".

- [ ] **Step 6: Commit**

```bash
git add src/ui
git commit -m "feat(ui): campaign encounter screen, audience strip, issue editor"
```

---

### Task 17: Cascade modal, BOSS DOWN / INTEREST RISING cards, toasts, sound

**Files:**
- Create: `src/ui/Cascade.tsx`, `src/ui/Cards.tsx`, `src/ui/sound.ts`, `src/ui/toast.ts`
- Modify: `src/ui/screens/Campaign.tsx` (wire `onSaved`)

**Interfaces:**
- Consumes: `cascadeQueue`, `answerCascade`, `bossCleared`, `affinity`.
- Produces: `<CascadeModal p bossId onDone(fell)/>`, `<BossDownCard/>`, `<RankUpCard/>`, `chime(kind)`, `toast(text)`.

- [ ] **Step 1: Sound and toast**

`src/ui/sound.ts`:
```ts
import { store } from "./store";
let ctx: AudioContext | null = null;
const NOTES: Record<"rank" | "boss" | "turn", number[]> = { rank: [523, 659, 784], boss: [392, 523, 659, 784], turn: [784, 659, 523, 392, 523] };
export function chime(kind: "rank" | "boss" | "turn") {
  if (!store.acc.settings.sound) return;
  try { ctx ??= new AudioContext(); const t0 = ctx.currentTime;
    NOTES[kind].forEach((f, i) => { const o = ctx!.createOscillator(), g = ctx!.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0 + i * 0.12); g.gain.exponentialRampToValueAtTime(0.2, t0 + i * 0.12 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.12 + 0.25); o.connect(g).connect(ctx!.destination); o.start(t0 + i * 0.12); o.stop(t0 + i * 0.12 + 0.3); });
  } catch { /* no audio, no problem */ }
}
```

`src/ui/toast.ts`:
```ts
export function toast(text: string) { const el = document.createElement("div"); el.className = "toast"; el.textContent = text; document.body.appendChild(el); setTimeout(() => el.remove(), 3000); }
```

- [ ] **Step 2: Cascade modal and cards**

`src/ui/Cascade.tsx`:
```tsx
import { useState } from "preact/hooks";
import { Project } from "../domain/types";
import { store } from "./store";
import { COPY } from "./copy";
import { answerCascade, cascadeQueue } from "../domain/cascade";
import { minions } from "../domain/graph";
import { severity } from "../domain/issue";
export function CascadeModal({ p, bossId, onDone }: { p: Project; bossId: string; onDone: (fell: string[]) => void }) {
  const issues = p.issues.filter(i => i.draftId === p.issues.find(x => x.id === bossId)!.draftId);
  const boss = issues.find(i => i.id === bossId)!; const [fell, setFell] = useState<string[]>([]);
  const q = cascadeQueue(issues, bossId); const total = minions(issues, bossId).length;
  if (!q.length) { onDone(fell); return null; }
  const m = q[0];
  const answer = (a: "full" | "partial" | "no") => { store.update(() => answerCascade(p.issues, bossId, m.id, a)); if (a === "full") setFell([...fell, m.id]); };
  return <div class="overlay"><div class="modal">
    <div class="tag">{COPY.cascade.progress(total - q.length, total)}</div>
    <h3 style="margin:6px 0">{COPY.cascade.title}</h3>
    <div class="card" style="margin:10px 0"><b>{m.title}</b> <span class="lvl">Lv {severity(m, p.tagWeights)}</span><div class="tag">{m.tags.join(", ")}</div></div>
    <div class="quote">{boss.solution}</div>
    <div class="row" style="justify-content:flex-end"><button onClick={() => answer("no")}>{COPY.cascade.no}</button><button onClick={() => answer("partial")}>{COPY.cascade.partial}</button><button class="pri" onClick={() => answer("full")}>{COPY.cascade.full}</button></div>
  </div></div>;
}
```

`src/ui/Cards.tsx`:
```tsx
import { Project } from "../domain/types";
import { COPY, FACES, rankName } from "./copy";
export function BossDownCard({ p, bossId, fell, onClose }: { p: Project; bossId: string; fell: string[]; onClose: () => void }) {
  const boss = p.issues.find(i => i.id === bossId)!;
  return <div class="overlay" onClick={onClose}><div class="modal cleared"><div class="tag" style="color:#fbd">{COPY.bossDown.tag}</div><h2>{boss.title}</h2>
    <div>{fell.length ? COPY.bossDown.fell(fell.map(id => p.issues.find(i => i.id === id)!.title)) : COPY.bossDown.none}</div>
    <div style="margin-top:14px;opacity:.8;font-size:13px">{COPY.bossDown.cont}</div></div></div>;
}
export function RankUpCard({ p, giverId, rank, quote, onClose }: { p: Project; giverId: string; rank: number; quote: string; onClose: () => void }) {
  const g = p.givers.find(x => x.id === giverId)!;
  return <div class="overlay" onClick={onClose}><div class="modal rankcard"><div class="tag" style="color:#cfe">{FACES[rank]} {COPY.rankUp.tag}</div><h2>{COPY.rankUp.line(g.name, rankName(rank))}</h2>
    {quote && <div class="quote" style="color:#fff;background:rgba(255,255,255,.15);border-color:#fff">“{quote}”</div>}</div></div>;
}
```

- [ ] **Step 3: Wire into Campaign**

In `Campaign.tsx` add state and replace `onSaved`:
```tsx
import { CascadeModal } from "../Cascade";
import { BossDownCard, RankUpCard } from "../Cards";
import { chime } from "../sound";
import { affinity } from "../../domain/affinity";
import { status as st } from "../../domain/issue";
// inside component:
const [cascade, setCascade] = useState<string | null>(null);
const [card, setCard] = useState<null | { type: "boss"; bossId: string; fell: string[] } | { type: "rank"; giverId: string; rank: number; quote: string }>(null);
const snapshotRanks = () => Object.fromEntries(p.givers.map(g => [g.id, affinity(p, did, g.id).rank]));
const checkRankUps = (before: Record<string, number>) => {
  for (const g of p.givers) { const a = affinity(p, did, g.id); if (a.rank > before[g.id]) {
    const q = p.items.find(it => it.draftId === did && it.giverId === g.id && it.issueIds.length && it.issueIds.every(id => st(p.issues.find(x => x.id === id)!) === "Planned"))?.text ?? "";
    setCard({ type: "rank", giverId: g.id, rank: a.rank, quote: q }); chime("rank"); return; } }
};
const [before, setBefore] = useState<Record<string, number>>({});
const onSaved = (kind: "boss" | "symptom") => { const b = snapshotRanks(); setBefore(b); if (kind === "boss" && cascadeQueueLen(i.id) > 0) setCascade(i.id); else checkRankUps(b); };
const cascadeQueueLen = (bossId: string) => minions(issues, bossId).filter(m => !m.cascadeAnswers[bossId]).length;
```
And render, before the closing fragment:
```tsx
{cascade && <CascadeModal p={p} bossId={cascade} onDone={fell => { setCascade(null); setCard({ type: "boss", bossId: cascade, fell }); chime("boss"); }} />}
{card?.type === "boss" && <BossDownCard p={p} bossId={card.bossId} fell={card.fell} onClose={() => { setCard(null); checkRankUps(before); }} />}
{card?.type === "rank" && <RankUpCard p={p} giverId={card.giverId} rank={card.rank} quote={card.quote} onClose={() => setCard(null)} />}
```
Note: `snapshotRanks` must be taken *before* the solution is saved to detect a rise; `IssueEditor.save` calls `onSaved` after `store.update`, so take the snapshot in `IssueEditor` instead: change its `save` to `const b = onBeforeSave?.(); set(...); onSaved(kind, b)` — add an optional `onBeforeSave?: () => Record<string, number>` prop and pass `snapshotRanks` from Campaign; `onSaved(kind, b)` uses `b` instead of the `before` state. Do this; drop the `before` state.

- [ ] **Step 4: Manual check** — sample: plan *Rithu doesn't want anything* → cascade runs over its 3 minions one at a time → BOSS DOWN lists what fell → close → Appu's rank card fires (his items' issues now planned) with a quote → audience face bumps. Chimes play; Settings toggle (Task 19) silences them.

- [ ] **Step 5: Commit**

```bash
git add src/ui
git commit -m "feat(ui): cascade modal, boss down and rank-up cards, chimes"
```

---

### Task 18: Giver profile panel, N4 pattern nudge, Ideas page

**Files:**
- Create: `src/ui/GiverPanel.tsx`, `src/ui/screens/Ideas.tsx`
- Modify: `src/ui/screens/Campaign.tsx` (render panel + N4 banner), `src/ui/App.tsx` (route)

- [ ] **Step 1: Giver panel**

`src/ui/GiverPanel.tsx`:
```tsx
import { Project } from "../domain/types";
import { affinity } from "../domain/affinity";
import { status } from "../domain/issue";
import { rankName } from "./copy";
export function GiverPanel({ p, draftId, giverId, onClose }: { p: Project; draftId: string; giverId: string; onClose: () => void }) {
  const g = p.givers.find(x => x.id === giverId)!; const a = affinity(p, draftId, giverId);
  const nextAt = a.rank >= 4 ? a.total : Math.min(a.total, Math.ceil(a.rank * a.total / 3) + 1);
  return <div class="gpanel" style="right:0">
    <div class="row"><h3 style="margin:0" class="grow">{g.name}</h3><button class="sm" onClick={onClose}>close</button></div>
    <div class="rank">{rankName(a.rank)}</div><div class="hearts">{"●".repeat(a.rank + 1)}{"○".repeat(4 - a.rank)}</div>
    <div class="mut" style="font-size:13px">{a.planned}/{a.total} of what {g.name} said is planned{a.rank < 4 && ` → next rank at ${nextAt}/${a.total}`}</div>
    {[...p.drafts].sort((x, y) => y.number - x.number).map(d => { const items = p.items.filter(it => it.draftId === d.id && it.giverId === giverId); if (!items.length) return null;
      return <><h4 style="margin:14px 0 4px;font-size:13px">Draft {d.number}</h4>{items.map(it => <div class="gitem"><span class="tag">{it.kind}</span> {it.text}<div>{it.issueIds.map(id => { const i = p.issues.find(x => x.id === id)!; return <span class="tag">→ {i.title} <span class={`st ${status(i)}`}>{status(i)}</span><br /></span>; })}{!it.issueIds.length && <span class="tag" style="color:var(--warn)">unaccounted</span>}</div></div>)}</>; })}
  </div>;
}
```

- [ ] **Step 2: N4 banner + panel in Campaign**

In `Campaign.tsx`, replace the `giver-panel-slot` placeholder with `{giver && <GiverPanel p={p} draftId={did} giverId={giver} onClose={() => setGiver(null)} />}` and, directly under `<Audience …/>`, render the pattern nudge:
```tsx
{giverPatternNudges(p, did).map(n => { const g = p.givers.find(x => x.id === n.giverId)!; return <div class="n2" style="margin-bottom:12px"><b>{COPY.n4(g.name, n.issueIds.length)}</b> {n.issueIds.map(id => <span class="issue-chip">{issues.find(x => x.id === id)?.title}</span>)}
  <button class="sm" onClick={() => { const t = prompt("Title of the deeper issue that causes all of these?"); if (t?.trim()) store.update(() => { const deep = createDeeperIssue(p, did, t, n.issueIds); setSel(deep.id); }); }}>create a deeper issue</button>
  <button class="sm" onClick={() => store.update(() => { d.dismissedN4.push(n.giverId); })}>they're separate</button></div>; })}
```
Imports: `giverPatternNudges` from `../../domain/nudges`, `createDeeperIssue` from `../../domain/account`, `GiverPanel` from `../GiverPanel`.

- [ ] **Step 3: Ideas page**

`src/ui/screens/Ideas.tsx`:
```tsx
import { store, useStore } from "../store";
import { Header } from "../Header";
import { go } from "../router";
import { addIdea } from "../../domain/account";
export function Ideas({ pid }: { pid: string }) {
  const acc = useStore(); const p = acc.projects.find(x => x.id === pid)!;
  return <><Header title={`${p.name} · Ideas`} right={<button class="sm" onClick={() => go(`/p/${pid}`)}>← draft</button>} /><main style="max-width:760px">
    <input placeholder="Loose thought. Enter to keep it." onKeyDown={e => { if (e.key === "Enter") { const v = (e.target as HTMLInputElement).value; if (v.trim()) store.update(() => addIdea(p, v)); (e.target as HTMLInputElement).value = ""; } }} />
    {p.ideas.slice().reverse().map(i => <div class="idea" style={`margin-top:8px;${i.usedInDraft ? "opacity:.5" : ""}`}>{i.text}
      <div class="tag">{i.issueIds.map(id => p.issues.find(x => x.id === id)?.title).filter(Boolean).join(" · ") || "unlinked"}{i.usedInDraft && ` · used in Draft ${i.usedInDraft}`}</div></div>)}
  </main></>;
}
```
Route: `case "ideas": return <Ideas pid={r.pid!} />;`

- [ ] **Step 4: Manual check** — click Meera in the audience strip: panel shows her rank, hearts, items with statuses and the unaccounted one. Give one giver three root issues → N4 banner; "create a deeper issue" links all three. Ideas page adds and lists; linking from an issue's ＋ idea shows there.

- [ ] **Step 5: Commit**

```bash
git add src/ui
git commit -m "feat(ui): giver panel, pattern nudge, ideas page"
```

---

### Task 19: End-turn summary, exports, backup/restore, nag, settings

**Files:**
- Create: `src/ui/screens/Summary.tsx`, `src/ui/screens/Settings.tsx`, `src/ui/download.ts`, `src/ui/Nag.tsx`
- Modify: `src/ui/App.tsx` (routes + nag + persistent-storage), `src/ui/screens/DraftHome.tsx` (chime on end turn)

- [ ] **Step 1: Download helpers**

`src/ui/download.ts`:
```ts
import { zipSync, strToU8 } from "fflate";
export function download(name: string, content: string | Uint8Array, type = "text/plain") {
  const blob = new Blob([content], { type }); const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export function downloadZip(name: string, files: { path: string; content: string }[]) {
  download(name, zipSync(Object.fromEntries(files.map(f => [f.path, strToU8(f.content)]))), "application/zip");
}
```

- [ ] **Step 2: Summary screen**

`src/ui/screens/Summary.tsx`:
```tsx
import { useEffect } from "preact/hooks";
import { store, useStore } from "../store";
import { go } from "../router";
import { Header } from "../Header";
import { COPY, FACES, rankName } from "../copy";
import { download } from "../download";
import { actionPlanFilename, actionPlanMarkdown, backupFilename, serializeBackup } from "../../domain/exports";
import { reopenDraft, startDraft } from "../../domain/account";
import { chime } from "../sound";
export function Summary({ pid, did }: { pid: string; did: string }) {
  const acc = useStore(); const p = acc.projects.find(x => x.id === pid)!; const d = p.drafts.find(x => x.id === did)!; const s = d.summary;
  useEffect(() => { chime("turn"); if (s) download(actionPlanFilename(p, d), actionPlanMarkdown(p, did), "text/markdown"); }, []);
  if (!s) { go(`/p/${pid}/d/${did}`); return null; }
  const t = (id: string) => p.issues.find(i => i.id === id)?.title;
  return <><Header title={`${p.name} · Draft ${d.number}`} /><main style="max-width:760px">
    <div class="card cleared" style="text-align:left"><div class="tag" style="color:#fbd">{COPY.summary.title(d.number)}</div><h2 style="margin:4px 0">Grade {s.grade}</h2>
      <div>Planned {s.planned}/{s.total} · Bosses {s.bossesCleared}/{s.roots}{d.exportStale && " · export stale"}</div></div>
    <div class="card" style="margin-top:12px"><b>The room</b>{s.rankChanges.map(r => <div class="minion">{FACES[r.to]} {p.givers.find(g => g.id === r.giverId)?.name}: {rankName(r.from)} → {rankName(r.to)}</div>)}
      {s.walkedOut.length > 0 && <div class="missing" style="margin-top:6px">Walked out (something they said went unaccounted): {s.walkedOut.map(id => p.givers.find(g => g.id === id)?.name).join(", ")}</div>}</div>
    {s.skipped.length > 0 && <div class="card" style="margin-top:12px"><b>Still skipped at end turn</b>{s.skipped.map(id => <div class="minion">{t(id)}</div>)}</div>}
    {s.unplanned.length > 0 && <div class="card" style="margin-top:12px"><b>Unplanned</b>{s.unplanned.map(id => <div class="minion">{t(id)}</div>)}</div>}
    <div class="row" style="margin-top:16px;flex-wrap:wrap">
      <button onClick={() => download(actionPlanFilename(p, d), actionPlanMarkdown(p, did), "text/markdown")}>Download action plan</button>
      <button class="pri" onClick={() => { download(backupFilename(new Date()), serializeBackup(acc), "application/json"); store.update(a => { a.settings.lastBackupAt = new Date().toISOString(); }); }}>{COPY.summary.backup}</button>
      <span class="grow" />
      <button onClick={() => { store.update(() => reopenDraft(p, did)); go(`/p/${pid}/d/${did}`); }}>{COPY.summary.reopen}</button>
      <button class="pri" onClick={() => store.update(() => { const n = startDraft(p); go(`/p/${pid}/d/${n.id}`); })}>{COPY.summary.nextDraft}</button>
    </div>
  </main></>;
}
```

- [ ] **Step 3: Settings**

`src/ui/screens/Settings.tsx`:
```tsx
import { store, useStore } from "../store";
import { Header } from "../Header";
import { TAGS } from "../../domain/types";
import { download, downloadZip } from "../download";
import { backupCounts, backupFilename, obsidianFiles, parseBackup, serializeBackup } from "../../domain/exports";
export function Settings() {
  const acc = useStore();
  const restore = async (f: File) => { try { const next = parseBackup(await f.text()); const c = backupCounts(next); if (confirm(`Replace everything with this backup? ${c.projects} projects, ${c.issues} issues, ${c.items} feedback items. No merge, no undo.`)) store.replace(next); } catch (e) { alert(String(e)); } };
  return <><Header title="Settings" /><main style="max-width:760px">
    <div class="card"><label><input type="checkbox" style="width:auto" checked={acc.settings.sound} onChange={e => store.update(a => { a.settings.sound = (e.target as HTMLInputElement).checked; })} /> Sound</label></div>
    <div class="card" style="margin-top:12px"><b>Backup</b><div class="mut" style="font-size:13px">Last backup: {acc.settings.lastBackupAt?.slice(0, 10) ?? "never"}. Browser storage can be wiped; this file is the real copy.</div>
      <div class="row" style="margin-top:8px"><button class="pri" onClick={() => { download(backupFilename(new Date()), serializeBackup(acc), "application/json"); store.update(a => { a.settings.lastBackupAt = new Date().toISOString(); }); }}>Download backup</button>
        <label class="sm" style="border:1px solid var(--line);border-radius:6px;padding:4px 10px;cursor:pointer">Restore… <input type="file" accept=".json" style="display:none" onChange={e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) void restore(f); }} /></label></div></div>
    {acc.projects.map(p => <div class="card" style="margin-top:12px"><b>{p.name}</b>
      <div class="row" style="margin-top:6px"><button class="sm" onClick={() => downloadZip(`${p.name}-obsidian.zip`, obsidianFiles(p))}>Export for Obsidian (.zip)</button></div>
      <div class="tag" style="margin-top:8px">Tag weights</div>
      <div class="row" style="flex-wrap:wrap">{TAGS.map(t => <label class="tag">{t} <input type="number" style="width:52px" value={p.tagWeights[t]} onChange={e => store.update(() => { p.tagWeights[t] = Number((e.target as HTMLInputElement).value) || 0; })} /></label>)}</div></div>)}
  </main></>;
}
```

- [ ] **Step 4: Nag + routes**

`src/ui/Nag.tsx`:
```tsx
import { useStore } from "./store";
import { COPY } from "./copy";
import { go } from "./router";
export function Nag() {
  const acc = useStore(); const real = acc.projects.some(p => !p.isSample); if (!real) return null;
  const last = acc.settings.lastBackupAt ? Date.parse(acc.settings.lastBackupAt) : 0;
  if (Date.now() - last < 7 * 86400e3) return null;
  return <div class="nag">{COPY.nag}<button class="sm" onClick={() => go("/settings")}>Back it up</button></div>;
}
```
In `App.tsx`: render `<Nag />` above the routed screen; add `case "summary"` and `case "settings"`.

- [ ] **Step 5: Manual check** — End turn from the sample: action plan downloads with the header, `##` boss, nested `###` minion "Covered by", "Left alone, on purpose" (the tea-shop dialogue issue), "Unplanned". Download backup, delete a project, Restore → confirm shows counts → data back. Toggle sound off; no chimes. Change Theme weight to 1 → Action Order changes.

- [ ] **Step 6: Commit**

```bash
git add src/ui
git commit -m "feat(ui): end-turn summary, exports, backup/restore, nag, settings"
```

---

### Task 20: Revive — "pull from previous draft" picker

**Files:**
- Create: `src/ui/RevivePicker.tsx`
- Modify: `src/ui/screens/DraftHome.tsx`

- [ ] **Step 1: Picker**

`src/ui/RevivePicker.tsx`:
```tsx
import { useState } from "preact/hooks";
import { Project } from "../domain/types";
import { store } from "./store";
import { draftIssues } from "../domain/graph";
import { previousDraft, reviveIssues } from "../domain/revive";
import { status } from "../domain/issue";
export function RevivePicker({ p, draftId, onClose }: { p: Project; draftId: string; onClose: () => void }) {
  const prev = previousDraft(p, draftId); const [sel, setSel] = useState<string[]>([]);
  if (!prev) return null;
  const already = new Set(draftIssues(p, draftId).map(i => i.ancestorId).filter(Boolean));
  const olds = draftIssues(p, prev.id).filter(i => !already.has(i.id));
  return <div class="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div class="modal">
    <h3 style="margin:0 0 8px">Pull from Draft {prev.number}</h3><div class="mut" style="font-size:13px">Tick what still stands. Nothing comes over on its own.</div>
    <div class="list" style="margin:10px 0">{olds.map(i => <label style="display:flex;gap:8px;padding:4px 0"><input type="checkbox" style="width:auto" checked={sel.includes(i.id)} onChange={e => setSel((e.target as HTMLInputElement).checked ? [...sel, i.id] : sel.filter(x => x !== i.id))} /> {i.isRoot ? "★ " : ""}{i.title} <span class="tag">{i.needsAction === "no" ? "left alone" : status(i)}</span></label>)}</div>
    <div class="row" style="justify-content:flex-end"><button onClick={onClose}>Cancel</button><button class="pri" disabled={!sel.length} onClick={() => { store.update(() => reviveIssues(p, prev.id, draftId, sel)); onClose(); }}>Revive {sel.length}</button></div>
  </div></div>;
}
```

- [ ] **Step 2: Button on Draft home** — add `const [revive, setRevive] = useState(false);` and, in the top row when `previousDraft(p, did)` exists and `!d.frozen`: `<button onClick={() => setRevive(true)}>⏮ Pull from previous draft</button>`; render `{revive && <RevivePicker p={p} draftId={did} onClose={() => setRevive(false)} />}`.

- [ ] **Step 3: Manual check** — end turn on the sample, start Draft 2, pull two issues (one planned, one left alone): they arrive with tags, pinned "Draft 1 plan" note, badges *Came back* / *Still bothers them* in the campaign editor, cause links only between the two revived. Typing "Rithu doesn't want" as a new issue title in Draft 2 offers the ancestor.

- [ ] **Step 4: Commit**

```bash
git add src/ui
git commit -m "feat(ui): revive picker"
```

---

### Task 21: Onboarding — "How this works" page and the tour

**Files:**
- Create: `src/ui/screens/How.tsx`, `src/ui/Tour.tsx`
- Modify: `src/ui/App.tsx`

- [ ] **Step 1: How this works**

`src/ui/screens/How.tsx`:
```tsx
import { store } from "../store";
import { Header } from "../Header";
import { go } from "../router";
export function How() {
  return <><Header title="How this works" /><main style="max-width:680px;font-size:16px;line-height:1.6">
    <h2>Gagan Achari</h2>
    <p>You wrote a draft. People read it. They said things. Some of it was smart, some of it was stupid, all of it is valid. Your job is not to argue — it's to find out what in the screenplay made them say it.</p>
    <ol>
      <li><b>Every opinion is valid.</b> Log it. Even the dumb one.</li>
      <li><b>If they misunderstood, the screenplay did it.</b> Not their empathy. Yours.</li>
      <li><b>Write the issue, not the opinion.</b> "Why is Anto so boring" is feedback. "Anto has no agency" is the issue.</li>
      <li><b>Ask what's underneath.</b> Most issues are symptoms. The tool will keep asking. Let it.</li>
      <li><b>Not everything gets fixed.</b> But you have to say how you <i>would</i> fix it, and what the film would lose. That's the exercise.</li>
      <li><b>Bosses first.</b> The order is enforced: root causes on top. Solve one and its symptoms come up for review — some will fall on their own.</li>
      <li><b>The room is watching.</b> Every giver warms up as you honour what they said. Ignore someone and they walk out.</li>
      <li><b>End the turn.</b> Export the action plan. Go write. Come back with the next draft and start empty.</li>
    </ol>
    <div class="row"><button class="pri" onClick={() => { store.update(a => { a.settings.seenHowItWorks = true; }); go("/"); }}>Got it</button></div>
  </main></>;
}
```

- [ ] **Step 2: Tour**

`src/ui/Tour.tsx` — a step overlay driven by route; each step names a screen and a line of instruction; "Skip" or finishing sets `tourDone`:
```tsx
import { useState } from "preact/hooks";
import { store } from "./store";
import { go } from "./router";
const STEPS = (pid: string, did: string, sid: string) => [
  { path: `/p/${pid}/d/${did}/s/${sid}`, text: "This is a session — what the room said, one line each. Type something Meera might say and press Enter. It selects itself." },
  { path: `/p/${pid}/d/${did}/s/${sid}`, text: "Hit ＋ New issue. Answer the only question that matters: what in the screenplay makes her say this? Then: is it a symptom of something deeper?" },
  { path: `/p/${pid}/d/${did}/campaign`, text: "The campaign. Bosses on top, order enforced. The faces are the room. Pick “Rithu doesn't want anything”." },
  { path: `/p/${pid}/d/${did}/campaign`, text: "Write a plan and Swing at the boss. Each minion asks: did that also knock me out? Be honest." },
  { path: `/p/${pid}/d/${did}/campaign`, text: "BOSS DOWN. Watch Appu's face. That's the whole game." },
  { path: `/p/${pid}/d/${did}`, text: "When you've done the thinking — 🏁 End turn. You get the action plan and a grade. Then go write." },
];
export function Tour() {
  const acc = store.acc; const p = acc.projects.find(x => x.isSample); const d = p?.drafts[0]; const s = p && p.sessions.find(x => x.draftId === d!.id);
  const [i, setI] = useState(0);
  if (!p || !d || !s || acc.settings.tourDone) return null;
  const steps = STEPS(p.id, d.id, s.id); const step = steps[i];
  const done = () => store.update(a => { a.settings.tourDone = true; });
  const next = () => { if (i + 1 >= steps.length) { done(); go("/"); return; } setI(i + 1); go(steps[i + 1].path); };
  if (location.hash !== "#" + step.path) go(step.path);
  return <div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:14px 18px;border-radius:12px;max-width:560px;z-index:30;box-shadow:0 8px 30px rgba(0,0,0,.3)">
    <div class="tag" style="color:#bbb">Tour · {i + 1}/{steps.length}</div><div style="margin:6px 0 10px">{step.text}</div>
    <div class="row" style="justify-content:flex-end"><button class="sm" onClick={() => { done(); }}>Skip</button><button class="sm pri" onClick={next}>{i + 1 >= steps.length ? "Done" : "Next"}</button></div>
  </div>;
}
```
In `App.tsx`: after `store.ready`, render `<Tour />` alongside the routed screen when `!acc.settings.tourDone`; when the tour finishes and `!acc.settings.seenHowItWorks`, `go("/how")`. Add `case "how": return <How />;`. Header already links to How and a "Replay tour" button in Settings sets `tourDone = false`.

- [ ] **Step 3: Manual check** — clear site data, reload: sample installs, tour starts on the sample session, Skip ends it, finishing lands on How this works once; header link reopens it any time.

- [ ] **Step 4: Commit**

```bash
git add src/ui
git commit -m "feat(ui): how-this-works page and first-run tour"
```

---

### Task 22: Deploy

**Files:**
- Create: `README.md`, `wrangler.toml` (optional)

- [ ] **Step 1: Build and preview** — `pnpm build && pnpm preview`; open, run through the sample once. Fix any TS errors.

- [ ] **Step 2: README**

`README.md`:
```markdown
# Gagan Achari

Local-first screenplay feedback tool. Log what the room said, extract the issues underneath, work them root-first, export the action plan. No accounts, no server, no AI.

- `pnpm dev` — run locally
- `pnpm test` — domain tests
- `pnpm build` — static site in `dist/`

Deploy: `npx wrangler pages deploy dist --project-name gagan-achari` (Cloudflare Pages), or push `dist/` to a `gh-pages` branch. Your data lives in your browser; download a backup from Settings.

Design decisions: `.scratch/feedback-tool/` (map, tickets, spec). Glossary: `CONTEXT.md`.
```

- [ ] **Step 3: Deploy** — `npx wrangler pages deploy dist --project-name gagan-achari` (interactive login the first time; the user runs it with `! npx wrangler login` if prompted). Note the URL in the README.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: readme and deploy notes"
```

---

## Self-review

**Spec coverage** — stories 1–5 (Task 13/14), 6–16 (14/15), 17–33 (2/3/15/16), 34–40 (7/15/16/18), 41–51 (4/5/16/17), 52–58 (6/16/17/18), 59–65 (6/10/14/17/19), 66–70 (8/20), 71–73 (10/16/18), 74–78 (9/12/19), 79–82 (11/21/13). Persistent storage request (78) fires from `store.update` in Task 13. Screen 8 (Settings) in Task 19. Gap found and fixed: "Replay tour" in Settings — add a `<button class="sm" onClick={() => store.update(a => { a.settings.tourDone = false; })}>Replay tour</button>` to the first card in `Settings.tsx`.

**Placeholder scan** — none; the one intentional stub (`onSaved` in Task 16) is replaced in Task 17 and says so.

**Type consistency** — `createDeeperIssue(p, draftId, title, forIssueIds)` used identically in Tasks 10/15/18; `reviveIssues(p, fromDraftId, toDraftId, ids)` in 8/15/20; `affinity(p, draftId, giverId)` in 6/16/17/18; `answerCascade(issues, bossId, minionId, answer)` in 5/11/17; `status(issue)` everywhere; `Issue.coveredBy/partialOf/cascadeAnswers/pinnedNote/ancestorId` defined in Task 2 and used as named. `IssueEditor.onSaved(kind, before)` signature change in Task 17 Step 3 applies to the call in Task 16 — the implementer of Task 17 must update both.
