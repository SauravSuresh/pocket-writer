# Domain glossary — Gagan Achari (screenplay feedback tool)

Vocabulary agreed in the wayfinder session on 2026-08-28. Glossary only; no implementation.

- **Project** — one screenplay. Has many Drafts.
- **Draft** — one version of the screenplay that was read by givers. Feedback Sessions and Issues belong to a Draft. A Draft is one "turn" of the campaign.
- **Feedback Session** — one sitting where feedback was collected: date, Givers present, Feedback Items.
- **Giver** — a person who gave feedback. A name, no account. Givers never use the tool.
- **Feedback Item** — one thing a Giver said, verbatim or near. Kinds: *reaction* (an opinion/quote) or *suggestion* (a proposed fix). Suggestions are still feedback, never solutions. Text only.
- **Issue** — the writer's translation of a Feedback Item: the thing *in the screenplay* that provoked the reaction. One Feedback Item may yield many Issues; one Issue may be linked from many Items. The writer may also raise an Issue with no Feedback Item (their own observation).
- **Accounted** — a Feedback Item linked to at least one Issue. Unaccounted Items are perspectives not yet honored.
- **Tag** — an Issue category from the screenplay taxonomy (Theme, Tone, Character, Arc, Structure, Exposition, Logic, Scene, Dialogue, plus sub-tags). Each Tag has a weight.
- **Severity** — the highest of an Issue's Tag weights plus one per additional Tag. Derived; never overridden.
- **Caused by** — a directed link: this Issue is a symptom of that more fundamental Issue. Formerly "Blocked by" in the Obsidian system. Cycles are forbidden.
- **Root Issue** — an Issue the writer has explicitly marked as fundamental (not merely one without Caused-by links). "Boss" in campaign vocabulary.
- **Symptom Issue** — an Issue with at least one Caused-by link. "Minion" of its root(s).
- **Assessment** — the writer's structured take on an Issue: Tags, Caused-by or Root, Needs Action, and the prose answer to "can it be addressed?".
- **Description** — what in the screenplay produces the feedback. The first thing written on an Issue; the nudge "what in the screenplay makes them say this?" lives here.
- **Thoughts** — free writing on an Issue; never gates Status.
- **Reference** — an external link (article, video) attached to an Issue.
- **Needs Action** — the writer's decision to change the screenplay for this Issue or not. Always the writer's call.
- **Solution** — the writer's own planned change for an Issue. When Needs Action is no, it is the change the writer *would* make, paired with a Reason Not Acting and an answer to "why would fixing this diverge from the film you want?" — that exercise is the point. Suggestions may be adopted into a Solution, with credit to the Giver.
- **Covered by** — a Solution on a fundamental Issue that fully resolves a Symptom Issue; the symptom's Solution reads "covered by X". Decided by the writer when prompted, never assumed.
- **Status** — derived, never set by hand: Raw → Captured → Assessed → Planned. "What's missing to reach the next status" is always shown.
- **Action Order** — the enforced sequence of Issues: topological by Caused-by (roots first), then Needs Action first, then fewer causes, then higher Severity. Never hand-reordered; change Tags or links to move an Issue.
- **Action Plan** — the exported document of all Solutions in Action Order for a Draft, with the Givers and quotes behind each Issue and a "Left alone, on purpose" section for no-action Issues. The input to writing the next Draft; shareable with the Givers.
- **Backup** — a JSON file of the whole account; restoring it replaces everything.
- **Revive** — the writer bringing an Issue from a previous Draft into the current one, linked to its **Ancestor**. Never automatic. Enables "previous draft had / solved this" without asking.
- **Ancestor** — the previous-Draft Issue a revived Issue descends from.
- **Came back** — badge on a revived Issue whose Ancestor had a Solution.
- **Still bothers them** — badge on a revived Issue whose Ancestor was no-action.
- **Idea** — the writer's own loose thought, belonging to the Project, linkable to many Issues. Marked **used** when adopted into a Solution.
- **Nudge** — a prompt pushing the writer toward deeper causes (deeper-cause picker, rootless-and-shallow, same-giver pattern, root-left-alone). Dismissible; a dismissal is a **Skip**, stored on the Issue, cleared when the nudge is later answered, and reported only at End Turn.
- **Affinity** — how far a Giver has come around to believing in the project: Walked out → Unconvinced → Watching → Nodding → Loves it. Per Giver per Project; rises as Issues extracted from their Feedback Items reach Planned (no-action Issues count); capped by unaccounted Items; persists across Drafts.
- **Boss cleared** — a Root Issue is Planned and every Symptom's Covered-by prompt has been answered.
- **Campaign grade** — S/A/B/C for a Draft, computed at End Turn from the meters. Not cumulative.
- **End Turn** — exporting a Draft's Action Plan and freezing the Draft; shows the campaign summary. A frozen Draft can be **Reopened**. Starting the next Draft is a separate act.
- **Audience** — the strip of all Givers with their current Affinity, always visible while working the Action Order.
- **Encounter** — one Issue in focus in the Action Order; a Boss Fight when it is a Root Issue.
- **Campaign** — gamification frame: Draft = turn, Feedback Sessions = the wave, Root Issues = bosses, Symptoms = minions, exporting the Action Plan = ending the turn.
