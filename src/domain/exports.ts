import { Account, Draft, Issue, Project } from "./types";
import { actionOrder, draftIssues, minions, roots } from "./graph";
import { missing, status } from "./issue";
import { grade, meters } from "./affinity";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const actionPlanFilename = (p: Project, d: Draft) => `${slug(p.name)}-draft${d.number}-action-plan.md`;
export const backupFilename = (date: Date) => `gagan-achari-backup-${date.toISOString().slice(0, 10)}.json`;

function raisedBy(p: Project, i: Issue): string {
  const quotes = p.items.filter(it => it.issueIds.includes(i.id)).map(it => `${p.givers.find(g => g.id === it.giverId)?.name ?? "?"}: “${it.text}”`);
  return quotes.length ? `raised by ${quotes.join(" · ")}\n` : "";
}

export function actionPlanMarkdown(p: Project, draftId: string): string {
  const d = p.drafts.find(x => x.id === draftId)!; const issues = draftIssues(p, draftId);
  const order = actionOrder(issues, p.tagWeights); const m = meters(p, draftId);
  const out: string[] = [`# ${p.name} — Draft ${d.number} action plan`, `${new Date().toISOString().slice(0, 10)} · grade ${grade(p, draftId)} · planned ${m.planned}/${m.issues} · bosses ${m.bossesCleared}/${m.roots}`, ""];
  const done = new Set<string>();
  const body = (i: Issue) => i.coveredBy ? `Covered by ${issues.find(x => x.id === i.coveredBy)!.title}` : i.solution;
  const actionable = (i: Issue) => i.needsAction !== "no" && status(i) === "Planned";
  for (const i of order) {
    if (done.has(i.id) || !actionable(i)) continue;
    if (i.isRoot) {
      out.push(`## ${i.title}`, raisedBy(p, i) + i.solution, "");
      for (const mn of order.filter(x => x.causedBy.includes(i.id))) { if (done.has(mn.id) || !actionable(mn)) continue; out.push(`### ${mn.title}`, raisedBy(p, mn) + body(mn), ""); done.add(mn.id); }
    } else out.push(`### ${i.title}`, raisedBy(p, i) + body(i), "");
    done.add(i.id);
  }
  const left = order.filter(i => i.needsAction === "no" && status(i) === "Planned");
  if (left.length) { out.push("## Left alone, on purpose", ""); for (const i of left) out.push(`### ${i.title}`, raisedBy(p, i) + `Would have: ${i.solution}\nWhy not: ${i.reasonNotActing}`, ""); }
  const un = order.filter(i => status(i) !== "Planned");
  if (un.length) { out.push("## Unplanned", ""); for (const i of un) out.push(`- ${i.title} — ${missing(i).join(", ")}`); out.push(""); }
  return out.join("\n");
}

export function obsidianFiles(p: Project): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  const byId = new Map(p.issues.map(i => [i.id, i]));
  for (const d of p.drafts) for (const i of draftIssues(p, d.id)) {
    const first = p.items.find(it => it.issueIds.includes(i.id));
    const fm = [
      "---",
      `Speaker: ${first ? p.givers.find(g => g.id === first.giverId)?.name ?? "" : ""}`,
      `Quote: ${first ? JSON.stringify(first.text) : ""}`,
      "issueTag:", ...i.tags.map(t => `  - "#ScreenplayIssue/${t}"`),
      "Caused by:", ...i.causedBy.map(c => `  - "[[${byId.get(c)?.title ?? c}]]"`),
      `Needsaction: ${i.needsAction === "no" ? "false" : "true"}`,
      `Status: ${status(i)}`,
      "---",
    ];
    const body = ["### Describe the issue", i.description, "", "### Thoughts", i.thoughts, "", "### Solution", i.solution, i.needsAction === "no" ? `\nReason not acting: ${i.reasonNotActing}` : ""];
    files.push({ path: `Draft ${d.number}/${i.title.replace(/[\\/:*?"<>|]/g, "-")}.md`, content: [...fm, ...body].join("\n") });
  }
  files.push({ path: "Ideas.md", content: p.ideas.map(id => `- ${id.text}${id.issueIds.length ? " → " + id.issueIds.map(x => `[[${byId.get(x)?.title ?? x}]]`).join(", ") : ""}${id.usedInDraft ? ` (used in Draft ${id.usedInDraft})` : ""}`).join("\n") });
  return files;
}

export const serializeBackup = (a: Account) => JSON.stringify({ schemaVersion: a.schemaVersion, exportedAt: new Date().toISOString(), account: a }, null, 2);
export function parseBackup(text: string): Account {
  const j = JSON.parse(text);
  if (j?.schemaVersion !== 1 || !j.account || !Array.isArray(j.account.projects)) throw new Error("Not a Gagan Achari backup (schema 1)");
  return j.account as Account;
}
export const backupCounts = (a: Account) => ({ projects: a.projects.length, issues: a.projects.reduce((n, p) => n + p.issues.length, 0), items: a.projects.reduce((n, p) => n + p.items.length, 0) });
