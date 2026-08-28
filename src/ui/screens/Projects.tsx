import { useStore, store } from "../store";
import { go } from "../router";
import { Header } from "../Header";
import { createProject, deleteProject, startDraft } from "../../domain/account";
export function Projects() {
  const acc = useStore();
  const create = () => { const name = prompt("Screenplay name?"); if (!name?.trim()) return; store.update(a => { const p = createProject(a, name); startDraft(p); go(`/p/${p.id}`); }); };
  return <>
    <Header />
    <main>
      <div class="row" style="margin-bottom:14px"><h2 style="margin:0" class="grow">Projects</h2><button class="pri" onClick={create}>＋ New screenplay</button></div>
      {acc.projects.map(p => <div class="card" style="margin-bottom:10px">
        <div class="row"><b class="grow" style="cursor:pointer" onClick={() => go(`/p/${p.id}`)}>{p.name}{p.isSample && <span class="pill" style="margin-left:8px">sample</span>}</b>
          <span class="mut">{p.drafts.length} draft{p.drafts.length === 1 ? "" : "s"} · {p.issues.length} issues</span>
          <button class="sm" onClick={() => { if (confirm(`Delete “${p.name}”? No undo.`)) store.update(a => deleteProject(a, p.id)); }}>delete</button></div>
      </div>)}
    </main>
  </>;
}
