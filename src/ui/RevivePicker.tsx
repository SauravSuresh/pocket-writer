import { useState } from "preact/hooks";
import { Project } from "../domain/types";
import { store } from "./store";
import { draftIssues } from "../domain/graph";
import { previousDraft, reviveIssues } from "../domain/revive";
import { status } from "../domain/issue";
export function RevivePicker({ p, draftId, onClose }: { p: Project; draftId: string; onClose: () => void }) {
  const prev = previousDraft(p, draftId); const [sel, setSel] = useState<string[]>([]);
  if (!prev) return null;
  const already = new Set(draftIssues(p, draftId).map(i => i.ancestorId).filter(Boolean));
  const olds = draftIssues(p, prev.id).filter(i => !already.has(i.id));
  return <div class="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div class="modal">
    <h3 style="margin:0 0 8px">Pull from Draft {prev.number}</h3><div class="mut" style="font-size:13px">Tick what still stands. Nothing comes over on its own.</div>
    <div class="list" style="margin:10px 0">{olds.map(i => <label style="display:flex;gap:8px;padding:4px 0"><input type="checkbox" style="width:auto" checked={sel.includes(i.id)} onChange={e => setSel((e.target as HTMLInputElement).checked ? [...sel, i.id] : sel.filter(x => x !== i.id))} /> {i.isRoot ? "★ " : ""}{i.title} <span class="tag">{i.needsAction === "no" ? "left alone" : status(i)}</span></label>)}</div>
    <div class="row" style="justify-content:flex-end"><button onClick={onClose}>Cancel</button><button class="pri" disabled={!sel.length} onClick={() => { store.update(() => reviveIssues(p, prev.id, draftId, sel)); onClose(); }}>Revive {sel.length}</button></div>
  </div></div>;
}
