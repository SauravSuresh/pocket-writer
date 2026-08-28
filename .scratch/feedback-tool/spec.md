# Spec: Gagan Achari v1

Status: ready-for-agent
Source: `map.md` (wayfinder, 11 decisions), `issues/01–11`, `CONTEXT.md`, `prototypes/*.html`, `research/07-storage-and-hosting.md`.
Vocabulary: `CONTEXT.md` is authoritative. Terms below are used as defined there.

## Problem Statement

A screenwriter's first draft is a vomit draft; the second draft is where the work happens. That work is driven by a *lot* of feedback from a room of close friends who each have opinions, suggestions, and misreadings. The problem is not a lack of information but deciding what to act on. Today the writer runs a hand-built Obsidian system: one note per issue with a template, tags that imply severity, "blocked by" links to deeper issues, a Dataview script that sorts root causes to the top, and a changes file written top-down. It works, but it lives in Dataview code, ~40% of template questions go unanswered, cycles creep into the cause graph, feedback quotes get lost, and it cannot be handed to another writer.

The philosophy the tool must preserve:
1. Every opinion and suggestion is valid, however stupid it sounds.
2. A misunderstanding on the giver's side is the screenplay's fault, not theirs.
3. Not every issue needs fixing — but the writer must define how they *would* fix it before choosing not to.
4. Issues are either seminal or surface; a surface issue is usually a symptom of a seminal one.
5. The writer records issues (what in the screenplay causes the reaction), never raw opinions.
6. Issues get tagged; tags imply severity.
7. The system orders issues root-first.
8. Solutions written top-down become the action plan; solving fundamentals should dissolve surface issues.

## Solution

**Gagan Achari**: a local-first, desktop-only, text-only single-page web app with no backend, no accounts, and no AI. The writer logs what the room said as Feedback Items, extracts Issues from them under a hard nudge toward deeper causes, tags them (severity derives), links them into a cause graph (no cycles), and works them one Encounter at a time in an enforced root-first Action Order. Planning a Root Issue cascades a "does this cover it?" prompt over its Symptoms. An always-visible Audience strip shows each Giver's Affinity rising as their issues get planned. Ending the turn exports a Markdown Action Plan (including a "Left alone, on purpose" section) and freezes the Draft; the next Draft starts empty and the writer revives what still stands. It is gamified as a campaign in vocabulary and celebration, not in skin, and it is deliberately unserious in copy. It ships with a sample project (*Smoke Love Repeat*) and a tour.

## User Stories

### Projects & drafts
1. As a writer, I want to create a Project for each screenplay, so that feedback for different films never mixes.
2. As a writer, I want multiple Projects, so that I can use the tool for everything I write.
3. As a writer, I want to start a Draft inside a Project when I decide to, so that the tool never presumes I have a new draft.
4. As a writer, I want a new Draft to start empty, so that nothing is carried forward without my say.
5. As a writer, I want to see which Draft I am working in at all times, so that I never log feedback against the wrong one.

### Givers & sessions
6. As a writer, I want to add a Giver by name only, so that I never have to invite or manage accounts.
7. As a writer, I want to create a Feedback Session with a date and the Givers present, so that every item is attributed to a sitting.
8. As a writer, I want to add Feedback Items fast — pick a giver, pick reaction or suggestion, type, press Enter — so that capture keeps up with a live conversation.
9. As a writer, I want a freshly added item to be selected automatically, so that I can extract an issue from it in one click without a second pass.
10. As a writer, I want suggestions recorded as feedback, not as solutions, so that a giver's proposed fix never bypasses my own thinking.
11. As a writer, I want to see which items are not yet Accounted (linked to no Issue), so that no perspective is silently dropped.
12. As a writer, I want a persistent badge count of unaccounted items in the session view, but no interrupting modal, so that capture stays uncumbersome.
13. As a writer, I want to link an existing Issue to an item with a checkbox, so that repeated feedback stacks onto the same issue.
14. As a writer, I want one item to link to many Issues and one Issue to many items, so that the model matches reality.
15. As a writer, I want to raise an Issue with no feedback item at all, so that my own observations are first-class.
16. As a writer, I want the "New issue" affordance always visible, whether or not an item is selected, so that I never hunt for it.

