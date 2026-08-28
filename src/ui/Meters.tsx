import { Project } from "../domain/types";
import { meters } from "../domain/affinity";
const Bar = ({ a, b }: { a: number; b: number }) => <span class="bar"><i style={`width:${b ? 100 * a / b : 0}%`}></i></span>;
export function Meters({ p, draftId }: { p: Project; draftId: string }) {
  const m = meters(p, draftId);
  return <div class="meters">
    <span>Accounted <b>{m.accounted}/{m.items}</b><Bar a={m.accounted} b={m.items} /></span>
    <span>Assessed <b>{m.assessed}/{m.issues}</b><Bar a={m.assessed} b={m.issues} /></span>
    <span>Planned <b>{m.planned}/{m.issues}</b><Bar a={m.planned} b={m.issues} /></span>
    <span>Bosses <b>{m.bossesCleared}/{m.roots}</b><Bar a={m.bossesCleared} b={m.roots} /></span>
  </div>;
}
