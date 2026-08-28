# Capture flow prototype
Type: prototype
Status: resolved
Blocked by: 01, 03

## Question

How should "log feedback → extract issue" feel so it is not cumbersome? The writer's explicit worry: capture-first must not force a two-pass workflow. Prototype a throwaway UI of: new session → add givers → add items rapidly (reaction/suggestion) → extract issue inline from an item without leaving the list → link an existing issue to an item. Also: raising an issue with no feedback item. React to it, then lock the flow.

## Answer

Resolved 2026-08-28 by prototype. Asset: `prototypes/capture-flow.html` (three variants, `?variant=A|B|C`; throwaway, keep as primary source).

**Winner: Variant B — Inbox.** Locked flow:

- Two panes. **Left: feed** of feedback items, newest first. Sticky add bar at top: giver select, kind select (reaction / suggestion), one text input; Enter adds the item **and selects it**, so extraction is one click away — no second pass.
- Items with no linked issue are visibly flagged (amber edge + "unaccounted"); linked issues show as chips on the item.
- **Right: issue panel.** Always-visible primary button **"＋ New issue"** at the top — with an item selected it reads *"New issue from what [Giver] said"* and opens the extract drawer with the quote pinned; with nothing selected it creates an issue with no feedback item. A secondary **"＋ Issue without feedback"** sits beside it when an item is selected. (First cut hid this button until an item was selected — the writer couldn't find it. Never gate the create affordance.)
- Below: the selected item's quote, then **"…or link an existing issue"** — a checklist of all issues sorted by severity (root ★, tags, severity, status). Check = link, uncheck = unlink.
- Extract drawer (shared across variants, unchanged): title, description with N1 placeholder, tag checkboxes, N2 deeper-cause step appearing once description has substance (caused by existing / new deeper issue inline / root / decide later), N3 confirm on shallow root.

Rejected: A (ledger — closest to the Obsidian minutes but the margin actions were cramped and extraction interrupts the transcript), C (wall — playful, but drag-to-link is slower than a checkbox for 5–10 items per giver and needs an overlay for extraction).
