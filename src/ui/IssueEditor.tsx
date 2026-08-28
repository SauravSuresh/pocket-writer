import { useState } from "preact/hooks";
import { Issue, Project, TAGS, SUBTAGS } from "../domain/types";
import { store } from "./store";
import { COPY } from "./copy";
import { missing, severity, status } from "../domain/issue";
import { badge } from "../domain/revive";
import { pendingNudges, skip, deeperCausePicker } from "../domain/nudges";
import { minions } from "../domain/graph";
import { adoptSuggestion, addIdea, setCausedBy, setRoot, touch, useIdea } from "../domain/account";

export function IssueEditor({ p, issue, onSaved, frozen }: { p: Project; issue: Issue; onSaved: (kind: "boss" | "symptom") => void; frozen: boolean }) {
  const [draft, setDraft] = useState(issue.solution);
  const issues = p.issues.filter(i => i.draftId === issue.draftId);
  const st = status(issue); const miss = missing(issue); const b = badge(p, issue); const nudges = pendingNudges(p, issue.draftId, issue);
  const set = (fn: (i: Issue) => void) => { if (frozen) return; store.update(() => { fn(issue); touch(p, issue); }); };
  const suggestions = p.items.filter(it => it.kind === "suggestion" && it.issueIds.includes(issue.id));
  const ideas = p.ideas.filter(i => i.issueIds.includes(issue.id));
  const save = () => { if (!draft.trim()) return; set(i => { i.solution = draft.trim(); }); onSaved(issue.isRoot ? "boss" : "symptom"); };
  return <div>
    <div class="row" style="margin-bottom:6px;flex-wrap:wrap"><span class={`st ${st}`}>{st}</span><span class="lvl">Lv {severity(issue, p.tagWeights)}</span>
      {b && <span class="badge-rev">{COPY.badges[b]}</span>}
      {issue.partialOf && <span class="tag">· winged by “{issues.find(x => x.id === issue.partialOf)?.title}”</span>}</div>
    {issue.pinnedNote && <div class="pinned">{issue.pinnedNote}</div>}
    <textarea disabled={frozen} placeholder={COPY.placeholder.descriptionFor("them")} value={issue.description} onInput={e => set(i => { i.description = (e.target as HTMLTextAreaElement).value; })} style="min-height:60px" />
    <div class="row" style="margin:6px 0;flex-wrap:wrap">{[...TAGS, ...SUBTAGS].map(t => <label class="tag"><input disabled={frozen} type="checkbox" style="width:auto" checked={issue.tags.includes(t)} onChange={() => set(i => { i.tags = i.tags.includes(t) ? i.tags.filter(x => x !== t) : [...i.tags, t]; })} /> {t}</label>)}</div>
    <div class="row" style="flex-wrap:wrap;gap:12px">
      <label class="tag"><input disabled={frozen} type="radio" style="width:auto" checked={issue.isRoot} onChange={() => set(i => { setRoot(p, i.id); })} /> root</label>
      <label class="tag">symptom of <select disabled={frozen} style="width:auto" value="" onChange={e => { const v = (e.target as HTMLSelectElement).value; if (!v) return; store.update(() => { const r = setCausedBy(p, issue.id, [...issue.causedBy, v]); if (r.refused) { const other = issues.find(x => x.id === r.refused)!; if (confirm(`“${other.title}” is already caused by this one. Flip it — make “${issue.title}” the cause?`)) { setCausedBy(p, other.id, other.causedBy.filter(c => c !== issue.id)); setCausedBy(p, issue.id, [...issue.causedBy, v]); } } }); }}>
        <option value="">add…</option>{deeperCausePicker(p, issue.draftId, issue.id).map(c => <option value={c.id}>{c.isRoot ? "★ " : ""}{c.title}</option>)}</select></label>
      {issue.causedBy.map(c => <span class="issue-chip">{issues.find(x => x.id === c)?.title} {!frozen && <a href="#" onClick={e => { e.preventDefault(); set(i => { setCausedBy(p, i.id, i.causedBy.filter(x => x !== c)); }); }}>×</a>}</span>)}
      <label class="tag">needs action <select disabled={frozen} style="width:auto" value={issue.needsAction} onChange={e => set(i => { i.needsAction = (e.target as HTMLSelectElement).value as any; })}><option value="undecided">undecided</option><option value="yes">yes</option><option value="no">no</option></select></label>
    </div>
    <input disabled={frozen} style="margin-top:6px" placeholder="Can it be addressed? One line." value={issue.canBeAddressed} onInput={e => set(i => { i.canBeAddressed = (e.target as HTMLInputElement).value; })} />
    {nudges.includes("N3") && <div class="n2"><b>{COPY.n3(issue.tags.join("/"))}</b> <button class="sm" onClick={() => set(i => skip(i, "N3"))}>keep as root</button></div>}
    {nudges.includes("N6") && <div class="n2"><b>{COPY.n6(minions(issues, issue.id).length)}</b> <button class="sm" onClick={() => set(i => skip(i, "N6"))}>leave it</button></div>}
    <textarea disabled={frozen} style="margin-top:8px" placeholder={issue.needsAction === "no" ? COPY.placeholder.wouldSolution : COPY.placeholder.solution} value={draft} onInput={e => setDraft((e.target as HTMLTextAreaElement).value)} />
    {issue.needsAction === "no" && <>
      <input disabled={frozen} style="margin-top:6px" placeholder="Reason not acting" value={issue.reasonNotActing} onInput={e => set(i => { i.reasonNotActing = (e.target as HTMLInputElement).value; })} />
      <input disabled={frozen} style="margin-top:6px" placeholder={COPY.placeholder.whyDiverges} value={issue.whyDiverges} onInput={e => set(i => { i.whyDiverges = (e.target as HTMLInputElement).value; })} /></>}
    <div class="row" style="margin-top:8px"><span class="missing grow">{miss.map(m => COPY.missing[m]).join(" · ")}</span>{!frozen && <button class="pri" onClick={save}>{issue.isRoot ? COPY.encounter.swing : COPY.encounter.handle}</button>}</div>
    <h4 style="margin:12px 0 6px;font-size:13px">Suggestions from the room</h4>
    {suggestions.length ? suggestions.map(s => <div class="sugg"><div class="row"><span><b>{p.givers.find(g => g.id === s.giverId)?.name}</b> · {s.text}</span>{!frozen && <button class="sm" onClick={() => { store.update(() => adoptSuggestion(p, issue.id, s.id)); setDraft(issue.solution); }}>adopt</button>}</div></div>) : <div class="mut" style="font-size:13px">none</div>}
    <h4 style="margin:12px 0 6px;font-size:13px">Your ideas {!frozen && <button class="sm" onClick={() => { const t = prompt("Idea?"); if (t?.trim()) store.update(() => addIdea(p, t, issue.id)); }}>＋ idea</button>}</h4>
    {ideas.length ? ideas.map(i => <div class="idea" style={i.usedInDraft ? "opacity:.5" : ""}>{i.text} {!i.usedInDraft && !frozen && <button class="sm" onClick={() => { store.update(() => useIdea(p, i.id, issue.id)); setDraft(issue.solution); }}>use</button>}{i.usedInDraft && <span class="tag">used in Draft {i.usedInDraft}</span>}</div>) : <div class="mut" style="font-size:13px">none linked</div>}
    <textarea disabled={frozen} style="margin-top:10px;min-height:50px" placeholder="Thoughts (never gated)" value={issue.thoughts} onInput={e => set(i => { i.thoughts = (e.target as HTMLTextAreaElement).value; })} />
  </div>;
}
