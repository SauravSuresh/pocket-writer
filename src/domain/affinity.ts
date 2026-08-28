import { Grade, Project } from "./types";
import { status } from "./issue";
import { draftIssues, roots } from "./graph";
import { bossCleared } from "./cascade";

export interface Affinity { rank: number; planned: number; total: number; interest: number; unaccounted: number }

export function affinity(p: Project, draftId: string, giverId: string): Affinity {
  const byId = new Map(p.issues.map(i => [i.id, i]));
  const items = p.items.filter(it => it.draftId === draftId && it.giverId === giverId);
  const total = items.length;
  const unaccounted = items.filter(it => it.issueIds.length === 0).length;
  const planned = items.filter(it => it.issueIds.length > 0 && it.issueIds.every(id => status(byId.get(id)!) === "Planned")).length;
  const last = p.lastRank[giverId];
  let computed = total === 0 ? (last ?? 1) : 1 + Math.floor(3 * planned / total);
  computed = Math.min(computed, unaccounted > 0 ? 3 : 4);
  const rank = Math.max(last ?? 0, computed);
  return { rank, planned, total, interest: total ? planned / total : 0, unaccounted };
}

export function meters(p: Project, draftId: string) {
  const items = p.items.filter(it => it.draftId === draftId);
  const issues = draftIssues(p, draftId);
  const st = issues.map(status);
  return {
    accounted: items.filter(it => it.issueIds.length > 0).length, items: items.length,
    assessed: st.filter(s => s === "Assessed" || s === "Planned").length,
    planned: st.filter(s => s === "Planned").length, issues: issues.length,
    bossesCleared: roots(issues).filter(b => bossCleared(issues, b)).length, roots: roots(issues).length,
  };
}

export const walkedOut = (p: Project, draftId: string): string[] =>
  p.givers.filter(g => affinity(p, draftId, g.id).unaccounted > 0).map(g => g.id);

export const skippedIssues = (p: Project, draftId: string) => draftIssues(p, draftId).filter(i => i.skips.length > 0);

export function grade(p: Project, draftId: string): Grade {
  const m = meters(p, draftId);
  const frac = m.issues === 0 ? 1 : m.planned / m.issues;
  const skips = skippedIssues(p, draftId).length;
  let g: Grade = frac === 1 ? "S" : frac >= 0.9 ? "A" : frac >= 0.7 ? "B" : "C";
  if (skips > 0 || walkedOut(p, draftId).length > 0) g = ({ S: "A", A: "B", B: "C", C: "C" } as const)[g];
  return g;
}
