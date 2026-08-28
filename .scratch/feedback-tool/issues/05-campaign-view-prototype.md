# Campaign view and cascade prototype
Type: prototype
Status: resolved
Blocked by: 01, 02

## Question

Prototype the Action Order screen: enforced ordered list with boss/minion grouping, severity, status, "what's missing" per issue; the solution editor with adjacent suggestions (adopt with credit) and linked ideas; the cascade prompt after a boss solution ("Fully / Partially / No" per minion, auto-fill "covered by"). React to it, then lock layout and the cascade UX.

Also include a Giver profile panel: affinity rank + progress to next, every item across drafts, the issues each produced and their status. Decide what else (if anything) belongs there by reacting to it.

## Answer

Resolved 2026-08-28 by prototype. Asset: `prototypes/campaign-view.html` (three variants, `?variant=A|B|C`; throwaway, keep as primary source). Seeded with 13 real V3 issues and their cause links.

**Winner: Variant B — Encounter**, with two additions made on reaction.

### Layout (locked)
- **Audience strip** across the top, always visible: one card per giver — face by rank (🚪 Walked out · 😤 Unconvinced · 👀 Watching · 🙂 Nodding · 😍 Loves it), animated interest bar (planned/total of their items), count, and a one-line mood in the giver's voice. Face bounces on rank-up. Click → full giver profile panel. The writer's ask: *"see everyone's interest changing all the time."*
- **Left rail**: the enforced Action Order, numbered, roots ★, symptoms indented, status dot. Click to jump; no dragging.
- **Centre — the encounter**: header *⚔️ BOSS FIGHT* / *👾 ENCOUNTER · #n of N · k minions behind it*; title; status, level (severity), tags, needs-action, "symptom of" line; the solution editor; a "what's missing" line in plain-cheeky voice (*"Unarmed. Write a plan."*); primary button **⚔️ Swing at the boss** (root) / **Handle it** (symptom); footer *Up next: …* with **Who's next? →**, or **🏁 End turn** when nothing is left.
- **Right — context**: for a boss, its minions with status; for a symptom, its causes (clickable). Below: *Suggestions from the room* (giver-credited, **adopt** copies into the editor with credit) and *Your ideas* (linked ideas).
- **Giver profile panel** (slide-over): rank + hearts + progress to next rank, then every item by draft with the issues it produced and their status. Nothing else needed.

### Cascade UX (locked)
Saving a root's solution opens a modal per minion, one at a time: the minion card + the boss's solution quoted, *"Does that swing also knock out this one?"* — **Nope, still standing** / **Winged it** (partial: link kept, minion stays unplanned) / **💥 Down — mark covered** (minion's solution auto-filled *"Covered by “<boss>”"*, Planned). When the queue empties → full-screen **💥 BOSS DOWN** card listing what fell, or *"Minions survived. Rude. They stay in the order."* Rank-up card: *😍 INTEREST RISING — Rohan is now Nodding* with the quote that got them there.

### Tone (locked)
Plain UI, unserious copy. Campaign vocabulary everywhere the writer reads status; never in the data. The writer's verdict: *"okay this is fun now."*

Rejected: A (campaign list — whole order visible but the inline editor pushes everything around; no sense of "one thing at a time"), C (cause map — good for seeing the graph, bad for working it; keep as a possible secondary view later, not v1).
