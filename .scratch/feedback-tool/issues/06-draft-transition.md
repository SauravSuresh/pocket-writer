# Draft transition and carry-forward
Type: grilling
Status: resolved
Blocked by: 01

## Question

Define "start next draft": which issues are offered for carry-forward (all? only needs-action? only unplanned?), the per-issue prompt (Still present / Solved / Not sure), what a carried issue inherits (tags, causes, links, solution history), regression badge rule, and whether the previous draft becomes read-only.

## Answer

Resolved 2026-08-28 by grilling.

### Principle
The tool never decides an issue is still alive. A draft's only output is its Action Plan. Reviving an old issue is always the writer's act; the tool only makes it cheap.

### Starting a draft
- The writer starts a new draft explicitly, whenever they say so — not at End turn. Between End turn and the next draft the tool is idle.
- A new draft starts **empty**. No walk, no automatic carry-forward, no filtering by needs-action.

### Two ways an old issue comes back (both writer-initiated)
1. **Pull from previous draft** — a picker over *all* previous-draft issues; the writer ticks the ones that still stand.
2. **Similar-title suggestion** — when creating an issue in the new draft whose title resembles a previous-draft issue: *"Draft 2 had ‘…’ — same thing?"* → link as ancestor.

### What a revived issue inherits
title, description, thoughts, references, tags. Cause links only to issues also revived (rewired). The previous solution is **not** carried as the solution; it appears as a pinned *"Draft 2 plan"* note. Status recomputed (typically Assessed). If the ancestor was no-action, its `reasonNotActing` is pinned too.

### Badges (show only, never force re-assessment)
- **Came back** — ancestor had a solution in the previous draft.
- **Still bothers them** — ancestor was no-action.
"Did previous draft have / solve this" is now derived from the ancestor link; the two old template questions stay dropped.

### End turn & reopen
End turn freezes the draft (view + export only) and computes the campaign grade. **Reopen** is allowed: the export goes stale and the grade is recomputed at the next End turn. Nothing else changes.

### Affinity across drafts
Rank persists; the interest bar resets to 0 at each new draft.
