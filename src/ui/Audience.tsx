import { useRef } from "preact/hooks";
import { Project } from "../domain/types";
import { affinity } from "../domain/affinity";
import { FACES, mood, rankName } from "./copy";
export function Audience({ p, draftId, onPick }: { p: Project; draftId: string; onPick: (giverId: string) => void }) {
  const last = useRef<Record<string, number>>({});
  return <div class="audience">{p.givers.map(g => {
    const a = affinity(p, draftId, g.id); const bumped = last.current[g.id] !== undefined && last.current[g.id] < a.rank; last.current[g.id] = a.rank;
    return <div class={`aud ${bumped ? "bump" : ""}`} onClick={() => onPick(g.id)}>
      <div class="row"><span class="face">{FACES[a.rank]}</span><div><div class="nm">{g.name}</div><div class="rk">{rankName(a.rank)} · {a.planned}/{a.total}</div></div></div>
      <span class="bar"><i style={`width:${Math.round(100 * a.interest)}%`}></i></span>
      <div class="say">{mood(a.rank, g.name.length + a.planned)}</div>
    </div>; })}</div>;
}
