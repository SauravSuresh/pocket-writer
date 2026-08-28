import { Project } from "../domain/types";
import { COPY, FACES, rankName } from "./copy";
export function BossDownCard({ p, bossId, fell, onClose }: { p: Project; bossId: string; fell: string[]; onClose: () => void }) {
  const boss = p.issues.find(i => i.id === bossId)!;
  return <div class="overlay" onClick={onClose}><div class="modal cleared"><div class="tag" style="color:#fbd">{COPY.bossDown.tag}</div><h2>{boss.title}</h2>
    <div>{fell.length ? COPY.bossDown.fell(fell.map(id => p.issues.find(i => i.id === id)!.title)) : COPY.bossDown.none}</div>
    <div style="margin-top:14px;opacity:.8;font-size:13px">{COPY.bossDown.cont}</div></div></div>;
}
export function RankUpCard({ p, giverId, rank, quote, onClose }: { p: Project; giverId: string; rank: number; quote: string; onClose: () => void }) {
  const g = p.givers.find(x => x.id === giverId)!;
  return <div class="overlay" onClick={onClose}><div class="modal rankcard"><div class="tag" style="color:#cfe">{FACES[rank]} {COPY.rankUp.tag}</div><h2>{COPY.rankUp.line(g.name, rankName(rank))}</h2>
    {quote && <div class="quote" style="color:#fff;background:rgba(255,255,255,.15);border-color:#fff">“{quote}”</div>}</div></div>;
}