### Issues
17. As a writer, I want an Issue to have a title, a description, free-form thoughts, and external references (URLs), so that everything I know about it lives in one place.
18. As a writer, I want the description's placeholder to ask *"What in the screenplay makes [Giver] say this?"*, with the source quote pinned above it, so that I record the cause and not the opinion.
19. As a writer, I want the placeholder to read *"What in the screenplay is the problem?"* when there is no giver, so that the nudge still applies to my own issues.
20. As a writer, I want to tag an Issue with one or more screenplay categories (Theme, Tone, Character, Arc, Structure, Exposition, Logic, Scene, Dialogue, with sub-tags), so that severity follows from what kind of problem it is.
21. As a writer, I want severity to be the highest tag weight plus one per extra tag, so that a many-tagged craft note cannot outrank a Theme issue.
22. As a writer, I want to edit tag weights per project, so that the taxonomy fits my film.
23. As a writer, I want never to override severity by hand, so that the Action Order stays honest and the only lever is the tags.
24. As a writer, I want to mark an Issue as **caused by** one or more deeper Issues, or explicitly as a **root**, so that the cause graph is deliberate and not inferred from missing links.
25. As a writer, I want the tool to refuse a cause link that would close a cycle and ask "which is more fundamental?" with a one-click flip, so that two names for one issue never deadlock the order.
26. As a writer, I want to decide Needs Action (yes/no/undecided) myself, so that the tool never decides what gets fixed.
27. As a writer, I want a short prose answer to "can it be addressed?", so that feasibility is on record.
28. As a writer, I want, when Needs Action is no, a required answer to "why would fixing this diverge from the film you want?", so that saying no is an exercise, not an escape.
29. As a writer, I want one solution box that holds either what I *will* do or what I *would* do, plus a required "reason not acting" when I won't, so that every issue ends with a defined fix.
30. As a writer, I want status derived automatically — Raw → Captured → Assessed → Planned — so that I never bookkeep state.
31. As a writer, I want every Issue to show exactly what is missing to reach the next status, so that I always know the next keystroke.
32. As a writer, I want to attach Ideas to an Issue and see them beside the solution box, so that my own loose thoughts are at hand when planning.
33. As a writer, I want to see the room's suggestions beside the solution box and adopt one with credit, so that a giver's idea can become my plan without losing who said it.

### Nudges
34. As a writer, I want, right after first saving a description, a step asking *"Could this be a symptom of something deeper?"* with a picker over existing Issues (roots first, then severity), a "new deeper issue" inline creator, "no — this is a root", and "decide later", so that the deeper-cause question is asked at the moment I have just articulated the cause.
35. As a writer, I want "decide later" to leave the Issue un-Assessed and count as a Skip, so that skipping is possible but visible.
36. As a writer, I want a nudge when I mark a Logic/Scene/Dialogue-severity issue (≤ 3) as a root — *"sure nothing's underneath?"* — so that shallow roots get a second look.
37. As a writer, I want a nudge when one Giver has three or more root Issues in a Draft — *"are they one problem?"* — with a multi-select to create a deeper issue causing all of them, so that a pattern in one person's feedback is caught. Once per giver per draft.
38. As a writer, I want a nudge when I set a root Issue with symptoms to no-action — *"its N symptoms will stay"* — so that I see what I'm leaving.
39. As a writer, I want Skips stored per Issue and cleared when I later answer, so that only what is *still* skipped at End Turn is reported.
40. As a writer, I want no live counter of skips, so that nudges feel like prompts and not a score.

### Action Order & encounters
41. As a writer, I want Issues ordered topologically by cause (roots first), then Needs Action first, then fewer causes, then higher severity, so that seminal issues are always on top.
42. As a writer, I want the order to be unmovable by hand, so that the only way to move an issue is to change its tags or cause links.
43. As a writer, I want an order rail on the left (numbered, roots starred, symptoms indented, status dot), so that I see the whole campaign while working one thing.
44. As a writer, I want one Issue in focus in the centre — header, status, level (severity), tags, needs-action, "symptom of", the solution editor, a "what's missing" line, and a primary button — so that I work one Encounter at a time.
45. As a writer, I want a *Who's next? →* button that jumps to the next unplanned Issue in order, so that working top-down is a single keystroke.
46. As a writer, I want the right pane to show a boss's minions with status, or a symptom's causes (clickable), plus suggestions and ideas, so that context is beside the editor.
47. As a writer, I want saving a root Issue's solution to open a cascade prompt, one minion at a time, asking whether that solution also covers it — *Nope, still standing* / *Winged it* / *Down — mark covered* — so that surface issues fall with the fundamentals only when I say so.
48. As a writer, I want "Down" to auto-fill the minion's solution as *"Covered by [boss]"* and make it Planned, so that dissolved symptoms need no typing.
49. As a writer, I want "Winged it" to keep the link and leave the minion unplanned, so that partial coverage is recorded but not mistaken for done.
50. As a writer, I want a full-screen **BOSS DOWN** card when all minions are answered, listing what fell (or *"Minions survived. Rude."*), so that clearing a root feels like something.
51. As a writer, I want minions that survive to remain in the order as their own encounters, so that nothing is lost.

