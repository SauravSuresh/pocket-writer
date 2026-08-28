import { Draft, Issue, Project, emptyIssue } from "./types";
import { draftIssues } from "./graph";

export function previousDraft(p: Project, draftId: string): Draft | undefined {
  const sorted = [...p.drafts].sort((a, b) => a.number - b.number);
  const idx = sorted.findIndex(d => d.id === draftId);
  return idx > 0 ? sorted[idx - 1] : undefined;
}

const tokens = (s: string) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2));
const jaccard = (a: Set<string>, b: Set<string>) => { const inter = [...a].filter(x => b.has(x)).length; const uni = new Set([...a, ...b]).size; return uni ? inter / uni : 0; };

export function similarTitles(p: Project, draftId: string, title: string): Issue[] {
  const prev = previousDraft(p, draftId); if (!prev) return [];
  const t = tokens(title); if (!t.size) return [];
  return draftIssues(p, prev.id).filter(i => jaccard(t, tokens(i.title)) >= 0.6);
}

export function reviveIssues(p: Project, fromDraftId: string, toDraftId: string, ids: string[]): Issue[] {
  const from = p.drafts.find(d => d.id === fromDraftId)!;
  const olds = ids.map(id => p.issues.find(i => i.id === id && i.draftId === fromDraftId)!).filter(Boolean);
  const map = new Map<string, Issue>();
  for (const o of olds) {
    const n = emptyIssue(toDraftId, o.title);
    n.description = o.description; n.thoughts = o.thoughts; n.references = o.references.map(r => ({ ...r })); n.tags = [...o.tags];
    n.ancestorId = o.id;
    let note = o.solution ? `Draft ${from.number} plan: ${o.solution}` : "";
    if (o.needsAction === "no" && o.reasonNotActing) note += `${note ? "\n" : ""}Why not, then: ${o.reasonNotActing}`;
    n.pinnedNote = note || undefined;
    map.set(o.id, n);
  }
  for (const o of olds) {
    const n = map.get(o.id)!;
    n.causedBy = o.causedBy.filter(c => map.has(c)).map(c => map.get(c)!.id);
    n.isRoot = o.isRoot;
  }
  const out = olds.map(o => map.get(o.id)!);
  p.issues.push(...out);
  return out;
}

export function badge(p: Project, i: Issue): "cameBack" | "stillBothers" | null {
  if (!i.ancestorId) return null;
  const a = p.issues.find(x => x.id === i.ancestorId); if (!a) return null;
  if (a.needsAction === "no") return "stillBothers";
  if (a.solution.trim()) return "cameBack";
  return null;
}
