import { Account, Draft, EndTurnSummary, FeedbackItem, Giver, Idea, Issue, Kind, Project, Session, DEFAULT_TAG_WEIGHTS, emptyIssue, newId, now } from "./types";
import { draftIssues, wouldCycle } from "./graph";
import { affinity, grade, meters, skippedIssues, walkedOut } from "./affinity";
import { reconcileSkips } from "./nudges";
import { status } from "./issue";

const find = <T extends { id: string }>(xs: T[], id: string): T => { const x = xs.find(y => y.id === id); if (!x) throw new Error(`missing ${id}`); return x; };

export function createProject(acc: Account, name: string, isSample = false): Project {
  const p: Project = { id: newId(), name, isSample, createdAt: now(), tagWeights: { ...DEFAULT_TAG_WEIGHTS }, givers: [], drafts: [], sessions: [], items: [], issues: [], ideas: [], lastRank: {} };
  acc.projects.push(p); return p;
}
export function deleteProject(acc: Account, id: string): void { acc.projects = acc.projects.filter(p => p.id !== id); }

export function startDraft(p: Project): Draft {
  if (p.drafts.some(d => !d.frozen)) throw new Error("End the current turn first");
  const d: Draft = { id: newId(), number: p.drafts.length + 1, frozen: false, createdAt: now(), dismissedN4: [] };
  p.drafts.push(d); return d;
}
export function addGiver(p: Project, name: string): Giver { const g = { id: newId(), name: name.trim() }; p.givers.push(g); return g; }
export function createSession(p: Project, draftId: string, date: string, giverIds: string[]): Session { const s = { id: newId(), draftId, date, giverIds }; p.sessions.push(s); return s; }
export function addItem(p: Project, sessionId: string, giverId: string, kind: Kind, text: string): FeedbackItem {
  const s = find(p.sessions, sessionId);
  const it: FeedbackItem = { id: newId(), sessionId, draftId: s.draftId, giverId, kind, text: text.trim(), issueIds: [] }; p.items.push(it); return it;
}
export function createIssue(p: Project, draftId: string, title: string, fromItemId?: string): Issue {
  const i = emptyIssue(draftId, title.trim()); p.issues.push(i);
  if (fromItemId) linkItem(p, fromItemId, i.id);
  return i;
}
export function linkItem(p: Project, itemId: string, issueId: string): void { const it = find(p.items, itemId); if (!it.issueIds.includes(issueId)) it.issueIds.push(issueId); }
export function unlinkItem(p: Project, itemId: string, issueId: string): void { const it = find(p.items, itemId); it.issueIds = it.issueIds.filter(x => x !== issueId); }
export function deleteItem(p: Project, itemId: string): void { p.items = p.items.filter(i => i.id !== itemId); }

export function setCausedBy(p: Project, issueId: string, causeIds: string[]): { refused?: string } {
  const i = find(p.issues, issueId); const issues = draftIssues(p, i.draftId);
  for (const c of causeIds) if (!i.causedBy.includes(c) && wouldCycle(issues, issueId, c)) return { refused: c };
  i.causedBy = [...new Set(causeIds)];
  if (i.causedBy.length) i.isRoot = false;
  touch(p, i); return {};
}
export function setRoot(p: Project, issueId: string): void { const i = find(p.issues, issueId); i.isRoot = true; i.causedBy = []; touch(p, i); }
export function createDeeperIssue(p: Project, draftId: string, title: string, forIssueIds: string[]): Issue {
  const deep = createIssue(p, draftId, title);
  for (const id of forIssueIds) { const i = find(p.issues, id); i.isRoot = false; if (!i.causedBy.includes(deep.id)) i.causedBy.push(deep.id); touch(p, i); }
  return deep;
}
export function touch(p: Project, i: Issue): void { reconcileSkips(i, p, i.draftId); }

const append = (s: string, add: string) => (s.trim() ? s.trimEnd() + "\n" : "") + add;
export function adoptSuggestion(p: Project, issueId: string, itemId: string): void {
  const i = find(p.issues, issueId), it = find(p.items, itemId); const g = find(p.givers, it.giverId);
  i.solution = append(i.solution, `${it.text} — adopted from ${g.name}`);
  if (!i.adoptedSuggestions.some(a => a.itemId === itemId)) i.adoptedSuggestions.push({ itemId, giverId: g.id });
}
export function addIdea(p: Project, text: string, issueId?: string): Idea {
  const idea: Idea = { id: newId(), text: text.trim(), issueIds: issueId ? [issueId] : [] }; p.ideas.push(idea);
  if (issueId) find(p.issues, issueId).ideaIds.push(idea.id);
  return idea;
}
export function useIdea(p: Project, ideaId: string, issueId: string): void {
  const idea = find(p.ideas, ideaId), i = find(p.issues, issueId); const d = find(p.drafts, i.draftId);
  i.solution = append(i.solution, idea.text); idea.usedInDraft = d.number;
  if (!idea.issueIds.includes(issueId)) idea.issueIds.push(issueId);
  if (!i.ideaIds.includes(ideaId)) i.ideaIds.push(ideaId);
}

export function endTurn(p: Project, draftId: string): EndTurnSummary {
  const d = find(p.drafts, draftId); const m = meters(p, draftId);
  const wo = walkedOut(p, draftId);
  const rankChanges: EndTurnSummary["rankChanges"] = [];
  for (const g of p.givers) {
    const from = p.lastRank[g.id] ?? 1;
    const to = wo.includes(g.id) ? 0 : Math.max(from, affinity(p, draftId, g.id).rank);
    if (to !== from || !(g.id in p.lastRank)) rankChanges.push({ giverId: g.id, from, to });
    p.lastRank[g.id] = to;
  }
  const summary: EndTurnSummary = { grade: grade(p, draftId), planned: m.planned, total: m.issues, bossesCleared: m.bossesCleared, roots: m.roots,
    skipped: skippedIssues(p, draftId).map(i => i.id), unplanned: draftIssues(p, draftId).filter(i => status(i) !== "Planned").map(i => i.id), walkedOut: wo, rankChanges, at: now() };
  d.frozen = true; d.summary = summary; d.exportStale = false; return summary;
}
export function reopenDraft(p: Project, draftId: string): void { const d = find(p.drafts, draftId); d.frozen = false; d.exportStale = true; }
