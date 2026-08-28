import { describe, it, expect } from "vitest";
import { actionPlanMarkdown, obsidianFiles, serializeBackup, parseBackup, backupCounts, actionPlanFilename, backupFilename } from "../src/domain/exports";
import { Project, DEFAULT_TAG_WEIGHTS, emptyAccount } from "../src/domain/types";
import { answerCascade } from "../src/domain/cascade";
import { V3 } from "./fixtures/v3";

function proj(): Project {
  const p: Project = { id: "p", name: "Shaji", isSample: false, createdAt: "", tagWeights: DEFAULT_TAG_WEIGHTS, lastRank: {},
    givers: [{ id: "g1", name: "Rohan" }, { id: "g2", name: "Akhil" }],
    drafts: [{ id: "d2", number: 2, frozen: false, createdAt: "", dismissedN4: [] }], sessions: [], ideas: [{ id: "i", text: "Bring Alan back", issueIds: ["2"] }],
    items: [
      { id: "it1", sessionId: "s", draftId: "d2", giverId: "g1", kind: "reaction", text: "Everyone is a protagonist", issueIds: ["5"] },
      { id: "it2", sessionId: "s", draftId: "d2", giverId: "g2", kind: "reaction", text: "Tone shift abrupt", issueIds: ["9"] },
    ],
    issues: V3.map(i => ({ ...i, causedBy: [...i.causedBy], cascadeAnswers: {} })) };
  const b3 = p.issues.find(i => i.id === "3")!; b3.solution = "We laugh at identity.";
  answerCascade(p.issues, "3", "9", "full");
  const i13 = p.issues.find(i => i.id === "13")!; i13.solution = "Add exposition about the election."; i13.reasonNotActing = "It's explained enough."; i13.whyDiverges = "Slows the open.";
  const i5 = p.issues.find(i => i.id === "5")!; i5.solution = "Strict perspective in anecdotes.";
  return p;
}

describe("actionPlanMarkdown", () => {
  const md = actionPlanMarkdown(proj(), "d2");
  it("has a header with grade and meters", () => { expect(md).toMatch(/^# Shaji — Draft 2 action plan\n/); expect(md).toMatch(/grade [SABC] · planned \d+\/\d+ · bosses \d+\/\d+/); });
  it("renders bosses as ## with nested ### minions, quotes, and Covered by", () => {
    expect(md).toContain("## What are we laughing at in this film");
    expect(md).toContain("### Bobbing heads\nraised by Akhil: “Tone shift abrupt”\nCovered by “What are we laughing at in this film”");
    expect(md).toContain("### Perspective and who is this story about\nraised by Rohan: “Everyone is a protagonist”\nStrict perspective in anecdotes.");
  });
  it("has Left alone and Unplanned sections", () => {
    expect(md).toContain("## Left alone, on purpose\n\n### Risk in simon being seen with shaji\nWould have: Add exposition about the election.\nWhy not: It's explained enough.");
    expect(md).toContain("## Unplanned\n"); expect(md).toContain("- Lack of Focused setup — solution");
  });
  it("filenames", () => {
    expect(actionPlanFilename(proj(), proj().drafts[0])).toBe("shaji-draft2-action-plan.md");
    expect(backupFilename(new Date("2026-08-28T10:00:00Z"))).toBe("pocket-writer-backup-2026-08-28.json");
  });
});

describe("obsidianFiles", () => {
  it("one file per issue with V3 frontmatter, plus Ideas.md", () => {
    const files = obsidianFiles(proj());
    const f = files.find(f => f.path === "Draft 2/Bobbing heads.md")!;
    expect(f.content).toContain('Speaker: Akhil\nQuote: "Tone shift abrupt"\nissueTag:\n  - "#ScreenplayIssue/Tone"');
    expect(f.content).toContain('Caused by:\n  - "[[What are we laughing at in this film]]"');
    expect(f.content).toContain("Needsaction: true\nStatus: Planned");
    expect(files.find(f => f.path === "Ideas.md")!.content).toContain("- Bring Alan back → [[Lack of Focused setup]]");
  });
});

describe("backup", () => {
  it("round-trips and counts", () => {
    const acc = emptyAccount(); acc.projects.push(proj());
    const text = serializeBackup(acc); const back = parseBackup(text);
    expect(back).toEqual(acc); expect(backupCounts(acc)).toEqual({ projects: 1, issues: 13, items: 2 });
    expect(() => parseBackup('{"schemaVersion":99}')).toThrow();
  });
});
