import { Project } from "../domain/types";
import { affinity } from "../domain/affinity";
import { status } from "../domain/issue";
import { rankName } from "./copy";
export function GiverPanel({ p, draftId, giverId, onClose }: { p: Project; draftId: string; giverId: string; onClose: () => void }) {
  const g = p.givers.find(x => x.id === giverId)!; const a = affinity(p, draftId, giverId);
  const nextAt = a.total === 0 ? 0 : a.rank >= 4 ? a.total : Math.min(a.total, Math.ceil(a.rank * a.total / 3));
  return <div class="gpanel" style="right:0">
    <div class="row"><h3 style="margin:0" class="grow">{g.name}</h3><button class="sm" onClick={onClose}>close</button></div>
    <div class="rank">{rankName(a.rank)}</div><div class="hearts">{"●".repeat(a.rank + 1)}{"○".repeat(4 - a.rank)}</div>
    <div class="mut" style="font-size:13px">{a.planned}/{a.total} of what {g.name} said is planned{a.total > 0 && a.rank < 4 && ` → next rank at ${nextAt}/${a.total}`}</div>
    {[...p.drafts].sort((x, y) => y.number - x.number).map(d => { const items = p.items.filter(it => it.draftId === d.id && it.giverId === giverId); if (!items.length) return null;
      return <><h4 style="margin:14px 0 4px;font-size:13px">Draft {d.number}</h4>{items.map(it => <div class="gitem"><span class="tag">{it.kind}</span> {it.text}<div>{it.issueIds.map(id => { const i = p.issues.find(x => x.id === id)!; return <span class="tag">→ {i.title} <span class={`st ${status(i)}`}>{status(i)}</span><br /></span>; })}{!it.issueIds.length && <span class="tag" style="color:var(--warn)">unaccounted</span>}</div></div>)}</>; })}
  </div>;
}
