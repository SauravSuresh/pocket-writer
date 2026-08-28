import { Issue, Status, weightOf } from "./types";

export function severity(i: Issue, weights: Record<string, number>): number {
  if (!i.tags.length) return 0;
  return Math.max(...i.tags.map(t => weightOf(t, weights))) + (i.tags.length - 1);
}

const assessed = (i: Issue) => i.tags.length > 0 && (i.isRoot || i.causedBy.length > 0) && i.needsAction !== "undecided" && i.canBeAddressed.trim() !== "";
const planned = (i: Issue) => i.solution.trim() !== "" && (i.needsAction !== "no" || (i.reasonNotActing.trim() !== "" && i.whyDiverges.trim() !== ""));

export function status(i: Issue): Status {
  if (i.description.trim() === "") return "Raw";
  if (i.coveredBy) return "Planned";
  if (!assessed(i)) return "Captured";
  if (!planned(i)) return "Assessed";
  return "Planned";
}

export function missing(i: Issue): string[] {
  const s = status(i);
  if (s === "Raw") return ["description"];
  if (s === "Captured") {
    const m: string[] = [];
    if (!i.tags.length) m.push("tags");
    if (!i.isRoot && !i.causedBy.length) m.push("cause");
    if (i.needsAction === "undecided") m.push("needsAction");
    if (!i.canBeAddressed.trim()) m.push("canBeAddressed");
    return m;
  }
  if (s === "Assessed") {
    const m: string[] = [];
    if (!i.solution.trim()) m.push("solution");
    if (i.needsAction === "no" && !i.reasonNotActing.trim()) m.push("reasonNotActing");
    if (i.needsAction === "no" && !i.whyDiverges.trim()) m.push("whyDiverges");
    return m;
  }
  return [];
}
