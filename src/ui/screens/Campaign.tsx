import { useState } from "preact/hooks";
import { store, useStore } from "../store";
import { go } from "../router";
import { Header } from "../Header";
import { Meters } from "../Meters";
import { Audience } from "../Audience";
import { IssueEditor } from "../IssueEditor";
import { COPY } from "../copy";
import { actionOrder, draftIssues, minions } from "../../domain/graph";
import { status, severity } from "../../domain/issue";
import { createIssue, endTurn } from "../../domain/account";
export function Campaign({ pid, did }: { pid: string; did: string }) {
  const acc = useStore(); const p = acc.projects.find(x => x.id === pid)!; const d = p.drafts.find(x => x.id === did)!;
  const issues = draftIssues(p, did); const order = actionOrder(issues, p.tagWeights);
  const [sel, setSel] = useState<string | null>(order[0]?.id ?? null); const [giver, setGiver] = useState<string | null>(null);
  const i = order.find(x => x.id === sel) ?? order[0]; const idx = order.findIndex(x => x === i);
  const next = order.slice(idx + 1).find(x => status(x) !== "Planned") ?? order.find(x => status(x) !== "Planned");
  const onSaved = (kind: "boss" | "symptom") => { /* Task 17 replaces this with the cascade hook */ void kind; };
  if (!i) return <><Header title={`${p.name} · Draft ${d.number} · Campaign`} /><main class="mut">No issues yet. {!d.frozen && <button onClick={() => store.update(() => { const n = createIssue(p, did, prompt("Issue title?") ?? "Untitled"); setSel(n.id); })}>＋ issue</button>}</main></>;
  return <>
    <Header title={`${p.name} · Draft ${d.number} · Campaign`} right={<><button class="sm" onClick={() => go(`/p/${pid}/d/${did}`)}>← draft</button><Meters p={p} draftId={did} /></>} />
    <main>
      <Audience p={p} draftId={did} onPick={setGiver} />
      <div class="enc">
        <div class="rail"><div class="tag" style="margin-bottom:6px">ACTION ORDER — enforced</div>
          {order.map((x, n) => <div class={`it ${x.isRoot ? "" : "sym"} ${i.id === x.id ? "sel" : ""}`} onClick={() => setSel(x.id)}><span class="num">{n + 1}</span><span class="grow">{x.isRoot ? "★ " : ""}{x.title}</span><span class={`st ${status(x)}`}>{x.coveredBy ? "cov" : status(x)[0]}</span></div>)}
          {!d.frozen && <button class="sm" style="margin-top:8px" onClick={() => { const t = prompt("Issue title?"); if (t?.trim()) store.update(() => { const n = createIssue(p, did, t); setSel(n.id); }); }}>＋ issue</button>}</div>
        <div class="focus">
          <div class="tag">{i.isRoot ? COPY.encounter.boss : COPY.encounter.minion} · #{idx + 1} of {order.length}{i.isRoot && ` · ${COPY.encounter.minionsBehind(minions(issues, i.id).length)}`}</div>
          <h2>{i.title}</h2>
          <IssueEditor key={i.id} p={p} issue={i} onSaved={onSaved} frozen={d.frozen} />
          <div class="row" style="margin-top:14px"><span class="mut grow" style="font-size:13px">{next ? COPY.encounter.upNext(next.title) : COPY.encounter.nothingLeft}</span>
            {next ? <button onClick={() => setSel(next.id)}>{COPY.encounter.next}</button> : !d.frozen && <button class="pri" onClick={() => { store.update(() => endTurn(p, did)); go(`/p/${pid}/d/${did}/summary`); }}>{COPY.encounter.endTurn}</button>}</div>
        </div>
        <div class="ctx">
          {i.isRoot ? <div class="card"><b>Minions</b> ({minions(issues, i.id).length}){minions(issues, i.id).map(m => <div class={`minion ${m.coveredBy === i.id ? "covered" : ""}`} onClick={() => setSel(m.id)} style="cursor:pointer"><span class="grow">{m.title}</span><span class="lvl">Lv {severity(m, p.tagWeights)}</span><span class={`st ${status(m)}`}>{status(m)}</span></div>)}</div>
            : <div class="card"><b>Symptom of</b>{i.causedBy.map(c => { const b = issues.find(x => x.id === c)!; return <div class="minion" onClick={() => setSel(c)} style="cursor:pointer">★ {b.title} <span class={`st ${status(b)}`}>{status(b)}</span></div>; })}</div>}
        </div>
      </div>
    </main>
    {giver && <div id="giver-panel-slot" data-giver={giver} onClick={() => setGiver(null)} />}{/* Task 18 renders the panel here */}
  </>;
}
