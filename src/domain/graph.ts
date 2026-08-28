import { Issue, Project } from "./types";
import { severity } from "./issue";

export const draftIssues = (p: Project, draftId: string): Issue[] => p.issues.filter(i => i.draftId === draftId);
export const roots = (issues: Issue[]): Issue[] => issues.filter(i => i.isRoot);
export const minions = (issues: Issue[], bossId: string): Issue[] => issues.filter(i => i.causedBy.includes(bossId));

/** Would adding `fromId causedBy toId` close a cycle? True if toId already reaches fromId via causedBy. */
export function wouldCycle(issues: Issue[], fromId: string, toId: string): boolean {
  if (fromId === toId) return true;
  const byId = new Map(issues.map(i => [i.id, i]));
  const seen = new Set<string>(); const stack = [toId];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur === fromId) return true;
    if (seen.has(cur)) continue; seen.add(cur);
    for (const c of byId.get(cur)?.causedBy ?? []) stack.push(c);
  }
  return false;
}

/** Topological by causedBy (roots first); ready items sorted needsAction=yes first, fewer causes, higher severity. Ported from the campaign prototype / Dataview. */
export function actionOrder(issues: Issue[], weights: Record<string, number>): Issue[] {
  const ids = new Set(issues.map(i => i.id));
  const indeg = new Map(issues.map(i => [i.id, i.causedBy.filter(c => ids.has(c)).length]));
  const cmp = (a: Issue, b: Issue) =>
    Number(b.needsAction === "yes") - Number(a.needsAction === "yes") ||
    a.causedBy.length - b.causedBy.length ||
    severity(b, weights) - severity(a, weights) ||
    a.createdAt.localeCompare(b.createdAt);
  const out: Issue[] = []; let ready = issues.filter(i => indeg.get(i.id) === 0);
  while (ready.length) {
    ready.sort(cmp); const n = ready.shift()!; out.push(n);
    for (const x of issues) if (x.causedBy.includes(n.id)) { indeg.set(x.id, indeg.get(x.id)! - 1); if (indeg.get(x.id) === 0) ready.push(x); }
  }
  // Defensive: cycles are refused at entry, but never drop data if one sneaks in via restore.
  for (const i of issues) if (!out.includes(i)) out.push(i);
  return out;
}
