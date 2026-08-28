import { describe, it, expect } from "vitest";
import { wouldCycle, actionOrder, minions, roots } from "../src/domain/graph";
import { DEFAULT_TAG_WEIGHTS } from "../src/domain/types";
import { V3 } from "./fixtures/v3";

describe("wouldCycle", () => {
  it("refuses a direct loop", () => { expect(wouldCycle(V3, "2", "5")).toBe(true); });   // 5 is caused by 2; 2 caused by 5 would loop
  it("refuses an indirect loop", () => { expect(wouldCycle(V3, "2", "6")).toBe(true); }); // 6 ← 5 ← 2
  it("allows a fresh edge", () => { expect(wouldCycle(V3, "13", "4")).toBe(false); });
  it("refuses self", () => { expect(wouldCycle(V3, "1", "1")).toBe(true); });
});

describe("actionOrder", () => {
  const order = actionOrder(V3, DEFAULT_TAG_WEIGHTS).map(i => i.id);
  it("puts every root before any of its symptoms", () => {
    for (const i of V3) for (const c of i.causedBy) expect(order.indexOf(c)).toBeLessThan(order.indexOf(i.id));
  });
  it("among ready roots: needsAction first, then severity", () => {
    // roots 1(sev10,yes) 2(5,yes) 3(9,yes) 4(11,yes) 13(3,no) → 4,1,3,2 then 13 last of the roots
    expect(order.slice(0, 4)).toEqual(["4","1","3","2"]);
    expect(order.indexOf("13")).toBeGreaterThan(order.indexOf("2"));
  });
  it("emits every issue exactly once", () => { expect([...new Set(order)].length).toBe(V3.length); });
});

describe("minions / roots", () => {
  it("lists direct symptoms", () => { expect(minions(V3, "3").map(i => i.id)).toEqual(["9","10"]); });
  it("lists explicit roots only", () => { expect(roots(V3).map(i => i.id)).toEqual(["1","2","3","4","13"]); });
});