### Audience & affinity
52. As a writer, I want an always-visible Audience strip showing every Giver's face by rank, an animated interest bar, planned/total count, and a one-line mood, so that I see everyone's interest changing all the time.
53. As a writer, I want Affinity to mean how far a Giver has come around to the project — *Walked out → Unconvinced → Watching → Nodding → Loves it* — so that it plays on the real dynamic of close friends who disagree with this draft.
54. As a writer, I want a Giver to start at *Unconvinced* on their first item and rise as their items' Issues reach Planned (no-action counts), so that honoring a perspective is what moves them.
55. As a writer, I want unaccounted items to cap a Giver's rank, and a draft ending with any of their items unaccounted to drop them to *Walked out*, so that ignoring someone has a cost.
56. As a writer, I want rank to persist across Drafts while the bar resets each Draft, so that every draft is a fresh chance to win someone over.
57. As a writer, I want a full-screen **INTEREST RISING** card on rank-up showing the quote that got them there, so that the moment is tied to what they said.
58. As a writer, I want a Giver profile panel (rank, hearts, progress to next rank, every item by draft with the Issues it produced and their status), so that I can see one person's whole contribution.

### Meters, grade, end turn
59. As a writer, I want four live meters — Accounted, Assessed, Planned, Bosses cleared — so that coverage is honest and visible.
60. As a writer, I want progress to come only from completed thinking (accounting, status transitions, bosses cleared, drafts ended), never from choosing yes vs no, dismissing nudges, tag count, or issue count, so that the game cannot be gamed.
61. As a writer, I want to End Turn whenever I choose, even with unplanned Issues, so that perfectionism never blocks writing.
62. As a writer, I want End Turn to export the Action Plan, freeze the Draft, and show a campaign summary — grade (S/A/B/C), meters, bosses cleared, affinity changes, nudges still skipped, unplanned issues named — so that I leave with a brief and an honest scorecard.
63. As a writer, I want the grade to take the hit for unplanned issues and skipped nudges, so that the score reflects the thinking done.
64. As a writer, I want to reopen a frozen Draft, so that typos and late thoughts are fixable; the export goes stale and the grade recomputes at the next End Turn.
65. As a writer, I want toasts, full-screen cards, and short chimes (rank-up, boss down, end turn), sound on by default with one toggle, so that it's fun without being a costume.

### Revive
66. As a writer, I want a "pull from previous draft" picker over *all* previous-draft Issues, so that I choose what still stands.
67. As a writer, I want a suggestion when I create an Issue whose title resembles a previous-draft Issue — *"Draft 2 had '…' — same thing?"* — so that reviving is cheap without being automatic.
68. As a writer, I want a revived Issue to inherit title, description, thoughts, references, tags, and cause links to other revived Issues, so that I don't retype.
69. As a writer, I want the previous draft's plan pinned as a note (and its reason-not-acting if it was no-action), not reused as the solution, so that each draft plans afresh with memory.
70. As a writer, I want badges *Came back* (ancestor was solved) and *Still bothers them* (ancestor was no-action) that show only and never force re-assessment, so that regressions are visible but the decision stays mine.

### Ideas
71. As a writer, I want a project-level Ideas page for loose thoughts that outlive drafts, so that "bring Alan back" survives three drafts.
72. As a writer, I want to add an Idea inline from an Issue (auto-linked), so that ideas are captured where they occur.
73. As a writer, I want adopting an Idea into a solution to mark it *used in Draft N* and dim it, so that I know what I ever did with it.

