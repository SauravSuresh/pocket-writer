# Nudge rules
Type: grilling
Status: resolved
Blocked by: 01

## Question

Specify every nudge precisely — trigger, copy, dismissal behavior:
- Mandatory-first-field nudge on extract ("What in the screenplay makes them say this?").
- "Could this be a symptom of something deeper?" picker — when it appears, what it lists, how "new deeper issue" works inline.
- Rootless + low-severity nudge: the severity threshold.
- Same-giver 3+ rootless issues nudge: threshold and whether it's per session or per draft.
- Feedback-item-left-unaccounted nudge: timing (on session close? on dashboard?).
- Whether dismissal count is shown to the writer or only feeds affinity/meters (ties to fog item).

## Answer

Resolved 2026-08-28 by grilling. Copy is placeholder; rules are locked.

| # | Nudge | Trigger | Behavior | Dismissible / counted |
|---|---|---|---|---|
| N1 | Extract prompt | Issue created; `description` empty | Placeholder *"What in the screenplay makes [Giver] say this?"* (no item: *"What in the screenplay is the problem?"*). Source quote pinned above the box. | Not a nudge — always shown |
| N2 | Deeper-cause picker | First save of `description` | Step: *"Could this be a symptom of something deeper?"* Search existing issues (roots first, then severity) · "new deeper issue" (inline, title-only, Raw, linked) · "No — this is a root" · "decide later" | "Decide later" = skipped; Assessment incomplete until answered |
| N3 | Rootless & shallow | Writer marks root and severity ≤ 3 (Logic/Scene/Dialogue) | *"A [Tag] issue as a root cause? Sure nothing's underneath?"* keep root / pick a cause | Yes / yes |
| N4 | Same-giver pattern | A giver has ≥3 **root** issues in one draft | *"[Giver] has 3 separate root issues. Are they one problem?"* multi-select + "create a deeper issue causing all of these" | Yes / yes; once per giver per draft |
| N5 | Unaccounted items | Always | Session view: persistent badge count only. End turn: listed by giver; those givers drop to *Walked out* | Not dismissible at end turn |
| N6 | Root left alone | needsAction = no on a **root** with ≥1 symptom | *"You're leaving a root cause alone; its N symptoms will stay."* | Yes / yes |
| — | No-action reason | needsAction = no | `whyDiverges` field appears, placeholder *"Imagine you did fix it. What does the film lose?"* | Required field, not a nudge |

Bookkeeping: skips stored per issue (nudge id, timestamp). Answering later clears the skip. End-turn summary reports "still skipped at end turn" with the issue list — never "ever skipped". No live counter.
