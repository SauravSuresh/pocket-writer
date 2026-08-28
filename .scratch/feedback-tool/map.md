# Map: Gagan Achari — screenplay feedback tool

Label: wayfinder:map

## Destination

A locked spec for v1 of a local-first, desktop, type-only web app that turns a pile of feedback on a screenplay draft into an enforced, root-cause-first action plan — gamified as a campaign — ready to hand to a friend. Spec done → one build.

## Notes

- Domain glossary: `CONTEXT.md` at repo root. Consult before every ticket.
- Source system: Obsidian vault `/Users/sauravsuresh/Documents/ShajiRemote/Writing/V3` (Issues/, Tags.md, the two dataviewjs ordering notes, `../V3 changes.md`). The dataviewjs in "Second draft issues needs action.md" is the reference implementation of Action Order.
- Standing preferences: no AI anywhere (hard no). No transcription, no audio — text only. Desktop only. Data in browser storage with export/import. Screenplay-specific taxonomy with editable weights. Ordering is never hand-dragged. Every issue needs a solution (no "cleared" state). Gamification: plain UI + campaign vocabulary + celebratory moments (Social-Links-style giver affinity, boss/minion for root/symptom, draft = turn).
- Skills per ticket: grilling → call `grilling` + `domain-modeling`; prototype → `prototype`; research → `research`.
- Philosophy the spec must preserve: every opinion valid; misunderstanding is the writer's responsibility; must define how you *would* fix even when not fixing; symptoms vs seminal issues; record issues not opinions; nudge hard toward deeper causes; solving fundamentals should dissolve surface issues.

## Decisions so far

<!-- one line per closed ticket -->
- [Browser storage durability, export/import, static hosting](issues/07-storage-and-hosting.md): IndexedDB via `idb` + `persist()` as working copy, JSON export/import as the real durability guarantee (Safari tab purges after 7 idle Safari-days; Add-to-Dock exempt), no File System Access API (Chrome-only), host on Cloudflare Pages or GitHub Pages (PSL-listed, no storage interference).

- [Issue model, template, and tag taxonomy](issues/01-issue-model-and-taxonomy.md): Issue = title/description/thoughts/references + tags + causedBy-or-root + needsAction + two prose assessment fields + one solution box (+reasonNotActing); severity = max tag weight + 1 per extra tag, no override; status derived Raw→Captured→Assessed→Planned; cycles blocked at entry.

- [Gamification mechanics](issues/02-gamification-mechanics.md): per-draft campaign grade (no XP); progress only from status transitions/accounting; four live meters; giver affinity = belief in the project (Walked out → Unconvinced → Watching → Nodding → Loves it), persists across drafts; boss card + one-minion-at-a-time cascade; end turn = export plan + summary, allowed with unplanned issues; toasts, cards, chimes.

- [Nudge rules](issues/03-nudge-rules.md): six nudges locked — extract prompt (always), deeper-cause picker on first description save, rootless-&-shallow (severity ≤3), same-giver ≥3 roots, unaccounted badge + end-turn list, root-left-alone on no-action; skips stored per issue, cleared when answered, reported only at end turn.

- [Capture flow prototype](issues/04-capture-flow-prototype.md): Inbox layout wins — feed left (Enter adds + selects, unaccounted flagged), issue panel right with an always-visible "＋ New issue" (from item or standalone) above a severity-sorted link checklist; extract drawer carries N1/N2/N3. Prototype kept at `prototypes/capture-flow.html`.

- [Campaign view and cascade prototype](issues/05-campaign-view-prototype.md): Encounter layout wins — always-visible audience strip (faces, animated interest bars, moods), order rail left, one issue in focus centre, context + suggestions/ideas right; cascade modal one minion at a time; unserious copy throughout. Prototype at `prototypes/campaign-view.html`.

- [Draft transition and carry-forward](issues/06-draft-transition.md): new draft starts empty when the writer says so; no automatic carry-forward — revive via "pull from previous draft" picker or similar-title suggestion; revived issues inherit text/tags/rewired causes, previous plan pinned as a note; badges "Came back" / "Still bothers them" show only; End turn freezes, reopen allowed (export stale, grade recomputed); affinity rank persists, bar resets.

- [Export and backup formats](issues/08-export-formats.md): Action Plan markdown per draft (bosses `##` with nested minions, giver quotes on every issue, "Left alone, on purpose" + "Unplanned" sections) — shareable with givers; JSON backup with replace-all restore; nag after 7 days + at End turn; per-issue Obsidian markdown export kept (no import); all via browser download.

- [Ideas parking lot](issues/09-ideas-parking-lot.md): Idea = project-level free text, linkable to many issues, written on an Ideas page or inline from an issue; adopting marks it "used in Draft N"; no promotion to suggestion; exported only in the Obsidian zip as `Ideas.md`.

- [Onboarding sample project and V3 vault import](issues/10-onboarding-and-v3-import.md): no importer (re-enter Shaji by hand); ships with deletable sample project *Smoke Love Repeat* (Akhil & Rithu, they die); first open runs a skippable tour of the game over the sample; one-screen "How this works" page with the philosophy, shown once, reachable from the header.

- [App name](issues/11-app-name.md): **Gagan Achari** — tab title, `gagan-achari-backup-<date>.json`, IndexedDB name `gagan-achari`.

## Not yet specified

<!-- empty — every remaining question is a ticket -->

## Out of scope

- Feedback givers using the tool (any submission surface). v2 at earliest.
- Audio capture / transcription (decided type-only; revisit as a fresh effort).
- AI assistance of any kind (hard no from the writer).
- Mobile / phone capture layout.
- Hosted multi-user backend, accounts, sync.
- Generic "any craft" feedback taxonomy.