### Export, backup, storage
74. As a writer, I want a per-draft Action Plan Markdown file — bosses with nested minions in Action Order, giver quotes on every issue, "Covered by" lines, a *Left alone, on purpose* section (would-solution + why not), an *Unplanned* section — so that I have a writing brief I can also share with the room.
75. As a writer, I want a one-file JSON backup of everything and a replace-all restore with a count confirmation, so that browser storage eviction cannot lose my work.
76. As a writer, I want a banner after 7 days without backup and a prominent Download backup on the End Turn summary, so that I am nagged at the right moments only.
77. As a writer, I want a per-issue Obsidian Markdown export (zip, V3-style frontmatter, plus `Ideas.md`), so that a project can land back in a vault.
78. As a writer, I want the app to ask the browser for persistent storage after my first real action, so that eviction is less likely.

### Onboarding
79. As a new user, I want the app to open with a deletable sample project, *Smoke Love Repeat* (Akhil and Rithu; they die), with 2 bosses, ~5 minions, 3 givers at different ranks, so that I see the whole loop before entering anything.
80. As a new user, I want a skippable tour over the sample — log → extract → plan a boss → cascade → BOSS DOWN → a face changes → End turn — so that I learn by doing the game once.
81. As a new user, I want a one-screen "How this works" page with the philosophy, shown once and reachable from the header, so that I know why the tool nudges the way it does.
82. As a writer, I want the tab title, backup filename, and copy to say **Gagan Achari**, so that it has a name.

## Implementation Decisions

### Architecture — one seam
- **Domain core**: pure functions over plain data; no DOM, no storage. Owns every rule: severity, derived status, "what's missing", Action Order, cycle detection, cascade application, affinity, meters, grade, nudge triggers, Skip bookkeeping, revive inheritance, similar-title matching, Action Plan / Obsidian text generation, backup serialization. This is the sole tested seam.
- **Storage adapter**: IndexedDB via the `idb` wrapper; `navigator.storage.persist()` requested after the first user mutation; DB name `gagan-achari`. Working copy only. (From storage research.)
- **UI**: a small component layer rendering the two locked prototypes' layouts. Preferred stack: TypeScript + Vite + Preact (tiny, JSX, no build ceremony). Sound via Web Audio, three short synthesized chimes; no asset files.
- **Hosting**: static, Cloudflare Pages or GitHub Pages. No server, no env.
- No AI, no network calls at runtime beyond loading the page.

### Data model (glossary terms)
- **Account** → Projects[] → Drafts[] (ordered; at most one unfrozen) ; Givers[] and Ideas[] belong to the Project.
- **Feedback Session**: date, giverIds[], items[].
- **Feedback Item**: giverId, kind `reaction | suggestion`, text, issueIds[].
- **Issue**: title, description, thoughts, references[{url,label}], tags[], `causedBy[]` xor `isRoot`, needsAction `undecided|yes|no`, assessment {canBeAddressed, whyDiverges}, solution, reasonNotActing, coveredBy?, partialOf?, cascadeAnswers{bossId→full|partial|no}, skips[{nudge,at}], ancestorId?, ideaIds[], adoptedSuggestions[{itemId, giverId}].
- **Idea**: text, issueIds[], usedInDraft?.
- **Giver affinity**: derived; stored only as `lastRank` per giver per project for rank-up detection.
- Tag weights per project, defaulting to Theme 9, Tone 8, Character 7, Arc 6, Structure 5, Exposition 4, Logic 3, Scene 2, Dialogue 1; sub-tags inherit.

### Rules (from the tickets; prototype snippets where they encode it best)
- **Severity** = `max(weights) + (tags.length − 1)`; 0 if untagged.
- **Status**: Raw (title only) → Captured (description) → Assessed (≥1 tag ∧ (isRoot ∨ causedBy.length) ∧ needsAction≠undecided ∧ canBeAddressed) → Planned (solution ∧ (needsAction≠no ∨ (reasonNotActing ∧ whyDiverges))).
- **Action Order** — from the campaign prototype, matching the writer's Dataview:
  ```
  indeg = causedBy.length per issue; ready = issues with indeg 0
  loop: sort ready by (needsAction==="yes" desc, causedBy.length asc, severity desc); pop; emit;
        decrement indeg of issues caused by it; push newly-zero
  ```
  Cycles cannot exist (blocked at entry), so the loop always drains.
