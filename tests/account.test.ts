import { describe, it, expect } from "vitest";
import * as A from "../src/domain/account";
import { emptyAccount } from "../src/domain/types";
import { status } from "../src/domain/issue";

function setup() {
  const acc = emptyAccount(); const p = A.createProject(acc, "Shaji"); const d = A.startDraft(p);
  const g = A.addGiver(p, "Rohan"); const s = A.createSession(p, d.id, "2025-07-25", [g.id]);
  return { acc, p, d, g, s };
}

describe("capture", () => {
  it("adds items and extracts issues linked to them", () => {
    const { p, d, g, s } = setup();
    const it = A.addItem(p, s.id, g.id, "reaction", "Everyone is a protagonist");
    const iss = A.createIssue(p, d.id, "Perspective", it.id);
    expect(it.issueIds).toEqual([iss.id]); expect(iss.draftId).toBe(d.id);
    A.unlinkItem(p, it.id, iss.id); expect(it.issueIds).toEqual([]);
    A.linkItem(p, it.id, iss.id); A.linkItem(p, it.id, iss.id); expect(it.issueIds).toEqual([iss.id]);
  });
});

describe("causes", () => {
  it("refuses cycles and reports which issue to flip", () => {
    const { p, d } = setup();
    const a = A.createIssue(p, d.id, "A"), b = A.createIssue(p, d.id, "B");
    expect(A.setCausedBy(p, a.id, [b.id])).toEqual({});
    expect(A.setCausedBy(p, b.id, [a.id])).toEqual({ refused: a.id });
    expect(b.causedBy).toEqual([]);
    A.setRoot(p, b.id); expect(b.isRoot).toBe(true); expect(b.causedBy).toEqual([]);
    A.setCausedBy(p, b.id, []); // still root
    expect(b.isRoot).toBe(true);
  });
  it("createDeeperIssue links the given issues as its symptoms", () => {
    const { p, d } = setup();
    const a = A.createIssue(p, d.id, "A"), b = A.createIssue(p, d.id, "B");
    const deep = A.createDeeperIssue(p, d.id, "Deep", [a.id, b.id]);
    expect(a.causedBy).toEqual([deep.id]); expect(b.causedBy).toEqual([deep.id]); expect(status(deep)).toBe("Raw");
  });
});

describe("suggestions and ideas", () => {
  it("adopting a suggestion appends credited text; using an idea marks it", () => {
    const { p, d, g, s } = setup();
    const it = A.addItem(p, s.id, g.id, "suggestion", "Bring back the fools");
    const iss = A.createIssue(p, d.id, "Myth", it.id);
    A.adoptSuggestion(p, iss.id, it.id);
    expect(iss.solution).toBe("Bring back the fools — adopted from Rohan"); expect(iss.adoptedSuggestions).toEqual([{ itemId: it.id, giverId: g.id }]);
    const idea = A.addIdea(p, "Alan returns", iss.id); expect(idea.issueIds).toEqual([iss.id]); expect(iss.ideaIds).toEqual([idea.id]);
    A.useIdea(p, idea.id, iss.id); expect(idea.usedInDraft).toBe(1); expect(iss.solution).toContain("Alan returns");
  });
});

describe("end turn / reopen", () => {
  it("freezes, stores a summary, updates lastRank; reopen unfreezes and marks export stale", () => {
    const { p, d, g, s } = setup();
    const it = A.addItem(p, s.id, g.id, "reaction", "q");
    const iss = A.createIssue(p, d.id, "X", it.id);
    Object.assign(iss, { description: "d", tags: ["Theme"], isRoot: true, needsAction: "yes", canBeAddressed: "y", solution: "s" });
    const sum = A.endTurn(p, d.id);
    expect(d.frozen).toBe(true); expect(sum.grade).toBe("S"); expect(p.lastRank[g.id]).toBe(4); expect(sum.rankChanges).toEqual([{ giverId: g.id, from: 1, to: 4 }]);
    A.reopenDraft(p, d.id); expect(d.frozen).toBe(false); expect(d.exportStale).toBe(true);
  });
  it("walked-out givers get rank 0 at end turn", () => {
    const { p, d, g, s } = setup(); A.addItem(p, s.id, g.id, "reaction", "ignored");
    const sum = A.endTurn(p, d.id); expect(p.lastRank[g.id]).toBe(0); expect(sum.walkedOut).toEqual([g.id]);
  });
  it("startDraft numbers sequentially and refuses while one is unfrozen", () => {
    const { p, d } = setup(); expect(() => A.startDraft(p)).toThrow();
    A.endTurn(p, d.id); expect(A.startDraft(p).number).toBe(2);
  });
});
