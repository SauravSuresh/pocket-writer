import { useState } from "preact/hooks";
import { store, useStore } from "../store";
import { go } from "../router";
import { Header } from "../Header";
import { Meters } from "../Meters";
import { COPY } from "../copy";
import { ExtractDrawer } from "../ExtractDrawer";
import { addItem, linkItem, unlinkItem } from "../../domain/account";
import { draftIssues } from "../../domain/graph";
import { severity, status } from "../../domain/issue";
export function Session({ pid, did, sid }: { pid: string; did: string; sid: string }) {
  const acc = useStore(); const p = acc.projects.find(x => x.id === pid)!; const d = p.drafts.find(x => x.id === did)!; const s = p.sessions.find(x => x.id === sid)!;
  const [sel, setSel] = useState<string | null>(null); const [drawer, setDrawer] = useState<null | "free" | string>(null);
  const items = p.items.filter(i => i.sessionId === sid).slice().reverse();
  const selItem = items.find(i => i.id === sel); const issues = draftIssues(p, did).slice().sort((a, b) => severity(b, p.tagWeights) - severity(a, p.tagWeights));
  const un = items.filter(i => !i.issueIds.length).length;
  let giverSel: HTMLSelectElement | null = null, kindSel: HTMLSelectElement | null = null;
  const add = (text: string) => { if (!text.trim() || d.frozen) return; store.update(() => { const it = addItem(p, sid, giverSel!.value, kindSel!.value as any, text); setSel(it.id); }); };
  const chip = (id: string, itemId: string) => { const i = issues.find(x => x.id === id)!; return <span class={`issue-chip ${i.isRoot ? "root" : ""}`}>{i.isRoot ? "★ " : ""}{i.title} <a href="#" onClick={e => { e.preventDefault(); store.update(() => unlinkItem(p, itemId, id)); }} style="color:#999;text-decoration:none">×</a></span>; };
  return <>
    <Header title={`${p.name} · Draft ${d.number} · ${s.date}`} right={<><button class="sm" onClick={() => go(`/p/${pid}/d/${did}`)}>← draft</button><Meters p={p} draftId={did} /></>} />
    <main><div class="inbox">
      <div class="feed">
        <div class="add"><div class="row"><select ref={e => { giverSel = e; }} style="width:140px">{p.givers.map(g => <option value={g.id}>{g.name}</option>)}</select>
          <select ref={e => { kindSel = e; }} style="width:120px"><option value="reaction">reaction</option><option value="suggestion">suggestion</option></select>
          {un > 0 && <span class="badge">{un} {COPY.inbox.unaccounted}</span>}</div>
          <input style="margin-top:6px" placeholder="What did they say? Enter to add" disabled={d.frozen} onKeyDown={e => { if (e.key === "Enter") { add((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ""; } }} /></div>
        {items.map(it => <div class={`item ${sel === it.id ? "sel" : ""} ${it.issueIds.length ? "" : "un"}`} onClick={() => { setSel(it.id); setDrawer(null); }}>
          <div class="row"><b>{p.givers.find(g => g.id === it.giverId)?.name}</b> <span class={`pill ${it.kind === "suggestion" ? "s" : ""}`}>{it.kind}</span>{!it.issueIds.length && <span class="tag" style="margin-left:auto;color:var(--warn)">{COPY.inbox.unaccounted}</span>}</div>
          <div>{it.text}</div><div class="row" style="margin-top:4px;flex-wrap:wrap">{it.issueIds.map(id => chip(id, it.id))}</div></div>)}
      </div>
      <div class="panel">
        <div class="row" style="margin-bottom:12px"><button class="pri" style="font-size:15px;padding:8px 14px" disabled={d.frozen} onClick={() => setDrawer(selItem ? selItem.id : "free")}>{selItem ? COPY.inbox.newIssueFrom(p.givers.find(g => g.id === selItem.giverId)?.name ?? "them") : COPY.inbox.newIssue}</button>
          {selItem && <button disabled={d.frozen} onClick={() => setDrawer("free")}>{COPY.inbox.newFree}</button>}</div>
        {drawer && <ExtractDrawer p={p} draftId={did} item={drawer === "free" ? undefined : selItem} onClose={() => setDrawer(null)} />}
        {!selItem && <p class="mut">{COPY.inbox.selectHint}</p>}
        {selItem && <><div class="quote">{p.givers.find(g => g.id === selItem.giverId)?.name}: “{selItem.text}”</div>
          <h3 style="margin:8px 0 4px;font-size:14px">{COPY.inbox.link}</h3>
          <div class="list">{issues.map(i => <label><input type="checkbox" style="width:auto" checked={selItem.issueIds.includes(i.id)} onChange={e => store.update(() => (e.target as HTMLInputElement).checked ? linkItem(p, selItem.id, i.id) : unlinkItem(p, selItem.id, i.id))} /> {i.isRoot ? "★ " : ""}{i.title} <span class="tag">{i.tags.join(", ")} · sev {severity(i, p.tagWeights)} · {status(i)}</span></label>)}</div></>}
      </div>
    </div></main>
  </>;
}
