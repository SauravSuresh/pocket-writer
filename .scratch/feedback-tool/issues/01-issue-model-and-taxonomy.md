# Issue model, template, and tag taxonomy
Type: grilling
Status: resolved
Blocked by: —

## Question

Lock the Issue record and the taxonomy:
- Final field list on an Issue (title; "what in the screenplay causes this"; tags; caused-by; needs-action; would-solution; solution; scene ref?; links to feedback items; links to ideas).
- The template questions: keep the five from V3 as-is, drop/merge any (the "previous draft" pair becomes automatic once carry-forward exists — do they stay as prompts?).
- Tag vocabulary: Tags.md lists 8, the dataviewjs weights 9 (Exposition present only in code). Fix the canonical list, sub-tags, and weights.
- Severity override: allowed with a stated reason, or tag-derived only?
- Exact derived-status rule (which fields gate Raw → Captured → Assessed → Planned).
- Caused-by cycle handling at entry time (block and ask "which is more fundamental?").

## Answer

Resolved 2026-08-28 by grilling.

### Issue record
| field | notes |
|---|---|
| `title` | the issue, one line ("Anto does not have agency") |
| `description` | what in the screenplay produces the feedback. Placeholder text carries the nudge: *"What in the screenplay makes them say this?"* Mandatory to leave Raw. |
| `thoughts` | free writing, never gated |
| `references[]` | URL + optional label (articles, videos) |
| `tags[]` | ≥1 required for Assessed |
| `causedBy[]` / `isRoot` | links to deeper issues, or an explicit root click. Unset = Assessment incomplete. Absence of links is never treated as root. |
| `needsAction` | undecided / yes / no |
| `assessment.canBeAddressed` | short prose |
| `assessment.whyDiverges` | short prose, shown and required only when needsAction = no: *"Why would fixing this diverge from the film you want?"* |
| `solution` | one box: what you will do, or (no-action) what you *would* do |
| `reasonNotActing` | required when needsAction = no |
| links | `feedbackItems[]`, `ideas[]`, `adoptedSuggestions[]` |

Dropped: `sceneRef` (unused in all 52 V3 notes), severity override (tags are the only lever; ordering stays honest), the two "previous draft" template questions (derived from carry-forward links).

### Template questions
Five in V3 → two prose fields. "Needs addressing?" became `needsAction`; "deeper issue?" became the `causedBy` picker; the previous-draft pair is derived.

### Tags & weights (canonical)
Theme 9, Tone 8, Character 7, Arc 6, Structure 5, Exposition 4, Logic 3, Scene 2, Dialogue 1. Sub-tags: Character/Dynamics, Logic/Emotional, Logic/Physical, Arc/Relationship — inherit parent weight, add nothing. Weights editable per project.

**Severity = max(tag weights) + 1 per additional tag.** Sum was rejected: a 7-tag craft note (`Writing style too descriptive`, severity 41 under sum) outranked every Theme issue.

### Derived status
- Raw: title only
- Captured: `description` filled
- Assessed: ≥1 tag, `causedBy` decided (links or root), `needsAction` ≠ undecided, `canBeAddressed` filled
- Planned: `solution` filled; plus `reasonNotActing` and `whyDiverges` when needsAction = no

### Cycles
Adding a `causedBy` link that closes a cycle is blocked: "X caused by Y and Y caused by X — which is more fundamental?" with a one-click flip. V3 had two such loops; both were one issue under two names.
