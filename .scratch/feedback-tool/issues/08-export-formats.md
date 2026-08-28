# Export and backup formats
Type: grilling
Status: resolved
Blocked by: 01, 06

## Question

Lock the exports: Action Plan markdown shape (mirror `V3 changes.md`: one heading per issue in Action Order, solution body, covered-by lines?), full-project JSON backup/restore, optional per-issue markdown export Obsidian-compatible with the V3 frontmatter, and the backup nag rule (after N changes? on end-turn?).

## Answer

Resolved 2026-08-28 by grilling.

### Action Plan (markdown, one file per draft)
Reference: the writer's `V3 changes.md`. Filename `<project>-draft<N>-action-plan.md`. Readable top-down as the writing brief, and **shareable with the givers** — every issue shows who raised it and their quote(s), so each opinion visibly landed somewhere.

```
# <Project> — Draft <N> action plan
<date> · grade <S/A/B/C> · planned x/y · bosses a/b

## <Boss title>                      ← root issues, Action Order
raised by Rohan: "…" · Hari: "…"
<solution>
### <Minion title>                   ← its symptoms, nested, order preserved
raised by …
Covered by <Boss title>              ← or its own solution / "Winged it" note
### <Standalone symptom>
…

## Left alone, on purpose            ← needsAction = no
### <title> — raised by …
Would have: <solution>
Why not: <reasonNotActing>

## Unplanned                         ← anything not Planned at export
- <title> — <what's missing>
```

### Backup / restore (JSON)
One file, whole account, versioned schema. Filename `<app>-backup-<date>.json`. **Restore = replace-all**, with a confirm showing counts. Merge is not v1. Restore is required — browser storage is evictable (see storage research).

### Backup nag
Banner after 7 days without a backup; End-turn summary carries a prominent **Download backup**. No edit-count nagging.

### Per-issue Obsidian export (kept)
Zip of one markdown file per issue with the V3 frontmatter shape (`Speaker`, `Quote`, `issueTag`, `Caused by` as `[[wikilinks]]`, `Needsaction`, `Status`) plus body sections (description, thoughts, solution). Lets a project land back in an Obsidian vault. Export only — no Obsidian *import*.

### Mechanics
All exports are browser downloads (`<a download>`); no folder picker.
