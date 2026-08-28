import { useState } from "preact/hooks";
import { store, useStore } from "../store";
import { go } from "../router";
import { Header } from "../Header";
import { Meters } from "../Meters";
import { COPY } from "../copy";
import { RevivePicker } from "../RevivePicker";
import { addGiver, createSession, endTurn, reopenDraft, startDraft } from "../../domain/account";
import { previousDraft } from "../../domain/revive";
export function DraftHome({ pid, did }: { pid: string; did: string }) {
  const acc = useStore(); const p = acc.projects.find(x => x.id === pid)!; const d = p.drafts.find(x => x.id === did)!;
  const sessions = p.sessions.filter(s => s.draftId === did);
  const [revive, setRevive] = useState(false);
  const newSession = () => {
    const date = prompt("Session date (YYYY-MM-DD)?", new Date().toISOString().slice(0, 10)); if (!date) return;
    store.update(() => { const s = createSession(p, did, date, p.givers.map(g => g.id)); go(`/p/${pid}/d/${did}/s/${s.id}`); });
  };
  return <>
    <Header title={`${p.name} · Draft ${d.number}${d.frozen ? " (frozen)" : ""}`} right={<Meters p={p} draftId={did} />} />
    <main>
      <div class="row" style="margin-bottom:12px;flex-wrap:wrap">
        <select onChange={e => go(`/p/${pid}/d/${(e.target as HTMLSelectElement).value}`)}>{p.drafts.map(x => <option value={x.id} selected={x.id === did}>Draft {x.number}{x.frozen ? " · frozen" : ""}</option>)}</select>
        <button onClick={() => go(`/p/${pid}/d/${did}/campaign`)}>⚔️ Campaign</button>
        <button onClick={() => go(`/p/${pid}/ideas`)}>💡 Ideas</button>
        {!d.frozen && previousDraft(p, did) && <button onClick={() => setRevive(true)}>⏮ Pull from previous draft</button>}
        <span class="grow" />
        {!d.frozen && <button class="pri" onClick={() => { store.update(() => endTurn(p, did)); go(`/p/${pid}/d/${did}/summary`); }}>{COPY.encounter.endTurn}</button>}
        {d.frozen && <button onClick={() => store.update(() => reopenDraft(p, did))}>{COPY.summary.reopen}</button>}
        {d.frozen && !p.drafts.some(x => !x.frozen) && <button class="pri" onClick={() => store.update(() => { const n = startDraft(p); go(`/p/${pid}/d/${n.id}`); })}>{COPY.summary.nextDraft}</button>}
      </div>
      <div class="card" style="margin-bottom:12px">
        <div class="row"><b class="grow">{COPY.draftHome.room}</b><button class="sm" onClick={() => { const n = prompt("Giver name?"); if (n?.trim()) store.update(() => addGiver(p, n)); }}>＋ giver</button></div>
        <div class="mut">{p.givers.map(g => g.name).join(", ") || "nobody yet"}</div>
      </div>
      <div class="card">
        <div class="row"><b class="grow">Feedback sessions</b>{!d.frozen && <button class="sm pri" disabled={p.givers.length === 0} onClick={newSession}>＋ session</button>}{!d.frozen && p.givers.length === 0 && <span class="tag">add someone to the room first</span>}</div>
        {sessions.map(s => { const items = p.items.filter(i => i.sessionId === s.id); const un = items.filter(i => !i.issueIds.length).length;
          return <div class="minion" style="cursor:pointer" onClick={() => go(`/p/${pid}/d/${did}/s/${s.id}`)}><span class="grow">{s.date} · {items.length} items</span>{un > 0 && <span class="badge">{un} {COPY.inbox.unaccounted}</span>}</div>; })}
        {!sessions.length && <div class="mut" style="margin-top:6px">{COPY.draftHome.noSessions}</div>}
      </div>
    </main>
    {revive && <RevivePicker p={p} draftId={did} onClose={() => setRevive(false)} />}
  </>;
}
