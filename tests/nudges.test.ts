import { describe, it, expect } from "vitest";
import { pendingNudges, skip, reconcileSkips, giverPatternNudges, deeperCausePicker } from "../src/domain/nudges";
import { Project, emptyIssue, DEFAULT_TAG_WEIGHTS } from "../src/domain/types";
import { V3 } from "./fixtures/v3";

const proj = (): Project => ({ id: "p", name: "t", isSample: false, createdAt: "", tagWeights: DEFAULT_TAG_WEIGHTS, lastRank: {},
  givers: [{ id: "g", name: "Rohan" }], drafts: [{ id: "d2", number: 2, frozen: false, createdAt: "", dismissedN4: [] }], sessions: [], items: [], ideas: [],
  issues: V3.map(i => ({ ...i, skips: [] })) });

describe("pendingNudges", () => {
  it("N2 when captured, not root, no causes", () => {
    const p = proj(); const i = { ...emptyIssue("d2", "x"), description: "d" };
    expect(pendingNudges(p, "d2", i)).toEqual(["N2"]);
    skip(i, "N2"); expect(pendingNudges(p, "d2", i)).toEqual([]);
    i.causedBy = ["2"]; reconcileSkips(i, p, "d2"); expect(i.skips).toEqual([]);
  });
  it("N3 for a shallow root", () => {
    const p = proj(); const i = { ...emptyIssue("d2", "x"), description: "d", isRoot: true, tags: ["Dialogue"] };
    expect(pendingNudges(p, "d2", i)).toEqual(["N3"]);
    i.tags = ["Structure"]; expect(pendingNudges(p, "d2", i)).toEqual([]);
  });
  it("N6 for a no-action root with symptoms", () => {
    const p = proj(); const boss = p.issues.find(i => i.id === "3")!; boss.needsAction = "no";
    expect(pendingNudges(p, "d2", boss)).toEqual(["N6"]);
    skip(boss, "N6"); boss.needsAction = "yes"; reconcileSkips(boss, p, "d2"); expect(boss.skips).toEqual([]);
  });
});

describe("giverPatternNudges", () => {
  it("fires at three roots from one giver, once", () => {
    const p = proj();
    p.items = ["1","2","3"].map(id => ({ id: "it" + id, sessionId: "s", draftId: "d2", giverId: "g", kind: "reaction" as const, text: "q", issueIds: [id] }));
    expect(giverPatternNudges(p, "d2")).toEqual([{ giverId: "g", issueIds: ["1","2","3"] }]);
    p.drafts[0].dismissedN4.push("g"); expect(giverPatternNudges(p, "d2")).toEqual([]);
  });
});

describe("deeperCausePicker", () => {
  it("lists other issues, roots first then severity, excluding self and anything that would cycle", () => {
    const p = proj(); const ids = deeperCausePicker(p, "d2", "5").map(i => i.id);
    expect(ids[0]).toBe("4"); expect(ids).not.toContain("5"); expect(ids).not.toContain("6"); // 6 is caused by 5
  });
});
