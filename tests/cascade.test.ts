import { describe, it, expect } from "vitest";
import { cascadeQueue, answerCascade, bossCleared } from "../src/domain/cascade";
import { status, missing } from "../src/domain/issue";
import { emptyIssue } from "../src/domain/types";
import { V3 } from "./fixtures/v3";

const clone = () => V3.map(i => ({ ...i, causedBy: [...i.causedBy], cascadeAnswers: {} as Record<string, "full"|"partial"|"no"> }));

describe("cascade", () => {
  it("queues unanswered minions of a boss", () => {
    const iss = clone(); expect(cascadeQueue(iss, "3").map(i => i.id)).toEqual(["9","10"]);
  });
  it("full: fills 'Covered by' and plans the minion", () => {
    const iss = clone(); const boss = iss.find(i => i.id === "3")!; boss.solution = "We laugh at identity.";
    answerCascade(iss, "3", "9", "full");
    const m = iss.find(i => i.id === "9")!;
    expect(m.solution).toBe("Covered by “What are we laughing at in this film”");
    expect(m.coveredBy).toBe("3"); expect(status(m)).toBe("Planned");
    expect(cascadeQueue(iss, "3").map(i => i.id)).toEqual(["10"]);
  });
  it("partial: links but leaves unplanned; no: leaves untouched", () => {
    const iss = clone();
    answerCascade(iss, "3", "9", "partial"); answerCascade(iss, "3", "10", "no");
    expect(iss.find(i => i.id === "9")!.partialOf).toBe("3");
    expect(iss.find(i => i.id === "9")!.solution).toBe("");
    expect(iss.find(i => i.id === "10")!.cascadeAnswers["3"]).toBe("no");
  });
  it("full then partial on the same boss clears coveredBy and drops out of Planned", () => {
    const iss = clone(); const boss = iss.find(i => i.id === "3")!; boss.solution = "We laugh at identity.";
    const m = iss.find(i => i.id === "9")!;
    answerCascade(iss, "3", "9", "full");
    expect(m.coveredBy).toBe("3"); expect(status(m)).toBe("Planned");
    answerCascade(iss, "3", "9", "partial");
    expect(m.coveredBy).toBeUndefined();
    expect(status(m)).not.toBe("Planned");
  });
  it("boss is cleared only when planned and every minion answered", () => {
    const iss = clone(); const boss = iss.find(i => i.id === "3")!;
    expect(bossCleared(iss, boss)).toBe(false);
    boss.solution = "s"; expect(bossCleared(iss, boss)).toBe(false);
    answerCascade(iss, "3", "9", "no"); answerCascade(iss, "3", "10", "full");
    expect(bossCleared(iss, boss)).toBe(true);
  });
  it("a fresh, un-assessed minion answered 'full' is Planned with nothing missing", () => {
    const iss = clone();
    const m = { ...emptyIssue("d2", "Fresh"), id: "m", description: "x", causedBy: ["3"] };
    iss.push(m);
    answerCascade(iss, "3", "m", "full");
    expect(status(m)).toBe("Planned");
    expect(missing(m)).toEqual([]);
  });
  it("a fresh, un-assessed minion answered 'no' stays Captured", () => {
    const iss = clone();
    const m = { ...emptyIssue("d2", "Fresh"), id: "m", description: "x", causedBy: ["3"] };
    iss.push(m);
    answerCascade(iss, "3", "m", "no");
    expect(status(m)).toBe("Captured");
  });
});
