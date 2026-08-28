import { useEffect } from "preact/hooks";
import { store, useStore } from "./store";
import { useRoute, go } from "./router";
import { Projects } from "./screens/Projects";
export function App() {
  useStore(); const r = useRoute();
  useEffect(() => { void store.init(); }, []);
  if (!store.ready) return <main class="mut">Loading…</main>;
  if (r.name === "project") { const p = store.acc.projects.find(x => x.id === r.pid); const d = p?.drafts.find(x => !x.frozen) ?? p?.drafts.at(-1); if (p && d) go(`/p/${p.id}/d/${d.id}`); else go("/"); return null; }
  switch (r.name) {
    default: return <Projects />;
  }
}
