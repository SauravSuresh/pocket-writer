import { CascadeAnswer, Issue } from "./types";
import { minions } from "./graph";
import { status } from "./issue";

export const cascadeQueue = (issues: Issue[], bossId: string): Issue[] => minions(issues, bossId).filter(m => !m.cascadeAnswers[bossId]);

export function answerCascade(issues: Issue[], bossId: string, minionId: string, answer: CascadeAnswer): void {
  const boss = issues.find(i => i.id === bossId)!; const m = issues.find(i => i.id === minionId)!;
  m.cascadeAnswers[bossId] = answer;
  if (answer === "full") { m.solution = `Covered by “${boss.title}”`; m.coveredBy = bossId; m.partialOf = undefined; }
  if (answer === "partial") { m.partialOf = bossId; if (m.coveredBy === bossId) { m.coveredBy = undefined; m.solution = ""; } }
  if (answer === "no") { if (m.coveredBy === bossId) { m.coveredBy = undefined; m.solution = ""; } if (m.partialOf === bossId) m.partialOf = undefined; }
}

export const bossCleared = (issues: Issue[], boss: Issue): boolean =>
  status(boss) === "Planned" && minions(issues, boss.id).every(m => !!m.cascadeAnswers[boss.id]);
