import { describe, it, expect } from "vitest";
import { severity, status, missing } from "../src/domain/issue";
import { emptyIssue, DEFAULT_TAG_WEIGHTS } from "../src/domain/types";

const W = DEFAULT_TAG_WEIGHTS;
const mk = (p: Partial<ReturnType<typeof emptyIssue>>) => ({ ...emptyIssue("d1", "t"), ...p });

describe("severity", () => {
  it("is 0 when untagged", () => { expect(severity(mk({}), W)).toBe(0); });
  it("is max weight + 1 per extra tag", () => {
    expect(severity(mk({ tags: ["Theme"] }), W)).toBe(9);
    expect(severity(mk({ tags: ["Logic", "Scene"] }), W)).toBe(4);
    expect(severity(mk({ tags: ["Theme","Character","Character/Dynamics","Exposition","Logic","Structure","Tone"] }), W)).toBe(15);
  });
});

describe("status", () => {
  it("Raw with only a title", () => { expect(status(mk({}))).toBe("Raw"); });
  it("Captured with a description", () => { expect(status(mk({ description: "x" }))).toBe("Captured"); });
  it("Assessed needs tag + root/cause + needsAction + canBeAddressed", () => {
    const base = { description: "x", tags: ["Theme"], isRoot: true, needsAction: "yes" as const, canBeAddressed: "yes" };
    expect(status(mk(base))).toBe("Assessed");
    expect(status(mk({ ...base, tags: [] }))).toBe("Captured");
    expect(status(mk({ ...base, isRoot: false }))).toBe("Captured");
    expect(status(mk({ ...base, isRoot: false, causedBy: ["z"] }))).toBe("Assessed");
    expect(status(mk({ ...base, needsAction: "undecided" }))).toBe("Captured");
    expect(status(mk({ ...base, canBeAddressed: "" }))).toBe("Captured");
  });
  it("Planned needs a solution; no-action also needs reason + whyDiverges", () => {
    const base = { description: "x", tags: ["Theme"], isRoot: true, needsAction: "yes" as const, canBeAddressed: "yes", solution: "do it" };
    expect(status(mk(base))).toBe("Planned");
    const no = { ...base, needsAction: "no" as const };
    expect(status(mk(no))).toBe("Assessed");
    expect(status(mk({ ...no, reasonNotActing: "r" }))).toBe("Assessed");
    expect(status(mk({ ...no, reasonNotActing: "r", whyDiverges: "w" }))).toBe("Planned");
  });
});

describe("missing", () => {
  it("lists keys needed for the next status", () => {
    expect(missing(mk({}))).toEqual(["description"]);
    expect(missing(mk({ description: "x" }))).toEqual(["tags","cause","needsAction","canBeAddressed"]);
    expect(missing(mk({ description: "x", tags: ["Theme"], isRoot: true, needsAction: "no", canBeAddressed: "y" }))).toEqual(["solution","reasonNotActing","whyDiverges"]);
    expect(missing(mk({ description: "x", tags: ["Theme"], isRoot: true, needsAction: "yes", canBeAddressed: "y", solution: "s" }))).toEqual([]);
  });
});