- **Cycle check**: adding `A causedBy B` is refused if B reaches A through causedBy; UI offers to flip.
- **Cascade**: on saving a root's solution, queue = its minions without an answer for this boss; answer `full` → minion.solution = "Covered by “<boss>”", coveredBy = boss; `partial` → partialOf = boss; `no` → nothing. Boss cleared ⇔ solution ∧ every minion answered.
- **Affinity**: rank 0 if any of the giver's items in the current draft is unaccounted at End Turn; else `1 + floor(3·planned/total)`, capped at 4, where planned = items whose every linked issue is Planned; rank persists (max over drafts); interest bar = planned/total for the current draft.
- **Meters**: accounted/total items; assessed+/total issues; planned/total; bossesCleared/roots.
- **Grade** at End Turn: S = all planned, no skips; A ≥ 90% planned; B ≥ 70%; C otherwise; one letter down if any nudge still skipped or any giver walked out.
- **Nudges** N1–N6 as specified in the nudge ticket; N3 threshold severity ≤ 3; N4 threshold 3 roots per giver per draft.
- **Revive**: copies title/description/thoughts/references/tags; rewires causedBy to revived siblings; pins previous solution (+reasonNotActing) as a read-only note; sets ancestorId; badge derives from ancestor's needsAction/solution. Similar-title = case-insensitive token overlap ≥ 0.6 against previous draft titles.
- **End Turn**: freeze draft, compute grade, store summary, trigger export. **Reopen**: unfreeze, mark export stale.
- **Exports**: Action Plan Markdown per the export ticket's layout; JSON backup `{schemaVersion, exportedAt, account}`; Obsidian zip with V3 frontmatter (`Speaker`, `Quote`, `issueTag`, `Caused by` wikilinks, `Needsaction`, `Status`) and `Ideas.md`. All via `<a download>`.
- **Backup nag**: banner when `lastBackupAt` older than 7 days or never and there is ≥1 non-sample project.

### Screens
1. **Projects** (list, create, delete; sample project flagged).
2. **Draft home**: sessions list, meters, Start next draft, End turn, Pull from previous draft.
3. **Session — Inbox** (capture prototype B): feed left with sticky add bar; issue panel right with always-visible New issue, quote, link checklist; extract drawer with N1/N2/N3.
4. **Campaign — Encounter** (campaign prototype B): Audience strip; order rail; focus; context; cascade modal; BOSS DOWN and INTEREST RISING cards; giver profile slide-over.
5. **Ideas** page.
6. **End Turn summary**.
7. **How this works** page; first-run tour overlay.
8. Settings: sound toggle, tag weights, backup/restore, exports.

## Testing Decisions

- A good test drives the **domain core** through its public functions with plain data and asserts on returned data — never on DOM, storage, or internal helpers. Fixtures use the writer's real V3 graph (13 issues, 4 roots, 2 known former cycles) and the *Smoke Love Repeat* sample.
- Tested: severity; status derivation and "what's missing"; Action Order against the Dataview reference ordering on the V3 fixture; cycle refusal and flip; cascade application and boss-cleared; affinity ranks including the walked-out drop and persistence; meters and grade; each nudge trigger (N2–N6) and Skip clearing; revive inheritance, rewiring, badges, similar-title matching; Action Plan text for a draft with bosses, covered minions, no-action and unplanned issues; backup round-trip (serialize → parse → deep-equal).
- Not tested: UI rendering, IndexedDB, sound, animations, tour.
- Runner: Vitest. Prior art: none in this repo (greenfield); the two prototypes contain the reference implementations of Action Order and cascade to port from.

## Out of Scope

- Feedback givers using the tool in any way (submission surface, accounts, sharing links).
- Audio capture or transcription; any AI assistance (hard no).
- Mobile or phone capture layout; the app is desktop-only.
- Hosted backend, sync, multi-device.
- Importing the Obsidian V3 vault; merge-on-restore.
- Generic (non-screenplay) taxonomy.
- The cause-map view (prototype variant C) — a possible later secondary view.
- Manual severity override; drag reordering.

## Further Notes

- Tone: plain, quiet UI; unserious copy in every status line, button, and card (*"Unarmed. Write a plan."*, *"Swing at the boss"*, *"Minions survived. Rude."*). Campaign vocabulary appears only where the writer reads; the data model uses glossary terms.
- The two prototypes in `prototypes/` are the layout reference and contain working Action Order, cascade, and affinity code written under prototype constraints — port the logic into the domain core with tests; do not ship the prototype files.
- First real use after build: the writer re-enters the Shaji V3 project by hand. Expect that to surface capture-flow friction; treat it as the acceptance test for the Inbox.
- Sample content voice: *Smoke Love Repeat* is silly on purpose; its fake quotes should teach reaction-vs-suggestion by example.
