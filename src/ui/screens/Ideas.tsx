import { store, useStore } from "../store";
import { Header } from "../Header";
import { go } from "../router";
import { addIdea } from "../../domain/account";
export function Ideas({ pid }: { pid: string }) {
  const acc = useStore(); const p = acc.projects.find(x => x.id === pid)!;
  return <><Header title={`${p.name} · Ideas`} right={<button class="sm" onClick={() => go(`/p/${pid}`)}>← draft</button>} /><main style="max-width:760px">
    <input placeholder="Loose thought. Enter to keep it." onKeyDown={e => { if (e.key === "Enter") { const v = (e.target as HTMLInputElement).value; if (v.trim()) store.update(() => addIdea(p, v)); (e.target as HTMLInputElement).value = ""; } }} />
    {p.ideas.slice().reverse().map(i => <div class="idea" style={`margin-top:8px;${i.usedInDraft ? "opacity:.5" : ""}`}>{i.text}
      <div class="tag">{i.issueIds.map(id => p.issues.find(x => x.id === id)?.title).filter(Boolean).join(" · ") || "unlinked"}{i.usedInDraft && ` · used in Draft ${i.usedInDraft}`}</div></div>)}
  </main></>;
}
