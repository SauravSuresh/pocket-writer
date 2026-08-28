import { useStore } from "./store";
import { COPY } from "./copy";
import { go } from "./router";
export function Nag() {
  const acc = useStore(); const real = acc.projects.some(p => !p.isSample); if (!real) return null;
  const last = acc.settings.lastBackupAt ? Date.parse(acc.settings.lastBackupAt) : 0;
  if (Date.now() - last < 7 * 86400e3) return null;
  return <div class="nag">{COPY.nag}<button class="sm" onClick={() => go("/settings")}>Back it up</button></div>;
}
