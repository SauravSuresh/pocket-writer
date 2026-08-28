import { store, useStore } from "../store";
import { Header } from "../Header";
import { TAGS } from "../../domain/types";
import { download, downloadZip } from "../download";
import { backupCounts, backupFilename, obsidianFiles, parseBackup, serializeBackup } from "../../domain/exports";
import { toast } from "../toast";
export function Settings() {
  const acc = useStore();
  const restore = async (f: File) => { try { const next = parseBackup(await f.text()); const c = backupCounts(next); if (confirm(`Replace everything with this backup? ${c.projects} projects, ${c.issues} issues, ${c.items} feedback items. No merge, no undo.`)) { store.replace(next); toast("Restored."); } } catch (e) { alert(String(e)); } };
  return <><Header title="Settings" /><main style="max-width:760px">
    <div class="card"><label><input type="checkbox" style="width:auto" checked={acc.settings.sound} onChange={e => store.update(a => { a.settings.sound = (e.target as HTMLInputElement).checked; })} /> Sound</label>
      <button class="sm" onClick={() => store.update(a => { a.settings.tourDone = false; })}>Replay tour</button></div>
    <div class="card" style="margin-top:12px"><b>Backup</b><div class="mut" style="font-size:13px">Last backup: {acc.settings.lastBackupAt?.slice(0, 10) ?? "never"}. Browser storage can be wiped; this file is the real copy.</div>
      <div class="row" style="margin-top:8px"><button class="pri" onClick={() => { download(backupFilename(new Date()), serializeBackup(acc), "application/json"); store.update(a => { a.settings.lastBackupAt = new Date().toISOString(); }); toast("Backup downloaded."); }}>Download backup</button>
        <label class="sm" style="border:1px solid var(--line);border-radius:6px;padding:4px 10px;cursor:pointer">Restore… <input type="file" accept=".json" style="display:none" onChange={e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) void restore(f); }} /></label></div></div>
    {acc.projects.map(p => <div class="card" style="margin-top:12px"><b>{p.name}</b>
      <div class="row" style="margin-top:6px"><button class="sm" onClick={() => downloadZip(`${p.name}-obsidian.zip`, obsidianFiles(p))}>Export for Obsidian (.zip)</button></div>
      <div class="tag" style="margin-top:8px">Tag weights</div>
      <div class="row" style="flex-wrap:wrap">{TAGS.map(t => <label class="tag">{t} <input type="number" style="width:52px" value={p.tagWeights[t]} onChange={e => store.update(() => { p.tagWeights[t] = Number((e.target as HTMLInputElement).value) || 0; })} /></label>)}</div></div>)}
  </main></>;
}
