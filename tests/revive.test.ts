import { describe, it, expect } from "vitest";
import { similarTitles, reviveIssues, badge, previousDraft } from "../src/domain/revive";
import { Project, DEFAULT_TAG_WEIGHTS } from "../src/domain/types";
import { V3 } from "./fixtures/v3";

const proj = (): Project => ({ id: "p", name: "t", isSample: false, createdAt: "", tagWeights: DEFAULT_TAG_WEIGHTS, lastRank: {}, givers: [], sessions: [], items: [], ideas: [],
  drafts: [{ id: "d2", number: 2, frozen: true, createdAt: "1", dismissedN4: [] }, { id: "d3", number: 3, frozen: false, createdAt: "2", dismissedN4: [] }],
  issues: V3.map(i => ({ ...i, causedBy: [...i.causedBy] })) });

describe("previousDraft", () => {
  it("is the draft before the given one", () => { expect(previousDraft(proj(), "d3")!.id).toBe("d2"); expect(previousDraft(proj(), "d2")).toBeUndefined(); });
});

describe("similarTitles", () => {
  it("matches previous-draft titles by token overlap", () => {
    expect(similarTitles(proj(), "d3", "the anto problem").map(i => i.id)).toEqual(["6"]);
    expect(similarTitles(proj(), "d3", "ghosts problem the").map(i => i.id)).toEqual(["4"]);
    expect(similarTitles(proj(), "d3", "completely unrelated")).toEqual([]);
  });
});

describe("reviveIssues", () => {
  it("copies text and tags, rewires causes only to revived siblings, pins the old plan, links ancestor", () => {
    const p = proj();
    const old6 = p.issues.find(i => i.id === "6")!; old6.solution = "Give Anto agency."; old6.needsAction = "yes";
    const old8 = p.issues.find(i => i.id === "8")!; old8.solution = "would prune"; old8.reasonNotActing = "depth is the point"; old8.whyDiverges = "w";
    const revived = reviveIssues(p, "d2", "d3", ["5","6","8"]);
    expect(revived.map(r => r.title)).toEqual(["Perspective and who is this story about","The anto problem","Too many characters"]);
    const r5 = revived[0], r6 = revived[1], r8 = revived[2];
    expect(r6.draftId).toBe("d3"); expect(r6.ancestorId).toBe("6"); expect(r6.solution).toBe("");
    expect(r6.causedBy).toEqual([r5.id]);          // "2" was not revived → dropped
    expect(r6.pinnedNote).toBe("Draft 2 plan: Give Anto agency.");
    expect(r8.pinnedNote).toBe("Draft 2 plan: would prune\nWhy not, then: depth is the point");
    expect(r5.isRoot).toBe(false); expect(r5.causedBy).toEqual([]);   // its cause "2" gone → needs re-deciding
    expect(p.issues.filter(i => i.draftId === "d3").length).toBe(3);
  });
  it("badges derive from the ancestor", () => {
    const p = proj();
    p.issues.find(i => i.id === "6")!.solution = "s";
    const [r6, r8] = reviveIssues(p, "d2", "d3", ["6","8"]);
    expect(badge(p, r6)).toBe("cameBack"); expect(badge(p, r8)).toBe("stillBothers");
    expect(badge(p, p.issues.find(i => i.id === "1")!)).toBeNull();
  });
});
