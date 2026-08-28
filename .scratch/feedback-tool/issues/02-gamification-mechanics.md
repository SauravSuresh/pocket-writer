# Gamification mechanics
Type: grilling
Status: resolved
Blocked by: —

## Question

Decide the concrete game loop, at "plain UI + campaign vocabulary + celebration" weight:
- Which borrowed mechanics ship in v1: Social-Links affinity ranks for givers (rank thresholds, what a rank-up shows), boss/minion framing for root/symptom issues, Draft-as-turn campaign (what "end turn" does), XP/levels for the writer or not.
- What earns progress: item accounted, issue captured, assessed, planned, boss planned with cascade answered. Point values or just counters.
- Meters on the dashboard: % items accounted, % issues assessed, % planned; anything else.
- Celebratory moments: which events, how loud.
- What must NOT be gamified so the tool stays honest (e.g. no reward for marking needs-action = no).

## Answer

Resolved 2026-08-28 by grilling.

### Frame
Plain writing-tool UI + campaign vocabulary + celebratory moments. No fantasy skin.

### Writer progression
No cumulative XP or level. Each Draft gets a **campaign grade** (S/A/B/C) computed at end-turn from the meters. Resets per draft.

### What earns progress — only completed thinking
- Feedback Item → Accounted
- Issue → Captured / Assessed / Planned
- Boss cleared: root Issue Planned **and** every minion's cascade prompt answered
- Draft ended (Action Plan exported)

Never rewarded: needsAction yes vs no, nudge dismissal, tag count, issue count.

### Meters (dashboard, live)
Accounted (items linked/total) · Assessed (issues/total) · Planned (issues/total) · Bosses cleared (n/roots).
Nudges skipped: internal only; shown once in the end-turn summary. (Closes the fog item.)

### Giver affinity — belief in the project, not closeness
Givers are already close people who disagree with this draft. 5 ranks per giver per project:
**Walked out → Unconvinced → Watching → Nodding → Loves it**
- Starts at *Unconvinced* on their first item.
- Climbs with % of their items whose issues are all Planned (no-action counts).
- Capped by unaccounted items; drops to *Walked out* only if a draft ends with any of their items unaccounted.
- Rank persists across drafts.
- Rank-up moment: full-screen card — name, new rank, the quote that got them there.

### Boss encounter
Root Issue = boss card in Action Order: severity as level, minions listed under it, "what's missing" line. Planning its solution fires the cascade prompt one minion at a time (Fully / Partially / No). All answered → "Boss cleared" card listing fallen minions. Surviving minions stay in the order as their own encounters.

### End turn
End turn = export the Action Plan → campaign summary (grade, meters, bosses cleared, affinity changes, nudges skipped, unplanned issues named) → "Start next draft" (see Draft transition ticket). Allowed with unplanned issues; the grade takes the hit.

### Celebration
Toasts + full-screen cards (rank-up, boss cleared, end turn) + short chimes for those three. Sound on by default, one toggle.
