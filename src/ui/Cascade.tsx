import { useEffect, useState } from "preact/hooks";
import { Project } from "../domain/types";
import { store } from "./store";
import { COPY } from "./copy";
import { answerCascade, cascadeQueue } from "../domain/cascade";
import { minions } from "../domain/graph";
import { severity } from "../domain/issue";
export function CascadeModal({ p, bossId, onDone }: { p: Project; bossId: string; onDone: (fell: string[]) => void }) {
  const issues = p.issues.filter(i => i.draftId === p.issues.find(x => x.id === bossId)!.draftId);
  const boss = issues.find(i => i.id === bossId)!; const [fell, setFell] = useState<string[]>([]);
  const q = cascadeQueue(issues, bossId); const total = minions(issues, bossId).length;
  useEffect(() => { if (!q.length) onDone(fell); }, [q.length]);
  if (!q.length) return null;
  const m = q[0];
  const answer = (a: "full" | "partial" | "no") => { store.update(() => answerCascade(p.issues, bossId, m.id, a)); if (a === "full") setFell([...fell, m.id]); };
  return <div class="overlay"><div class="modal">
    <div class="tag">{COPY.cascade.progress(total - q.length, total)}</div>
    <h3 style="margin:6px 0">{COPY.cascade.title}</h3>
    <div class="card" style="margin:10px 0"><b>{m.title}</b> <span class="lvl">Lv {severity(m, p.tagWeights)}</span><div class="tag">{m.tags.join(", ")}</div></div>
    <div class="quote">{boss.solution}</div>
    <div class="row" style="justify-content:flex-end"><button onClick={() => answer("no")}>{COPY.cascade.no}</button><button onClick={() => answer("partial")}>{COPY.cascade.partial}</button><button class="pri" onClick={() => answer("full")}>{COPY.cascade.full}</button></div>
  </div></div>;
}
