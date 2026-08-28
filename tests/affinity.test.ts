import { describe, it, expect } from "vitest";
import { affinity, meters, grade } from "../src/domain/affinity";
import { Project, emptyIssue, DEFAULT_TAG_WEIGHTS } from "../src/domain/types";

function proj(): Project {
  const planned = { ...emptyIssue("d1", "P"), id: "p", description: "x", tags: ["Theme"], isRoot: true, needsAction: "yes" as const, canBeAddressed: "y", solution: "s" };
  const open = { ...emptyIssue("d1", "O"), id: "o", description: "x", tags: ["Scene"], isRoot: true, needsAction: "yes" as const, canBeAddressed: "y" };
  return { id: "pr", name: "t", isSample: false, createdAt: "", tagWeights: DEFAULT_TAG_WEIGHTS, lastRank: {},
    givers: [{ id: "g", name: "Rohan" }], drafts: [{ id: "d1", number: 1, frozen: false, createdAt: "", dismissedN4: [] }], sessions: [],
    items: [
      { id: "i1", sessionId: "s", draftId: "d1", giverId: "g", kind: "reaction", text: "a", issueIds: ["p"] },
      { id: "i2", sessionId: "s", draftId: "d1", giverId: "g", kind: "reaction", text: "b", issueIds: ["o"] },
      { id: "i3", sessionId: "s", draftId: "d1", giverId: "g", kind: "reaction", text: "c", issueIds: [] },
    ], issues: [planned, open], ideas: [] };
}

describe("affinity", () => {
  it("counts planned items and caps at Nodding while anything is unaccounted", () => {
    const a = affinity(proj(), "d1", "g");
    expect(a).toMatchObject({ planned: 1, total: 3, unaccounted: 1 }); expect(a.rank).toBe(2); // 1+floor(3*1/3)=2
  });
  it("reaches Loves it only when all planned and all accounted", () => {
    const p = proj(); p.items[2].issueIds = ["p"]; p.issues[1].solution = "s";
    expect(affinity(p, "d1", "g").rank).toBe(4);
  });
  it("never drops below lastRank during a draft; walked-out climbs back", () => {
    const p = proj(); p.lastRank.g = 3; expect(affinity(p, "d1", "g").rank).toBe(3);
    p.lastRank.g = 0; expect(affinity(p, "d1", "g").rank).toBe(2);
  });
  it("a giver with no items in this draft keeps lastRank, default Unconvinced", () => {
    const p = proj(); p.items = []; expect(affinity(p, "d1", "g").rank).toBe(1);
    p.lastRank.g = 4; expect(affinity(p, "d1", "g").rank).toBe(4);
  });
});

describe("meters & grade", () => {
  it("meters", () => {
    expect(meters(proj(), "d1")).toEqual({ accounted: 2, items: 3, assessed: 2, planned: 1, issues: 2, bossesCleared: 1, roots: 2 });
  });
  it("grade: S only when all planned & no skips; letter down for skips or walk-outs", () => {
    const p = proj(); expect(grade(p, "d1")).toBe("C");           // 50% planned
    p.issues[1].solution = "s"; expect(grade(p, "d1")).toBe("A");   // all planned but i3 unaccounted → Rohan walks out → S down to A
    p.items[2].issueIds = ["p"]; expect(grade(p, "d1")).toBe("S");
    p.issues[1].skips.push({ nudge: "N3", at: "" }); expect(grade(p, "d1")).toBe("A");
  });
});
