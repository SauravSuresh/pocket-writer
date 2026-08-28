import { describe, it, expect } from "vitest";
import { installSample } from "../src/domain/sample";
import { emptyAccount } from "../src/domain/types";
import { roots, minions, draftIssues } from "../src/domain/graph";
import { affinity } from "../src/domain/affinity";

describe("sample", () => {
  it("installs Smoke Love Repeat once, with 2 bosses, ≥5 minions, 3 givers at different ranks", () => {
    const acc = emptyAccount(); const p = installSample(acc); installSample(acc);
    expect(acc.projects.length).toBe(1); expect(p.name).toBe("Smoke Love Repeat"); expect(p.isSample).toBe(true);
    const d = p.drafts[0]; const issues = draftIssues(p, d.id);
    expect(roots(issues).length).toBe(2);
    expect(roots(issues).reduce((n, b) => n + minions(issues, b.id).length, 0)).toBeGreaterThanOrEqual(5);
    expect(p.givers.length).toBe(3);
    const ranks = p.givers.map(g => affinity(p, d.id, g.id).rank);
    expect(new Set(ranks).size).toBe(3);
    expect(p.items.some(i => i.kind === "suggestion")).toBe(true);
  });
});
