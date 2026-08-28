import { Issue, NudgeId, Project, now } from "./types";
import { severity, status } from "./issue";
import { draftIssues, minions, wouldCycle } from "./graph";

const conditions = (p: Project, draftId: string, i: Issue): Record<NudgeId, boolean> => {
  const issues = draftIssues(p, draftId);
  return {
    N2: status(i) !== "Raw" && !i.isRoot && i.causedBy.length === 0,
    N3: i.isRoot && i.tags.length > 0 && severity(i, p.tagWeights) <= 3,
    N6: i.isRoot && i.needsAction === "no" && minions(issues, i.id).length > 0,
  };
};

export function pendingNudges(p: Project, draftId: string, i: Issue): NudgeId[] {
  const c = conditions(p, draftId, i);
  return (["N2","N3","N6"] as NudgeId[]).filter(n => c[n] && !i.skips.some(s => s.nudge === n));
}

export function skip(i: Issue, nudge: NudgeId): void {
  if (!i.skips.some(s => s.nudge === nudge)) i.skips.push({ nudge, at: now() });
}

export function reconcileSkips(i: Issue, p: Project, draftId: string): void {
  const c = conditions(p, draftId, i);
  i.skips = i.skips.filter(s => c[s.nudge]);
}

export function giverPatternNudges(p: Project, draftId: string): { giverId: string; issueIds: string[] }[] {
  const draft = p.drafts.find(d => d.id === draftId)!;
  const byId = new Map(p.issues.map(i => [i.id, i]));
  return p.givers.filter(g => !draft.dismissedN4.includes(g.id)).map(g => {
    const ids = new Set<string>();
    for (const it of p.items.filter(it => it.draftId === draftId && it.giverId === g.id)) for (const id of it.issueIds) if (byId.get(id)?.isRoot) ids.add(id);
    return { giverId: g.id, issueIds: [...ids] };
  }).filter(x => x.issueIds.length >= 3);
}

export function deeperCausePicker(p: Project, draftId: string, forIssueId: string): Issue[] {
  const issues = draftIssues(p, draftId);
  return issues.filter(i => i.id !== forIssueId && !wouldCycle(issues, forIssueId, i.id))
    .sort((a, b) => Number(b.isRoot) - Number(a.isRoot) || severity(b, p.tagWeights) - severity(a, p.tagWeights));
}
