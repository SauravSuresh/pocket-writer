import { useEffect, useState } from "preact/hooks";
import { store } from "./store";
import { go } from "./router";
const STEPS = (pid: string, did: string, sid: string) => [
  { path: `/p/${pid}/d/${did}/s/${sid}`, text: "This is a session — what the room said, one line each. Type something Meera might say and press Enter. It selects itself." },
  { path: `/p/${pid}/d/${did}/s/${sid}`, text: "Hit ＋ New issue. Answer the only question that matters: what in the screenplay makes her say this? Then: is it a symptom of something deeper?" },
  { path: `/p/${pid}/d/${did}/campaign`, text: "The campaign. Bosses on top, order enforced. The faces are the room. Pick “Rithu doesn't want anything”." },
  { path: `/p/${pid}/d/${did}/campaign`, text: "Write a plan and Swing at the boss. Each minion asks: did that also knock me out? Be honest." },
  { path: `/p/${pid}/d/${did}/campaign`, text: "BOSS DOWN. Watch Appu's face. That's the whole game." },
  { path: `/p/${pid}/d/${did}`, text: "When you've done the thinking — 🏁 End turn. You get the action plan and a grade. Then go write." },
];
export function Tour() {
  const acc = store.acc;
  const p = acc.projects.find(x => x.isSample);
  const d = p?.drafts[0];
  const s = p && p.sessions.find(x => x.draftId === d!.id);
  const [i, setI] = useState(0);
  const active = !!(p && d && s) && !acc.settings.tourDone;
  const path = active ? STEPS(p!.id, d!.id, s!.id)[i]?.path : undefined;
  useEffect(() => {
    if (!active || !path) return;
    if (location.hash !== "#" + path) go(path);
  }, [i, active, path]);
  if (!active) return null;
  const steps = STEPS(p!.id, d!.id, s!.id); const step = steps[i];
  const done = () => store.update(a => { a.settings.tourDone = true; });
  const next = () => {
    if (i + 1 >= steps.length) { done(); if (!acc.settings.seenHowItWorks) go("/how"); else go("/"); return; }
    setI(i + 1);
  };
  return <div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:14px 18px;border-radius:12px;max-width:560px;z-index:30;box-shadow:0 8px 30px rgba(0,0,0,.3)">
    <div class="tag" style="color:#bbb">Tour · {i + 1}/{steps.length}</div><div style="margin:6px 0 10px">{step.text}</div>
    <div class="row" style="justify-content:flex-end"><button class="sm" onClick={() => { done(); }}>Skip</button><button class="sm pri" onClick={next}>{i + 1 >= steps.length ? "Done" : "Next"}</button></div>
  </div>;
}
