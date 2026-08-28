import { useEffect } from "preact/hooks";
import { store, useStore } from "../store";
import { go } from "../router";
import { Header } from "../Header";
import { COPY, FACES, rankName } from "../copy";
import { download } from "../download";
import { actionPlanFilename, actionPlanMarkdown, backupFilename, serializeBackup } from "../../domain/exports";
import { reopenDraft, startDraft } from "../../domain/account";
import { chime } from "../sound";
import { toast } from "../toast";
export function Summary({ pid, did }: { pid: string; did: string }) {
  const acc = useStore(); const p = acc.projects.find(x => x.id === pid)!; const d = p.drafts.find(x => x.id === did)!; const s = d.summary;
  useEffect(() => { if (s) { chime("turn"); download(actionPlanFilename(p, d), actionPlanMarkdown(p, did), "text/markdown"); } }, []);
  if (!s) { go(`/p/${pid}/d/${did}`); return null; }
  const t = (id: string) => p.issues.find(i => i.id === id)?.title;
  return <><Header title={`${p.name} · Draft ${d.number}`} /><main style="max-width:760px">
    <div class="card cleared" style="text-align:left"><div class="tag" style="color:#fbd">{COPY.summary.title(d.number)}</div><h2 style="margin:4px 0">Grade {s.grade}</h2>
      <div>Planned {s.planned}/{s.total} · Bosses {s.bossesCleared}/{s.roots}{d.exportStale && " · export stale"}</div></div>
    <div class="card" style="margin-top:12px"><b>The room</b>{s.rankChanges.map(r => <div class="minion">{FACES[r.to]} {p.givers.find(g => g.id === r.giverId)?.name}: {rankName(r.from)} → {rankName(r.to)}</div>)}
      {s.walkedOut.length > 0 && <div class="missing" style="margin-top:6px">Walked out (something they said went unaccounted): {s.walkedOut.map(id => p.givers.find(g => g.id === id)?.name).join(", ")}</div>}</div>
    {s.skipped.length > 0 && <div class="card" style="margin-top:12px"><b>Still skipped at end turn</b>{s.skipped.map(id => <div class="minion">{t(id)}</div>)}</div>}
    {s.unplanned.length > 0 && <div class="card" style="margin-top:12px"><b>Unplanned</b>{s.unplanned.map(id => <div class="minion">{t(id)}</div>)}</div>}
    <div class="row" style="margin-top:16px;flex-wrap:wrap">
      <button onClick={() => download(actionPlanFilename(p, d), actionPlanMarkdown(p, did), "text/markdown")}>Download action plan</button>
      <button class="pri" onClick={() => { download(backupFilename(new Date()), serializeBackup(acc), "application/json"); store.update(a => { a.settings.lastBackupAt = new Date().toISOString(); }); toast("Backup downloaded."); }}>{COPY.summary.backup}</button>
      <span class="grow" />
      <button onClick={() => { store.update(() => reopenDraft(p, did)); go(`/p/${pid}/d/${did}`); }}>{COPY.summary.reopen}</button>
      <button class="pri" onClick={() => store.update(() => { const n = startDraft(p); go(`/p/${pid}/d/${n.id}`); })}>{COPY.summary.nextDraft}</button>
    </div>
  </main></>;
}
